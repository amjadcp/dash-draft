import { describe, expect, it } from 'vitest';
import { generateNanoid, getOrCreateUserId, setStoredUserId } from './user-id';

describe('user-id module (FR-3)', () => {
  it('generates a 21-character URL-safe nanoid', () => {
    const id = generateNanoid(21);
    expect(id).toHaveLength(21);
    expect(id).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it('persists user ID to localStorage idempotently', () => {
    localStorage.clear();
    const id1 = getOrCreateUserId();
    expect(id1).toHaveLength(21);

    const id2 = getOrCreateUserId();
    expect(id2).toBe(id1);

    setStoredUserId('usr_customid1234567890');
    expect(getOrCreateUserId()).toBe('usr_customid1234567890');
  });
});
