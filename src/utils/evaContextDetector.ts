import { Transaction, useWorkflow } from '../contexts/WorkflowContext';

export interface EVAContextData {
  pageTitle: string;
  pageType: 'dashboard' | 'transaction' | 'form' | 'report' | 'unknown';
  greeting: string;
  data: any;
  suggestions: string[];
  timestamp?: string;
}

export class EVAContextDetector {
  private static instance: EVAContextDetector;

  private constructor() {}

  public static getInstance(): EVAContextDetector {
    if (!EVAContextDetector.instance) {
      EVAContextDetector.instance = new EVAContextDetector();
    }
    return EVAContextDetector.instance;
  }

  private contextMap: Record<string, EVAContextData> = {
    '/': {
      pageTitle: 'Main Dashboard',
      pageType: 'dashboard',
      greeting: "Welcome! I'm analyzing your main dashboard. How can I help you today?",
      data: this.extractPageData(),
      suggestions: [
        'Show me my portfolio performance',
        'What are my pending transactions?',
        'Help me create a new loan application',
        'Explain my risk metrics',
      ],
    },
    '/dashboard': {
      pageTitle: 'Analytics Dashboard',
      pageType: 'dashboard',
      greeting: "I'm reviewing your dashboard metrics. What would you like to know?",
      data: this.extractPageData(),
      suggestions: [
        'Show me my portfolio performance',
        'What are my pending transactions?',
        'Help me create a new loan application',
        'Explain my risk metrics',
      ],
    },
    '/transactions': {
      pageTitle: 'Transaction Management',
      pageType: 'transaction',
      greeting: "I see you're working with transactions. How can I assist you?",
      data: this.extractTransactionData(),
      suggestions: [
        'Show me recent transactions',
        'Filter by transaction status',
        'Export transaction data',
        'Check transaction details',
      ],
    },
    '/applications': {
      pageTitle: 'Loan Applications',
      pageType: 'form',
      greeting: "I'm here to help with loan applications. What do you need?",
      data: this.extractFormData(),
      suggestions: [
        'Help me fill out this application',
        'Check application status',
        'Review required documents',
        'Submit for approval',
      ],
    },
    '/reports': {
      pageTitle: 'Financial Reports',
      pageType: 'report',
      greeting: 'I can help you understand these reports. What would you like to explore?',
      data: this.extractPageData(),
      suggestions: [
        'Explain this report',
        'Generate a new report',
        'Export data',
        'Compare with previous periods',
      ],
    },
    '/portfolio': {
      pageTitle: 'Portfolio Management',
      pageType: 'dashboard',
      greeting: "I'm analyzing your portfolio data. How can I help?",
      data: this.extractPageData(),
      suggestions: [
        'Show portfolio performance',
        'Analyze risk metrics',
        'Review asset allocation',
        'Compare benchmarks',
      ],
    },
  };

  // Get current page context
  public getCurrentPageContext(): EVAContextData | null {
    try {
      const currentPath = window.location.pathname;

      // Direct match first
      if (this.contextMap[currentPath]) {
        return this.contextMap[currentPath];
      }

      // Match dynamic routes
      for (const [pattern, contextData] of Object.entries(this.contextMap)) {
        if (currentPath.startsWith(pattern.split('/')[1] ? `/${pattern.split('/')[1]}` : pattern)) {
          return contextData;
        }
      }

      // Default context with extracted data
      return this.getDefaultContext();
    } catch (error) {
      console.error('Error getting page context:', error);
      return this.getDefaultContext();
    }
  }

