import { debugLog } from '../utils/auditLogger';

#!/usr/bin/env node

/**
 * EVA Code Monitoring Service
 * 
 * This service continuously monitors application logs, performance metrics,
 * error reports, and user feedback to detect and diagnose issues in real-time.
 * It uses AI to analyze patterns and suggest fixes for common problems.
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const axios = require('axios');
const chalk = require('chalk');

// Configuration
const PORT = process.env.MONITOR_PORT || 3456;
const LOGS_DIR = path.join(process.cwd(), 'monitoring-logs');
const REPORTS_DIR = path.join(process.cwd(), 'monitoring-reports');
const ERROR_PATTERNS_FILE = path.join(process.cwd(), 'scripts', 'error-patterns.json');

// Create directories
[LOGS_DIR, REPORTS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Initialize express app
const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// Error patterns for quick diagnosis
let errorPatterns = [];
try {
  if (fs.existsSync(ERROR_PATTERNS_FILE)) {
    errorPatterns = JSON.parse(fs.readFileSync(ERROR_PATTERNS_FILE, 'utf8'));
  } else {
    // Default patterns if file doesn't exist
    errorPatterns = [
      {
        pattern: "TypeError: Cannot read property",
        diagnosis: "Null or undefined object access",
        fix: "Add null checks before accessing properties",
        severity: "high"
      },
      {
        pattern: "Maximum update depth exceeded",
        diagnosis: "Infinite render loop",
        fix: "Check dependency arrays in useEffect or update conditions",
        severity: "high"
      },
      {
        pattern: "Failed to fetch",
        diagnosis: "API connection issue",
        fix: "Check network connectivity and API endpoint status",
        severity: "medium"
      }
    ];
    fs.writeFileSync(ERROR_PATTERNS_FILE, JSON.stringify(errorPatterns, null, 2));
  }
} catch (error) {
  console.error('Error loading error patterns:', error);
}

// In-memory storage for recent errors
const recentErrors = [];
const recentMetrics = [];

// Log a message to console and file
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
  
  // Console output with colors
  switch (type) {
    case 'error':
      console.error(chalk.red(logMessage));
      break;
    case 'warning':
      console.warn(chalk.yellow(logMessage));
      break;
    case 'success':
      debugLog('general', 'log_statement', chalk.green(logMessage));
      break;
    default:
      debugLog('general', 'log_statement', chalk.blue(logMessage));
  }
  
  // File output
  const logFile = path.join(LOGS_DIR, `monitor-${new Date().toISOString().split('T')[0]}.log`);
  fs.appendFileSync(logFile, logMessage + '\n');
}

// Analyze error stack and provide diagnostic info
function analyzeError(error) {
  const { message, stack, context } = error;
  
  // Check against known error patterns
  const matchedPatterns = errorPatterns.filter(pattern => 
    message && message.includes(pattern.pattern)
  );
  
  // Basic analysis result
  const analysis = {
    error,
    timestamp: new Date().toISOString(),
    diagnosis: matchedPatterns.length > 0 
      ? matchedPatterns.map(p => p.diagnosis).join(', ')
      : 'Unknown error pattern',
    possibleFixes: matchedPatterns.length > 0 
      ? matchedPatterns.map(p => p.fix) 
      : ['Requires manual investigation'],
    severity: matchedPatterns.length > 0 
      ? matchedPatterns[0].severity 
      : 'unknown',
    relatedComponents: findAffectedComponents(stack),
    stackInfo: parseStackTrace(stack)
  };
  
  return analysis;
}

// Find components mentioned in stack trace
function findAffectedComponents(stack) {
  if (!stack) return [];
  
  // Extract component names from stack trace (simple approach)
  const componentRegex = /\/components\/([^/]+\/[^/]+)\.(jsx|tsx|js|ts)/g;
  const matches = [];
  let match;
  
  while ((match = componentRegex.exec(stack)) !== null) {
    matches.push(match[1]);
  }
  
  return [...new Set(matches)]; // Unique values
}

// Parse stack trace into structured data
function parseStackTrace(stack) {
  if (!stack) return [];
  
  const lines = stack.split('\n').filter(line => line.trim().startsWith('at '));
  return lines.map(line => {
    const parts = line.trim().substring(3).split(' ');
    if (parts.length === 1) {
      return { location: parts[0], function: 'anonymous' };
    }
    return {
      function: parts[0],
      location: parts[1].replace(/[()]/g, '')
    };
  });
}

// Generate fix recommendation based on analysis
function generateFixRecommendation(analysis) {
  const { error, diagnosis, stackInfo, relatedComponents } = analysis;
  
  let recommendation = `## Error Diagnosis\n\n${diagnosis}\n\n`;
  
  if (relatedComponents.length > 0) {
    recommendation += `## Affected Components\n\n${relatedComponents.join(', ')}\n\n`;
  }
  
  recommendation += `## Recommended Actions\n\n`;
  recommendation += analysis.possibleFixes.map(fix => `- ${fix}`).join('\n');
  
  if (stackInfo.length > 0) {
    recommendation += `\n\n## Stack Information\n\n`;
    recommendation += `Error occurred in: ${stackInfo[0].function} at ${stackInfo[0].location}`;
  }
  
  return recommendation;
}

// API endpoints
app.post('/api/error', (req, res) => {
  try {
    const error = req.body;
    log(`Received error report: ${error.message}`, 'error');
    
    // Add to recent errors
    const analysis = analyzeError(error);
    recentErrors.push(analysis);
    
    // Keep only latest 100 errors
    if (recentErrors.length > 100) {
      recentErrors.shift();
    }
    
    // Generate fix recommendation
    const fix = generateFixRecommendation(analysis);
    
    // Save detailed report
    const reportFile = path.join(
      REPORTS_DIR, 
      `error-${new Date().toISOString().replace(/:/g, '-')}.json`
    );
    fs.writeFileSync(reportFile, JSON.stringify({ error, analysis, fix }, null, 2));
    
    return res.json({ 
      received: true, 
      analysis: {
        diagnosis: analysis.diagnosis,
        severity: analysis.severity,
        components: analysis.relatedComponents
      },
      fixRecommendation: fix
    });
  } catch (err) {
    log(`Error processing error report: ${err.message}`, 'error');
    return res.status(500).json({ error: 'Failed to process error' });
  }
});

app.post('/api/metric', (req, res) => {
  try {
    const metric = req.body;
    log(`Received performance metric: ${metric.name} = ${metric.value}`, 'info');
    
    // Add to recent metrics
    recentMetrics.push({
      ...metric,
      timestamp: new Date().toISOString()
    });
    
    // Keep only latest 1000 metrics
    if (recentMetrics.length > 1000) {
      recentMetrics.shift();
    }
    
    return res.json({ received: true });
  } catch (err) {
    log(`Error processing metric: ${err.message}`, 'error');
    return res.status(500).json({ error: 'Failed to process metric' });
  }
});

app.post('/api/feedback', (req, res) => {
  try {
    const feedback = req.body;
    log(`Received user feedback: ${feedback.text}`, 'info');
    
    // Save feedback
    const feedbackFile = path.join(
      REPORTS_DIR, 
      `feedback-${new Date().toISOString().replace(/:/g, '-')}.json`
    );
    fs.writeFileSync(feedbackFile, JSON.stringify(feedback, null, 2));
    
    return res.json({ received: true });
  } catch (err) {
    log(`Error processing feedback: ${err.message}`, 'error');
    return res.status(500).json({ error: 'Failed to process feedback' });
  }
});

app.get('/api/status', (req, res) => {
  return res.json({
    status: 'running',
    uptime: process.uptime(),
    errorsProcessed: recentErrors.length,
    metricsCollected: recentMetrics.length
  });
});

app.get('/api/errors/recent', (req, res) => {
  return res.json({
    count: recentErrors.length,
    errors: recentErrors.slice(-10) // Return latest 10
  });
});

app.get('/api/metrics/recent', (req, res) => {
  return res.json({
    count: recentMetrics.length,
    metrics: recentMetrics.slice(-50) // Return latest 50
  });
});

// Start server
app.listen(PORT, () => {
  log(`EVA Code Monitoring Service running on port ${PORT}`, 'success');
  log(`Monitor endpoints:`);
  log(`- POST /api/error: Report runtime errors`);
  log(`- POST /api/metric: Report performance metrics`);
  log(`- POST /api/feedback: Submit user feedback`);
  log(`- GET /api/status: Service status`);
  log(`- GET /api/errors/recent: View recent errors`);
  log(`- GET /api/metrics/recent: View recent metrics`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  log('Shutting down monitoring service...', 'info');
  process.exit(0);
});

// Export functions for testing
module.exports = {
  analyzeError,
  findAffectedComponents,
  parseStackTrace,
  generateFixRecommendation
}; 