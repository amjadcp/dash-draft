import React, { useState } from 'react';
import { GitFork, Plus, Trash2 } from 'lucide-react';
import type { TableMeta, RelationshipMeta } from '@repo/mcp-contracts';
import { generateNanoid } from '../../lib/user-id';

export interface RelationshipBuilderProps {
  allTables: TableMeta[];
  relationships: RelationshipMeta[];
  onSaveRelationships: (relationships: RelationshipMeta[]) => void;
}

export function RelationshipBuilder({
  allTables,
  relationships,
  onSaveRelationships,
}: RelationshipBuilderProps): React.ReactElement {
  const [sourceTableId, setSourceTableId] = useState<string>(allTables[0]?.id || '');
  const [sourceColumn, setSourceColumn] = useState<string>('');
  const [targetTableId, setTargetTableId] = useState<string>('');
  const [targetColumn, setTargetColumn] = useState<string>('');

  const sourceTable = allTables.find((t) => t.id === sourceTableId);
  const targetTable = allTables.find((t) => t.id === targetTableId);

  const handleAddRelationship = (): void => {
    if (!sourceTableId || !sourceColumn || !targetTableId || !targetColumn) return;
    if (sourceTableId === targetTableId && sourceColumn === targetColumn) return;

    const newRel: RelationshipMeta = {
      id: `rel_${generateNanoid(12)}`,
      workspaceId: 'default',
      sourceTableId,
      sourceColumn,
      targetTableId,
      targetColumn,
    };

    onSaveRelationships([...relationships, newRel]);

    // Reset inputs
    setSourceColumn('');
    setTargetColumn('');
  };

  const handleRemoveRelationship = (relId: string): void => {
    onSaveRelationships(relationships.filter((r) => r.id !== relId));
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
        <div className="icon-badge" style={{ width: '36px', height: '36px' }}>
          <GitFork size={18} />
        </div>
        <div>
          <h3 className="card-title" style={{ fontSize: 'var(--text-base)', margin: 0 }}>
            Table Relationships (Foreign Keys)
          </h3>
          <p className="card-subtitle" style={{ fontSize: 'var(--text-xs)', margin: 0 }}>
            Declare relationships to enable automated SQL JOIN generation for AI queries.
          </p>
        </div>
      </div>

      {/* Add New Relationship Form */}
      {allTables.length >= 2 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr 1fr auto',
            gap: 'var(--space-2)',
            alignItems: 'center',
            background: 'var(--color-bg-subtle)',
            padding: 'var(--space-3)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: 'var(--space-4)',
          }}
        >
          {/* Source Table */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-secondary)',
                marginBottom: '2px',
              }}
            >
              Source Table
            </label>
            <select
              value={sourceTableId}
              onChange={(e) => {
                setSourceTableId(e.target.value);
                setSourceColumn('');
              }}
              style={{
                width: '100%',
                padding: 'var(--space-1) var(--space-2)',
                fontSize: 'var(--text-xs)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-bg)',
              }}
            >
              {allTables.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Source Column */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-secondary)',
                marginBottom: '2px',
              }}
            >
              Source Column
            </label>
            <select
              value={sourceColumn}
              onChange={(e) => setSourceColumn(e.target.value)}
              style={{
                width: '100%',
                padding: 'var(--space-1) var(--space-2)',
                fontSize: 'var(--text-xs)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-bg)',
              }}
            >
              <option value="">Select column...</option>
              {sourceTable?.columns.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Target Table */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-secondary)',
                marginBottom: '2px',
              }}
            >
              Target Table
            </label>
            <select
              value={targetTableId}
              onChange={(e) => {
                setTargetTableId(e.target.value);
                setTargetColumn('');
              }}
              style={{
                width: '100%',
                padding: 'var(--space-1) var(--space-2)',
                fontSize: 'var(--text-xs)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-bg)',
              }}
            >
              <option value="">Select target table...</option>
              {allTables
                .filter((t) => t.id !== sourceTableId)
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Target Column */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-secondary)',
                marginBottom: '2px',
              }}
            >
              Target Column
            </label>
            <select
              value={targetColumn}
              onChange={(e) => setTargetColumn(e.target.value)}
              style={{
                width: '100%',
                padding: 'var(--space-1) var(--space-2)',
                fontSize: 'var(--text-xs)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-bg)',
              }}
            >
              <option value="">Select column...</option>
              {targetTable?.columns.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Add Action Button */}
          <div style={{ paddingTop: '16px' }}>
            <button
              type="button"
              className="btn btn-accent"
              disabled={!sourceTableId || !sourceColumn || !targetTableId || !targetColumn}
              onClick={handleAddRelationship}
              style={{ padding: 'var(--space-1) var(--space-3)' }}
            >
              <Plus size={14} /> Add
            </button>
          </div>
        </div>
      ) : (
        <p
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-tertiary)',
            marginBottom: 'var(--space-4)',
          }}
        >
          Create at least two tables to define foreign key relationships.
        </p>
      )}

      {/* Relationship List Table */}
      {relationships.length > 0 && (
        <div
          style={{
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            overflow: 'hidden',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-xs)' }}>
            <thead>
              <tr
                style={{
                  background: 'var(--color-bg-subtle)',
                  borderBottom: '1px solid var(--color-border)',
                  textAlign: 'left',
                }}
              >
                <th style={{ padding: 'var(--space-2) var(--space-3)' }}>Source</th>
                <th style={{ padding: 'var(--space-2) var(--space-3)' }}>Relationship</th>
                <th style={{ padding: 'var(--space-2) var(--space-3)' }}>Target</th>
                <th style={{ padding: 'var(--space-2) var(--space-3)', width: '40px' }}></th>
              </tr>
            </thead>
            <tbody>
              {relationships.map((rel) => (
                <tr key={rel.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td
                    style={{
                      padding: 'var(--space-2) var(--space-3)',
                      fontWeight: 'var(--weight-medium)',
                    }}
                  >
                    <code>{rel.sourceTableId}</code>.<code>{rel.sourceColumn}</code>
                  </td>
                  <td
                    style={{
                      padding: 'var(--space-2) var(--space-3)',
                      color: 'var(--color-accent)',
                      fontWeight: 'var(--weight-semibold)',
                    }}
                  >
                    &rarr; REFERENCES &rarr;
                  </td>
                  <td
                    style={{
                      padding: 'var(--space-2) var(--space-3)',
                      fontWeight: 'var(--weight-medium)',
                    }}
                  >
                    <code>{rel.targetTableId}</code>.<code>{rel.targetColumn}</code>
                  </td>
                  <td style={{ padding: 'var(--space-2) var(--space-3)', textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => handleRemoveRelationship(rel.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-danger)',
                        cursor: 'pointer',
                      }}
                      title="Remove relationship"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
