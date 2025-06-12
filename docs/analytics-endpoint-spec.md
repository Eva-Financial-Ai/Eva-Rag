# Analytics Endpoint Specification

## Overview

This document specifies the analytics endpoint for collecting performance metrics from the frontend.

## Endpoint

```
POST /api/analytics
```

## Request Format

```json
{
  "metrics": [
    {
      "name": "string",
      "value": "number",
      "timestamp": "number",
      "tags": {
        "key": "value"
      }
    }
  ],
  "summary": {
    "websocket": {
      "status": "healthy|degraded|unhealthy",
      "score": "number",
      "details": {
        "connectionAttempts": "number",
        "successfulConnections": "number",
        "failedConnections": "number",
        "messagesReceived": "number",
        "messagesSent": "number",
        "reconnections": "number",
        "averageLatency": "number",
        "connectionDuration": "number",
        "lastError": "string",
        "lastErrorTime": "number"
      }
    },
    "export": {
      "successRate": "number",
      "averageTime": "number",
      "popularFormat": "string",
      "details": {
        "totalExports": "number",
        "exportsByType": {},
        "averageExportTime": "number",
        "largestExportSize": "number",
        "failedExports": "number",
        "lastExportTime": "number"
      }
    },
    "auth0": {
      "status": "healthy|degraded|unhealthy",
      "errorRate": "number",
      "averageResponseTime": "number",
      "details": {
        "apiCalls": "number",
        "apiCallsByEndpoint": {},
        "averageResponseTime": "number",
        "errors": "number",
        "errorsByType": {},
        "rateLimitHits": "number",
        "lastApiCallTime": "number"
      }
    }
  },
  "timestamp": "number",
  "sessionId": "string"
}
```

## Go Implementation

### Data Models

```go
package analytics

import (
    "time"
)

type MetricRequest struct {
    Metrics   []Metric        `json:"metrics"`
    Summary   Summary         `json:"summary"`
    Timestamp int64          `json:"timestamp"`
    SessionID string         `json:"sessionId"`
    UserID    string         `json:"-"` // Added from auth context
}

type Metric struct {
    Name      string            `json:"name"`
    Value     float64           `json:"value"`
    Timestamp int64            `json:"timestamp"`
    Tags      map[string]string `json:"tags"`
}

type Summary struct {
    WebSocket WebSocketSummary `json:"websocket"`
    Export    ExportSummary    `json:"export"`
    Auth0     Auth0Summary     `json:"auth0"`
}

type WebSocketSummary struct {
    Status  string           `json:"status"`
    Score   int              `json:"score"`
    Details WebSocketDetails `json:"details"`
}

type WebSocketDetails struct {
    ConnectionAttempts    int     `json:"connectionAttempts"`
    SuccessfulConnections int     `json:"successfulConnections"`
    FailedConnections     int     `json:"failedConnections"`
    MessagesReceived      int     `json:"messagesReceived"`
    MessagesSent          int     `json:"messagesSent"`
    Reconnections         int     `json:"reconnections"`
    AverageLatency        float64 `json:"averageLatency"`
    ConnectionDuration    float64 `json:"connectionDuration"`
    LastError             string  `json:"lastError,omitempty"`
    LastErrorTime         int64   `json:"lastErrorTime,omitempty"`
}

type ExportSummary struct {
    SuccessRate    int           `json:"successRate"`
    AverageTime    float64       `json:"averageTime"`
    PopularFormat  string        `json:"popularFormat"`
    Details        ExportDetails `json:"details"`
}

type ExportDetails struct {
    TotalExports      int                `json:"totalExports"`
    ExportsByType     map[string]int     `json:"exportsByType"`
    AverageExportTime float64            `json:"averageExportTime"`
    LargestExportSize int64              `json:"largestExportSize"`
    FailedExports     int                `json:"failedExports"`
    LastExportTime    int64              `json:"lastExportTime,omitempty"`
}

type Auth0Summary struct {
    Status              string        `json:"status"`
    ErrorRate           int           `json:"errorRate"`
    AverageResponseTime float64       `json:"averageResponseTime"`
    Details             Auth0Details  `json:"details"`
}

type Auth0Details struct {
    APICalls            int                `json:"apiCalls"`
    APICallsByEndpoint  map[string]int     `json:"apiCallsByEndpoint"`
    AverageResponseTime float64            `json:"averageResponseTime"`
    Errors              int                `json:"errors"`
    ErrorsByType        map[string]int     `json:"errorsByType"`
    RateLimitHits       int                `json:"rateLimitHits"`
    LastAPICallTime     int64              `json:"lastApiCallTime,omitempty"`
}
```

### Handler Implementation

