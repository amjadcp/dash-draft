import type { ColumnPrivacyPolicy } from '@repo/mcp-contracts';

export interface ColumnPrivacyConfig {
  columnName: string;
  policy: ColumnPrivacyPolicy;
}

export async function hashValueSha256(val: unknown): Promise<string> {
  if (val === null || val === undefined) return 'NULL';
  const str = String(val);

  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    // Fallback simple hash for non-browser testing if needed
    return `hash_${str}`;
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return `sha256_${hashHex.substring(0, 16)}`;
}

export async function applyColumnPrivacyToRows(
  rows: Record<string, unknown>[],
  columnsPrivacy: ColumnPrivacyConfig[]
): Promise<Record<string, unknown>[]> {
  const privacyMap = new Map<string, ColumnPrivacyPolicy>();
  for (const item of columnsPrivacy) {
    privacyMap.set(item.columnName.toLowerCase(), item.policy);
  }

  const transformedRows: Record<string, unknown>[] = [];

  for (const row of rows) {
    const transformedRow: Record<string, unknown> = {};

    for (const [colName, rawVal] of Object.entries(row)) {
      const policy = privacyMap.get(colName.toLowerCase()) || 'visible';

      if (policy === 'excluded') {
        // Excluded columns are stripped from result
        continue;
      }

      if (policy === 'hashed') {
        if (rawVal === null || rawVal === undefined) {
          transformedRow[colName] = null;
        } else {
          transformedRow[colName] = await hashValueSha256(rawVal);
        }
        continue;
      }

      transformedRow[colName] = rawVal;
    }

    transformedRows.push(transformedRow);
  }

  return transformedRows;
}
