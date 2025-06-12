# Mock WebSocket Server Documentation

## Overview

The mock WebSocket server allows developers to test real-time transaction updates without needing the Go backend. It simulates WebSocket connections and sends realistic transaction updates at configurable intervals.

## Features

- **Automatic Connection Simulation**: Intercepts WebSocket connections and provides mock responses
- **Realistic Transaction Updates**: Simulates various transaction events including updates, new transactions, and stage changes
- **Configurable Settings**: Control update frequency, error simulation, and latency
- **Development UI Control**: Visual control panel for toggling and configuring the mock server
- **Performance Monitoring Integration**: All mock WebSocket events are tracked in the performance monitoring system

## Usage

### Automatic Activation

The mock WebSocket server is automatically enabled in development mode. To disable it, set the environment variable:

```bash
REACT_APP_USE_MOCK_WEBSOCKET=false
```

### Manual Control

Use the MockWebSocketControl component that appears in the bottom-left corner of the screen in development mode:

1. **Enable/Disable**: Toggle the mock server on/off (requires page reload)
2. **Settings**: Click the gear icon to access configuration options
3. **Update Interval**: Set how frequently mock updates are sent (default: 5000ms)
4. **Simulate Errors**: Toggle error simulation for testing error handling
5. **Simulate Latency**: Add realistic network latency to messages (50-200ms)

### Programmatic Control

```typescript
import { enableMockWebSocket, disableMockWebSocket } from './services/mockWebSocketServer';

// Enable mock WebSocket
enableMockWebSocket();

// Disable mock WebSocket
disableMockWebSocket();
```

## Mock Events

The server simulates the following WebSocket events:

### 1. Transaction Updates

```json
{
  "type": "transaction_update",
  "data": {
    "id": "TX-MOCK-001",
    "completionPercentage": 30,
    "documents": 8,
    "messages": 3,
    "updatedAt": "2024-01-26",
    "nextAction": "Complete application form",
    "stageProgress": "gathering_documents"
  },
  "timestamp": "2024-01-26T10:30:00.000Z",
  "correlationId": "mock-1234567890-abc"
}
```

### 2. New Transactions

```json
{
  "type": "transaction_new",
  "data": {
    "id": "TX-MOCK-123",
    "borrowerName": "Mock Company C",
    "type": "Equipment Loan",
    "amount": 500000,
    "status": "application",
    "stage": "application",
    "priority": "medium",
    "completionPercentage": 0,
    "nextAction": "Initial review",
    "daysInStage": 0,
    "documents": 0,
    "messages": 0,
    "customerId": "CUST-MOCK-003"
  },
  "timestamp": "2024-01-26T10:30:00.000Z",
  "correlationId": "mock-1234567890-def"
}
```

### 3. Stage Changes

```json
{
  "type": "stage_change",
  "data": {
    "id": "TX-MOCK-001",
    "oldStage": "application",
    "newStage": "underwriting",
    "updatedAt": "2024-01-26"
  },
  "timestamp": "2024-01-26T10:30:00.000Z",
  "correlationId": "mock-1234567890-ghi"
}
```

### 4. Bulk Updates

```json
{
  "type": "bulk_update",
  "data": {
    "type": "bulk_update",
    "updateType": "status_change",
    "affectedTransactions": ["TX-MOCK-001", "TX-MOCK-002"],
    "changes": {
      "status": "underwriting",
      "stage": "underwriting"
    },
    "reason": "Batch processing completed"
  },
  "timestamp": "2024-01-26T10:30:00.000Z",
  "correlationId": "mock-1234567890-jkl"
}
```

### 5. Conflict Detection

```json
{
  "type": "conflict_detected",
  "data": {
    "transactionId": "TX-MOCK-001",
    "conflictType": "duplicate_application",
    "severity": "warning",
    "description": "Similar application found in system",
    "resolution": "Review recommended"
  },
  "timestamp": "2024-01-26T10:30:00.000Z",
  "correlationId": "mock-1234567890-mno"
}
```

### 6. Business Metrics

```json
{
  "type": "business_metrics",
  "data": {
    "timestamp": "2024-01-26T10:30:00.000Z",
    "hourlyMetrics": {
      "newApplications": 8,
      "completedReviews": 5,
      "approvalRate": 0.78,
      "averageProcessingTime": 3.2
    },
    "portfolioHealth": {
      "totalActive": 45,
      "atRisk": 3,
      "onHold": 2,
      "todaysClosed": 7
    },
    "systemHealth": {
      "activeUsers": 12,
      "queueDepth": 15,
      "processingCapacity": 0.75
    }
  },
  "timestamp": "2024-01-26T10:30:00.000Z"
}
```

### 7. Business Scenarios

The mock server simulates realistic business scenarios:

#### Morning Rush

```json
{
  "type": "scenario_start",
  "data": {
    "scenario": "morning_rush",
    "description": "High volume of new applications",
    "expectedDuration": "30 minutes"
  },
  "timestamp": "2024-01-26T09:00:00.000Z"
}
```

#### Compliance Sweep