```go
package handlers

import (
    "encoding/json"
    "net/http"
    "time"

    "github.com/eva-platform/analytics"
    "github.com/eva-platform/middleware"
    "go.uber.org/zap"
)

type AnalyticsHandler struct {
    store  analytics.Store
    logger *zap.Logger
}

func NewAnalyticsHandler(store analytics.Store, logger *zap.Logger) *AnalyticsHandler {
    return &AnalyticsHandler{
        store:  store,
        logger: logger,
    }
}

func (h *AnalyticsHandler) HandleMetrics(w http.ResponseWriter, r *http.Request) {
    // Get user from context
    userID := middleware.GetUserID(r.Context())
    if userID == "" {
        http.Error(w, "Unauthorized", http.StatusUnauthorized)
        return
    }

    // Parse request
    var req analytics.MetricRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        h.logger.Error("Failed to parse metrics request", zap.Error(err))
        http.Error(w, "Invalid request", http.StatusBadRequest)
        return
    }

    // Add user context
    req.UserID = userID

    // Validate metrics
    if err := h.validateMetrics(&req); err != nil {
        h.logger.Error("Invalid metrics", zap.Error(err))
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }

    // Process metrics asynchronously
    go h.processMetrics(req)

    // Return success immediately
    w.WriteHeader(http.StatusAccepted)
    json.NewEncoder(w).Encode(map[string]string{
        "status": "accepted",
        "message": "Metrics queued for processing",
    })
}

func (h *AnalyticsHandler) processMetrics(req analytics.MetricRequest) {
    ctx := context.Background()

    // Store raw metrics
    for _, metric := range req.Metrics {
        if err := h.store.StoreMetric(ctx, req.UserID, req.SessionID, metric); err != nil {
            h.logger.Error("Failed to store metric",
                zap.String("metric", metric.Name),
                zap.Error(err),
            )
        }
    }

    // Store summary data
    if err := h.store.StoreSummary(ctx, req.UserID, req.SessionID, req.Summary); err != nil {
        h.logger.Error("Failed to store summary", zap.Error(err))
    }

    // Check for alerts
    h.checkAlerts(req)

    // Update aggregated metrics
    h.updateAggregates(req)
}

func (h *AnalyticsHandler) checkAlerts(req analytics.MetricRequest) {
    // Check WebSocket health
    if req.Summary.WebSocket.Status == "unhealthy" {
        h.logger.Warn("WebSocket unhealthy",
            zap.String("userID", req.UserID),
            zap.String("sessionID", req.SessionID),
            zap.Int("score", req.Summary.WebSocket.Score),
        )
        // Send alert to monitoring system
    }

    // Check Auth0 errors
    if req.Summary.Auth0.ErrorRate > 10 {
        h.logger.Error("High Auth0 error rate",
            zap.String("userID", req.UserID),
            zap.Int("errorRate", req.Summary.Auth0.ErrorRate),
        )
        // Send alert
    }

    // Check export failures
    if req.Summary.Export.SuccessRate < 90 {
        h.logger.Warn("Low export success rate",
            zap.String("userID", req.UserID),
            zap.Int("successRate", req.Summary.Export.SuccessRate),
        )
    }
}

func (h *AnalyticsHandler) validateMetrics(req *analytics.MetricRequest) error {
    if req.SessionID == "" {
        return errors.New("sessionId is required")
    }

    if req.Timestamp == 0 {
        req.Timestamp = time.Now().Unix()
    }

    // Validate metric names
    for _, metric := range req.Metrics {
        if metric.Name == "" {
            return errors.New("metric name is required")
        }
        if metric.Timestamp == 0 {
            metric.Timestamp = time.Now().Unix()
        }
    }

    return nil
}
```

### Storage Implementation

