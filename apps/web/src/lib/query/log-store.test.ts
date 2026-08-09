import { describe, expect, it } from 'vitest';
import { addQueryLogEntry, deleteQueryLogEntries } from './log-store';
import type { QueryLogEntry } from '@repo/mcp-contracts';

describe('Query Log Store (FR-12)', () => {
  it('prepends new log entry with generated ID and timestamp', async () => {
    const existing: QueryLogEntry[] = [];
    const { updatedLogs, entry } = await addQueryLogEntry(null, existing, {
      prompt: 'Get users',
      sql: 'SELECT id, name FROM users LIMIT 200',
      status: 'success',
      rowsReturned: 5,
      durationMs: 8,
    });

    expect(updatedLogs).toHaveLength(1);
    expect(entry.id).toMatch(/^log_/);
    expect(entry.workspaceId).toBe('default');
    expect(entry.sql).toBe('SELECT id, name FROM users LIMIT 200');
  });

  it('deletes selected log entries by ID', async () => {
    const existing: QueryLogEntry[] = [
      {
        id: 'log_1',
        workspaceId: 'default',
        timestamp: '2026-08-09T12:00:00Z',
        sql: 'SELECT 1',
        status: 'success',
      },
      {
        id: 'log_2',
        workspaceId: 'default',
        timestamp: '2026-08-09T12:01:00Z',
        sql: 'SELECT 2',
        status: 'success',
      },
    ];

    const updated = await deleteQueryLogEntries(null, existing, ['log_1']);
    expect(updated).toHaveLength(1);
    expect(updated[0]!.id).toBe('log_2');
  });
});
