import type { QueryLogEntry } from '@repo/mcp-contracts';
import { triggerDownloadFallback } from '../../lib/fs-access';

export function formatQueryLogsAsText(logs: QueryLogEntry[]): string {
  if (logs.length === 0) return 'No query log entries recorded.\n';

  const header = `DashDraft Query Audit Log Export\nExport Date: ${new Date().toISOString()}\nTotal Entries: ${logs.length}\n${'='.repeat(80)}\n\n`;

  const blocks = logs.map((log, idx) => {
    return [
      `[Entry #${idx + 1}] ID: ${log.id}`,
      `Timestamp:   ${log.timestamp}`,
      `Status:      ${log.status.toUpperCase()}`,
      `Duration:    ${log.durationMs !== undefined ? `${log.durationMs}ms` : 'N/A'}`,
      `Rows:        ${log.rowsReturned !== undefined ? log.rowsReturned : 'N/A'}`,
      `Prompt:      ${log.prompt || 'N/A (Direct Tool Call)'}`,
      `SQL Query:`,
      `  ${log.sql}`,
      log.errorMessage ? `Error Msg:   ${log.errorMessage}` : null,
      '-'.repeat(80),
    ]
      .filter(Boolean)
      .join('\n');
  });

  return header + blocks.join('\n\n');
}

export function exportQueryLogsToTextFile(
  logs: QueryLogEntry[],
  filename: string = 'dashdraft-query-audit-log.txt'
): void {
  const formattedText = formatQueryLogsAsText(logs);
  triggerDownloadFallback(filename, formattedText, 'text/plain;charset=utf-8');
}
