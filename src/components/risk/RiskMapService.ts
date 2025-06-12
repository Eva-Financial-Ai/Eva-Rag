import { RiskMapType } from './RiskMapNavigator';
import { RiskCategory } from './RiskMapOptimized';
import evaReportApi from '../../api/evaReportApi';
import { FilelockService, ShieldVaultService } from '../../services/ExternalIntegrations';
import { generatePdf } from '../../utils/pdfGenerator';
import ProductionLogger from '../../utils/productionLogger';

// Define interfaces for risk data
export interface RiskCategoryData {
  score: number;
  status: 'green' | 'yellow' | 'red';
}

export interface RiskFinding {
  type: 'positive' | 'warning' | 'negative';
  text: string;
}

export interface RiskData {
  score: number;
  industry_avg: number;
  confidence: number;
  categories: {
    [key: string]: RiskCategoryData;
  };
  findings: RiskFinding[];
}

// Interface for purchased reports
export interface PurchasedReport {
  id: string;
  transactionId: string;
  riskMapType: RiskMapType;
  purchaseDate: string;
  expiryDate: string; // Reports can expire after a certain time
}

// Interface for cached risk data
interface CachedRiskData {
  data: RiskData;
  timestamp: number;
  type: RiskMapType;
}

export interface EvaReportData {
  // Includes all fields from RiskData
  score: number;
  industry_avg: number;
  confidence: number;
  categories: {
    [key: string]: RiskCategoryData;
  };
  findings: RiskFinding[];
  // Adds report-specific details
  reportDetails?: any; // This can be more strictly typed based on actual API response
  isPremium?: boolean;
  transactionId?: string;
  riskMapType?: RiskMapType;
  filelockInfo?: {
    // Added to hold Filelock details
    fileId: string;
    viewUrl: string;
  };
}

// Helper function to simulate API delay
const simulateApiDelay = (ms: number = 1500) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * A service for managing risk map data and operations
 * This centralizes all risk map related logic to prevent inconsistencies
 */
class RiskMapService {
  // Cache storage for risk data
  private riskDataCache: CachedRiskData | null = null;
  private readonly CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
  private loadingPromise: Promise<RiskData> | null = null;
  private abortController: AbortController | null = null;
  private currentType: RiskMapType | null = null;
  private availableCredits: number = 5;
  private purchasedReports: Set<string> = new Set();
  private demoReports: Record<string, any> = {};

  constructor() {
    // Initialize with demo data
    this.initializeDemoData();
  }

