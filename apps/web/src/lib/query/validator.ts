import type { ErrorCode } from '@repo/mcp-contracts';

export interface QueryValidationResult {
  isValid: boolean;
  sanitizedSql?: string;
  errorCode?: ErrorCode;
  errorMessage?: string;
}

export interface TableColumnSchemaContext {
  tableName: string;
  excludedColumns: string[];
}

export const DEFAULT_QUERY_ROW_CAP = 200;

export function validateAndSanitizeQuery(
  sql: string,
  schemaContexts: TableColumnSchemaContext[] = [],
  maxRowCap: number = DEFAULT_QUERY_ROW_CAP
): QueryValidationResult {
  const trimmed = sql.trim();

  if (!trimmed) {
    return {
      isValid: false,
      errorCode: 'INVALID_INPUT',
      errorMessage: 'SQL query cannot be empty',
    };
  }

  // 1. Enforce single-statement read-only SELECT query
  const statements = trimmed
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);
  if (statements.length > 1) {
    return {
      isValid: false,
      errorCode: 'QUERY_REJECTED',
      errorMessage:
        'Multi-statement SQL queries are prohibited. Only a single SELECT statement is allowed.',
    };
  }

  const singleSql = statements[0] || trimmed;
  const upperSql = singleSql.toUpperCase();

  // 2. Reject non-SELECT data modification commands
  const forbiddenKeywords = [
    'INSERT',
    'UPDATE',
    'DELETE',
    'DROP',
    'ALTER',
    'CREATE',
    'REPLACE',
    'TRUNCATE',
    'PRAGMA',
    'EXEC',
    'ATTACH',
    'DETACH',
  ];
  for (const keyword of forbiddenKeywords) {
    // Match whole word keyword
    const regex = new RegExp(`\\b${keyword}\\b`, 'i');
    if (regex.test(singleSql)) {
      return {
        isValid: false,
        errorCode: 'QUERY_REJECTED',
        errorMessage: `Forbidden SQL operation '${keyword}'. MCP tool calls are strictly restricted to read-only SELECT queries.`,
      };
    }
  }

  if (!upperSql.startsWith('SELECT') && !upperSql.startsWith('WITH')) {
    return {
      isValid: false,
      errorCode: 'QUERY_REJECTED',
      errorMessage:
        'SQL query must begin with SELECT or WITH. Data-modifying queries are strictly prohibited.',
    };
  }

  // 3. Reject SELECT * and SELECT table.*
  if (
    /\bSELECT\s+(\w+\s*,\s*)*\*/i.test(singleSql) ||
    /\bSELECT\s+.*\*\s*/i.test(singleSql) ||
    /\b\w+\.\*/i.test(singleSql)
  ) {
    return {
      isValid: false,
      errorCode: 'QUERY_REJECTED',
      errorMessage:
        'SELECT * queries are strictly prohibited. Explicit column selection is required to prevent raw data dumps.',
    };
  }

  // 4. Check for Excluded columns
  for (const ctx of schemaContexts) {
    for (const excludedCol of ctx.excludedColumns) {
      const colRegex = new RegExp(`\\b${excludedCol}\\b`, 'i');
      if (colRegex.test(singleSql)) {
        return {
          isValid: false,
          errorCode: 'QUERY_REJECTED',
          errorMessage: `Query references column '${excludedCol}' which is marked as Excluded by the user privacy policy.`,
        };
      }
    }
  }

  // 5. Enforce DEFAULT_QUERY_ROW_CAP LIMIT
  let sanitizedSql = singleSql;
  const limitMatch = singleSql.match(/\bLIMIT\s+(\d+)/i);

  if (limitMatch && limitMatch[1]) {
    const requestedLimit = parseInt(limitMatch[1], 10);
    if (requestedLimit > maxRowCap) {
      sanitizedSql = singleSql.replace(/\bLIMIT\s+\d+/i, `LIMIT ${maxRowCap}`);
    }
  } else {
    sanitizedSql = `${singleSql} LIMIT ${maxRowCap}`;
  }

  return {
    isValid: true,
    sanitizedSql,
  };
}
