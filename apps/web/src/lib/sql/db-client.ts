import initSqlJsFactory, { type Database, type SqlJsStatic } from 'sql.js';
import sqlWasmUrl from 'sql.js/dist/sql-wasm.wasm?url';
import type { InferredColumn } from '../ingest/parser';

let sqlStaticPromise: Promise<SqlJsStatic> | null = null;

export function getSqlJs(): Promise<SqlJsStatic> {
  if (!sqlStaticPromise) {
    const initFn =
      typeof initSqlJsFactory === 'function'
        ? initSqlJsFactory
        : ((initSqlJsFactory as unknown as { default: typeof initSqlJsFactory }).default || initSqlJsFactory);

    sqlStaticPromise = initFn({
      locateFile: () => sqlWasmUrl,
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
        if (col.selectedType === 'number') {
          const num = Number(val);
          return Number.isNaN(num) ? null : num;
        }
        if (col.selectedType === 'boolean') {
          const lower = String(val).toLowerCase();
          return lower === 'true' || lower === '1' || lower === 'yes' ? 1 : 0;
        }
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
