/**
 * Customer type definitions for the EVA AI application
 */

export interface Customer {
  id: string;
  name?: string;
  businessName?: string;
  businessType?: string;
  ownerName?: string;
  ownerSSN?: string;
  businessAddress?: string;
  phone?: string;
  email?: string;
  requestedLoanAmount?: number;
  loanPurpose?: string;
  collateral?: string;
  type?: 'borrower' | 'lender' | 'broker' | 'vendor';
  entityType?: string;
  status?: string;
  industry?: string;
  annualRevenue?: number;
  creditScore?: number;
  yearEstablished?: number;
  totalLoanAmount?: number;
  relationshipManager?: string;
  contactPerson?: string;
  lenderSpecific?: Record<string, any>;
  brokerSpecific?: Record<string, any>;
  metadata?: Record<string, any>;
  display_name?: string;
}

export default Customer;
