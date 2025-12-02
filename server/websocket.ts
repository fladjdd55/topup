import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import type { Server } from 'http';

export interface AuthenticatedWebSocket extends WebSocket {
  userId?: number;
  isAuthenticated: boolean;
}

class WebSocketManager {
  private wss: WebSocketServer | null = null;
  private clients: Set<AuthenticatedWebSocket> = new Set();

  initialize(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws: AuthenticatedWebSocket, request: IncomingMessage) => {
      console.log('[WebSocket] New connection attempt');

      // Extract session from cookies
      const cookies = request.headers.cookie?.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>);

      // Mark as unauthenticated initially
      ws.isAuthenticated = false;
      this.clients.add(ws);

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'connected',
        message: 'Connexion WebSocket établie',
        timestamp: new Date().toISOString(),
      }));

      ws.on('message', (message: string) => {
        try {
          const data = JSON.parse(message.toString());
          
          if (data.type === 'authenticate' && data.userId) {
            ws.userId = data.userId;
            ws.isAuthenticated = true;
            ws.send(JSON.stringify({
              type: 'authenticated',
              userId: data.userId,
              timestamp: new Date().toISOString(),
            }));
            console.log(`[WebSocket] User ${data.userId} authenticated`);
          }

          if (data.type === 'ping') {
            ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
          }
        } catch (error) {
          console.error('[WebSocket] Error parsing message:', error);
        }
      });

      ws.on('close', () => {
        console.log(`[WebSocket] Client disconnected${ws.userId ? ` (userId: ${ws.userId})` : ''}`);
        this.clients.delete(ws);
      });

      ws.on('error', (error) => {
        console.error('[WebSocket] Error:', error);
        this.clients.delete(ws);
      });
    });

    console.log('[WebSocket] Server initialized on path /ws');
  }

  // Broadcast to all connected clients
  broadcast(event: string, data: any) {
    const message = JSON.stringify({
      type: event,
      data,
      timestamp: new Date().toISOString(),
    });

    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });

    console.log(`[WebSocket] Broadcasted '${event}' to ${this.clients.size} clients`);
  }

  // Send to specific user
  sendToUser(userId: number, event: string, data: any) {
    const message = JSON.stringify({
      type: event,
      data,
      timestamp: new Date().toISOString(),
    });

    let sent = 0;
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN && client.userId === userId && client.isAuthenticated) {
        client.send(message);
        sent++;
      }
    });

    if (sent > 0) {
      console.log(`[WebSocket] Sent '${event}' to user ${userId} (${sent} connections)`);
    }
  }

  // Send to all admins
  sendToAdmins(event: string, data: any) {
    // This would require role information in the WebSocket connection
    // For now, we'll use broadcast for admin events
    this.broadcast(event, data);
  }

  getClientCount(): number {
    return this.clients.size;
  }

  getAuthenticatedClientCount(): number {
    return Array.from(this.clients).filter(c => c.isAuthenticated).length;
  }
}

export const wsManager = new WebSocketManager();
