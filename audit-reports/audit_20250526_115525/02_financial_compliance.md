# Section 2: Financial Calculations & Compliance

## Findings:

### 2.1 Financial Precision
src/types/date-fns.d.ts:  export function addDays(date: Date | number, amount: number): Date;
src/types/date-fns.d.ts:  export function addHours(date: Date | number, amount: number): Date;
src/types/date-fns.d.ts:  export function addMinutes(date: Date | number, amount: number): Date;
src/types/date-fns.d.ts:  export function addMonths(date: Date | number, amount: number): Date;
src/types/date-fns.d.ts:  export function addQuarters(date: Date | number, amount: number): Date;
src/types/date-fns.d.ts:  export function addSeconds(date: Date | number, amount: number): Date;
src/types/date-fns.d.ts:  export function addWeeks(date: Date | number, amount: number): Date;
src/types/date-fns.d.ts:  export function addYears(date: Date | number, amount: number): Date;
src/types/date-fns.d.ts:  export function subDays(date: Date | number, amount: number): Date;
src/types/date-fns.d.ts:  export function subHours(date: Date | number, amount: number): Date;
src/types/date-fns.d.ts:  export function subMinutes(date: Date | number, amount: number): Date;
src/types/date-fns.d.ts:  export function subMonths(date: Date | number, amount: number): Date;
src/types/date-fns.d.ts:  export function subQuarters(date: Date | number, amount: number): Date;
src/types/date-fns.d.ts:  export function subSeconds(date: Date | number, amount: number): Date;
src/types/date-fns.d.ts:  export function subWeeks(date: Date | number, amount: number): Date;
src/types/date-fns.d.ts:  export function subYears(date: Date | number, amount: number): Date;
src/types/ProtocolDefinitions.ts:  FORM_1120 = 'tax_return_1120',             // Corporate tax return
src/types/ProtocolDefinitions.ts: * Repayment Frequency Standardization
src/types/ProtocolDefinitions.ts:export enum RepaymentFrequency {
src/types/ProtocolDefinitions.ts:  FACTOR = 'factor_rate',  // Used in merchant cash advances
src/types/ProtocolDefinitions.ts:  SPLIT = 'split_rate',    // Part fixed, part variable
src/types/ProtocolDefinitions.ts: * Standardizes how external data is integrated
src/types/ProtocolDefinitions.ts:  PAYMENT_PROCESSOR = 'payment_processor',
src/types/conversation.ts:  amount: number;
src/types/ApiTypes.ts:  amount: number;
src/types/AssetClassTypes.ts:  CORPORATE_BONDS = 'corporate_bonds',
src/types/AssetClassTypes.ts:  [AssetClass.CORPORATE_BONDS]: 'Corporate Bonds',
src/contexts/UserTypeContext.tsx:          // For now, assuming they operate under LENDER permissions as a placeholder.
src/contexts/DealContext.tsx:  interestRate: React.ReactNode | Iterable<React.ReactNode>;
src/contexts/DealContext.tsx:  amount: number;
src/contexts/DealContext.tsx:  rate?: number; // interest rate
src/contexts/DealContext.tsx:  // Helper to generate IDs
src/contexts/DealContext.tsx:  const generateId = () => `id-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
src/contexts/DealContext.tsx:          amount: 5500000,
src/contexts/DealContext.tsx:          rate: 5.75,
src/contexts/DealContext.tsx:          interestRate: "5.75%",
src/contexts/DealContext.tsx:              text: 'Borrower has expressed interest in increasing the loan amount if terms are favorable.',
src/contexts/DealContext.tsx:              content: 'Borrower has expressed interest in increasing the loan amount if terms are favorable.',
src/contexts/DealContext.tsx:          amount: 8200000,
src/contexts/DealContext.tsx:          rate: 6.25,
src/contexts/DealContext.tsx:          interestRate: "6.25%",
src/contexts/DealContext.tsx:        id: generateId(),
src/contexts/DealContext.tsx:        amount: dealData.amount || 0,
src/contexts/DealContext.tsx:        interestRate: dealData.interestRate || '0.00%',
src/contexts/DealContext.tsx:          id: generateId(),
src/contexts/DealContext.tsx:            id: generateId(),
src/contexts/DealContext.tsx:      id: generateId(),
src/contexts/DealContext.tsx:      id: generateId(),
src/contexts/DealContext.tsx:      id: generateId(),
src/contexts/DealContext.tsx:      id: generateId(),
src/contexts/DealContext.tsx:      id: generateId(),
src/contexts/WorkflowContext.tsx:  amount?: number;
src/contexts/WorkflowContext.tsx:    rate: number;
src/contexts/WorkflowContext.tsx:    payment: number;
src/contexts/WorkflowContext.tsx:      // Set amount if provided in data
src/contexts/WorkflowContext.tsx:      amount: data.requestedAmount,
src/contexts/WorkflowContext.tsx:          amount: 250000,
src/contexts/RiskConfigContext.tsx:    description: 'Credit history and payment performance of the borrower',
src/contexts/RiskConfigContext.tsx:    description: 'Credit history and payment performance of the borrower',
src/contexts/RiskConfigContext.tsx:    description: 'Credit history and payment performance of the borrower',
src/contexts/RiskConfigContext.tsx:    id: 'moderate',
src/contexts/RiskConfigContext.tsx:    level: 'Moderate',
src/contexts/RiskConfigContext.tsx:      'Balanced approach to risk and return. Accept moderate credit risk with adequate collateral. Will consider growing industries with some volatility if compensated by higher returns.',
src/contexts/TransactionContext.tsx:  amount?: number;
src/config/redis.ts:  // Credit and payment data
src/config/redis.ts:  PAYMENT_METHODS: (userId: string) => `payment:methods:${userId}`,
src/service-worker.ts:import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';
src/service-worker.ts:// Precache all of the assets generated by your build process
src/service-worker.ts:// Cache API calls with a stale-while-revalidate strategy
src/service-worker.ts:// Cache images with a cache-first strategy
src/service-worker.ts:// Cache font files with a cache-first strategy
src/utils/rateLimiter.ts: * This utility provides client-side rate limiting functionality to prevent abuse of
src/utils/rateLimiter.ts:// Default rate limit store in LocalStorage
src/utils/rateLimiter.ts:const RATE_LIMIT_STORAGE_KEY = 'eva-rate-limits';
src/utils/rateLimiter.ts: * Client-side rate limiter
src/utils/rateLimiter.ts:   * Create a new rate limiter instance
src/utils/rateLimiter.ts:   * Initialize the rate limiter storage
src/utils/rateLimiter.ts:      console.error('Failed to initialize rate limiter:', error);
src/utils/rateLimiter.ts:   * Save rate limit data to storage
src/utils/rateLimiter.ts:      console.error('Failed to save rate limit data:', error);
src/utils/rateLimiter.ts:   * Check if an action is allowed based on rate limits
src/utils/rateLimiter.ts:   * Reset rate limit for an action
src/utils/rateLimiter.ts:   * Reset all rate limits
src/utils/rateLimiter.ts:// Default rate limiter instance
src/utils/rateLimiter.ts:export const rateLimiter = new RateLimiter();
src/utils/rateLimiter.ts:// Standard rate limit configurations
src/utils/financialCalculations.ts: * Calculates monthly payment for a loan or lease
src/utils/financialCalculations.ts:  // Calculate loan amount after down payment and residual
src/utils/financialCalculations.ts:  // Convert annual interest rate to monthly
src/utils/financialCalculations.ts:  // Calculate payment using the loan formula
src/utils/financialCalculations.ts:    // No interest case
src/utils/financialCalculations.ts:    // Standard loan payment formula
src/utils/financialCalculations.ts:  // Calculate total payments and interest
src/utils/financialCalculations.ts: * Simplified payment calculation (backward compatibility)
src/utils/financialCalculations.ts: * @param amount - Principal amount
src/utils/financialCalculations.ts: * @param rate - Annual interest rate as percentage
src/utils/financialCalculations.ts: * @param downPayment - Down payment amount
src/utils/financialCalculations.ts: * @returns Monthly payment amount
src/utils/financialCalculations.ts:  amount: number,
src/utils/financialCalculations.ts:  rate: number,
src/utils/financialCalculations.ts:    principal: amount,
src/utils/financialCalculations.ts:    annualInterestRate: rate,
src/utils/financialCalculations.ts: * @param existingDebtPayments - Existing monthly debt payments
src/utils/financialCalculations.ts: * @returns Maximum affordable monthly payment
src/utils/financialCalculations.ts: * Calculate the maximum loan amount based on affordable payment
src/utils/financialCalculations.ts: * @param affordablePayment - Maximum affordable monthly payment
src/utils/financialCalculations.ts: * @param annualInterestRate - Annual interest rate as percentage
src/utils/financialCalculations.ts: * @param downPayment - Available down payment
src/utils/financialCalculations.ts: * @returns Maximum loan amount
src/utils/financialCalculations.ts:    // Reverse loan payment formula to find principal
src/utils/financialCalculations.ts:  // Add back down payment and residual to get total asset value
src/utils/financialCalculations.ts: * Format currency amount for display
src/utils/financialCalculations.ts: * @param amount - Amount to format
src/utils/financialCalculations.ts:export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
src/utils/financialCalculations.ts:  }).format(amount);
src/utils/financialCalculations.ts: * Calculate effective annual rate (APR) including fees
src/utils/financialCalculations.ts: * @param principal - Loan amount
src/utils/financialCalculations.ts: * @param monthlyPayment - Monthly payment amount
src/utils/financialCalculations.ts: * @returns Effective annual percentage rate
src/utils/userStoryHelper.tsx: * Generates documentation from user stories and journeys
src/utils/userStoryHelper.tsx:export const generateComponentDocumentation = (
src/utils/userStoryHelper.tsx:  generateComponentDocumentation,
src/utils/initDemoCredits.ts: * a real payment system.
src/utils/initDemoCredits.ts: * @param amount - Number of credits to add
src/utils/initDemoCredits.ts:export const addDemoCredits = (amount: number = 50): number => {
src/utils/initDemoCredits.ts:  const result = CreditsService.addCredits(amount, 'Demo credits added');
src/utils/initDemoCredits.ts:    const amountToAdd = minCredits - currentCredits.balance;
src/utils/initDemoCredits.ts:    if (amountToAdd > 0) {
src/utils/initDemoCredits.ts:      CreditsService.addCredits(amountToAdd, 'Demo environment initialization');
src/utils/formValidation.ts: * Validates currency amount
src/utils/ComponentScanner.tsx:// and generate this map, or use a different approach like importing a manifest
src/utils/__tests__/formValidation.test.ts:    it('should validate currency amounts', () => {
src/utils/__tests__/formValidation.test.ts:    it('should validate min/max amounts', () => {
src/utils/__tests__/financialCalculations.test.ts:    it('should calculate payment with interest correctly', () => {
src/utils/__tests__/financialCalculations.test.ts:    it('should calculate payment with no interest', () => {
src/utils/__tests__/financialCalculations.test.ts:    it('should handle down payment correctly', () => {
src/utils/__tests__/financialCalculations.test.ts:    it('should handle both down payment and residual', () => {
src/utils/__tests__/financialCalculations.test.ts:    it('should calculate affordable payment correctly', () => {
src/utils/__tests__/financialCalculations.test.ts:    it('should calculate max loan amount with interest', () => {
src/utils/__tests__/financialCalculations.test.ts:    it('should calculate max loan amount with no interest', () => {
src/utils/__tests__/financialCalculations.test.ts:    it('should include down payment and residual in total', () => {
src/utils/__tests__/financialCalculations.test.ts:    it('should handle negative amounts', () => {
src/utils/__tests__/financialCalculations.test.ts:      // Total payments: 1933.28 * 60 = 115996.8
src/utils/__tests__/financialCalculations.test.ts:      // Total interest: 116996.8 - 100000 = 16996.8
src/utils/__tests__/financialCalculations.test.ts:    it('should handle zero interest case', () => {
src/utils/__tests__/financialCalculations.test.ts:      // Monthly payment for 0% interest would be 100000/60 = 1666.67
src/utils/__tests__/financialCalculations.test.ts:    it('should handle very small amounts', () => {
src/utils/__tests__/financialCalculations.test.ts:    it('should handle very large amounts', () => {
src/utils/security.ts:// Get encryption key from environment or generate a secure one
src/utils/security.ts: * Generate secure random tokens
src/utils/security.ts:export const generateSecureToken = (length: number = 32): string => {
src/utils/security.ts:  generateSecureToken,
src/utils/fileUtils.ts:      id: generateId(),
src/utils/fileUtils.ts:export const generateId = (): string => {
src/utils/financialUtils.ts:  amount: number,
src/utils/financialUtils.ts:  const preciseAmount = toFinancialPrecision(amount);
src/utils/financialUtils.ts: * Calculates compound interest
src/utils/financialUtils.ts:  rate: number,
src/utils/financialUtils.ts:): { total: number; interest: number } => {
src/utils/financialUtils.ts:  if (principal < 0 || rate < 0 || time < 0 || compoundingFrequency < 1) {
src/utils/financialUtils.ts:    throw new Error('Invalid input values for compound interest calculation');
src/utils/financialUtils.ts:  // Convert rate to decimal
src/utils/financialUtils.ts:  const rateDecimal = rate / 100;
src/utils/financialUtils.ts:  // Calculate compound interest: A = P(1 + r/n)^(nt)
src/utils/financialUtils.ts:    principal * Math.pow(1 + rateDecimal / compoundingFrequency, compoundingFrequency * time);
src/utils/financialUtils.ts:  const interest = total - principal;
src/utils/financialUtils.ts:    'compound_interest',
src/utils/financialUtils.ts:    { principal, rate, time, compoundingFrequency },
src/utils/financialUtils.ts:    { total: toFinancialPrecision(total), interest: toFinancialPrecision(interest) },
src/utils/financialUtils.ts:    interest: toFinancialPrecision(interest),
src/utils/financialUtils.ts: * Calculates loan payment (PMT)
src/utils/financialUtils.ts:    throw new Error('Invalid input values for loan payment calculation');
src/utils/financialUtils.ts:  // Convert annual rate to monthly
src/utils/financialUtils.ts:  // If rate is 0, payment is simply principal divided by term
src/utils/financialUtils.ts:  // Calculate payment using PMT formula
src/utils/financialUtils.ts:  const payment =
src/utils/financialUtils.ts:    'loan_payment',
src/utils/financialUtils.ts:    toFinancialPrecision(payment),
src/utils/financialUtils.ts:  return toFinancialPrecision(payment);
src/utils/financialUtils.ts:  payment: number;
src/utils/financialUtils.ts:  interest: number;
src/utils/financialUtils.ts:    const interestPayment = toFinancialPrecision(balance * monthlyRate);
src/utils/financialUtils.ts:    const principalPayment = toFinancialPrecision(monthlyPayment - interestPayment);
src/utils/financialUtils.ts:    // Handle rounding on final payment
src/utils/financialUtils.ts:      payment: monthlyPayment,
src/utils/financialUtils.ts:      interest: interestPayment,
src/utils/financialUtils.ts: * Calculates tax amount
src/utils/financialUtils.ts:export const calculateTax = (amount: number, taxRate: number): { tax: number; total: number } => {
src/utils/financialUtils.ts:  const tax = toFinancialPrecision(amount * (taxRate / 100));
src/utils/financialUtils.ts:  const total = toFinancialPrecision(amount + tax);
src/utils/financialUtils.ts: * Validates if a value is a valid financial amount
src/utils/pdfGenerator.ts: * Generates a PDF from a specified HTML element
src/utils/pdfGenerator.ts:export const generatePdf = async (
src/utils/scoringConstants.ts:    paymentHistory: {
src/utils/dateValidation.ts:  // Clear time part for accurate date comparison
src/setupTests.ts:// In plain Jest runs (or when individual tests deliberately delete `window`)
src/components/demo/DemoWorkflowSimulator.tsx:  // Generate demo credit application based on profile
src/components/demo/DemoWorkflowSimulator.tsx:  const generateDemoApplication = useCallback((): CreditApplication => {
src/components/demo/DemoWorkflowSimulator.tsx:    const amounts = {
src/components/demo/DemoWorkflowSimulator.tsx:      requestedAmount: amounts[loanType][borrowerProfile],
src/components/demo/DemoWorkflowSimulator.tsx:          const application = generateDemoApplication();
src/components/demo/DemoWorkflowSimulator.tsx:    generateDemoApplication,
src/components/demo/ChatDemo.tsx:import { generateId } from '../../utils/fileUtils';
src/components/demo/ChatDemo.tsx:      id: generateId(),
src/components/demo/ChatDemo.tsx:        id: generateId(),
src/components/demo/ChatSettingsPanel.tsx:        <Tooltip content="Allows EVA to perform more in-depth analysis and generate longer responses.">
src/components/StripeConnectModal.tsx:                Choose how you want to integrate with Stripe to process payments
src/components/StripeConnectModal.tsx:                    <p className="mt-1 text-xs text-gray-500">Where payments will be deposited</p>
src/components/StripeConnectModal.tsx:              Connecting to Stripe and configuring your payment account...
src/components/StripeConnectModal.tsx:              You can now receive payments through {accountData.businessName}.
src/components/EVAAssistantChat.tsx:          'Generate a risk mitigation strategy for a new FinTech product',
src/components/EVAAssistantChat.tsx:        // Add predictive prompts as a separate message from the AI
src/components/EVAAssistantChat.tsx:      utterance.rate = 0.9;
src/components/EVAAssistantChat.tsx:      const aiResponse = generateEnhancedAIResponse(inputText, selectedAgent, uploadedFiles);
src/components/EVAAssistantChat.tsx:  const generateEnhancedAIResponse = (
src/components/EVAAssistantChat.tsx:      `${getAgentIcon(agent)} As ${agent.fullName}, I've processed your request using ${activeToolsCount} active tools and ${connectedServers} connected MCP servers.${filesText} Here's what I found based on the integrated data sources and real-time analysis.`,
src/components/EVAAssistantChat.tsx:      `Using advanced AI capabilities with ${mcpServers.length} MCP servers and custom tool integration, I've processed your query through our enhanced pipeline.${filesText} The results show interesting patterns that I can elaborate on.`,
src/components/CreateCustomAIAgent.tsx:        'Generate a loan pricing recommendation based on market conditions',
src/components/CreateCustomAIAgent.tsx:        'Generate a borrower presentation summarizing deal highlights',
src/components/CreateCustomAIAgent.tsx:        'Help me create a competitive pricing strategy',
src/components/CreateCustomAIAgent.tsx:        'Generate a vendor financing proposal template',
src/components/CreateCustomAIAgent.tsx:        'Generate a stakeholder update for this deal progression',
src/components/CreateCustomAIAgent.tsx:        'Generate internal risk assessment notes',
src/components/CreateCustomAIAgent.tsx:        'Analyze asset utilization rates and market demand',
src/components/CreateCustomAIAgent.tsx:        'Analyze rental income potential and cap rates',
src/components/CreateCustomAIAgent.tsx:        'Calculate equipment financing rates and terms',
src/components/credit/CreditCommitteeDashboard.tsx:  // Sample approval rates by instrument type (monthly)
src/components/credit/CreditCommitteeDashboard.tsx:        amount: 450000, 
src/components/credit/CreditCommitteeDashboard.tsx:        amount: 2800000,
src/components/credit/CreditCommitteeDashboard.tsx:        amount: 175000,
src/components/credit/CreditCommitteeDashboard.tsx:        amount: 680000,
src/components/credit/CreditCommitteeDashboard.tsx:        amount: 3250000,
src/components/credit/CreditCommitteeDashboard.tsx:        amount: 350000,
src/components/credit/CreditCommitteeDashboard.tsx:                  return `$${(apps.reduce((sum, app) => sum + app.amount, 0) / 1000000).toFixed(1)}M`;
src/components/credit/CreditCommitteeDashboard.tsx:                        ${application.amount.toLocaleString()}
src/components/credit/KYBDocumentRequirements.tsx:      description: 'State-issued certificate of corporate formation',
src/components/credit/KYBDocumentRequirements.tsx:      name: 'Corporate Bylaws',
src/components/credit/KYBDocumentRequirements.tsx:      description: 'Corporate authorization for borrowing/transactions',
src/components/credit/KYBDocumentRequirements.tsx:    corporate_resolution: {
src/components/credit/KYBDocumentRequirements.tsx:      name: 'Corporate Resolution',
src/components/credit/BusinessTaxReturns.tsx:  // Base requirements by transaction amount
src/components/credit/BusinessTaxReturns.tsx:            Based on your transaction type and amount, the following schedules must be included:
src/components/credit/BusinessTaxReturns.tsx:              Note: Audited financial statements are required for this transaction amount.
src/components/credit/BusinessTaxReturns.tsx:              your entity type and transaction amount.
src/components/credit/CreditRequestTermsDetails.tsx:  paymentFrequency: 'monthly' | 'quarterly' | 'semi-annual' | 'annual';
src/components/credit/CreditRequestTermsDetails.tsx:  prepaymentPenalty: boolean;
src/components/credit/CreditRequestTermsDetails.tsx:  prepaymentPenaltyTerms?: string;
src/components/credit/CreditRequestTermsDetails.tsx:  { value: 'corporate_bonds', label: 'Corporate Bonds' },
src/components/credit/CreditRequestTermsDetails.tsx:    paymentFrequency: initialData.paymentFrequency || 'monthly',
src/components/credit/CreditRequestTermsDetails.tsx:    prepaymentPenalty: initialData.prepaymentPenalty || false,
src/components/credit/CreditRequestTermsDetails.tsx:    prepaymentPenaltyTerms: initialData.prepaymentPenaltyTerms,
src/components/credit/CreditRequestTermsDetails.tsx:  // Calculate down payment percentage when amount changes
src/components/credit/CreditRequestTermsDetails.tsx:  // Update down payment amount when percentage changes
src/components/credit/CreditRequestTermsDetails.tsx:      const amount = (percentage / 100) * formData.requestedAmount;
src/components/credit/CreditRequestTermsDetails.tsx:        budgetedDownPayment: Number(amount.toFixed(2)),
src/components/credit/CreditRequestTermsDetails.tsx:      newErrors.requestedAmount = 'Please enter a valid amount';
src/components/credit/CreditRequestTermsDetails.tsx:        newErrors.balloonPaymentAmount = 'Please enter a valid balloon payment amount';
src/components/credit/CreditRequestTermsDetails.tsx:        newErrors.balloonPaymentMonths = 'Please enter valid balloon payment months';
src/components/credit/CreditRequestTermsDetails.tsx:              htmlFor="paymentFrequency"
src/components/credit/CreditRequestTermsDetails.tsx:              id="paymentFrequency"
src/components/credit/CreditRequestTermsDetails.tsx:              name="paymentFrequency"
src/components/credit/CreditRequestTermsDetails.tsx:              value={formData.paymentFrequency}
src/components/credit/CreditRequestTermsDetails.tsx:          {/* Prepayment Penalty */}
src/components/credit/CreditRequestTermsDetails.tsx:                id="prepaymentPenalty"
src/components/credit/CreditRequestTermsDetails.tsx:                name="prepaymentPenalty"
src/components/credit/CreditRequestTermsDetails.tsx:                checked={formData.prepaymentPenalty}
src/components/credit/CreditRequestTermsDetails.tsx:                  setFormData(prev => ({ ...prev, prepaymentPenalty: e.target.checked }))
src/components/credit/CreditRequestTermsDetails.tsx:                htmlFor="prepaymentPenalty"
src/components/credit/CreditRequestTermsDetails.tsx:                Include Prepayment Penalty
src/components/credit/CreditRequestTermsDetails.tsx:            {formData.prepaymentPenalty && (
src/components/credit/CreditRequestTermsDetails.tsx:                  htmlFor="prepaymentPenaltyTerms"
src/components/credit/CreditRequestTermsDetails.tsx:                  id="prepaymentPenaltyTerms"
src/components/credit/CreditRequestTermsDetails.tsx:                  name="prepaymentPenaltyTerms"
src/components/credit/CreditRequestTermsDetails.tsx:                  value={formData.prepaymentPenaltyTerms || ''}
src/components/credit/DynamicFinancialStatements.tsx: * This component integrates multiple Stripe APIs to provide comprehensive financial
src/components/credit/DynamicFinancialStatements.tsx: *    - Chargeback rates and trends
src/components/credit/DynamicFinancialStatements.tsx: * - Business model validation through payment data
src/components/credit/DynamicFinancialStatements.tsx:  documents?: GeneratedDocument[];
src/components/credit/DynamicFinancialStatements.tsx:interface GeneratedDocument {
src/components/credit/DynamicFinancialStatements.tsx:  dateGenerated: string;
src/components/credit/DynamicFinancialStatements.tsx:    paymentMethods?: string[];
src/components/credit/DynamicFinancialStatements.tsx:  onDocumentsGenerated?: (documents: GeneratedDocument[]) => void;
src/components/credit/DynamicFinancialStatements.tsx:  onDocumentView?: (document: GeneratedDocument) => void;
src/components/credit/DynamicFinancialStatements.tsx:  onDocumentsGenerated,
src/components/credit/DynamicFinancialStatements.tsx:  const [generatedDocuments, setGeneratedDocuments] = useState<GeneratedDocument[]>([]);
src/components/credit/DynamicFinancialStatements.tsx:  const [selectedDocument, setSelectedDocument] = useState<GeneratedDocument | null>(null);
src/components/credit/DynamicFinancialStatements.tsx:        description: 'Access payment processing data and financial connections',
src/components/credit/DynamicFinancialStatements.tsx:  // Auto-generate documents when accounts are connected
src/components/credit/DynamicFinancialStatements.tsx:    if (connectedAccounts.length > 0 && generatedDocuments.length === 0) {
src/components/credit/DynamicFinancialStatements.tsx:      generateFinancialDocuments();
src/components/credit/DynamicFinancialStatements.tsx:        // Generate mock accounts for the selected provider
src/components/credit/DynamicFinancialStatements.tsx:        const newAccounts = await generateMockAccountsForProvider(providerId);
src/components/credit/DynamicFinancialStatements.tsx:        // Generate documents for the new accounts
src/components/credit/DynamicFinancialStatements.tsx:        await generateDocumentsForProvider(providerId, newAccounts);
src/components/credit/DynamicFinancialStatements.tsx:  // Generate documents for specific provider accounts
src/components/credit/DynamicFinancialStatements.tsx:  const generateDocumentsForProvider = useCallback(
src/components/credit/DynamicFinancialStatements.tsx:      const newDocuments: GeneratedDocument[] = [];
src/components/credit/DynamicFinancialStatements.tsx:            // Generate Plaid-specific documents
src/components/credit/DynamicFinancialStatements.tsx:                dateGenerated: new Date().toISOString(),
src/components/credit/DynamicFinancialStatements.tsx:                dateGenerated: new Date().toISOString(),
src/components/credit/DynamicFinancialStatements.tsx:            // Generate comprehensive Stripe financial and risk reports
src/components/credit/DynamicFinancialStatements.tsx:            const disputeRate = 0.5 + Math.random() * 1.5; // 0.5-2% dispute rate
src/components/credit/DynamicFinancialStatements.tsx:              dateGenerated: new Date().toISOString(),
src/components/credit/DynamicFinancialStatements.tsx:                  'Revenue data from Stripe payment processing',
src/components/credit/DynamicFinancialStatements.tsx:                  'Data includes all successful payments and refunds',
src/components/credit/DynamicFinancialStatements.tsx:              dateGenerated: new Date().toISOString(),
src/components/credit/DynamicFinancialStatements.tsx:                  `Risk Score: ${riskScore} (${disputeRate.toFixed(2)}% dispute rate)`,
src/components/credit/DynamicFinancialStatements.tsx:                  'Comprehensive payment pattern analysis included',
src/components/credit/DynamicFinancialStatements.tsx:                    ? 'Strong payment processing profile'
src/components/credit/DynamicFinancialStatements.tsx:                  dateGenerated: new Date().toISOString(),
src/components/credit/DynamicFinancialStatements.tsx:                dateGenerated: new Date().toISOString(),
src/components/credit/DynamicFinancialStatements.tsx:                    `Dispute rate: ${disputeRate.toFixed(2)}% (Industry average: 0.84%)`,
src/components/credit/DynamicFinancialStatements.tsx:            // Generate QuickBooks-specific documents
src/components/credit/DynamicFinancialStatements.tsx:                dateGenerated: new Date().toISOString(),
src/components/credit/DynamicFinancialStatements.tsx:                dateGenerated: new Date().toISOString(),
src/components/credit/DynamicFinancialStatements.tsx:            // Generate NetSuite-specific documents
src/components/credit/DynamicFinancialStatements.tsx:              dateGenerated: new Date().toISOString(),
src/components/credit/DynamicFinancialStatements.tsx:            // Generate Xero-specific documents
src/components/credit/DynamicFinancialStatements.tsx:              dateGenerated: new Date().toISOString(),
src/components/credit/DynamicFinancialStatements.tsx:      setGeneratedDocuments(prev => [...prev, ...newDocuments]);
src/components/credit/DynamicFinancialStatements.tsx:        setGeneratedDocuments(prev => prev.filter(doc => doc.accountId !== accountId));
src/components/credit/DynamicFinancialStatements.tsx:                <div className="text-xs text-gray-500 font-medium">Documents Generated:</div>
src/components/credit/DynamicFinancialStatements.tsx:  // Generate financial documents from connected accounts
src/components/credit/DynamicFinancialStatements.tsx:  const generateFinancialDocuments = useCallback(async () => {
src/components/credit/DynamicFinancialStatements.tsx:      const documents: GeneratedDocument[] = [];
src/components/credit/DynamicFinancialStatements.tsx:        // Generate documents based on connection method
src/components/credit/DynamicFinancialStatements.tsx:        const accountDocuments = await generateDocumentsForAccount(account, currentYear);
src/components/credit/DynamicFinancialStatements.tsx:      setGeneratedDocuments(documents);
src/components/credit/DynamicFinancialStatements.tsx:      if (onDocumentsGenerated) {
src/components/credit/DynamicFinancialStatements.tsx:        onDocumentsGenerated(documents);
src/components/credit/DynamicFinancialStatements.tsx:  }, [connectedAccounts, onDocumentsGenerated]);
src/components/credit/DynamicFinancialStatements.tsx:  // Generate specific documents for an account
src/components/credit/DynamicFinancialStatements.tsx:  const generateDocumentsForAccount = useCallback(
src/components/credit/DynamicFinancialStatements.tsx:    async (account: ConnectedAccount, year: number): Promise<GeneratedDocument[]> => {
src/components/credit/DynamicFinancialStatements.tsx:      const documents: GeneratedDocument[] = [];
src/components/credit/DynamicFinancialStatements.tsx:          // Generate bank statements for last 3 months
src/components/credit/DynamicFinancialStatements.tsx:              dateGenerated: new Date().toISOString(),
src/components/credit/DynamicFinancialStatements.tsx:                  'Bank statement generated from verified Plaid connection',
src/components/credit/DynamicFinancialStatements.tsx:                  'All amounts are in USD and reconciled',
src/components/credit/DynamicFinancialStatements.tsx:          // Generate comprehensive Stripe financial and risk reports
src/components/credit/DynamicFinancialStatements.tsx:          const disputeRate = 0.5 + Math.random() * 1.5; // 0.5-2% dispute rate
src/components/credit/DynamicFinancialStatements.tsx:            dateGenerated: new Date().toISOString(),
src/components/credit/DynamicFinancialStatements.tsx:                'Revenue data from Stripe payment processing',
src/components/credit/DynamicFinancialStatements.tsx:                'Data includes all successful payments and refunds',
src/components/credit/DynamicFinancialStatements.tsx:            dateGenerated: new Date().toISOString(),
src/components/credit/DynamicFinancialStatements.tsx:                `Risk Score: ${riskScore} (${disputeRate.toFixed(2)}% dispute rate)`,
src/components/credit/DynamicFinancialStatements.tsx:                'Comprehensive payment pattern analysis included',
src/components/credit/DynamicFinancialStatements.tsx:                  ? 'Strong payment processing profile'
src/components/credit/DynamicFinancialStatements.tsx:                dateGenerated: new Date().toISOString(),
src/components/credit/DynamicFinancialStatements.tsx:              dateGenerated: new Date().toISOString(),
src/components/credit/DynamicFinancialStatements.tsx:                  `Dispute rate: ${disputeRate.toFixed(2)}% (Industry average: 0.84%)`,
src/components/credit/DynamicFinancialStatements.tsx:          // Generate comprehensive financial statements
src/components/credit/DynamicFinancialStatements.tsx:              dateGenerated: new Date().toISOString(),
src/components/credit/DynamicFinancialStatements.tsx:                  `Generated from ${account.institutionName} integration`,
src/components/credit/DynamicFinancialStatements.tsx:    (document: GeneratedDocument) => {
src/components/credit/DynamicFinancialStatements.tsx:    setGeneratedDocuments(prev =>
src/components/credit/DynamicFinancialStatements.tsx:  // Add missing function to generate mock accounts for different providers
src/components/credit/DynamicFinancialStatements.tsx:  const generateMockAccountsForProvider = useCallback(
src/components/credit/DynamicFinancialStatements.tsx:  const renderDocumentStatus = (document: GeneratedDocument) => {
src/components/credit/DynamicFinancialStatements.tsx:    (document: GeneratedDocument) => {
src/components/credit/DynamicFinancialStatements.tsx:            Connect your financial accounts to automatically generate required documents
src/components/credit/DynamicFinancialStatements.tsx:                  📄 Generated Documents
src/components/credit/DynamicFinancialStatements.tsx:                  {generatedDocuments.length > 0 && (
src/components/credit/DynamicFinancialStatements.tsx:                      {generatedDocuments.length}
src/components/credit/DynamicFinancialStatements.tsx:            {generatedDocuments.length === 0 ? (
src/components/credit/DynamicFinancialStatements.tsx:                <h3 className="text-lg font-medium text-gray-900 mb-2">No Documents Generated</h3>
src/components/credit/DynamicFinancialStatements.tsx:                  Connect your financial accounts to automatically generate required documents.
src/components/credit/DynamicFinancialStatements.tsx:                {generatedDocuments.map(doc => (
src/components/credit/DynamicFinancialStatements.tsx:                      <div>Generated: {new Date(doc.dateGenerated).toLocaleDateString()}</div>
src/components/credit/DynamicFinancialStatements.tsx:                    {generatedDocuments.length}
src/components/credit/DynamicFinancialStatements.tsx:                  <div className="text-sm text-blue-800">Generated Documents</div>
src/components/credit/DynamicFinancialStatements.tsx:                      (generatedDocuments.length / Math.max(connectedAccounts.length * 2, 1)) * 100
src/components/credit/DynamicFinancialStatements.tsx:                  onClick={() => generateFinancialDocuments()}
src/components/credit/DynamicFinancialStatements.tsx:                  Regenerate Documents
src/components/credit/DynamicFinancialStatements.tsx:                  disabled={generatedDocuments.length === 0}
src/components/credit/SalesManagerDashboard.tsx:      issue: 'Missing rate disclosure statement',
src/components/credit/SalesManagerDashboard.tsx:      suggestion: 'Include standardized rate disclosure in all initial discussions',
src/components/credit/SafeForms/LenderPaymentInstructions.tsx:        Provide payment instructions for loan disbursements and repayments.
src/components/credit/SafeForms/LenderPaymentInstructions.tsx:        {/* Repayment Account Information */}
src/components/credit/SafeForms/LenderPaymentInstructions.tsx:            Loan Repayment Account
src/components/credit/SafeForms/LenderPaymentInstructions.tsx:            Specify the account to which borrower payments should be directed.
src/components/credit/SafeForms/LenderPaymentInstructions.tsx:                placeholder="Any special payment instructions or requirements"
src/components/credit/SafeForms/LenderPaymentInstructions.tsx:              I certify that the information provided is true and accurate. I am authorized to
src/components/credit/SafeForms/LenderPaymentInstructions.tsx:              provide these payment instructions on behalf of the lender.
src/components/credit/SafeForms/BrokerKYBPayment.tsx:        Complete this form to establish your broker profile and payment preferences.
src/components/credit/SafeForms/BrokerKYBPayment.tsx:              I certify that the information provided is true and accurate. I am authorized to
src/components/credit/SafeForms/BrokerKYBPayment.tsx:              payment terms and obligations.
src/components/credit/SafeForms/VendorPaymentKYB.tsx:        Complete this form to set up vendor payment information and provide Know Your Business (KYB)
src/components/credit/SafeForms/VendorPaymentKYB.tsx:              I certify that the information provided is true and accurate. I am authorized to
src/components/credit/SafeForms/VendorPaymentKYB.tsx:              I agree to the terms and conditions of the vendor payment agreement. I understand that
src/components/credit/SafeForms/VendorPaymentKYB.tsx:              payment processing may take up to 7 business days after invoice approval.
src/components/credit/SafeForms/PersonalFinanceStatement.tsx:              name.includes('amount') ||
src/components/credit/SafeForms/PersonalFinanceStatement.tsx:              name.includes('payment') ||
src/components/credit/SafeForms/PersonalFinanceStatement.tsx:        more interest, or (3) each stockholder owning 20% or more of voting stock, or (4) any person
src/components/credit/SafeForms/PersonalFinanceStatement.tsx:                Are you current on all tax payments?
src/components/credit/SafeForms/BusinessDebtSchedule.tsx:  interestRate: number;
src/components/credit/SafeForms/BusinessDebtSchedule.tsx:      interestRate: 0,
src/components/credit/SafeForms/BusinessDebtSchedule.tsx:      interestRate: 0,
src/components/credit/SafeForms/BusinessDebtSchedule.tsx:                      value={debt.interestRate || ''}
src/components/credit/SafeForms/BusinessDebtSchedule.tsx:                        updateDebtItem(debt.id, 'interestRate', parseFloat(e.target.value) || 0)
src/components/credit/SafeForms/BusinessDebtSchedule.tsx:            accurate, and complete to the best of my knowledge.
src/components/credit/SafeForms/BrokerCommissionSplit.tsx:              I understand that commission payments will only be made after loan closing and
src/components/credit/SafeForms/AdditionalOwnerTrust.tsx:                <option value="corporation">Corporate Trustee</option>
src/components/credit/SafeForms/CreditApplication.tsx:      'Corporate resolutions',
src/components/credit/SafeForms/CreditApplication.tsx:      'Corporate resolutions',
src/components/credit/SafeForms/CreditApplication.tsx:      'Corporate resolutions',
src/components/credit/SafeForms/CreditApplication.tsx:      'Corporate resolutions',
src/components/credit/SafeForms/CreditApplication.tsx:// This is a sample - you will need to populate with accurate state-specific requirements
src/components/credit/SafeForms/CreditApplication.tsx:        'California LLC Franchise Tax payment confirmation',
src/components/credit/SafeForms/CreditApplication.tsx:        'Delaware Corporate Bylaws',
src/components/credit/SafeForms/CreditApplication.tsx:      renewalRequirements: 'Annual franchise tax report and payment',
src/components/credit/SafeForms/CreditApplication.tsx:        'Delaware Annual LLC Tax payment confirmation',
src/components/credit/SafeForms/CreditApplication.tsx:      renewalRequirements: 'Annual LLC tax payment',
src/components/credit/SafeForms/CreditApplication.tsx:  const [amountRequested, setAmountRequested] = useState('');
src/components/credit/SafeForms/CreditApplication.tsx:      setAmountRequested(initialData.amountRequested || '');
src/components/credit/SafeForms/CreditApplication.tsx:      amountRequested,
src/components/credit/SafeForms/CreditApplication.tsx:                I certify that all information provided in this application is true, accurate, and
src/components/credit/SafeForms/FormTemplates.ts:        amountRequested: 250000,
src/components/credit/SafeForms/FormTemplates.ts:        amountRequested: 75000,
src/components/credit/SafeForms/FormTemplates.ts:      name: 'Corporate Parent Template',
src/components/credit/SafeForms/FormTemplates.ts:        businessAddress: '100 Corporate Plaza',
src/components/credit/SafeForms/FormTemplates.ts:        businessDescription: 'Investment holding company with interests in manufacturing and technology sectors'
src/components/credit/SafeForms/FormTemplates.ts:      name: 'Strategic Partner Template',
src/components/credit/SafeForms/FormTemplates.ts:        businessDescription: 'Strategic investment firm focusing on early-stage technology companies'
src/components/credit/SafeForms/FormTemplates.ts:            interestRate: 5.25,
src/components/credit/SafeForms/FormTemplates.ts:            interestRate: 4.75,
src/components/credit/SafeForms/FormTemplates.ts:            interestRate: 7.5,
src/components/credit/SafeForms/AdditionalOwnerBusiness.tsx:              entity and that the information provided is true and accurate to the best of my
src/components/credit/SafeForms/NYCALenderDisclosure.tsx:              I certify that all information provided is true and accurate. I am authorized to
src/components/credit/SafeForms/AssetLedger.tsx:            I certify that the information provided in this asset ledger is true, accurate, and
src/components/credit/BankStatementVerification.tsx:      // Generate mock bank statements for the last 3 months
src/components/credit/BankStatementVerification.tsx:  // Generate options for month selection
src/components/credit/BankStatementVerification.tsx:    // Generate options for the last 24 months
src/components/credit/BankStatementVerification.tsx:  const formatCurrency = (amount: number) => {
src/components/credit/BankStatementVerification.tsx:    }).format(amount);
src/components/credit/LienUCCManagement.tsx:  amount: number;
src/components/credit/LienUCCManagement.tsx:      amount: 250000,
src/components/credit/LienUCCManagement.tsx:      amount: 1500000,
src/components/credit/LienUCCManagement.tsx:      amount: 75000,
src/components/credit/LienUCCManagement.tsx:        // Add new lien with generated ID
src/components/credit/LienUCCManagement.tsx:      amount: 0,
src/components/credit/LienUCCManagement.tsx:                          value={currentLien.amount}
src/components/credit/LienUCCManagement.tsx:                              amount: parseFloat(e.target.value) || 0,
src/components/credit/LienUCCManagement.tsx:                      ${lien.amount.toLocaleString()}
src/components/credit/TransactionView.tsx:      amount: 125000,
src/components/credit/TransactionView.tsx:        rate: 5.75,
src/components/credit/TransactionView.tsx:        payment: 2400,
src/components/credit/TransactionView.tsx:      amount: 250000,
src/components/credit/TransactionView.tsx:        rate: 4.85,
src/components/credit/TransactionView.tsx:        payment: 3200,
src/components/credit/TransactionView.tsx:      amount: 50000,
src/components/credit/TransactionView.tsx:        rate: 7.25,
src/components/credit/TransactionView.tsx:        payment: 2200,
src/components/credit/TransactionView.tsx:              <span className="ml-3 text-xl font-bold">${transaction.amount.toLocaleString()}</span>
src/components/credit/TransactionView.tsx:                    <dd className="mt-1 text-sm text-gray-900">{transaction.loan.rate}%</dd>
src/components/credit/TransactionView.tsx:                    <dd className="mt-1 text-sm text-gray-900">${transaction.loan.payment}</dd>
src/components/credit/BusinessLegalDocuments.tsx:          { value: 'bylaws', label: 'Corporate Bylaws' },
src/components/credit/FinancialStatements.tsx:              Connect your Stripe account to share payment processing history and revenue
src/components/credit/FinancialStatements.tsx:                Connecting your Stripe account will provide us with read-only access to your payment
src/components/credit/CreditUnderwriterDashboard.tsx:  { name: 'Moderate Risk', value: 45 },
src/components/credit/CreditUnderwriterDashboard.tsx:      { id: 'app-1001', borrower: 'Acme Industries LLC', amount: 125000, type: 'Equipment Finance', score: 710, status: 'Under Review', riskCategory: 'Medium' },
src/components/credit/CreditUnderwriterDashboard.tsx:      { id: 'app-1002', borrower: 'Global Manufacturing', amount: 250000, type: 'Commercial Real Estate', score: 760, status: 'Under Review', riskCategory: 'Low' },
src/components/credit/CreditUnderwriterDashboard.tsx:      { id: 'app-1003', borrower: 'Quantum Tech Inc', amount: 75000, type: 'Working Capital', score: 680, status: 'Under Review', riskCategory: 'Medium' },
src/components/credit/CreditUnderwriterDashboard.tsx:      { id: 'app-1004', borrower: 'Sunrise Retail', amount: 50000, type: 'Equipment Finance', score: 620, status: 'Documents Pending', riskCategory: 'High' },
src/components/credit/CreditUnderwriterDashboard.tsx:      { id: 'app-1005', borrower: 'Horizon Logistics Corp', amount: 180000, type: 'Commercial Auto', score: 690, status: 'Under Review', riskCategory: 'Medium' },
src/components/credit/CreditUnderwriterDashboard.tsx:                        <span className="text-sm text-gray-500">${app.amount.toLocaleString()}</span>
src/components/credit/CreditUnderwriterDashboard.tsx:                      <p>Loan Request: ${selectedAppDetails.amount.toLocaleString()}</p>
src/components/credit/EnhancedDashboard.tsx:  { name: 'Application → Documents', rate: 85 },
src/components/credit/EnhancedDashboard.tsx:  { name: 'Documents → Review', rate: 75 },
src/components/credit/EnhancedDashboard.tsx:  { name: 'Review → Approval', rate: 62 },
src/components/credit/EnhancedDashboard.tsx:  { name: 'Approval → Funding', rate: 95 },
src/components/credit/EnhancedDashboard.tsx:  { name: 'Manufacturing', amount: 1250000 },
src/components/credit/EnhancedDashboard.tsx:  { name: 'Technology', amount: 980000 },
src/components/credit/EnhancedDashboard.tsx:  { name: 'Healthcare', amount: 720000 },
src/components/credit/EnhancedDashboard.tsx:  { name: 'Retail', amount: 560000 },
src/components/credit/EnhancedDashboard.tsx:  { name: 'Construction', amount: 890000 },
src/components/credit/EnhancedDashboard.tsx:  { name: 'Moderate Risk', value: 45 },
src/components/credit/EnhancedDashboard.tsx:                  <Bar dataKey="rate" fill="#4F46E5" />
src/components/credit/EnhancedDashboard.tsx:                  <Bar dataKey="amount" fill="#4F46E5" />
src/components/credit/DocumentRequirementsList.tsx:      {/* Document Upload Modal - In a real implementation, this would integrate with FilelockDriveApp */}
src/components/credit/SafeFormsSidebar.tsx:    'lender-payment-instructions': false,
src/components/credit/SafeFormsSidebar.tsx:        'lender-payment-instructions',
src/components/credit/SafeFormsSidebar.tsx:          {visibleForms.includes('lender-payment-instructions') && (
src/components/credit/SafeFormsSidebar.tsx:              className={`p-2 rounded-md ${currentForm === 'lender-payment-instructions' ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'}`}
src/components/credit/SafeFormsSidebar.tsx:              onClick={() => handleFormSelect('lender-payment-instructions')}
src/components/credit/AutoOriginationsDashboard.tsx:  amount: number;
src/components/credit/AutoOriginationsDashboard.tsx:    amount: 125000,
src/components/credit/AutoOriginationsDashboard.tsx:    amount: 250000,
src/components/credit/AutoOriginationsDashboard.tsx:    amount: 75000,
src/components/credit/AutoOriginationsDashboard.tsx:    amount: 50000,
src/components/credit/AutoOriginationsDashboard.tsx:    amount: 180000,
src/components/credit/AutoOriginationsDashboard.tsx:    amount: 320000,
src/components/credit/AutoOriginationsDashboard.tsx:    amount: 95000,
src/components/credit/AutoOriginationsDashboard.tsx:    amount: 135000,
src/components/credit/AutoOriginationsDashboard.tsx:    { name: 'Manufacturing', amount: 450000 },
src/components/credit/AutoOriginationsDashboard.tsx:    { name: 'Healthcare', amount: 320000 },
src/components/credit/AutoOriginationsDashboard.tsx:    { name: 'Agriculture', amount: 230000 },
src/components/credit/AutoOriginationsDashboard.tsx:    { name: 'Food Service', amount: 150000 },
src/components/credit/AutoOriginationsDashboard.tsx:    { name: 'Renewable Energy', amount: 100000 },
src/components/credit/AutoOriginationsDashboard.tsx:    { month: 'Jan', amount: 85000 },
src/components/credit/AutoOriginationsDashboard.tsx:    { month: 'Feb', amount: 92000 },
src/components/credit/AutoOriginationsDashboard.tsx:    { month: 'Mar', amount: 78000 },
src/components/credit/AutoOriginationsDashboard.tsx:    { month: 'Apr', amount: 105000 },
src/components/credit/AutoOriginationsDashboard.tsx:    { month: 'May', amount: 125000 },
src/components/credit/AutoOriginationsDashboard.tsx:    { month: 'Jun', amount: 165000 },
src/components/credit/AutoOriginationsDashboard.tsx:    paymentDate: '2023-08-20',
src/components/credit/AutoOriginationsDashboard.tsx:    paymentDate: '2023-08-25',
src/components/credit/AutoOriginationsDashboard.tsx:    interestRate: 5.75,
src/components/credit/AutoOriginationsDashboard.tsx:    interestRate: 7.25,
src/components/credit/AutoOriginationsDashboard.tsx:              <div className="text-sm font-semibold">${application.amount.toLocaleString()}</div>
src/components/credit/AutoOriginationsDashboard.tsx:              ? `Paid: ${commission.paymentDate}`
src/components/credit/AutoOriginationsDashboard.tsx:          <p className="text-sm font-medium text-gray-700 mb-1">Rate: {loan.interestRate}%</p>
src/components/credit/AutoOriginationsDashboard.tsx:  amountByIndustry: { name: string; amount: number }[];
src/components/credit/AutoOriginationsDashboard.tsx:  conversionRates: { name: string; rate: number }[];
src/components/credit/AutoOriginationsDashboard.tsx:      'Commission payment delays',
src/components/credit/AutoOriginationsDashboard.tsx:      'Find the best rates and terms',
src/components/credit/AutoOriginationsDashboard.tsx:      'Repayment planning',
src/components/credit/AutoOriginationsDashboard.tsx:    permissions: ['view', 'edit', 'sign_documents', 'payment_access', 'document_upload'],
src/components/credit/AutoOriginationsDashboard.tsx:      'payment_tracking',
src/components/credit/AutoOriginationsDashboard.tsx:      // Removed portfolio-related roles - these will be handled separately
src/components/credit/FinancialDocumentParser.tsx:  // Generate mock parsed data based on document type
src/components/credit/FinancialDocumentParser.tsx:    // Generate realistic mock financial data based on document type
src/components/credit/FinancialDocumentParser.tsx:                                    Low confidence score. Some data might be inaccurate. Please
src/components/CreditApplicationBlockchain.tsx:  interestRate?: number;
src/components/CreditApplicationBlockchain.tsx:      // Generate matches based on the user role
src/components/CreditApplicationBlockchain.tsx:        userRole === 'lender' ? generateMockBorrowerMatches() : generateMockLenderMatches();
src/components/CreditApplicationBlockchain.tsx:  const generateMockLenderMatches = (): SmartMatchProfile[] => {
src/components/CreditApplicationBlockchain.tsx:        interestRate: 5.25,
src/components/CreditApplicationBlockchain.tsx:        interestRate: 6.75,
src/components/CreditApplicationBlockchain.tsx:        interestRate: 4.85,
src/components/CreditApplicationBlockchain.tsx:        interestRate: 5.5,
src/components/CreditApplicationBlockchain.tsx:        interestRate: 7.25,
src/components/CreditApplicationBlockchain.tsx:  const generateMockBorrowerMatches = (): SmartMatchProfile[] => {
src/components/CreditApplicationBlockchain.tsx:                                ? `${match.interestRate}% Interest Rate`
src/components/deal/TermSheetGenerator.tsx:  // Generate preview and show the PDF preview modal
src/components/deal/TermSheetGenerator.tsx:  // Generate the term sheet and start the workflow after preview
src/components/deal/TermSheetGenerator.tsx:  const handleGenerateTermSheet = async () => {
src/components/deal/TermSheetGenerator.tsx:          Your term sheet has been generated and sent for signatures.
src/components/deal/TermSheetGenerator.tsx:        onSendForSignature={handleGenerateTermSheet}
src/components/deal/TermSheetGenerator.tsx:                ? 'Generate Term Sheet'
src/components/deal/AmortizationSchedule.tsx:  paymentNumber: number;
src/components/deal/AmortizationSchedule.tsx:  payment: number;
src/components/deal/AmortizationSchedule.tsx:  interest: number;
src/components/deal/AmortizationSchedule.tsx:  const [amount, setAmount] = useState<number>(currentTransaction?.amount || 100000);
src/components/deal/AmortizationSchedule.tsx:  const [rate, setRate] = useState<number>(5.99);
src/components/deal/AmortizationSchedule.tsx:  const [payments, setPayments] = useState<PaymentData[]>([]);
src/components/deal/AmortizationSchedule.tsx:  const [amountFinanced, setAmountFinanced] = useState<number>(0);
src/components/deal/AmortizationSchedule.tsx:  const paymentsPerPage = 12;
src/components/deal/AmortizationSchedule.tsx:    if (currentTransaction?.amount) {
src/components/deal/AmortizationSchedule.tsx:      setAmount(currentTransaction.amount);
src/components/deal/AmortizationSchedule.tsx:      setDownPayment(Math.round(currentTransaction.amount * 0.1)); // Default 10% down
src/components/deal/AmortizationSchedule.tsx:  }, [amount, rate, term, downPayment]);
src/components/deal/AmortizationSchedule.tsx:    const financed = amount - downPayment;
src/components/deal/AmortizationSchedule.tsx:    const monthlyRate = rate / 100 / 12;
src/components/deal/AmortizationSchedule.tsx:    let payment: number;
src/components/deal/AmortizationSchedule.tsx:      // If rate is 0, simple division
src/components/deal/AmortizationSchedule.tsx:      payment = financed / term;
src/components/deal/AmortizationSchedule.tsx:      payment =
src/components/deal/AmortizationSchedule.tsx:    setMonthlyPayment(payment);
src/components/deal/AmortizationSchedule.tsx:      const interestPayment = balance * monthlyRate;
src/components/deal/AmortizationSchedule.tsx:      const principalPayment = payment - interestPayment;
src/components/deal/AmortizationSchedule.tsx:      totalInterestPaid += interestPayment;
src/components/deal/AmortizationSchedule.tsx:      // Handle potential floating point error on the last payment
src/components/deal/AmortizationSchedule.tsx:          paymentNumber: i,
src/components/deal/AmortizationSchedule.tsx:          payment: payment,
src/components/deal/AmortizationSchedule.tsx:          interest: interestPayment,
src/components/deal/AmortizationSchedule.tsx:          paymentNumber: i,
src/components/deal/AmortizationSchedule.tsx:          payment: payment,
src/components/deal/AmortizationSchedule.tsx:          interest: interestPayment,
src/components/deal/AmortizationSchedule.tsx:  // Get payments for the current page
src/components/deal/AmortizationSchedule.tsx:    const startIndex = (currentDisplayPage - 1) * paymentsPerPage;
src/components/deal/AmortizationSchedule.tsx:    return payments.slice(startIndex, startIndex + paymentsPerPage);
src/components/deal/AmortizationSchedule.tsx:  const totalPages = Math.ceil(payments.length / paymentsPerPage);
src/components/deal/AmortizationSchedule.tsx:                  value={amount}
src/components/deal/AmortizationSchedule.tsx:                  value={rate}
src/components/deal/AmortizationSchedule.tsx:                  ({amount > 0 ? ((downPayment / amount) * 100).toFixed(1) : 0}% of total)
src/components/deal/AmortizationSchedule.tsx:                    <span className="text-sm font-medium">{formatCurrency(amountFinanced)}</span>
src/components/deal/AmortizationSchedule.tsx:                    <span className="text-sm font-medium">{formatPercent(rate)}</span>
src/components/deal/AmortizationSchedule.tsx:                      <span className="text-sm font-medium">{formatCurrency(amountFinanced)}</span>
src/components/deal/AmortizationSchedule.tsx:                      {getCurrentPagePayments().map(payment => (
src/components/deal/AmortizationSchedule.tsx:                        <tr key={payment.paymentNumber} className="hover:bg-gray-50">
src/components/deal/AmortizationSchedule.tsx:                            {payment.paymentNumber}
src/components/deal/AmortizationSchedule.tsx:                            {formatCurrency(payment.payment)}
src/components/deal/AmortizationSchedule.tsx:                            {formatCurrency(payment.principal)}
src/components/deal/AmortizationSchedule.tsx:                            {formatCurrency(payment.interest)}
src/components/deal/AmortizationSchedule.tsx:                            {formatCurrency(payment.balance)}
src/components/deal/AmortizationSchedule.tsx:                        style={{ width: `${(amountFinanced / totalPayments) * 100}%` }}
src/components/deal/AmortizationSchedule.tsx:                        Principal: {formatCurrency(amountFinanced)} (
src/components/deal/AmortizationSchedule.tsx:                        {((amountFinanced / totalPayments) * 100).toFixed(1)}%)
src/components/deal/AmortizationSchedule.tsx:            * This is an amortization estimate. Actual payments may vary based on closing date and
src/components/deal/CustomFinancialProfileModal.tsx:              Generate Matches
src/components/deal/DealManagement.tsx:                  ${selectedDeal.amount.toLocaleString()}
src/components/deal/DealManagement.tsx:                        ${deal.amount.toLocaleString()}
src/components/deal/DealManagement.tsx:                    ${selectedDeal.amount.toLocaleString()} • {selectedDeal.borrower.name}
src/components/deal/DealStructuring.tsx:  amount: number;
src/components/deal/DealStructuring.tsx:  const [recentlyGeneratedTermSheet, setRecentlyGeneratedTermSheet] = useState(false);
src/components/deal/DealStructuring.tsx:  const generateDealOptions = useCallback(() => {
src/components/deal/DealStructuring.tsx:      console.error('Cannot generate deal options: No current transaction available');
src/components/deal/DealStructuring.tsx:      // Generate options based on transaction type and amount
src/components/deal/DealStructuring.tsx:      // Adjust for amount (larger amounts get slightly better rates)
src/components/deal/DealStructuring.tsx:      const amountFactor = currentTransaction?.amount
src/components/deal/DealStructuring.tsx:        ? Math.min(Math.max(currentTransaction.amount / 1000000, 0), 1) * 0.5
src/components/deal/DealStructuring.tsx:          rate: Math.round((baseRate - amountFactor + (Math.random() * 0.3 - 0.15)) * 100) / 100,
src/components/deal/DealStructuring.tsx:          payment: calculatePayment(currentTransaction?.amount ?? 0, 60, baseRate - amountFactor),
src/components/deal/DealStructuring.tsx:          downPayment: Math.round((currentTransaction?.amount ?? 0) * 0.1),
src/components/deal/DealStructuring.tsx:          rate:
src/components/deal/DealStructuring.tsx:            Math.round((baseRate - amountFactor + 0.35 + (Math.random() * 0.3 - 0.15)) * 100) / 100,
src/components/deal/DealStructuring.tsx:          payment: calculatePayment(
src/components/deal/DealStructuring.tsx:            currentTransaction?.amount ?? 0,
src/components/deal/DealStructuring.tsx:            baseRate - amountFactor + 0.35
src/components/deal/DealStructuring.tsx:          downPayment: Math.round((currentTransaction?.amount ?? 0) * 0.1),
src/components/deal/DealStructuring.tsx:          rate:
src/components/deal/DealStructuring.tsx:            Math.round((baseRate - amountFactor + 0.5 + (Math.random() * 0.3 - 0.15)) * 100) / 100,
src/components/deal/DealStructuring.tsx:          payment: calculatePayment(
src/components/deal/DealStructuring.tsx:            currentTransaction?.amount ?? 0,
src/components/deal/DealStructuring.tsx:            baseRate - amountFactor + 0.5
src/components/deal/DealStructuring.tsx:          downPayment: Math.round((currentTransaction?.amount ?? 0) * 0.05),
src/components/deal/DealStructuring.tsx:          rate:
src/components/deal/DealStructuring.tsx:            Math.round((baseRate - amountFactor + 0.25 + (Math.random() * 0.3 - 0.15)) * 100) / 100,
src/components/deal/DealStructuring.tsx:          payment: calculatePayment(
src/components/deal/DealStructuring.tsx:            (currentTransaction?.amount ?? 0) * 0.85,
src/components/deal/DealStructuring.tsx:            baseRate - amountFactor + 0.25
src/components/deal/DealStructuring.tsx:          downPayment: Math.round((currentTransaction?.amount ?? 0) * 0.1),
src/components/deal/DealStructuring.tsx:      console.log('Generated deal options:', sortedOptions.length);
src/components/deal/DealStructuring.tsx:      setLoadError('Failed to generate deal options. Please try refreshing the page.');
src/components/deal/DealStructuring.tsx:          generateDealOptions();
src/components/deal/DealStructuring.tsx:  }, [currentTransaction, fetchTransactions, generateDealOptions]);
src/components/deal/DealStructuring.tsx:            amount: 750000,
src/components/deal/DealStructuring.tsx:            amount: 1250000,
src/components/deal/DealStructuring.tsx:            amount: 2500000,
src/components/deal/DealStructuring.tsx:  const handleMatchesGenerated = useCallback((matches: DealStructureMatch[]) => {
src/components/deal/DealStructuring.tsx:    console.log('Smart matches generated:', matches);
src/components/deal/DealStructuring.tsx:        rate: match.rate || 5.5,
src/components/deal/DealStructuring.tsx:        payment: calculatePayment(
src/components/deal/DealStructuring.tsx:          match.rate || 5.5,
src/components/deal/DealStructuring.tsx:  const handleGenerateTermSheet = useCallback(() => {
src/components/deal/DealStructuring.tsx:      loanAmount: currentTransaction.amount ?? 0,
src/components/deal/DealStructuring.tsx:      residualValue: (currentTransaction.amount ?? 0) * (selectedOption.residual / 100),
src/components/deal/DealStructuring.tsx:      rate: selectedOption.rate,
src/components/deal/DealStructuring.tsx:      paymentAmount: selectedOption.payment,
src/components/deal/DealStructuring.tsx:      console.log('Term sheet generated:', document);
src/components/deal/DealStructuring.tsx:      setRecentlyGeneratedTermSheet(true);
src/components/deal/DealStructuring.tsx:        setRecentlyGeneratedTermSheet(false);
src/components/deal/DealStructuring.tsx:              rate: selectedOption.rate,
src/components/deal/DealStructuring.tsx:              payment: selectedOption.payment,
src/components/deal/DealStructuring.tsx:        generateDealOptions();
src/components/deal/DealStructuring.tsx:          {recentlyGeneratedTermSheet && (
src/components/deal/DealStructuring.tsx:              title="Term Sheet Generated"
src/components/deal/DealStructuring.tsx:              message="Your term sheet has been generated successfully. You can view and download it from the document center."
src/components/deal/DealStructuring.tsx:              onClose={() => setRecentlyGeneratedTermSheet(false)}
src/components/deal/DealStructuring.tsx:                      generateDealOptions();
src/components/deal/DealStructuring.tsx:                  primaryText="Generate Term Sheet"
src/components/deal/DealStructuring.tsx:                  primaryAction={handleGenerateTermSheet}
src/components/deal/DealStructuring.tsx:                    onMatchesGenerated={setSmartMatchResults}
src/components/deal/DealStructuring.tsx:                    loanAmount={currentTransaction?.amount}
src/components/deal/PaymentCalculator.tsx:  const [amount, setAmount] = useState<number>(initialAmount);
src/components/deal/PaymentCalculator.tsx:  const [rate, setRate] = useState<number>(5.5);
src/components/deal/PaymentCalculator.tsx:  const [payment, setPayment] = useState<number>(0);
src/components/deal/PaymentCalculator.tsx:    if (currentTransaction?.amount) {
src/components/deal/PaymentCalculator.tsx:      setAmount(currentTransaction.amount);
src/components/deal/PaymentCalculator.tsx:      setDownPayment(Math.round(currentTransaction.amount * 0.1)); // Default 10% down
src/components/deal/PaymentCalculator.tsx:  }, [amount, rate, term, downPayment, residualValue]);
src/components/deal/PaymentCalculator.tsx:    const loanAmount = amount - downPayment;
src/components/deal/PaymentCalculator.tsx:    const residualAmount = amount * (residualValue / 100);
src/components/deal/PaymentCalculator.tsx:    const amountToFinance = loanAmount - residualAmount;
src/components/deal/PaymentCalculator.tsx:    // Monthly interest rate
src/components/deal/PaymentCalculator.tsx:    const monthlyRate = rate / 100 / 12;
src/components/deal/PaymentCalculator.tsx:    // Calculate payment using formula: P = (PV * r) / (1 - (1 + r)^-n)
src/components/deal/PaymentCalculator.tsx:    // Where: P = payment, PV = present value, r = rate per period, n = number of periods
src/components/deal/PaymentCalculator.tsx:      // Simple division if rate is 0
src/components/deal/PaymentCalculator.tsx:      setPayment(amountToFinance / term);
src/components/deal/PaymentCalculator.tsx:      const payment = (amountToFinance * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -term));
src/components/deal/PaymentCalculator.tsx:      setPayment(payment);
src/components/deal/PaymentCalculator.tsx:  const getPaymentBreakdown = (): { principal: number; interest: number }[] => {
src/components/deal/PaymentCalculator.tsx:    const breakdown: { principal: number; interest: number }[] = [];
src/components/deal/PaymentCalculator.tsx:    let remainingBalance = amount - downPayment - amount * (residualValue / 100);
src/components/deal/PaymentCalculator.tsx:    const monthlyRate = rate / 100 / 12;
src/components/deal/PaymentCalculator.tsx:      const interestPayment = remainingBalance * monthlyRate;
src/components/deal/PaymentCalculator.tsx:      const principalPayment = payment - interestPayment;
src/components/deal/PaymentCalculator.tsx:        interest: interestPayment,
src/components/deal/PaymentCalculator.tsx:                  value={amount}
src/components/deal/PaymentCalculator.tsx:                  value={rate}
src/components/deal/PaymentCalculator.tsx:                    setDownPayment(Math.max(0, Math.min(amount, Number(e.target.value))))
src/components/deal/PaymentCalculator.tsx:              <span className="text-lg font-bold text-primary-600">{formatCurrency(payment)}</span>
src/components/deal/PaymentCalculator.tsx:              <span className="font-medium">{formatCurrency(amount - downPayment)}</span>
src/components/deal/PaymentCalculator.tsx:              <span className="font-medium">{formatCurrency(payment * term)}</span>
src/components/deal/PaymentCalculator.tsx:                  payment * term - (amount - downPayment - amount * (residualValue / 100))
src/components/deal/DealAdvisor.tsx:            initialAmount={currentTransaction?.amount || 0}
src/components/deal/RateComparison.tsx:  const [amount, setAmount] = useState<number>(currentTransaction?.amount || 100000);
src/components/deal/RateComparison.tsx:  // Sample rate data for different lenders
src/components/deal/RateComparison.tsx:    if (currentTransaction?.amount) {
src/components/deal/RateComparison.tsx:      setAmount(currentTransaction.amount);
src/components/deal/RateComparison.tsx:      setDownPayment(Math.round(currentTransaction.amount * 0.1)); // Default 10% down
src/components/deal/RateComparison.tsx:    // Find the nearest down payment adjustment
src/components/deal/RateComparison.tsx:    const downPaymentPercent = (downPayment / amount) * 100;
src/components/deal/RateComparison.tsx:    // Calculate effective rate
src/components/deal/RateComparison.tsx:  const calculatePayment = (rate: number): number => {
src/components/deal/RateComparison.tsx:    const amountFinanced = amount - downPayment;
src/components/deal/RateComparison.tsx:    if (amountFinanced <= 0 || term <= 0) {
src/components/deal/RateComparison.tsx:    const monthlyRate = rate / 100 / 12;
src/components/deal/RateComparison.tsx:      return amountFinanced / term;
src/components/deal/RateComparison.tsx:        (amountFinanced * monthlyRate * Math.pow(1 + monthlyRate, term)) /
src/components/deal/RateComparison.tsx:        const rate = getEffectiveRate(lender);
src/components/deal/RateComparison.tsx:        const payment = calculatePayment(rate);
src/components/deal/RateComparison.tsx:        const totalInterest = payment * term - (amount - downPayment);
src/components/deal/RateComparison.tsx:        const totalCost = payment * term + downPayment;
src/components/deal/RateComparison.tsx:          rate,
src/components/deal/RateComparison.tsx:          payment,
src/components/deal/RateComparison.tsx:      .sort((a, b) => a.payment - b.payment); // Sort by payment amount
src/components/deal/RateComparison.tsx:                  value={amount}
src/components/deal/RateComparison.tsx:                  ({amount > 0 ? ((downPayment / amount) * 100).toFixed(1) : 0}% of total)
src/components/deal/RateComparison.tsx:                    Please select at least one lender to compare rates.
src/components/deal/RateComparison.tsx:                      {comparisons.map(({ lender, rate }) => (
src/components/deal/RateComparison.tsx:                              style={{ width: `${Math.min(100, rate * 5)}%` }}
src/components/deal/RateComparison.tsx:                            {formatPercent(rate)}
src/components/deal/RateComparison.tsx:                      {comparisons.map(({ lender, payment }) => (
src/components/deal/RateComparison.tsx:                                width: `${(payment / comparisons[comparisons.length - 1].payment) * 90}%`,
src/components/deal/RateComparison.tsx:                            {formatCurrency(payment)}
src/components/deal/RateComparison.tsx:                        {comparisons.map(({ lender, rate, payment, totalInterest, totalCost }) => (
src/components/deal/RateComparison.tsx:                              {formatPercent(rate)}
src/components/deal/RateComparison.tsx:                              {formatCurrency(payment)}
src/components/deal/PDFPreviewModal.tsx:    // Generate the preview HTML
src/components/deal/PDFPreviewModal.tsx:    generatePreview();
src/components/deal/PDFPreviewModal.tsx:  const generatePreview = () => {
src/components/deal/PDFPreviewModal.tsx:      // In a real implementation, this would call a backend API to generate the PDF preview
src/components/deal/PDFPreviewModal.tsx:                  <p class="font-medium">${termSheetData.rate}%</p>
src/components/deal/PDFPreviewModal.tsx:                  <p class="font-medium">$${termSheetData.paymentAmount.toLocaleString()}</p>
src/components/deal/PDFPreviewModal.tsx:      setPreviewError('Failed to generate preview. Please try again.');
src/components/deal/PDFPreviewModal.tsx:                  onClick={generatePreview}
src/components/deal/DealStructuringComponents.tsx:  rate: number; // as percentage
src/components/deal/DealStructuringComponents.tsx:  payment: number;
src/components/deal/DealStructuringComponents.tsx:  rate?: number;
src/components/deal/DealStructuringComponents.tsx:  amount: number,
src/components/deal/DealStructuringComponents.tsx:  rate: number,
src/components/deal/DealStructuringComponents.tsx:  // Calculate loan amount after down payment and residual
src/components/deal/DealStructuringComponents.tsx:  const residualAmount = amount * (residualPercent / 100);
src/components/deal/DealStructuringComponents.tsx:  const loanAmount = amount - downPayment - residualAmount;
src/components/deal/DealStructuringComponents.tsx:  // Convert annual interest rate to monthly
src/components/deal/DealStructuringComponents.tsx:  const monthlyRate = rate / 100 / 12;
src/components/deal/DealStructuringComponents.tsx:  // Calculate payment using the loan formula
src/components/deal/DealStructuringComponents.tsx:  const payment =
src/components/deal/DealStructuringComponents.tsx:  return Math.round(payment * 100) / 100;
src/components/deal/DealStructuringComponents.tsx:export const formatCurrency = (amount: number): string => {
src/components/deal/DealStructuringComponents.tsx:  }).format(amount);
src/components/deal/DealStructuringComponents.tsx:          <span className="font-medium">{option.rate.toFixed(2)}%</span>
src/components/deal/DealStructuringComponents.tsx:          <span className="font-medium">{formatCurrency(option.payment)}/mo</span>
src/components/deal/DealStructuringComponents.tsx:          <label htmlFor="rate" className="block text-sm font-medium text-gray-700 mb-1">
src/components/deal/DealStructuringComponents.tsx:            id="rate"
src/components/deal/DealStructuringComponents.tsx:            value={customRequest.rate || ''}
src/components/deal/DealStructuringComponents.tsx:            onChange={e => onChange('rate', parseFloat(e.target.value) || 0)}
src/components/deal/DealList.tsx: * DealList component that demonstrates API integration with the deal service
src/components/deal/DealList.tsx:  const totalValue = deals?.reduce((total, deal) => total + deal.amount, 0) || 0;
src/components/deal/DealList.tsx:                          ${deal.amount.toLocaleString()}
src/components/deal/DealList.tsx:                          {deal.term} months {deal.rate && `@ ${deal.rate}%`}
src/components/deal/SmartMatchTool.tsx:  rate: number; // percentage
src/components/deal/SmartMatchTool.tsx:  downPayment: number; // dollar amount
src/components/deal/SmartMatchTool.tsx:  onMatchesGenerated?: (matches: DealStructureMatch[]) => void;
src/components/deal/SmartMatchTool.tsx:  onMatchesGenerated,
src/components/deal/SmartMatchTool.tsx:    { id: 'rate', name: 'Interest Rate', value: 'competitive', weight: 75 },
src/components/deal/SmartMatchTool.tsx:  // Generate match options based on transaction data, financial profile and matching parameters
src/components/deal/SmartMatchTool.tsx:  const generateMatches = useCallback(() => {
src/components/deal/SmartMatchTool.tsx:      const transactionAmount = loanAmount || currentTransaction?.amount || 500000;
src/components/deal/SmartMatchTool.tsx:      // Get base rate based on credit score
src/components/deal/SmartMatchTool.tsx:      // Generate matching options
src/components/deal/SmartMatchTool.tsx:      // Determine maximum down payment based on cash on hand and preferred max
src/components/deal/SmartMatchTool.tsx:      // Function to calculate payment
src/components/deal/SmartMatchTool.tsx:      // Option 1: Optimized for monthly payment affordability
src/components/deal/SmartMatchTool.tsx:        rate: baseRate + 0.25,
src/components/deal/SmartMatchTool.tsx:          'Optimized for lowest monthly payments while keeping down payment reasonable.',
src/components/deal/SmartMatchTool.tsx:      // Calculate payment for affordable option
src/components/deal/SmartMatchTool.tsx:        affordableOption.rate,
src/components/deal/SmartMatchTool.tsx:      // Calculate total interest
src/components/deal/SmartMatchTool.tsx:        rate: baseRate,
src/components/deal/SmartMatchTool.tsx:        recommendationReason: 'Balanced solution with moderate down payment and competitive rate.',
src/components/deal/SmartMatchTool.tsx:      // Calculate payment for balanced option
src/components/deal/SmartMatchTool.tsx:        balancedOption.rate,
src/components/deal/SmartMatchTool.tsx:      // Calculate total interest
src/components/deal/SmartMatchTool.tsx:      // Option 3: Minimal down payment
src/components/deal/SmartMatchTool.tsx:        rate: baseRate + 0.5,
src/components/deal/SmartMatchTool.tsx:          'Minimizes initial cash outlay with slightly higher monthly payments.',
src/components/deal/SmartMatchTool.tsx:      // Calculate payment for minimal down option
src/components/deal/SmartMatchTool.tsx:        minDownOption.rate,
src/components/deal/SmartMatchTool.tsx:      // Calculate total interest
src/components/deal/SmartMatchTool.tsx:        term: 36, // Shorter term minimizes interest
src/components/deal/SmartMatchTool.tsx:        rate: baseRate - 0.25, // Lower rate for shorter term
src/components/deal/SmartMatchTool.tsx:          'Minimizes total financing cost with larger down payment and shorter term.',
src/components/deal/SmartMatchTool.tsx:      // Calculate payment for lowest cost option
src/components/deal/SmartMatchTool.tsx:        lowestCostOption.rate,
src/components/deal/SmartMatchTool.tsx:      // Calculate total interest
src/components/deal/SmartMatchTool.tsx:        // Check if monthly payment is within budget
src/components/deal/SmartMatchTool.tsx:          const paymentRatio = match.monthlyPayment / financialProfile.monthlyBudget;
src/components/deal/SmartMatchTool.tsx:          if (paymentRatio <= 0.8) score += 10;
src/components/deal/SmartMatchTool.tsx:          else if (paymentRatio <= 1.0) score += 5;
src/components/deal/SmartMatchTool.tsx:          else if (paymentRatio <= 1.2) score -= 5;
src/components/deal/SmartMatchTool.tsx:        // Check if down payment is reasonable
src/components/deal/SmartMatchTool.tsx:      if (onMatchesGenerated) {
src/components/deal/SmartMatchTool.tsx:        onMatchesGenerated(matchOptions);
src/components/deal/SmartMatchTool.tsx:    onMatchesGenerated,
src/components/deal/SmartMatchTool.tsx:  const formatCurrency = (amount: number) => {
src/components/deal/SmartMatchTool.tsx:    }).format(amount);
src/components/deal/SmartMatchTool.tsx:        amount: loanAmount || currentTransaction?.amount || 0,
src/components/deal/SmartMatchTool.tsx:        rate: match.rate,
src/components/deal/SmartMatchTool.tsx:          requestedAmount: loanAmount || currentTransaction?.amount || 0,
src/components/deal/SmartMatchTool.tsx:      generateMatches();
src/components/deal/SmartMatchTool.tsx:  }, [loanAmount, generateMatches]);
src/components/deal/SmartMatchTool.tsx:            Adjust your financial profile and matching parameters to generate matches.
src/components/deal/SmartMatchTool.tsx:                // Determine color based on match rate
src/components/deal/SmartMatchTool.tsx:                      <option>High (Lowest rate priority)</option>
src/components/deal/SmartMatchTool.tsx:                      <option>Low (Flexible on rate)</option>
src/components/deal/SmartMatchTool.tsx:                  onClick={generateMatches}
src/components/deal/SmartMatchTool.tsx:                  Generate Matches
src/components/CreditApplicationForm.tsx:  dateGenerated: string;
src/components/CreditApplicationForm.tsx:  'Corporate Bonds',
src/components/CreditApplicationForm.tsx:  const [zipCodeConfirm, setZipCodeConfirm] = useState(''); // For separate zip code confirmation
src/components/CreditApplicationForm.tsx:      newErrors.requestedAmount = 'Please enter a valid amount';
src/components/CreditApplicationForm.tsx:      newErrors.requestedAmount = 'Maximum amount is $3 billion';
src/components/CreditApplicationForm.tsx:      newErrors.annualRevenue = 'Please enter a valid amount';
src/components/CreditApplicationForm.tsx:      newErrors.grossRevenue2024 = 'Please enter a valid amount';
src/components/CreditApplicationForm.tsx:      newErrors.grossRevenue2025 = 'Please enter a valid amount';
src/components/CreditApplicationForm.tsx:      newErrors.monthlyExpenses = 'Please enter a valid amount';
src/components/CreditApplicationForm.tsx:      newErrors.outstandingDebt = 'Please enter a valid amount';
src/components/CreditApplicationForm.tsx:      newErrors.cashBalance = 'Please enter a valid amount';
src/components/CreditApplicationForm.tsx:        amount: parseFloat(formData.requestedAmount) || 100000,
src/components/CreditApplicationForm.tsx:      // In a real implementation, this would call your backend to generate a link token
src/components/CreditApplicationForm.tsx:      // Generate mock statements based on current date
src/components/CreditApplicationForm.tsx:          dateGenerated: new Date().toISOString(),
src/components/CreditApplicationForm.tsx:          dateGenerated: new Date().toISOString(),
src/components/CreditApplicationForm.tsx:        // Generate mock statements for demo
src/components/CreditApplicationForm.tsx:                Please provide information about all owners with 20% or greater ownership interest
src/components/broker/DealPipeline.tsx:                    <div className="text-xs text-gray-500">{deal.commissionRate}% rate</div>
src/components/asset/AssetInventoryManager.tsx:  interest: number;
src/components/asset/AssetInventoryManager.tsx:    interest: 0,
src/components/asset/AssetInventoryManager.tsx:      interest: newAsset.interest || 0,
src/components/asset/AssetInventoryManager.tsx:      interest: 0,
src/components/asset/AssetInventoryManager.tsx:                    {asset.interest} {asset.interest === 1 ? 'inquiry' : 'inquiries'}
src/components/CreditRiskAnalysis.tsx:          'Implement more frequent payment schedule',
src/components/CreditRiskAnalysis.tsx:          'Adjust interest rate to compensate for risk profile',
src/components/CreditRiskAnalysis.tsx:                      Based on 24 months of financial history, this applicant has demonstrated:
src/components/CreditRiskAnalysis.tsx:                          No payment defaults on existing obligations
src/components/CreditRiskAnalysis.tsx:            Analysis generated by EVA AI on {new Date().toLocaleDateString()}
src/components/security/KYCVerificationFlow.tsx:        // 90% success rate for demo
src/components/security/KYCVerificationFlow.tsx:      // 90% success rate for demo
src/components/security/KYCVerificationFlow.tsx:                  By proceeding, you confirm that the information provided is accurate and belongs
src/components/AIChatAdvisor.tsx:  'What are typical rates for this transaction type?',
src/components/AIChatAdvisor.tsx:  'Help me orchestrate data for this transaction',
src/components/AIChatAdvisor.tsx:  amount: number;
src/components/AIChatAdvisor.tsx:        'Seamlessly sync with your accounting software to import financial data, invoices, and payment history.',
src/components/AIChatAdvisor.tsx:    payment_connect: {
src/components/AIChatAdvisor.tsx:      id: 'payment_connect',
src/components/AIChatAdvisor.tsx:        'Import transaction history, revenue data, and customer information from your payment processors.',
src/components/AIChatAdvisor.tsx:    payment_connect: {
src/components/AIChatAdvisor.tsx:      description: 'Connect to your payment processor account',
src/components/AIChatAdvisor.tsx:    { id: 'tx_101', description: 'Equipment Financing - TX-123', amount: 350000 },
src/components/AIChatAdvisor.tsx:    { id: 'tx_102', description: 'Working Capital - TX-456', amount: 125000 },
src/components/AIChatAdvisor.tsx:    { id: 'tx_103', description: 'Real Estate Loan - TX-789', amount: 950000 },
src/components/AIChatAdvisor.tsx:    { id: 'tx_104', description: 'Software Upgrade - TX-012', amount: 75000 },
src/components/AIChatAdvisor.tsx:    } else if (methodId === 'payment_connect') {
src/components/AIChatAdvisor.tsx:      // Open Stripe modal for payment processor connection
src/components/AIChatAdvisor.tsx:      payment_connect: {
src/components/AIChatAdvisor.tsx:        ...prev.payment_connect,
src/components/AIChatAdvisor.tsx:${collectionMethods.payment_connect.isConnected ? '- Payment processing data\n' : ''}${collectionMethods.accounting_connect.isConnected ? '- Accounting system records\n' : ''}${collectionMethods.erp_connect.isConnected ? '- ERP system data\n' : ''}${collectionMethods.credit_bureau.isConnected ? '- Credit bureau information\n' : ''}
src/components/AIChatAdvisor.tsx:Would you like to view a summary of the orchestrated data or proceed with analysis?`,
src/components/AIChatAdvisor.tsx:      (messageText.includes('data orchestration') || messageText.includes('orchestrate data')) &&
src/components/AIChatAdvisor.tsx:  // Generate AI responses based on input and model
src/components/AIChatAdvisor.tsx:        'I can analyze credit profiles once uploaded to the system. We typically look at personal credit scores above 680 for the best rates, but can work with scores as low as 600 with additional documentation.'
src/components/AIChatAdvisor.tsx:    } else if (input.includes('rate')) {
src/components/AIChatAdvisor.tsx:        'Current rates for equipment loans range from 5.99% to 9.99% depending on credit profile, time in business, and equipment type. For this specific transaction type, most approved applications are seeing rates around 7.25%.'
src/components/AIChatAdvisor.tsx:        "Based on this transaction profile, I'd recommend a 60-month term with a 10% down payment. This optimizes monthly cash flow while maintaining an approval-friendly structure. Would you like me to prepare this deal structure for submission?"
src/components/AIChatAdvisor.tsx:                          {tx.description} ({tx.amount.toLocaleString()})
src/components/DocumentVerificationSystem.tsx:    { id: 'corporate_bylaws', name: 'Corporate Bylaws', type: 'ownership' },
src/components/DocumentVerificationSystem.tsx:      // Generate mock results for third-party checks
src/components/DocumentVerificationSystem.tsx:              By signing below, I certify that all information provided is accurate and authorize
src/components/layout/GlobalHeader.tsx:  amount: number;
src/components/layout/GlobalHeader.tsx:          amount: 750000,
src/components/layout/GlobalHeader.tsx:          amount: 1250000,
src/components/layout/GlobalHeader.tsx:          amount: 2500000,
src/components/layout/GlobalHeader.tsx:          amount: 500000,
src/components/layout/GlobalHeader.tsx:          amount: 3200000,
src/components/layout/GlobalHeader.tsx:        amount: transaction.amount,
src/components/layout/GlobalHeader.tsx:  const formatCurrency = (amount: number) => {
src/components/layout/GlobalHeader.tsx:    }).format(amount);
src/components/layout/GlobalHeader.tsx:                  {currentTransaction.type} • {formatCurrency(currentTransaction.amount || 0)}
src/components/layout/GlobalHeader.tsx:                              {formatCurrency(transaction.amount)}
src/components/layout/CreditApplicationNav.tsx:      id: 'lender-payment-instructions',
src/components/layout/CreditApplicationNav.tsx:      path: '/credit-application/lender-payment',
src/components/layout/Sidebar.tsx:    description: 'Customer retention strategies and tools',
src/components/layout/UniversalNavigation.tsx:  const generateBreadcrumbs = () => {
src/components/layout/UniversalNavigation.tsx:  const breadcrumbs = generateBreadcrumbs();
src/components/layout/UniversalNavigation.tsx:                          {t.type}: {t.description} - Amount: {t.amount}
src/components/layout/TopNavbar.tsx:        return UserType.LENDER; // Example: Core staff operate under LENDER type permissions
src/components/BlockchainTransactionViewer.tsx:    amount: number;
src/components/BlockchainTransactionViewer.tsx:          amount: 750000,
src/components/BlockchainTransactionViewer.tsx:                      <p className="text-sm">${transaction.data.amount.toLocaleString()}</p>
src/components/CreditApplicationSidebar.tsx:      id: 'lender-payment-instructions',
src/components/CreditApplicationSidebar.tsx:      path: `${basePathWithId}/lender-payment-instructions`,
src/components/BiometricKYC.tsx:      // 90% success rate for demo
src/components/BiometricKYC.tsx:      // 90% success rate for demo
src/components/document/DocumentPreview.tsx:    // In a real app, this would generate a preview URL
src/components/document/DocumentViewer.tsx:          // Generate mock blockchain data
src/components/document/DocumentViewer.tsx:  const generateSummary = useCallback(
src/components/document/DocumentViewer.tsx:          }. Total tax amount: ${result.extractedData.totalTax || 'Not specified'}.`;
src/components/document/DocumentViewer.tsx:  const generateSuggestedPrompts = useCallback(
src/components/document/DocumentViewer.tsx:      console.log('Generated prompts (not setting state):', prompts);
src/components/document/DocumentViewer.tsx:        // Generate an executive summary
src/components/document/DocumentViewer.tsx:        const summary = generateSummary(result, file);
src/components/document/DocumentViewer.tsx:        // Generate suggested prompts based on document content
src/components/document/DocumentViewer.tsx:        generateSuggestedPrompts(result, file);
src/components/document/DocumentViewer.tsx:        setDocumentSummary('Unable to generate summary for this document.');
src/components/document/DocumentViewer.tsx:    generateSummary,
src/components/document/DocumentViewer.tsx:    generateSuggestedPrompts,
src/components/document/SignatureWorkflow.tsx:                  2. INTEREST RATE. The loan shall bear interest at the rate of [Rate]% per annum.
src/components/document/SignatureWorkflow.tsx:                  interest, on or before [Date].
src/components/document/SignatureWorkflow.tsx:                  4. LATE PAYMENT. If any payment is not made within [Days] days of the due date,
src/components/document/SignatureWorkflow.tsx:                  5. DEFAULT. If Borrower fails to make any payment when due, Lender may declare the
src/components/document/SignatureWorkflow.tsx:                  entire unpaid principal balance, together with accrued interest, immediately due
src/components/document/FilelockBlockchainService.tsx:    // Generate mock transaction ID
src/components/document/CloudStorageConnector.tsx:        mockFiles = generateMockGoogleDriveFiles(folderId);
src/components/document/CloudStorageConnector.tsx:        mockFiles = generateMockOneDriveFiles(folderId);
src/components/document/CloudStorageConnector.tsx:        mockFiles = generateMockICloudFiles(folderId);
src/components/document/CloudStorageConnector.tsx:  // Helper function to generate mock Google Drive files
src/components/document/CloudStorageConnector.tsx:  const generateMockGoogleDriveFiles = (folderId: string | null): CloudFile[] => {
src/components/document/CloudStorageConnector.tsx:  // Helper function to generate mock OneDrive files
src/components/document/CloudStorageConnector.tsx:  const generateMockOneDriveFiles = (folderId: string | null): CloudFile[] => {
src/components/document/CloudStorageConnector.tsx:  // Helper function to generate mock iCloud files
src/components/document/CloudStorageConnector.tsx:  const generateMockICloudFiles = (folderId: string | null): CloudFile[] => {
src/components/document/ShieldDocumentEscrowVault.tsx:            complianceNotes: 'Required for vendor payment verification and warranty claims.',
src/components/document/FilelockDriveIntegrated.tsx:const FilelockDriveIntegrated: React.FC = () => {
src/components/document/FilelockDriveIntegrated.tsx:export default FilelockDriveIntegrated;
src/components/document/CovenantManager.tsx:            Select templates based on transaction type, amount, and structure to automatically add
src/components/document/CovenantManager.tsx:            Select templates based on transaction type, amount, and structure to automatically add
src/components/document/DocumentComparisonViewer.tsx:              <li>Section 3.4: Additional payment terms</li>
src/components/document/WrittenPasswordVerification.tsx:  // Demo verification password - would be generated and stored securely in a real app
src/components/document/WrittenPasswordVerification.tsx:      generateNewPassword();
src/components/document/WrittenPasswordVerification.tsx:  // Generate a random password for demo purposes
src/components/document/WrittenPasswordVerification.tsx:  const generateNewPassword = () => {
src/components/document/WrittenPasswordVerification.tsx:    const generatedPassword = `EVA-PM-${selectedManager.id.toUpperCase()}-${randomChars}`;
src/components/document/WrittenPasswordVerification.tsx:    setDemoPassword(generatedPassword);
src/components/document/WrittenPasswordVerification.tsx:    console.log('Demo password generated (for testing only):', generatedPassword);
src/components/document/WrittenPasswordVerification.tsx:                    ${currentTransaction.amount?.toLocaleString() || '0'}
src/components/document/WrittenPasswordVerification.tsx:        {/* For DEMO purposes only - display generated password if one exists */}
src/components/document/FilelockDriveApp.tsx:                    <h3 className="text-lg font-medium text-gray-900">Share & Collaborate</h3>
src/components/document/ShieldVaultCore.tsx:          complianceNotes: 'Required for vendor payment verification and warranty claims.',
src/components/document/FileChatPanel.tsx:        } else if (inputValue.toLowerCase().includes('amount') || inputValue.toLowerCase().includes('loan') || inputValue.toLowerCase().includes('money')) {
src/components/document/FileChatPanel.tsx:            `The document mentions a financial amount of ${extractedData.loanAmount || extractedData.totalRevenue}.` : 
src/components/document/FileChatPanel.tsx:            'I couldn\'t find specific financial amounts in this document.';
src/components/document/FileChatPanel.tsx:          aiResponse = `I can help you understand "${file.name}". What specific aspects of this document are you interested in?`;
src/components/document/TransactionExecution.tsx:  amount: number;
src/components/document/TransactionExecution.tsx:            amount: 1000000,
src/components/document/TransactionExecution.tsx:            amount: 950000,
src/components/document/TransactionExecution.tsx:            amount: 25000,
src/components/document/TransactionExecution.tsx:            amount: 15000,
src/components/document/TransactionExecution.tsx:            amount: 10000,
src/components/document/TransactionExecution.tsx:    // Generate document ID and create timestamp
src/components/document/TransactionExecution.tsx:                              <label className="block text-xs font-medium text-gray-700">Options (comma-separated)</label>
src/components/document/TransactionExecution.tsx:              Generate, sign, and securely store transaction documents on blockchain
src/components/document/TransactionExecution.tsx:                      closing contracts, which are generated as smart contracts once all conditions
src/components/document/TransactionExecution.tsx:                            ${party.amount.toLocaleString()}
src/components/document/TransactionExecution.tsx:                  Smart contracts automatically enforce covenant compliance and payment schedules.
src/components/document/TransactionExecution.tsx:                      Enforces monthly payment schedule for the entire duration of the loan term.
src/components/CreditAnalysisChatInterface.tsx:Ask me for details, mitigation strategies, or portfolio comparisons.`;
src/components/CreditAnalysisChatInterface.tsx:      // In a real application, you'd call an API endpoint to generate and download a PDF report
src/components/OwnerComponent.tsx:    if (!dateString) return true; // If no date, don't block (we'll validate required separately)
src/components/SmartMatching.tsx: * 3. As a broker, I want to match my clients with appropriate lenders so that I can increase my deal success rate.
src/components/SmartMatching.tsx: * 4. Requirements Input: Enters financing needs, amount, timeline, business details
src/components/SmartMatching.tsx: * 9. Initial Contact: Receives notification when matched lender also expresses interest
src/components/SmartMatching.tsx:  amount?: number;
src/components/SmartMatching.tsx:  rate?: number;
src/components/SmartMatching.tsx:      description: 'Specializing in equipment financing with competitive rates',
src/components/SmartMatching.tsx:      rate: 5.75,
src/components/SmartMatching.tsx:      name: 'Accelerated Funding Solutions',
src/components/SmartMatching.tsx:      rate: 6.25,
src/components/SmartMatching.tsx:        email: 'funding@acceleratedfunding.com',
src/components/SmartMatching.tsx:      amount: 450000,
src/components/SmartMatching.tsx:      rate: 5.25,
src/components/SmartMatching.tsx:      amount: 1250000,
src/components/SmartMatching.tsx:      amount: 320000,
src/components/SmartMatching.tsx:      rate: 6.0,
src/components/SmartMatching.tsx:          {profile.amount && (
src/components/SmartMatching.tsx:              <span className="text-sm font-medium">${profile.amount.toLocaleString()}</span>
src/components/SmartMatching.tsx:          {profile.rate && (
src/components/SmartMatching.tsx:              <span className="text-sm font-medium">{profile.rate}%</span>
src/components/SmartMatching.tsx:        amount: match.amount,
src/components/SmartMatching.tsx:        autoGenerateFullReport: true,
src/components/SmartMatching.tsx:        amount: currentProfile.amount || 340000, // Fallback to example amount
src/components/SmartMatching.tsx:        rate: currentProfile.rate || 5.75,
src/components/SmartMatching.tsx:                        ${profiles[currentIndex].amount?.toLocaleString() || '340,000'}
src/components/SmartMatching.tsx:                      <div className="font-medium">{profiles[currentIndex].rate || 5.75}%</div>
src/components/SmartMatching.tsx:                {matchedProfile.name} is also interested in connecting with you!
src/components/dashboard/VendorDashboard.tsx:    amount: 125000, 
src/components/dashboard/VendorDashboard.tsx:    amount: 280000, 
src/components/dashboard/VendorDashboard.tsx:    amount: 350000, 
src/components/dashboard/VendorDashboard.tsx:  const formatCurrency = (amount: number) => {
src/components/dashboard/VendorDashboard.tsx:    }).format(amount);
src/components/dashboard/VendorDashboard.tsx:                <div className="text-sm text-gray-500 mt-1">{deal.equipmentType} - {formatCurrency(deal.amount)}</div>
src/components/dashboard/BrokerDashboard.tsx:    amount: 350000,
src/components/dashboard/BrokerDashboard.tsx:    amount: 125000,
src/components/dashboard/BrokerDashboard.tsx:    amount: 950000,
src/components/dashboard/BrokerDashboard.tsx:    { deal: 'Tech Solutions Equipment Loan', amount: 3250 },
src/components/dashboard/BrokerDashboard.tsx:    { deal: 'Lakeside Realty Building Purchase', amount: 9600 },
src/components/dashboard/BrokerDashboard.tsx:  const formatCurrency = (amount: number) => {
src/components/dashboard/BrokerDashboard.tsx:    }).format(amount);
src/components/dashboard/BrokerDashboard.tsx:                    <div>{formatCurrency(deal.amount)}</div>
src/components/dashboard/BrokerDashboard.tsx:                {mockCommissions.recentPayments.map((payment, index) => (
src/components/dashboard/BrokerDashboard.tsx:                    <span>{payment.deal}</span>
src/components/dashboard/BrokerDashboard.tsx:                    <span className="font-semibold">{formatCurrency(payment.amount)}</span>
src/components/dashboard/LenderDashboard.tsx:    amount: 350000,
src/components/dashboard/LenderDashboard.tsx:    amount: 125000,
src/components/dashboard/LenderDashboard.tsx:    amount: 950000,
src/components/dashboard/LenderDashboard.tsx:    { deal: 'Tech Solutions Equipment Loan', amount: 3250 },
src/components/dashboard/LenderDashboard.tsx:    { deal: 'Lakeside Realty Building Purchase', amount: 9600 },
src/components/dashboard/LenderDashboard.tsx:  const formatCurrency = (amount: number) => {
src/components/dashboard/LenderDashboard.tsx:    }).format(amount);
src/components/dashboard/LenderDashboard.tsx:                  <div>{formatCurrency(deal.amount)}</div>
src/components/dashboard/LenderDashboard.tsx:              {mockCommissions.recentPayments.map((payment, index) => (
src/components/dashboard/LenderDashboard.tsx:                  <span>{payment.deal}</span>
src/components/dashboard/LenderDashboard.tsx:                  <span className="font-semibold">{formatCurrency(payment.amount)}</span>
src/components/dashboard/DealsTable.tsx:  amount: number;
src/components/dashboard/DealsTable.tsx:  const formatCurrency = (amount: number): string => {
src/components/dashboard/DealsTable.tsx:    }).format(amount);
src/components/dashboard/DealsTable.tsx:                  <div className="text-sm text-gray-900">{formatCurrency(transaction.amount)}</div>
src/components/dashboard/DashboardLayout.tsx:  amount?: number;
src/components/dashboard/DashboardLayout.tsx:    amount: 250000,
src/components/dashboard/DashboardLayout.tsx:    amount: 100000,
src/components/dashboard/DashboardLayout.tsx:    amount: 750000,
src/components/dashboard/DashboardLayout.tsx:    amount: 50000,
src/components/dashboard/DashboardLayout.tsx:    amount: 300000,
src/components/dashboard/DashboardLayout.tsx:    ? `${selectedTransaction.applicantName || 'N/A'} - $${selectedTransaction.amount?.toLocaleString() || '0'}`
src/components/dashboard/BorrowerDashboard.tsx:    amount: 150000,
src/components/dashboard/BorrowerDashboard.tsx:    amount: 75000,
src/components/dashboard/BorrowerDashboard.tsx:  const formatCurrency = (amount: number) => {
src/components/dashboard/BorrowerDashboard.tsx:    }).format(amount);
src/components/dashboard/BorrowerDashboard.tsx:                  <div className="text-sm font-medium">{formatCurrency(app.amount)}</div>
src/components/testing/TestDiagnostics.tsx:              ${currentTransaction?.amount?.toLocaleString()}
src/components/testing/TestDiagnostics.tsx:                <div className="text-sm text-gray-900">${transaction?.amount?.toLocaleString()}</div>
src/components/blockchain/BlockchainWidget.tsx:    { id: 3, name: 'Corporate Bonds', symbol: 'CB', price: 102.25, change: +1.15 },
src/components/blockchain/BlockchainWidget.tsx:      { id: 3, name: 'Corporate Bonds', symbol: 'CB', balance: 1000, value: 102250.0 },
src/components/blockchain/BlockchainWidget.tsx:      amount: 10000,
src/components/blockchain/BlockchainWidget.tsx:      amount: 5000,
src/components/blockchain/BlockchainWidget.tsx:      instrument: 'Corporate Bonds',
src/components/blockchain/BlockchainWidget.tsx:      amount: 200,
src/components/blockchain/BlockchainWidget.tsx:                      {tx.type === 'buy' ? 'Bought' : 'Sold'} {tx.amount} {tx.symbol}
src/components/blockchain/BlockchainWidget.tsx:                    {formatCurrency((tx.price * tx.amount) / 100)}
src/components/blockchain/BlockchainWidget.tsx:    const handleTransferFunds = useCallback(async (amount: number, to: string) => {
src/components/blockchain/BlockchainWidget.tsx:        await BlockchainService.transferFunds(amount, to);
src/components/blockchain/BlockchainWidget.tsx:                      placeholder="Enter amount"
src/components/blockchain/BlockchainWidget.tsx:                              {tx.type === 'buy' ? 'Bought' : 'Sold'} {tx.amount} {tx.symbol}
src/components/blockchain/BlockchainWidget.tsx:                            {formatCurrency((tx.price * tx.amount) / 100)}
src/components/blockchain/AssetPressFeature.tsx:  amount: number;
src/components/blockchain/AssetPressFeature.tsx:    amount: 0,
src/components/blockchain/AssetPressFeature.tsx:      [name]: name === 'amount' ? parseFloat(value) || 0 : value,
src/components/blockchain/AssetPressFeature.tsx:        amount: 0,
src/components/blockchain/AssetPressFeature.tsx:              name="amount"
src/components/blockchain/AssetPressFeature.tsx:              value={assetData.amount || ''}
src/components/blockchain/AssetClassification.tsx:  | 'corporate_bonds'
src/components/blockchain/AssetClassification.tsx:    appreciationPotential: 'Generally stable; interest-bearing accounts may generate income',
src/components/blockchain/AssetClassification.tsx:    appreciationPotential: 'May appreciate if interest rates decline',
src/components/blockchain/AssetClassification.tsx:    id: 'corporate_bonds',
src/components/blockchain/AssetClassification.tsx:    name: 'Corporate Bonds',
src/components/blockchain/AssetClassification.tsx:    appreciationPotential: 'Potential if credit rating improves or interest rates fall',
src/components/blockchain/AssetClassification.tsx:      'REITs: Corporate level; Property: 27.5 years residential, 39 years commercial',
src/components/blockchain/EnhancedAssetDetails.tsx:  amount: number;
src/components/blockchain/EnhancedAssetDetails.tsx:    amount: 0,
src/components/blockchain/EnhancedAssetDetails.tsx:    if (!asset || !newLienHolder.name || !newLienHolder.amount) return;
src/components/blockchain/EnhancedAssetDetails.tsx:      amount: newLienHolder.amount,
src/components/blockchain/EnhancedAssetDetails.tsx:      amount: 0,
src/components/blockchain/EnhancedAssetDetails.tsx:                        {formatCurrency(lien.amount)}
src/components/blockchain/EnhancedAssetDetails.tsx:                  <label htmlFor="lien-amount" className="block text-sm font-medium text-gray-700">
src/components/blockchain/EnhancedAssetDetails.tsx:                      id="lien-amount"
src/components/blockchain/EnhancedAssetDetails.tsx:                      value={newLienHolder.amount || ''}
src/components/blockchain/EnhancedAssetDetails.tsx:                        setNewLienHolder({ ...newLienHolder, amount: parseFloat(e.target.value) })
src/components/blockchain/EnhancedAssetDetails.tsx:                  disabled={!newLienHolder.name || !newLienHolder.amount}
src/components/blockchain/PyPortfolioWallet.tsx:    // Generate mock wallet address
src/components/blockchain/PortfolioNavigator.tsx:  onTransferFunds?: (amount: number, to: string) => Promise<void>;
src/components/blockchain/PortfolioNavigator.tsx:    // Generate mock wallet address
src/components/blockchain/MyPortfolioTypes.ts:  amount: number;
src/components/blockchain/PortfolioWallet.tsx:  interestRate: number;
src/components/blockchain/PortfolioWallet.tsx:  type: 'acquisition' | 'disposal' | 'issuance' | 'payment' | 'transfer' | 'other';
src/components/blockchain/PortfolioWallet.tsx:  amount: number;
src/components/blockchain/PortfolioWallet.tsx:    Array<{ id: string; name: string; amount: string; value: string }>
src/components/blockchain/PortfolioWallet.tsx:        { id: 'asset-1', name: 'Commercial Paper A', amount: '50,000', value: '50,000.00' },
src/components/blockchain/PortfolioWallet.tsx:        { id: 'asset-2', name: 'Equipment Loan B', amount: '75,000', value: '75,000.00' },
src/components/blockchain/PortfolioWallet.tsx:                      <div className="text-sm text-gray-500">Amount: {asset.amount}</div>
src/components/blockchain/MyPortfolioWallet.tsx:  amount: number;
src/components/blockchain/MyPortfolioWallet.tsx:  onTransferFunds: (amount: number, to: string) => Promise<any>;
src/components/blockchain/AssetPress.tsx:  amount: number;
src/components/blockchain/AssetPress.tsx:              Get intelligent insights on risk mitigation strategies
src/components/blockchain/AssetPress.tsx:                      Asset diversification strategy validated
src/components/CreditApplication.tsx:interface GeneratedDocument {
src/components/CreditApplication.tsx:  const [generatedDocuments, setGeneratedDocuments] = useState<GeneratedDocument[]>([]);
src/components/CreditApplication.tsx:  }, [connectedAccounts, generatedDocuments, documentRequirements]);
src/components/CreditApplication.tsx:      financial: generatedDocuments.filter(d => d.status === 'ready').length > 0,
src/components/CreditApplication.tsx:  const handleDocumentsGenerated = (documents: GeneratedDocument[]) => {
src/components/CreditApplication.tsx:    setGeneratedDocuments(documents);
src/components/CreditApplication.tsx:    console.log('Generated documents:', documents);
src/components/CreditApplication.tsx:          ? `Connected to ${connectedAccounts.length} account(s). ${generatedDocuments.length} documents generated.`
src/components/CreditApplication.tsx:          : 'Connect your financial accounts to automatically generate statements and reports.';
src/components/CreditApplication.tsx:      {(connectedAccounts.length > 0 || generatedDocuments.length > 0) && (
src/components/CreditApplication.tsx:            {generatedDocuments.length > 0 &&
src/components/CreditApplication.tsx:              ` • ${generatedDocuments.filter(d => d.status === 'ready').length} documents ready`}
src/components/CreditApplication.tsx:                onDocumentsGenerated={handleDocumentsGenerated}
src/components/CreditApplication.tsx:                {generatedDocuments.length > 0 && (
src/components/CreditApplication.tsx:                      💡 Your financial statements have been automatically generated from connected
src/components/CreditApplication.tsx:                  {generatedDocuments.length > 0 && (
src/components/CreditApplication.tsx:                      {generatedDocuments.filter(d => d.status === 'ready').length} documents ready
src/components/CreditApplication.tsx:        {generatedDocuments.length > 0 && (
src/components/CreditApplication.tsx:              {generatedDocuments
src/components/transactions/EnhancedTransactionDashboard.tsx:                      <DollarSign className="w-4 h-4 mr-1" />${transaction.amount.toLocaleString()}
src/components/transactions/EnhancedTransactionDashboard.tsx:                      ${selectedTransaction.amount.toLocaleString()}
src/components/common/FileUpload/DocumentUploadModal.tsx:      /(?:Date\s?(?:of|Formation|Established|Incorporated|Formed))[:\s]+([A-Za-z0-9\s,]+)(?:\n|\r|$)/i
src/components/common/TransactionSelectorDropdown.tsx:  amount?: number; // Optional: if you want to display amount
src/components/common/TransactionSelectorDropdown.tsx:                  {transaction.amount && (
src/components/common/TransactionSelectorDropdown.tsx:                      Amount: ${transaction.amount.toLocaleString()}
src/components/common/TransactionSelector.tsx:  amount: number;
src/components/common/TransactionSelector.tsx:          amount: 750000,
src/components/common/TransactionSelector.tsx:          amount: 1250000,
src/components/common/TransactionSelector.tsx:          amount: 2500000,
src/components/common/TransactionSelector.tsx:        amount: transaction.amount,
src/components/common/TransactionSelector.tsx:  const formatCurrency = (amount: number) => {
src/components/common/TransactionSelector.tsx:    }).format(amount);
src/components/common/TransactionSelector.tsx:            ? `${currentTransaction.applicantData?.name || 'Unknown'} - ${formatCurrency(currentTransaction.amount || 0)}`
src/components/common/TransactionSelector.tsx:                      {formatCurrency(transaction.amount)}
src/components/common/DataDisplay/DataDisplay.tsx:    // Use provided columns or generate default ones
src/components/common/Button/Button.stories.tsx:  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
src/components/common/Avatar.tsx:  // Generate a consistent background color based on the name
src/components/common/DataChunkLoader.tsx:  // Generate chunk IDs if not provided
src/components/DocumentVerificationChat.tsx:            '**Average Interest Rate**: 7%\n- The average interest rate across all loans.',
src/components/DocumentVerificationChat.tsx:            '**Loan Growth Rate**: 5%\n- The overall growth rate of the loan portfolio.',
src/components/DocumentVerificationChat.tsx:            '**Loan Performance Trends**:\n- Equipment Loans: Steady growth, minimal delinquencies.\n- Working Capital Loans: Increasing demand, low default rates.\n- Real Estate Loans: Stable performance, slight increase in delinquencies.',
src/components/LifecycleAssistant.tsx:      description: 'Establish loan terms, rates, and conditions',
src/components/LifecycleAssistant.tsx:      description: 'Get final approval and generate necessary paperwork',
src/components/IntelligentDataOrchestrator.tsx: * @description Orchestrates data collection and processing from multiple sources
src/components/IntelligentDataOrchestrator.tsx: * 4. As a credit manager, I want to orchestrate data collection across systems so that I have a complete financial picture for decisioning.
src/components/IntelligentDataOrchestrator.tsx: * 11. Structured Output: Receives structured financial data integrated into loan application
src/components/IntelligentDataOrchestrator.tsx:  // Collection strategy states
src/components/IntelligentDataOrchestrator.tsx:        'Seamlessly sync with your accounting software to import financial data, invoices, and payment history.',
src/components/IntelligentDataOrchestrator.tsx:    payment_connect: {
src/components/IntelligentDataOrchestrator.tsx:      id: 'payment_connect',
src/components/IntelligentDataOrchestrator.tsx:        'Import transaction history, revenue data, and customer information from your payment processors.',
src/components/IntelligentDataOrchestrator.tsx:    payment_connect: false,
src/components/IntelligentDataOrchestrator.tsx:    payment_connect: {
src/components/IntelligentDataOrchestrator.tsx:      description: 'Connect to your payment processor account',
src/components/IntelligentDataOrchestrator.tsx:    } else if (methodId === 'payment_connect') {
src/components/IntelligentDataOrchestrator.tsx:      // Open Stripe modal for payment processor connection
src/components/IntelligentDataOrchestrator.tsx:      payment_connect: {
src/components/IntelligentDataOrchestrator.tsx:        ...prev.payment_connect,
src/components/IntelligentDataOrchestrator.tsx:      payment_connect: true,
src/components/dev/DemoCreditsManagerFix.tsx:  const handleAddCredits = (amount: number) => {
src/components/dev/DemoCreditsManagerFix.tsx:    addDemoCredits(amount);
src/components/dev/RiskReportDevTools.tsx:  const handleAddCredits = (amount: number) => {
src/components/dev/RiskReportDevTools.tsx:    addDemoCredits(amount);
src/components/dev/DemoCreditsManager.tsx:  const handleAddCredits = (amount: number) => {
src/components/dev/DemoCreditsManager.tsx:    addDemoCredits(amount);
src/components/CreditAnalysisSystem.tsx:      recommendation: 'Consider debt reduction strategy or equity injection.',
src/components/CreditAnalysisSystem.tsx:      recommendation: 'Review operating expenses and pricing strategy.',
src/components/CreditAnalysisSystem.tsx:          'Consider working capital optimization strategy',
src/components/CreditAnalysisSystem.tsx:      // Log the export data (in a real implementation, this would generate and download a PDF/Excel file)
src/components/CreditAnalysisSystem.tsx:              <p className="text-lg">Run the analysis to generate financial insights</p>
src/components/routing/LoadableRouter.tsx:                      selector integrated.
src/components/TeamMembersPanel.tsx:        return [...basePermissions, 'sign_documents', 'payment_access', 'document_upload'];
src/components/risk/RiskMapEvaReport.tsx:              low risk for lenders. The business demonstrates strong payment history and
src/components/risk/FullEvaReport.tsx:            <p className="text-sm text-gray-600">Match Score: {match.matchScore}% - Interest Rate: {match.interestRate}% - Loan Amount: ${match.loanAmount.toLocaleString()}</p>
src/components/risk/SmartMatchPaywall.tsx:// Available payment methods
src/components/risk/SmartMatchPaywall.tsx:// Define payment types
src/components/risk/SmartMatchPaywall.tsx:  const formatCurrency = (amount: number) => {
src/components/risk/SmartMatchPaywall.tsx:    }).format(amount);
src/components/risk/SmartMatchPaywall.tsx:  // Handle payment method selection
src/components/risk/SmartMatchPaywall.tsx:  // Proceed to appropriate payment flow
src/components/risk/SmartMatchPaywall.tsx:  // Process credit card payment
src/components/risk/SmartMatchPaywall.tsx:    // For demo purposes, simulate a successful payment
src/components/risk/SmartMatchPaywall.tsx:                const paymentMethodId = method.id as PaymentMethod;
src/components/risk/SmartMatchPaywall.tsx:                        : selectedPaymentMethod === paymentMethodId
src/components/risk/SmartMatchPaywall.tsx:                    onClick={() => !isDisabled && handlePaymentMethodSelect(paymentMethodId)}
src/components/risk/SmartMatchPaywall.tsx:                          selectedPaymentMethod === paymentMethodId
src/components/risk/SmartMatchPaywall.tsx:                        {selectedPaymentMethod === paymentMethodId && (
src/components/risk/SmartMatchPaywall.tsx:              {`Your payment has been processed and ${packageInfo.credits} Smart Match credit${packageInfo.credits !== 1 ? 's' : ''} have been added to your account.`}
src/components/risk/RiskLab.tsx:    repaymentCapacity: 82,
src/components/risk/RiskLab.tsx:      description: 'Assessment of credit history and payment behavior',
src/components/risk/RiskLab.tsx:    repaymentCapacity: {
src/components/risk/RiskLab.tsx:        repaymentCapacity: 82,
src/components/risk/RiskLab.tsx:        repaymentCapacity: 80,
src/components/risk/RiskLab.tsx:        repaymentCapacity: 85,
src/components/risk/RiskLab.tsx:                  <p className="text-sm text-gray-500 mb-4">Assessment of credit history and payment behavior</p>
src/components/risk/RiskLab.tsx:                  <h3 className="text-lg font-medium text-gray-900 mb-2">Repayment Capacity</h3>
src/components/risk/RiskLab.tsx:                        <span className={`text-lg font-bold ${getTextColor(scores.repaymentCapacity)}`}>{scores.repaymentCapacity}</span>
src/components/risk/RiskLab.tsx:                      <div className={`${getScoreColor(scores.repaymentCapacity)} h-2 rounded-full`} style={{ width: `${scores.repaymentCapacity}%` }}></div>
src/components/risk/RiskLab.tsx:                  Generate Risk Report
src/components/risk/RiskLabConfiguratorEnhanced.tsx:                  alert('Redirecting to payment screen...');
src/components/risk/RiskRangesConfigEditor.tsx:        id: 'payment-history',
src/components/risk/RiskRangesConfigEditor.tsx:        average: { min: 2, max: 2 }, // 2 = Moderate demand
src/components/risk/RiskMetricsDisplay.tsx:                    ? `With ${metrics.businessAge.yearsInBusiness} years in business, the applicant demonstrates established market presence and operational resilience.`
src/components/risk/RiskMapService.ts:import { generatePdf } from '../../utils/pdfGenerator';
src/components/risk/RiskMapService.ts:    // Generate some demo reports for different transaction types
src/components/risk/RiskMapService.ts:            text: 'Strong payment history with no late payments in last 24 months',
src/components/risk/RiskMapService.ts:            text: 'Seasonal fluctuations in revenue may impact repayment ability',
src/components/risk/RiskMapService.ts:                  description: 'On-time payment percentage',
src/components/risk/RiskMapService.ts:                  description: 'Ratio of monthly debt payments to income',
src/components/risk/RiskMapService.ts:                  description: 'Year over year growth rate',
src/components/risk/RiskMapService.ts:                  value: 'Moderate',
src/components/risk/RiskMapService.ts:                  description: 'Status of tax filings and payments',
src/components/risk/RiskMapService.ts:          { type: 'positive', text: 'Property value exceeds loan amount by 35%' },
src/components/risk/RiskMapService.ts:          { type: 'warning', text: 'Property requires moderate renovations ($45,000 estimated)' },
src/components/risk/RiskMapService.ts:          { type: 'positive', text: 'Low vacancy rates in target area (3.5%)' },
src/components/risk/RiskMapService.ts:                  value: 'Moderate',
src/components/risk/RiskMapService.ts:                  description: 'Capitalization rate',
src/components/risk/RiskMapService.ts:                  value: 'Moderate Impact',
src/components/risk/RiskMapService.ts:          { type: 'negative', text: 'Rapid technology changes may accelerate obsolescence' },
src/components/risk/RiskMapService.ts:                  value: 'Moderate',
src/components/risk/RiskMapService.ts:                  value: 'Moderate',
src/components/risk/RiskMapService.ts:                  source: 'Corporate Analysis',
src/components/risk/RiskMapService.ts:  addCredits(amount: number): void {
src/components/risk/RiskMapService.ts:      `[RiskMapService] Adding ${amount} credits. Before: ${credits}, After: ${credits + amount}`
src/components/risk/RiskMapService.ts:    this.setAvailableCredits(credits + amount);
src/components/risk/RiskMapService.ts:    // Generate PDF (mock implementation)
src/components/risk/RiskMapService.ts:      const pdfBlob = await generatePdf(reportElement);
src/components/risk/RiskMapService.ts:      await ShieldVaultService.recordEvent(transactionId, 'eva_report_generated', {
src/components/risk/RiskMapService.ts:          { type: 'positive', text: 'Excellent repayment history on previous loans' },
src/components/risk/RiskMapService.ts:          { type: 'warning', text: 'Market conditions in the area show moderate volatility' },
src/components/risk/RiskMapService.ts:            text: 'Strong credit history with consistent payment behavior over last 24 months',
src/components/risk/RiskMapService.ts:            text: 'Business has demonstrated ability to service existing debt obligations',
src/components/risk/PlaidBankConnection.tsx:              Choose which account you'd like to use for risk report payments.
src/components/risk/CommissionCalculator.tsx:// Define commission rate structure
src/components/risk/CommissionCalculator.tsx:  // Calculate base commission rate based on loan type and role
src/components/risk/CommissionCalculator.tsx:  // Calculate effective commission rate
src/components/risk/CommissionCalculator.tsx:  // Calculate commission amount
src/components/risk/CommissionCalculator.tsx:  const formatCurrency = (amount: number) => {
src/components/risk/CommissionCalculator.tsx:    }).format(amount);
src/components/risk/CommissionCalculator.tsx:                  placeholder="Enter custom rate %"
src/components/risk/CommissionCalculator.tsx:              <li>Final commission rates are subject to lender agreement</li>
src/components/risk/RiskAssessment.tsx:  interestRateChange: number;
src/components/risk/RiskAssessment.tsx:    interestRateChange: 2.0,
src/components/risk/RiskAssessment.tsx:        // Generate mock risk data based on transaction
src/components/risk/RiskAssessment.tsx:        generateMockRiskData();
src/components/risk/RiskAssessment.tsx:      // Generate default data even if no transaction is available
src/components/risk/RiskAssessment.tsx:      generateMockRiskData();
src/components/risk/RiskAssessment.tsx:  const generateMockRiskData = useCallback(() => {
src/components/risk/RiskAssessment.tsx:    // Ensure we can still generate data even without a current transaction
src/components/risk/RiskAssessment.tsx:    const transactionAmount = currentTransaction?.amount || 250000;
src/components/risk/RiskAssessment.tsx:    // Adjust for transaction amount
src/components/risk/RiskAssessment.tsx:    const amountFactor = Math.min(Math.max(transactionAmount / 1000000, 0), 10);
src/components/risk/RiskAssessment.tsx:      Math.max(Math.round(baseScore - amountFactor + (Math.random() * 10 - 5)), 0),
src/components/risk/RiskAssessment.tsx:    // Generate risk factors
src/components/risk/RiskAssessment.tsx:        description: 'Based on historical payment behavior and credit utilization.',
src/components/risk/RiskAssessment.tsx:    // Generate cash flow metrics
src/components/risk/RiskAssessment.tsx:      // Generate mock scenario analysis results
src/components/risk/RiskAssessment.tsx:          labels: ['Current', 'Mild', 'Moderate', 'Severe'],
src/components/risk/RiskAssessment.tsx:                  value={parameters.interestRateChange}
src/components/risk/RiskAssessment.tsx:                  onChange={(val) => handleParameterChange('interestRateChange', val)}
src/components/risk/RiskAssessment.tsx:                        ? ' moderate '
src/components/risk/RiskAssessment.tsx:                  most concerning factor, with potential implications for long-term repayment
src/components/risk/RiskConfiguration.tsx:                  ? 'Balanced importance: Moderate emphasis on collateral as one of several important factors in lending decisions.'
src/components/risk/RiskConfiguration.tsx:                  ? 'Moderate requirements: Guarantors should have good credit and reasonable financial strength to support the borrower.'
src/components/risk/RiskConfiguration.tsx:            <span className="text-sm text-gray-500">Moderate</span>
src/components/risk/RiskConfiguration.tsx:              backgroundColor: `rgba(${currentRiskLevel.id === 'conservative' ? '59, 130, 246' : currentRiskLevel.id === 'moderate' ? '16, 185, 129' : currentRiskLevel.id === 'balanced' ? '245, 158, 11' : currentRiskLevel.id === 'aggressive' ? '249, 115, 22' : '239, 68, 68'}, 0.1)`,
src/components/risk/AllRiskMapsView.tsx:const generateMockRiskMaps = (): RiskMap[] => [
src/components/risk/AllRiskMapsView.tsx:const MOCK_RISK_MAPS = (() => generateMockRiskMaps())();
src/components/risk/AllRiskMapsView.tsx:  formatCurrency: (amount: number) => string;
src/components/risk/AllRiskMapsView.tsx:  const formatCurrency = useCallback((amount: number) => {
src/components/risk/AllRiskMapsView.tsx:    }).format(amount);
src/components/risk/RiskScoreReport.tsx:      reportLoadingActions.completeLoading('Risk report generated successfully');
src/components/risk/RiskScoreReport.tsx:      reportLoadingActions.setError('Failed to generate report. Please try again.');
src/components/risk/PaywallModal.tsx:// Available payment methods
src/components/risk/PaywallModal.tsx:// Define the PaymentMethod type to include all payment methods
src/components/risk/PaywallModal.tsx:  | 'crypto_payment'
src/components/risk/PaywallModal.tsx:    token: 'link-sandbox-123', // This would be generated by your server in a real app
src/components/risk/PaywallModal.tsx:  const formatCurrency = (amount: number) => {
src/components/risk/PaywallModal.tsx:    }).format(amount);
src/components/risk/PaywallModal.tsx:  // Handle method selection and proceed to appropriate payment flow
src/components/risk/PaywallModal.tsx:        setCurrentStep('crypto_payment');
src/components/risk/PaywallModal.tsx:        console.error(`Unhandled payment method: ${selectedPaymentMethod}`);
src/components/risk/PaywallModal.tsx:        setError('Invalid payment method selected. Please try again.');
src/components/risk/PaywallModal.tsx:  // Stripe payment handler - In demo mode always succeeds
src/components/risk/PaywallModal.tsx:    // For demo purposes, we'll simulate a successful payment after a delay
src/components/risk/PaywallModal.tsx:    // In a real app, this would generate a payment and monitor for confirmation
src/components/risk/PaywallModal.tsx:  // Handle crypto payment - In demo mode always succeeds
src/components/risk/PaywallModal.tsx:    // In a real app, this would generate a payment and monitor for confirmation
src/components/risk/PaywallModal.tsx:  // Handle using credits to generate report
src/components/risk/PaywallModal.tsx:  // This function is used to handle payment method selection
src/components/risk/PaywallModal.tsx:    console.log(`Selected payment method: ${methodId}`);
src/components/risk/PaywallModal.tsx:                // Ensure we're properly identifying payment methods that match our PaymentMethod type
src/components/risk/PaywallModal.tsx:                const paymentMethodId =
src/components/risk/PaywallModal.tsx:                    className={`p-3 border rounded-lg flex items-center cursor-pointer payment-method ${
src/components/risk/PaywallModal.tsx:                        ? 'payment-method-disabled'
src/components/risk/PaywallModal.tsx:                        : selectedPaymentMethod === paymentMethodId
src/components/risk/PaywallModal.tsx:                          ? 'payment-method-selected'
src/components/risk/PaywallModal.tsx:                    onClick={() => !isDisabled && updateSelectedPaymentMethod(paymentMethodId)}
src/components/risk/PaywallModal.tsx:                          selectedPaymentMethod === paymentMethodId
src/components/risk/PaywallModal.tsx:                        {selectedPaymentMethod === paymentMethodId && (
src/components/risk/PaywallModal.tsx:                After sending the wire, click the button below to record your payment. We'll verify
src/components/risk/PaywallModal.tsx:      case 'crypto_payment':
src/components/risk/PaywallModal.tsx:                After sending payment, click the button below to notify us. We'll verify the
src/components/risk/PaywallModal.tsx:                ? `Your wire transfer has been recorded. ${packageInfo.credits} credits will be added to your account once payment is confirmed.`
src/components/risk/PaywallModal.tsx:                : `Your payment has been processed and ${packageInfo.credits} credits have been added to your account.`}
src/components/risk/PaywallModal.tsx:                    : currentStep === 'crypto_payment'
src/components/risk/RiskLabConfigurator.tsx:  // State for payment history options
src/components/risk/RiskLabConfigurator.tsx:  const [paymentOptions, setPaymentOptions] = useState({
src/components/risk/RiskLabConfigurator.tsx:    positive: 'No Missed payment',
src/components/risk/RiskLabConfigurator.tsx:    average: '1-2 Missed payment',
src/components/risk/RiskLabConfigurator.tsx:    negative: '3+ Missed payment'
src/components/risk/RiskLabConfigurator.tsx:  // Function to handle payment option changes
src/components/risk/RiskLabConfigurator.tsx:  // Render payment option inputs
src/components/risk/RiskLabConfigurator.tsx:            value={paymentOptions.positive}
src/components/risk/RiskLabConfigurator.tsx:            value={paymentOptions.average}
src/components/risk/RiskLabConfigurator.tsx:            value={paymentOptions.negative}
src/components/risk/RiskLabConfigurator.tsx:              <div className="text-sm text-center">{paymentOptions.positive}</div>
src/components/risk/RiskLabConfigurator.tsx:              <div className="text-sm text-center text-green-600">{paymentOptions.average} <span className="w-3 h-3 bg-green-100 text-green-800 rounded-full text-xs flex items-center justify-center">✓</span></div>
src/components/risk/RiskLabConfigurator.tsx:              <div className="text-sm text-center">{paymentOptions.negative}</div>
src/components/risk/RiskLabConfigurator.tsx:                  // In a real app, this would integrate with the PaywallModal component
src/components/risk/RiskLabConfigurator.tsx:                  alert('Redirecting to payment screen...');
src/components/risk/RiskCategoryToggle.tsx:      id: 'payment-history',
src/components/risk/RiskCategoryToggle.tsx:      good: '0-2 missed payments',
src/components/risk/RiskCategoryToggle.tsx:      average: '3-5 missed payments',
src/components/risk/RiskCategoryToggle.tsx:      negative: '5+ missed payments',
src/components/risk/RiskCategoryToggle.tsx:      average: 'Moderate (2.67-5.33yrs)',
src/components/risk/RiskCategoryToggle.tsx:      id: 'utilization-rate',
src/components/risk/RiskCriteriaConfig.tsx:      id: 'payment_history',
src/components/risk/RiskCriteriaConfig.tsx:        { min: 'No late payments', max: 'No late payments', label: 'Good', status: 'good', points: 2 },
src/components/risk/RiskCriteriaConfig.tsx:        { min: '1-2 late payments', max: '1-2 late payments (30-60 days)', label: 'Average', status: 'average', points: 1 },
src/components/risk/RiskCriteriaConfig.tsx:        { min: '3+ late payments', max: '3+ late payments or 90+ days', label: 'Negative', status: 'negative', points: 0 },
src/components/risk/RiskCriteriaConfig.tsx:        { min: 'Moderately positive', max: 'Moderately positive', label: 'Average', status: 'average', points: 1 },
src/components/risk/RiskCriteriaConfig.tsx:        { min: 'Moderate risk', max: 'Moderate risk', label: 'Average', status: 'average', points: 1 },
src/components/risk/RiskCriteriaConfig.tsx:          { min: 'Moderate demand', max: 'Moderate demand', label: 'Average', status: 'average' as RiskStatus, points: 1 },
src/components/risk/RiskCriteriaConfig.tsx:          { min: 'Moderate (2.67-5.33y)', max: 'Moderate (2.67-5.33y)', label: 'Average', status: 'average' as RiskStatus, points: 1 },
src/components/risk/__tests__/RiskReportPaywall.test.tsx:  test('displays payment methods', () => {
src/components/risk/__tests__/RiskReportPaywall.test.tsx:  test('processes payment and calls onPurchaseComplete when using credits', async () => {
src/components/risk/__tests__/RiskReportPaywall.test.tsx:    // Since the credits payment method might be disabled initially due to how the component
src/components/risk/__tests__/RiskReportPaywall.test.tsx:    // initializes, let's select ACH payment method which adds credits then purchases
src/components/risk/__tests__/RiskReportPaywall.test.tsx:    const paymentButton = screen.getByRole('button', { name: 'Use Credits' });
src/components/risk/__tests__/RiskReportPaywall.test.tsx:    expect(paymentButton).not.toBeDisabled();
src/components/risk/__tests__/RiskReportPaywall.test.tsx:    fireEvent.click(paymentButton);
src/components/risk/__tests__/RiskReportPaywall.test.tsx:    // For non-credit payment methods, it adds credits then purchases
src/components/risk/__tests__/RiskReportPaywall.test.tsx:    // Check if the payment was processed
src/components/risk/__tests__/RiskReportPaywall.test.tsx:    // Select ACH payment method
src/components/risk/__tests__/RiskReportPaywall.test.tsx:    const paymentButton = screen.getByRole('button', { name: 'Use Credits' });
src/components/risk/__tests__/RiskReportPaywall.test.tsx:    expect(paymentButton).not.toBeDisabled();
src/components/risk/__tests__/RiskReportPaywall.test.tsx:    fireEvent.click(paymentButton);
src/components/risk/CoinbaseUSDCPayment.tsx:  amount: number; // Payment amount in USD
src/components/risk/CoinbaseUSDCPayment.tsx:const CoinbaseUSDCPayment: React.FC<CoinbaseUSDCPaymentProps> = ({ amount, onSuccess, onCancel }) => {
src/components/risk/CoinbaseUSDCPayment.tsx:  const [paymentAddress, setPaymentAddress] = useState<string>('');
src/components/risk/CoinbaseUSDCPayment.tsx:  // Mock function to generate a USDC payment address
src/components/risk/CoinbaseUSDCPayment.tsx:  const generatePaymentAddress = () => {
src/components/risk/CoinbaseUSDCPayment.tsx:    // Simulate API call to generate a payment address
src/components/risk/CoinbaseUSDCPayment.tsx:    navigator.clipboard.writeText(paymentAddress);
src/components/risk/CoinbaseUSDCPayment.tsx:  // Check if payment was received
src/components/risk/CoinbaseUSDCPayment.tsx:    // Simulate checking payment status
src/components/risk/CoinbaseUSDCPayment.tsx:  // Initialize the payment address on component mount
src/components/risk/CoinbaseUSDCPayment.tsx:    generatePaymentAddress();
src/components/risk/CoinbaseUSDCPayment.tsx:        Send exactly <span className="font-semibold">{amount.toFixed(2)} USDC</span> to the address below. Payment must be received within the time limit.
src/components/risk/CoinbaseUSDCPayment.tsx:                  value={paymentAddress}
src/components/risk/CoinbaseUSDCPayment.tsx:              After sending the payment, click the button below to check if it has been received.
src/components/risk/RiskAdvisorWrapper.tsx: * that is separate from DocumentVerification
src/components/risk/RiskCategoryDetail.tsx:    { name: 'Payment History', value: '0 missed payments', status: 'good', source: 'Experian', description: 'No missed payments in last 24 months' },
src/components/risk/RiskCategoryDetail.tsx:    { name: 'Payment Trends', value: '99.5% on time', status: 'good', source: 'Paynet API', description: 'More than 99% of payments on time' },
src/components/risk/RiskCategoryDetail.tsx:    { name: 'Payment History', value: '1 missed payment', status: 'average', source: 'Experian', description: '1-2 missed payments in last 24 months' },
src/components/risk/RiskCategoryDetail.tsx:    { name: 'Payment Trends', value: '98% on time', status: 'average', source: 'Experian', description: '97-99% of payments on time' },
src/components/risk/RiskCategoryDetail.tsx:  { name: 'Utilization Rate', value: '85%', status: 'good', source: 'Operation Records', description: 'High utilization rate (>80%)' },
src/components/risk/RiskCategoryDetail.tsx:  { name: 'Loan Rate Type', value: 'Fixed Rate Term', status: 'good', source: 'Loan Application', description: 'Stable fixed rate financing' },
src/components/risk/EvaScore.tsx:    { range: '670-739', rating: 'Good', description: 'Moderate risk, standard terms' },
src/components/risk/RiskScoringModel.tsx:        value: '0 missed payments',
src/components/risk/RiskScoringModel.tsx:    summary: 'Acme Manufacturing Inc. demonstrates strong creditworthiness with an excellent payment history and solid financial ratios. The company has robust cash flow and is legally compliant. The equipment being financed has high market demand and good resale value.',
src/components/risk/RiskScoringModel.tsx:        value: '1 missed payment',
src/components/risk/RiskScoringModel.tsx:    summary: 'Smithson Properties LLC shows moderate creditworthiness with an acceptable payment history and average financial ratios. The property being financed has a reasonable LTV ratio and good occupancy rate, which supports loan serviceability.',
src/components/risk/RiskScoringModel.tsx:        value: '4 missed payments',
src/components/risk/RiskScoringModel.tsx:    summary: 'TechStart Innovation Inc. has below average creditworthiness with multiple missed payments and weak financial ratios. The company shows negative cash flow trends which presents increased risk. The application is strengthened by multiple guarantors and secondary collateral.',
src/components/risk/RiskScoringModel.tsx:    recommendation: 'Consider for conditional approval with increased rates/fees to account for higher risk profile. Require robust guarantor support and additional collateral verification.'
src/components/risk/RiskScoringModel.tsx:  paymentHistory: string;
src/components/risk/RiskScoringModel.tsx:    paymentHistory: initialInputs?.paymentHistory || '1-2 Missed payment',
src/components/risk/RiskScoringModel.tsx:    // Score based on payment history (string to number conversion)
src/components/risk/RiskScoringModel.tsx:    let paymentMissed = 0;
src/components/risk/RiskScoringModel.tsx:    if (inputs.paymentHistory === '1-2 Missed payment') {
src/components/risk/RiskScoringModel.tsx:      paymentMissed = 1;
src/components/risk/RiskScoringModel.tsx:    } else if (inputs.paymentHistory === '3+ Missed payment') {
src/components/risk/RiskScoringModel.tsx:      paymentMissed = 3;
src/components/risk/RiskScoringModel.tsx:    const paymentHistoryResult = evaluateRange(paymentMissed, 'creditworthiness', 'payment-history');
src/components/risk/RiskScoringModel.tsx:    totalPoints += paymentHistoryResult.points;
src/components/risk/RiskScoringModel.tsx:    let equipmentTypeValue = 2; // Default to moderate demand
src/components/risk/CustomerRetentionModule.tsx:  retentionStrategies: [
src/components/risk/CustomerRetentionModule.tsx:  const [activeTab, setActiveTab] = useState<'overview' | 'segments' | 'at-risk' | 'strategies'>('overview');
src/components/risk/CustomerRetentionModule.tsx:  // Get color based on retention rate
src/components/risk/CustomerRetentionModule.tsx:  const getRetentionColor = (rate: number) => {
src/components/risk/CustomerRetentionModule.tsx:    if (rate >= 90) return 'text-green-600';
src/components/risk/CustomerRetentionModule.tsx:    if (rate >= 80) return 'text-blue-600';
src/components/risk/CustomerRetentionModule.tsx:    if (rate >= 70) return 'text-yellow-600';
src/components/risk/CustomerRetentionModule.tsx:        <p className="text-sm text-gray-500 mt-2">Annual customer loss rate</p>
src/components/risk/CustomerRetentionModule.tsx:  // Render Strategies Tab
src/components/risk/CustomerRetentionModule.tsx:  const renderStrategiesTab = () => (
src/components/risk/CustomerRetentionModule.tsx:          <h3 className="text-lg font-medium text-gray-900">Retention Strategies</h3>
src/components/risk/CustomerRetentionModule.tsx:          Create Strategy
src/components/risk/CustomerRetentionModule.tsx:        {SAMPLE_RETENTION_DATA.retentionStrategies.map(strategy => (
src/components/risk/CustomerRetentionModule.tsx:          <div key={strategy.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
src/components/risk/CustomerRetentionModule.tsx:              <h4 className="text-md font-medium text-gray-900">{strategy.name}</h4>
src/components/risk/CustomerRetentionModule.tsx:              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getEffectivenessBadgeStyle(strategy.effectiveness)}`}>
src/components/risk/CustomerRetentionModule.tsx:                {strategy.effectiveness.charAt(0).toUpperCase() + strategy.effectiveness.slice(1)}
src/components/risk/CustomerRetentionModule.tsx:            <p className="text-sm text-gray-500 mb-3">Target: {strategy.targetSegment}</p>
src/components/risk/CustomerRetentionModule.tsx:          Monitor and improve customer retention metrics and strategies
src/components/risk/CustomerRetentionModule.tsx:              onClick={() => setActiveTab('strategies')}
src/components/risk/CustomerRetentionModule.tsx:                activeTab === 'strategies'
src/components/risk/CustomerRetentionModule.tsx:              Retention Strategies
src/components/risk/CustomerRetentionModule.tsx:        {activeTab === 'strategies' && renderStrategiesTab()}
src/components/risk/RiskReportPaywall.tsx:  const paymentMethods: PaymentMethod[] = [
src/components/risk/RiskReportPaywall.tsx:  // Handle payment method selection
src/components/risk/RiskReportPaywall.tsx:  // Process payment
src/components/risk/RiskReportPaywall.tsx:        // Process payment through external service
src/components/risk/RiskReportPaywall.tsx:        // In a real implementation, this would call a payment API
src/components/risk/RiskReportPaywall.tsx:        // Simulate a payment process
src/components/risk/RiskReportPaywall.tsx:        // For demo, we'll assume payment is successful and add credits
src/components/risk/RiskReportPaywall.tsx:      setErrorMessage(error instanceof Error ? error.message : 'An error occurred during payment processing');
src/components/risk/RiskReportPaywall.tsx:  // Determine if we should enable the payment button
src/components/risk/RiskReportPaywall.tsx:            {paymentMethods.map(method => (
src/components/risk/ModularRiskNavigator.tsx:    description: 'Assessment of credit history and payment behavior',
src/components/risk/ModularRiskNavigator.tsx:    title: 'Repayment Capacity',
src/components/risk/ModularRiskNavigator.tsx:    amount: 100000,
src/components/risk/ModularRiskNavigator.tsx:    interestRate: 8.5,
src/components/risk/ModularRiskNavigator.tsx:        interestRate: 8.5,
src/components/risk/ModularRiskNavigator.tsx:            value={riskParameters.interestRate}
src/components/risk/ModularRiskNavigator.tsx:            onChange={e => handleParameterChange('interestRate', parseFloat(e.target.value))}
src/components/risk/ModularRiskNavigator.tsx:  const handleGenerateReport = useCallback(async () => {
src/components/risk/ModularRiskNavigator.tsx:                  'The applicant demonstrates excellent credit history with a strong payment record and responsible use of available credit.'}
src/components/risk/ModularRiskNavigator.tsx:                  'Revenue trends show consistent growth and the business has demonstrated ability to service existing debt obligations.'}
src/components/risk/ModularRiskNavigator.tsx:                  'The provided collateral adequately secures the requested loan amount with reasonable liquidation value.'}
src/components/risk/ModularRiskNavigator.tsx:                Generate Full Risk Report
src/components/risk/ModularRiskNavigator.tsx:          onPurchaseComplete={handleGenerateReport}
src/components/risk/SmartMatchDisplay.tsx:  const formatCurrency = (amount: number) => {
src/components/risk/SmartMatchDisplay.tsx:    }).format(amount);
src/components/risk/SmartMatchDisplay.tsx:  // Format interest rate
src/components/risk/SmartMatchDisplay.tsx:  const formatInterestRate = (rate: number) => {
src/components/risk/SmartMatchDisplay.tsx:    return `${rate.toFixed(2)}%`;
src/components/risk/SmartMatchDisplay.tsx:                  {formatCurrency(match.loanAmount || 0)} at {formatInterestRate(match.interestRate || 0)}
src/components/risk/SmartMatchDisplay.tsx:                    {formatInterestRate(selectedLenderDetails.interestRate || 0)}
src/components/risk/SmartMatchDisplay.tsx:                      ((selectedLenderDetails.interestRate || 0) / 100) * 
src/components/risk/RiskAdvisorChat.tsx:  'Recommend risk mitigation strategies for this specific case',
src/components/risk/RiskAdvisorChat.tsx:            'Please analyze the risk profile of this transaction and suggest mitigation strategies.'
src/components/risk/RiskAdvisorChat.tsx:      // Generate AI response based on transaction data and user query
src/components/risk/RiskAdvisorChat.tsx:      const aiResponseText = generateAIResponse(inputValue, mode, currentTransaction);
src/components/risk/RiskAdvisorChat.tsx:  // Generate AI response based on input and transaction data
src/components/risk/RiskAdvisorChat.tsx:  const generateAIResponse = (input: string, mode: string, transaction: any): string => {
src/components/risk/RiskAdvisorChat.tsx:      return `Based on my analysis of this transaction, here are recommended risk mitigation strategies:
src/components/risk/RiskAdvisorChat.tsx:4. **Market Risk**: Consider shorter loan term or adjustable rate structure
src/components/risk/RiskAdvisorChat.tsx:Would you like me to elaborate on any specific risk category?`;
src/components/risk/RiskAdvisorChat.tsx:Overall: The business shows good financial stability but underperforms in profitability metrics. This suggests moderate risk with specific monitoring needed for cash flow and profitability.`;
src/components/risk/RiskAdvisorChat.tsx:• Overall risk rating: ${transaction?.riskRating || 'Moderate'}
src/components/risk/RiskAdvisorChat.tsx:• Concerns: ${transaction?.concernAreas || 'Industry volatility, moderate leverage'}
src/components/risk/RiskAdvisorChat.tsx:How would you like me to help with this risk assessment? I can provide mitigation strategies, industry comparisons, or documentation recommendations.`;
src/components/risk/RiskAdvisorChat.tsx:                placeholder="Ask about risk factors or mitigation strategies..."
src/components/risk/SmartMatchingVariables.tsx:    moderate: number;
src/components/risk/SmartMatchingVariables.tsx:        moderate: -0.15,
src/components/risk/SmartMatchingVariables.tsx:  const formatCurrency = (amount: number) => {
src/components/risk/SmartMatchingVariables.tsx:    }).format(amount);
src/components/communications/ChatWidget.tsx:      preview: 'Detailed risk factors and mitigation strategies',
src/components/communications/ChatWidget.tsx:          { date: '2023-05-12', description: 'Payroll Deposit', amount: 4285.75, type: 'credit' },
src/components/communications/ChatWidget.tsx:          { date: '2023-05-10', description: 'Mortgage Payment', amount: -2150.0, type: 'debit' },
src/components/communications/ChatWidget.tsx:          { date: '2023-05-08', description: 'Car Insurance', amount: -189.5, type: 'debit' },
src/components/communications/ChatWidget.tsx:            `**Recent Transactions**:\n- ${fd.recentTransactions[0].date}: ${fd.recentTransactions[0].description} - $${Math.abs(fd.recentTransactions[0].amount).toLocaleString()} (${fd.recentTransactions[0].type})\n- ${fd.recentTransactions[1].date}: ${fd.recentTransactions[1].description} - $${Math.abs(fd.recentTransactions[1].amount).toLocaleString()} (${fd.recentTransactions[1].type})`,
src/components/communications/ChatWidget.tsx:            '**Average Interest Rate**: 7%\n- The average interest rate across all loans.',
src/components/communications/ChatWidget.tsx:            '**Loan Growth Rate**: 5%\n- The overall growth rate of the loan portfolio.',
src/components/communications/ChatWidget.tsx:            '**Loan Performance Trends**:\n- Equipment Loans: Steady growth, minimal delinquencies.\n- Working Capital Loans: Increasing demand, low default rates.\n- Real Estate Loans: Stable performance, slight increase in delinquencies.',
src/components/communications/ChatWidget.tsx:    // Generate intelligent responses based on the specific suggestion
src/components/communications/ChatWidget.tsx:          '**Payment History**: 100% on-time payments over the last 24 months - Exceptional record',
src/components/communications/ChatWidget.tsx:          '**Risk Assessment**: LOW RISK - Strong payment history and stable income sources',
src/components/communications/ChatWidget.tsx:          '**Risk Assessment**: Low to moderate - Stable commercial market with good tenant demand',
src/components/communications/ChatWidget.tsx:          '**Cash Flow Stability**: Excellent - 95% occupancy rate with long-term tenant leases',
src/components/communications/ChatWidget.tsx:          '**Economic Risk Factors**: Monitor interest rate sensitivity and local market conditions',
src/components/communications/ChatWidget.tsx:          '📊 **Data Sources** - Integrated information from multiple financial databases and market feeds',
src/components/communications/ChatWidget.tsx:      utterance.rate = 1;
src/components/communications/ChatWidget.tsx:                            <li>Loan details and payment history</li>
src/components/communications/CommunicationChannelManager.tsx:      // Show syncing state (would be more elaborate in real app)
src/components/communications/ContextAwareEvaChat.tsx:  // Generate context-aware prompt based on the current page and selected entity
src/components/communications/ContextAwareEvaChat.tsx:          "You're viewing Risk Assessment tools. I can help explain risk scores, suggest mitigation strategies, or answer questions about risk factors.";
src/components/communications/ContextAwareEvaChat.tsx:          "You're in the Customer Retention module. I can help analyze customer data, suggest engagement strategies, or explain customer metrics.";
src/components/communications/ContextAwareEvaChat.tsx:          prompt += ` I see you're reviewing a specific risk assessment (ID: ${selectedEntityId}). Would you like an explanation of risk factors, mitigation strategies, or comparative analysis?`;
src/components/communications/CustomAgentCreationModal.tsx:  { id: 'integrated-business-banking', name: 'Integrated Business Banking' },
src/components/communications/ContactsManager.tsx:        notes: 'Imported contact - interested in equipment financing',
src/components/communications/ContactsManager.tsx:    // In a real app, we would generate a CSV file from the contacts data
src/components/communications/ContactsManager.tsx:    // const csvContent = generateCsvFromContacts(contacts);
src/components/analytics/RoleAnalyticsDisplay.tsx:      generateRoleSpecificData(role, timeframe);
src/components/analytics/RoleAnalyticsDisplay.tsx:  // Generate role-specific data
src/components/analytics/RoleAnalyticsDisplay.tsx:  const generateRoleSpecificData = (role: UserRole, timeframe: string) => {
src/components/analytics/RoleAnalyticsDisplay.tsx:        generateBorrowerData(timeframe);
src/components/analytics/RoleAnalyticsDisplay.tsx:        generateVendorData(timeframe);
src/components/analytics/RoleAnalyticsDisplay.tsx:        generateBrokerData(timeframe);
src/components/analytics/RoleAnalyticsDisplay.tsx:        generateLenderData(timeframe);
src/components/analytics/RoleAnalyticsDisplay.tsx:        generateInvestorData(timeframe);
src/components/analytics/RoleAnalyticsDisplay.tsx:        generateAdminData(timeframe);
src/components/analytics/RoleAnalyticsDisplay.tsx:  const generateBorrowerData = (timeframe: string) => {
src/components/analytics/RoleAnalyticsDisplay.tsx:  const generateVendorData = (timeframe: string) => {
src/components/analytics/RoleAnalyticsDisplay.tsx:  const generateBrokerData = (timeframe: string) => {
src/components/analytics/RoleAnalyticsDisplay.tsx:  const generateLenderData = (timeframe: string) => {
src/components/analytics/RoleAnalyticsDisplay.tsx:  const generateInvestorData = (timeframe: string) => {
src/components/analytics/RoleAnalyticsDisplay.tsx:  const generateAdminData = (timeframe: string) => {
src/components/analytics/RoleAnalyticsDisplay.tsx:          onClick={() => generateRoleSpecificData(role, timeframe)}
src/components/analytics/RoleAnalyticsDisplay.tsx:            onClick={() => generateRoleSpecificData(role, timeframe)}
src/components/analytics/RoleAnalyticsDisplay.tsx:            Generate Data
src/components/conversation/SmartMatchPanel.tsx:    estimatedTerms: '60 months, no prepayment penalty',
src/components/conversation/SmartMatchPanel.tsx:    estimatedTerms: '60 months, 1% prepayment penalty',
src/components/conversation/SmartMatchPanel.tsx:      'Lowest rate available',
src/components/conversation/SmartMatchPanel.tsx:      'Higher approval amount potential'
src/components/conversation/SmartMatchPanel.tsx:    estimatedTerms: '72 months, flexible payment structure',
src/components/conversation/SmartMatchPanel.tsx:      'Seasonal payment options',
src/components/conversation/SmartMatchPanel.tsx:      'Lower monthly payments'
src/components/conversation/SmartMatchPanel.tsx:    competitiveEdge: 'Only lender offering seasonal payment flexibility'
src/components/conversation/ConversationInterface.tsx:import { generateId, handleFileSelection } from '../../utils/fileUtils';
src/components/conversation/ConversationInterface.tsx:      id: generateId(),
src/components/conversation/ConversationInterface.tsx:  // Generate EVA response based on message content
src/components/conversation/ConversationInterface.tsx:      responseContent = "I've analyzed this deal and found 3 optimal lender matches. Based on the borrower's profile, I recommend prioritizing Lender A for speed (5-day close) or Lender B for best terms (0.25% lower rate).";
src/components/conversation/ConversationInterface.tsx:            termAdvantage: 'Best rate in market'
src/components/conversation/ConversationInterface.tsx:      responseContent = "I've analyzed the borrower's credit profile. They have a strong payment history with a 720 FICO score. Their debt service coverage ratio is 1.4x, which meets most lender requirements.";
src/components/conversation/ConversationInterface.tsx:      id: generateId(),
src/components/conversation/ConversationInterface.tsx:      id: generateId(),
src/components/conversation/ConversationInterface.tsx:        id: generateId(),
src/components/conversation/TransactionConversations.tsx:import { generateId } from '../../utils/fileUtils';
src/components/conversation/TransactionConversations.tsx:          id: generateId(),
src/components/conversation/TransactionConversations.tsx:          id: generateId(),
src/components/conversation/TransactionConversations.tsx:            "I've analyzed the initial information for XYZ Manufacturing. Based on their industry and amount needed, I'll need their last 2 years financials and equipment details to provide lender recommendations.",
src/components/conversation/TransactionConversations.tsx:          id: generateId(),
src/components/conversation/TransactionConversations.tsx:          id: generateId(),
src/components/conversation/TransactionConversations.tsx:          id: generateId(),
src/components/conversation/TransactionConversations.tsx:  const [sortBy, setSortBy] = useState<'recent' | 'amount' | 'urgency'>('recent');
src/components/conversation/TransactionConversations.tsx:      case 'amount':
src/components/conversation/TransactionConversations.tsx:            <option value="amount">Amount</option>
src/components/PlaidOwnerVerification.tsx:  dateGenerated: string;
src/components/PlaidOwnerVerification.tsx:      // This would call your backend to generate a link token
src/components/PlaidOwnerVerification.tsx:      // Generate mock statements based on current date
src/components/PlaidOwnerVerification.tsx:          dateGenerated: new Date().toISOString(),
src/components/PlaidOwnerVerification.tsx:          dateGenerated: new Date().toISOString(),
src/components/TransactionExecution.tsx:  const [generateAllLoading, setGenerateAllLoading] = useState(false);
src/components/TransactionExecution.tsx:  // Generate all documents with error handling
src/components/TransactionExecution.tsx:  const handleGenerateAll = useCallback(async () => {
src/components/TransactionExecution.tsx:    setGenerateAllLoading(true);
src/components/TransactionExecution.tsx:      alert('Could not generate documents. Please try again.');
src/components/TransactionExecution.tsx:      setGenerateAllLoading(false);
src/components/TransactionExecution.tsx:          Generate, sign, and securely store transaction documents on blockchain
src/components/TransactionExecution.tsx:                onClick={handleGenerateAll}
src/components/TransactionExecution.tsx:                disabled={generateAllLoading}
src/components/TransactionExecution.tsx:                  generateAllLoading
src/components/TransactionExecution.tsx:                {generateAllLoading ? (
src/components/TransactionExecution.tsx:                  'Generate All'
src/components/TransactionExecution.tsx:                <p className="ml-2 text-gray-700">1. Generate closing documents</p>
src/stories/Button.stories.ts:  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
src/stories/Header.stories.ts:  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
src/hooks/useBlockchainData.ts:    async (type: 'buy' | 'sell', instrumentId: number, amount: number) => {
src/hooks/useBlockchainData.ts:        const transaction = await BlockchainService.executeTransaction(type, instrumentId, amount);
src/hooks/useTransactionStore.ts:  amount: z.number().positive('Amount must be positive'),
src/hooks/useTransactionStore.ts:  amount: z.number().positive(),
src/hooks/usePerformance.ts:      // Only report non-mount renders (mount is tracked separately)
src/hooks/useFeatureFlag.ts:  // Extract complex expression to a separate variable for static checking
src/api/mockFallback.ts:      'Consider refinancing high-interest debt',
src/api/mockFallback.ts:      'Maintain current payment schedule',
src/api/mockFallback.ts:      amount: 15000,
src/api/mockFallback.ts:      amount: 5000,
src/api/mockFallback.ts:      amount: 2500,
src/api/mockData/customers.ts:    notes: 'Key account, interested in equipment financing.',
src/api/mockData/customers.ts:    notes: 'Organic food producer, interested in sustainable financing options.',
src/api/mockData/customers.ts:    notes: 'Owns multiple businesses, interested in refinancing.',
src/api/mockData/customers.ts:    notes: 'Sells construction equipment, interested in partnership options.',
src/api/mockData/customers.ts:    notes: 'Real estate developer, interested in property financing.',
src/api/mockData/index.ts:      'Consider refinancing high-interest debt',
src/api/mockData/index.ts:      'Maintain current payment schedule',
src/api/mockData/index.ts:      amount: 15000,
src/api/mockData/index.ts:      amount: 5000,
src/api/mockData/index.ts:      amount: 2500,
src/api/ShieldAuthConnector.ts:   * Generate an authentication URL for user login
src/api/ShieldAuthConnector.ts:      amount: number;
src/api/smartMatchApi.ts:  rate: number;
src/api/smartMatchApi.ts:  interestRate?: number;
src/api/smartMatchApi.ts:    rate: 5.49,
src/api/smartMatchApi.ts:    interestRate: 5.49,
src/api/smartMatchApi.ts:    rate: 6.24,
src/api/smartMatchApi.ts:    interestRate: 6.24,
src/api/smartMatchApi.ts:    rate: 4.99,
src/api/smartMatchApi.ts:    interestRate: 4.99,
src/api/evaReportApi.ts:    description: 'Analysis of credit history, payment behavior, and overall credit profile',
src/api/evaReportApi.ts:          value: '0 missed payments',
src/api/evaReportApi.ts:          description: 'No missed payments in last 24 months',
src/api/evaReportApi.ts:          description: 'Good payment history on equipment loans',
src/api/evaReportApi.ts:          description: 'Excellent payment history',
src/api/evaReportApi.ts:          description: 'High utilization rate (>80%)',
src/api/evaReportApi.ts:          description: 'High occupancy rate (>90%)',
src/api/evaReportApi.ts:          description: 'Average CAP rate for property type',
src/api/evaReportApi.ts:          description: 'Average depreciation rate',
src/api/evaReportApi.ts:          value: 'Moderate',
src/api/evaReportApi.ts:          description: 'Low vacancy rates in the area',
src/api/evaReportApi.ts:          description: 'Stable interest rate environment expected',
src/api/evaReportApi.ts:    description: 'Evaluation of customer retention strategies and history',
src/api/evaReportApi.ts:          description: 'Acceptable churn rate, but room for improvement',
src/api/evaReportApi.ts:          description: 'Strong service contract renewal rate',
src/api/evaReportApi.ts:          description: 'Good rate of equipment upgrades by existing customers',
src/api/evaReportApi.ts:          description: 'Average lease renewal rate',
src/api/evaReportApi.ts:   * Generate and download a PDF report
src/api/evaReportApi.ts:   * In a real application, this would call an API endpoint that generates
src/api/evaReportApi.ts:  async generatePdfReport(
src/api/evaReportApi.ts:    // 1. Call an API endpoint to generate the PDF
src/api/mockBackendService.ts:  amount: number;
src/api/mockBackendService.ts:  interestRate: number;
src/api/mockBackendService.ts:    interestRate: number;
src/api/mockBackendService.ts:    amount: 250000,
src/api/mockBackendService.ts:    interestRate: 5.75,
src/api/mockBackendService.ts:      interestRate: 5.75
src/api/mockBackendService.ts:    amount: 100000,
src/api/mockBackendService.ts:    interestRate: 7.25,
src/api/mockBackendService.ts:      interestRate: 7.25
src/api/mockBackendService.ts:    amount: 750000,
src/api/mockBackendService.ts:    interestRate: 4.5,
src/api/mockBackendService.ts:      interestRate: 4.5
src/api/mockBackendService.ts:        "Similar commercial properties in this area have vacancy rates below 5%.",
src/api/mockBackendService.ts:    amount: number;
src/api/mockBackendService.ts:    amount: number;
src/api/mockBackendService.ts:    { type: 'Equipment Financing', count: 45, amount: 6250000 },
src/api/mockBackendService.ts:    { type: 'Working Capital', count: 32, amount: 3200000 },
src/api/mockBackendService.ts:    { type: 'Real Estate', count: 18, amount: 7200000 },
src/api/mockBackendService.ts:    { type: 'Expansion Loan', count: 15, amount: 750000 },
src/api/mockBackendService.ts:    { type: 'Inventory Financing', count: 14, amount: 100000 }
src/api/mockBackendService.ts:    { month: 'Jan', count: 8, amount: 1200000 },
src/api/mockBackendService.ts:    { month: 'Feb', count: 10, amount: 1500000 },
src/api/mockBackendService.ts:    { month: 'Mar', count: 15, amount: 2100000 },
src/api/mockBackendService.ts:    { month: 'Apr', count: 12, amount: 1800000 },
src/api/mockBackendService.ts:    { month: 'May', count: 18, amount: 2500000 },
src/api/mockBackendService.ts:    { month: 'Jun', count: 14, amount: 2000000 },
src/api/mockBackendService.ts:    { month: 'Jul', count: 16, amount: 2200000 },
src/api/mockBackendService.ts:    { month: 'Aug', count: 9, amount: 1300000 },
src/api/mockBackendService.ts:    { month: 'Sep', count: 7, amount: 950000 },
src/api/mockBackendService.ts:    { month: 'Oct', count: 6, amount: 750000 },
src/api/mockBackendService.ts:    { month: 'Nov', count: 5, amount: 650000 },
src/api/mockBackendService.ts:    { month: 'Dec', count: 4, amount: 550000 }
src/api/mockBackendService.ts:      'Rental income appears sustainable based on historical vacancy rates'
src/api/mockBackendService.ts:      interestRate: transaction.interestRate || 0
src/api/mockBackendService.ts:export const generateTransactionAnalysis = async (transactionId: string): Promise<{ summary: string, insights: string[] }> => {
src/api/mockBackendService.ts:    summary: `Analysis of ${transaction.applicantData.name}'s ${transaction.type} application for $${transaction.amount.toLocaleString()} shows a ${transaction.riskProfile?.overallScore || 'N/A'} risk score with ${transaction.riskProfile?.financialRatios.filter(r => r.status === 'good').length || 0} positive financial indicators.`,
src/api/mockBackendService.ts:      `The requested ${transaction.type.toLowerCase()} of $${transaction.amount.toLocaleString()} represents an appropriate financing level for a business of this size and maturity.`,
src/api/mockBackendService.ts:    generateTransactionAnalysis
src/api/CachedBaseService.ts:export interface CacheStrategy {
src/api/CachedBaseService.ts:  protected cacheStrategy: CacheStrategy;
src/api/CachedBaseService.ts:    cacheStrategy?: Partial<CacheStrategy>
src/api/CachedBaseService.ts:    this.cacheStrategy = {
src/api/CachedBaseService.ts:      ...cacheStrategy,
src/api/CachedBaseService.ts:   * Generate cache key for entity
src/api/CachedBaseService.ts:   * Generate cache key for list operations
src/api/CachedBaseService.ts:    if (this.cacheStrategy.read && !options.forceRefresh) {
src/api/CachedBaseService.ts:    if (response.success && response.data && this.cacheStrategy.write) {
src/api/CachedBaseService.ts:          ttl: options.ttl || this.cacheStrategy.ttl,
src/api/CachedBaseService.ts:    if (this.cacheStrategy.read && !options.forceRefresh) {
src/api/CachedBaseService.ts:    if (response.success && response.data && this.cacheStrategy.write) {
src/api/CachedBaseService.ts:          ttl: options.ttl || this.cacheStrategy.ttl,
src/api/CachedBaseService.ts:    if (response.success && this.cacheStrategy.invalidateOnUpdate) {
src/api/CachedBaseService.ts:    if (response.success && response.data && this.cacheStrategy.write) {
src/api/CachedBaseService.ts:          ttl: options.ttl || this.cacheStrategy.ttl,
src/api/CachedBaseService.ts:    if (response.success && this.cacheStrategy.invalidateOnUpdate) {
src/api/CachedBaseService.ts:      if (response.data && this.cacheStrategy.write) {
src/api/CachedBaseService.ts:            ttl: options.ttl || this.cacheStrategy.ttl,
src/api/CachedBaseService.ts:    if (response.success && this.cacheStrategy.invalidateOnUpdate) {
src/api/CachedBaseService.ts:    if (this.cacheStrategy.read && !options.forceRefresh) {
src/api/CachedBaseService.ts:    if (response.success && response.data && this.cacheStrategy.write) {
src/api/CachedBaseService.ts:          ttl: options.ttl || this.cacheStrategy.ttl,
src/api/CachedBaseService.ts:      return cacheService.set(cacheKey, item, { ttl: ttl || this.cacheStrategy.ttl });
src/api/apiService.ts:// which is now maintained separately from the frontend codebase.
src/api/apiService.ts:// API base URL - points to the separate backend service
src/api/creditAnalysisApi.ts:      'Your portfolio has a moderate risk level with a Sharpe ratio of 0.85. The concentration in technology stocks (42% of holdings) increases volatility. Consider diversifying across more sectors and including defensive assets.',
src/api/creditAnalysisApi.ts:    query: 'Suggest risk mitigation strategies',
src/api/creditAnalysisApi.ts:      'To mitigate your financial risks: 1) Reduce debt-to-equity ratio by paying down high-interest loans, 2) Improve liquidity by optimizing inventory management, 3) Diversify customer base to reduce concentration risk, 4) Consider hedging against key commodity price fluctuations relevant to your business.',
src/api/creditAnalysisApi.ts:      'Your debt to equity ratio is 2.3, which is higher than the industry benchmark of 1.5. This suggests that your company is using more debt financing than equity, which could increase financial risk. Consider strategies to either reduce debt or increase equity to improve this ratio.',
src/api/creditAnalysisApi.ts:    source: 'Risk Mitigation Strategies for SMEs',
src/api/creditAnalysisApi.ts:const generateCacheKey = (context: ModelContextProtocol): string => {
src/api/creditAnalysisApi.ts:    const cacheKey = generateCacheKey(context);
src/api/creditAnalysisApi.ts:        'Consider working capital optimization strategy',
src/api/creditAnalysisApi.ts:    // Generate a mock response based on the incoming message
src/api/documentVerificationApi.ts:    // Generate extracted text based on document type
src/api/documentVerificationApi.ts:            interestRate: '4.5%',
src/api/documentVerificationApi.ts:          'BUSINESS PLAN\n\nEXECUTIVE SUMMARY\n\nCompany: [Company Name]\nIndustry: [Industry]\nMission: [Mission Statement]\n\nOur company provides innovative solutions to address [problem] by offering [product/service]. The market opportunity is estimated at $X billion, with an annual growth rate of X%. Our competitive advantage is based on [unique value proposition].';
src/api/services/enhancedTransactionService.ts:  amount: z.number().positive(),
src/api/services/enhancedTransactionService.ts:  interestRate: z.number().optional(),
src/api/services/enhancedTransactionService.ts:  amount: number;
src/api/services/enhancedTransactionService.ts:  interestRate?: number;
src/api/services/enhancedTransactionService.ts:  amountRange?: {
src/api/services/enhancedTransactionService.ts:    if (Object.keys(filters).length <= 1 && this.cacheStrategy.read) {
src/api/services/enhancedTransactionService.ts:      await cacheService.set(cacheKey, mockTransactions, { ttl: this.cacheStrategy.ttl });
src/api/services/enhancedTransactionService.ts:      await cacheService.set(cacheKey, response.data, { ttl: this.cacheStrategy.ttl });
src/api/services/enhancedTransactionService.ts:   * Get current user ID (integrate with auth system)
src/api/services/enhancedTransactionService.ts:   * Generate mock transactions
src/api/services/enhancedTransactionService.ts:        amount: 50000,
src/api/services/enhancedTransactionService.ts:        interestRate: 5.5,
src/api/services/enhancedTransactionService.ts:        amount: 25000,
src/api/services/enhancedTransactionService.ts:        interestRate: 7.2,
src/api/services/enhancedTransactionService.ts:   * Generate mock transaction
src/api/services/enhancedTransactionService.ts:      amount: 50000,
src/api/services/enhancedTransactionService.ts:      interestRate: 5.5,
src/api/services/enhancedTransactionService.ts:   * Generate mock transaction progress
src/api/services/enhancedTransactionService.ts:   * Generate mock transaction documents
src/api/services/enhancedTransactionService.ts:   * Generate mock transaction statistics
src/api/services/dealService.ts:  amount: number;
src/api/services/dealService.ts:  rate?: number;
src/api/services/dealService.ts:    amount: 250000,
src/api/services/dealService.ts:    rate: 7.5,
src/api/services/dealService.ts:    notes: 'Customer interested in financing new manufacturing equipment.',
src/api/services/dealService.ts:    amount: 100000,
src/api/services/dealService.ts:    rate: 8.2,
src/api/services/dealService.ts:    amount: 750000,
src/api/services/dealService.ts:    rate: 6.75,
src/api/services/dealService.ts:  amount: z.number().positive('Amount must be greater than 0'),
src/api/services/dealService.ts:  rate: z.number().min(0).max(100).optional(),
src/api/services/dealService.ts:          filteredDeals = filteredDeals.filter(deal => deal.amount >= filters.minAmount!);
src/api/services/dealService.ts:          filteredDeals = filteredDeals.filter(deal => deal.amount <= filters.maxAmount!);
src/api/services/userProfileService.ts:      // Generate mock URL for testing
src/api/transactionService.ts:  // Generate a new ID
src/api/mockData.ts:  amount: number;
src/api/mockData.ts:// Helper function to generate a random date in the last 30 days
src/api/mockData.ts:    amount: 250000,
src/api/mockData.ts:    amount: 1200000,
src/api/mockData.ts:    amount: 100000,
src/api/mockData.ts:    amount: 175000,
src/api/mockData.ts:    amount: 75000,
src/api/mockData.ts:    recommendation: 'Focus on cost reduction strategies or pricing adjustments to improve margins.',
src/api/mockData.ts:    description: 'Monthly payment of $4,320 received from LMN Enterprises',
src/pages/CustomerContactManagement.tsx:              amount: 250000,
src/pages/CustomerContactManagement.tsx:              amount: 100000,
src/pages/CustomerContactManagement.tsx:                        <div>Amount: ${transaction.amount.toLocaleString()}</div>
src/pages/FormsList.tsx:      description: 'Broker verification and payment',
src/pages/FormsList.tsx:      id: 'lender-payment',
src/pages/FormsList.tsx:      path: '/forms/lender-payment',
src/pages/customerRetention/CustomerRetentionContacts.tsx:    // Generate a temporary ID
src/pages/customerRetention/CustomerRetentionContacts.tsx:    // Generate a temporary ID
src/pages/customerRetention/CustomerRetentionCommitments.tsx:  type: 'agreement' | 'contract' | 'subscription' | 'recurring_payment' | 'other';
src/pages/customerRetention/CustomerRetentionCommitments.tsx:      notes: 'Customer has expressed interest in extending to premium tier next renewal',
src/pages/customerRetention/CustomerRetentionCommitments.tsx:  const formatCurrency = (amount: number): string => {
src/pages/customerRetention/CustomerRetentionCommitments.tsx:    }).format(amount);
src/pages/customerRetention/CustomerRetentionCommitments.tsx:      recurring_payment: { color: 'bg-teal-100 text-teal-800', label: 'Recurring Payment' },
src/pages/customerRetention/CustomerRetentionCommitments.tsx:                <option value="recurring_payment">Recurring Payments</option>
src/pages/customerRetention/CustomerRetentionCommitments.tsx:                      <option value="recurring_payment">Recurring Payment</option>
src/pages/KYCVerificationDemo.tsx:          This page demonstrates the KYC (Know Your Customer) verification flow that can be
src/pages/KYCVerificationDemo.tsx:          integrated into transaction processes to verify user identity in compliance with financial
src/pages/Dashboard.tsx:    amount: 250000,
src/pages/Dashboard.tsx:    amount: 100000,
src/pages/Dashboard.tsx:    amount: 750000,
src/pages/Dashboard.tsx:    amount: 500000,
src/pages/Dashboard.tsx:    amount: 175000,
src/pages/Dashboard.tsx:      amount: 1250000,
src/pages/Dashboard.tsx:      amount: 750000,
src/pages/Dashboard.tsx:      amount: 120000,
src/pages/Dashboard.tsx:      amount: 75000,
src/pages/Dashboard.tsx:      amount: 950000,
src/pages/Dashboard.tsx:      amount: 320000,
src/pages/Dashboard.tsx:      amount: 85000,
src/pages/Dashboard.tsx:      amount: 195000,
src/pages/CalendarIntegration.tsx:      conferenceLink: `https://meet.google.com/generated-link-${Math.random().toString(36).substring(2, 7)}`,
src/pages/CalendarIntegration.tsx:                        <p className="text-xs text-gray-500">For Strategy Meeting on Friday</p>
src/pages/CalendarIntegration.tsx:                        Generate PDF Summary
src/pages/SmartMatchPage.tsx:  // Get loan amount from the current transaction or default to 100000
src/pages/SmartMatchPage.tsx:  const loanAmount = currentTransaction?.amount || 100000;
src/pages/SmartMatchPage.tsx:    maxDownPayment: loanAmount * 0.2, // 20% down payment
src/pages/SmartMatchPage.tsx:    monthlyBudget: loanAmount / 48, // Rough estimate for monthly payment
src/pages/SmartMatchPage.tsx:    yearlyRevenue: loanAmount * 3, // 3x the loan amount
src/pages/SmartMatchPage.tsx:    cashOnHand: loanAmount * 0.3, // 30% of the loan amount
src/pages/SmartMatchPage.tsx:    collateralValue: loanAmount * 1.25, // 125% of the loan amount
src/pages/SmartMatchPage.tsx:  // Handle matches being generated
src/pages/SmartMatchPage.tsx:  const handleMatchesGenerated = (generatedMatches: DealStructureMatch[]) => {
src/pages/SmartMatchPage.tsx:    setMatches(generatedMatches);
src/pages/SmartMatchPage.tsx:    console.log('Matches generated:', generatedMatches);
src/pages/SmartMatchPage.tsx:              onMatchesGenerated={handleMatchesGenerated}
src/pages/Transactions.tsx:  status: 'pending' | 'generated' | 'sent' | 'signed' | 'verified';
src/pages/Transactions.tsx:        description: 'Maintain current property tax payments',
src/pages/Transactions.tsx:  // Filter applicable templates based on transaction type, amount, etc.
src/pages/Transactions.tsx:    // Check amount range if specified
src/pages/Transactions.tsx:    if (template.minAmount && transaction.amount < template.minAmount) {
src/pages/Transactions.tsx:    if (template.maxAmount && transaction.amount > template.maxAmount) {
src/pages/Transactions.tsx:          // Mark it as generated since we have the approved deal
src/pages/Transactions.tsx:            status: 'generated',
src/pages/Transactions.tsx:            status: 'generated',
src/pages/Transactions.tsx:  const generateDocuments = () => {
src/pages/Transactions.tsx:          status: 'generated',
src/pages/Transactions.tsx:      // Generate mock blockchain transaction ID
src/pages/Transactions.tsx:      case 'generated':
src/pages/Transactions.tsx:            Generated
src/pages/Transactions.tsx:  const allDocumentsGenerated = documentList.every(doc => doc.status !== 'pending');
src/pages/Transactions.tsx:                Select templates based on transaction type, amount, and structure to automatically
src/pages/Transactions.tsx:          Generate, sign, and securely store transaction documents on blockchain
src/pages/Transactions.tsx:                        disabled={loading || allDocumentsGenerated}
src/pages/Transactions.tsx:                        onClick={generateDocuments}
src/pages/Transactions.tsx:                          loading || allDocumentsGenerated
src/pages/Transactions.tsx:                        {loading ? 'Processing...' : 'Generate All'}
src/pages/Transactions.tsx:                        disabled={loading || !allDocumentsGenerated || allDocumentsSent}
src/pages/Transactions.tsx:                          loading || !allDocumentsGenerated || allDocumentsSent
src/pages/Transactions.tsx:                                {doc.status === 'generated' && (
src/pages/Transactions.tsx:                          Smart contracts automatically enforce covenant compliance and payment
src/pages/Transactions.tsx:                          disabled={!allDocumentsGenerated}
src/pages/Transactions.tsx:                            allDocumentsGenerated
src/pages/Transactions.tsx:                    ${currentTransaction.amount?.toLocaleString()}
src/pages/Transactions.tsx:                          {currentTransaction.approvedDeal.rate}%
src/pages/Transactions.tsx:                          {formatCurrency(currentTransaction.approvedDeal.payment)}/mo
src/pages/Transactions.tsx:                  disabled={!allDocumentsGenerated || !blockchainDocumentVerified}
src/pages/Transactions.tsx:                    allDocumentsGenerated && blockchainDocumentVerified
src/pages/Transactions.tsx:                  {allDocumentsGenerated && blockchainDocumentVerified
src/pages/Transactions.tsx:                    className={`flex-shrink-0 h-5 w-5 rounded-full ${allDocumentsGenerated ? 'bg-green-500' : 'bg-gray-200'}`}
src/pages/Transactions.tsx:                      className={`text-sm ${allDocumentsGenerated ? 'text-green-800' : 'text-gray-500'}`}
src/pages/Transactions.tsx:                      1. Generate closing documents
src/pages/PostClosingCustomers.tsx:      tags: ['high-producer', 'multiple-deals', 'strategic'],
src/pages/PostClosingCustomers.tsx:                Maximize customer lifetime value with strategic follow-ups and cross-selling
src/pages/PostClosingCustomers.tsx:                      Retention Strategy Suggestions
src/pages/FormTemplate.tsx:      description: 'Vendor verification and payment details form',
src/pages/FormTemplate.tsx:      description: 'Broker verification and payment details form',
src/pages/FormTemplate.tsx:      id: 'lender-payment',
src/pages/TermRequestDetailsGeneral.tsx:          paymentFrequency: 'monthly' as const,
src/pages/TermRequestDetailsGeneral.tsx:          prepaymentPenalty: false,
src/pages/DealStructuring.tsx:          amount: location.state.amount || 1250000,
src/pages/DealStructuring.tsx:            amount: location.state.amount || 1250000
src/pages/CustomAgentDemo.tsx:                This page demonstrates the custom agent creation and management functionality in the
src/pages/TermRequestDetailsRealEstate.tsx:          estimatedInterestRate: 5.5, // Typically lower rates for real estate
src/pages/TermRequestDetailsRealEstate.tsx:          paymentFrequency: 'monthly' as const,
src/pages/TermRequestDetailsRealEstate.tsx:          prepaymentPenalty: true,
src/pages/TermRequestDetailsRealEstate.tsx:          prepaymentPenaltyTerms: 'Declining prepayment penalty over first 5 years',
src/pages/TermRequestDetailsRealEstate.tsx:          budgetedDownPaymentPercentage: 25, // Typical commercial real estate down payment
src/pages/risk-assessment/eva-report/index.tsx:  // Function to generate the full analysis
src/pages/risk-assessment/eva-report/index.tsx:  const handleGenerateFullAnalysis = useCallback(async () => {
src/pages/risk-assessment/eva-report/index.tsx:          'Insufficient credits. Please purchase more credits to generate a full analysis.'
src/pages/risk-assessment/eva-report/index.tsx:  // Check for auto-generate request
src/pages/risk-assessment/eva-report/index.tsx:    // If navigation state includes autoGenerateFullReport flag, attempt to auto-generate
src/pages/risk-assessment/eva-report/index.tsx:    if (navigationState?.autoGenerateFullReport && !showFullAnalysis && availableCredits > 0) {
src/pages/risk-assessment/eva-report/index.tsx:      handleGenerateFullAnalysis();
src/pages/risk-assessment/eva-report/index.tsx:  }, [navigationState, showFullAnalysis, availableCredits, handleGenerateFullAnalysis]);
src/pages/risk-assessment/eva-report/index.tsx:    // In a real application, this would generate a PDF or other document format
src/pages/risk-assessment/eva-report/index.tsx:          onClick={handleGenerateFullAnalysis}
src/pages/risk-assessment/eva-report/index.tsx:              Generate Full Analysis
src/pages/risk-assessment/eva-report/index.tsx:                            variables, generate the full analysis.
src/pages/risk-assessment/eva-report/index.tsx:                            85/100 - Excellent payment history
src/pages/risk-assessment/eva-report/index.tsx:                              Moderate
src/pages/risk-assessment/eva-report/index.tsx:                        market conditions. The borrower demonstrates strong repayment capacity with
src/pages/Commitments.tsx:  amount: number;
src/pages/Commitments.tsx:      amount: 1250000,
src/pages/Commitments.tsx:      amount: 450000,
src/pages/Commitments.tsx:      amount: 750000,
src/pages/Commitments.tsx:      amount: 350000,
src/pages/Commitments.tsx:      amount: 850000,
src/pages/Commitments.tsx:  const formatCurrency = (amount: number) => {
src/pages/Commitments.tsx:    }).format(amount);
src/pages/Commitments.tsx:                        {formatCurrency(commitment.amount)}
src/pages/PortfolioNavigatorPage.tsx:  [AssetClass.CORPORATE_BONDS]: 'Corporate Bonds',
src/pages/PortfolioNavigatorPage.tsx:const generateMockAssets = (): Asset[] => {
src/pages/PortfolioNavigatorPage.tsx:  // Helper to generate random date in the last 30 days
src/pages/PortfolioNavigatorPage.tsx:  // Generate 2-3 assets for each class
src/pages/PortfolioNavigatorPage.tsx:          depreciationRate: Math.random() * 25, // 0-25% depreciation rate
src/pages/PortfolioNavigatorPage.tsx:// Helper to generate appropriate asset names
src/pages/PortfolioNavigatorPage.tsx:      return ['Corporate Bond Portfolio', 'Investment Grade Bonds', 'High-Yield Bond Fund'][
src/pages/PortfolioNavigatorPage.tsx:      return ['Unsecured CP Portfolio', 'Short-Term Notes', 'Corporate Promissory Notes'][
src/pages/PortfolioNavigatorPage.tsx:// Helper to generate appropriate asset subclasses
src/pages/PortfolioNavigatorPage.tsx:// Helper to generate owner names
src/pages/PortfolioNavigatorPage.tsx:    'Strategic Wealth Partners',
src/pages/PortfolioNavigatorPage.tsx:  const [mockAssets] = useState<Asset[]>(generateMockAssets());
src/pages/PortfolioNavigatorPage.tsx:      // Generate mock assets
src/pages/PortfolioNavigatorPage.tsx:      const mockAssets = generateMockAssets();
src/pages/DiagnosticPage.tsx:                      {currentTransaction?.amount?.toLocaleString()}
src/pages/CreditApplication.tsx:      case 'lender-payment-instructions':
src/pages/ExampleTransactions.tsx:        amount: 350000,
src/pages/ExampleTransactions.tsx:          rate: 5.2,
src/pages/ExampleTransactions.tsx:        amount: 250000,
src/pages/ExampleTransactions.tsx:          rate: 6.5,
src/pages/ExampleTransactions.tsx:        amount: 1200000,
src/pages/ExampleTransactions.tsx:          rate: 7.8,
src/pages/ExampleTransactions.tsx:          Generate example transactions to test the risk assessment system
src/pages/ExampleTransactions.tsx:                      ${transaction.amount.toLocaleString()}
src/pages/DemoMode.tsx:                    Determines loan amount, terms, and required documentation
src/pages/DemoMode.tsx:                  <p className="text-xs text-gray-500">Generates risk score and analysis report</p>
src/pages/DemoMode.tsx:                  <p className="text-xs text-gray-500">Generates and sends term sheet to borrower</p>
src/pages/AssetPortfolioDashboard.tsx:    amount: number;
src/pages/AssetPortfolioDashboard.tsx:    interestRate: number;
src/pages/AssetPortfolioDashboard.tsx:        amount: 2250000,
src/pages/AssetPortfolioDashboard.tsx:        interestRate: 4.5,
src/pages/AssetPortfolioDashboard.tsx:        amount: 950000,
src/pages/AssetPortfolioDashboard.tsx:        interestRate: 5.2,
src/pages/AssetPortfolioDashboard.tsx:        amount: 700000,
src/pages/AssetPortfolioDashboard.tsx:        interestRate: 4.8,
src/pages/AssetPortfolioDashboard.tsx:    name: 'Corporate Bond Portfolio',
src/pages/AssetPortfolioDashboard.tsx:    type: 'corporate_bonds',
src/pages/AssetPortfolioDashboard.tsx:        sum + (asset.linkedLoans?.reduce((loanSum, loan) => loanSum + loan.amount, 0) || 0),
src/pages/AssetPortfolioDashboard.tsx:        amount: 125000,
src/pages/AssetPortfolioDashboard.tsx:        amount: 138000,
src/pages/AssetPortfolioDashboard.tsx:        amount: -12500,
src/pages/AssetPortfolioDashboard.tsx:        amount: 32000,
src/pages/AssetPortfolioDashboard.tsx:                    <span className="text-sm font-medium text-yellow-600">Moderate</span>
src/pages/AssetPortfolioDashboard.tsx:                                  ${loan.amount.toLocaleString()} at {loan.interestRate}%
src/pages/AssetPortfolioDashboard.tsx:                          className={transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}
src/pages/AssetPortfolioDashboard.tsx:                          {transaction.amount >= 0 ? '+' : ''}$
src/pages/AssetPortfolioDashboard.tsx:                          {Math.abs(transaction.amount).toLocaleString()}
src/pages/AssetPortfolioDashboard.tsx:                      <span className="text-sm font-medium text-yellow-600">Moderate</span>
src/pages/AssetPortfolioDashboard.tsx:                      <span className="text-sm font-medium text-yellow-600">Moderate</span>
src/pages/AssetPortfolioDashboard.tsx:                      Your portfolio has moderate exposure to interest rate changes. Consider
src/pages/AssetPortfolioDashboard.tsx:                      hedging strategies or diversifying into fixed-income assets with varied
src/pages/AssetPortfolioDashboard.tsx:                      maturity profiles to mitigate potential impact from rate fluctuations.
src/pages/ProfileSettings.tsx:    // Mock: Load payment methods
src/pages/ProfileSettings.tsx:        amount: 49.99,
src/pages/ProfileSettings.tsx:        amount: 49.99,
src/pages/CustomerRetention.tsx:    notes: 'Strategic vendor partnership with quarterly review meetings',
src/pages/CustomerRetention.tsx:                          Integrate with Outlook Calendar for seamless scheduling
src/pages/PortfolioWallet.tsx:                <span>Total Generated Income</span>
src/pages/CommercialPaper.tsx:                  Federal Reserve signals potential rate adjustments in the coming quarter.
src/pages/EnhancedAssetPress.tsx:    depreciationRate?: number; // Annual depreciation rate
src/pages/EnhancedAssetPress.tsx:    forecastingScore?: number; // AI-generated forecasting score (1-100)
src/pages/EnhancedAssetPress.tsx:  // Helper function to get default depreciation rate based on asset type
src/pages/PortfolioWalletPage.tsx:      // Generate mock assets
src/pages/PortfolioWalletPage.tsx:      const mockAssets = generateMockAssets();
src/pages/PortfolioWalletPage.tsx:      // Generate mock marketplace listings
src/pages/PortfolioWalletPage.tsx:      const mockListings = generateMockListings(mockAssets);
src/pages/PortfolioWalletPage.tsx:      // Generate mock trade offers
src/pages/PortfolioWalletPage.tsx:      const mockOffers = generateMockOffers(mockAssets);
src/pages/PortfolioWalletPage.tsx:  // Generate mock assets (simplified for brevity)
src/pages/PortfolioWalletPage.tsx:  const generateMockAssets = (): Asset[] => {
src/pages/PortfolioWalletPage.tsx:  // Generate mock marketplace listings
src/pages/PortfolioWalletPage.tsx:  const generateMockListings = (assets: Asset[]): AssetListing[] => {
src/pages/PortfolioWalletPage.tsx:        name: 'Corporate Bond Portfolio',
src/pages/PortfolioWalletPage.tsx:        description: 'A diversified portfolio of corporate bonds from blue-chip companies.',
src/pages/PortfolioWalletPage.tsx:      description: 'Corporate bond portfolio with stable returns. Investment grade rating.',
src/pages/PortfolioWalletPage.tsx:  // Generate mock trade offers
src/pages/PortfolioWalletPage.tsx:  const generateMockOffers = (assets: Asset[]): TradeOffer[] => {
src/pages/PortfolioWalletPage.tsx:                          // Generate a mock transaction hash
src/pages/PortfolioWalletPage.tsx:                        <option value="CORPORATE_BONDS">Corporate Bonds</option>
src/pages/TermRequestDetailsEquipment.tsx:          estimatedInterestRate: 6.5, // Typically lower rates for secured equipment
src/pages/TermRequestDetailsEquipment.tsx:          paymentFrequency: 'monthly' as const,
src/pages/TermRequestDetailsEquipment.tsx:          prepaymentPenalty: true, // Common for equipment financing
src/pages/TermRequestDetailsEquipment.tsx:          budgetedDownPaymentPercentage: 15, // Typical equipment down payment
src/pages/Contacts.tsx:      notes: 'Was interested in fleet financing but decided to postpone until next fiscal year.',
src/pages/Contacts.tsx:      content: 'Sent information about Q1 2024 equipment financing options and rates.',
src/pages/Contacts.tsx:      content: 'Called to inquire about equipment financing rates for Q1 2024.',
src/pages/AssetPress.tsx:        rateRange: '4.5-7.2%',
src/pages/AssetPress.tsx:        rateRange: '6.0-9.5%',
src/pages/AssetPress.tsx:        rateRange: '4.8-8.0%',
src/pages/AssetPress.tsx:      { id: 'd1', name: 'Term Loan - 5yr', type: 'Term Loan', rate: '5.2%', term: '60 months' },
src/pages/AssetPress.tsx:      { id: 'd2', name: 'Equipment Lease', type: 'Finance Lease', rate: '6.5%', term: '48 months' },
src/pages/AssetPress.tsx:      { id: 'd3', name: 'Commercial Mortgage', type: 'Mortgage', rate: '4.8%', term: '180 months' },
src/pages/AssetPress.tsx:        performance: 'Moderate',
src/pages/AssetPress.tsx:                      {lender.rateRange}
src/pages/AssetPress.tsx:                      {instrument.rate}
src/pages/AssetPress.tsx:                Generate New Recommendations
src/pages/TransactionExecution.tsx:  amount: number;
src/pages/TransactionExecution.tsx:    amount: number;
src/pages/TransactionExecution.tsx:      const mockTransactions: Transaction[] = generateMockTransactions();
src/pages/TransactionExecution.tsx:  // Generate mock transaction data
src/pages/TransactionExecution.tsx:  const generateMockTransactions = (): Transaction[] => {
src/pages/TransactionExecution.tsx:        amount: 12500000,
src/pages/TransactionExecution.tsx:            amount: 12500000,
src/pages/TransactionExecution.tsx:            amount: 125000,
src/pages/TransactionExecution.tsx:      alert('Vendor payment authorized! Payment has been initiated to the vendor.');
src/pages/TransactionExecution.tsx:  // Handler for confirming payment (Vendor)
src/pages/TransactionExecution.tsx:        // Update relevant fields to indicate payment confirmed
src/pages/TransactionExecution.tsx:      console.error('Error confirming payment:', error);
src/pages/TransactionExecution.tsx:      alert('Failed to confirm payment. Please try again.');
src/pages/TransactionExecution.tsx:      alert('Invoices have been generated and sent to all parties!');
src/pages/TransactionExecution.tsx:                        {transaction.amount.toLocaleString()}
src/pages/TransactionExecution.tsx:                        ${selectedTransaction.amount.toLocaleString()}
src/pages/TransactionExecution.tsx:                            Release commission payments to brokers
src/pages/TransactionExecution.tsx:                          <p className="text-xs text-gray-500">Authorize payment to vendor</p>
src/pages/TransactionExecution.tsx:                            Confirm receipt of payment for goods/services
src/pages/TransactionExecution.tsx:                          Automatically generate and send invoices to all parties
src/pages/TransactionExecution.tsx:                      Covenants are automatically generated as part of the closing contracts and
src/pages/TransactionExecution.tsx:              Generate, sign, and securely store transaction documents on blockchain
src/services/LoadingService.ts:  | 'payment-processing'
src/services/LoadingService.ts:          thoughtProcess.push('Evaluating credit history and payment patterns...');
src/services/CreditsService.ts:  amount: number;
src/services/CreditsService.ts:          amount: DEFAULT_CREDITS,
src/services/CreditsService.ts:  addCredits(amount: number, description: string = 'Credits purchased'): UserCredits {
src/services/CreditsService.ts:      amount,
src/services/CreditsService.ts:      balance: credits.balance + amount,
src/services/CreditsService.ts:    amount: number,
src/services/CreditsService.ts:    if (credits.balance < amount) {
src/services/CreditsService.ts:      amount: -amount,
src/services/CreditsService.ts:      balance: credits.balance - amount,
src/services/blockchainService.ts:  amount: number;
src/services/blockchainService.ts:  amount: number;
src/services/blockchainService.ts:    name: 'Corporate Bonds',
src/services/blockchainService.ts:      'Time deposit product that provides higher interest rates than traditional savings accounts',
src/services/blockchainService.ts:      name: 'Corporate Bonds',
src/services/blockchainService.ts:    amount: 10000,
src/services/blockchainService.ts:    amount: 5000,
src/services/blockchainService.ts:    instrument: 'Corporate Bonds',
src/services/blockchainService.ts:    amount: 200,
src/services/blockchainService.ts:    amount: 50000,
src/services/blockchainService.ts:    name: 'Corporate Bond Token',
src/services/blockchainService.ts:    amount: 1000,
src/services/blockchainService.ts:    amount: 2500,
src/services/blockchainService.ts:          { name: 'amount', type: 'number', description: 'Face value amount' },
src/services/blockchainService.ts:          { name: 'amount', type: 'number', description: 'Face value amount' },
src/services/blockchainService.ts:          { name: 'interestRate', type: 'number', description: 'Annual interest rate percentage' },
src/services/blockchainService.ts:    amount: 500000,
src/services/blockchainService.ts:    description: 'Short-term corporate debt for working capital',
src/services/blockchainService.ts:    amount: 1000000,
src/services/blockchainService.ts:    amount: number
src/services/blockchainService.ts:    const total = (amount * price) / 100;
src/services/blockchainService.ts:      amount,
src/services/blockchainService.ts:    // Generate mock historical data based on current price
src/services/blockchainService.ts:      amount: assetData.amount,
src/services/blockchainService.ts:  transferFunds: async (amount: number, to: string): Promise<any> => {
src/services/blockchainService.ts:    if (!amount || amount <= 0) {
src/services/blockchainService.ts:      amount,
src/services/blockchainService.ts:    mockWalletBalance -= amount;
src/services/blockchainService.ts:  const { instrumentId, amount, price, type, total } = transaction;
src/services/blockchainService.ts:      const newBalance = existingAsset.balance + amount;
src/services/blockchainService.ts:          balance: amount,
src/services/blockchainService.ts:          value: (amount * price) / 100,
src/services/blockchainService.ts:      const proportionSold = amount / existingAsset.balance;
src/services/blockchainService.ts:      existingAsset.balance -= amount;
src/services/FilelockIntegrationService.ts: * Service to integrate Filelock document system with application requirements
src/services/RiskMapService.ts:   * Generate a mock risk analysis report
src/services/RiskMapService.ts:  generateMockAnalysis(): any {
src/services/RiskMapService.ts:        'Consider implementing automated payment systems'
src/services/DocumentTrackingService.ts:        message: 'Term sheet generated and sent for signatures',
src/services/DocumentSecurityService.ts:        requiredDocuments: ['loan_agreement_copy', 'payment_schedule'],
src/services/auditTrailService.ts:      id: this.generateAuditId(),
src/services/auditTrailService.ts:  private generateAuditId(): string {
src/services/DocumentGenerationService.ts:  rate: number;
src/services/DocumentGenerationService.ts:  paymentAmount: number;
src/services/DocumentGenerationService.ts:  // Generate PDF term sheet
src/services/DocumentGenerationService.ts:  async generateTermSheet(
src/services/DocumentGenerationService.ts:    // In a real implementation, this would call a backend API to generate the PDF
src/services/DocumentGenerationService.ts:      // 1. Generate the PDF
src/services/DocumentGenerationService.ts:      const { fileId, fileUrl } = await this.generateTermSheet(termSheetData);
src/services/DocumentGenerationService.ts:        title: 'Term Sheet Generated',
src/services/DocumentGenerationService.ts:        message: `Term sheet for ${termSheetData.borrowerName} has been successfully generated`,
src/services/CloudStorageService.ts:  // Generate 1-10 mock files
src/services/CloudStorageService.ts:  // Generate 1-10 mock files
src/services/FileVaultService.ts:      // Generate metadata
src/services/FileVaultService.ts:      // Generate file extension based on filename
src/services/cacheService.ts:   * Cache user credits and payment information
src/services/DocumentRequirements.ts:      description: 'Detailed inventory list with cost, market value, and turnover rates',
src/services/shieldLedgerService.ts:  // Generate a random hash to simulate the ledger hash
src/services/shieldLedgerService.ts:  // Generate 1-5 mock documents
src/services/TransactionService.ts:  amount: string;
src/services/TransactionService.ts:  { id: 'TX-123', name: 'Horizon Solutions Inc.', type: 'Equipment Loan', amount: '$1,000,000' },
src/services/TransactionService.ts:  { id: 'TX-124', name: 'Apex Manufacturing', type: 'Commercial Loan', amount: '$750,000' },
src/services/TransactionService.ts:  { id: 'TX-125', name: 'Summit Industries', type: 'Equipment Lease', amount: '$320,000' },
src/services/TransactionService.ts:  { id: 'TX-126', name: 'Coastal Enterprises', type: 'Working Capital', amount: '$180,000' },
src/contexts/ScoringContext.tsx:      categoryScores[categoryId] = Math.round((categoryScore / maxCategoryScore) * 100);
src/contexts/ScoringContext.tsx:    categoryScores.overall = Math.round((totalWeightedScore / totalPossibleWeightedScore) * 100);
src/test-redis-cache.ts:          ? Math.round((metrics.hits / (metrics.hits + metrics.misses)) * 100)
src/utils/financialCalculations.ts:  monthlyPayment = Math.round(monthlyPayment * 100) / 100;
src/utils/financialCalculations.ts:    totalInterest: Math.round(totalInterest * 100) / 100,
src/utils/financialCalculations.ts:    totalPayments: Math.round(totalPayments * 100) / 100,
src/utils/financialCalculations.ts:    loanAmount: Math.round(loanAmount * 100) / 100,
src/utils/financialCalculations.ts:    residualAmount: Math.round(residualAmount * 100) / 100,
src/utils/financialCalculations.ts:  return Math.max(0, Math.round(availableForNewPayment * 100) / 100);
src/utils/financialCalculations.ts:  return Math.round(totalAssetValue * 100) / 100;
src/utils/financialCalculations.ts:  return Math.round(apr * 100) / 100;
src/utils/performance.ts:      console.warn(`Slow operation detected: ${metric.name} (${metric.duration.toFixed(2)}ms)`, metric.metadata);
src/utils/dateUtils.ts:      return rtf.format(Math.round(diffInSeconds), 'second');
src/utils/dateUtils.ts:      return rtf.format(Math.round(diffInSeconds / 60), 'minute');
src/utils/dateUtils.ts:      return rtf.format(Math.round(diffInSeconds / 3600), 'hour');
src/utils/dateUtils.ts:      return rtf.format(Math.round(diffInSeconds / 86400), 'day');
src/utils/dateUtils.ts:      return rtf.format(Math.round(diffInSeconds / 2592000), 'month');
src/utils/dateUtils.ts:      return rtf.format(Math.round(diffInSeconds / 31536000), 'year');
src/utils/formValidation.ts:  const numValue = typeof value === 'string' ? parseFloat(value) : value;
src/utils/formValidation.ts:  const numValue = parseFloat(cleanValue);
src/utils/fileUtils.ts:  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
src/utils/financialUtils.ts:  return Math.round(value * 100) / 100;
src/utils/financialUtils.ts:  const parsed = parseFloat(cleaned);
src/utils/financialUtils.ts:  return Math.round(result * multiplier) / multiplier;
src/utils/financialUtils.ts:  return Math.round(value * 100) / 100;
src/utils/ComponentTester.tsx:                <div className="render-time">{result.renderTime.toFixed(2)}ms</div>
src/reportWebVitals.ts:      value: Math.round(name === 'CLS' ? delta * 1000 : delta),
src/components/demo/DemoWorkflowSimulator.tsx:          <span>Progress: {Math.round(progress)}%</span>
src/components/EVAAssistantChat.tsx:                              ({(file.size / 1024).toFixed(1)} KB)
src/components/credit/CreditCommitteeDashboard.tsx:                  return total ? Math.round((approved / total) * 100) : 0;
src/components/credit/CreditCommitteeDashboard.tsx:                  ? (decisionTimeData.reduce((sum, item) => sum + item.avgTime, 0) / decisionTimeData.length).toFixed(1)
src/components/credit/CreditCommitteeDashboard.tsx:                  return `$${(apps.reduce((sum, app) => sum + app.amount, 0) / 1000000).toFixed(1)}M`;
src/components/credit/CreditCommitteeDashboard.tsx:                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
src/components/credit/CreditCommitteeDashboard.tsx:                          : `${(application.ltv * 100).toFixed(1)}%`
src/components/credit/BusinessTaxReturns.tsx:                          Confidence: {(doc.parsedData.confidence * 100).toFixed(0)}%
src/components/credit/CreditRequestTermsDetails.tsx:        budgetedDownPaymentPercentage: Number(percentage.toFixed(2)),
src/components/credit/CreditRequestTermsDetails.tsx:    const percentage = parseFloat(e.target.value);
src/components/credit/CreditRequestTermsDetails.tsx:        budgetedDownPayment: Number(amount.toFixed(2)),
src/components/credit/CreditRequestTermsDetails.tsx:        [name]: parseFloat(value) || 0,
src/components/credit/DynamicFinancialStatements.tsx:                  `Average transaction size: $${(monthlyRevenue / 850).toFixed(2)}`,
src/components/credit/DynamicFinancialStatements.tsx:                  `Risk Score: ${riskScore} (${disputeRate.toFixed(2)}% dispute rate)`,
src/components/credit/DynamicFinancialStatements.tsx:                    `Dispute rate: ${disputeRate.toFixed(2)}% (Industry average: 0.84%)`,
src/components/credit/DynamicFinancialStatements.tsx:                `Average transaction size: $${(monthlyRevenue / 850).toFixed(2)}`,
src/components/credit/DynamicFinancialStatements.tsx:                `Risk Score: ${riskScore} (${disputeRate.toFixed(2)}% dispute rate)`,
src/components/credit/DynamicFinancialStatements.tsx:                  `Dispute rate: ${disputeRate.toFixed(2)}% (Industry average: 0.84%)`,
src/components/credit/DynamicFinancialStatements.tsx:            <span className="text-sm text-gray-500">{Math.round(generationProgress)}%</span>
src/components/credit/DynamicFinancialStatements.tsx:                      <div>Size: {(doc.fileSize / 1024 / 1024).toFixed(1)} MB</div>
src/components/credit/DynamicFinancialStatements.tsx:                    {Math.round(
src/components/credit/SalesManagerDashboard.tsx:              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
src/components/credit/SalesManagerDashboard.tsx:                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
src/components/credit/SafeForms/PersonalFinanceStatement.tsx:            ? parseFloat(value) || 0
src/components/credit/SafeForms/BusinessDebtSchedule.tsx:                        updateDebtItem(debt.id, 'originalAmount', parseFloat(e.target.value) || 0)
src/components/credit/SafeForms/BusinessDebtSchedule.tsx:                        updateDebtItem(debt.id, 'currentBalance', parseFloat(e.target.value) || 0)
src/components/credit/SafeForms/BusinessDebtSchedule.tsx:                        updateDebtItem(debt.id, 'interestRate', parseFloat(e.target.value) || 0)
src/components/credit/SafeForms/BusinessDebtSchedule.tsx:                        updateDebtItem(debt.id, 'monthlyPayment', parseFloat(e.target.value) || 0)
src/components/credit/SafeForms/BusinessDebtSchedule.tsx:                <div className="text-sm font-medium">${getTotalCurrentBalance().toFixed(2)}</div>
src/components/credit/SafeForms/BusinessDebtSchedule.tsx:                <div className="text-sm font-medium">${getTotalMonthlyPayment().toFixed(2)}</div>
src/components/credit/SafeForms/BrokerCommissionSplit.tsx:      const percentage = parseFloat(participant.percentage) || 0;
src/components/credit/SafeForms/CreditApplication.tsx:      const ownershipPercentage = parseFloat(primaryOwner.individualDetails.ownershipPercentage);
src/components/credit/SafeForms/LenderCommissionSplit.tsx:      const percentage = parseFloat(participant.percentage) || 0;
src/components/credit/SafeForms/AssetLedger.tsx:                        updateAssetItem(asset.id, 'purchasePrice', parseFloat(e.target.value) || 0)
src/components/credit/SafeForms/AssetLedger.tsx:                        updateAssetItem(asset.id, 'currentValue', parseFloat(e.target.value) || 0)
src/components/credit/SafeForms/AssetLedger.tsx:                <div className="text-sm font-medium">${getTotalAssetValue().toFixed(2)}</div>
src/components/credit/BankStatementVerification.tsx:    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
src/components/credit/BankStatementVerification.tsx:    else return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
src/components/credit/FinancialAccountConnector.tsx:    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
src/components/credit/FinancialAccountConnector.tsx:    else return (bytes / 1048576).toFixed(1) + ' MB';
src/components/credit/LoanProcessorDashboard.tsx:                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
src/components/credit/LienUCCManagement.tsx:                              amount: parseFloat(e.target.value) || 0,
src/components/credit/BusinessLegalDocuments.tsx:    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
src/components/credit/BusinessLegalDocuments.tsx:    else return (bytes / 1048576).toFixed(1) + ' MB';
src/components/credit/CreditUnderwriterDashboard.tsx:                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
src/components/credit/EnhancedDashboard.tsx:                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
src/components/credit/EnhancedDashboard.tsx:                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
src/components/credit/CollateralFiles.tsx:    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
src/components/credit/CollateralFiles.tsx:    else return (bytes / 1048576).toFixed(1) + ' MB';
src/components/credit/SafeForms.tsx:        mappedData.timeInBusiness = yearsInBusiness.toFixed(1);
src/components/credit/FinancialDocumentParser.tsx:      setProcessingProgress(Math.round(((i + 0.5) / totalDocuments) * 100));
src/components/credit/FinancialDocumentParser.tsx:      setProcessingProgress(Math.round(((i + 1) / totalDocuments) * 100));
src/components/credit/FinancialDocumentParser.tsx:          totalAssets: Math.round(500000 + Math.random() * 5000000),
src/components/credit/FinancialDocumentParser.tsx:          totalLiabilities: Math.round(300000 + Math.random() * 3000000),
src/components/credit/FinancialDocumentParser.tsx:          cashAndEquivalents: Math.round(50000 + Math.random() * 500000),
src/components/credit/FinancialDocumentParser.tsx:          accountsReceivable: Math.round(75000 + Math.random() * 250000),
src/components/credit/FinancialDocumentParser.tsx:          revenue: Math.round(1000000 + Math.random() * 10000000),
src/components/credit/FinancialDocumentParser.tsx:          grossProfit: Math.round(400000 + Math.random() * 3000000),
src/components/credit/FinancialDocumentParser.tsx:          netIncome: Math.round(100000 + Math.random() * 1000000),
src/components/credit/FinancialDocumentParser.tsx:          operatingExpenses: Math.round(300000 + Math.random() * 2000000),
src/components/credit/FinancialDocumentParser.tsx:        extractedData.averageMonthlyRevenue = Math.round(extractedData.revenue / monthsElapsed);
src/components/credit/FinancialDocumentParser.tsx:        extractedData.averageMonthlyExpenses = Math.round(
src/components/credit/FinancialDocumentParser.tsx:          reportedIncome: Math.round(250000 + Math.random() * 2000000),
src/components/credit/FinancialDocumentParser.tsx:          taxesPaid: Math.round(50000 + Math.random() * 500000),
src/components/credit/FinancialDocumentParser.tsx:          deductions: Math.round(20000 + Math.random() * 100000),
src/components/credit/FinancialDocumentParser.tsx:          accountBalance: Math.round(25000 + Math.random() * 250000),
src/components/credit/FinancialDocumentParser.tsx:          startingBalance: Math.round(20000 + Math.random() * 200000),
src/components/credit/FinancialDocumentParser.tsx:          deposits: Math.round(15000 + Math.random() * 150000),
src/components/credit/FinancialDocumentParser.tsx:          withdrawals: Math.round(10000 + Math.random() * 100000),
src/components/credit/FinancialDocumentParser.tsx:          totalAssets: Math.round(500000 + Math.random() * 5000000),
src/components/credit/FinancialDocumentParser.tsx:          totalLiabilities: Math.round(300000 + Math.random() * 3000000),
src/components/credit/FinancialDocumentParser.tsx:          revenue: Math.round(1000000 + Math.random() * 10000000),
src/components/credit/FinancialDocumentParser.tsx:          netIncome: Math.round(100000 + Math.random() * 1000000),
src/components/credit/FinancialDocumentParser.tsx:          debtToIncomeRatio: (0.3 + Math.random() * 0.5).toFixed(2),
src/components/credit/FinancialDocumentParser.tsx:    if (key === 'debtToIncomeRatio' && parseFloat(value) > 0.5) return true;
src/components/credit/FinancialDocumentParser.tsx:                                    {Math.round(doc.confidenceScore * 100)}%
src/components/credit/FinancialDocumentParser.tsx:                        {Math.round((getSelectedDocument()?.confidenceScore || 0) * 100)}%
src/components/credit/FinancialDocumentParser.tsx:                              {(getSelectedDocument()?.processingTime || 0).toFixed(0)}ms
src/components/credit/FinancialDocumentParser.tsx:                              {Math.round((getSelectedDocument()?.confidenceScore || 0) * 100)}%
src/components/CreditApplicationBlockchain.tsx:                                  {(Math.random() * 100000 + 50000).toFixed(0)}
src/components/CreditApplicationBlockchain.tsx:                                  Amount: ${(Math.random() * 100000 + 50000).toFixed(0)}
src/components/CreditApplicationBlockchain.tsx:                                  Amount: ${(Math.random() * 100000 + 50000).toFixed(0)}
src/components/CreditApplicationBlockchain.tsx:                                  Rate: {(Math.random() * 5 + 3).toFixed(2)}%
src/components/deal/AmortizationSchedule.tsx:      setDownPayment(Math.round(currentTransaction.amount * 0.1)); // Default 10% down
src/components/deal/AmortizationSchedule.tsx:    return value.toFixed(2) + '%';
src/components/deal/AmortizationSchedule.tsx:                  ({amount > 0 ? ((downPayment / amount) * 100).toFixed(1) : 0}% of total)
src/components/deal/AmortizationSchedule.tsx:                        {((amountFinanced / totalPayments) * 100).toFixed(1)}%)
src/components/deal/AmortizationSchedule.tsx:                        {((totalInterest / totalPayments) * 100).toFixed(1)}%)
src/components/deal/CustomFinancialProfileModal.tsx:      [field]: typeof value === 'string' ? parseFloat(value) || 0 : value,
src/components/deal/DealStructuring.tsx:          rate: Math.round((baseRate - amountFactor + (Math.random() * 0.3 - 0.15)) * 100) / 100,
src/components/deal/DealStructuring.tsx:          downPayment: Math.round((currentTransaction?.amount ?? 0) * 0.1),
src/components/deal/DealStructuring.tsx:            Math.round((baseRate - amountFactor + 0.35 + (Math.random() * 0.3 - 0.15)) * 100) / 100,
src/components/deal/DealStructuring.tsx:          downPayment: Math.round((currentTransaction?.amount ?? 0) * 0.1),
src/components/deal/DealStructuring.tsx:            Math.round((baseRate - amountFactor + 0.5 + (Math.random() * 0.3 - 0.15)) * 100) / 100,
src/components/deal/DealStructuring.tsx:          downPayment: Math.round((currentTransaction?.amount ?? 0) * 0.05),
src/components/deal/DealStructuring.tsx:            Math.round((baseRate - amountFactor + 0.25 + (Math.random() * 0.3 - 0.15)) * 100) / 100,
src/components/deal/DealStructuring.tsx:          downPayment: Math.round((currentTransaction?.amount ?? 0) * 0.1),
src/components/deal/PaymentCalculator.tsx:      setDownPayment(Math.round(currentTransaction.amount * 0.1)); // Default 10% down
src/components/deal/RateComparison.tsx:      setDownPayment(Math.round(currentTransaction.amount * 0.1)); // Default 10% down
src/components/deal/RateComparison.tsx:    return value.toFixed(2) + '%';
src/components/deal/RateComparison.tsx:                  ({amount > 0 ? ((downPayment / amount) * 100).toFixed(1) : 0}% of total)
src/components/deal/DealStructuringComponents.tsx:  return Math.round(payment * 100) / 100;
src/components/deal/DealStructuringComponents.tsx:          <span className="font-medium">{option.rate.toFixed(2)}%</span>
src/components/deal/DealStructuringComponents.tsx:            onChange={e => onChange('rate', parseFloat(e.target.value) || 0)}
src/components/deal/SmartMatchTool.tsx:        return Math.round(
src/components/deal/SmartMatchTool.tsx:        downPayment: Math.round(maxDownPayment * 0.8),
src/components/deal/SmartMatchTool.tsx:        downPaymentPercent: Math.round(((maxDownPayment * 0.8) / transactionAmount) * 100),
src/components/deal/SmartMatchTool.tsx:        residualValue: Math.round(transactionAmount * 0.1),
src/components/deal/SmartMatchTool.tsx:        downPayment: Math.round(maxDownPayment * 0.6),
src/components/deal/SmartMatchTool.tsx:        downPaymentPercent: Math.round(((maxDownPayment * 0.6) / transactionAmount) * 100),
src/components/deal/SmartMatchTool.tsx:        residualValue: Math.round(transactionAmount * 0.05),
src/components/deal/SmartMatchTool.tsx:        downPayment: Math.round(transactionAmount * 0.05),
src/components/deal/SmartMatchTool.tsx:        downPayment: Math.round(maxDownPayment),
src/components/deal/SmartMatchTool.tsx:        downPaymentPercent: Math.round((maxDownPayment / transactionAmount) * 100),
src/components/deal/SmartMatchTool.tsx:      [field]: typeof value === 'string' ? parseFloat(value) || 0 : value,
src/components/deal/SmartMatchTool.tsx:        setElapsedTime(Math.round((Date.now() - startTime) / 1000));
src/components/DocumentUploadModal.tsx:                        {(file.file.size / 1024 / 1024).toFixed(2)} MB
src/components/CreditApplicationForm.tsx:        parseFloat(primaryOwner.ownershipPercentage) < 0 ||
src/components/CreditApplicationForm.tsx:        parseFloat(primaryOwner.ownershipPercentage) > 100
src/components/CreditApplicationForm.tsx:        parseFloat(primaryOwner.ownershipPercentage) < 81 &&
src/components/CreditApplicationForm.tsx:        (sum, owner) => sum + (parseFloat(owner.ownershipPercentage) || 0),
src/components/CreditApplicationForm.tsx:        amount: parseFloat(formData.requestedAmount) || 100000,
src/components/CreditApplicationForm.tsx:            confidence: parseFloat(item.importance) * 100, // OSM importance as confidence score
src/components/broker/DealPipeline.tsx:                ? ((deals.filter(d => d.stage === 'funded').length / deals.length) * 100).toFixed(
src/components/customerRetention/ContactImport.tsx:                {(importFile.size / 1024).toFixed(2)} KB • {new Date().toLocaleDateString()}
src/components/asset/AssetInventoryManager.tsx:    if (filter.priceMin && asset.price < parseFloat(filter.priceMin)) {
src/components/asset/AssetInventoryManager.tsx:    if (filter.priceMax && asset.price > parseFloat(filter.priceMax)) {
src/components/asset/AssetInventoryManager.tsx:      [name]: name === 'price' ? parseFloat(value) : value,
src/components/asset/AssetInformationForm.tsx:    const numValue = typeof value === 'string' ? parseFloat(value) : value;
src/components/asset/AssetInformationForm.tsx:      marketValue: assetData.marketValue ? parseFloat(assetData.marketValue.toString()) : 0,
src/components/asset/AssetInformationForm.tsx:        ? parseFloat(assetData.annualRentalIncome.toString())
src/components/AIChatAdvisor.tsx:          <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(0)} KB</p>
src/components/AIChatAdvisor.tsx:              <p className="text-xs text-gray-500">{(attachment.size / 1024).toFixed(0)} KB</p>
src/components/DocumentVerificationSystem.tsx:    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
src/components/DocumentVerificationSystem.tsx:    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
src/components/DocumentVerificationSystem.tsx:              Confidence Score: {Math.round(check.confidenceScore * 100)}%
src/components/DocumentVerificationSystem.tsx:                    {Math.round(
src/components/DocumentVerificationSystem.tsx:                      Confidence Score: {Math.round(verificationResults.confidenceScore * 100)}%
src/components/layout/UniversalNavigation.tsx:                            handleTransactionFilterChange('minAmount', parseFloat(e.target.value))
src/components/layout/UniversalNavigation.tsx:                            handleTransactionFilterChange('maxAmount', parseFloat(e.target.value))
src/components/OwnerManager.tsx:      return sum + (parseFloat(owner.ownershipPercentage) || 0);
src/components/OwnerManager.tsx:          ? parseFloat(deletedOwner.ownershipPercentage) || 0
src/components/OwnerManager.tsx:            (sum, owner) => sum + (parseFloat(owner.ownershipPercentage) || 0),
src/components/OwnerManager.tsx:              const currentPercentage = parseFloat(owner.ownershipPercentage) || 0;
src/components/OwnerManager.tsx:                ownershipPercentage: newPercentage.toFixed(2), // Maintain precision
src/components/OwnerManager.tsx:              ownershipPercentage: Math.min(100, equalShare).toFixed(2),
src/components/OwnerManager.tsx:      ownershipPercentage: suggestedOwnership.toFixed(2), // Ensure string with precision
src/components/document/DocumentUpload.tsx:            Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)
src/components/document/DocumentViewer.tsx:      const fileSizeInMB = file.size ? (file.size / 1024 / 1024).toFixed(2) : 'unknown';
src/components/document/DocumentViewer.tsx:                          {file.size ? `${Math.round(file.size / 1024)} KB` : 'Unknown'}
src/components/document/TransactionDocumentVault.tsx:                        {document.size ? `${(document.size / 1024).toFixed(1)} KB` : 'Unknown size'}{' '}
src/components/document/FilelockBlockchainService.tsx:              {file.size ? `${Math.round(file.size / 1024)} KB` : 'Unknown size'} • Last modified:{' '}
src/components/document/CloudStorageConnector.tsx:                        ? `${Math.round(file.size / 1024)} KB`
src/components/document/SharedWithMe.tsx:    return `${size.toFixed(1)} ${units[unitIndex]}`;
src/components/document/ShareDocumentModal.tsx:                  {file.size ? `${Math.round(file.size / 1024)} KB` : ''} •{' '}
src/components/document/FileExplorer.tsx:    return `${size.toFixed(1)} ${units[unitIndex]}`;
src/components/document/TransactionDocumentViewer.tsx:    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
src/components/document/TransactionDocumentViewer.tsx:    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
src/components/document/ShieldVaultDashboard.tsx:                              {file.size ? `${Math.round(file.size / 1024)} KB` : 'Unknown size'}
src/components/document/DocumentList.tsx:                        {(selectedFile.size / 1024).toFixed(2)} KB
src/components/CreditAnalysisChatInterface.tsx:          <p className="text-xs text-gray-500">{Math.round(file.size / 1024)} KB</p>
src/components/CreditAnalysisChatInterface.tsx:      <p className="text-xs text-gray-500">{Math.round(attachment.size / 1024)} KB</p>
src/components/EnhancedAddressInput.tsx:            confidence: parseFloat(item.importance) * 100 || 0,
src/components/SmartMatching.tsx:            dealMatchRate: Math.round(((newStats.mutualMatches + 1) / newStats.rightSwipes) * 100),
src/components/borrower/SimplifiedBorrowerInterface.tsx:          Math.round(((progress.currentStep + 1) / progress.totalSteps) * 100)
src/components/borrower/SimplifiedBorrowerInterface.tsx:          Math.round(((progress.currentStep - 1) / progress.totalSteps) * 100)
src/components/dashboard/DueDiligenceProgress.tsx:    return Math.round((totalCompleted / total) * 100);
src/components/dashboard/DueDiligenceProgress.tsx:          const progress = Math.round((category.completed / category.total) * 100);
src/components/dashboard/DynamicDashboard.tsx:            value={`$${(metrics.dealVolume / 1000000).toFixed(1)}M`}
src/components/testing/AutomatedTestManager.ts:      console.log(`Auto-fixed issues: ${results.filter(r => r.autoFixed).length}`);
src/components/testing/ComponentTester.tsx:                <div className="render-time">{result.renderTime.toFixed(2)}ms</div>
src/components/testing/DiagnosticService.ts:  autoFixed?: boolean;
src/components/testing/DiagnosticService.ts:        autoFixed: fixedData,
src/components/testing/DiagnosticService.ts:      console.log(`Auto-fixed ${results.filter(r => r.autoFixed).length} issues`);
src/components/blockchain/BlockchainWidget.tsx:        {Math.abs(change).toFixed(2)}%
src/components/blockchain/BlockchainWidget.tsx:                    {((asset.value / portfolio.totalValue) * 100).toFixed(1)}% of portfolio
src/components/blockchain/BlockchainWidget.tsx:                  <p className="text-xs text-gray-500">${tx.price.toFixed(2)} per unit</p>
src/components/blockchain/BlockchainWidget.tsx:                            {((instrument.value / portfolio.totalValue) * 100).toFixed(1)}%
src/components/blockchain/BlockchainWidget.tsx:                          <p className="text-sm text-gray-500">${tx.price.toFixed(2)} per unit</p>
src/components/blockchain/BlockchainVerification.tsx:                  <span>Calculating proof of work: {Math.round(verificationProgress)}%</span>
src/components/blockchain/AssetTrackingDashboard.tsx:          <span>{Math.round(progress)}%</span>
src/components/blockchain/AssetPressFeature.tsx:      [name]: name === 'amount' ? parseFloat(value) || 0 : value,
src/components/blockchain/AssetVerificationDashboard.tsx:      return Math.round((asset.verificationStep / 6) * 100);
src/components/blockchain/EnhancedAssetDetails.tsx:                        setNewLienHolder({ ...newLienHolder, amount: parseFloat(e.target.value) })
src/components/blockchain/UniCurrency.tsx:                                    ${((asset.marketCap || 0) / 1_000_000_000).toFixed(1)}B
src/components/blockchain/AssetCardGrid.tsx:                      {asset.performance.toFixed(1)}%
src/components/blockchain/AssetPress.tsx:                        value: parseFloat(e.target.value),
src/components/blockchain/AssetPress.tsx:                          originalPurchasePrice: parseFloat(e.target.value),
src/components/blockchain/AssetPress.tsx:                          currentMarketValue: parseFloat(e.target.value),
src/components/blockchain/AssetPress.tsx:                              originalPurchasePrice: parseFloat(e.target.value),
src/components/blockchain/AssetPress.tsx:                              currentMarketValue: parseFloat(e.target.value),
src/components/blockchain/AssetPress.tsx:                              debtAmount: parseFloat(e.target.value),
src/components/blockchain/AssetPress.tsx:                          const value = parseFloat(e.target.value);
src/components/blockchain/AssetPress.tsx:                          const value = parseFloat(e.target.value);
src/components/CreditApplication.tsx:        return `${documentProgress.toFixed(0)}% of required documents completed.`;
src/components/CreditApplication.tsx:            <span className="text-sm text-blue-600">{Math.round(documentProgress)}% complete</span>
src/components/CreditApplication.tsx:              : `Complete ${Math.round(75 - documentProgress)}% more to submit`}
src/components/transactions/EnhancedTransactionDashboard.tsx:                ? Math.round((cacheMetrics.hits / (cacheMetrics.hits + cacheMetrics.misses)) * 100)
src/components/common/FileUpload/DocumentUploadModal.tsx:              <span className="text-xs text-gray-600">{Math.round(ocrProgress)}%</span>
src/components/common/FileUpload/DocumentUploadModal.tsx:                  {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type || 'Unknown type'}
src/components/common/FileUpload/DocumentUploadModal.tsx:                    Confidence: {Math.round(documentVerification.confidence)}%
src/components/common/RelationshipCommitment.tsx:                        {Math.round(progress)}% Complete
src/components/common/RelationshipCommitment.tsx:                            {Math.round(
src/components/common/RelationshipCommitment.tsx:                            ${(commitment.currentProgress.dealVolume / 1000).toFixed(1)}k of $
src/components/common/RelationshipCommitment.tsx:                            {(commitment.minDealVolume / 1000).toFixed(1)}k
src/components/common/RelationshipCommitment.tsx:                            {Math.round(
src/components/common/StepProgress.tsx:        <span>{Math.round(progressPercentage)}% Complete</span>
src/components/common/ModularLoading.tsx:  const roundedProgress = Math.round(progress || 0);
src/components/common/ModularLoading.tsx:    const roundedProgress = Math.round(progress || 0);
src/components/common/AccessibilityControls.tsx:      setFontSize(parseFloat(savedFontSize));
src/components/common/AccessibilityControls.tsx:            {Math.round(fontSize * 100)}%
src/components/AILifecycleAssistant.tsx:    setProgressPercentage(Math.min(Math.round(totalProgress), 100));
src/components/AILifecycleAssistant.tsx:    setProgressPercentage(Math.min(Math.round(totalProgress), 100));
src/components/dev/PerformanceMonitor.tsx:        setFps(Math.round(frameCount * 1000 / (currentTime - lastTime)));
src/components/dev/PerformanceMonitor.tsx:    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
src/components/dev/PerformanceMonitor.tsx:                      {metric.lastRenderTime.toFixed(2)}
src/components/dev/PerformanceMonitor.tsx:                      {metric.avgRenderTime.toFixed(2)}
src/components/CreditAnalysisSystem.tsx:    return `${(value * 100).toFixed(1)}%`;
src/components/CreditAnalysisSystem.tsx:                                        ? ratio.value.toFixed(2)
src/components/CreditAnalysisSystem.tsx:                                          : ratio.value.toFixed(1)}
src/components/CreditAnalysisSystem.tsx:                                        ? ratio.benchmark.toFixed(2)
src/components/CreditAnalysisSystem.tsx:                                          : ratio.benchmark.toFixed(1)}
src/components/risk/RiskRangesConfigEditor.tsx:                onChange={(e) => handleRangeChange(metric.id, 'good', 'min', parseFloat(e.target.value))}
src/components/risk/RiskRangesConfigEditor.tsx:                onChange={(e) => handleRangeChange(metric.id, 'average', 'min', parseFloat(e.target.value))}
src/components/risk/RiskRangesConfigEditor.tsx:                onChange={(e) => handleRangeChange(metric.id, 'negative', 'min', parseFloat(e.target.value))}
src/components/risk/RiskRangesConfigEditor.tsx:                onChange={(e) => handleRangeChange(metric.id, 'good', 'max', parseFloat(e.target.value))}
src/components/risk/RiskRangesConfigEditor.tsx:                onChange={(e) => handleRangeChange(metric.id, 'average', 'max', parseFloat(e.target.value))}
src/components/risk/RiskRangesConfigEditor.tsx:                onChange={(e) => handleRangeChange(metric.id, 'negative', 'max', parseFloat(e.target.value))}
src/components/risk/RiskRangesConfigEditor.tsx:                onChange={(e) => handlePointsChange(metric.id, 'good', parseFloat(e.target.value))}
src/components/risk/RiskRangesConfigEditor.tsx:                onChange={(e) => handlePointsChange(metric.id, 'average', parseFloat(e.target.value))}
src/components/risk/RiskRangesConfigEditor.tsx:                onChange={(e) => handlePointsChange(metric.id, 'negative', parseFloat(e.target.value))}
src/components/risk/CommissionCalculator.tsx:    return (decimal * 100).toFixed(2) + '%';
src/components/risk/CommissionCalculator.tsx:                      setCustomCommissionRate(parseFloat(value) / 100);
src/components/risk/RiskAssessment.tsx:        {metric.value.toFixed(2)}
src/components/risk/RiskAssessment.tsx:        {metric.benchmark.toFixed(2)}
src/components/risk/RiskAssessment.tsx:        onChange={e => onChange(parseFloat(e.target.value))}
src/components/risk/RiskAssessment.tsx:      Math.max(Math.round(baseScore - amountFactor + (Math.random() * 10 - 5)), 0),
src/components/risk/RiskAssessment.tsx:        score: Math.round(70 + (Math.random() * 20 - 10)),
src/components/risk/RiskAssessment.tsx:        score: Math.round(65 + (Math.random() * 30 - 15)),
src/components/risk/RiskAssessment.tsx:        score: Math.round(75 + (Math.random() * 25 - 15)),
src/components/risk/RiskAssessment.tsx:        score: Math.round(80 + (Math.random() * 20 - 10)),
src/components/risk/RiskAssessment.tsx:        score: Math.round(60 + (Math.random() * 30 - 15)),
src/components/risk/RiskAssessment.tsx:        impactScore: Math.round(Math.random() * 40 + 30), // Score between 30-70
src/components/risk/RiskAssessment.tsx:        debtServiceCoverageRatio: (Math.random() * 0.5 + 0.8).toFixed(2), // Between 0.8 and 1.3
src/components/risk/RiskAssessment.tsx:        probabilityOfDefault: `${(Math.random() * 15 + 5).toFixed(1)}%`, // Between 5% and 20%
src/components/risk/RiskConfiguration.tsx:        weight: Math.round((factor.weight / totalWeight) * 100),
src/components/risk/PaywallModal.tsx:                ${priceInfo.price.toFixed(2)}
src/components/risk/RiskLabConfigurator.tsx:        updated[key] = Math.max(0, Math.round(prev[key] - (difference * proportion)));
src/components/risk/RiskLabConfigurator.tsx:              const percentage = Math.round((position / rect.width) * 100);
src/components/risk/CoinbaseUSDCPayment.tsx:        Send exactly <span className="font-semibold">{amount.toFixed(2)} USDC</span> to the address below. Payment must be received within the time limit.
src/components/risk/RiskScoringModel.tsx:  return Math.round((totalScore / maxPossiblePoints) * 100);
src/components/risk/RiskScoringModel.tsx:        onChange={(e) => onChange(parseFloat(e.target.value))}
src/components/risk/RiskScoringModel.tsx:      total: Math.round(totalScore)
src/components/risk/RiskScoringModel.tsx:    return Math.round((totalPoints / maxPoints) * 100);
src/components/risk/RiskScoringModel.tsx:    return Math.round((totalPoints / maxPoints) * 100);
src/components/risk/RiskScoringModel.tsx:    return Math.round((totalPoints / maxPoints) * 100);
src/components/risk/RiskScoringModel.tsx:    return Math.round((totalPoints / maxPoints) * 100);
src/components/risk/RiskReportPaywall.tsx:                        <div className="text-sm text-gray-600 line-through">${pkg.price.toFixed(2)}</div>
src/components/risk/RiskReportPaywall.tsx:                        <div className="font-medium">${(pkg.price * (1 - pkg.discount/100)).toFixed(2)}</div>
src/components/risk/RiskReportPaywall.tsx:                      <div className="font-medium">${pkg.price.toFixed(2)}</div>
src/components/risk/RiskReportPaywall.tsx:                    Save ${discountAmount.toFixed(2)}
src/components/risk/RiskReportPaywall.tsx:            Per report: ${perReportPrice.toFixed(2)}
src/components/risk/ModularRiskNavigator.tsx:            onChange={e => handleParameterChange('interestRate', parseFloat(e.target.value))}
src/components/risk/SmartMatchDisplay.tsx:    return `${rate.toFixed(2)}%`;
src/components/risk/RiskAdvisorChat.tsx:          <p className="text-xs text-gray-500">{Math.round(file.size / 1024)} KB</p>
src/components/risk/RiskAdvisorChat.tsx:                <p className="text-xs text-gray-500">{Math.round(attachment.size / 1024)} KB</p>
src/components/risk/SmartMatchingVariables.tsx:                {config.relationshipMatchingAlgorithm.performanceThreshold.toFixed(1)}
src/components/risk/SmartMatchingVariables.tsx:                    performanceThreshold: parseFloat(e.target.value),
src/components/risk/SmartMatchingVariables.tsx:                {config.transactionHistoryAnalysis.similarDealSuccessFactor.toFixed(2)}
src/components/risk/SmartMatchingVariables.tsx:                    similarDealSuccessFactor: parseFloat(e.target.value),
src/components/communications/ChatWidget.tsx:        const avgScore = Math.round(
src/api/auth0ApiClient.ts:          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
src/api/apiService.ts:      console.log(`[apiService] Demo mode - simulated network latency: ${delay.toFixed(0)}ms`);
src/api/documentVerificationApi.ts:            fileSize: file.size ? `${(file.size / 1024).toFixed(2)} KB` : 'Unknown',
src/api/documentVerificationApi.ts:        fileSize: file.size ? `${(file.size / 1024).toFixed(2)} KB` : 'Unknown',
src/pages/PostClosingCustomers.tsx:                    {Math.round(
src/pages/PostClosingCustomers.tsx:                    {Math.round(
src/pages/PostClosingCustomers.tsx:                    {Math.round(
src/pages/PortfolioNavigatorPage.tsx:                    {(asset.performance || 0) >= 0 ? '+' : ''}{(asset.performance || 0).toFixed(1)}%
src/pages/PortfolioNavigatorPage.tsx:                              selectedAsset.performance.toFixed(2) +
src/pages/AssetListing.tsx:    } else if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
src/pages/AssetPortfolioDashboard.tsx:            {((portfolioMetrics.totalDebt / portfolioMetrics.totalValue) * 100).toFixed(1)}%
src/pages/AssetPortfolioDashboard.tsx:            {portfolioMetrics.averageROI.toFixed(1)}%
src/pages/AssetPortfolioDashboard.tsx:            {portfolioMetrics.weightedRiskScore.toFixed(0)}/100
src/pages/AssetPortfolioDashboard.tsx:                          <span className="text-sm font-medium">{percentage.toFixed(1)}%</span>
src/pages/AssetPortfolioDashboard.tsx:                            .toFixed(0)
src/pages/AssetPortfolioDashboard.tsx:                              .toFixed(0)
src/pages/AssetPortfolioDashboard.tsx:                            {benchmarkDiff.toFixed(1)}%
src/pages/AssetPortfolioDashboard.tsx:                      setNewAsset({ ...newAsset, value: parseFloat(e.target.value) || 0 })
src/pages/PortfolioWalletPage.tsx:                    {(asset.performance || 0).toFixed(1)}%
src/pages/PortfolioWalletPage.tsx:                            ).toFixed(1)}
src/pages/PortfolioWalletPage.tsx:                          {(selectedAsset.performance || 0).toFixed(1)}%
src/services/blockchainService.ts:      instrument.price = parseFloat((instrument.price + priceMovement).toFixed(2));
src/services/blockchainService.ts:      instrument.change = parseFloat(
src/services/blockchainService.ts:        (instrument.change + (priceMovement / instrument.price) * 100).toFixed(2)
src/services/blockchainService.ts:        portfolioAsset.value = parseFloat(
src/services/blockchainService.ts:          ((portfolioAsset.balance * instrument.price) / 100).toFixed(2)
src/services/blockchainService.ts:        portfolioAsset.profitLoss = parseFloat(
src/services/blockchainService.ts:          (portfolioAsset.value - portfolioAsset.costBasis).toFixed(2)
src/services/blockchainService.ts:        mockPortfolio.percentChange = parseFloat(
src/services/blockchainService.ts:          ((mockPortfolio.totalProfitLoss / mockPortfolio.totalCostBasis) * 100).toFixed(2)
src/services/blockchainService.ts:        price: parseFloat(price.toFixed(2)),
src/services/blockchainService.ts:        volume: Math.round((Math.random() * instrument.volume24h) / dataPoints),
src/services/DocumentRequirements.ts:    return Math.round((completedDocs.length / requiredDocs.length) * 100);
