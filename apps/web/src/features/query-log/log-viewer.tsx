import React, { useState } from 'react';
import {
  History,
  Download,
  Trash2,
  CheckSquare,
  Square,
  AlertCircle,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';
import type { QueryLogEntry } from '@repo/mcp-contracts';
import { exportQueryLogsToTextFile } from './log-exporter';

export interface QueryLogViewerProps {
  logs: QueryLogEntry[];
  onDeleteSelected: (idsToDelete: string[]) => void;
}

export function QueryLogViewer({
  logs,
  onDeleteSelected,
}: QueryLogViewerProps): React.ReactElement {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelectAll = (): void => {
    if (selectedIds.length === logs.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(logs.map((l) => l.id));
    }
  };

  const toggleSelectOne = (id: string): void => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleDeleteSelected = (): void => {
    if (selectedIds.length > 0) {
      onDeleteSelected(selectedIds);
      setSelectedIds([]);
    }
  };

  const handleExportSelected = (): void => {
    const targetLogs =
      selectedIds.length > 0 ? logs.filter((l) => selectedIds.includes(l.id)) : logs;
    exportQueryLogsToTextFile(targetLogs);
  };

  const getStatusBadge = (status: QueryLogEntry['status']): React.ReactElement => {
    if (status === 'success') {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-1)',
            padding: '2px var(--space-2)',
            borderRadius: 'var(--radius-full)',
            background: 'var(--color-success-subtle)',
            color: 'var(--color-success)',
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--weight-semibold)',
          }}
        >
          <CheckCircle2 size={12} /> Success
        </span>
      );
    }
    if (status === 'rejected') {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-1)',
            padding: '2px var(--space-2)',
            borderRadius: 'var(--radius-full)',
            background: 'var(--color-warning-subtle)',
            color: 'var(--color-warning)',
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--weight-semibold)',
          }}
        >
          <ShieldAlert size={12} /> Rejected
        </span>
      );
    }
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--space-1)',
          padding: '2px var(--space-2)',
          borderRadius: 'var(--radius-full)',
          background: 'var(--color-danger-subtle)',
          color: 'var(--color-danger)',
          fontSize: 'var(--text-xs)',
          fontWeight: 'var(--weight-semibold)',
        }}
      >
        <AlertCircle size={12} /> Error
      </span>
    );
  };

  return (
    <div className="card" style={{ padding: 'var(--space-6)' }}>
      {/* Header & Bulk Actions Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--space-4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div className="icon-badge" style={{ width: '36px', height: '36px' }}>
            <History size={18} />
          </div>
          <div>
            <h3 className="card-title" style={{ fontSize: 'var(--text-base)', margin: 0 }}>
              Query Execution Audit Log
            </h3>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
              {logs.length} total entries &bull; {selectedIds.length} selected
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          {selectedIds.length > 0 && (
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleDeleteSelected}
              style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
            >
              <Trash2 size={14} /> Delete Selected ({selectedIds.length})
            </button>
          )}

          <button
            type="button"
            className="btn btn-outline"
            onClick={handleExportSelected}
            disabled={logs.length === 0}
          >
            <Download size={14} />{' '}
            {selectedIds.length > 0
              ? `Export Selected (${selectedIds.length})`
              : 'Export All (.txt)'}
          </button>
        </div>
      </div>

      {/* Log Entries Table */}
      {logs.length > 0 ? (
        <div
          style={{
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            overflow: 'hidden',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-xs)' }}>
            <thead>
              <tr
                style={{
                  background: 'var(--color-bg-subtle)',
                  borderBottom: '1px solid var(--color-border)',
                  textAlign: 'left',
                }}
              >
                <th style={{ padding: 'var(--space-2) var(--space-3)', width: '36px' }}>
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'currentColor',
                    }}
                  >
                    {selectedIds.length === logs.length && logs.length > 0 ? (
                      <CheckSquare size={16} />
                    ) : (
                      <Square size={16} />
                    )}
                  </button>
                </th>
                <th style={{ padding: 'var(--space-2) var(--space-3)' }}>Timestamp</th>
                <th style={{ padding: 'var(--space-2) var(--space-3)' }}>Status</th>
                <th style={{ padding: 'var(--space-2) var(--space-3)' }}>Prompt / Context</th>
                <th style={{ padding: 'var(--space-2) var(--space-3)' }}>Executed SQL</th>
                <th style={{ padding: 'var(--space-2) var(--space-3)' }}>Timing / Rows</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const isSelected = selectedIds.includes(log.id);
                return (
                  <tr
                    key={log.id}
                    style={{
                      borderBottom: '1px solid var(--color-border)',
                      background: isSelected ? 'var(--color-accent-subtle)' : 'transparent',
                    }}
                  >
                    <td style={{ padding: 'var(--space-2) var(--space-3)' }}>
                      <button
                        type="button"
                        onClick={() => toggleSelectOne(log.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'currentColor',
                        }}
                      >
                        {isSelected ? (
                          <CheckSquare size={16} color="var(--color-accent)" />
                        ) : (
                          <Square size={16} />
                        )}
                      </button>
                    </td>
                    <td
                      style={{
                        padding: 'var(--space-2) var(--space-3)',
                        color: 'var(--color-text-secondary)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td style={{ padding: 'var(--space-2) var(--space-3)' }}>
                      {getStatusBadge(log.status)}
                    </td>
                    <td
                      style={{
                        padding: 'var(--space-2) var(--space-3)',
                        color: 'var(--color-text-primary)',
                      }}
                    >
                      {log.prompt || (
                        <span style={{ color: 'var(--color-text-tertiary)' }}>
                          Direct Tool Call
                        </span>
                      )}
                    </td>
                    <td
                      style={{
                        padding: 'var(--space-2) var(--space-3)',
                        fontFamily: 'var(--font-mono)',
                        maxWidth: '300px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <code>{log.sql}</code>
                    </td>
                    <td
                      style={{
                        padding: 'var(--space-2) var(--space-3)',
                        color: 'var(--color-text-secondary)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {log.durationMs !== undefined ? `${log.durationMs}ms` : '-'} &bull;{' '}
                      {log.rowsReturned !== undefined ? `${log.rowsReturned} rows` : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-tertiary)',
            textAlign: 'center',
            padding: 'var(--space-6)',
          }}
        >
          No query logs recorded yet. Query logs will record all natural language queries run
          against your tables.
        </p>
      )}
    </div>
  );
}
