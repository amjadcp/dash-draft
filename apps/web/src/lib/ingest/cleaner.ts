export interface CleanResult {
  cleanedRows: Record<string, unknown>[];
  skippedBlankRowsCount: number;
}

export function cleanRowValues(row: Record<string, unknown>): {
  cleanedRow: Record<string, unknown>;
  isFullyBlank: boolean;
} {
  const cleanedRow: Record<string, unknown> = {};
  let hasAnyValue = false;

  for (const [key, value] of Object.entries(row)) {
    if (value === null || value === undefined) {
      cleanedRow[key] = null;
      continue;
    }

    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed === '') {
        cleanedRow[key] = null;
      } else {
        cleanedRow[key] = trimmed;
        hasAnyValue = true;
      }
      continue;
    }

    cleanedRow[key] = value;
    hasAnyValue = true;
  }

  return { cleanedRow, isFullyBlank: !hasAnyValue };
}

export function cleanIngestRows(rows: Record<string, unknown>[]): CleanResult {
  const cleanedRows: Record<string, unknown>[] = [];
  let skippedBlankRowsCount = 0;

  for (const row of rows) {
    const { cleanedRow, isFullyBlank } = cleanRowValues(row);
    if (isFullyBlank) {
      skippedBlankRowsCount++;
    } else {
      cleanedRows.push(cleanedRow);
    }
  }

  return { cleanedRows, skippedBlankRowsCount };
}
