import type { Server } from 'node:http';
import { WebSocketServer, type WebSocket } from 'ws';
import { SessionHandshakeSchema, BridgeResponseSchema } from '@repo/mcp-contracts';
import { globalSessionManager, SessionManager } from './session-manager';

export function setupWebSocketBridge(
  server: Server,
  sessionManager: SessionManager = globalSessionManager
): WebSocketServer {
  const wss = new WebSocketServer({ server, path: '/ws/session' });

  wss.on('connection', (ws: WebSocket) => {
    let currentSessionId: string | null = null;

    console.log('[Bridge WS] New WebSocket client connected');

    ws.on('message', (data: Buffer | string) => {
      try {
        const rawMessage = data.toString();
        const json = JSON.parse(rawMessage) as Record<string, unknown>;

        // Check if message is Session Handshake
        if (json['type'] === 'SESSION_INIT') {
          const parseResult = SessionHandshakeSchema.safeParse(json);
          if (parseResult.success) {
            currentSessionId = parseResult.data.sessionId;
            sessionManager.registerSession(currentSessionId, ws);
            ws.send(
              JSON.stringify({
                type: 'SESSION_STATUS',
                sessionId: currentSessionId,
                connected: true,
                mcpHandshakeConfirmed: false,
                timestamp: new Date().toISOString(),
              })
            );
          }
          return;
        }

        // Check if message is Bridge Response (MCP Tool Result)
        if (json['type'] === 'MCP_TOOL_RESULT') {
          const responseResult = BridgeResponseSchema.safeParse(json);
          if (responseResult.success) {
            sessionManager.handleBridgeResponse(responseResult.data);
          }
          return;
        }
      } catch (err) {
        console.error('[Bridge WS] Error parsing incoming WebSocket message:', err);
      }
    });

    ws.on('close', () => {
      if (currentSessionId) {
        console.log(`[Bridge WS] Client disconnected for sessionId: ${currentSessionId}`);
        sessionManager.removeSession(currentSessionId);
      }
    });

    ws.on('error', (err) => {
      console.error('[Bridge WS] Socket error:', err);
      if (currentSessionId) {
        sessionManager.removeSession(currentSessionId);
      }
    });
  });

  return wss;
}