```go
package analytics

import (
    "context"
    "time"

    "github.com/influxdata/influxdb-client-go/v2"
    "github.com/influxdata/influxdb-client-go/v2/api/write"
)

type Store interface {
    StoreMetric(ctx context.Context, userID, sessionID string, metric Metric) error
    StoreSummary(ctx context.Context, userID, sessionID string, summary Summary) error
    GetMetrics(ctx context.Context, userID string, start, end time.Time) ([]Metric, error)
    GetSummary(ctx context.Context, userID string) (*Summary, error)
}

type InfluxStore struct {
    client influxdb2.Client
    org    string
    bucket string
}

func NewInfluxStore(url, token, org, bucket string) *InfluxStore {
    client := influxdb2.NewClient(url, token)
    return &InfluxStore{
        client: client,
        org:    org,
        bucket: bucket,
    }
}

func (s *InfluxStore) StoreMetric(ctx context.Context, userID, sessionID string, metric Metric) error {
    writeAPI := s.client.WriteAPIBlocking(s.org, s.bucket)

    // Create point
    point := influxdb2.NewPoint(
        metric.Name,
        map[string]string{
            "user_id":    userID,
            "session_id": sessionID,
        },
        map[string]interface{}{
            "value": metric.Value,
        },
        time.Unix(metric.Timestamp, 0),
    )

    // Add tags
    for k, v := range metric.Tags {
        point.AddTag(k, v)
    }

    return writeAPI.WritePoint(ctx, point)
}

func (s *InfluxStore) StoreSummary(ctx context.Context, userID, sessionID string, summary Summary) error {
    writeAPI := s.client.WriteAPIBlocking(s.org, s.bucket)

    points := []*write.Point{
        // WebSocket metrics
        influxdb2.NewPoint(
            "websocket_health",
            map[string]string{
                "user_id":    userID,
                "session_id": sessionID,
                "status":     summary.WebSocket.Status,
            },
            map[string]interface{}{
                "score":                summary.WebSocket.Score,
                "connection_attempts":  summary.WebSocket.Details.ConnectionAttempts,
                "successful_connections": summary.WebSocket.Details.SuccessfulConnections,
                "failed_connections":   summary.WebSocket.Details.FailedConnections,
                "messages_received":    summary.WebSocket.Details.MessagesReceived,
                "messages_sent":        summary.WebSocket.Details.MessagesSent,
                "reconnections":        summary.WebSocket.Details.Reconnections,
                "average_latency":      summary.WebSocket.Details.AverageLatency,
            },
            time.Now(),
        ),

        // Export metrics
        influxdb2.NewPoint(
            "export_performance",
            map[string]string{
                "user_id":       userID,
                "session_id":    sessionID,
                "popular_format": summary.Export.PopularFormat,
            },
            map[string]interface{}{
                "success_rate":       summary.Export.SuccessRate,
                "average_time":       summary.Export.AverageTime,
                "total_exports":      summary.Export.Details.TotalExports,
                "failed_exports":     summary.Export.Details.FailedExports,
                "largest_export_size": summary.Export.Details.LargestExportSize,
            },
            time.Now(),
        ),

        // Auth0 metrics
        influxdb2.NewPoint(
            "auth0_performance",
            map[string]string{
                "user_id":    userID,
                "session_id": sessionID,
                "status":     summary.Auth0.Status,
            },
            map[string]interface{}{
                "error_rate":           summary.Auth0.ErrorRate,
                "average_response_time": summary.Auth0.AverageResponseTime,
                "api_calls":            summary.Auth0.Details.APICalls,
                "errors":               summary.Auth0.Details.Errors,
                "rate_limit_hits":      summary.Auth0.Details.RateLimitHits,
            },
            time.Now(),
        ),
    }

    return writeAPI.WritePoint(ctx, points...)
}
```

### Aggregation Service

```go
package analytics

import (
    "context"
    "time"

    "github.com/go-redis/redis/v8"
)

type AggregationService struct {
    store  Store
    redis  *redis.Client
    logger *zap.Logger
}

func (s *AggregationService) UpdateAggregates(ctx context.Context, req MetricRequest) error {
    // Update real-time counters in Redis
    pipe := s.redis.Pipeline()

    // WebSocket metrics
    pipe.HIncrBy(ctx, "metrics:websocket:total", "connections",
        int64(req.Summary.WebSocket.Details.ConnectionAttempts))
    pipe.HIncrBy(ctx, "metrics:websocket:total", "messages",
        int64(req.Summary.WebSocket.Details.MessagesReceived +
              req.Summary.WebSocket.Details.MessagesSent))

    // Export metrics
    pipe.HIncrBy(ctx, "metrics:export:total", "count",
        int64(req.Summary.Export.Details.TotalExports))
    for format, count := range req.Summary.Export.Details.ExportsByType {
        pipe.HIncrBy(ctx, "metrics:export:by_type", format, int64(count))
    }

    // Auth0 metrics
    pipe.HIncrBy(ctx, "metrics:auth0:total", "calls",
        int64(req.Summary.Auth0.Details.APICalls))
    pipe.HIncrBy(ctx, "metrics:auth0:total", "errors",
        int64(req.Summary.Auth0.Details.Errors))

    _, err := pipe.Exec(ctx)
    return err
}

func (s *AggregationService) GetDashboardMetrics(ctx context.Context) (*DashboardMetrics, error) {
    // Fetch aggregated metrics from Redis and InfluxDB
    // Return formatted data for dashboard display
    return &DashboardMetrics{
        WebSocket: s.getWebSocketMetrics(ctx),
        Export:    s.getExportMetrics(ctx),
        Auth0:     s.getAuth0Metrics(ctx),
        Timestamp: time.Now(),
    }, nil
}
```

## Security Considerations

1. **Authentication**: All requests must include valid JWT token
2. **Rate Limiting**: Limit metrics submissions to prevent abuse
3. **Data Validation**: Validate all metric values and timestamps
4. **Privacy**: Don't log sensitive user data in metrics
5. **Retention**: Define data retention policies (e.g., 30 days for raw metrics)

## Performance Considerations

1. **Async Processing**: Process metrics asynchronously to avoid blocking
2. **Batching**: Batch metric writes to storage systems
3. **Compression**: Use gzip compression for large payloads
4. **Sampling**: Implement sampling for high-frequency metrics
5. **Caching**: Cache aggregated metrics in Redis

## Monitoring & Alerting

1. **WebSocket Health**: Alert when score < 50 or status is unhealthy
2. **Export Failures**: Alert when success rate < 80%
3. **Auth0 Errors**: Alert when error rate > 5% or rate limits hit
4. **System Health**: Monitor analytics pipeline health

## Dashboard Endpoints

```
GET /api/analytics/dashboard
GET /api/analytics/metrics?start=<timestamp>&end=<timestamp>
GET /api/analytics/export/csv
```
