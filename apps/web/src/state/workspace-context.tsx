import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Database } from 'sql.js';
import type {
  Config,
  TableMeta,
  RelationshipMeta,
  QueryLogEntry,
  ColumnPrivacyPolicy,
} from '@repo/mcp-contracts';
import { getOrCreateUserId, setStoredUserId } from '../lib/user-id';
import { requestDirectoryHandle, isFileSystemAccessSupported } from '../lib/fs-access';
import { readFolderConfig, saveFolderConfig, createDefaultConfig } from '../lib/config-manager';
import {
  parseCsvFile,
  parseExcelWorkbook,
  processExcelSheet,
  type IngestFileParsedData,
  type ExcelWorkbookSheetInfo,
  type InferredColumn,
  type InferredColumnType,
} from '../lib/ingest/parser';
import { createMemoryDatabase, createTableFromParsedData } from '../lib/sql/db-client';
import {
  executeRenameTable,
  executeRenameColumn,
  cascadeRenameTableInMetadata,
  cascadeRenameColumnInMetadata,
} from '../lib/sql/alter-table';
import type { ColumnPrivacyConfig } from '../lib/query/privacy';
import { readQueryLogs, deleteQueryLogEntries } from '../lib/query/log-store';
import { executeValidatedQuery } from '../lib/query/executor';
import { RelayWebSocketClient } from '../lib/ws-client';
import { getEnv } from '../env';

import {
  saveDirectoryHandleToIdb,
  getDirectoryHandleFromIdb,
  verifyHandlePermission,
} from '../lib/idb-handle-store';

