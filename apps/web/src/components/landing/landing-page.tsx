import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  FolderGit2,
  KeyRound,
  MessageSquare,
  ArrowRight,
  Lock,
  Database,
} from 'lucide-react';
import { getOrCreateUserId } from '../../lib/user-id';

export function LandingPage(): React.ReactElement {
  const navigate = useNavigate();

  const handleOpenDashboard = (): void => {
    const userId = getOrCreateUserId();
    navigate(`/${userId}`);
  };

  return (
    <div
      style={{
        background: 'var(--color-bg)',
        color: 'var(--color-text-primary)',
        minHeight: '100vh',
      }}
    >
      {/* Navigation Header */}
      <header className="navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span
            style={{
              fontWeight: 'var(--weight-bold)',
              fontSize: 'var(--text-lg)',
              letterSpacing: '-0.02em',
              textTransform: 'uppercase',
            }}
          >
            DashDraft /
          </span>
        </div>
        <button type="button" className="btn btn-solid" onClick={handleOpenDashboard}>
          Open Dashboard <ArrowRight size={16} />
        </button>
      </header>

      {/* Hero Section */}
      <section
        style={{
          maxWidth: '1000px',
          margin: '0 auto',
          padding: 'var(--space-20) var(--space-8) var(--space-16)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            padding: 'var(--space-2) var(--space-4)',
            borderRadius: 'var(--radius-full)',
            background: 'var(--color-accent-subtle)',
            color: 'var(--color-accent)',
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--weight-semibold)',
            marginBottom: 'var(--space-6)',
          }}
        >
          <Lock size={14} /> Zero Server-Side Retention &bull; In-Browser SQL Engine
        </div>

        <h1
          style={{
            fontSize: 'var(--text-4xl)',
            fontWeight: 'var(--weight-bold)',
            lineHeight: 'var(--leading-tight)',
            letterSpacing: '-0.03em',
            marginBottom: 'var(--space-6)',
          }}
        >
          Query your CSV data from ChatGPT & Gemini without sending raw rows to the cloud.
        </h1>

        <p
          style={{
            fontSize: 'var(--text-lg)',
            color: 'var(--color-text-secondary)',
            maxWidth: '680px',
            margin: '0 auto var(--space-8)',
            lineHeight: 'var(--leading-relaxed)',
          }}
        >
          DashDraft turns your local CSVs into an in-memory SQL database exposed as an MCP tool. Ask
          natural language questions with zero raw data retention and minimal token usage.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-4)' }}>
          <button
            type="button"
            className="btn btn-accent"
            onClick={handleOpenDashboard}
            style={{ padding: 'var(--space-4) var(--space-8)', fontSize: 'var(--text-base)' }}
          >
            Open Dashboard <ArrowRight size={18} />
          </button>
          <a
            href="#query-safety"
            className="btn btn-outline"
            style={{ padding: 'var(--space-4) var(--space-8)', fontSize: 'var(--text-base)' }}
          >
            Why Data Stays Local
          </a>
        </div>
      </section>

      {/* Simplified Architecture Diagram */}
      <section
        style={{
          maxWidth: '1100px',
          margin: '0 auto var(--space-20)',
          padding: '0 var(--space-8)',
        }}
      >
        <h2
          style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: 'var(--weight-bold)',
            textAlign: 'center',
            marginBottom: 'var(--space-8)',
          }}
        >
          How DashDraft Protects Your Data
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'var(--space-6)',
          }}
        >
          <div className="card" style={{ textAlign: 'center' }}>
            <div className="icon-badge" style={{ margin: '0 auto var(--space-4)' }}>
              <Database size={24} />
            </div>
            <h3 className="card-title">1. Your Browser</h3>
            <p className="card-subtitle">
              CSVs parse into in-memory SQLite (`sql.js`). Raw rows never leave your local machine.
            </p>
          </div>

          <div className="card" style={{ textAlign: 'center' }}>
            <div className="icon-badge" style={{ margin: '0 auto var(--space-4)' }}>
              <Lock size={24} />
            </div>
            <h3 className="card-title">2. DashDraft Relay</h3>
            <p className="card-subtitle">
              Stateless transit bridge with zero server payload logging or disk persistence.
            </p>
          </div>

          <div className="card" style={{ textAlign: 'center' }}>
            <div className="icon-badge" style={{ margin: '0 auto var(--space-4)' }}>
              <MessageSquare size={24} />
            </div>
            <h3 className="card-title">3. ChatGPT / Gemini</h3>
            <p className="card-subtitle">
              The AI platform receives only table schemas and query result subsets via MCP tool
              calls.
            </p>
          </div>
        </div>
      </section>

      {/* Step-by-Step Onboarding Implementation Guide */}
      <section
        style={{
          background: 'var(--color-bg-subtle)',
          padding: 'var(--space-16) var(--space-8)',
          borderTop: '1px solid var(--color-border)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2
            style={{
              fontSize: 'var(--text-3xl)',
              fontWeight: 'var(--weight-bold)',
              textAlign: 'center',
              marginBottom: 'var(--space-12)',
            }}
          >
            Get Started in 5 Simple Steps
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-10)' }}>
            {[
              {
                step: '01',
                title: 'Choose a Local Folder',
                desc: 'Select a local folder to store your `.dashdraft` configuration and persistent query logs.',
                icon: FolderGit2,
                gifAlt: 'GIF: selecting a local folder via the browser folder picker',
              },
              {
                step: '02',
                title: 'Generate OAuth Credentials',
                desc: 'Generate secure OAuth 2.1 client credentials to authenticate your AI platform connector.',
                icon: KeyRound,
                gifAlt: 'GIF: generating OAuth client credentials in Settings',
              },
              {
                step: '03',
                title: 'Connect MCP to ChatGPT or Gemini',
                desc: 'Add the DashDraft Relay MCP server endpoint to your AI platform settings.',
                icon: Lock,
                gifAlt: 'GIF: pasting MCP endpoint and authenticating in ChatGPT',
              },
              {
                step: '04',
                title: 'Upload CSV, TSV, or Excel Files',
                desc: 'Parse spreadsheets into local in-memory SQLite tables with automatic type detection and preview.',
                icon: Database,
                gifAlt: 'GIF: dropping sales CSV into schema preview modal',
              },
              {
                step: '05',
                title: 'Ask Your First Question',
                desc: 'Ask natural language questions in ChatGPT. Generated read-only SQL queries run locally.',
                icon: MessageSquare,
                gifAlt: 'GIF: asking ChatGPT a question and seeing local SQL execution result',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="card"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 'var(--space-8)',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 'var(--text-xs)',
                      fontWeight: 'var(--weight-bold)',
                      color: 'var(--color-accent)',
                      marginBottom: 'var(--space-2)',
                    }}
                  >
                    STEP {item.step}
                  </div>
                  <h3
                    style={{
                      fontSize: 'var(--text-xl)',
                      fontWeight: 'var(--weight-bold)',
                      marginBottom: 'var(--space-2)',
                    }}
                  >
                    {item.title}
                  </h3>
                  <p
                    style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-text-secondary)',
                      lineHeight: 'var(--leading-relaxed)',
                    }}
                  >
                    {item.desc}
                  </p>
                </div>

                {/* Static GIF Placeholder Container */}
                <div
                  style={{
                    aspectRatio: '16 / 9',
                    background: 'var(--color-bg)',
                    border: '1px dashed var(--color-border-strong)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 'var(--space-4)',
                    textAlign: 'center',
                  }}
                  title={item.gifAlt}
                >
                  <item.icon
                    size={28}
                    color="var(--color-text-tertiary)"
                    style={{ marginBottom: 'var(--space-2)' }}
                  />
                  <span
                    style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-text-tertiary)',
                      fontWeight: 'var(--weight-medium)',
                    }}
                  >
                    Preview coming soon
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Secondary CTA: Query Safety Explanation */}
      <section
        id="query-safety"
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: 'var(--space-20) var(--space-8)',
          textAlign: 'center',
        }}
      >
        <div className="surface-emphasis" style={{ textAlign: 'center' }}>
          <div className="icon-badge" style={{ margin: '0 auto var(--space-4)' }}>
            <ShieldCheck size={28} />
          </div>
          <h2
            style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: 'var(--weight-bold)',
              marginBottom: 'var(--space-4)',
            }}
          >
            Built-In Read-Only & Query Guardrails
          </h2>
          <p
            style={{
              fontSize: 'var(--text-sm)',
              lineHeight: 'var(--leading-relaxed)',
              maxWidth: '640px',
              margin: '0 auto var(--space-6)',
              opacity: 0.9,
            }}
          >
            DashDraft unconditionally blocks `SELECT * FROM table` queries, rejects data-modifying
            SQL statements (`INSERT`, `UPDATE`, `DELETE`, `DROP`), enforces strict row limits, and
            lets you hash or exclude sensitive columns before query execution.
          </p>
          <button type="button" className="btn btn-solid" onClick={handleOpenDashboard}>
            Launch Local Dashboard
          </button>
        </div>
      </section>
    </div>
  );
}
