import { describe, expect, it } from 'vitest';
import { sanitizeSqlIdentifier, inferColumnType } from './parser';

describe('Ingest Parser & Type Inference (FR-5)', () => {
  it('sanitizes filename to valid SQL identifier', () => {
    expect(sanitizeSqlIdentifier('Sales Data 2026!.csv')).toBe('sales_data_2026');
    expect(sanitizeSqlIdentifier('___User List###')).toBe('user_list');
    expect(sanitizeSqlIdentifier('$$$')).toBe('table_1');
  });

  it('infers column types correctly', () => {
    expect(inferColumnType(['10', '25.5', '100'])).toBe('number');
    expect(inferColumnType(['true', 'false', 'true'])).toBe('boolean');
    expect(inferColumnType(['Alice', 'Bob', '100'])).toBe('text');
    expect(inferColumnType(['', null, undefined])).toBe('text');
  });
});
