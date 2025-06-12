# WebSocket Server Specification for Go Backend

## Overview

This document specifies the WebSocket server implementation for real-time transaction updates in the EVA platform backend.

## WebSocket Endpoint

```
wss://api.eva-platform.com/ws/transactions
```

## Authentication

- WebSocket connections must include authentication token in query parameter or Authorization header
- Token validation should occur before upgrading HTTP connection to WebSocket

## Message Format

### Client to Server Messages

```json
{
  "type": "subscribe" | "unsubscribe" | "ping",
  "channel": "transactions" | "user_updates" | "notifications",
  "filters": {
    "customerId": "string",
    "userId": "string",
    "transactionIds": ["string"]
  },
  "timestamp": "ISO8601"
}
```

### Server to Client Messages

```json
{
  "type": "transaction_update" | "transaction_new" | "transaction_delete" | "stage_change" | "error" | "pong",
  "data": {
    // Transaction object or update data
  },
  "timestamp": "ISO8601",
  "correlationId": "uuid"
}
```

## Go Implementation Structure

### Dependencies

```go
import (
    "github.com/gorilla/websocket"
    "github.com/go-redis/redis/v8"
    "github.com/golang-jwt/jwt/v4"
)
```

### WebSocket Hub Pattern

```go
type Hub struct {
    clients    map[*Client]bool
    broadcast  chan []byte
    register   chan *Client
    unregister chan *Client
    redis      *redis.Client
}

type Client struct {
    hub        *Hub
    conn       *websocket.Conn
    send       chan []byte
    userId     string
    customerId string
    filters    map[string]interface{}
}
```

### Message Types

```go
type WSMessage struct {
    Type        string                 `json:"type"`
    Data        interface{}           `json:"data"`
    Timestamp   time.Time             `json:"timestamp"`
    CorrelationID string              `json:"correlationId,omitempty"`
}

type TransactionUpdate struct {
    ID              string    `json:"id"`
    Status          string    `json:"status"`
    Stage           string    `json:"stage"`
    UpdatedAt       time.Time `json:"updatedAt"`
    UpdatedBy       string    `json:"updatedBy"`
    ChangedFields   []string  `json:"changedFields"`
}
```

### Redis Pub/Sub Integration

```go
// Subscribe to Redis channels for transaction updates
func (h *Hub) subscribeToRedis() {
    pubsub := h.redis.Subscribe(ctx, "transactions:*")
    defer pubsub.Close()

    ch := pubsub.Channel()
    for msg := range ch {
        h.handleRedisMessage(msg)
    }
}

// Publish transaction updates to Redis
func publishTransactionUpdate(redis *redis.Client, update TransactionUpdate) error {
    data, err := json.Marshal(update)
    if err != nil {
        return err
    }

    return redis.Publish(ctx, fmt.Sprintf("transactions:%s", update.ID), data).Err()
}
```

### Middleware and Handlers

```go
// WebSocket upgrade middleware
func WSAuthMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        token := r.URL.Query().Get("token")
        if token == "" {
            token = r.Header.Get("Authorization")
        }

        // Validate JWT token
        claims, err := validateToken(token)
        if err != nil {
            http.Error(w, "Unauthorized", http.StatusUnauthorized)
            return
        }

        // Add claims to context
        ctx := context.WithValue(r.Context(), "user", claims)
        next.ServeHTTP(w, r.WithContext(ctx))
    })
}

// WebSocket handler
func HandleWebSocket(hub *Hub) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        conn, err := upgrader.Upgrade(w, r, nil)
        if err != nil {
            log.Printf("WebSocket upgrade error: %v", err)
            return
        }

        claims := r.Context().Value("user").(*jwt.Claims)
        client := &Client{
            hub:    hub,
            conn:   conn,
            send:   make(chan []byte, 256),
            userId: claims.Subject,
        }

        hub.register <- client

        go client.writePump()
        go client.readPump()
    }
}
```

### Error Handling and Reconnection

```go
// Client connection management
func (c *Client) readPump() {
    defer func() {
        c.hub.unregister <- c
        c.conn.Close()
    }()

    c.conn.SetReadLimit(maxMessageSize)
    c.conn.SetReadDeadline(time.Now().Add(pongWait))
    c.conn.SetPongHandler(func(string) error {
        c.conn.SetReadDeadline(time.Now().Add(pongWait))
        return nil
    })

    for {
        _, message, err := c.conn.ReadMessage()
        if err != nil {
            if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
                log.Printf("WebSocket error: %v", err)
            }
            break
        }

        // Process message
        c.handleMessage(message)
    }
}
```

## Security Considerations

1. **Rate Limiting**: Implement per-client message rate limiting
2. **Message Validation**: Validate all incoming messages against schema
3. **Authorization**: Check user permissions for each subscription
4. **Encryption**: Ensure TLS/SSL for all WebSocket connections
5. **CORS**: Configure appropriate CORS headers for WebSocket upgrade

## Monitoring and Metrics

Track the following metrics:

- Active WebSocket connections
- Messages sent/received per second
- Connection duration
- Error rates
- Reconnection attempts

## Example Client Usage

```javascript
// Frontend connection
const ws = new WebSocket('wss://api.eva-platform.com/ws/transactions?token=' + authToken);

ws.onopen = () => {
  // Subscribe to updates
  ws.send(
    JSON.stringify({
      type: 'subscribe',
      channel: 'transactions',
      filters: {
        customerId: 'CUST-001',
      },
    })
  );
};

ws.onmessage = event => {
  const message = JSON.parse(event.data);
  // Handle transaction updates
};
```
