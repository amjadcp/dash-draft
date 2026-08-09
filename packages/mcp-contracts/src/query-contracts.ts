import { z } from 'zod';

export const QueryToolInputSchema = z.object({
  sql: z
    .string()
    .min(1, 'SQL query cannot be empty')
    .describe(
      'The SQL SELECT query to run against the in-memory database. Must be a read-only SELECT query with explicit column selection. SELECT * and data modifications (INSERT/UPDATE/DELETE/DROP) are strictly prohibited.'
    ),
  prompt: z
    .string()
    .optional()
    .describe('The natural language question or context for this query.'),
});

export type QueryToolInput = z.infer<typeof QueryToolInputSchema>;

export const QueryToolResultSchema = z.object({
  columns: z.array(z.string()),
  rows: z.array(z.record(z.string(), z.unknown())),
  rowCount: z.number().int().nonnegative(),
  durationMs: z.number().nonnegative(),
  truncated: z.boolean().default(false),
});

export type QueryToolResult = z.infer<typeof QueryToolResultSchema>;

export const SchemaToolOutputSchema = z.object({
  tables: z.array(
    z.object({
      name: z.string(),
      columns: z.array(
        z.object({
          name: z.string(),
          type: z.string(),
          privacyPolicy: z.enum(['visible', 'hashed']),
        })
      ),
      relationships: z.array(
        z.object({
          targetTable: z.string(),
          sourceColumn: z.string(),
          targetColumn: z.string(),
        })
      ),
    })
  ),
});

export type SchemaToolOutput = z.infer<typeof SchemaToolOutputSchema>;