  private initializeDemoData() {
    // Generate some demo reports for different transaction types
    this.demoReports = {
      general: {
        score: 78,
        industry_avg: 65,
        confidence: 92,
        findings: [
          {
            type: 'positive',
            text: 'Strong payment history with no late payments in last 24 months',
          },
          { type: 'positive', text: 'Debt-to-income ratio within acceptable range (38%)' },
          { type: 'warning', text: 'Recent increase in credit utilization (68% up from 45%)' },
          { type: 'negative', text: 'Limited business operating history (18 months)' },
          { type: 'positive', text: 'Consistent cash flow positive for last 6 months' },
          {
            type: 'warning',
            text: 'Seasonal fluctuations in revenue may impact repayment ability',
          },
        ],
        reportDetails: {
          lastUpdated: Date.now(),
          categories: {
            all: { title: 'All Categories', description: 'Combined analysis of all risk factors' },
            creditworthiness: {
              title: 'Creditworthiness',
              description: 'Analysis of credit history and score',
              metrics: [
                {
                  name: 'Credit Score',
                  value: '720',
                  status: 'good',
                  description: 'FICO score in good range',
                  source: 'Experian',
                },
                {
                  name: 'Payment History',
                  value: '95%',
                  status: 'good',
                  description: 'On-time payment percentage',
                  source: 'TransUnion',
                },
                {
                  name: 'Credit Utilization',
                  value: '68%',
                  status: 'average',
                  description: 'Percentage of available credit used',
                  source: 'Equifax',
                },
                {
                  name: 'Age of Credit',
                  value: '5.2 years',
                  status: 'average',
                  description: 'Average age of all accounts',
                  source: 'Experian',
                },
              ],
            },
            financials: {
              title: 'Financial Statements',
              description: 'Analysis of business financial health',
              metrics: [
                {
                  name: 'Debt-to-Income',
                  value: '38%',
                  status: 'average',
                  description: 'Ratio of monthly debt payments to income',
                  source: 'Financial Statements',
                },
                {
                  name: 'Current Ratio',
                  value: '1.8',
                  status: 'good',
                  description: 'Ability to pay short-term obligations',
                  source: 'Balance Sheet',
                },
                {
                  name: 'Profit Margin',
                  value: '12%',
                  status: 'good',
                  description: 'Net income as percentage of revenue',
                  source: 'Income Statement',
                },
                {
                  name: 'Revenue Growth',
                  value: '15%',
                  status: 'good',
                  description: 'Year over year growth rate',
                  source: 'Income Statement',
                },
              ],
            },
            cashflow: {
              title: 'Cash Flow',
              description: 'Analysis of business cash flow health',
              metrics: [
                {
                  name: 'Cash Flow Positive',
                  value: '6 months',
                  status: 'good',
                  description: 'Consecutive months of positive cash flow',
                  source: 'Cash Flow Statements',
                },
                {
                  name: 'Operating Cash Flow',
                  value: '$125,000',
                  status: 'good',
                  description: 'Annual operating cash flow',
                  source: 'Cash Flow Statements',
                },
                {
                  name: 'Cash Conversion Cycle',
                  value: '45 days',
                  status: 'average',
                  description: 'Time to convert investments into cash flow',
                  source: 'Cash Flow Analysis',
                },
                {
                  name: 'Seasonality Impact',
                  value: 'Moderate',
                  status: 'average',
                  description: 'Effect of seasonal fluctuations on cash flow',
                  source: 'Historical Data',
                },
              ],
            },
            compliance: {
              title: 'Legal & Regulatory',
              description: 'Analysis of legal and regulatory compliance',
              metrics: [
                {
                  name: 'Regulatory Status',
                  value: 'Compliant',
                  status: 'good',
                  description: 'Current regulatory compliance status',
                  source: 'Regulatory Database',
                },
                {
                  name: 'Legal Disputes',
                  value: 'None',
                  status: 'good',
                  description: 'Pending or recent legal issues',
                  source: 'Legal Records',
                },
                {
                  name: 'License Status',
                  value: 'Current',
                  status: 'good',
                  description: 'Status of required business licenses',
                  source: 'Regulatory Database',
                },
                {
                  name: 'Tax Compliance',
                  value: 'Current',
                  status: 'good',
                  description: 'Status of tax filings and payments',
                  source: 'Tax Records',
                },
              ],
            },
          },
          riskScores: {
            creditworthiness: 75,
            financials: 82,
            cashflow: 78,
            compliance: 95,
          },
        },
      },
      realestate: {
        score: 82,
        industry_avg: 70,
        confidence: 94,
        findings: [
          { type: 'positive', text: 'Property value exceeds loan amount by 35%' },
          { type: 'positive', text: 'Property in high growth area with 12% YoY appreciation' },
          { type: 'positive', text: 'Rental income covers 125% of monthly debt service' },
          { type: 'warning', text: 'Property requires moderate renovations ($45,000 estimated)' },
          { type: 'positive', text: 'Low vacancy rates in target area (3.5%)' },
          { type: 'warning', text: 'New development planned nearby may impact future value' },
        ],
        reportDetails: {
          lastUpdated: Date.now(),
          categories: {
            all: { title: 'All Categories', description: 'Combined analysis of all risk factors' },
            property: {
              title: 'Property Valuation',
              description: 'Analysis of property value and market',
              metrics: [
                {
                  name: 'LTV Ratio',
                  value: '65%',
                  status: 'good',
                  description: 'Loan to value ratio',
                  source: 'Appraisal',
                },
                {
                  name: 'Appreciation Rate',
                  value: '12% YoY',
                  status: 'good',
                  description: 'Annual property value growth',
                  source: 'Market Analysis',
                },
                {
                  name: 'Comparable Sales',
                  value: '$425/sqft',
                  status: 'good',
                  description: 'Average comparable sales price',
                  source: 'MLS Data',
                },
                {
                  name: 'Renovation Needs',
                  value: 'Moderate',
                  status: 'average',
                  description: 'Required property improvements',
                  source: 'Property Inspection',
                },
              ],
            },
            market: {
              title: 'Real Estate Market',
              description: 'Analysis of local real estate market conditions',
              metrics: [
                {
                  name: 'Vacancy Rate',
                  value: '3.5%',
                  status: 'good',
                  description: 'Percentage of vacant properties in area',
                  source: 'Market Analysis',
                },
                {
                  name: 'Days on Market',
                  value: '28 days',
                  status: 'good',
                  description: 'Average time to sell properties',
                  source: 'MLS Data',
                },
                {
                  name: 'Supply Index',
                  value: '2.4 months',
                  status: 'good',
                  description: 'Months of housing supply available',
                  source: 'Market Analysis',
                },
                {
                  name: 'Rental Yield',
                  value: '7.2%',
                  status: 'good',
                  description: 'Annual rental income as percentage of property value',
                  source: 'Rental Market Data',
                },
              ],
            },
            cashflow: {
              title: 'Cash Flow',
              description: 'Analysis of property cash flow',
              metrics: [
                {
                  name: 'DSCR',
                  value: '1.25',
                  status: 'good',
                  description: 'Debt service coverage ratio',
                  source: 'Financial Analysis',
                },
                {
                  name: 'Net Operating Income',
                  value: '$36,500',
                  status: 'good',
                  description: 'Annual NOI',
                  source: 'Financial Projections',
                },
                {
                  name: 'Operating Expense Ratio',
                  value: '38%',
                  status: 'average',
                  description: 'Operating expenses as percentage of income',
                  source: 'Financial Analysis',
                },
                {
                  name: 'Cap Rate',
                  value: '6.8%',
                  status: 'average',
                  description: 'Capitalization rate',
                  source: 'Investment Analysis',
                },
              ],
            },
            location: {
              title: 'Location Analysis',
              description: 'Analysis of property location factors',
              metrics: [
                {
                  name: 'School District',
                  value: 'Above Average',
                  status: 'good',
                  description: 'Quality of local schools',
                  source: 'Education Data',
                },
                {
                  name: 'Crime Rate',
                  value: 'Low',
                  status: 'good',
                  description: 'Area crime statistics',
                  source: 'Crime Statistics',
                },
                {
                  name: 'Employment Growth',
                  value: '3.8% YoY',
                  status: 'good',
                  description: 'Local job market growth',
                  source: 'Economic Data',
                },
                {
                  name: 'Future Development',
                  value: 'Moderate Impact',
                  status: 'average',
                  description: 'Planned developments affecting property',
                  source: 'Municipal Records',
                },
              ],
            },
          },
          riskScores: {
            property: 85,
            market: 88,
            cashflow: 82,
            location: 78,
          },
        },
      },
      equipment: {
        score: 75,
        industry_avg: 68,
        confidence: 90,
        findings: [
          { type: 'positive', text: 'Equipment has 10+ year expected lifespan' },
          { type: 'positive', text: 'Strong secondary market for asset resale' },
          { type: 'warning', text: 'Maintenance costs higher than industry average (8% vs 5%)' },
          { type: 'negative', text: 'Rapid technology changes may accelerate obsolescence' },
          { type: 'positive', text: 'Equipment will increase productivity by estimated 22%' },
          { type: 'warning', text: 'Specialized training required for optimal operation' },
        ],
        reportDetails: {
          lastUpdated: Date.now(),
          categories: {
            all: { title: 'All Categories', description: 'Combined analysis of all risk factors' },
            equipment: {
              title: 'Equipment Valuation',
              description: 'Analysis of equipment value and lifespan',
              metrics: [
                {
                  name: 'Expected Lifespan',
                  value: '12 years',
                  status: 'good',
                  description: 'Anticipated useful life of equipment',
                  source: 'Manufacturer Data',
                },
                {
                  name: 'Resale Value',
                  value: '65% at 5 years',
                  status: 'good',
                  description: 'Estimated future resale value',
                  source: 'Market Analysis',
                },
                {
                  name: 'Obsolescence Risk',
                  value: 'Moderate',
                  status: 'average',
                  description: 'Risk of technology becoming outdated',
                  source: 'Industry Analysis',
                },
                {
                  name: 'Maintenance Cost',
                  value: '8% annually',
                  status: 'average',
                  description: 'Expected annual maintenance expense',
                  source: 'Service Records',
                },
              ],
            },
            productivity: {
              title: 'Productivity Impact',
              description: 'Analysis of business performance impact',
              metrics: [
                {
                  name: 'Output Increase',
                  value: '22%',
                  status: 'good',
                  description: 'Expected productivity improvement',
                  source: 'Performance Analysis',
                },
                {
                  name: 'ROI Timeline',
                  value: '3.2 years',
                  status: 'good',
                  description: 'Time to reach return on investment',
                  source: 'Financial Projections',
                },
                {
                  name: 'Training Requirements',
                  value: 'Moderate',
                  status: 'average',
                  description: 'Staff training needed for operation',
                  source: 'Operational Assessment',
                },
                {
                  name: 'Integration Complexity',
                  value: 'Low',
                  status: 'good',
                  description: 'Ease of integration with existing systems',
                  source: 'Technical Assessment',
                },
              ],
            },
            market: {
              title: 'Equipment Market',
              description: 'Analysis of equipment market conditions',
              metrics: [
                {
                  name: 'Secondary Market',
                  value: 'Strong',
                  status: 'good',
                  description: 'Liquidity of used equipment market',
                  source: 'Market Analysis',
                },
                {
                  name: 'Technology Trend',
                  value: 'Stable',
                  status: 'average',
                  description: 'Pace of technological change in sector',
                  source: 'Industry Analysis',
                },
                {
                  name: 'Manufacturer Stability',
                  value: 'Excellent',
                  status: 'good',
                  description: 'Financial health of manufacturer',
                  source: 'Corporate Analysis',
                },
                {
                  name: 'Parts Availability',
                  value: 'High',
                  status: 'good',
                  description: 'Accessibility of replacement parts',
                  source: 'Supply Chain Analysis',
                },
              ],
            },
            financial: {
              title: 'Financial Analysis',
              description: 'Analysis of financial impact on business',
              metrics: [
                {
                  name: 'Cash Flow Impact',
                  value: 'Positive',
                  status: 'good',
                  description: 'Effect on business cash flow',
                  source: 'Financial Analysis',
                },
                {
                  name: 'Operating Cost Change',
                  value: '-12%',
                  status: 'good',
                  description: 'Change in operating costs',
                  source: 'Financial Projections',
                },
                {
                  name: 'Tax Benefits',
                  value: 'Significant',
                  status: 'good',
                  description: 'Available tax deductions and benefits',
                  source: 'Tax Analysis',
                },
                {
                  name: 'Insurance Cost',
                  value: '2.5% of value',
                  status: 'average',
                  description: 'Annual insurance expense',
                  source: 'Insurance Quotes',
                },
              ],
            },
          },
          riskScores: {
            equipment: 80,
            productivity: 85,
            market: 72,
            financial: 78,
          },
        },
      },
    };
  }

