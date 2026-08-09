import { describe, expect, it } from 'vitest';
import { formatQueryLogsAsText } from './log-exporter';
import type { QueryLogEntry } from '@repo/mcp-contracts';

describe('Query Log Text Exporter (FR-12)', () => {
  it('formats log entries into a human-readable text document', () => {
    const logs: QueryLogEntry[] = [
      {
        id: 'log_1',
        workspaceId: 'default',
        timestamp: '2026-08-09T12:00:00.000Z',
        prompt: 'Show me total sales over 500',
        sql: 'SELECT id, amount FROM sales WHERE amount > 500 LIMIT 200',
        status: 'success',
        rowsReturned: 15,
        durationMs: 12,
      },
      {
        id: 'log_2',
        workspaceId: 'default',
        timestamp: '2026-08-09T12:05:00.000Z',
        prompt: 'Attempting invalid query',
        sql: 'SELECT * FROM sales',
        status: 'rejected',
        errorMessage: 'SELECT * queries are strictly prohibited',
        durationMs: 2,
        rowsReturned: 0,
      },
    ];

    const formatted = formatQueryLogsAsText(logs);
    expect(formatted).toContain('DashDraft Query Audit Log Export');
    expect(formatted).toContain('Total Entries: 2');
    expect(formatted).toContain('[Entry #1] ID: log_1');
    expect(formatted).toContain('Status:      SUCCESS');
    expect(formatted).toContain('SELECT id, amount FROM sales WHERE amount > 500 LIMIT 200');
    expect(formatted).toContain('[Entry #2] ID: log_2');
    expect(formatted).toContain('Status:      REJECTED');
    expect(formatted).toContain('Error Msg:   SELECT * queries are strictly prohibited');
  });
});
