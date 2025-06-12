# EVA Code Monitoring Tool

A comprehensive 24/7 automated monitoring, analysis, and debugging system for React applications. This tool continuously monitors your application's performance, catches runtime errors, and provides intelligent diagnostics to resolve issues quickly.

## 🔍 Overview

The EVA Code Monitoring Tool consists of three main components:

1. **Performance Analysis Tool** - Analyzes React component performance, bundle size, and API integration
2. **Monitoring Service** - Collects and analyzes runtime errors, performance metrics, and user feedback
3. **Client Integration Utilities** - Hooks and utilities for instrumenting React components

## ⚙️ Features

### Static Analysis
- Component re-render optimization detection
- Bundle size analysis and optimization recommendations
- API integration pattern analysis
- Device responsiveness testing

### Runtime Monitoring
- Real-time error reporting and analysis
- Performance metric collection and visualization
- User feedback collection
- Automatic error diagnosis with fix recommendations

### Development Tools
- React hook for component performance tracking
- Performance tracking wrappers for functions
- Error boundary component wrapper
- API for manual error reporting and metrics

## 🚀 Getting Started

### Prerequisites
- Node.js 14+
- npm or yarn
- React application

### Installation

1. Add the monitoring package to your project dependencies:

```bash
npm install --save-dev eva-code-monitoring
```

2. Add the required scripts to your package.json:

```json
"scripts": {
  "analyze": "node scripts/eva-performance-monitor.js",
  "monitor": "node scripts/eva-monitor-service.js"
}
```

3. Configure environment variables:

```
REACT_APP_MONITOR_URL=http://localhost:3456
REACT_APP_VERSION=1.0.0
```

### Running the Tools

#### Static Analysis

```bash
npm run analyze
```

This will analyze your codebase and generate a report with performance recommendations.

#### Monitoring Service

```bash
npm run monitor
```

This starts the monitoring service which collects runtime metrics and errors.

## 📚 Usage Examples

### Error Reporting

```tsx
import { reportError } from '../utils/errorReporter';

try {
  // Your code here
} catch (error) {
  reportError(error, 'ComponentName', { additionalContext: 'value' });
}
```

### Performance Tracking Hook

```tsx
import React from 'react';
import { usePerformance } from '../hooks/usePerformance';

const MyComponent = (props) => {
  const { withTracking } = usePerformance({
    componentName: 'MyComponent',
    trackRenders: true,
    trackEffects: true,
    trackInteractions: true
  });
  
  const handleClick = withTracking(() => {
    // Your click handler logic
  }, 'button-click');
  
  return <button onClick={handleClick}>Click me</button>;
};
```

### Error Boundary Wrapper

```tsx
import { createErrorBoundary } from '../utils/errorReporter';

const MyComponent = (props) => {
  // Component implementation
};

export default createErrorBoundary(MyComponent, 'MyComponent');
```

## 🏗️ Architecture

### Performance Analysis Tool

The static analysis tool scans your codebase for common performance issues:

- Identifies components that could benefit from React.memo
- Detects missing useCallback and useMemo usage
- Identifies improper dependency arrays in useEffect
- Analyzes bundle size and suggests code splitting opportunities
- Examines API calls for proper error handling

### Monitoring Service

The monitoring service is an Express server that:

- Collects error reports from client applications
- Stores and analyzes performance metrics
- Processes user feedback
- Provides APIs for querying monitoring data
- Generates diagnostic reports for issues

### Client Integration

The client utilities provide:

- Global error handlers for unhandled exceptions
- Performance tracking hooks for React components
- Error boundary components for graceful error handling
- Utility functions for manual error and metric reporting

## 📊 Reports and Analysis

The monitoring system generates several types of reports:

1. **Performance Reports** - Detailed analysis of component rendering performance
2. **Error Diagnostic Reports** - Analysis of runtime errors with fix recommendations
3. **Metric Summaries** - Aggregated performance metrics across the application
4. **User Feedback Reports** - Summaries of user-reported issues and suggestions

## 🔧 Configuration

### Customizing Error Patterns

The monitoring service uses a pattern matching system to diagnose common errors. You can add custom error patterns by editing the `error-patterns.json` file:

```json
[
  {
    "pattern": "Your error pattern text",
    "diagnosis": "Description of the problem",
    "fix": "How to fix the issue",
    "severity": "high|medium|low"
  }
]
```

### Environment Variables

- `MONITOR_PORT` - Port for the monitoring service (default: 3456)
- `REACT_APP_MONITOR_URL` - URL for the client to connect to the monitoring service
- `REACT_APP_VERSION` - Application version for error reporting

## 🛠️ Development and Extensibility

The EVA Code Monitoring Tool is designed to be extended and customized for specific project needs:

### Adding Custom Metrics

You can define and report custom metrics for specific parts of your application:

```ts
import { reportMetric } from '../utils/errorReporter';

reportMetric('api.response.time', responseTime, { 
  unit: 'ms',
  componentName: 'UserProfile',
  context: { endpoint: '/api/users/1' }
});
```

### Creating Custom Analyzers

The static analysis tool can be extended with custom analyzers:

```js
function customAnalyzer(codebase) {
  // Your custom analysis logic
  return {
    issues: [],
    recommendations: []
  };
}

// Add to analyzers list in eva-performance-monitor.js
```

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 