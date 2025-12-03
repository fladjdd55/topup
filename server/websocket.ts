import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import type { Server } from 'http';

export interface AuthenticatedWebSocket extends WebSocket {
  userId?: number;
  isAuthenticated: boolean;
  isAlive: boolean; // Useful for heartbeat checks later
}

const AUTH_TIMEOUT_MS = 30 * 1000; // 30 seconds to authenticate

class WebSocketManager {
  private wss: WebSocketServer | null = null;
  private clients: Set<AuthenticatedWebSocket> = new Set();

  initialize(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws: AuthenticatedWebSocket, request: IncomingMessage) => {
      console.log('[WebSocket] New connection attempt');

      // 1. Initial State
      ws.isAuthenticated = false;
      ws.isAlive = true;
      this.clients.add(ws);

      // ✅ FIX: Set strict timeout for authentication
      const authTimer = setTimeout(() => {
        if (!ws.isAuthenticated) {
          console.warn('[WebSocket] 🛑 Client terminated: Auth timeout');
          ws.terminate(); // Force close
          this.clients.delete(ws);
        }
      }, AUTH_TIMEOUT_MS);

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'connected',
        message: 'Connexion WebSocket établie',
        timestamp: new Date().toISOString(),
      }));

      ws.on('pong', () => { ws.isAlive = true; });

      ws.on('message', (message: string) => {
        try {
          const data = JSON.parse(message.toString());
          
          if (data.type === 'authenticate' && data.userId) {
            // ✅ FIX: Clear timeout on success
            clearTimeout(authTimer);
            
            ws.userId = data.userId;
            ws.isAuthenticated = true;
            
            ws.send(JSON.stringify({
              type: 'authenticated',
              userId: data.userId,
              timestamp: new Date().toISOString(),
            }));
            console.log(`[WebSocket] ✅ User ${data.userId} authenticated`);
          }

          if (data.type === 'ping') {
            ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
          }
        } catch (error) {
          console.error('[WebSocket] Error parsing message:', error);
        }
      });

      ws.on('close', () => {
        clearTimeout(authTimer); // Clean up timer if they disconnect early
        console.log(`[WebSocket] Client disconnected${ws.userId ? ` (userId: ${ws.userId})` : ''}`);
        this.clients.delete(ws);
      });

      ws.on('error', (error) => {
        clearTimeout(authTimer);
        console.error('[WebSocket] Error:', error);
        this.clients.delete(ws);
      });
    });

    console.log('[WebSocket] Server initialized on path /ws');
    
    // Optional: Keep-alive interval to clean up dead sockets (zombies)
    setInterval(() => {
      this.clients.forEach((ws) => {
        if (!ws.isAlive) return ws.terminate();
        ws.isAlive = false;
        ws.ping();
      });
    }, 30000);
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
      // ✅ Only send to authenticated clients
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
    // In a real app, check client.role === 'admin'
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
