import React, { useState } from 'react';
import { Table2, Check, AlertCircle, Trash2 } from 'lucide-react';
import type {
  IngestFileParsedData,
  InferredColumn,
  InferredColumnType,
} from '../../lib/ingest/parser';
import { sanitizeSqlIdentifier } from '../../lib/ingest/parser';

export interface SchemaPreviewModalProps {
  parsedData: IngestFileParsedData;
  onCommit: (tableName: string, columns: InferredColumn[]) => void;
  onCancel: () => void;
}

export function SchemaPreviewModal({
  parsedData,
  onCommit,
  onCancel,
}: SchemaPreviewModalProps): React.ReactElement {
  const [tableName, setTableName] = useState<string>(parsedData.tableName);
  const [columns, setColumns] = useState<InferredColumn[]>(parsedData.columns);

  const handleTypeChange = (colName: string, newType: InferredColumnType): void => {
    setColumns((prev) =>
      prev.map((c) => (c.name === colName ? { ...c, selectedType: newType } : c))
    );
  };

  const handleCommit = (): void => {
    const validTableName = sanitizeSqlIdentifier(tableName);
    onCommit(validTableName, columns);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 'var(--space-4)',
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: '840px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--color-bg)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
          padding: 'var(--space-6)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'var(--space-4)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div className="icon-badge" style={{ width: '40px', height: '40px' }}>
              <Table2 size={20} />
            </div>
            <div>
              <h2 className="card-title" style={{ fontSize: 'var(--text-lg)', margin: 0 }}>
                Schema Preview &amp; Import
              </h2>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
                File: {parsedData.fileName}{' '}
                {parsedData.sheetName ? `(Sheet: ${parsedData.sheetName})` : ''} &bull;{' '}
                {parsedData.allCleanedRows.length} rows detected
              </span>
            </div>
          </div>
        </div>

        {/* Auto-cleaning Report Banner (FR-8) */}
        {parsedData.skippedBlankRowsCount > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-3) var(--space-4)',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-warning-subtle)',
              color: 'var(--color-warning)',
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--weight-medium)',
              marginBottom: 'var(--space-4)',
            }}
          >
            <AlertCircle size={14} />
            <span>
              Auto-cleaning: {parsedData.skippedBlankRowsCount} fully blank row(s) skipped.
              Whitespace-only cells normalized to NULL.
            </span>
          </div>
        )}

        {/* Table Name Input */}
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <label
            style={{
              display: 'block',
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--weight-medium)',
              color: 'var(--color-text-secondary)',
              marginBottom: 'var(--space-1)',
            }}
          >
            SQL Table Name
          </label>
          <input
            type="text"
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            style={{
              width: '100%',
              padding: 'var(--space-2) var(--space-3)',
              fontSize: 'var(--text-sm)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-bg-subtle)',
              color: 'var(--color-text-primary)',
            }}
          />
        </div>

        {/* Column Configuration & Types Table */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            marginBottom: 'var(--space-4)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
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
                <th
                  style={{
                    padding: 'var(--space-2) var(--space-3)',
                    fontWeight: 'var(--weight-medium)',
                  }}
                >
                  Column Name
                </th>
                <th
                  style={{
                    padding: 'var(--space-2) var(--space-3)',
                    fontWeight: 'var(--weight-medium)',
                  }}
                >
                  Inferred Type
                </th>
                <th
                  style={{
                    padding: 'var(--space-2) var(--space-3)',
                    fontWeight: 'var(--weight-medium)',
                  }}
                >
                  Selected SQL Type
                </th>
              </tr>
            </thead>
            <tbody>
              {columns.map((col) => (
                <tr key={col.name} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td
                    style={{
                      padding: 'var(--space-2) var(--space-3)',
                      fontWeight: 'var(--weight-semibold)',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    {col.name}
                  </td>
                  <td
                    style={{
                      padding: 'var(--space-2) var(--space-3)',
                      color: 'var(--color-text-tertiary)',
                    }}
                  >
                    {col.inferredType}
                  </td>
                  <td style={{ padding: 'var(--space-2) var(--space-3)' }}>
                    <select
                      value={col.selectedType}
                      onChange={(e) =>
                        handleTypeChange(col.name, e.target.value as InferredColumnType)
                      }
                      style={{
                        padding: 'var(--space-1) var(--space-2)',
                        fontSize: 'var(--text-xs)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--color-border)',
                        background: 'var(--color-bg)',
                        color: 'var(--color-text-primary)',
                      }}
                    >
                      <option value="text">Text (TEXT)</option>
                      <option value="number">Number (REAL)</option>
                      <option value="boolean">Boolean (INTEGER)</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sample Rows Preview */}
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <span
            style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--weight-medium)',
              color: 'var(--color-text-secondary)',
              display: 'block',
              marginBottom: 'var(--space-2)',
            }}
          >
            Sample Data Preview (First {parsedData.sampleRows.length} rows)
          </span>
          <div
            style={{
              overflowX: 'auto',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              maxHeight: '140px',
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: 'var(--text-xs)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              <thead>
                <tr
                  style={{
                    background: 'var(--color-bg-subtle)',
                    borderBottom: '1px solid var(--color-border)',
                  }}
                >
                  {columns.map((c) => (
                    <th
                      key={c.name}
                      style={{ padding: 'var(--space-1) var(--space-2)', textAlign: 'left' }}
                    >
                      {c.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parsedData.sampleRows.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    {columns.map((c) => (
                      <td
                        key={c.name}
                        style={{
                          padding: 'var(--space-1) var(--space-2)',
                          color: row[c.name] === null ? 'var(--color-text-tertiary)' : 'inherit',
                        }}
                      >
                        {row[c.name] === null ? 'NULL' : String(row[c.name])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
          <button type="button" className="btn btn-outline" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="btn btn-accent" onClick={handleCommit}>
            <Check size={16} /> Create SQL Table ({parsedData.allCleanedRows.length} rows)
          </button>
        </div>
      </div>
    </div>
  );
}
