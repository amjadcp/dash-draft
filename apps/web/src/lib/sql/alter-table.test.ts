import { describe, expect, it } from 'vitest';
import { cascadeRenameTableInMetadata, cascadeRenameColumnInMetadata } from './alter-table';
import type { TableMeta, RelationshipMeta } from '@repo/mcp-contracts';
import type { ColumnPrivacyConfig } from '../query/privacy';

describe('Table & Column Rename Cascading (FR-6)', () => {
  const initialTableMeta: TableMeta = {
    id: 'tbl_orders',
    workspaceId: 'default',
    name: 'orders',
    rowCount: 100,
    columns: [
      { name: 'order_id', type: 'number', privacyPolicy: 'visible' },
      { name: 'cust_id', type: 'number', privacyPolicy: 'hashed' },
    ],
    createdAt: '2026-08-09T12:00:00Z',
    updatedAt: '2026-08-09T12:00:00Z',
  };

  const initialRelationships: RelationshipMeta[] = [
    {
      id: 'rel_1',
      workspaceId: 'default',
      sourceTableId: 'tbl_orders',
      sourceColumn: 'cust_id',
      targetTableId: 'tbl_customers',
      targetColumn: 'id',
    },
  ];

  const initialPrivacyConfigs: ColumnPrivacyConfig[] = [
    { columnName: 'cust_id', policy: 'hashed' },
  ];

  it('cascades table rename to metadata and relationships', () => {
    const { updatedTableMeta, updatedRelationships } = cascadeRenameTableInMetadata(
      initialTableMeta,
      initialRelationships,
      'sales_orders'
    );

    expect(updatedTableMeta.name).toBe('sales_orders');
    expect(updatedRelationships[0]!.sourceTableId).toBe('sales_orders');
  });

  it('cascades column rename to table columns, privacy configs, and relationships', () => {
    const { updatedTableMeta, updatedPrivacyConfigs, updatedRelationships } =
      cascadeRenameColumnInMetadata(
        initialTableMeta,
        initialPrivacyConfigs,
        initialRelationships,
        'cust_id',
        'customer_id'
      );

    expect(updatedTableMeta.columns[1]!.name).toBe('customer_id');
    expect(updatedPrivacyConfigs[0]!.columnName).toBe('customer_id');
    expect(updatedRelationships[0]!.sourceColumn).toBe('customer_id');
  });
});
