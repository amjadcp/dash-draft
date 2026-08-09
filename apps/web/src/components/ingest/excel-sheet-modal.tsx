import React, { useState } from 'react';
import { FileSpreadsheet, Check } from 'lucide-react';
import type { ExcelWorkbookSheetInfo } from '../../lib/ingest/parser';

export interface ExcelSheetModalProps {
  fileName: string;
  sheets: ExcelWorkbookSheetInfo[];
  onSelectSheets: (selectedSheets: ExcelWorkbookSheetInfo[]) => void;
  onCancel: () => void;
}

export function ExcelSheetModal({
  fileName,
  sheets,
  onSelectSheets,
  onCancel,
}: ExcelSheetModalProps): React.ReactElement {
  const [selectedSheetNames, setSelectedSheetNames] = useState<string[]>(() =>
    sheets.length > 0 && sheets[0] ? [sheets[0].sheetName] : []
  );

  const toggleSheet = (name: string): void => {
    setSelectedSheetNames((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
    );
  };

  const handleConfirm = (): void => {
    const selected = sheets.filter((s) => selectedSheetNames.includes(s.sheetName));
    if (selected.length > 0) {
      onSelectSheets(selected);
    }
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
          maxWidth: '540px',
          width: '100%',
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
            <FileSpreadsheet size={20} />
          </div>
          <div>
            <h2 className="card-title" style={{ fontSize: 'var(--text-lg)', margin: 0 }}>
              Select Excel Worksheets
            </h2>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
              Workbook: {fileName} &bull; Choose sheets to convert to SQL tables
            </span>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
            marginBottom: 'var(--space-6)',
          }}
        >
          {sheets.map((sheet) => {
            const isChecked = selectedSheetNames.includes(sheet.sheetName);
            return (
              <label
                key={sheet.sheetName}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 'var(--space-3) var(--space-4)',
                  borderRadius: 'var(--radius-sm)',
                  border: `1px solid ${isChecked ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  background: isChecked ? 'var(--color-accent-subtle)' : 'var(--color-bg-subtle)',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleSheet(sheet.sheetName)}
                    style={{ accentColor: 'var(--color-accent)' }}
                  />
                  <span
                    style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--weight-medium)',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    {sheet.sheetName}
                  </span>
                </div>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
                  {sheet.rows.length} rows
                </span>
              </label>
            );
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
          <button type="button" className="btn btn-outline" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-accent"
            disabled={selectedSheetNames.length === 0}
            onClick={handleConfirm}
          >
            <Check size={16} /> Import Selected Sheets ({selectedSheetNames.length})
          </button>
        </div>
      </div>
    </div>
  );
}