  // Fetch risk data based on type with caching and abort capability
  async fetchRiskData(type: RiskMapType, forceReload = false): Promise<RiskData> {
    ProductionLogger.debug(
      `Fetching risk data for type: ${type}, forceReload: ${forceReload}`,
      'RiskMapService'
    );

    // If a different type is being requested, abort any current request
    if (this.currentType && this.currentType !== type && this.abortController) {
      ProductionLogger.debug(`Aborting previous request for ${this.currentType}`, 'RiskMapService');
      this.abortController.abort();
      this.loadingPromise = null;
      this.abortController = null;
    }

    this.currentType = type;

    // Check if we already have this data type in cache and it's not expired
    const now = Date.now();
    if (
      !forceReload &&
      this.riskDataCache &&
      this.riskDataCache.type === type &&
      now - this.riskDataCache.timestamp < this.CACHE_EXPIRY_MS
    ) {
      ProductionLogger.debug(`Using cached risk data for ${type}`, 'RiskMapService');
      return this.riskDataCache.data;
    }

    // If there's already a loading promise for the data, return that
    if (this.loadingPromise) {
      ProductionLogger.debug(
        `Already loading risk data for ${type}, returning existing promise`,
        'RiskMapService'
      );
      return this.loadingPromise;
    }

    // Create new abort controller for this request
    this.abortController = new AbortController();

    // In a real implementation, this would make an API call with the abort signal
    this.loadingPromise = new Promise<RiskData>(async (resolve, reject) => {
      ProductionLogger.debug(`Starting mock API call for ${type}`, 'RiskMapService');

      // Set up abort handling
      this.abortController?.signal.addEventListener('abort', () => {
        ProductionLogger.debug(`Request for ${type} was aborted`, 'RiskMapService');
        reject(new Error('Request aborted'));
      });

      const timeoutId = setTimeout(async () => {
        if (this.abortController?.signal.aborted) {
          return;
        }

        try {
          ProductionLogger.debug(`Mock API call completed for ${type}`, 'RiskMapService');
          const data = this.getMockRiskData(type);

          // Cache the result
          this.riskDataCache = {
            data,
            timestamp: Date.now(),
            type,
          };

          // Clear the loading state
          this.loadingPromise = null;
          this.abortController = null;

          resolve(data);
        } catch (error) {
          ProductionLogger.error(`Error in mock API call for ${type}:`, 'RiskMapService', error);
          this.loadingPromise = null;
          this.abortController = null;
          reject(error);
        }
      }, 800);

      this.abortController?.signal.addEventListener('abort', () => {
        clearTimeout(timeoutId);
      });
    }).catch(error => {
      // Clean up on error
      this.loadingPromise = null;
      this.abortController = null;

      if (error.name === 'AbortError') {
        ProductionLogger.debug(`Request for ${type} was aborted`, 'RiskMapService');
        // Return a rejected promise to propagate the abort
        return Promise.reject(error);
      }

      ProductionLogger.error(`Error loading risk data for ${type}:`, 'RiskMapService', error);
      // Return a rejected promise to propagate the error
      return Promise.reject(error);
    });

    return this.loadingPromise;
  }

