import React from 'react';
import { Eye, Hash, EyeOff } from 'lucide-react';
import type { ColumnPrivacyPolicy } from '@repo/mcp-contracts';

export interface ColumnPrivacyMenuProps {
  columnName: string;
  currentPolicy: ColumnPrivacyPolicy;
  onPolicyChange: (columnName: string, newPolicy: ColumnPrivacyPolicy) => void;
}

export function ColumnPrivacyBadge({
  policy,
}: {
  policy: ColumnPrivacyPolicy;
}): React.ReactElement | null {
  if (policy === 'hashed') {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--space-1)',
          padding: '2px var(--space-2)',
          borderRadius: 'var(--radius-full)',
          background: 'var(--color-accent-subtle)',
          color: 'var(--color-accent)',
          fontSize: 'var(--text-xs)',
          fontWeight: 'var(--weight-semibold)',
        }}
        title="Column values are hashed with deterministic SHA-256 in query results"
      >
        <Hash size={12} /> Hashed
      </span>
    );
  }

  if (policy === 'excluded') {
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
        title="Column is excluded from MCP AI queries and results"
      >
        <EyeOff size={12} /> Excluded
      </span>
    );
  }

  return null;
}

export function ColumnPrivacyMenu({
  columnName,
  currentPolicy,
  onPolicyChange,
}: ColumnPrivacyMenuProps): React.ReactElement {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}>
      <select
        value={currentPolicy}
        onChange={(e) => onPolicyChange(columnName, e.target.value as ColumnPrivacyPolicy)}
        style={{
          padding: 'var(--space-1) var(--space-2)',
          fontSize: 'var(--text-xs)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--color-border)',
          background: 'var(--color-bg)',
          color: 'var(--color-text-primary)',
          cursor: 'pointer',
        }}
        aria-label={`Column privacy policy for ${columnName}`}
      >
        <option value="visible">Visible (Default)</option>
        <option value="hashed">Hashed (SHA-256)</option>
        <option value="excluded">Excluded (Opt-Out)</option>
      </select>
      <ColumnPrivacyBadge policy={currentPolicy} />
    </div>
  );
}
