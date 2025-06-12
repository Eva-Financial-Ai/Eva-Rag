# EVA Platform Monitoring - Next Steps Guide

## Overview

This guide provides step-by-step instructions for implementing and testing the enhanced monitoring capabilities of the EVA platform.

## 1. Test the Enhanced Mock WebSocket Server

### A. Verify Mock Server in Development

1. **Check the Mock WebSocket Control Panel**

   - Look for the control panel in the bottom-left corner of your app
   - Ensure "Mock WebSocket" shows as "Enabled"
   - Click the gear icon to see settings

2. **Test Business Scenarios**

   - Enable "Business Scenarios" toggle
   - Click manual trigger buttons:
     - Morning Rush: Simulates high volume of new applications
     - Compliance Sweep: Tests bulk transaction holds
     - Month End: Simulates batch processing
     - Fraud Alert: Tests critical security alerts

3. **Monitor the Transaction Summary Page**
   - Navigate to `/transactions` or Transaction Summary in the menu
   - Watch for real-time updates as scenarios run
   - Verify that transactions move through stages
   - Check that conflicts appear and resolve

### B. Use the Test HTML Page

1. **Open the test page**

   ```bash
   open test-mock-websocket.html
   ```

2. **Observe the message flow**
   - Watch the real-time metrics update
   - See different message types with color coding
   - Test manual scenario triggers
   - Monitor transaction and conflict counts

## 2. Deploy the Monitoring Stack

### A. Set Up InfluxDB

1. **Create a docker-compose file** for easier management:

```yaml
# monitoring-stack.yml
version: '3.8'

services:
  influxdb:
    image: influxdb:2.7
    container_name: eva-influxdb
    ports:
      - '8086:8086'
    volumes:
      - influxdb-data:/var/lib/influxdb2
      - influxdb-config:/etc/influxdb2
    environment:
      - DOCKER_INFLUXDB_INIT_MODE=setup
      - DOCKER_INFLUXDB_INIT_USERNAME=admin
      - DOCKER_INFLUXDB_INIT_PASSWORD=evaplatform2024
      - DOCKER_INFLUXDB_INIT_ORG=eva-platform
      - DOCKER_INFLUXDB_INIT_BUCKET=eva-metrics
      - DOCKER_INFLUXDB_INIT_ADMIN_TOKEN=eva-super-secret-auth-token
    restart: unless-stopped

  grafana:
    image: grafana/grafana:latest
    container_name: eva-grafana
    ports:
      - '3001:3000'
    volumes:
      - grafana-data:/var/lib/grafana
      - ./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards
      - ./monitoring/grafana/datasources:/etc/grafana/provisioning/datasources
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=evaplatform2024
      - GF_INSTALL_PLUGINS=grafana-clock-panel,grafana-simple-json-datasource
    depends_on:
      - influxdb
    restart: unless-stopped

volumes:
  influxdb-data:
  influxdb-config:
  grafana-data:
```

2. **Create Grafana datasource configuration**:

```bash
mkdir -p monitoring/grafana/datasources
```

Create `monitoring/grafana/datasources/influxdb.yml`:

```yaml
apiVersion: 1

datasources:
  - name: InfluxDB
    type: influxdb
    access: proxy
    url: http://influxdb:8086
    jsonData:
      version: Flux
      organization: eva-platform
      defaultBucket: eva-metrics
      tlsSkipVerify: true
    secureJsonData:
      token: eva-super-secret-auth-token
```

3. **Start the monitoring stack**:

```bash
docker-compose -f monitoring-stack.yml up -d
```

### B. Configure the Frontend

1. **Update your `.env` file**:

```env
# Monitoring Configuration
REACT_APP_INFLUXDB_URL=http://localhost:8086
REACT_APP_INFLUXDB_TOKEN=eva-super-secret-auth-token
REACT_APP_INFLUXDB_ORG=eva-platform
REACT_APP_INFLUXDB_BUCKET=eva-metrics
REACT_APP_ENABLE_MONITORING=true
```

2. **Restart your development server** to pick up the new environment variables

## 3. Import and Configure Grafana Dashboard

### A. Access Grafana

1. Open http://localhost:3001
2. Login with `admin` / `evaplatform2024`
3. Change password if prompted

### B. Import the Dashboard

1. Click "+" → "Import" in the left sidebar
2. Click "Upload JSON file"
3. Select `monitoring/grafana/dashboards/eva-platform-dashboard.json`
4. Select "InfluxDB" as the data source
5. Click "Import"

### C. Verify Dashboard

1. Check that all panels are loading data
2. If panels show "No Data":
   - Verify InfluxDB is running: `docker ps`
   - Check InfluxDB logs: `docker logs eva-influxdb`
   - Ensure the frontend is sending metrics

## 4. Configure Alerts

### A. Create Alert Rules in Grafana