```json
{
  "type": "bulk_update",
  "data": {
    "type": "bulk_update",
    "updateType": "status_change",
    "affectedTransactions": ["TX-MOCK-002", "TX-MOCK-003"],
    "changes": {
      "complianceHold": true,
      "holdReason": "Routine compliance review",
      "estimatedClearance": "2024-01-27T10:00:00.000Z"
    },
    "reason": "Monthly compliance sweep initiated"
  },
  "timestamp": "2024-01-26T10:30:00.000Z"
}
```

#### Risk Reassessment

```json
{
  "type": "risk_reassessment",
  "data": {
    "trigger": {
      "type": "market_update",
      "indicator": "interest_rate_change",
      "impact": "negative"
    },
    "affectedTransactions": [
      {
        "id": "TX-MOCK-001",
        "oldRiskScore": "low",
        "newRiskScore": "medium"
      }
    ]
  },
  "timestamp": "2024-01-26T10:30:00.000Z"
}
```

#### Fraud Alert

```json
{
  "type": "security_alert",
  "data": {
    "transactionId": "TX-MOCK-004",
    "alertType": "fraud_suspected",
    "severity": "critical",
    "indicators": ["Unusual transaction pattern detected"],
    "recommendedAction": "Immediate review required",
    "autoActions": ["Transaction frozen", "Compliance team notified"]
  },
  "timestamp": "2024-01-26T10:30:00.000Z"
}
```

### 8. Error Simulation

When error simulation is enabled:

```json
{
  "type": "error",
  "data": {
    "message": "Simulated error for testing"
  },
  "timestamp": "2024-01-26T10:30:00.000Z"
}
```

## Client Messages

The mock server handles the following client messages:

### Subscribe

```json
{
  "type": "subscribe",
  "channel": "transactions",
  "filters": {
    "customerId": "CUST-001"
  }
}
```

### Ping/Pong

```json
{
  "type": "ping"
}
```

Response:

```json
{
  "type": "pong",
  "data": {
    "timestamp": 1706267400000
  },
  "timestamp": "2024-01-26T10:30:00.000Z"
}
```

## Configuration

### Environment Variables

- `REACT_APP_USE_MOCK_WEBSOCKET`: Set to `false` to disable mock WebSocket (default: enabled in development)
- `NODE_ENV`: Mock WebSocket only runs when set to `development`

### LocalStorage Settings

Settings are persisted in localStorage under the key `mockWebSocketSettings`:

```javascript
{
  "messageInterval": 5000,        // Update frequency in milliseconds
  "simulateErrors": false,        // Enable error simulation
  "simulateLatency": true,        // Add network latency simulation
  "enableBusinessScenarios": true, // Enable realistic business scenarios
  "scenarioInterval": 15000       // Business scenario frequency in milliseconds
}
```

## Testing Scenarios

### 1. Connection Reliability

- Enable/disable the mock server to test reconnection logic
- Use error simulation to test error handling

### 2. Real-time Updates

- Adjust update interval to test UI responsiveness
- Monitor performance metrics to ensure smooth updates

### 3. Latency Handling

- Enable latency simulation to test loading states
- Verify UI handles delayed messages gracefully

### 4. Error Recovery

- Enable error simulation to test error boundaries
- Verify the application recovers from WebSocket errors

### 5. Business Scenarios

- **Morning Rush**: Test system behavior under high load
- **Compliance Sweep**: Verify bulk update handling and UI updates
- **Month End Processing**: Test system-wide events and notifications
- **Risk Reassessment**: Verify risk score updates propagate correctly
- **Portfolio Rebalancing**: Test assignment changes and notifications
- **Fraud Alert**: Verify critical alerts are prominently displayed

### 6. Conflict Resolution

- Test duplicate application detection
- Verify credit limit exceeded warnings
- Test document mismatch handling
- Verify compliance hold notifications

### 7. Performance Under Load

- Enable multiple business scenarios simultaneously
- Monitor WebSocket message queue depth
- Verify UI remains responsive with high update frequency
- Test with multiple browser tabs open

## Integration with Performance Monitoring

All mock WebSocket events are automatically tracked:

- Connection attempts and success/failure rates
- Message counts (sent/received)
- Simulated latency measurements
- Error occurrences

View metrics in the Performance Monitoring dashboard at `/performance-monitoring`.

## Troubleshooting

### Mock server not activating

1. Check that `NODE_ENV` is set to `development`
2. Verify `REACT_APP_USE_MOCK_WEBSOCKET` is not set to `false`
3. Check browser console for `[MockWS]` log messages

### Updates not appearing

1. Check the update interval setting (minimum 1000ms)
2. Verify the Transaction Summary page is open
3. Check browser console for mock server messages

### Performance issues

1. Increase the update interval
2. Disable error simulation
3. Check Performance Monitoring for bottlenecks

## Development Tips

1. **Test Different Scenarios**: Use the settings panel to simulate various network conditions
2. **Monitor Performance**: Keep the Performance Monitoring dashboard open to track WebSocket health
3. **Check Console Logs**: Mock server logs all activities with `[MockWS]` prefix
4. **Persist Settings**: Your configuration is saved in localStorage across sessions
5. **Combine with DevTools**: Use browser DevTools Network tab to inspect WebSocket frames
