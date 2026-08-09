import type { InferredColumnType } from '../ingest/parser';

export interface TypeConversionValidationResult {
  canConvertFully: boolean;
  totalRowCount: number;
  invalidRowIndices: number[];
  invalidSampleValues: unknown[];
}

export function validateColumnTypeConversion(
  rows: Record<string, unknown>[],
  columnName: string,
  targetType: InferredColumnType
): TypeConversionValidationResult {
  const invalidRowIndices: number[] = [];
  const invalidSampleValues: unknown[] = [];

  rows.forEach((row, idx) => {
    const val = row[columnName];
    if (val === null || val === undefined) return; // NULL converts to any type cleanly

    const strVal = String(val).trim();

    if (targetType === 'number') {
      if (isNaN(Number(strVal))) {
        invalidRowIndices.push(idx);
        if (invalidSampleValues.length < 5) {
          invalidSampleValues.push(val);
        }
      }
    } else if (targetType === 'boolean') {
      const lower = strVal.toLowerCase();
      if (
        lower !== 'true' &&
        lower !== 'false' &&
        lower !== '0' &&
        lower !== '1' &&
        lower !== 'yes' &&
        lower !== 'no'
      ) {
        invalidRowIndices.push(idx);
        if (invalidSampleValues.length < 5) {
          invalidSampleValues.push(val);
        }
      }
    }
  });

  return {
    canConvertFully: invalidRowIndices.length === 0,
    totalRowCount: rows.length,
    invalidRowIndices,
    invalidSampleValues,
  };
}
