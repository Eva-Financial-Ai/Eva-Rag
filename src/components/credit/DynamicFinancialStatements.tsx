import React, { useState, useEffect, useCallback, useMemo } from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { UserContext } from '../../contexts/UserContext';
import { FileItem } from '../document/FilelockDriveApp';
import DocumentViewer from '../document/DocumentViewer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheck,
  faSpinner,
  faExclamationTriangle,
  faSync,
  faShieldAlt,
} from '@fortawesome/free-solid-svg-icons';

/**
 * STRIPE FINANCIAL APIs FOR RISK UNDERWRITING
 *
 * This component integrates multiple Stripe APIs to provide comprehensive financial
 * data for credit risk assessment and underwriting decisions:
 *
 * 1. STRIPE FINANCIAL CONNECTIONS API
 *    - Bank account verification and linking
 *    - Real-time account balances
 *    - Transaction history and categorization
 *    - Open banking compliance
 *
 * 2. STRIPE CONNECT API (Express/Standard Accounts)
 *    - Merchant processing volume and revenue
 *    - Payment history and patterns
 *    - Account verification status
 *    - Payout schedules and history
 *
 * 3. STRIPE REPORTING API
 *    - Revenue analytics and trends
 *    - Transaction summaries by period
 *    - Fee breakdowns and net revenue
 *    - Growth metrics and seasonality
 *
 * 4. STRIPE RADAR (Risk & Fraud Detection)
 *    - Fraud risk scores and signals
 *    - Blocked transaction analytics
 *    - Payment pattern analysis
 *    - Merchant risk assessment
 *
 * 5. STRIPE BALANCE TRANSACTIONS API
 *    - Detailed transaction history
 *    - Fee structures and costs
 *    - Refund and adjustment tracking
 *    - Cash flow analysis
 *
 * 6. STRIPE DISPUTES API
 *    - Chargeback rates and trends
 *    - Dispute reason codes
 *    - Win/loss ratios
 *    - Financial impact analysis
 *
 * 7. STRIPE PAYOUTS API
 *    - Payout history and frequency
 *    - Cash flow timing analysis
 *    - Bank account verification
 *    - Settlement patterns
 *
 * These APIs provide lenders with:
 * - Payment processing health metrics
 * - Revenue stability and growth indicators
 * - Risk assessment data (disputes, fraud)
 * - Cash flow patterns and predictability
 * - Bank account verification and history
 * - Business model validation through payment data
 */

// Extended FileItem interface for financial documents
interface ExtendedFileItem extends FileItem {
  financialMetadata?: {
    documentType?: string;
    period?: string;
    accountId?: string;
    contextualNotes?: string[];
    financialData?: {
      totalRevenue?: number;
      totalExpenses?: number;
      netIncome?: number;
      totalAssets?: number;
      totalLiabilities?: number;
    };
  };
}

// Enhanced interfaces for dynamic connections
interface ConnectedAccount {
  id: string;
  institutionName: string;
  accountName: string;
  accountType: 'checking' | 'savings' | 'credit' | 'investment' | 'other';
  balance?: number;
  mask?: string;
  isVerified: boolean;
  lastSynced?: string;
  connectionMethod: 'plaid' | 'quickbooks' | 'netsuite' | 'xero' | 'manual' | 'stripe';
  documents?: GeneratedDocument[];
}

interface GeneratedDocument {
  id: string;
  name: string;
  type: 'profit_loss' | 'balance_sheet' | 'cash_flow' | 'bank_statement' | 'tax_return';
  period: string;
  dateGenerated: string;
  status: 'generating' | 'ready' | 'error' | 'verified';
  url?: string;
  fileSize?: number;
  accountId?: string;
  provider?: string;
  comments?: DocumentComment[];
  metadata?: {
    totalRevenue?: number;
    totalExpenses?: number;
    netIncome?: number;
    totalAssets?: number;
    totalLiabilities?: number;
    totalEquity?: number;
    contextualNotes?: string[];
    accountName?: string;
    institution?: string;
    statementPeriod?: string;
    transactionCount?: number;
    averageBalance?: number;
    monthlyGrowth?: string;
    transactionVolume?: number;
    averageTransactionSize?: number;
    topCustomers?: string[];
    reportPeriod?: string;
    grossMargin?: string;
    asOfDate?: string;
    currentRatio?: number;
    reportType?: string;
    subsidiaries?: string[];
    currencies?: string[];
    consolidatedRevenue?: number;
    includesReports?: string[];
    reportingPeriod?: string;
    riskScore?: string;
    disputeRate?: string;
    industryAverage?: string;
    fraudPreventionSavings?: string;
    paymentMethods?: string[];
    verificationMethod?: string;
    verificationDate?: string;
    accountOwnership?: string;
  };
}

