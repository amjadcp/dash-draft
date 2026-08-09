import { describe, expect, it } from 'vitest';
import { validateAndSanitizeQuery } from './validator';

describe('Query Safety Guardrail Engine (FR-11 & Mandatory Safety Rules)', () => {
  it('permits valid SELECT queries with explicit column selection and appends default LIMIT 200', () => {
    const res = validateAndSanitizeQuery('SELECT id, name, amount FROM sales WHERE amount > 100');
    expect(res.isValid).toBe(true);
    expect(res.sanitizedSql).toBe(
      'SELECT id, name, amount FROM sales WHERE amount > 100 LIMIT 200'
    );
  });

  it('preserves existing valid LIMIT if <= 200, or clamps it to 200 if > 200', () => {
    const res1 = validateAndSanitizeQuery('SELECT id FROM sales LIMIT 50');
    expect(res1.isValid).toBe(true);
    expect(res1.sanitizedSql).toBe('SELECT id FROM sales LIMIT 50');

    const res2 = validateAndSanitizeQuery('SELECT id FROM sales LIMIT 5000');
    expect(res2.isValid).toBe(true);
    expect(res2.sanitizedSql).toBe('SELECT id FROM sales LIMIT 200');
  });

  it('unconditionally REJECTS non-SELECT data modification queries (INSERT, UPDATE, DELETE, DROP, ALTER, CREATE, TRUNCATE)', () => {
    const insertRes = validateAndSanitizeQuery("INSERT INTO sales VALUES (1, 'Test')");
    expect(insertRes.isValid).toBe(false);
    expect(insertRes.errorCode).toBe('QUERY_REJECTED');
    expect(insertRes.errorMessage).toContain('Forbidden SQL operation');

    const dropRes = validateAndSanitizeQuery('DROP TABLE sales');
    expect(dropRes.isValid).toBe(false);
    expect(dropRes.errorCode).toBe('QUERY_REJECTED');

    const updateRes = validateAndSanitizeQuery("UPDATE sales SET name = 'Hacked'");
    expect(updateRes.isValid).toBe(false);
    expect(updateRes.errorCode).toBe('QUERY_REJECTED');

    const deleteRes = validateAndSanitizeQuery('DELETE FROM sales');
    expect(deleteRes.isValid).toBe(false);
    expect(deleteRes.errorCode).toBe('QUERY_REJECTED');
  });

  it('unconditionally REJECTS multi-statement batch scripts', () => {
    const batchRes = validateAndSanitizeQuery('SELECT id FROM sales; DROP TABLE sales;');
    expect(batchRes.isValid).toBe(false);
    expect(batchRes.errorCode).toBe('QUERY_REJECTED');
    expect(batchRes.errorMessage).toContain('Multi-statement SQL queries are prohibited');
  });

  it('unconditionally REJECTS SELECT * and SELECT table.* queries', () => {
    const res1 = validateAndSanitizeQuery('SELECT * FROM sales');
    expect(res1.isValid).toBe(false);
    expect(res1.errorCode).toBe('QUERY_REJECTED');
    expect(res1.errorMessage).toContain('SELECT * queries are strictly prohibited');

    const res2 = validateAndSanitizeQuery('SELECT sales.* FROM sales');
    expect(res2.isValid).toBe(false);
    expect(res2.errorCode).toBe('QUERY_REJECTED');
  });

  it('unconditionally REJECTS queries referencing columns marked as Excluded', () => {
    const schemaCtx = [
      {
        tableName: 'sales',
        excludedColumns: ['ssn', 'credit_card'],
      },
    ];

    const allowedRes = validateAndSanitizeQuery('SELECT id, name FROM sales', schemaCtx);
    expect(allowedRes.isValid).toBe(true);

    const forbiddenRes = validateAndSanitizeQuery('SELECT id, ssn FROM sales', schemaCtx);
    expect(forbiddenRes.isValid).toBe(false);
    expect(forbiddenRes.errorCode).toBe('QUERY_REJECTED');
    expect(forbiddenRes.errorMessage).toContain(
      "Query references column 'ssn' which is marked as Excluded"
    );
  });
});
