import type { Request, Response } from 'express';
import { Server as McpServer } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { QueryToolInputSchema, createErrorEnvelope } from '@repo/mcp-contracts';
import { globalSessionManager, SessionManager } from '../bridge/session-manager';
import crypto from 'node:crypto';

export function createMcpServer(sessionManager: SessionManager = globalSessionManager): McpServer {
  const server = new McpServer(
    {
      name: 'dash-draft-relay',
      version: '0.1.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Register tool list
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'query_database',
          description:
            'Execute a read-only SQL SELECT query against the user in-memory SQLite database. Prohibited: SELECT * and data modifications (INSERT/UPDATE/DELETE/DROP).',
          inputSchema: {
            type: 'object',
            properties: {
              sql: {
                type: 'string',
                description: 'The read-only SQL SELECT query with explicit column selection.',
              },
              prompt: {
                type: 'string',
                description: 'The natural language prompt context.',
              },
            },
            required: ['sql'],
          },
        },
        {
          name: 'get_schema',
          description:
            'Retrieve the schema (tables, columns, types, privacy policies) of the user in-memory database.',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
      ],
    };
  });

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request, extra) => {
    const toolName = request.params.name;
    const sessionId = (extra as { sessionId?: string })?.sessionId;

    if (!sessionId) {
      throw new Error('Missing active session ID for MCP tool execution');
    }

    if (toolName === 'query_database') {
      const parseResult = QueryToolInputSchema.safeParse(request.params.arguments);
      if (!parseResult.success) {
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                createErrorEnvelope('INVALID_INPUT', 'Invalid SQL query tool input parameters')
              ),
            },
          ],
        };
      }

      // Format payload as opaque JSON string to be encrypted client-side or sent down bridge
      const rawPayload = JSON.stringify({
        tool: 'query_database',
        arguments: parseResult.data,
      });

      // Pass through bridge as opaque ciphertext payload container
      const requestId = crypto.randomUUID();
      const bridgeResponse = await sessionManager.sendBridgeRequest(sessionId, {
        id: requestId,
        type: 'MCP_TOOL_CALL',
        sessionId,
        ciphertext: Buffer.from(rawPayload).toString('base64'), // Bridge payload transfer frame
        iv: Buffer.from(crypto.randomBytes(12)).toString('base64'),
        timestamp: new Date().toISOString(),
      });

      if (bridgeResponse.status === 'error') {
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: JSON.stringify(bridgeResponse.error),
            },
          ],
        };
      }

      // Decode payload container (browser result)
      const decodedResult = Buffer.from(bridgeResponse.ciphertext, 'base64').toString('utf-8');

      return {
        content: [
          {
            type: 'text',
            text: decodedResult,
          },
        ],
      };
    }

    if (toolName === 'get_schema') {
      const requestId = crypto.randomUUID();
      const rawPayload = JSON.stringify({
        tool: 'get_schema',
        arguments: {},
      });

      const bridgeResponse = await sessionManager.sendBridgeRequest(sessionId, {
        id: requestId,
        type: 'MCP_TOOL_CALL',
        sessionId,
        ciphertext: Buffer.from(rawPayload).toString('base64'),
        iv: Buffer.from(crypto.randomBytes(12)).toString('base64'),
        timestamp: new Date().toISOString(),
      });

      if (bridgeResponse.status === 'error') {
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: JSON.stringify(bridgeResponse.error),
            },
          ],
        };
      }

      const decodedResult = Buffer.from(bridgeResponse.ciphertext, 'base64').toString('utf-8');
      return {
        content: [
          {
            type: 'text',
            text: decodedResult,
          },
        ],
      };
    }

    throw new Error(`Unknown tool: ${toolName}`);
  });

  return server;
}

// SSE Transport Handler Map
const activeTransports = new Map<string, SSEServerTransport>();

export async function handleSseConnect(req: Request, res: Response): Promise<void> {
  const sessionId = (req.query['sessionId'] as string) || (req.headers['x-session-id'] as string);
  if (!sessionId) {
    res
      .status(400)
      .json(
        createErrorEnvelope(
          'INVALID_SESSION',
          'Missing required sessionId query parameter or x-session-id header'
        )
      );
    return;
  }

  const transport = new SSEServerTransport('/mcp/messages', res);
  activeTransports.set(transport.sessionId, transport);

  const mcpServer = createMcpServer();
  await mcpServer.connect(transport);

  req.on('close', () => {
    activeTransports.delete(transport.sessionId);
  });
}

export async function handleSseMessage(req: Request, res: Response): Promise<void> {
  const sseSessionId = req.query['sessionId'] as string;
  const transport = activeTransports.get(sseSessionId);

  if (!transport) {
    res
      .status(404)
      .json(createErrorEnvelope('INVALID_SESSION', 'Active SSE transport session not found'));
    return;
  }

  await transport.handlePostMessage(req, res);
}
