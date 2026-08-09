import { z } from 'zod';

export const ColumnPrivacyPolicySchema = z.enum(['visible', 'hashed', 'excluded']);
export type ColumnPrivacyPolicy = z.infer<typeof ColumnPrivacyPolicySchema>;

export const ColumnMetaSchema = z.object({
  name: z.string(),
  type: z.string(),
  privacyPolicy: ColumnPrivacyPolicySchema.default('visible'),
});
export type ColumnMeta = z.infer<typeof ColumnMetaSchema>;

export const RelationshipMetaSchema = z.object({
  id: z.string(),
  workspaceId: z.string().default('default'),
  sourceTableId: z.string(),
  sourceColumn: z.string(),
  targetTableId: z.string(),
  targetColumn: z.string(),
});
export type RelationshipMeta = z.infer<typeof RelationshipMetaSchema>;

export const TableMetaSchema = z.object({
  id: z.string(),
  workspaceId: z.string().default('default'),
  name: z.string(),
  rowCount: z.number().int().nonnegative(),
  columns: z.array(ColumnMetaSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type TableMeta = z.infer<typeof TableMetaSchema>;

export const QueryLogEntrySchema = z.object({
  id: z.string(),
  workspaceId: z.string().default('default'),
  timestamp: z.string(),
  prompt: z.string().optional(),
  sql: z.string(),
  status: z.enum(['success', 'error', 'rejected']),
  rowsReturned: z.number().int().nonnegative().optional(),
  durationMs: z.number().nonnegative().optional(),
  errorMessage: z.string().optional(),
});
export type QueryLogEntry = z.infer<typeof QueryLogEntrySchema>;

export const WorkspaceMetaSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.string(),
});
export type WorkspaceMeta = z.infer<typeof WorkspaceMetaSchema>;

export const ConfigSchema = z.object({
  customerId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  oauth: z.object({
    clientId: z.string(),
    clientSecret: z.string(),
    generatedAt: z.string(),
  }),
  preferences: z.object({
    theme: z.enum(['light', 'dark', 'system']).default('system'),
    mcpHandshakeConfirmed: z.boolean().default(false),
  }),
  workspaces: z
    .array(WorkspaceMetaSchema)
    .default([{ id: 'default', name: 'Default Workspace', createdAt: new Date().toISOString() }]),
});
export type Config = z.infer<typeof ConfigSchema>;
