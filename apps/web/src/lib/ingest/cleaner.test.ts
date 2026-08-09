import { describe, expect, it } from 'vitest';
import { cleanRowValues, cleanIngestRows } from './cleaner';

describe('Auto-Cleaning Engine (FR-8)', () => {
  it('normalizes whitespace-only cells to NULL', () => {
    const rawRow = {
      name: '  Alice  ',
      age: '   ',
      role: '',
      active: 'true',
    };
    const { cleanedRow, isFullyBlank } = cleanRowValues(rawRow);
    expect(isFullyBlank).toBe(false);
    expect(cleanedRow['name']).toBe('Alice');
    expect(cleanedRow['age']).toBe(null);
    expect(cleanedRow['role']).toBe(null);
    expect(cleanedRow['active']).toBe('true');
  });

  it('identifies and skips fully blank rows and counts them', () => {
    const rows = [
      { a: 'hello', b: 'world' },
      { a: '  ', b: '' }, // Fully blank
      { a: null, b: undefined }, // Fully blank
      { a: '123', b: ' ' }, // Partially blank -> kept
    ];

    const result = cleanIngestRows(rows);
    expect(result.skippedBlankRowsCount).toBe(2);
    expect(result.cleanedRows).toHaveLength(2);
    expect(result.cleanedRows[0]).toEqual({ a: 'hello', b: 'world' });
    expect(result.cleanedRows[1]).toEqual({ a: '123', b: null });
  });
});
