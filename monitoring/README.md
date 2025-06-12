# EVA Platform Monitoring Setup

## Overview

The EVA Platform uses a comprehensive monitoring stack consisting of:

- **InfluxDB**: Time-series database for storing metrics
- **Grafana**: Visualization and dashboarding
- **Performance Monitoring Service**: Frontend service that collects and sends metrics

## Architecture

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────┐
│  EVA Frontend   │────▶│   InfluxDB   │◀────│   Grafana   │
│  (React App)    │     │ (Time-series │     │ (Dashboard) │
└─────────────────┘     │   Database)  │     └─────────────┘
                        └──────────────┘
```

## Setup Instructions

### 1. InfluxDB Setup

#### Using Docker:

```bash
docker run -d \
  --name influxdb \
  -p 8086:8086 \
  -v influxdb-data:/var/lib/influxdb2 \
  -e INFLUXDB_DB=eva_platform \
  -e INFLUXDB_ADMIN_USER=admin \
  -e INFLUXDB_ADMIN_PASSWORD=your-secure-password \
  influxdb:2.7
```

#### Configuration:

1. Access InfluxDB UI at http://localhost:8086
2. Create an organization: `eva-platform`
3. Create a bucket: `eva-metrics`
4. Generate an API token for write access

### 2. Grafana Setup

#### Using Docker:

```bash
docker run -d \
  --name grafana \
  -p 3001:3000 \
  -v grafana-data:/var/lib/grafana \
  -v ./grafana/dashboards:/etc/grafana/provisioning/dashboards \
  grafana/grafana:latest
```

#### Configuration:

1. Access Grafana at http://localhost:3001
2. Default credentials: admin/admin
3. Add InfluxDB data source:
   - Type: InfluxDB
   - Query Language: Flux
   - URL: http://influxdb:8086
   - Organization: eva-platform
   - Token: [Your InfluxDB API token]
   - Default Bucket: eva-metrics

### 3. Frontend Configuration

Add these environment variables to your `.env` file:

```env
REACT_APP_INFLUXDB_URL=http://localhost:8086
REACT_APP_INFLUXDB_TOKEN=your-influxdb-token
REACT_APP_INFLUXDB_ORG=eva-platform
REACT_APP_INFLUXDB_BUCKET=eva-metrics
REACT_APP_ENABLE_MONITORING=true
```

## Metrics Collected

### WebSocket Metrics

- `websocket_connections`: Active WebSocket connections
- `websocket_latency`: Message latency in milliseconds
- `websocket_messages`: Messages sent/received
- `websocket_errors`: Connection errors

### Transaction Metrics

- `transaction_status`: Transaction count by status
- `transaction_volume`: Transaction amounts by type
- `transaction_activity`: Hourly transaction activity
- `transaction_conflicts`: Active conflicts and issues

### API Performance

- `api_performance`: Response times by endpoint
- `auth0_api_health`: Auth0 API success rate
- `export_operations`: Export operations by format

### Business Metrics

- `business_metrics.hourly`: New applications, reviews, approval rates
- `business_metrics.portfolio`: Active transactions, risk distribution
- `business_metrics.system`: System capacity and queue depth

## Dashboard Features

The main EVA Platform dashboard includes:

1. **Real-time Monitoring**

   - WebSocket connection health
   - Live transaction updates
   - API performance tracking

2. **Business Analytics**

   - Transaction volume trends
   - Status distribution pie chart
   - Risk assessment heatmap

3. **Operational Insights**

   - Export operation statistics
   - Auth0 API health gauge
   - Active conflict tracking

4. **Historical Analysis**
   - Transaction activity heatmap
   - Trend analysis over time
   - Performance baselines

## Alerting Rules

Create these alerts in Grafana:

### Critical Alerts

```
1. WebSocket Disconnections
   - Condition: websocket_connections < 1 for 5 minutes
   - Action: Page on-call engineer

2. High API Latency
   - Condition: api_performance > 5000ms for 10 minutes
   - Action: Email team, check logs

3. Auth0 Failures
   - Condition: auth0_success_rate < 90% for 5 minutes
   - Action: Check Auth0 status, failover
```

### Warning Alerts

```
1. High Conflict Rate
   - Condition: transaction_conflicts > 10
   - Action: Notify compliance team

2. Export Failures
   - Condition: export_success_rate < 95%
   - Action: Check disk space, logs

3. Transaction Backlog
   - Condition: queue_depth > 50
   - Action: Scale workers
```

## Custom Queries

### Useful InfluxDB Queries

1. **Transaction Success Rate (Last Hour)**

```flux
from(bucket: "eva-metrics")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "transaction_status")
  |> filter(fn: (r) => r.status == "closed" or r.status == "rejected")
  |> group(columns: ["status"])
  |> count()
```

2. **Peak Hours Analysis**

```flux
from(bucket: "eva-metrics")
  |> range(start: -7d)
  |> filter(fn: (r) => r._measurement == "transaction_activity")
  |> aggregateWindow(every: 1h, fn: sum)
  |> group(columns: ["hour"])
  |> mean()
```

3. **User Activity by Role**

```flux
from(bucket: "eva-metrics")
  |> range(start: -24h)
  |> filter(fn: (r) => r._measurement == "user_activity")
  |> group(columns: ["role"])
  |> count()
```

## Troubleshooting

### Common Issues

1. **No data in Grafana**

   - Check InfluxDB connection settings
   - Verify API token has read permissions
   - Ensure frontend is sending metrics

2. **High memory usage**

   - Adjust InfluxDB retention policies
   - Reduce metric collection frequency
   - Archive old data to cold storage

3. **Dashboard loading slowly**
   - Optimize queries with proper time ranges
   - Use dashboard variables for filtering
   - Enable query caching in Grafana

## Maintenance

### Daily Tasks

- Monitor disk usage for InfluxDB
- Check for failed alerts
- Review error logs

### Weekly Tasks

- Backup InfluxDB data
- Update dashboard based on feedback
- Review and optimize slow queries

### Monthly Tasks

- Archive old metrics data
- Update retention policies
- Performance tune InfluxDB

## Integration with Backend

The monitoring setup is designed to work with both frontend and backend services:

### Frontend Integration

- Performance monitoring service sends metrics directly to InfluxDB
- Mock WebSocket server includes metric simulation
- Real-time updates visible in dashboards

### Backend Integration (Go services)

- Use InfluxDB Go client for metric submission
- Implement middleware for automatic API metrics
- Send business events to same bucket

Example Go integration:

```go
import influxdb2 "github.com/influxdata/influxdb-client-go/v2"

client := influxdb2.NewClient(url, token)
writeAPI := client.WriteAPIBlocking(org, bucket)

point := influxdb2.NewPoint("api_request",
    map[string]string{"endpoint": "/api/transactions"},
    map[string]interface{}{"duration": 125, "status": 200},
    time.Now())

writeAPI.WritePoint(context.Background(), point)
```

## Security Considerations

1. **API Tokens**

   - Use separate tokens for read/write operations
   - Rotate tokens regularly
   - Store tokens in environment variables

2. **Network Security**

   - Use HTTPS for all connections
   - Implement IP whitelisting for Grafana
   - Enable authentication on all services

3. **Data Privacy**
   - Don't log sensitive transaction details
   - Aggregate user data before storing
   - Implement data retention policies

## Resources

- [InfluxDB Documentation](https://docs.influxdata.com/)
- [Grafana Documentation](https://grafana.com/docs/)
- [EVA Platform Metrics Guide](./metrics-guide.md)
- [Dashboard JSON](./grafana/dashboards/eva-platform-dashboard.json)