1. **WebSocket Health Alert**

   - Go to Alerting → Alert rules
   - Click "New alert rule"
   - Name: "WebSocket Connection Lost"
   - Query:
     ```
     from(bucket: "eva-metrics")
       |> range(start: -5m)
       |> filter(fn: (r) => r._measurement == "websocket_connections")
       |> last()
     ```
   - Condition: WHEN last() IS BELOW 1
   - For: 5 minutes
   - Annotations: Add severity = "critical"

2. **High Transaction Conflicts**
   - Name: "High Conflict Rate"
   - Query for conflict count
   - Condition: WHEN last() IS ABOVE 10
   - For: 10 minutes
   - Annotations: Add severity = "warning"

### B. Set Up Notification Channels

1. Go to Alerting → Notification channels
2. Add channels for:
   - Email notifications
   - Slack (if used)
   - PagerDuty (for critical alerts)

## 5. Test the Complete System

### A. Generate Test Data

1. **Enable all mock features**:

   - Open the MockWebSocketControl panel
   - Enable: Errors, Latency, Business Scenarios
   - Set update interval to 2000ms for faster testing

2. **Run stress test scenarios**:
   - Open multiple browser tabs with the app
   - Trigger different scenarios simultaneously
   - Export data in various formats
   - Make Auth0 API calls (user management)

### B. Monitor in Grafana

1. **Watch real-time updates**:

   - WebSocket connections should show active connections
   - Transaction volume should increase
   - Export operations should register
   - Conflicts should appear when triggered

2. **Check historical data**:
   - Change time range to "Last 1 hour"
   - Verify data persistence
   - Check heatmap for activity patterns

## 6. Production Deployment Considerations

### A. Security Hardening

1. **Change all default passwords**
2. **Use environment-specific tokens**
3. **Enable HTTPS for all services**
4. **Implement network isolation**

### B. Scaling Considerations

1. **InfluxDB**:

   - Configure retention policies
   - Set up continuous queries for aggregation
   - Plan for data archival

2. **Grafana**:
   - Enable caching
   - Use dashboard variables
   - Optimize query performance

### C. Backup Strategy

1. **Automated backups**:

   ```bash
   # Backup InfluxDB
   docker exec eva-influxdb influx backup /backup

   # Backup Grafana
   docker exec eva-grafana grafana-cli admin data-backup /var/lib/grafana/backups
   ```

2. **Test restore procedures regularly**

## 7. Extend the Metrics

### A. Add Custom Business Metrics

1. **Track user behavior**:

   ```typescript
   performanceMonitor.recordMetric('user.action', 1, {
     action: 'loan_application_started',
     userRole: 'broker',
   });
   ```

2. **Monitor feature usage**:
   ```typescript
   performanceMonitor.recordMetric('feature.usage', 1, {
     feature: 'bulk_export',
     format: 'csv',
   });
   ```

### B. Create Custom Dashboards

1. **User Activity Dashboard**
2. **Business KPI Dashboard**
3. **System Performance Dashboard**

## Troubleshooting

### Common Issues

1. **"No Data" in Grafana**

   - Check browser console for metric sending errors
   - Verify InfluxDB token in .env
   - Ensure REACT_APP_ENABLE_MONITORING=true

2. **Mock WebSocket not working**

   - Check browser console for [MockWS] logs
   - Verify mock server is enabled
   - Try refreshing the page

3. **Docker containers not starting**
   - Check port conflicts: `lsof -i :8086` and `lsof -i :3001`
   - Review docker logs: `docker-compose logs`
   - Ensure Docker daemon is running

### Debug Commands

```bash
# Check InfluxDB health
curl -I http://localhost:8086/health

# Test InfluxDB write
curl -X POST http://localhost:8086/api/v2/write?org=eva-platform&bucket=eva-metrics \
  -H "Authorization: Token eva-super-secret-auth-token" \
  -H "Content-Type: text/plain" \
  --data-raw "test,tag1=value1 field1=123 $(date +%s)000000000"

# View Grafana logs
docker logs eva-grafana -f

# Check metric ingestion
docker exec eva-influxdb influx query 'from(bucket:"eva-metrics") |> range(start: -1h) |> limit(n:10)'
```

## Next Development Tasks

1. **Implement real WebSocket metrics** in production WebSocket service
2. **Add performance budgets** with automated alerts
3. **Create mobile-specific dashboards**
4. **Implement distributed tracing** for complex transactions
5. **Add machine learning** for anomaly detection

## Resources

- [InfluxDB Best Practices](https://docs.influxdata.com/influxdb/v2.7/write-data/best-practices/)
- [Grafana Dashboard Best Practices](https://grafana.com/docs/grafana/latest/best-practices/dashboard-management/)
- [Time Series Data Modeling](https://docs.influxdata.com/influxdb/v2.7/reference/key-concepts/data-schema/)
- [Monitoring Strategy Guide](https://www.datadoghq.com/blog/monitoring-101-collecting-data/)
