import { describe, expect, it } from 'vitest';
import { applyColumnPrivacyToRows, hashValueSha256 } from './privacy';

describe('Column Privacy Engine (FR-10)', () => {
  it('hashes values deterministically via SHA-256', async () => {
    const hash1 = await hashValueSha256('customer_123');
    const hash2 = await hashValueSha256('customer_123');
    const hash3 = await hashValueSha256('customer_999');

    expect(hash1).toBe(hash2);
    expect(hash1).not.toBe(hash3);
    expect(hash1).toMatch(/^(sha256_|hash_)/);
  });

  it('applies column privacy policies (Visible, Hashed, Excluded) to row sets', async () => {
    const rawRows = [
      { id: 1, name: 'Alice', ssn: '123-45-6789', revenue: 500 },
      { id: 2, name: 'Bob', ssn: '987-65-4321', revenue: 750 },
    ];

    const privacyConfig = [
      { columnName: 'id', policy: 'visible' as const },
      { columnName: 'name', policy: 'visible' as const },
      { columnName: 'ssn', policy: 'excluded' as const },
      { columnName: 'revenue', policy: 'hashed' as const },
    ];

    const transformed = await applyColumnPrivacyToRows(rawRows, privacyConfig);
    expect(transformed).toHaveLength(2);

    // Row 1
    expect(transformed[0]!['id']).toBe(1);
    expect(transformed[0]!['name']).toBe('Alice');
    expect(transformed[0]!['ssn']).toBeUndefined(); // Excluded column stripped
    expect(typeof transformed[0]!['revenue']).toBe('string'); // Hashed
    expect(transformed[0]!['revenue']).not.toBe(500);

    // Row 2
    expect(transformed[1]!['id']).toBe(2);
    expect(transformed[1]!['ssn']).toBeUndefined();
  });
});
