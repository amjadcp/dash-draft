import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  FolderGit2,
  KeyRound,
  Radio,
  Database,
  MessageSquare,
} from 'lucide-react';
import type { Config } from '@repo/mcp-contracts';

export interface OnboardingChecklistProps {
  dirHandle: FileSystemDirectoryHandle | null;
  config: Config | null;
  mcpHandshakeConfirmed: boolean;
  tableCount: number;
  queryLogCount: number;
  onOpenFolderPicker: () => void;
  onNavigateToSettings: () => void;
}

export function OnboardingChecklist({
  dirHandle,
  config,
  mcpHandshakeConfirmed,
  tableCount,
  queryLogCount,
  onOpenFolderPicker,
  onNavigateToSettings,
}: OnboardingChecklistProps): React.ReactElement {
  // Live state derivations (FR-4)
  const isStep1Done = dirHandle !== null;
  const isStep2Done = Boolean(config?.oauth?.clientId && config?.oauth?.clientSecret);
  const isStep3Done = mcpHandshakeConfirmed || Boolean(config?.preferences?.mcpHandshakeConfirmed);
  const isStep4Done = tableCount > 0;
  const isStep5Done = queryLogCount > 0;

  const completedCount = [isStep1Done, isStep2Done, isStep3Done, isStep4Done, isStep5Done].filter(
    Boolean
  ).length;
  const isAllComplete = completedCount === 5;

  const [isCollapsed, setIsCollapsed] = useState<boolean>(isAllComplete);

  const steps = [
    {
      id: 1,
      title: 'Choose local folder to store data',
      done: isStep1Done,
      icon: FolderGit2,
      actionLabel: 'Select Folder',
      onAction: onOpenFolderPicker,
    },
    {
      id: 2,
      title: 'Generate OAuth key & secret',
      done: isStep2Done,
      icon: KeyRound,
      actionLabel: 'Open Settings',
      onAction: onNavigateToSettings,
    },
    {
      id: 3,
      title: 'Connect MCP with Gemini or ChatGPT',
      done: isStep3Done,
      icon: Radio,
      actionLabel: isStep3Done ? 'Connected' : 'Awaiting Connection',
      onAction: undefined,
    },
    {
      id: 4,
      title: 'Upload first CSV / TSV / Excel file',
      done: isStep4Done,
      icon: Database,
      actionLabel: 'Import File',
      onAction: undefined,
    },
    {
      id: 5,
      title: 'First prompting (Execute natural language query)',
      done: isStep5Done,
      icon: MessageSquare,
      actionLabel: 'Ask AI',
      onAction: undefined,
    },
  ];

  if (isCollapsed) {
    return (
      <div
        className="card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--space-3) var(--space-4)',
          marginBottom: 'var(--space-6)',
          background: 'var(--color-bg-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <Sparkles size={18} color="var(--color-accent)" />
          <span
            style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--weight-medium)',
              color: 'var(--color-text-primary)',
            }}
          >
            Setup Progress: {completedCount} / 5 steps complete
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsCollapsed(false)}
          className="btn btn-outline"
          style={{ padding: 'var(--space-1) var(--space-3)', fontSize: 'var(--text-xs)' }}
        >
          {isAllComplete ? 'Review Setup' : 'Expand Setup Checklist'} <ChevronDown size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--space-4)',
        }}
      >
        <div>
          <h2 className="card-title" style={{ fontSize: 'var(--text-lg)', margin: 0 }}>
            Onboarding Checklist
          </h2>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
            Complete setup to query your local data via ChatGPT / Gemini
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsCollapsed(true)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-text-secondary)',
          }}
          title="Collapse checklist"
        >
          <ChevronUp size={18} />
        </button>
      </div>

      {/* Progress Bar */}
      <div
        style={{
          background: 'var(--color-border)',
          height: '6px',
          borderRadius: 'var(--radius-full)',
          marginBottom: 'var(--space-6)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${(completedCount / 5) * 100}%`,
            height: '100%',
            background: 'var(--color-accent)',
            transition: 'width 300ms ease',
          }}
        />
      </div>

      {/* Steps List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {steps.map((step) => {
          const StepIcon = step.icon;
          return (
            <div
              key={step.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--space-3) var(--space-4)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                background: step.done ? 'var(--color-bg-subtle)' : 'var(--color-bg)',
                opacity: step.done ? 0.85 : 1,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                {step.done ? (
                  <CheckCircle2 size={20} color="var(--color-success)" />
                ) : (
                  <Circle size={20} color="var(--color-text-tertiary)" />
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <StepIcon size={16} color="var(--color-text-secondary)" />
                  <span
                    style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--weight-medium)',
                      color: step.done
                        ? 'var(--color-text-secondary)'
                        : 'var(--color-text-primary)',
                      textDecoration: step.done ? 'line-through' : 'none',
                    }}
                  >
                    {step.title}
                  </span>
                </div>
              </div>

              {step.onAction && !step.done && (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={step.onAction}
                  style={{ padding: 'var(--space-1) var(--space-3)', fontSize: 'var(--text-xs)' }}
                >
                  {step.actionLabel}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
