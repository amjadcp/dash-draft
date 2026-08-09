import React, { useState } from 'react';
import { Layers, PlusCircle, Check, AlertCircle } from 'lucide-react';
import type { IngestFileParsedData } from '../../lib/ingest/parser';
import type { TableMeta } from '@repo/mcp-contracts';

export interface AppendRowsModalProps {
  targetTable: TableMeta;
  parsedData: IngestFileParsedData;
  onCommitAppend: (addNewColumns: boolean) => void;
  onCancel: () => void;
}

export function AppendRowsModal({
  targetTable,
  parsedData,
  onCommitAppend,
  onCancel,
}: AppendRowsModalProps): React.ReactElement {
  const [addNewColumns, setAddNewColumns] = useState<boolean>(true);

  const existingColumnNames = targetTable.columns.map((c) => c.name.toLowerCase());
  const incomingColumnNames = parsedData.columns.map((c) => c.name.toLowerCase());

  const matchingColumns = parsedData.columns.filter((c) =>
    existingColumnNames.includes(c.name.toLowerCase())
  );
  const newIncomingColumns = parsedData.columns.filter(
    (c) => !existingColumnNames.includes(c.name.toLowerCase())
  );
  const missingExistingColumns = targetTable.columns.filter(
    (c) => !incomingColumnNames.includes(c.name.toLowerCase())
  );

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
          maxWidth: '680px',
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
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-4)',
          }}
        >
          <div className="icon-badge" style={{ width: '40px', height: '40px' }}>
            <Layers size={20} />
          </div>
          <div>
            <h2 className="card-title" style={{ fontSize: 'var(--text-lg)', margin: 0 }}>
              Append Rows to Table "{targetTable.name}"
            </h2>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
              File: {parsedData.fileName} &bull; {parsedData.allCleanedRows.length} incoming row(s)
            </span>
          </div>
        </div>

        {/* Auto-cleaning Report Banner */}
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
              Auto-cleaning: {parsedData.skippedBlankRowsCount} fully blank row(s) skipped from
              incoming file.
            </span>
          </div>
        )}

        {/* Schema Diff Summary Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-4)',
          }}
        >
          <div
            style={{
              background: 'var(--color-bg-subtle)',
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-sm)',
              textAlign: 'center',
            }}
          >
            <span
              style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-secondary)',
                display: 'block',
              }}
            >
              Matching Columns
            </span>
            <span
              style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--weight-bold)',
                color: 'var(--color-success)',
              }}
            >
              {matchingColumns.length}
            </span>
          </div>

          <div
            style={{
              background: 'var(--color-bg-subtle)',
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-sm)',
              textAlign: 'center',
            }}
          >
            <span
              style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-secondary)',
                display: 'block',
              }}
            >
              New Columns
            </span>
            <span
              style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--weight-bold)',
                color:
                  newIncomingColumns.length > 0
                    ? 'var(--color-accent)'
                    : 'var(--color-text-primary)',
              }}
            >
              {newIncomingColumns.length}
            </span>
          </div>

          <div
            style={{
              background: 'var(--color-bg-subtle)',
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-sm)',
              textAlign: 'center',
            }}
          >
            <span
              style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-secondary)',
                display: 'block',
              }}
            >
              Unmatched Existing
            </span>
            <span
              style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--weight-bold)',
                color: 'var(--color-text-tertiary)',
              }}
            >
              {missingExistingColumns.length}
            </span>
          </div>
        </div>

        {/* New Column Handling Option */}
        {newIncomingColumns.length > 0 && (
          <div
            style={{
              marginBottom: 'var(--space-4)',
              padding: 'var(--space-3) var(--space-4)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-bg-subtle)',
            }}
          >
            <span
              style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--weight-semibold)',
                color: 'var(--color-text-primary)',
                display: 'block',
                marginBottom: 'var(--space-2)',
              }}
            >
              New Columns in File: {newIncomingColumns.map((c) => c.name).join(', ')}
            </span>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                fontSize: 'var(--text-xs)',
                cursor: 'pointer',
                marginBottom: 'var(--space-1)',
              }}
            >
              <input
                type="radio"
                name="newColOption"
                checked={addNewColumns}
                onChange={() => setAddNewColumns(true)}
                style={{ accentColor: 'var(--color-accent)' }}
              />
              <span>Add new columns to table schema (existing rows filled with NULL)</span>
            </label>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                fontSize: 'var(--text-xs)',
                cursor: 'pointer',
              }}
            >
              <input
                type="radio"
                name="newColOption"
                checked={!addNewColumns}
                onChange={() => setAddNewColumns(false)}
                style={{ accentColor: 'var(--color-accent)' }}
              />
              <span>Ignore new columns (only populate existing columns)</span>
            </label>
          </div>
        )}

        {/* Missing Columns Warning */}
        {missingExistingColumns.length > 0 && (
          <p
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-secondary)',
              marginBottom: 'var(--space-4)',
            }}
          >
            Note: Columns <code>{missingExistingColumns.map((c) => c.name).join(', ')}</code> are
            not in the file and will be populated as <code>NULL</code> for appended rows.
          </p>
        )}

        {/* Footer Actions */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 'var(--space-3)',
            marginTop: 'auto',
          }}
        >
          <button type="button" className="btn btn-outline" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-accent"
            onClick={() => onCommitAppend(addNewColumns)}
          >
            <PlusCircle size={16} /> Append {parsedData.allCleanedRows.length} Rows
          </button>
        </div>
      </div>
    </div>
  );
}
