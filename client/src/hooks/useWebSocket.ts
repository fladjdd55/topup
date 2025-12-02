import { useEffect, useRef, useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface WebSocketMessage {
  type: string;
  data?: any;
  timestamp: string;
}

interface UseWebSocketOptions {
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  autoReconnect?: boolean;
  reconnectInterval?: number;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    onMessage,
    onConnect,
    onDisconnect,
    autoReconnect = true,
    reconnectInterval = 3000,
  } = options;

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);

  const connect = useCallback(() => {
    try {
      // Determine WebSocket URL based on window location
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/ws`;

      console.log('[WebSocket] Connecting to:', wsUrl);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[WebSocket] Connected');
        setIsConnected(true);
        setConnectionAttempts(0);
        onConnect?.();

        // Authenticate with user ID from session (if available)
        // The userId will be sent after authentication
        const userId = sessionStorage.getItem('userId');
        if (userId) {
          ws.send(JSON.stringify({
            type: 'authenticate',
            userId: parseInt(userId),
          }));
        }
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log('[WebSocket] Message received:', message.type, message);

          // Handle different message types
          switch (message.type) {
            case 'connected':
              console.log('[WebSocket] Connection acknowledged');
              break;

            case 'authenticated':
              console.log('[WebSocket] Authenticated as user', message.data?.userId);
              break;

            case 'transaction_created':
              // Invalidate queries related to transactions
              queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
              queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
              queryClient.invalidateQueries({ queryKey: ['/api/dashboard/charts'] });
              break;

            case 'recharge_request_created':
            case 'recharge_request_accepted':
            case 'recharge_request_declined':
              // Invalidate queries related to recharge requests
              queryClient.invalidateQueries({ queryKey: ['/api/recharge-requests'] });
              queryClient.invalidateQueries({ queryKey: ['/api/recharge-requests/count'] });
              queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
              break;

            case 'confirm_receipt_required':
              // 🆕 DTone delivered credit - show confirmation popup!
              queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
              queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
              // Custom handler will display the confirmation dialog
              break;

            case 'transaction_confirmed':
            case 'transaction_disputed':
            case 'transaction_auto_confirmed':
              // Refresh transaction list after confirmation/dispute
              queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
              queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
              queryClient.invalidateQueries({ queryKey: ['/api/dashboard/charts'] });
              break;

            case 'pong':
              // Heartbeat response
              break;

            default:
              console.log('[WebSocket] Unknown message type:', message.type);
          }

          // Call custom handler if provided
          onMessage?.(message);
        } catch (error) {
          console.error('[WebSocket] Error parsing message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
      };

      ws.onclose = () => {
        console.log('[WebSocket] Disconnected');
        setIsConnected(false);
        onDisconnect?.();
        wsRef.current = null;

        // Auto-reconnect if enabled
        if (autoReconnect) {
          setConnectionAttempts((prev) => prev + 1);
          const delay = Math.min(reconnectInterval * Math.pow(1.5, connectionAttempts), 30000);
          console.log(`[WebSocket] Reconnecting in ${delay}ms...`);
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        }
      };
    } catch (error) {
      console.error('[WebSocket] Connection error:', error);
    }
  }, [autoReconnect, reconnectInterval, connectionAttempts, onConnect, onDisconnect, onMessage, queryClient]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const sendMessage = useCallback((type: string, data?: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, data }));
      return true;
    }
    console.warn('[WebSocket] Cannot send message, not connected');
    return false;
  }, []);

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps to connect only once on mount

  // Ping every 30 seconds to keep connection alive
  useEffect(() => {
    if (!isConnected) return;

    const pingInterval = setInterval(() => {
      sendMessage('ping');
    }, 30000);

    return () => clearInterval(pingInterval);
  }, [isConnected, sendMessage]);

  return {
    isConnected,
    sendMessage,
    disconnect,
    reconnect: connect,
  };
}
