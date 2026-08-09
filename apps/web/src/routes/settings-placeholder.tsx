import React from 'react';
import { KeyRound } from 'lucide-react';

export function SettingsPlaceholderRoute(): React.ReactElement {
  return (
    <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
      <header style={{ marginBottom: 'var(--space-8)' }}>
        <h1
          style={{
            fontSize: 'var(--text-3xl)',
            fontWeight: 'var(--weight-bold)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-2)',
          }}
        >
          Settings
        </h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
          Manage your MCP connector credentials, preferences, and local folder paths.
        </p>
      </header>

      <div className="card">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-4)',
          }}
        >
          <KeyRound size={20} color="var(--color-accent)" />
          <h2 className="card-title" style={{ fontSize: 'var(--text-lg)', margin: 0 }}>
            OAuth Credentials & Connector
          </h2>
        </div>
        <p className="card-subtitle">
          Regenerate connector client credentials or update local config settings.
        </p>
        <button className="btn btn-solid" disabled>
          Regenerate Credentials
        </button>
      </div>
    </div>
  );
}
