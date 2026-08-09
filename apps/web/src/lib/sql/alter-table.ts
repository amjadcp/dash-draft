import type { Database } from 'sql.js';
import type { TableMeta, RelationshipMeta } from '@repo/mcp-contracts';
import type { ColumnPrivacyConfig } from '../query/privacy';

export function executeRenameTable(db: Database, oldTableName: string, newTableName: string): void {
  const sql = `ALTER TABLE "${oldTableName.replace(/"/g, '""')}" RENAME TO "${newTableName.replace(/"/g, '""')}";`;
  db.run(sql);
}

export function executeRenameColumn(
  db: Database,
  tableName: string,
  oldColumnName: string,
  newColumnName: string
): void {
  const sql = `ALTER TABLE "${tableName.replace(/"/g, '""')}" RENAME COLUMN "${oldColumnName.replace(/"/g, '""')}" TO "${newColumnName.replace(/"/g, '""')}";`;
  db.run(sql);
}

export function cascadeRenameTableInMetadata(
  tableMeta: TableMeta,
  relationships: RelationshipMeta[],
  newTableName: string
): { updatedTableMeta: TableMeta; updatedRelationships: RelationshipMeta[] } {
  const updatedTableMeta: TableMeta = {
    ...tableMeta,
    name: newTableName,
    updatedAt: new Date().toISOString(),
  };

  const updatedRelationships = relationships.map((rel) => {
    let sourceTableId = rel.sourceTableId;
    let targetTableId = rel.targetTableId;

    if (rel.sourceTableId === tableMeta.id) sourceTableId = newTableName;
    if (rel.targetTableId === tableMeta.id) targetTableId = newTableName;

    return { ...rel, sourceTableId, targetTableId };
  });

  return { updatedTableMeta, updatedRelationships };
}

export function cascadeRenameColumnInMetadata(
  tableMeta: TableMeta,
  privacyConfigs: ColumnPrivacyConfig[],
  relationships: RelationshipMeta[],
  oldColName: string,
  newColName: string
): {
  updatedTableMeta: TableMeta;
  updatedPrivacyConfigs: ColumnPrivacyConfig[];
  updatedRelationships: RelationshipMeta[];
} {
  const updatedColumns = tableMeta.columns.map((col) =>
    col.name === oldColName ? { ...col, name: newColName } : col
  );

  const updatedTableMeta: TableMeta = {
    ...tableMeta,
    columns: updatedColumns,
    updatedAt: new Date().toISOString(),
  };

  const updatedPrivacyConfigs = privacyConfigs.map((p) =>
    p.columnName === oldColName ? { ...p, columnName: newColName } : p
  );

  const updatedRelationships = relationships.map((rel) => {
    let sourceColumn = rel.sourceColumn;
    let targetColumn = rel.targetColumn;

    if (rel.sourceTableId === tableMeta.id && rel.sourceColumn === oldColName) {
      sourceColumn = newColName;
    }
    if (rel.targetTableId === tableMeta.id && rel.targetColumn === oldColName) {
      targetColumn = newColName;
    }

    return { ...rel, sourceColumn, targetColumn };
  });

  return { updatedTableMeta, updatedPrivacyConfigs, updatedRelationships };
}