  // Clear the cache to force a reload
  clearCache(): void {
    ProductionLogger.debug('Clearing cache', 'RiskMapService');
    this.riskDataCache = null;

    // Also abort any pending request
    if (this.abortController) {
      ProductionLogger.debug('Aborting pending request during cache clear', 'RiskMapService');
      this.abortController.abort();
      this.loadingPromise = null;
      this.abortController = null;
      this.currentType = null;
    }
  }

  // Get available credits
  getAvailableCredits(): number {
    return this.availableCredits;
  }

  // Update available credits
  setAvailableCredits(credits: number): void {
    this.availableCredits = credits;
  }

  // Get purchased reports
  getPurchasedReports(): PurchasedReport[] {
    const reports = localStorage.getItem('purchasedReports');
    return reports ? JSON.parse(reports) : [];
  }

  // Save purchased reports
  savePurchasedReports(reports: PurchasedReport[]): void {
    localStorage.setItem('purchasedReports', JSON.stringify(reports));
  }

  // Add a purchased report
  addPurchasedReport(transactionId: string, riskMapType: RiskMapType): PurchasedReport {
    ProductionLogger.debug(
      `Adding purchased report for transaction ${transactionId}, type ${riskMapType}`,
      'RiskMapService'
    );
    const reports = this.getPurchasedReports();

    // Create a new report
    const newReport: PurchasedReport = {
      id: `report_${Date.now()}`,
      transactionId,
      riskMapType,
      purchaseDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days validity
    };

    // Add to reports list
    reports.push(newReport);
    this.savePurchasedReports(reports);

    ProductionLogger.debug(`Report added successfully: ${newReport.id}`, 'RiskMapService');
    return newReport;
  }

