import initSqlJs, { type Database, type SqlJsStatic } from 'sql.js';
import type { InferredColumn } from '../ingest/parser';

let sqlStaticPromise: Promise<SqlJsStatic> | null = null;

export function getSqlJs(): Promise<SqlJsStatic> {
  if (!sqlStaticPromise) {
    sqlStaticPromise = initSqlJs({
      locateFile: (file: string) => `https://sql.js.org/dist/${file}`,
    });
  }
  return sqlStaticPromise;
}

export function mapToSqliteType(type: string): string {
  switch (type) {
    case 'number':
      return 'REAL';
    case 'boolean':
      return 'INTEGER';
    case 'date':
    case 'text':
    default:
      return 'TEXT';
  }
}

export async function createMemoryDatabase(): Promise<Database> {
  const SQL = await getSqlJs();
  return new SQL.Database();
}

export function createTableFromParsedData(
  db: Database,
  tableName: string,
  columns: InferredColumn[],
  rows: Record<string, unknown>[]
): void {
  // 1. Create table statement
  const colDefs = columns
    .map((col) => `"${col.name.replace(/"/g, '""')}" ${mapToSqliteType(col.selectedType)}`)
    .join(', ');

  const createTableSql = `CREATE TABLE IF NOT EXISTS "${tableName.replace(/"/g, '""')}" (${colDefs});`;
  db.run(createTableSql);

  if (rows.length === 0) return;

  // 2. Prepared statement batch insertion wrapped in a SINGLE transaction
  const colNames = columns.map((c) => `"${c.name.replace(/"/g, '""')}"`).join(', ');
  const placeholders = columns.map(() => '?').join(', ');
  const insertSql = `INSERT INTO "${tableName.replace(/"/g, '""')}" (${colNames}) VALUES (${placeholders});`;

  db.run('BEGIN TRANSACTION;');
  try {
    const stmt = db.prepare(insertSql);
    for (const row of rows) {
      const values = columns.map((col) => {
        const val = row[col.name];
        if (val === null || val === undefined) return null;
        if (col.selectedType === 'number') return Number(val);
        if (col.selectedType === 'boolean') return val ? 1 : 0;
        return String(val);
      });
      stmt.run(values);
    }
    stmt.free();
    db.run('COMMIT;');
  } catch (err) {
    db.run('ROLLBACK;');
    throw err;
  }
}
