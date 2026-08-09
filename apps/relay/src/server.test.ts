import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from './server';

describe('Relay Express Server API', () => {
  const app = createApp();

  it('GET /health returns status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.timestamp).toBeDefined();
  });

  it('POST /oauth/token rejects invalid grant_type', async () => {
    const res = await request(app).post('/oauth/token').send({
      grant_type: 'invalid_grant',
    });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('INVALID_INPUT');
  });

  it('POST /oauth/token succeeds with client_credentials grant', async () => {
    const res = await request(app).post('/oauth/token').send({
      grant_type: 'client_credentials',
      client_id: 'dd_client_default',
      client_secret: 'dd_secret_default',
    });
    expect(res.status).toBe(200);
    expect(res.body.access_token).toBeDefined();
    expect(res.body.token_type).toBe('Bearer');
  });

  it('GET /mcp/sse rejects unauthorized request without Bearer token', async () => {
    const res = await request(app).get('/mcp/sse');
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('UNAUTHORIZED');
  });

  it('GET /mcp/sse accepts authorized Bearer token', async () => {
    // 1. Get token
    const tokenRes = await request(app).post('/oauth/token').send({
      grant_type: 'client_credentials',
      client_id: 'dd_client_default',
      client_secret: 'dd_secret_default',
    });
    const token = tokenRes.body.access_token;

    // 2. Request /mcp/sse without sessionId should return 400
    const res = await request(app).get('/mcp/sse').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('INVALID_SESSION');
  });
});
