import type { Database } from 'sql.js';
import type { QueryToolResult, QueryLogEntry } from '@repo/mcp-contracts';
import { validateAndSanitizeQuery, type TableColumnSchemaContext } from './validator';
import { applyColumnPrivacyToRows, type ColumnPrivacyConfig } from './privacy';
import { addQueryLogEntry } from './log-store';

export interface ExecuteQueryOptions {
  db: Database;
  sql: string;
  prompt?: string;
  schemaContexts?: TableColumnSchemaContext[];
  privacyConfigs?: ColumnPrivacyConfig[];
  dirHandle?: FileSystemDirectoryHandle | null;
  existingLogs?: QueryLogEntry[];
}

export interface ExecuteQueryResult {
  result: QueryToolResult | null;
  logEntry: QueryLogEntry;
  updatedLogs: QueryLogEntry[];
  error?: string;
}

export async function executeValidatedQuery(
  options: ExecuteQueryOptions
): Promise<ExecuteQueryResult> {
  const {
    db,
    sql,
    prompt,
    schemaContexts = [],
    privacyConfigs = [],
    dirHandle = null,
    existingLogs = [],
  } = options;

  const startTime = performance.now();

  // 1. Safety & Privacy Guardrail Validation (FR-11)
  const validation = validateAndSanitizeQuery(sql, schemaContexts);

  if (!validation.isValid || !validation.sanitizedSql) {
    const durationMs = Math.round(performance.now() - startTime);
    const { updatedLogs, entry } = await addQueryLogEntry(dirHandle, existingLogs, {
      prompt,
      sql,
      status: 'rejected',
      errorMessage: validation.errorMessage || 'Query rejected by safety guardrails',
      durationMs,
      rowsReturned: 0,
    });

    return {
      result: null,
      logEntry: entry,
      updatedLogs,
      error: validation.errorMessage,
    };
  }

  // 2. Execute validated read-only SQL query against sql.js Database
  try {
    const res = db.exec(validation.sanitizedSql);
    const durationMs = Math.round(performance.now() - startTime);

    if (!res || res.length === 0 || !res[0]) {
      const { updatedLogs, entry } = await addQueryLogEntry(dirHandle, existingLogs, {
        prompt,
        sql: validation.sanitizedSql,
        status: 'success',
        rowsReturned: 0,
        durationMs,
      });

      return {
        result: {
          columns: [],
          rows: [],
          rowCount: 0,
          durationMs,
          truncated: false,
        },
        logEntry: entry,
        updatedLogs,
      };
    }

    const firstResult = res[0];
    const columns = firstResult.columns;
    const rawValueRows = firstResult.values;

    // Convert raw array values into key-value objects
    const rawObjectRows: Record<string, unknown>[] = rawValueRows.map((rowArr) => {
      const obj: Record<string, unknown> = {};
      columns.forEach((colName, idx) => {
        obj[colName] = rowArr[idx];
      });
      return obj;
    });

    // 3. Apply Column Privacy Policies (FR-10)
    const privacyRows = await applyColumnPrivacyToRows(rawObjectRows, privacyConfigs);

    // 4. Log Execution Success (FR-12)
    const { updatedLogs, entry } = await addQueryLogEntry(dirHandle, existingLogs, {
      prompt,
      sql: validation.sanitizedSql,
      status: 'success',
      rowsReturned: privacyRows.length,
      durationMs,
    });

    return {
      result: {
        columns,
        rows: privacyRows,
        rowCount: privacyRows.length,
        durationMs,
        truncated: privacyRows.length >= 200,
      },
      logEntry: entry,
      updatedLogs,
    };
  } catch (err) {
    const durationMs = Math.round(performance.now() - startTime);
    const errorMessage = err instanceof Error ? err.message : 'Database query execution error';

    const { updatedLogs, entry } = await addQueryLogEntry(dirHandle, existingLogs, {
      prompt,
      sql: validation.sanitizedSql,
      status: 'error',
      errorMessage,
      durationMs,
      rowsReturned: 0,
    });

    return {
      result: null,
      logEntry: entry,
      updatedLogs,
      error: errorMessage,
    };
  }
}