  // Check if a report is already purchased
  isReportPurchased(transactionId: string, riskMapType: RiskMapType): boolean {
    const reports = this.getPurchasedReports();
    const currentDate = new Date();

    // Look for a valid (non-expired) report
    const isPurchased = reports.some(
      report =>
        report.transactionId === transactionId &&
        report.riskMapType === riskMapType &&
        new Date(report.expiryDate) > currentDate
    );

    ProductionLogger.debug(
      `Report purchase check for ${transactionId}, ${riskMapType}: ${isPurchased}`,
      'RiskMapService'
    );
    return isPurchased;
  }

  // Purchase a report using credits
  purchaseReport(transactionId: string, riskMapType: RiskMapType): boolean {
    ProductionLogger.debug(
      `Attempting to purchase report for transaction ${transactionId}, type ${riskMapType}`,
      'RiskMapService'
    );

    // First check if already purchased
    if (this.isReportPurchased(transactionId, riskMapType)) {
      ProductionLogger.debug('Report already purchased, no need to use credits', 'RiskMapService');
      return true; // Already purchased, no need to use credits
    }

    // Try to use a credit
    const creditUsed = this.spendCredit();
    if (creditUsed) {
      ProductionLogger.debug('Credit used successfully, adding to purchased reports', 'RiskMapService');
      // Add to purchased reports
      this.addPurchasedReport(transactionId, riskMapType);
      return true;
    } else {
      ProductionLogger.warn('Failed to use credit - insufficient credits', 'RiskMapService');
    }

    return false; // Not enough credits
  }

