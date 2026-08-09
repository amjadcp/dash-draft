import React from 'react';
import { useQueryState, parseAsStringEnum } from 'nuqs';
import { Table2, BarChart3, Settings, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../hooks/use-theme';

export type DashboardTab = 'tables' | 'analytics' | 'settings';

export const sidebarTabParser = parseAsStringEnum<DashboardTab>([
  'tables',
  'analytics',
  'settings',
]).withDefault('tables');

export function Sidebar(): React.ReactElement {
  const [activeTab, setActiveTab] = useQueryState('tab', sidebarTabParser);
  const { effectiveTheme, toggleTheme } = useTheme();

  return (
    <aside
      style={{
        width: '240px',
        height: '100vh',
        borderRight: '1px solid var(--color-border)',
        background: 'var(--color-bg)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 'var(--space-6) var(--space-4)',
      }}
    >
      <div>
        {/* Brand Wordmark */}
        <div style={{ padding: '0 var(--space-3) var(--space-8)' }}>
          <span
            style={{
              fontWeight: 'var(--weight-bold)',
              fontSize: 'var(--text-lg)',
              letterSpacing: '-0.02em',
              color: 'var(--color-text-primary)',
              textTransform: 'uppercase',
            }}
          >
            DashDraft /
          </span>
        </div>

        {/* Navigation Items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {/* 1. Analytics (Disabled / Upcoming) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 'var(--space-3) var(--space-3)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-text-tertiary)',
              cursor: 'not-allowed',
              userSelect: 'none',
              opacity: 0.6,
            }}
            title="Analytics features coming soon"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <BarChart3 size={18} />
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)' }}>
                Analytics
              </span>
            </div>
            <span className="badge-soon">Soon</span>
          </div>

          {/* 2. Tables (Primary / Default Workspace) */}
          <button
            type="button"
            onClick={() => setActiveTab('tables')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              padding: 'var(--space-3) var(--space-3)',
              borderRadius: 'var(--radius-sm)',
              background: activeTab === 'tables' ? 'var(--color-bg-subtle)' : 'transparent',
              color:
                activeTab === 'tables'
                  ? 'var(--color-text-primary)'
                  : 'var(--color-text-secondary)',
              fontWeight:
                activeTab === 'tables' ? 'var(--weight-semibold)' : 'var(--weight-medium)',
              border: 'none',
              cursor: 'pointer',
              width: '100%',
              textAlign: 'left',
              transition: 'background-color 120ms ease',
            }}
          >
            <Table2
              size={18}
              color={activeTab === 'tables' ? 'var(--color-accent)' : 'currentColor'}
            />
            <span style={{ fontSize: 'var(--text-sm)' }}>Tables</span>
          </button>
        </nav>
      </div>

      {/* Bottom Pinned Section */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-2)',
          borderTop: '1px solid var(--color-border)',
          paddingTop: 'var(--space-4)',
        }}
      >
        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--space-3) var(--space-3)',
            borderRadius: 'var(--radius-sm)',
            background: 'transparent',
            color: 'var(--color-text-secondary)',
            border: 'none',
            cursor: 'pointer',
            width: '100%',
            fontSize: 'var(--text-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            {effectiveTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            <span>Theme</span>
          </div>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
            {effectiveTheme === 'dark' ? 'Dark' : 'Light'}
          </span>
        </button>

        {/* 3. Settings (Pinned to bottom) */}
        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            padding: 'var(--space-3) var(--space-3)',
            borderRadius: 'var(--radius-sm)',
            background: activeTab === 'settings' ? 'var(--color-bg-subtle)' : 'transparent',
            color:
              activeTab === 'settings'
                ? 'var(--color-text-primary)'
                : 'var(--color-text-secondary)',
            fontWeight:
              activeTab === 'settings' ? 'var(--weight-semibold)' : 'var(--weight-medium)',
            border: 'none',
            cursor: 'pointer',
            width: '100%',
            textAlign: 'left',
            transition: 'background-color 120ms ease',
          }}
        >
          <Settings size={18} />
          <span style={{ fontSize: 'var(--text-sm)' }}>Settings</span>
        </button>
      </div>
    </aside>
  );
}
