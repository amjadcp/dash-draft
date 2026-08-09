import React, { useRef, useState } from 'react';
import { useWorkspace } from '../state/workspace-context';
import { OnboardingChecklist } from '../components/dashboard/onboarding-checklist';
import { FolderReconciliationModal } from '../components/dashboard/folder-reconciliation-modal';
import { SchemaPreviewModal } from '../components/ingest/schema-preview-modal';
import { ExcelSheetModal } from '../components/ingest/excel-sheet-modal';
import { AppendRowsModal } from '../components/tables/append-rows-modal';
import { ColumnPrivacyMenu } from '../components/tables/column-privacy-menu';
import { RelationshipBuilder } from '../components/tables/relationship-builder';
import { QueryLogViewer } from '../features/query-log/log-viewer';
import { FolderGit2, Upload, Plus, Edit2, Layers, Table2, Check } from 'lucide-react';
import type { TableMeta } from '@repo/mcp-contracts';

export function DashboardRoute(): React.ReactElement {
  const ws = useWorkspace();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editingTableId, setEditingTableId] = useState<string | null>(null);
  const [editingTableName, setEditingTableName] = useState<string>('');
  const [editingColId, setEditingColId] = useState<string | null>(null);
  const [editingColName, setEditingColName] = useState<string>('');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (file) {
      await ws.handleFileUpload(file);
    }
    if (e.target) e.target.value = '';
  };

  const startRenameTable = (table: TableMeta): void => {
    setEditingTableId(table.id);
    setEditingTableName(table.name);
  };

  const submitRenameTable = (tableId: string): void => {
    if (editingTableName.trim()) {
      ws.handleRenameTable(tableId, editingTableName.trim());
    }
    setEditingTableId(null);
  };

  const startRenameColumn = (colName: string): void => {
    setEditingColId(colName);
    setEditingColName(colName);
  };

  const submitRenameColumn = (tableId: string, oldCol: string): void => {
    if (editingColName.trim() && editingColName.trim() !== oldCol) {
      ws.handleRenameColumn(tableId, oldCol, editingColName.trim());
    }
    setEditingColId(null);
  };

  return (
    <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept=".csv,.tsv,.xlsx,.xls"
        style={{ display: 'none' }}
      />

      {/* Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--space-6)',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 'var(--text-3xl)',
              fontWeight: 'var(--weight-bold)',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-1)',
            }}
          >
            Tables Workspace
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
            Client-side in-memory SQLite database exposed as MCP tools.
          </p>
        </div>

        {/* Primary Actions */}
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          {ws.reconnectFolderHandle ? (
            <button type="button" className="btn btn-accent" onClick={ws.reconnectFolder}>
              <FolderGit2 size={16} /> Re-connect "{ws.folderName}"
            </button>
          ) : (
            <button type="button" className="btn btn-outline" onClick={ws.selectFolder}>
              <FolderGit2 size={16} />
              {ws.folderName ? `Folder: ${ws.folderName}` : 'Choose Local Folder'}
            </button>
          )}

          <button
            type="button"
            className="btn btn-accent"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={16} /> Upload CSV / Excel File
          </button>
        </div>
      </header>

      {/* Onboarding Checklist (FR-4) */}
      <OnboardingChecklist
        dirHandle={ws.dirHandle}
        config={ws.config}
        mcpHandshakeConfirmed={ws.mcpHandshakeConfirmed}
        tableCount={ws.tables.length}
        queryLogCount={ws.queryLogs.length}
        onOpenFolderPicker={ws.selectFolder}
        onNavigateToSettings={() => {
          const url = new URL(window.location.href);
          url.searchParams.set('tab', 'settings');
          window.history.pushState({}, '', url.toString());
        }}
      />

      {/* Tables List */}
      <section style={{ marginBottom: 'var(--space-8)' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'var(--space-4)',
          }}
        >
          <h2
            style={{
              fontSize: 'var(--text-xl)',
              fontWeight: 'var(--weight-bold)',
              color: 'var(--color-text-primary)',
            }}
          >
            SQL Tables ({ws.tables.length})
          </h2>
        </div>

        {ws.tables.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {ws.tables.map((table) => (
              <div key={table.id} className="card" style={{ padding: 'var(--space-6)' }}>
                {/* Table Title & Rename Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 'var(--space-4)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <div className="icon-badge" style={{ width: '36px', height: '36px' }}>
                      <Table2 size={18} />
                    </div>

                    {editingTableId === table.id ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <input
                          type="text"
                          value={editingTableName}
                          onChange={(e) => setEditingTableName(e.target.value)}
                          style={{
                            fontSize: 'var(--text-lg)',
                            fontWeight: 'var(--weight-bold)',
                            padding: 'var(--space-1) var(--space-2)',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--color-border)',
                          }}
                        />
                        <button
                          type="button"
                          className="btn btn-solid"
                          onClick={() => submitRenameTable(table.id)}
                          style={{ padding: 'var(--space-1) var(--space-2)' }}
                        >
                          <Check size={14} />
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <h3
                          className="card-title"
                          style={{ fontSize: 'var(--text-lg)', margin: 0 }}
                        >
                          {table.name}
                        </h3>
                        <button
                          type="button"
                          onClick={() => startRenameTable(table)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--color-text-tertiary)',
                          }}
                          title="Rename table (FR-6)"
                        >
                          <Edit2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>

                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
                    {table.rowCount} rows &bull; {table.columns.length} columns
                  </span>
                </div>

                {/* Column Table List */}
                <div
                  style={{
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden',
                  }}
                >
                  <table
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      fontSize: 'var(--text-xs)',
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          background: 'var(--color-bg-subtle)',
                          borderBottom: '1px solid var(--color-border)',
                          textAlign: 'left',
                        }}
                      >
                        <th style={{ padding: 'var(--space-2) var(--space-3)' }}>
                          Column Name (FR-6)
                        </th>
                        <th style={{ padding: 'var(--space-2) var(--space-3)' }}>SQL Type</th>
                        <th style={{ padding: 'var(--space-2) var(--space-3)' }}>
                          Privacy Policy (FR-10)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {table.columns.map((col) => (
                        <tr
                          key={col.name}
                          style={{ borderBottom: '1px solid var(--color-border)' }}
                        >
                          <td
                            style={{
                              padding: 'var(--space-2) var(--space-3)',
                              fontWeight: 'var(--weight-medium)',
                            }}
                          >
                            {editingColId === `${table.id}_${col.name}` ? (
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 'var(--space-2)',
                                }}
                              >
                                <input
                                  type="text"
                                  value={editingColName}
                                  onChange={(e) => setEditingColName(e.target.value)}
                                  style={{
                                    padding: '2px var(--space-2)',
                                    fontSize: 'var(--text-xs)',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid var(--color-border)',
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => submitRenameColumn(table.id, col.name)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'var(--color-success)',
                                  }}
                                >
                                  <Check size={14} />
                                </button>
                              </div>
                            ) : (
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 'var(--space-2)',
                                }}
                              >
                                <code>{col.name}</code>
                                <button
                                  type="button"
                                  onClick={() => startRenameColumn(`${table.id}_${col.name}`)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'var(--color-text-tertiary)',
                                  }}
                                  title="Rename column"
                                >
                                  <Edit2 size={12} />
                                </button>
                              </div>
                            )}
                          </td>
                          <td
                            style={{
                              padding: 'var(--space-2) var(--space-3)',
                              color: 'var(--color-text-secondary)',
                              fontFamily: 'var(--font-mono)',
                            }}
                          >
                            {col.type}
                          </td>
                          <td style={{ padding: 'var(--space-2) var(--space-3)' }}>
                            <ColumnPrivacyMenu
                              columnName={col.name}
                              currentPolicy={col.privacyPolicy}
                              onPolicyChange={(colName, policy) =>
                                ws.handleColumnPrivacyChange(table.id, colName, policy)
                              }
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card" style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
            <div
              className="icon-badge"
              style={{ margin: '0 auto var(--space-4)', width: '56px', height: '56px' }}
            >
              <Table2 size={24} />
            </div>
            <h3 className="card-title" style={{ fontSize: 'var(--text-lg)' }}>
              No SQL tables created yet
            </h3>
            <p
              className="card-subtitle"
              style={{ maxWidth: '440px', margin: '0 auto var(--space-6)' }}
            >
              Click "Upload CSV / Excel File" to convert a spreadsheet into an in-memory SQL table.
            </p>
            <button
              type="button"
              className="btn btn-solid"
              onClick={() => fileInputRef.current?.click()}
            >
              <Plus size={16} /> Upload First File
            </button>
          </div>
        )}
      </section>

      {/* Relationship Builder (FR-9) */}
      <RelationshipBuilder
        allTables={ws.tables}
        relationships={ws.relationships}
        onSaveRelationships={ws.handleSaveRelationships}
      />

      {/* Query Log Viewer (FR-12) */}
      <QueryLogViewer logs={ws.queryLogs} onDeleteSelected={ws.handleDeleteQueryLogs} />

      {/* Active Modals */}
      {ws.reconciliationConfig && (
        <FolderReconciliationModal
          existingConfig={ws.reconciliationConfig}
          currentUserId={ws.userId}
          onAdoptProfile={ws.adoptReconciliationConfig}
          onCancel={ws.cancelReconciliation}
        />
      )}

      {ws.pendingExcelSheets && (
        <ExcelSheetModal
          fileName={ws.pendingExcelSheets.fileName}
          sheets={ws.pendingExcelSheets.sheets}
          onSelectSheets={ws.handleExcelSheetSelect}
          onCancel={ws.cancelPendingIngest}
        />
      )}

      {ws.pendingParsedData && (
        <SchemaPreviewModal
          parsedData={ws.pendingParsedData}
          onCommit={ws.commitTableCreation}
          onCancel={ws.cancelPendingIngest}
        />
      )}

      {ws.pendingAppendTable && (
        <AppendRowsModal
          targetTable={ws.pendingAppendTable.targetTable}
          parsedData={ws.pendingAppendTable.parsedData}
          onCommitAppend={ws.commitAppendRows}
          onCancel={ws.cancelPendingIngest}
        />
      )}
    </div>
  );
}