  // Use a credit
  spendCredit(): boolean {
    const credits = this.getAvailableCredits();
    if (credits <= 0) {
      ProductionLogger.warn('No credits available to use', 'RiskMapService');
      return false;
    }

    ProductionLogger.debug(`Using 1 credit. Before: ${credits}, After: ${credits - 1}`, 'RiskMapService');
    this.setAvailableCredits(credits - 1);
    return true;
  }

  // Add credits
  addCredits(amount: number): void {
    const credits = this.getAvailableCredits();
    ProductionLogger.debug(
      `Adding ${amount} credits. Before: ${credits}, After: ${credits + amount}`,
      'RiskMapService'
    );
    this.setAvailableCredits(credits + amount);
  }

  // Get full risk score and report WITH Filelock and Shield Vault integration
  async fetchFullRiskReport(
    transactionId: string,
    riskMapType: RiskMapType
  ): Promise<EvaReportData> {
    const isPurchased =
      this.isReportPurchased(transactionId, riskMapType) ||
      this.purchaseReport(transactionId, riskMapType);

    if (!isPurchased) {
      throw new Error('Insufficient credits to purchase report');
    }

    const [riskData, fullReportDataFromApi] = await Promise.all([
      this.fetchRiskData(riskMapType, true), // force reload for full report
      evaReportApi.fetchFullReport(transactionId, riskMapType),
    ]);

    const combinedReportData: EvaReportData = {
      ...riskData,
      reportDetails: fullReportDataFromApi,
      isPremium: true,
      transactionId: transactionId,
      riskMapType: riskMapType,
    };

    // Generate PDF (mock implementation)
    try {
      // Convert report data to string representation for mock purposes
      const reportElement = document.createElement('div');
      reportElement.innerHTML = `<pre>${JSON.stringify(combinedReportData, null, 2)}</pre>`;
      document.body.appendChild(reportElement);

      const pdfBlob = await generatePdf(reportElement);

      // Clean up the temporary element
      document.body.removeChild(reportElement);

      // Upload to Filelock
      const { fileId, viewUrl } = await FilelockService.upload(transactionId, pdfBlob);
      ProductionLogger.debug(
        `PDF uploaded to Filelock. File ID: ${fileId}, View URL: ${viewUrl}`,
        'RiskMapService'
      );

      // Record event in Shield Vault
      await ShieldVaultService.recordEvent(transactionId, 'eva_report_generated', {
        reportType: riskMapType,
        filelockFileId: fileId,
        filelockViewUrl: viewUrl,
        timestamp: new Date().toISOString(),
      });
      ProductionLogger.debug('EVA Report generation event recorded in Shield Vault.', 'RiskMapService');

      // Add filelock details to the returned report data
      combinedReportData.filelockInfo = { fileId, viewUrl };
    } catch (integrationError) {
      ProductionLogger.error(
        'Error during Filelock/ShieldVault integration:',
        'RiskMapService',
        integrationError
      );
    }

    return combinedReportData;
  }

