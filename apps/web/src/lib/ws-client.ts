import {
  SessionHandshakeSchema,
  SessionStatusSchema,
  BridgeRequestSchema,
  type BridgeResponse,
  type SchemaToolOutput,
} from '@repo/mcp-contracts';
import type { Database } from 'sql.js';
import type { TableMeta } from '@repo/mcp-contracts';
import type { ColumnPrivacyConfig } from './query/privacy';
import { executeValidatedQuery } from './query/executor';

export interface WsClientOptions {
  wsUrl: string;
  sessionId: string;
  customerId: string;
  getDb: () => Database | null;
  getTableMetas: () => TableMeta[];
  getPrivacyConfigs: () => ColumnPrivacyConfig[];
  onStatusChange?: (connected: boolean, mcpHandshakeConfirmed: boolean) => void;
  onFirstHandshakeConfirmed?: () => void;
}

export class RelayWebSocketClient {
  private ws: WebSocket | null = null;
  private isConnected = false;
  private mcpHandshakeConfirmed = false;

  constructor(private options: WsClientOptions) {}

  public connect(): void {
    if (typeof window === 'undefined') return;

    try {
      this.ws = new WebSocket(this.options.wsUrl);

      this.ws.onopen = () => {
        console.log('[Relay WS Client] Connected to relay WebSocket');
        this.isConnected = true;

        // Send SESSION_INIT handshake
        const initMsg = {
          type: 'SESSION_INIT',
          sessionId: this.options.sessionId,
          customerId: this.options.customerId,
          timestamp: new Date().toISOString(),
        };
        this.ws?.send(JSON.stringify(initMsg));
        this.notifyStatus();
      };

      this.ws.onmessage = async (event: MessageEvent) => {
        try {
          const raw = String(event.data);
          const json = JSON.parse(raw) as Record<string, unknown>;

          if (json['type'] === 'SESSION_STATUS') {
            const statusResult = SessionStatusSchema.safeParse(json);
            if (statusResult.success) {
              this.mcpHandshakeConfirmed = statusResult.data.mcpHandshakeConfirmed;
              this.notifyStatus();
            }
            return;
          }

          if (json['type'] === 'MCP_TOOL_CALL') {
            const reqResult = BridgeRequestSchema.safeParse(json);
            if (reqResult.success) {
              // First incoming tool call confirms MCP handshake (FR-4 step 3)
              if (!this.mcpHandshakeConfirmed) {
                this.mcpHandshakeConfirmed = true;
                this.options.onFirstHandshakeConfirmed?.();
                this.notifyStatus();
              }

              const bridgeResponse = await this.handleIncomingToolCall(reqResult.data);
              this.ws?.send(JSON.stringify(bridgeResponse));
            }
          }
        } catch (err) {
          console.error('[Relay WS Client] Error processing WebSocket message:', err);
        }
      };

      this.ws.onclose = () => {
        console.log('[Relay WS Client] Disconnected from relay');
        this.isConnected = false;
        this.notifyStatus();
      };

      this.ws.onerror = (err) => {
        console.error('[Relay WS Client] Socket error:', err);
      };
    } catch (err) {
      console.error('[Relay WS Client] Failed to establish connection:', err);
    }
  }

  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.notifyStatus();
  }

  private notifyStatus(): void {
    this.options.onStatusChange?.(this.isConnected, this.mcpHandshakeConfirmed);
  }

  private async handleIncomingToolCall(
    request: ReturnType<typeof BridgeRequestSchema.parse>
  ): Promise<BridgeResponse> {
    const db = this.options.getDb();
    if (!db) {
      return {
        id: request.id,
        type: 'MCP_TOOL_RESULT',
        status: 'error',
        error: {
          code: 'DATABASE_NOT_INITIALIZED',
          message: 'Local SQLite database is not initialized or accessible',
        },
        timestamp: new Date().toISOString(),
      };
    }

    try {
      // Decode tool call arguments container from ciphertext payload frame
      const decodedPayloadStr = Buffer.from(request.ciphertext, 'base64').toString('utf-8');
      const payload = JSON.parse(decodedPayloadStr) as {
        tool: string;
        arguments?: Record<string, unknown>;
      };

      if (payload.tool === 'query_database') {
        const sql = String(payload.arguments?.['sql'] || '');
        const prompt = payload.arguments?.['prompt']
          ? String(payload.arguments['prompt'])
          : undefined;

        const tableMetas = this.options.getTableMetas();
        const schemaContexts = tableMetas.map((t) => ({
          tableName: t.name,
          excludedColumns: t.columns
            .filter((c) => c.privacyPolicy === 'excluded')
            .map((c) => c.name),
        }));

        const privacyConfigs = this.options.getPrivacyConfigs();

        const execResult = await executeValidatedQuery({
          db,
          sql,
          prompt,
          schemaContexts,
          privacyConfigs,
        });

        if (execResult.error || !execResult.result) {
          return {
            id: request.id,
            type: 'MCP_TOOL_RESULT',
            status: 'error',
            error: {
              code: 'QUERY_REJECTED',
              message: execResult.error || 'Query failed execution',
            },
            timestamp: new Date().toISOString(),
          };
        }

        const resultJson = JSON.stringify(execResult.result);
        const encodedResultCiphertext = Buffer.from(resultJson).toString('base64');

        return {
          id: request.id,
          type: 'MCP_TOOL_RESULT',
          status: 'success',
          ciphertext: encodedResultCiphertext,
          iv: request.iv,
          timestamp: new Date().toISOString(),
        };
      }

      if (payload.tool === 'get_schema') {
        const tableMetas = this.options.getTableMetas();

        const schemaOutput: SchemaToolOutput = {
          tables: tableMetas.map((t) => ({
            name: t.name,
            columns: t.columns
              .filter((c) => c.privacyPolicy !== 'excluded')
              .map((c) => ({
                name: c.name,
                type: c.type,
                privacyPolicy: c.privacyPolicy === 'hashed' ? 'hashed' : 'visible',
              })),
            relationships: [],
          })),
        };

        const resultJson = JSON.stringify(schemaOutput);
        const encodedResultCiphertext = Buffer.from(resultJson).toString('base64');

        return {
          id: request.id,
          type: 'MCP_TOOL_RESULT',
          status: 'success',
          ciphertext: encodedResultCiphertext,
          iv: request.iv,
          timestamp: new Date().toISOString(),
        };
      }

      return {
        id: request.id,
        type: 'MCP_TOOL_RESULT',
        status: 'error',
        error: {
          code: 'UNKNOWN_TOOL',
          message: `Unknown MCP tool: ${payload.tool}`,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      return {
        id: request.id,
        type: 'MCP_TOOL_RESULT',
        status: 'error',
        error: {
          code: 'EXECUTION_ERROR',
          message: err instanceof Error ? err.message : 'Error executing MCP tool call',
        },
        timestamp: new Date().toISOString(),
      };
    }
  }
}
