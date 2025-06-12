// Core Types
export interface TransactionConversation {
  id: string;
  transactionId: string;
  title: string;
  borrowerName: string;
  dealAmount: number;
  dealType: 'equipment_financing' | 'working_capital' | 'commercial_mortgage' | 'sba_loan';
  status: 'prospecting' | 'pre_qualified' | 'in_review' | 'submitted' | 'approved' | 'funded' | 'closed';
  participants: Participant[];
  messages: ConversationMessage[];
  documents: SharedDocument[];
  createdAt: Date;
  updatedAt: Date;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  targetCloseDate?: Date;
  usedSmartMatch?: boolean;
}

export interface Participant {
  userId: string;
  name: string;
  role: 'vendor' | 'finance_manager' | 'broker' | 'lender' | 'borrower' | 'eva_ai';
  company: string;
  joinedAt: Date;
  permissions: ParticipantPermissions;
  isOnline: boolean;
  lastSeen?: Date;
}

export interface ParticipantPermissions {
  canInviteUsers: boolean;
  canUploadDocuments: boolean;
  canAccessFinancials: boolean;
  canSubmitToLenders: boolean;
  canApproveDeal: boolean;
}

export interface ConversationMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: Participant['role'];
  content: string;
  messageType: 'text' | 'document_share' | 'status_update' | 'eva_recommendation' | 'deal_update';
  attachments?: MessageAttachment[];
  timestamp: Date;
  isSystemMessage: boolean;
  metadata?: MessageMetadata;
}

export interface MessageAttachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  url: string;
  uploadedAt: Date;
}

export interface SharedDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
  category: 'financial' | 'legal' | 'application' | 'credit' | 'other';
}

export interface MessageMetadata {
  dealUpdate?: {
    field: string;
    oldValue: any;
    newValue: any;
  };
  evaRecommendation?: {
    type: 'lender_match' | 'terms_suggestion' | 'risk_assessment';
    confidence: number;
    data: any;
  };
}

export interface SmartMatchRecommendation {
  id: string;
  lenderName: string;
  approvalProbability: number;
  estimatedRate: number;
  estimatedTerms: string;
  timeToClose: number; // days
  advantages: string[];
  requirements: string[];
  competitiveEdge: string;
}

export interface CompetitiveMetrics {
  averageTimeToClose: number; // days
  approvalRate: number; // percentage
  termQuality: number; // compared to market
  customerSatisfaction: number;
  dealVolume: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Participant['role'];
  company: string;
  avatar?: string;
}

export interface BorrowerInfo {
  id: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  creditScore?: number;
  timeInBusiness?: number;
}

export interface DealDetails {
  id: string;
  type: TransactionConversation['dealType'];
  amount: number;
  term?: number;
  purpose?: string;
  collateral?: string;
}

export interface DataSourceConnection {
  id: string;
  name: string;
  type: 'credit_bureau' | 'financial_data' | 'banking' | 'tax' | 'custom';
  status: 'active' | 'inactive' | 'pending';
  lastUpdated: Date;
  provider: string;
}

export interface IntelligenceTool {
  id: string;
  name: string;
  description: string;
  type: 'credit_analysis' | 'lender_match' | 'risk_assessment' | 'fraud_detection' | 'document_analysis';
  icon: string;
} 