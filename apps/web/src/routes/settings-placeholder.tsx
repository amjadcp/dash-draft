import React from 'react';
import { useWorkspace } from '../state/workspace-context';
import { OAuthSettings } from '../components/settings/oauth-settings';
import { FolderGit2, AlertCircle, HardDrive } from 'lucide-react';

export function SettingsPlaceholderRoute(): React.ReactElement {
  const ws = useWorkspace();

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
          Settings &amp; Folder Configuration
        </h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
          Manage your local data folder, OAuth credentials, and MCP connector configuration.
        </p>
      </header>

      {/* 1. Local Folder Configuration Card */}
      <div className="card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
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
              <FolderGit2 size={20} />
            </div>
            <div>
              <h2 className="card-title" style={{ fontSize: 'var(--text-lg)', margin: 0 }}>
                Local Data Folder Storage
              </h2>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
                Folder handle granted via browser File System Access API
              </span>
            </div>
          </div>

          {ws.reconnectFolderHandle ? (
            <button type="button" className="btn btn-accent" onClick={ws.reconnectFolder}>
              <FolderGit2 size={16} /> Re-connect "{ws.folderName}"
            </button>
          ) : (
            <button type="button" className="btn btn-solid" onClick={ws.selectFolder}>
              <FolderGit2 size={16} /> {ws.folderName ? 'Change Folder' : 'Select Folder'}
            </button>
          )}
        </div>

        <div
          style={{
            padding: 'var(--space-4)',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--color-bg-subtle)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <HardDrive
              size={18}
              color={ws.folderName ? 'var(--color-success)' : 'var(--color-text-tertiary)'}
            />
            <div>
              <div
                style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: 'var(--weight-semibold)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                Active Folder Status
              </div>
              <div
                style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--weight-medium)',
                  color: ws.folderName ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
                }}
              >
                {ws.folderName
                  ? `Connected to "${ws.folderName}"`
                  : 'No local data folder selected (using in-memory transient config)'}
              </div>
            </div>
          </div>
        </div>

        {!ws.isFsSupported && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              marginTop: 'var(--space-3)',
              color: 'var(--color-warning)',
              fontSize: 'var(--text-xs)',
            }}
          >
            <AlertCircle size={14} />
            <span>
              File System Access API is not supported in this browser. Fallback export mode will be
              used.
            </span>
          </div>
        )}
      </div>

      {/* 2. OAuth Credentials & Connector Component (FR-14) */}
      <OAuthSettings
        config={ws.config}
        onRegenerateCredentials={ws.handleRegenerateOAuthCredentials}
      />
    </div>
  );
}
