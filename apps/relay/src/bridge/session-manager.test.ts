import { describe, expect, it, vi } from 'vitest';
import { SessionManager } from './session-manager';
import type { WebSocket } from 'ws';
import type { BridgeRequest, BridgeResponse } from '@repo/mcp-contracts';

describe('SessionManager (Bridge Security)', () => {
  it('registers and removes sessions cleanly', () => {
    const manager = new SessionManager();
    const mockWs = { readyState: 1, send: vi.fn() } as unknown as WebSocket;

    manager.registerSession('sess_123', mockWs);
    expect(manager.getActiveSessionCount()).toBe(1);
    expect(manager.getSession('sess_123')).toBe(mockWs);

    manager.removeSession('sess_123');
    expect(manager.getActiveSessionCount()).toBe(0);
    expect(manager.getSession('sess_123')).toBeUndefined();
  });

  it('rejects bridge request if session is not active', async () => {
    const manager = new SessionManager();
    const request: BridgeRequest = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      type: 'MCP_TOOL_CALL',
      sessionId: 'inactive_session',
      ciphertext: 'opaque_ciphertext',
      iv: 'iv_123',
      timestamp: new Date().toISOString(),
    };

    await expect(manager.sendBridgeRequest('inactive_session', request)).rejects.toThrow(
      'No active WebSocket session found for sessionId: inactive_session'
    );
  });

  it('forwards bridge request and resolves when matching response arrives', async () => {
    const manager = new SessionManager();
    const reqId = '550e8400-e29b-41d4-a716-446655440000';
    const mockWs = {
      readyState: 1,
      send: vi.fn((data, callback: (err?: Error) => void) => callback()),
    } as unknown as WebSocket;

    manager.registerSession('sess_456', mockWs);

    const request: BridgeRequest = {
      id: reqId,
      type: 'MCP_TOOL_CALL',
      sessionId: 'sess_456',
      ciphertext: 'opaque_ciphertext',
      iv: 'iv_123',
      timestamp: new Date().toISOString(),
    };

    const promise = manager.sendBridgeRequest('sess_456', request);

    const response: BridgeResponse = {
      id: reqId,
      type: 'MCP_TOOL_RESULT',
      status: 'success',
      ciphertext: 'opaque_result_ciphertext',
      iv: 'iv_result',
      timestamp: new Date().toISOString(),
    };

    const handled = manager.handleBridgeResponse(response);
    expect(handled).toBe(true);

    const result = await promise;
    expect(result).toEqual(response);
  });
});
