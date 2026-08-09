import { describe, expect, it } from 'vitest';
import {
  ErrorEnvelopeSchema,
  OAuthTokenRequestSchema,
  QueryToolInputSchema,
  QueryToolResultSchema,
  ConfigSchema,
  createErrorEnvelope,
} from './index';

describe('mcp-contracts', () => {
  it('validates ErrorEnvelope correctly', () => {
    const error = createErrorEnvelope('QUERY_REJECTED', 'SELECT * is not permitted', {
      reason: 'explicit columns required',
    });
    const parsed = ErrorEnvelopeSchema.safeParse(error);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.code).toBe('QUERY_REJECTED');
      expect(parsed.data.message).toBe('SELECT * is not permitted');
    }
  });

  it('validates OAuthTokenRequest for PKCE grant', () => {
    const req = {
      grant_type: 'authorization_code',
      code: 'auth_code_123',
      client_id: 'dd_client_xyz',
      redirect_uri: 'https://chat.openai.com/oauth/callback',
      code_verifier: 'verifier_abc_123',
    };
    const parsed = OAuthTokenRequestSchema.safeParse(req);
    expect(parsed.success).toBe(true);
  });

  it('validates QueryToolInput Schema description requirement', () => {
    const input = {
      sql: 'SELECT id, name FROM sales_data WHERE amount > 100',
      prompt: 'Show me sales over 100',
    };
    const parsed = QueryToolInputSchema.safeParse(input);
    expect(parsed.success).toBe(true);
  });

  it('validates QueryToolResult Schema structure', () => {
    const result = {
      columns: ['id', 'name'],
      rows: [{ id: 1, name: 'Alice' }],
      rowCount: 1,
      durationMs: 12.5,
      truncated: false,
    };
    const parsed = QueryToolResultSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it('validates ConfigSchema defaults', () => {
    const configData = {
      customerId: 'usr_nanoid21charssample',
      createdAt: '2026-08-09T12:00:00Z',
      updatedAt: '2026-08-09T12:00:00Z',
      oauth: {
        clientId: 'dd_client_123',
        clientSecret: 'secret_456',
        generatedAt: '2026-08-09T12:00:00Z',
      },
      preferences: {
        theme: 'dark',
        mcpHandshakeConfirmed: true,
      },
      workspaces: [
        {
          id: 'default',
          name: 'Default Workspace',
          createdAt: '2026-08-09T12:00:00Z',
        },
      ],
    };
    const parsed = ConfigSchema.safeParse(configData);
    expect(parsed.success).toBe(true);
  });
});
