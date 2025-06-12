import { Transaction } from '../pages/TransactionSummary';
import { performanceMonitor } from './performanceMonitoring';

// Hook for using WebSocket in React components
import { useEffect, useState, useCallback, useRef } from 'react';

export interface WebSocketMessage {
  type: 'transaction_update' | 'transaction_new' | 'transaction_delete' | 'stage_change';
  data: any;
  timestamp: string;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectInterval: number = 5000;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private listeners: Map<string, Set<(message: WebSocketMessage) => void>> = new Map();
  private url: string;
  private isConnecting: boolean = false;
  private isDisabled: boolean = true; // Disable WebSocket by default
  private hasLoggedDisabledMessage: boolean = false;

  constructor() {
    // Use environment variable or default to local development
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = process.env.REACT_APP_WS_URL || `${wsProtocol}//${window.location.host}`;
    this.url = `${wsHost}/ws/transactions`;

    // Only enable WebSocket if explicitly configured
    this.isDisabled = process.env.REACT_APP_ENABLE_WEBSOCKET !== 'true';

    if (this.isDisabled && !this.hasLoggedDisabledMessage) {
      console.log('🔌 WebSocket service is disabled. Set REACT_APP_ENABLE_WEBSOCKET=true to enable.');
      this.hasLoggedDisabledMessage = true;
    }
  }

  connect(token?: string): void {
    // Don't connect if disabled
    if (this.isDisabled) {
      return;
    }

    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    try {
      // Add authentication token to URL if provided
      const wsUrl = token ? `${this.url}?token=${token}` : this.url;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔗 WebSocket connected');
        }
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        performanceMonitor.trackWebSocketConnection(true);
        this.notifyListeners({
          type: 'connection',
          status: 'connected',
        });
      };

      this.ws.onmessage = event => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          performanceMonitor.trackWebSocketMessage('received', message.type);

          // Track latency if message includes timestamp
          if (message.timestamp) {
            const latency = Date.now() - new Date(message.timestamp).getTime();
            performanceMonitor.trackWebSocketLatency(latency);
          }

          this.handleMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
          performanceMonitor.trackWebSocketError(error.message);
        }
      };

      this.ws.onerror = error => {
        console.error('WebSocket error:', error);
        this.isConnecting = false;
        performanceMonitor.trackWebSocketError('Connection error');
        performanceMonitor.trackWebSocketConnection(false);
      };

      this.ws.onclose = () => {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔌 WebSocket disconnected');
        }
        this.isConnecting = false;
        performanceMonitor.trackWebSocketDisconnection();
        this.notifyListeners({
          type: 'connection',
          status: 'disconnected',
        });
        this.attemptReconnect();
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.isConnecting = false;
    }
  }

  private attemptReconnect(): void {
    // Don't reconnect if disabled
    if (this.isDisabled) {
      return;
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      performanceMonitor.trackWebSocketError('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(
      `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
    );
    performanceMonitor.trackWebSocketReconnection();

    setTimeout(() => {
      this.connect();
    }, this.reconnectInterval);
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.listeners.clear();
  }

  subscribe(eventType: string, callback: (message: WebSocketMessage) => void): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }

    this.listeners.get(eventType)!.add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(eventType);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.listeners.delete(eventType);
        }
      }
    };
  }

  private handleMessage(message: WebSocketMessage): void {
    // Notify specific event type listeners
    const eventListeners = this.listeners.get(message.type);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(message));
    }

    // Notify wildcard listeners
    const wildcardListeners = this.listeners.get('*');
    if (wildcardListeners) {
      wildcardListeners.forEach(callback => callback(message));
    }
  }

  private notifyListeners(data: any): void {
    const message: WebSocketMessage = {
      type: 'connection' as any,
      data,
      timestamp: new Date().toISOString(),
    };

    const connectionListeners = this.listeners.get('connection');
    if (connectionListeners) {
      connectionListeners.forEach(callback => callback(message));
    }
  }

  send(type: string, data: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const message = {
        type,
        data,
        timestamp: new Date().toISOString(),
      };
      this.ws.send(JSON.stringify(message));
      performanceMonitor.trackWebSocketMessage('sent', type);
    } else {
      console.warn('WebSocket is not connected');
      performanceMonitor.trackWebSocketError('Attempted to send message while disconnected');
    }
  }

  isConnected(): boolean {
    if (this.isDisabled) {
      return false;
    }
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();

// Optimized WebSocket hook with performance enhancements
export function useWebSocket(eventTypes: string[], onMessage: (message: WebSocketMessage) => void) {
  const [isConnected, setIsConnected] = useState(false);
  const onMessageRef = useRef(onMessage);
  const unsubscribersRef = useRef<(() => void)[]>([]);

  // Update callback ref when it changes to prevent unnecessary useEffect triggers
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  // Memoized message handler to prevent recreating on every render
  const memoizedMessageHandler = useCallback((message: WebSocketMessage) => {
    onMessageRef.current(message);
  }, []);

  // Memoized connection handler
  const connectionHandler = useCallback((message: WebSocketMessage) => {
    setIsConnected(message.data.status === 'connected');
  }, []);

  // Memoized send function
  const send = useCallback((type: string, data: any) => {
    websocketService.send(type, data);
  }, []);

  useEffect(() => {
    // Clear any existing subscriptions
    unsubscribersRef.current.forEach(unsub => unsub());
    unsubscribersRef.current = [];

    // Subscribe to connection events
    const unsubscribeConnection = websocketService.subscribe('connection', connectionHandler);
    unsubscribersRef.current.push(unsubscribeConnection);

    // Subscribe to specified event types
    eventTypes.forEach(eventType => {
      const unsubscriber = websocketService.subscribe(eventType, memoizedMessageHandler);
      unsubscribersRef.current.push(unsubscriber);
    });

    // Connect if not already connected
    if (!websocketService.isConnected()) {
      const token = localStorage.getItem('authToken');
      websocketService.connect(token || undefined);
    } else {
      setIsConnected(true);
    }

    // Cleanup function
    return () => {
      unsubscribersRef.current.forEach(unsub => unsub());
      unsubscribersRef.current = [];
    };
  }, [eventTypes, memoizedMessageHandler, connectionHandler]);

  return { 
    isConnected, 
    send
  };
}