  // Extract data from current page
  private extractPageData(): any {
    try {
      const pageTitle = document.title || 'Unknown Page';
      const metrics = this.extractMetrics();
      const tables = this.extractTableData();

      return {
        pageTitle,
        metrics,
        tables,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error extracting page data:', error);
      return { error: 'Failed to extract page data' };
    }
  }

  // Extract metrics from page
  private extractMetrics(): Record<string, any> {
    const metrics: Record<string, any> = {};

    try {
      const metricElements = document.querySelectorAll(
        '[data-metric], .metric, .kpi-value, .stat-value'
      );
      metricElements.forEach(element => {
        const label =
          element.getAttribute('data-label') ||
          element.previousElementSibling?.textContent ||
          'Metric';
        const value = element.textContent;

        if (label && value) {
          metrics[label.trim()] = value.trim();
        }
      });

      // Also extract common dashboard elements
      const amounts = document.querySelectorAll('[class*="amount"], [class*="currency"]');
      amounts.forEach((element, index) => {
        const text = element.textContent;
        if (text && text.includes('$')) {
          metrics[`amount_${index}`] = text.trim();
        }
      });

      const percentages = document.querySelectorAll('[class*="percent"], [class*="rate"]');
      percentages.forEach((element, index) => {
        const text = element.textContent;
        if (text && text.includes('%')) {
          metrics[`percentage_${index}`] = text.trim();
        }
      });
    } catch (error) {
      console.error('Error extracting metrics:', error);
    }

    return metrics;
  }

  // Extract table data
  private extractTableData(): any[] {
    const tables: any[] = [];

    try {
      const tableElements = document.querySelectorAll('table');
      tableElements.forEach((table, tableIndex) => {
        const headers: string[] = [];
        const rows: any[] = [];

        // Extract headers
        const headerRow = table.querySelector('thead tr, tr:first-child');
        if (headerRow) {
          const headerCells = headerRow.querySelectorAll('th, td');
          headerCells.forEach(cell => {
            headers.push(cell.textContent?.trim() || '');
          });
        }

        // Extract data rows
        const dataRows = table.querySelectorAll('tbody tr, tr:not(:first-child)');
        dataRows.forEach(row => {
          const rowData: Record<string, string> = {};
          const cells = row.querySelectorAll('td, th');
          cells.forEach((cell, cellIndex) => {
            const header = headers[cellIndex] || `column_${cellIndex}`;
            rowData[header] = cell.textContent?.trim() || '';
          });
          rows.push(rowData);
        });

        tables.push({
          index: tableIndex,
          headers,
          rows,
          rowCount: rows.length,
        });
      });
    } catch (error) {
      console.error('Error extracting table data:', error);
    }

    return tables;
  }

  // Extract form data
  private extractFormData(): any {
    const formData: Record<string, any> = {};

    try {
      // Get all form inputs
      document.querySelectorAll('input, select, textarea').forEach(input => {
        const element = input as HTMLInputElement;
        if (element.name && element.value) {
          formData[element.name] = element.value;
        }
      });

      // Get form progress if available
      const progressElement = document.querySelector('[data-progress], .progress');
      if (progressElement) {
        formData.progress = progressElement.textContent || this.calculateFormProgress();
      }

      return formData;
    } catch (error) {
      console.error('Error extracting form data:', error);
      return {};
    }
  }

  // Extract transaction-specific data
  private extractTransactionData(): any {
    const transactionId = this.getTransactionIdFromURL();

    return {
      transactionId,
      status: document.querySelector('[data-field="status"]')?.textContent || 'Unknown',
      amount: document.querySelector('[data-field="amount"]')?.textContent || '$0',
      stage: document.querySelector('[data-field="stage"]')?.textContent || 'Unknown',
      formData: this.extractFormData(),
    };
  }

  // Get transaction ID from URL
  private getTransactionIdFromURL(): string | null {
    const match = window.location.pathname.match(/\/transactions\/([^\/]+)/);
    return match ? match[1] : null;
  }

  // Calculate form completion percentage
  private calculateFormProgress(): string {
    const totalFields = document.querySelectorAll('input, select, textarea').length;
    const filledFields = document.querySelectorAll(
      'input:not([value=""]), select:not([value=""]), textarea:not(:empty)'
    ).length;

    const percentage = totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;
    return `${percentage}%`;
  }

  private getDefaultContext(): EVAContextData {
    return {
      pageTitle: document.title || 'EVA Platform',
      pageType: 'unknown',
      greeting: "I'm EVA, your AI assistant. I'm analyzing this page to help you better.",
      data: this.extractPageData(),
      suggestions: [
        'Tell me about this page',
        'Help me navigate',
        'Show me available options',
        'Explain what I can do here',
      ],
    };
  }

  // Get context for specific user
  getContextForUser(userId: string): any {
    const userKey = `eva_context_${userId}`;
    const savedContext = localStorage.getItem(userKey);

    if (savedContext) {
      try {
        return JSON.parse(savedContext);
      } catch (error) {
        console.error('Error parsing saved context:', error);
      }
    }

    return this.getCurrentPageContext();
  }

  // Save context for user
  saveContextForUser(userId: string, context: any): void {
    const userKey = `eva_context_${userId}`;
    localStorage.setItem(userKey, JSON.stringify(context));
  }
}

// Export singleton instance
export const _evaContextDetector = EVAContextDetector.getInstance();