export interface WorkspaceContextType {
  userId: string;
  dirHandle: FileSystemDirectoryHandle | null;
  folderName: string | null;
  reconnectFolderHandle: FileSystemDirectoryHandle | null;
  config: Config | null;
  tables: TableMeta[];
  queryLogs: QueryLogEntry[];
  relationships: RelationshipMeta[];
  privacyConfigs: ColumnPrivacyConfig[];
  mcpHandshakeConfirmed: boolean;
  wsConnected: boolean;
  isFsSupported: boolean;
  db: Database | null;
  reconciliationConfig: Config | null;
  pendingParsedData: IngestFileParsedData | null;
  pendingExcelSheets: { fileName: string; sheets: ExcelWorkbookSheetInfo[] } | null;
  pendingAppendTable: { targetTable: TableMeta; parsedData: IngestFileParsedData } | null;
  selectFolder: () => Promise<void>;
  reconnectFolder: () => Promise<void>;
  adoptReconciliationConfig: (cfg: Config) => Promise<void>;
  cancelReconciliation: () => void;
  handleFileUpload: (file: File) => Promise<void>;
  handleExcelSheetSelect: (selectedSheets: ExcelWorkbookSheetInfo[]) => void;
  commitTableCreation: (tableName: string, columns: InferredColumn[]) => Promise<void>;
  commitAppendRows: (addNewColumns: boolean) => Promise<void>;
  handleRenameTable: (tableId: string, newName: string) => Promise<void>;
  handleRenameColumn: (tableId: string, oldCol: string, newCol: string) => Promise<void>;
  handleColumnPrivacyChange: (
    tableId: string,
    colName: string,
    policy: ColumnPrivacyPolicy
  ) => void;
  handleSaveRelationships: (rels: RelationshipMeta[]) => Promise<void>;
  handleRegenerateOAuthCredentials: (newClientId: string, newClientSecret: string) => Promise<void>;
  handleDeleteQueryLogs: (ids: string[]) => Promise<void>;
  cancelPendingIngest: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [userId, setUserId] = useState<string>(() => getOrCreateUserId());
  const [dirHandle, setDirHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [folderName, setFolderName] = useState<string | null>(null);
  const [reconnectFolderHandle, setReconnectFolderHandle] =
    useState<FileSystemDirectoryHandle | null>(null);
  const [config, setConfig] = useState<Config | null>(null);
  const [tables, setTables] = useState<TableMeta[]>([]);
  const [queryLogs, setQueryLogs] = useState<QueryLogEntry[]>([]);
  const [relationships, setRelationships] = useState<RelationshipMeta[]>([]);
  const [privacyConfigs, setPrivacyConfigs] = useState<ColumnPrivacyConfig[]>([]);
  const [mcpHandshakeConfirmed, setMcpHandshakeConfirmed] = useState<boolean>(false);
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [db, setDb] = useState<Database | null>(null);

  // Modals state
  const [reconciliationConfig, setReconciliationConfig] = useState<Config | null>(null);
  const [pendingParsedData, setPendingParsedData] = useState<IngestFileParsedData | null>(null);
  const [pendingExcelSheets, setPendingExcelSheets] = useState<{
    fileName: string;
    sheets: ExcelWorkbookSheetInfo[];
  } | null>(null);
  const [pendingAppendTable, setPendingAppendTable] = useState<{
    targetTable: TableMeta;
    parsedData: IngestFileParsedData;
  } | null>(null);

  const isFsSupported = isFileSystemAccessSupported();

  // Restore saved folder handle from IndexedDB on page load / refresh
  useEffect(() => {
    let isMounted = true;
    getDirectoryHandleFromIdb().then(async (savedHandle) => {
      if (!isMounted || !savedHandle) return;

      try {
        const queryPerm = await savedHandle.queryPermission({ mode: 'readwrite' });
        if (queryPerm === 'granted') {
          setDirHandle(savedHandle);
          setFolderName(savedHandle.name);

          const existingConfig = await readFolderConfig(savedHandle);
          if (existingConfig) {
            setConfig(existingConfig);
            setMcpHandshakeConfirmed(existingConfig.preferences.mcpHandshakeConfirmed);
          }

          const logs = await readQueryLogs(savedHandle);
          setQueryLogs(logs);
        } else {
          // Requires user gesture permission re-grant on refresh
          setReconnectFolderHandle(savedHandle);
          setFolderName(savedHandle.name);
        }
      } catch (err) {
        console.warn('Error restoring directory handle from IDB:', err);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [userId]);

  const reconnectFolder = async (): Promise<void> => {
    if (!reconnectFolderHandle) return;
    const granted = await verifyHandlePermission(reconnectFolderHandle, true);
    if (granted) {
      setDirHandle(reconnectFolderHandle);
      setFolderName(reconnectFolderHandle.name);
      setReconnectFolderHandle(null);

      const existingConfig = await readFolderConfig(reconnectFolderHandle);
      if (existingConfig) {
        setConfig(existingConfig);
        setMcpHandshakeConfirmed(existingConfig.preferences.mcpHandshakeConfirmed);
      }

      const logs = await readQueryLogs(reconnectFolderHandle);
      setQueryLogs(logs);
      await saveDirectoryHandleToIdb(reconnectFolderHandle);
    } else {
      selectFolder();
    }
  };

  // Initialize in-memory SQLite database
  useEffect(() => {
    let isMounted = true;
    createMemoryDatabase().then((database) => {
      if (isMounted) setDb(database);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Initialize default config if no folder chosen yet
  useEffect(() => {
    if (!config && !dirHandle) {
      setConfig(createDefaultConfig(userId));
    }
  }, [userId, config, dirHandle]);

  // Connect Relay WebSocket Client
  useEffect(() => {
    if (!userId) return;
    const env = getEnv();
    const sessionId = `sess_${userId.substring(0, 16)}`;

    const wsClient = new RelayWebSocketClient({
      wsUrl: `${env.VITE_RELAY_WS_URL}`,
      sessionId,
      customerId: userId,
      getDb: () => db,
      getTableMetas: () => tables,
      getPrivacyConfigs: () => privacyConfigs,
      onStatusChange: (connected, handshake) => {
        setWsConnected(connected);
        if (handshake) setMcpHandshakeConfirmed(true);
      },
      onFirstHandshakeConfirmed: () => {
        setMcpHandshakeConfirmed(true);
      },
    });

    wsClient.connect();
    return () => wsClient.disconnect();
  }, [userId, db, tables, privacyConfigs]);

  // Select Folder Handler
  const selectFolder = async (): Promise<void> => {
    try {
      const handle = await requestDirectoryHandle();
      if (!handle) return;

      setDirHandle(handle);
      setFolderName(handle.name);
      setReconnectFolderHandle(null);
      await saveDirectoryHandleToIdb(handle);

      const existingConfig = await readFolderConfig(handle);
      if (existingConfig) {
        if (existingConfig.customerId !== userId) {
          // FR-17: Existing profile detected with different customerId
          setReconciliationConfig(existingConfig);
          return;
        }
        setConfig(existingConfig);
        setMcpHandshakeConfirmed(existingConfig.preferences.mcpHandshakeConfirmed);
      } else {
        // Initialize new folder config
        const newCfg = createDefaultConfig(userId);
        await saveFolderConfig(handle, newCfg);
        setConfig(newCfg);
      }

      // Read existing query logs
      const logs = await readQueryLogs(handle);
      setQueryLogs(logs);
    } catch (err) {
      console.error('Error selecting folder:', err);
    }
  };

  const adoptReconciliationConfig = async (cfg: Config): Promise<void> => {
    setConfig(cfg);
    setUserId(cfg.customerId);
    setStoredUserId(cfg.customerId);
    setMcpHandshakeConfirmed(cfg.preferences.mcpHandshakeConfirmed);
    setReconciliationConfig(null);

    if (dirHandle) {
      const logs = await readQueryLogs(dirHandle);
      setQueryLogs(logs);
    }
  };

  const cancelReconciliation = (): void => {
    setReconciliationConfig(null);
    setDirHandle(null);
    setFolderName(null);
  };

  // File Upload Handlers (FR-5, FR-8)
  const handleFileUpload = async (file: File): Promise<void> => {
    const nameLower = file.name.toLowerCase();

    if (nameLower.endsWith('.xlsx') || nameLower.endsWith('.xls')) {
      const { fileName, sheets } = await parseExcelWorkbook(file);
      if (sheets.length === 1 && sheets[0]) {
        const parsed = processExcelSheet(fileName, sheets[0].sheetName, sheets[0].rows);
        setPendingParsedData(parsed);
      } else {
        setPendingExcelSheets({ fileName, sheets });
      }
    } else {
      const parsed = await parseCsvFile(file);
      setPendingParsedData(parsed);
    }
  };

  const handleExcelSheetSelect = (selectedSheets: ExcelWorkbookSheetInfo[]): void => {
    if (!pendingExcelSheets || selectedSheets.length === 0) return;
    const firstSheet = selectedSheets[0];
    if (firstSheet) {
      const parsed = processExcelSheet(
        pendingExcelSheets.fileName,
        firstSheet.sheetName,
        firstSheet.rows
      );
      setPendingParsedData(parsed);
    }
    setPendingExcelSheets(null);
  };

  const commitTableCreation = async (
    tableName: string,
    columns: InferredColumn[]
  ): Promise<void> => {
    let activeDb = db;
    if (!activeDb) {
      try {
        activeDb = await createMemoryDatabase();
        setDb(activeDb);
      } catch (err) {
        console.error('Failed to initialize SQLite database:', err);
      }
    }

    if (!activeDb || !pendingParsedData) return;

    try {
      createTableFromParsedData(activeDb, tableName, columns, pendingParsedData.allCleanedRows);

      const now = new Date().toISOString();
      const newTableMeta: TableMeta = {
        id: tableName,
        workspaceId: 'default',
        name: tableName,
        rowCount: pendingParsedData.allCleanedRows.length,
        columns: columns.map((c) => ({
          name: c.name,
          type: c.selectedType,
          privacyPolicy: 'visible',
        })),
        createdAt: now,
        updatedAt: now,
      };

      setTables((prev) => [...prev.filter((t) => t.id !== tableName), newTableMeta]);
      setPendingParsedData(null);
    } catch (err) {
      console.error('Failed to create SQL table from parsed data:', err);
    }
  };

  const commitAppendRows = async (addNewColumns: boolean): Promise<void> => {
    if (!db || !pendingAppendTable) return;

    const { targetTable, parsedData } = pendingAppendTable;

    const finalColumns: InferredColumn[] = targetTable.columns.map((c) => ({
      name: c.name,
      inferredType: c.type as unknown as InferredColumnType,
      selectedType: c.type as unknown as InferredColumnType,
    }));

    if (addNewColumns) {
      for (const col of parsedData.columns) {
        if (!targetTable.columns.some((c) => c.name.toLowerCase() === col.name.toLowerCase())) {
          finalColumns.push(col);
          db.run(
            `ALTER TABLE "${targetTable.name.replace(/"/g, '""')}" ADD COLUMN "${col.name.replace(/"/g, '""')}" TEXT;`
          );
        }
      }
    }

    createTableFromParsedData(db, targetTable.name, finalColumns, parsedData.allCleanedRows);

    setTables((prev) =>
      prev.map((t) =>
        t.id === targetTable.id
          ? {
              ...t,
              rowCount: t.rowCount + parsedData.allCleanedRows.length,
              columns: finalColumns.map((c) => ({
                name: c.name,
                type: c.selectedType,
                privacyPolicy: 'visible',
              })),
              updatedAt: new Date().toISOString(),
            }
          : t
      )
    );

    setPendingAppendTable(null);
  };

  // Rename Handlers (FR-6)
  const handleRenameTable = async (tableId: string, newName: string): Promise<void> => {
    if (!db) return;

    const table = tables.find((t) => t.id === tableId);
    if (!table || table.name === newName) return;

    executeRenameTable(db, table.name, newName);

    const { updatedTableMeta, updatedRelationships } = cascadeRenameTableInMetadata(
      table,
      relationships,
      newName
    );
    setTables((prev) => prev.map((t) => (t.id === tableId ? updatedTableMeta : t)));
    setRelationships(updatedRelationships);
  };

  const handleRenameColumn = async (
    tableId: string,
    oldCol: string,
    newCol: string
  ): Promise<void> => {
    if (!db) return;

    const table = tables.find((t) => t.id === tableId);
    if (!table || oldCol === newCol) return;

    executeRenameColumn(db, table.name, oldCol, newCol);

    const { updatedTableMeta, updatedPrivacyConfigs, updatedRelationships } =
      cascadeRenameColumnInMetadata(table, privacyConfigs, relationships, oldCol, newCol);

    setTables((prev) => prev.map((t) => (t.id === tableId ? updatedTableMeta : t)));
    setPrivacyConfigs(updatedPrivacyConfigs);
    setRelationships(updatedRelationships);
  };

  // Column Privacy Handler (FR-10)
  const handleColumnPrivacyChange = (
    tableId: string,
    colName: string,
    policy: ColumnPrivacyPolicy
  ): void => {
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? {
              ...t,
              columns: t.columns.map((c) =>
                c.name === colName ? { ...c, privacyPolicy: policy } : c
              ),
            }
          : t
      )
    );

    setPrivacyConfigs((prev) => [
      ...prev.filter((p) => p.columnName !== colName),
      { columnName: colName, policy },
    ]);
  };

  // Relationship Handler (FR-9)
  const handleSaveRelationships = async (newRels: RelationshipMeta[]): Promise<void> => {
    setRelationships(newRels);
    if (dirHandle && config) {
      await saveFolderConfig(dirHandle, config);
    }
  };

  // OAuth Credentials Regeneration (FR-14)
  const handleRegenerateOAuthCredentials = async (
    newClientId: string,
    newClientSecret: string
  ): Promise<void> => {
    const updatedConfig: Config = {
      ...config!,
      oauth: {
        clientId: newClientId,
        clientSecret: newClientSecret,
        generatedAt: new Date().toISOString(),
      },
      preferences: {
        ...config?.preferences,
        theme: config?.preferences?.theme || 'system',
        mcpHandshakeConfirmed: false,
      },
    };

    setConfig(updatedConfig);
    setMcpHandshakeConfirmed(false);

    if (dirHandle) {
      await saveFolderConfig(dirHandle, updatedConfig);
    }
  };

  // Query Logs Delete Handler (FR-12)
  const handleDeleteQueryLogs = async (ids: string[]): Promise<void> => {
    const updated = await deleteQueryLogEntries(dirHandle, queryLogs, ids);
    setQueryLogs(updated);
  };

  const cancelPendingIngest = (): void => {
    setPendingParsedData(null);
    setPendingExcelSheets(null);
    setPendingAppendTable(null);
  };

  return (
    <WorkspaceContext.Provider
      value={{
        userId,
        dirHandle,
        folderName,
        reconnectFolderHandle,
        config,
        tables,
        queryLogs,
        relationships,
        privacyConfigs,
        mcpHandshakeConfirmed,
        wsConnected,
        isFsSupported,
        db,
        reconciliationConfig,
        pendingParsedData,
        pendingExcelSheets,
        pendingAppendTable,
        selectFolder,
        reconnectFolder,
        adoptReconciliationConfig,
        cancelReconciliation,
        handleFileUpload,
        handleExcelSheetSelect,
        commitTableCreation,
        commitAppendRows,
        handleRenameTable,
        handleRenameColumn,
        handleColumnPrivacyChange,
        handleSaveRelationships,
        handleRegenerateOAuthCredentials,
        handleDeleteQueryLogs,
        cancelPendingIngest,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace(): WorkspaceContextType {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
