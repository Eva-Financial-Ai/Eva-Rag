export interface CreditApplication {
  id: string;
  applicantName: string;
  businessName: string;
  requestedAmount: number;
  purpose: string;
  term: number;
  industry: string;
  annualRevenue: number;
  creditScore: number;
  timeInBusiness: number;
  submittedDate: string;
  status: string;
  blockchainStatus: string;
  documentsComplete: boolean;
} 