  // Convert between RiskMapType and LoanType
  mapRiskMapTypeToLoanType(riskMapType: RiskMapType): string {
    switch (riskMapType) {
      case 'equipment':
        return 'equipment';
      case 'realestate':
        return 'realestate';
      default:
        return 'general';
    }
  }

  // Convert from LoanType to RiskMapType
  mapLoanTypeToRiskMapType(loanType: string): RiskMapType {
    switch (loanType) {
      case 'equipment':
        return 'equipment';
      case 'realestate':
        return 'realestate';
      default:
        return 'unsecured';
    }
  }

  // Private method to get mock risk data
  private getMockRiskData(type: RiskMapType): RiskData {
    if (type === 'equipment') {
      return {
        score: 76,
        industry_avg: 70,
        confidence: 88,
        categories: {
          credit: { score: 80, status: 'green' },
          capacity: { score: 72, status: 'yellow' },
          capital: { score: 85, status: 'green' },
          collateral: { score: 90, status: 'green' },
          conditions: { score: 68, status: 'yellow' },
          character: { score: 92, status: 'green' },
        },
        findings: [
          { type: 'positive', text: 'Equipment valuation indicates sufficient collateral' },
          { type: 'positive', text: 'Strong business credit profile' },
          { type: 'warning', text: 'Debt service coverage ratio is slightly below ideal range' },
          { type: 'positive', text: 'Clear equipment maintenance records' },
        ],
      };
    } else if (type === 'realestate') {
      return {
        score: 88,
        industry_avg: 75,
        confidence: 94,
        categories: {
          credit: { score: 90, status: 'green' },
          capacity: { score: 82, status: 'green' },
          capital: { score: 88, status: 'green' },
          collateral: { score: 95, status: 'green' },
          conditions: { score: 78, status: 'yellow' },
          character: { score: 90, status: 'green' },
        },
        findings: [
          { type: 'positive', text: 'Property valuation exceeds loan requirements' },
          { type: 'positive', text: 'Excellent repayment history on previous loans' },
          { type: 'positive', text: 'Solid rental income history for the property' },
          { type: 'warning', text: 'Market conditions in the area show moderate volatility' },
        ],
      };
    } else {
      // Unsecured (default)
      return {
        score: 82,
        industry_avg: 74,
        confidence: 92,
        categories: {
          credit: { score: 85, status: 'green' },
          capacity: { score: 78, status: 'yellow' },
          capital: { score: 90, status: 'green' },
          collateral: { score: 82, status: 'green' },
          conditions: { score: 94, status: 'green' },
          character: { score: 95, status: 'green' },
        },
        findings: [
          {
            type: 'positive',
            text: 'Strong credit history with consistent payment behavior over last 24 months',
          },
          {
            type: 'positive',
            text: 'Business has demonstrated ability to service existing debt obligations',
          },
          {
            type: 'warning',
            text: 'Debt service coverage ratio is adequate but lower than industry average',
          },
          {
            type: 'positive',
            text: 'Excellent character assessment with no detected compliance issues',
          },
        ],
      };
    }
  }