interface DocumentComment {
  id: string;
  text: string;
  user: string;
  timestamp: string;
  page?: number;
  position?: { x: number; y: number };
  type: 'general' | 'question' | 'approval' | 'correction';
}

interface FinancialProvider {
  id: string;
  name: string;
  logo: string;
  description: string;
  supportedDocuments: string[];
  connectionTime: string;
  isConnected: boolean;
}

interface DynamicFinancialStatementsProps {
  userType?: string;
  onDocumentsGenerated?: (documents: GeneratedDocument[]) => void;
  onAccountsConnected?: (accounts: ConnectedAccount[]) => void;
  onSyncData?: () => Promise<void>;
  onDocumentView?: (document: GeneratedDocument) => void;
}

const DynamicFinancialStatements: React.FC<DynamicFinancialStatementsProps> = ({
  userType = 'borrower',
  onDocumentsGenerated,
  onAccountsConnected,
  onSyncData,
  onDocumentView,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // const userContext = useContext(UserContext);

  // Connection and account state
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [generatedDocuments, setGeneratedDocuments] = useState<GeneratedDocument[]>([]);
  // const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Document viewing state
  // const [selectedDocument, setSelectedDocument] = useState<GeneratedDocument | null>(null);
  const [viewerFile, setViewerFile] = useState<ExtendedFileItem | null>(null);
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);

  // Generation and sync state
  // const [isGeneratingDocuments, setIsGeneratingDocuments] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  // const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());

  // UI state
  const [activeTab, setActiveTab] = useState<'connect' | 'documents' | 'review'>('connect');
  // const [expandedAccount, setExpandedAccount] = useState<string | null>(null);

  // Financial providers with enhanced connection capabilities
  const financialProviders: FinancialProvider[] = useMemo(
    () => [
      {
        id: 'plaid',
        name: 'Plaid Bank Connection',
        logo: '🏦',
        description: 'Connect 11,000+ banks and credit unions securely',
        supportedDocuments: ['Bank Statements', 'Transaction History', 'Account Balances'],
        connectionTime: '2-3 minutes',
        isConnected: connectedAccounts.some(acc => acc.connectionMethod === 'plaid'),
      },
      {
        id: 'stripe',
        name: 'Stripe Financial Suite',
        logo: '💳',
        description: 'Access payment processing data and financial connections',
        supportedDocuments: [
          'Payment Processing Reports',
          'Revenue Analytics',
          'Risk Assessment Data',
          'Bank Account Connections',
          'Dispute & Chargeback History',
        ],
        connectionTime: '3-5 minutes',
        isConnected: connectedAccounts.some(acc => acc.connectionMethod === 'stripe'),
      },
      {
        id: 'quickbooks',
        name: 'QuickBooks Online',
        logo: '📊',
        description: 'Import complete financial statements and reports',
        supportedDocuments: ['P&L Statements', 'Balance Sheets', 'Cash Flow', 'A/R & A/P Reports'],
        connectionTime: '3-5 minutes',
        isConnected: connectedAccounts.some(acc => acc.connectionMethod === 'quickbooks'),
      },
      {
        id: 'netsuite',
        name: 'Oracle NetSuite',
        logo: '🏢',
        description: 'Enterprise-grade financial data integration',
        supportedDocuments: [
          'Financial Statements',
          'Trial Balance',
          'Budget Reports',
          'KPI Dashboards',
        ],
        connectionTime: '5-10 minutes',
        isConnected: connectedAccounts.some(acc => acc.connectionMethod === 'netsuite'),
      },
      {
        id: 'xero',
        name: 'Xero Accounting',
        logo: '💼',
        description: 'Small business accounting platform',
        supportedDocuments: ['P&L Statements', 'Balance Sheets', 'Cash Flow', 'Tax Reports'],
        connectionTime: '2-4 minutes',
        isConnected: connectedAccounts.some(acc => acc.connectionMethod === 'xero'),
      },
    ],
    [connectedAccounts]
  );

  // Memoize providers with connection status (commented out to avoid unused warning)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const providers = useMemo(
    () => [
      {
        id: 'plaid',
        name: 'Plaid',
        logo: '🏦',
        description: 'Connect bank accounts and get transaction data',
        supportedDocuments: ['Bank Statements', 'Account Verification'],
        connectionTime: '2-3 minutes',
        isConnected: connectedAccounts.some(acc => acc.connectionMethod === 'plaid'),
      },
      {
        id: 'stripe',
        name: 'Stripe',
        logo: '💳',
        description: 'Payment processing data and financial connections',
        supportedDocuments: ['Revenue Reports', 'Risk Assessment', 'Bank Data'],
        connectionTime: '1-2 minutes',
        isConnected: connectedAccounts.some(acc => acc.connectionMethod === 'stripe'),
      },
      {
        id: 'quickbooks',
        name: 'QuickBooks',
        logo: '📊',
        description: 'Complete accounting and financial statements',
        supportedDocuments: ['P&L', 'Balance Sheet', 'Cash Flow'],
        connectionTime: '3-5 minutes',
        isConnected: connectedAccounts.some(acc => acc.connectionMethod === 'quickbooks'),
      },
      {
        id: 'netsuite',
        name: 'NetSuite',
        logo: '🏢',
        description: 'Enterprise financial management and reporting',
        supportedDocuments: ['Financial Statements', 'Subsidiary Reports'],
        connectionTime: '5-7 minutes',
        isConnected: connectedAccounts.some(acc => acc.connectionMethod === 'netsuite'),
      },
      {
        id: 'xero',
        name: 'Xero',
        logo: '📈',
        description: 'Small business accounting and financial reports',
        supportedDocuments: ['P&L', 'Balance Sheet', 'Cash Flow'],
        connectionTime: '2-4 minutes',
        isConnected: connectedAccounts.some(acc => acc.connectionMethod === 'xero'),
      },
    ],
    [connectedAccounts]
  );

  // Load any existing connections and documents
  const loadExistingConnections = useCallback(async () => {
    // In a real implementation, this would load from a backend service
    // For demo purposes, we'll simulate some existing data
    const mockExistingAccounts: ConnectedAccount[] = [];
    setConnectedAccounts(mockExistingAccounts);
  }, []);

  // Generate specific documents for an account
  const generateDocumentsForAccount = useCallback(
    async (account: ConnectedAccount, year: number): Promise<GeneratedDocument[]> => {
      const documents: GeneratedDocument[] = [];
      const baseId = `${account.id}-${Date.now()}`;

      switch (account.connectionMethod) {
          case 'plaid':
          // Generate bank statements for last 3 months
          for (let i = 0; i < 3; i++) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);

            documents.push({
              id: `${baseId}-stmt-${i}`,
              name: `${account.accountName} Statement - ${date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
                type: 'bank_statement',
              period: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
                dateGenerated: new Date().toISOString(),
                status: 'ready',
              url: `/api/documents/${baseId}-stmt-${i}.pdf`,
              fileSize: Math.floor(Math.random() * 500000) + 100000,
                accountId: account.id,
              comments: [],
                metadata: {
                contextualNotes: [
                  'Bank statement generated from verified Plaid connection',
                  'Contains complete transaction history for the period',
                  'All amounts are in USD and reconciled',
                ],
                },
            });
          }
            break;

          case 'stripe': {
            // Generate comprehensive Stripe financial and risk reports
            const currentYear = new Date().getFullYear();
            const currentMonth = new Date().getMonth();

            // Mock Stripe financial data for risk assessment
            const monthlyRevenue = 75000 + Math.random() * 50000;
            const processingVolume = monthlyRevenue * 1.2; // Total processed vs revenue
            const disputeRate = 0.5 + Math.random() * 1.5; // 0.5-2% dispute rate
            const riskScore = disputeRate < 1 ? 'Low' : disputeRate < 1.5 ? 'Medium' : 'High';

            // 1. Payment Processing Revenue Report
          documents.push({
            id: `${baseId}-revenue-report`,
            name: `Stripe Revenue Analytics - ${currentYear}`,
              type: 'profit_loss',
              period: `${currentYear} YTD`,
              dateGenerated: new Date().toISOString(),
              status: 'ready',
            url: `/api/documents/${baseId}-revenue-report.pdf`,
            fileSize: Math.floor(Math.random() * 800000) + 300000,
            accountId: account.id,
            comments: [],
              metadata: {
                totalRevenue: monthlyRevenue * (currentMonth + 1), // YTD revenue
                totalExpenses: monthlyRevenue * (currentMonth + 1) * 0.029, // ~2.9% processing fees
                netIncome: monthlyRevenue * (currentMonth + 1) * 0.971,
                contextualNotes: [
                  'Revenue data from Stripe payment processing',
                  `Processing volume: $${(processingVolume * (currentMonth + 1)).toLocaleString()}`,
                  `Average transaction size: $${(monthlyRevenue / 850).toFixed(2)}`,
                  'Data includes all successful payments and refunds',
                ],
              },
            });

            // 2. Risk Assessment & Radar Data
          documents.push({
            id: `${baseId}-risk-assessment`,
            name: `Stripe Risk Assessment & Radar Analysis - ${currentYear}`,
              type: 'cash_flow',
              period: `${currentYear} YTD`,
              dateGenerated: new Date().toISOString(),
              status: 'ready',
            url: `/api/documents/${baseId}-risk-assessment.pdf`,
            fileSize: Math.floor(Math.random() * 600000) + 250000,
            accountId: account.id,
            comments: [],
              metadata: {
                totalRevenue: monthlyRevenue * (currentMonth + 1),
                contextualNotes: [
                  `Risk Score: ${riskScore} (${disputeRate.toFixed(2)}% dispute rate)`,
                  'Data from Stripe Radar fraud detection system',
                  `${Math.floor(Math.random() * 50 + 10)} blocked fraudulent transactions`,
                  'Comprehensive payment pattern analysis included',
                  riskScore === 'Low'
                    ? 'Strong payment processing profile'
                    : 'Review recommended for risk factors',
                ],
              },
            });

            // 3. Financial Connections Bank Data (if account.accountName includes 'Connected Bank')
            if (account.accountName.includes('Connected Bank')) {
              for (let i = 0; i < 3; i++) {
                const date = new Date();
                date.setMonth(date.getMonth() - i);

              documents.push({
                  id: `stripe-bank-${i}-${account.id}`,
                  name: `Bank Statement via Stripe Financial Connections - ${date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
                  type: 'bank_statement',
                  period: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
                  dateGenerated: new Date().toISOString(),
                  status: 'ready',
                url: `/api/documents/${baseId}-bank-${i}.pdf`,
                  fileSize: Math.floor(Math.random() * 500000) + 150000,
                  accountId: account.id,
                  comments: [],
                  metadata: {
                    contextualNotes: [
                      'Bank data accessed via Stripe Financial Connections API',
                      'Real-time account verification completed',
                      'Transaction categorization and insights included',
                      'Complies with open banking standards',
                    ],
                  },
                });
              }
            }

            // 4. Dispute & Chargeback Analysis (for merchant accounts)
            if (account.accountName.includes('Merchant Processing')) {
            documents.push({
                id: `stripe-disputes-analysis-${account.id}`,
                name: `Dispute & Chargeback Analysis - ${currentYear}`,
                type: 'balance_sheet',
                period: `${currentYear} YTD`,
                dateGenerated: new Date().toISOString(),
                status: 'ready',
              url: `/api/documents/${baseId}-disputes-analysis.pdf`,
                fileSize: Math.floor(Math.random() * 400000) + 200000,
                accountId: account.id,
                comments: [],
                metadata: {
                  totalRevenue: monthlyRevenue * (currentMonth + 1),
                  totalExpenses: monthlyRevenue * (currentMonth + 1) * (disputeRate / 100), // Dispute costs
                  contextualNotes: [
                    `Dispute rate: ${disputeRate.toFixed(2)}% (Industry average: 0.84%)`,
                    `Total disputes: ${Math.floor((((monthlyRevenue * (currentMonth + 1)) / 100) * disputeRate) / 10)}`,
                    'Includes chargeback reason codes and trends',
                    'Fraud protection effectiveness metrics included',
                    disputeRate < 1
                      ? 'Excellent dispute management'
                      : 'Consider implementing additional fraud prevention',
                  ],
                },
              });
            }
            break;
          }

          case 'quickbooks':
            // Generate QuickBooks-specific documents
          documents.push(
              {
                id: `qb-pnl-${account.id}`,
                name: `Profit & Loss Statement`,
                type: 'profit_loss',
                period: 'January 1, 2024 - October 31, 2024',
                provider: 'quickbooks',
                accountId: account.id,
                dateGenerated: new Date().toISOString(),
                url: `/documents/quickbooks-pnl-${account.id}.pdf`,
                fileSize: 3.1 * 1024 * 1024,
                status: 'ready',
                metadata: {
                  reportPeriod: 'January 1, 2024 - October 31, 2024',
                  totalRevenue: 1245680.75,
                  totalExpenses: 892345.5,
                  netIncome: 353335.25,
                  grossMargin: '28.4%',
                },
              },
              {
                id: `qb-balance-${account.id}`,
                name: `Balance Sheet`,
                type: 'balance_sheet',
                period: new Date().toISOString().split('T')[0],
                provider: 'quickbooks',
                accountId: account.id,
                dateGenerated: new Date().toISOString(),
                url: `/documents/quickbooks-balance-${account.id}.pdf`,
                fileSize: 2.7 * 1024 * 1024,
                status: 'ready',
                metadata: {
                  asOfDate: new Date().toISOString().split('T')[0],
                  totalAssets: 2456789.25,
                  totalLiabilities: 1234567.5,
                  totalEquity: 1222221.75,
                  currentRatio: 2.35,
                },
              }
            );
            break;

        case 'netsuite': {
            // Generate NetSuite-specific documents
          const currentYear = new Date().getFullYear();
          documents.push({
              id: `ns-financial-${account.id}`,
              name: `Comprehensive Financial Report`,
              type: 'profit_loss',
              period: `${currentYear}`,
              provider: 'netsuite',
              accountId: account.id,
              dateGenerated: new Date().toISOString(),
              url: `/documents/netsuite-financial-${account.id}.pdf`,
              fileSize: 4.5 * 1024 * 1024,
              status: 'ready',
              metadata: {
                reportType: 'Consolidated Financial Statement',
                subsidiaries: ['Main Corp', 'Subsidiary A', 'International Division'],
                currencies: ['USD', 'EUR', 'GBP'],
                consolidatedRevenue: 5678912.34,
              },
            });
            break;
        }

          case 'xero':
            // Generate Xero-specific documents
          documents.push({
              id: `xero-reports-${account.id}`,
              name: `Xero Financial Package`,
              type: 'cash_flow',
              period: 'Last 12 months',
              provider: 'xero',
              accountId: account.id,
              dateGenerated: new Date().toISOString(),
              url: `/documents/xero-package-${account.id}.pdf`,
              fileSize: 2.9 * 1024 * 1024,
              status: 'ready',
              metadata: {
                includesReports: ['P&L', 'Balance Sheet', 'Cash Flow', 'Trial Balance'],
                reportingPeriod: 'Last 12 months',
                transactionCount: 2847,
              },
            });
            break;
        }

      return documents;
    },
    []
  );

  // Generate comprehensive financial documents from connected accounts
  const generateFinancialDocuments = useCallback(async () => {
    // setIsGeneratingDocuments(true);
    setGenerationProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const allDocuments: GeneratedDocument[] = [];
      const currentYear = new Date().getFullYear();

      for (const account of connectedAccounts) {
        const accountDocuments = await generateDocumentsForAccount(account, currentYear);
        allDocuments.push(...accountDocuments);
      }

      clearInterval(progressInterval);
      
      setGeneratedDocuments(allDocuments);
      
      if (onDocumentsGenerated) {
        onDocumentsGenerated(allDocuments);
      }

      setGenerationProgress(100);
    } catch (error) {
      console.error('Document generation error:', error);
    } finally {
      // setIsGeneratingDocuments(false);
      setGenerationProgress(100);
    }
  }, [connectedAccounts, onDocumentsGenerated, generateDocumentsForAccount]);

  // Auto-generate documents when accounts are connected
  useEffect(() => {
    if (connectedAccounts.length > 0 && generatedDocuments.length === 0) {
      generateFinancialDocuments();
    }
  }, [connectedAccounts, generatedDocuments.length, generateFinancialDocuments]);

  // Initialize component with any existing connections
  useEffect(() => {
    loadExistingConnections();
  }, [loadExistingConnections]);

  // Generate mock accounts for the selected provider
  const generateMockAccountsForProvider = useCallback(async (providerId: string): Promise<ConnectedAccount[]> => {
    // Simulate account fetching delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const accountTemplates: Record<string, Partial<ConnectedAccount>[]> = {
      plaid: [
        {
          institutionName: 'Chase Bank',
          accountName: 'Business Checking (...4532)',
          accountType: 'checking',
          balance: 125000,
          mask: '4532',
        },
        {
          institutionName: 'Chase Bank', 
          accountName: 'Business Savings (...9876)',
          accountType: 'savings',
          balance: 85000,
          mask: '9876',
        },
      ],
      stripe: [
        {
          institutionName: 'Stripe',
          accountName: 'Merchant Processing Account',
          accountType: 'other',
          balance: 45000,
        },
        {
          institutionName: 'Stripe Financial Connections',
          accountName: 'Connected Bank Account (...1234)',
          accountType: 'checking',
          balance: 95000,
          mask: '1234',
        },
      ],
      // Add other providers...
    };

    const templates = accountTemplates[providerId] || [];
    
    return templates.map((template, index) => ({
      id: `${providerId}-${Date.now()}-${index}`,
      institutionName: template.institutionName || 'Unknown Institution',
      accountName: template.accountName || 'Unknown Account',
      accountType: template.accountType || 'other',
      balance: template.balance,
      mask: template.mask,
      isVerified: true,
      lastSynced: new Date().toISOString(),
      connectionMethod: providerId as any,
    }));
  }, []);

  // Generate documents for specific provider accounts
  const generateDocumentsForProvider = useCallback(
    async (providerId: string, accounts: ConnectedAccount[]) => {
      const newDocuments: GeneratedDocument[] = [];
      const currentYear = new Date().getFullYear();

      for (const account of accounts) {
        const accountDocuments = await generateDocumentsForAccount(account, currentYear);
        newDocuments.push(...accountDocuments);
      }

      setGeneratedDocuments(prev => [...prev, ...newDocuments]);
      
      if (onDocumentsGenerated) {
        onDocumentsGenerated(newDocuments);
      }
    },
    [generateDocumentsForAccount, onDocumentsGenerated]
  );

  // Enhanced connection handler to support multiple providers
  const handleConnect = useCallback(
    async (providerId: string) => {
      setIsConnecting(true);
      setGenerationProgress(0);

      try {
        // Check if this provider is already connected
        const existingConnection = connectedAccounts.find(
          acc => acc.connectionMethod === providerId
        );

        if (existingConnection) {
          // Show confirmation dialog for reconnection
          const shouldReconnect = window.confirm(
            `You already have a ${providerId} connection. Would you like to add another account or refresh the existing connection?`
          );

          if (!shouldReconnect) {
            setIsConnecting(false);
            return;
          }
        }

        // Simulate connection progress
        const progressInterval = setInterval(() => {
          setGenerationProgress(prev => Math.min(prev + 10, 90));
        }, 200);

        // Generate mock accounts for the selected provider
        const newAccounts = await generateMockAccountsForProvider(providerId);

        // Stop progress simulation
        clearInterval(progressInterval);
        setGenerationProgress(100);

        // Add new accounts to existing ones (don't replace)
        setConnectedAccounts(prev => {
          // Remove any existing accounts from the same provider if user is reconnecting
          const filtered = prev.filter(acc => acc.connectionMethod !== providerId);
          return [...filtered, ...newAccounts];
        });

        // Show success message
        setConnectionStatus({
          type: 'success',
          message: `Successfully connected ${newAccounts.length} account(s) from ${providerId}`,
        });

        // Generate documents for the new accounts
        await generateDocumentsForProvider(providerId, newAccounts);
      } catch (error) {
        console.error('Connection error:', error);
        setConnectionStatus({
          type: 'error',
          message: `Failed to connect to ${providerId}. Please try again.`,
        });
      } finally {
        setIsConnecting(false);
        setGenerationProgress(0);

        // Clear status message after 5 seconds
        setTimeout(() => {
          setConnectionStatus(null);
        }, 5000);
      }
    },
    [connectedAccounts, generateDocumentsForProvider, generateMockAccountsForProvider]
  );

  // Enhanced disconnect function to handle specific accounts
  const handleDisconnect = useCallback(
    (accountId: string) => {
      const account = connectedAccounts.find(acc => acc.id === accountId);
      if (!account) return;

      const confirmMessage = `Are you sure you want to disconnect "${account.accountName}" from ${account.institutionName}? This will remove all associated documents.`;

      if (window.confirm(confirmMessage)) {
        // Remove the specific account
        setConnectedAccounts(prev => prev.filter(acc => acc.id !== accountId));

        // Remove associated documents
        setGeneratedDocuments(prev => prev.filter(doc => doc.accountId !== accountId));

        setConnectionStatus({
          type: 'success',
          message: `Disconnected ${account.accountName} from ${account.institutionName}`,
        });

        setTimeout(() => setConnectionStatus(null), 3000);
      }
    },
    [connectedAccounts]
  );

  // Enhanced view to show all connected accounts grouped by provider
  const renderConnectedAccounts = () => {
    if (connectedAccounts.length === 0) return null;

    // Group accounts by provider
    const accountsByProvider = connectedAccounts.reduce(
      (acc, account) => {
        const provider = account.connectionMethod;
        if (!acc[provider]) {
          acc[provider] = [];
        }
        acc[provider].push(account);
        return acc;
      },
      {} as Record<string, ConnectedAccount[]>
    );

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Connected Accounts ({connectedAccounts.length})
        </h3>

        {Object.entries(accountsByProvider).map(([provider, accounts]) => {
          const providerInfo = financialProviders.find(p => p.id === provider);

          return (
            <div key={provider} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{providerInfo?.logo}</span>
                  <div>
                    <h4 className="font-medium text-gray-900">{providerInfo?.name}</h4>
                    <p className="text-sm text-gray-600">{accounts.length} account(s) connected</p>
                  </div>
                </div>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>

              <div className="space-y-2">
                {accounts.map(account => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                  >
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-900">{account.accountName}</span>
                        {account.mask && (
                          <span className="ml-2 text-sm text-gray-500">••••{account.mask}</span>
                        )}
                      </div>
                      <div className="flex items-center mt-1 text-sm text-gray-600">
                        <span>{account.institutionName}</span>
                        <span className="mx-2">•</span>
                        <span className="capitalize">{account.accountType}</span>
                        {account.balance !== undefined && (
                          <>
                            <span className="mx-2">•</span>
                            <span className="font-medium">${account.balance.toLocaleString()}</span>
                          </>
                        )}
                      </div>
                      {account.lastSynced && (
                        <div className="text-xs text-gray-500 mt-1">
                          Last synced: {new Date(account.lastSynced).toLocaleString()}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => syncAccount(account.id)}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                        title="Sync account"
                      >
                        🔄 Sync
                      </button>
                      <button
                        onClick={() => handleDisconnect(account.id)}
                        className="text-red-600 hover:text-red-700 text-sm"
                        title="Disconnect account"
                      >
                        🗑️ Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Enhanced provider cards to show connection status
  const renderProviderCards = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {financialProviders.map(provider => {
          const connectedAccountsCount = connectedAccounts.filter(
            acc => acc.connectionMethod === provider.id
          ).length;

          return (
            <div
              key={provider.id}
              className={`p-6 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                connectedAccountsCount > 0
                  ? 'border-green-300 bg-green-50 hover:border-green-400'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
              }`}
              onClick={() => handleConnect(provider.id)}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">{provider.logo}</span>
                {connectedAccountsCount > 0 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {connectedAccountsCount} connected
                  </span>
                )}
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">{provider.name}</h3>

              <p className="text-sm text-gray-600 mb-4">{provider.description}</p>

              <div className="space-y-1 mb-4">
                <div className="text-xs text-gray-500 font-medium">Documents Generated:</div>
                {provider.supportedDocuments.slice(0, 3).map((doc, index) => (
                  <div key={index} className="text-xs text-gray-600">
                    • {doc}
                  </div>
                ))}
                {provider.supportedDocuments.length > 3 && (
                  <div className="text-xs text-blue-600">
                    +{provider.supportedDocuments.length - 3} more...
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Setup time: {provider.connectionTime}</span>
                <button
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    connectedAccountsCount > 0
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                  onClick={e => {
                    e.stopPropagation();
                    handleConnect(provider.id);
                  }}
                >
                  {connectedAccountsCount > 0 ? 'Add Another' : 'Connect'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Handle document viewing with Filelock integration
  const handleDocumentPreview = useCallback(
    (document: GeneratedDocument) => {
      if (onDocumentView) {
        onDocumentView(document);
      } else {
        // Default preview behavior
        window.open(document.url, '_blank');
      }
    },
    [onDocumentView]
  );

  // Handle document comments and annotations
  const handleDocumentUpdate = useCallback((updatedFile: ExtendedFileItem) => {
    // Update the document with any new comments or annotations
    setGeneratedDocuments(prev =>
      prev.map(doc =>
        doc.id === updatedFile.id
          ? {
              ...doc,
              // Convert FileComments back to DocumentComments
              comments:
                updatedFile.comments?.map(fileComment => ({
                  id: fileComment.id,
                  text: fileComment.content || fileComment.text || '',
                  user: fileComment.userName || fileComment.author || 'Unknown',
                  timestamp: fileComment.timestamp,
                  type: 'general' as const,
                })) ||
                doc.comments ||
                [],
            }
          : doc
      )
    );

    setViewerFile(updatedFile);
  }, []);

  // Close document viewer
  const closeDocumentViewer = useCallback(() => {
    setShowDocumentViewer(false);
    // setSelectedDocument(null);
    setViewerFile(null);
  }, []);

  // Sync data from connected accounts
  const handleSyncData = onSyncData;

  // Add sync account functionality
  const syncAccount = useCallback(
    async (accountId: string) => {
      const account = connectedAccounts.find(acc => acc.id === accountId);
      if (!account) return;

      // Update the account's lastSynced timestamp
      setConnectedAccounts(prev =>
        prev.map(acc =>
          acc.id === accountId ? { ...acc, lastSynced: new Date().toISOString() } : acc
        )
      );

      setConnectionStatus({
        type: 'success',
        message: `Synced ${account.accountName} successfully`,
      });

      setTimeout(() => setConnectionStatus(null), 3000);
    },
    [connectedAccounts]
  );

  // Render connection status indicator
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const renderConnectionStatus = (provider: FinancialProvider) => {
    if (provider.isConnected) {
      return (
        <div className="flex items-center text-green-600">
          <FontAwesomeIcon icon={faCheck} className="w-4 h-4 mr-1" />
          <span className="text-sm font-medium">Connected</span>
        </div>
      );
    }

    if (isConnecting) {
      return (
        <div className="flex items-center text-blue-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
          Connecting...
        </div>
      );
    }

    return null;
  };

  // Render document status badge
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const renderDocumentStatus = (document: GeneratedDocument) => {
    const statusConfig = {
      generating: {
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        icon: faSpinner,
        label: 'Generating',
      },
      ready: { color: 'text-green-600', bg: 'bg-green-50', icon: faCheck, label: 'Ready' },
      error: {
        color: 'text-red-600',
        bg: 'bg-red-50',
        icon: faExclamationTriangle,
        label: 'Error',
      },
      verified: {
        color: 'text-purple-600',
        bg: 'bg-purple-50',
        icon: faShieldAlt,
        label: 'Verified',
      },
    };

    const config = statusConfig[document.status];

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}
      >
        <FontAwesomeIcon
          icon={config.icon}
          className={`w-3 h-3 mr-1 ${document.status === 'generating' ? 'animate-spin' : ''}`}
        />
        {config.label}
      </span>
    );
  };

  // Fix the view document handler
  const handleViewDocument = useCallback(
    (document: GeneratedDocument) => {
      handleDocumentPreview(document);
    },
    [handleDocumentPreview]
  );

  // Main component render
  if (showDocumentViewer && viewerFile) {
    return (
      <div className="h-full">
        <DocumentViewer
          file={viewerFile}
          onBack={closeDocumentViewer}
          onEdit={() => {}}
          onSign={() => {}}
          onShare={() => {}}
          onDelete={() => {}}
          onDownload={() => {}}
          onUpdateFile={handleDocumentUpdate}
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Financial Statements</h2>
          <p className="text-gray-600">
            Connect your financial accounts to automatically generate required documents
          </p>
        </div>
        {handleSyncData && (
          <button
            onClick={handleSyncData}
            className="px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors flex items-center"
          >
            <FontAwesomeIcon icon={faSync} className="w-4 h-4 mr-2" />
            🔄 Sync Data
          </button>
        )}
      </div>

      {/* Connection Status Alert */}
      {connectionStatus && (
        <div
          className={`mb-6 p-4 rounded-md border ${
            connectionStatus.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : connectionStatus.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-800'
                : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}
        >
          <div className="flex items-center">
            <span className="mr-2">
              {connectionStatus.type === 'success'
                ? '✅'
                : connectionStatus.type === 'error'
                  ? '❌'
                  : 'ℹ️'}
            </span>
            {connectionStatus.message}
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {isConnecting && generationProgress > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Generating...</span>
            <span className="text-sm text-gray-500">{Math.round(generationProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${generationProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {['connect', 'documents', 'review'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as 'connect' | 'documents' | 'review')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab === 'connect' && (
                <span className="flex items-center">
                  🔗 Connect Accounts
                  {connectedAccounts.length > 0 && (
                    <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      {connectedAccounts.length}
                    </span>
                  )}
                </span>
              )}
              {tab === 'documents' && (
                <span className="flex items-center">
                  📄 Generated Documents
                  {generatedDocuments.length > 0 && (
                    <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {generatedDocuments.length}
                    </span>
                  )}
                </span>
              )}
              {tab === 'review' && '👁️ Review & Verify'}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {/* Connect Tab */}
        {activeTab === 'connect' && (
          <div className="space-y-8">
            {/* Provider Cards */}
            {renderProviderCards()}

            {/* Connected Accounts Section */}
            {connectedAccounts.length > 0 && (
              <div className="border-t border-gray-200 pt-8">{renderConnectedAccounts()}</div>
            )}
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            {generatedDocuments.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📄</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Documents Generated</h3>
                <p className="text-gray-600 mb-6">
                  Connect your financial accounts to automatically generate required documents.
                </p>
                <button
                  onClick={() => setActiveTab('connect')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Connect Accounts
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {generatedDocuments.map(doc => (
                  <div
                    key={doc.id}
                    className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">{doc.name}</h3>
                        <p className="text-sm text-gray-600">{doc.type}</p>
                        <div className="flex items-center mt-2">
                          <span className="text-sm text-gray-500">
                            {financialProviders.find(p => p.id === doc.provider)?.logo}
                          </span>
                          <span className="ml-2 text-sm text-gray-500 capitalize">
                            {doc.provider}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleViewDocument(doc)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        View
                      </button>
                    </div>

                    <div className="text-xs text-gray-500 space-y-1">
                      <div>Size: {((doc.fileSize || 0) / 1024 / 1024).toFixed(1)} MB</div>
                      <div>Generated: {new Date(doc.dateGenerated).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Review Tab */}
        {activeTab === 'review' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">📋 Application Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{connectedAccounts.length}</div>
                  <div className="text-sm text-blue-800">Connected Accounts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {generatedDocuments.length}
                  </div>
                  <div className="text-sm text-blue-800">Generated Documents</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(
                      (generatedDocuments.length / Math.max(connectedAccounts.length * 2, 1)) * 100
                    )}
                    %
                  </div>
                  <div className="text-sm text-blue-800">Completion Rate</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between">
              <button
                onClick={() => setActiveTab('documents')}
                className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                ← Back to Documents
              </button>

              <div className="space-x-4">
                <button
                  onClick={() => generateFinancialDocuments()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  disabled={connectedAccounts.length === 0}
                >
                  Regenerate Documents
                </button>

                <button
                  onClick={() => {
                    setConnectionStatus({
                      type: 'success',
                      message: 'Financial statements completed and submitted for review!',
                    });
                  }}
                  className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  disabled={generatedDocuments.length === 0}
                >
                  Complete & Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DynamicFinancialStatements;