import { describe, expect, it } from 'vitest';
import { validateColumnTypeConversion } from './type-conversion';

describe('Type Conversion Validator (FR-9)', () => {
  it('validates successful conversion from text to number when all values are numeric', () => {
    const rows = [
      { id: 1, age: '25' },
      { id: 2, age: '30' },
      { id: 3, age: null },
    ];
    const res = validateColumnTypeConversion(rows, 'age', 'number');
    expect(res.canConvertFully).toBe(true);
    expect(res.invalidRowIndices).toHaveLength(0);
  });

  it('detects invalid rows when converting text containing non-numeric strings to number', () => {
    const rows = [
      { id: 1, amount: '100' },
      { id: 2, amount: 'N/A' },
      { id: 3, amount: '200' },
    ];
    const res = validateColumnTypeConversion(rows, 'amount', 'number');
    expect(res.canConvertFully).toBe(false);
    expect(res.invalidRowIndices).toEqual([1]);
    expect(res.invalidSampleValues).toEqual(['N/A']);
  });
});
