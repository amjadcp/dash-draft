import React from 'react';
import { BarChart3 } from 'lucide-react';

export function AnalyticsPlaceholderRoute(): React.ReactElement {
  return (
    <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
      <header style={{ marginBottom: 'var(--space-8)' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-2)',
          }}
        >
          <h1
            style={{
              fontSize: 'var(--text-3xl)',
              fontWeight: 'var(--weight-bold)',
              color: 'var(--color-text-primary)',
            }}
          >
            Analytics
          </h1>
          <span className="badge-soon">Soon</span>
        </div>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
          Visual insights and query performance metrics for your local datasets.
        </p>
      </header>

      <div className="surface-emphasis" style={{ textAlign: 'center' }}>
        <div className="icon-badge" style={{ margin: '0 auto var(--space-4)' }}>
          <BarChart3 size={24} />
        </div>
        <h2
          style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: 'var(--weight-bold)',
            marginBottom: 'var(--space-2)',
          }}
        >
          Analytics Coming Soon
        </h2>
        <p
          style={{
            maxWidth: '520px',
            margin: '0 auto',
            fontSize: 'var(--text-sm)',
            lineHeight: 'var(--leading-relaxed)',
          }}
        >
          Analytics will provide privacy-preserving execution metrics, token-savings estimates, and
          query history visualizations built directly on your local query audit logs.
        </p>
      </div>
    </div>
  );
}