  public async getDemoAnalysisSequence(riskMapType: RiskMapType): Promise<any[]> {
    // Return a sequence of analysis steps with parameterized results
    await simulateApiDelay(500); // Simulate API call delay

    // Create base sequence for all risk map types
    const baseSequence = [
      {
        stage: 'Initializing EVA Risk Analysis Engine...',
        progress: 10,
        duration: 800,
      },
      {
        stage: 'Preparing data models and benchmarks...',
        progress: 20,
        duration: 1000,
      },
      {
        stage: 'Analyzing Credit History...',
        progress: 35,
        param: 'Credit History',
        score: 85,
        duration: 1200,
      },
      {
        stage: 'Evaluating Market Conditions...',
        progress: 50,
        param: 'Market Conditions',
        score: 75,
        duration: 1100,
      },
      {
        stage: 'Calculating Capacity Metrics...',
        progress: 65,
        param: 'Cash Flow',
        score: 80,
        duration: 900,
      },
      {
        stage: 'Applying AI Risk Models...',
        progress: 75,
        duration: 1000,
      },
      {
        stage: 'Generating Character Assessment...',
        progress: 85,
        param: 'Character Assessment',
        score: 90,
        duration: 800,
      },
      {
        stage: 'Finalizing Report...',
        progress: 95,
        duration: 1200,
      },
      {
        stage: 'Analysis Complete',
        progress: 100,
        duration: 500,
      },
    ];

    // Customize sequence based on risk map type
    if (riskMapType === 'realestate') {
      return [
        baseSequence[0],
        baseSequence[1],
        {
          stage: 'Analyzing Property Valuation...',
          progress: 35,
          param: 'Property Valuation',
          score: 85,
          duration: 1200,
        },
        {
          stage: 'Evaluating Real Estate Market...',
          progress: 50,
          param: 'Real Estate Market',
          score: 88,
          duration: 1100,
        },
        {
          stage: 'Calculating Cash Flow Metrics...',
          progress: 65,
          param: 'Cash Flow',
          score: 82,
          duration: 900,
        },
        baseSequence[5],
        {
          stage: 'Analyzing Location Factors...',
          progress: 85,
          param: 'Location Analysis',
          score: 78,
          duration: 800,
        },
        baseSequence[7],
        baseSequence[8],
      ];
    } else if (riskMapType === 'equipment') {
      return [
        baseSequence[0],
        baseSequence[1],
        {
          stage: 'Analyzing Equipment Valuation...',
          progress: 35,
          param: 'Equipment Valuation',
          score: 80,
          duration: 1200,
        },
        {
          stage: 'Evaluating Productivity Impact...',
          progress: 50,
          param: 'Productivity Impact',
          score: 85,
          duration: 1100,
        },
        {
          stage: 'Analyzing Equipment Market...',
          progress: 65,
          param: 'Equipment Market',
          score: 72,
          duration: 900,
        },
        baseSequence[5],
        {
          stage: 'Performing Financial Analysis...',
          progress: 85,
          param: 'Financial Analysis',
          score: 78,
          duration: 800,
        },
        baseSequence[7],
        baseSequence[8],
      ];
    }

    // Default to the base sequence for unsecured/general
    return baseSequence;
  }
}

// Create a singleton instance
const riskMapServiceInstance = new RiskMapService();

// Export as a singleton to ensure consistent state across components
export default riskMapServiceInstance;
