import type { WebSocket } from 'ws';
import type { BridgeRequest, BridgeResponse } from '@repo/mcp-contracts';

export interface PendingRequest {
  resolve: (response: BridgeResponse) => void;
  reject: (reason: Error) => void;
  timer: ReturnType<typeof setTimeout>;
}

export class SessionManager {
  private activeSessions = new Map<string, WebSocket>();
  private pendingRequests = new Map<string, PendingRequest>();

  public registerSession(sessionId: string, ws: WebSocket): void {
    console.log(`[Bridge SessionManager] Registering session: ${sessionId}`);
    this.activeSessions.set(sessionId, ws);
  }

  public removeSession(sessionId: string): void {
    console.log(`[Bridge SessionManager] Removing session: ${sessionId}`);
    this.activeSessions.delete(sessionId);

    // Reject all pending requests for this session
    for (const [reqId, pending] of this.pendingRequests.entries()) {
      clearTimeout(pending.timer);
      pending.reject(new Error(`WebSocket session disconnected: ${sessionId}`));
      this.pendingRequests.delete(reqId);
    }
  }

  public getSession(sessionId: string): WebSocket | undefined {
    return this.activeSessions.get(sessionId);
  }

  public getActiveSessionCount(): number {
    return this.activeSessions.size;
  }

  public sendBridgeRequest(
    sessionId: string,
    request: BridgeRequest,
    timeoutMs: number = 30000
  ): Promise<BridgeResponse> {
    const ws = this.activeSessions.get(sessionId);
    if (!ws || ws.readyState !== 1 /* WebSocket.OPEN */) {
      return Promise.reject(
        new Error(`No active WebSocket session found for sessionId: ${sessionId}`)
      );
    }

    return new Promise<BridgeResponse>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pendingRequests.delete(request.id);
        reject(new Error(`Bridge request timed out after ${timeoutMs}ms for id: ${request.id}`));
      }, timeoutMs);

      this.pendingRequests.set(request.id, { resolve, reject, timer });

      // Forward opaque ciphertext request down to browser WebSocket
      ws.send(JSON.stringify(request), (err) => {
        if (err) {
          clearTimeout(timer);
          this.pendingRequests.delete(request.id);
          reject(err);
        }
      });
    });
  }

  public handleBridgeResponse(response: BridgeResponse): boolean {
    const pending = this.pendingRequests.get(response.id);
    if (!pending) {
      console.warn(
        `[Bridge SessionManager] Received response for unknown or timed out request id: ${response.id}`
      );
      return false;
    }

    clearTimeout(pending.timer);
    this.pendingRequests.delete(response.id);
    pending.resolve(response);
    return true;
  }
}

export const globalSessionManager = new SessionManager();
