import React, { useState } from 'react';
import { KeyRound, RefreshCw, AlertTriangle, Eye, EyeOff, Check, Copy } from 'lucide-react';
import type { Config } from '@repo/mcp-contracts';
import { generateNanoid } from '../../lib/user-id';

export interface OAuthSettingsProps {
  config: Config | null;
  onRegenerateCredentials: (newClientId: string, newClientSecret: string) => Promise<void>;
}

export function OAuthSettings({
  config,
  onRegenerateCredentials,
}: OAuthSettingsProps): React.ReactElement {
  const [showSecret, setShowSecret] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<'client_id' | 'client_secret' | null>(null);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);

  const clientId = config?.oauth?.clientId || 'N/A';
  const clientSecret = config?.oauth?.clientSecret || 'N/A';

  const handleCopy = (text: string, field: 'client_id' | 'client_secret'): void => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const handleConfirmRegenerate = async (): Promise<void> => {
    setIsRegenerating(true);
    try {
      const newClientId = `dd_client_${generateNanoid(16)}`;
      const newClientSecret = `dd_secret_${generateNanoid(32)}`;
      await onRegenerateCredentials(newClientId, newClientSecret);
      setShowConfirmModal(false);
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
          marginBottom: 'var(--space-4)',
        }}
      >
        <div className="icon-badge" style={{ width: '40px', height: '40px' }}>
          <KeyRound size={20} />
        </div>
        <div>
          <h2 className="card-title" style={{ fontSize: 'var(--text-lg)', margin: 0 }}>
            MCP Connector Credentials
          </h2>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
            OAuth 2.1 credentials required when registering DashDraft in ChatGPT or Gemini
          </span>
        </div>
      </div>

      {/* Client ID */}
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <label
          style={{
            display: 'block',
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--weight-semibold)',
            color: 'var(--color-text-secondary)',
            marginBottom: 'var(--space-1)',
          }}
        >
          OAuth Client ID
        </label>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <input
            type="text"
            readOnly
            value={clientId}
            style={{
              flex: 1,
              padding: 'var(--space-2) var(--space-3)',
              fontSize: 'var(--text-xs)',
              fontFamily: 'var(--font-mono)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-bg-subtle)',
              color: 'var(--color-text-primary)',
            }}
          />
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => handleCopy(clientId, 'client_id')}
            style={{ padding: 'var(--space-2) var(--space-3)' }}
          >
            {copiedField === 'client_id' ? (
              <Check size={14} color="var(--color-success)" />
            ) : (
              <Copy size={14} />
            )}
          </button>
        </div>
      </div>

      {/* Client Secret */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <label
          style={{
            display: 'block',
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--weight-semibold)',
            color: 'var(--color-text-secondary)',
            marginBottom: 'var(--space-1)',
          }}
        >
          OAuth Client Secret
        </label>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <input
            type={showSecret ? 'text' : 'password'}
            readOnly
            value={clientSecret}
            style={{
              flex: 1,
              padding: 'var(--space-2) var(--space-3)',
              fontSize: 'var(--text-xs)',
              fontFamily: 'var(--font-mono)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-bg-subtle)',
              color: 'var(--color-text-primary)',
            }}
          />
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setShowSecret(!showSecret)}
            style={{ padding: 'var(--space-2) var(--space-3)' }}
            title={showSecret ? 'Hide secret' : 'Show secret'}
          >
            {showSecret ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => handleCopy(clientSecret, 'client_secret')}
            style={{ padding: 'var(--space-2) var(--space-3)' }}
          >
            {copiedField === 'client_secret' ? (
              <Check size={14} color="var(--color-success)" />
            ) : (
              <Copy size={14} />
            )}
          </button>
        </div>
      </div>

      {/* Regenerate Action Button */}
      <button
        type="button"
        className="btn btn-outline"
        onClick={() => setShowConfirmModal(true)}
        style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
      >
        <RefreshCw size={14} /> Regenerate Connector Credentials
      </button>

      {/* Confirmation Modal (FR-14) */}
      {showConfirmModal && (
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
              maxWidth: '500px',
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
                <AlertTriangle size={20} color="var(--color-danger)" />
              </div>
              <div>
                <h3 className="card-title" style={{ fontSize: 'var(--text-lg)', margin: 0 }}>
                  Regenerate Credentials?
                </h3>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
                  This action immediately revokes existing credentials
                </span>
              </div>
            </div>

            <p
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-secondary)',
                lineHeight: 'var(--leading-relaxed)',
                marginBottom: 'var(--space-6)',
              }}
            >
              Regenerating credentials will immediately invalidate the current Client ID and Secret.
              Any AI platform connector (ChatGPT or Gemini) using the old credentials will stop
              working until reconnected with the new credentials.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowConfirmModal(false)}
                disabled={isRegenerating}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-solid"
                onClick={handleConfirmRegenerate}
                disabled={isRegenerating}
                style={{ background: 'var(--color-danger)', color: '#fff' }}
              >
                {isRegenerating ? 'Regenerating...' : 'Regenerate Credentials'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
