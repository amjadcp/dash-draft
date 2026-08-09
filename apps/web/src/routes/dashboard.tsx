import React from 'react';

export function DashboardRoute(): React.ReactElement {
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
          Tables Workspace
        </h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
          Manage your client-side SQLite tables and exposed MCP data models.
        </p>
      </header>

      {/* Tables Placeholder Shell */}
      <div className="card" style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
        <div
          className="icon-badge"
          style={{ margin: '0 auto var(--space-4)', width: '64px', height: '64px' }}
        >
          <span style={{ fontSize: 'var(--text-xl)' }}>📊</span>
        </div>
        <h2 className="card-title">No tables created yet</h2>
        <p className="card-subtitle" style={{ maxWidth: '480px', margin: '0 auto var(--space-6)' }}>
          Point DashDraft to a local data folder and upload your first CSV, TSV, or Excel file to
          get started.
        </p>
      </div>
    </div>
  );
}
