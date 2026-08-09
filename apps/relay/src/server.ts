import http from 'node:http';
import express, { type Express } from 'express';
import cors from 'cors';
import { getEnv } from './env';
import { handleAuthorize, handleToken, requireAuth } from './auth/oauth';
import { handleSseConnect, handleSseMessage } from './mcp/server';
import { setupWebSocketBridge } from './bridge/ws-server';
import { errorHandler } from './middleware/error-handler';

export function createApp(): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // OAuth 2.1 routes
  app.get('/oauth/authorize', handleAuthorize);
  app.post('/oauth/token', handleToken);

  // Protected MCP endpoints
  app.get('/mcp/sse', requireAuth, handleSseConnect);
  app.post('/mcp/messages', requireAuth, handleSseMessage);

  // Global Error Handler
  app.use(errorHandler);

  return app;
}

export function startServer(): { server: http.Server; app: Express } {
  const env = getEnv();
  const app = createApp();
  const server = http.createServer(app);

  setupWebSocketBridge(server);

  server.listen(env.PORT, () => {
    console.log(`[DashDraft Relay] Server running on http://localhost:${env.PORT}`);
    console.log(
      `[DashDraft Relay] WebSocket Bridge listening on ws://localhost:${env.PORT}/ws/session`
    );
  });

  return { server, app };
}

// Start server if run directly
if (process.env['NODE_ENV'] !== 'test') {
  startServer();
}
