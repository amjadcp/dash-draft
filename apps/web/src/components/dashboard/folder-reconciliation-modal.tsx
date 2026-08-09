import React from 'react';
import { FolderGit2, AlertTriangle } from 'lucide-react';
import type { Config } from '@repo/mcp-contracts';

export interface FolderReconciliationModalProps {
  existingConfig: Config;
  currentUserId: string;
  onAdoptProfile: (config: Config) => void;
  onCancel: () => void;
}

export function FolderReconciliationModal({
  existingConfig,
  currentUserId,
  onAdoptProfile,
  onCancel,
}: FolderReconciliationModalProps): React.ReactElement {
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
          maxWidth: '520px',
          width: '100%',
          background: 'var(--color-bg)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
          padding: 'var(--space-8)',
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
          <div className="icon-badge" style={{ width: '44px', height: '44px' }}>
            <AlertTriangle size={20} color="var(--color-warning)" />
          </div>
          <div>
            <h2 className="card-title" style={{ fontSize: 'var(--text-lg)', margin: 0 }}>
              Existing Profile Detected
            </h2>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
              Folder already contains DashDraft configuration
            </span>
          </div>
        </div>

        <p
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-secondary)',
            marginBottom: 'var(--space-6)',
            lineHeight: 'var(--leading-relaxed)',
          }}
        >
          This folder is already set up for DashDraft profile{' '}
          <code style={{ color: 'var(--color-accent)' }}>{existingConfig.customerId}</code>. Your
          browser is currently set to profile <code>{currentUserId}</code>.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <button
            type="button"
            className="btn btn-solid"
            onClick={() => onAdoptProfile(existingConfig)}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <FolderGit2 size={16} /> Load Profile &amp; Switch Browser to{' '}
            {existingConfig.customerId.substring(0, 10)}...
          </button>

          <button
            type="button"
            className="btn btn-outline"
            onClick={onCancel}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            Cancel &amp; Select Different Folder
          </button>
        </div>
      </div>
    </div>
  );
}
