// Deal-related types extracted from DealContext for better organization

// Define types for participants
export type ParticipantRole = 'lender' | 'broker' | 'vendor' | 'lessor' | 'bank' | 'borrower';
export type ParticipantStatus = 'invited' | 'participating' | 'declined';

export interface Participant {
  participationType: React.ReactNode | Iterable<React.ReactNode>;
  email: any;
  phone: any;
  id: string;
  name: string;
  role: ParticipantRole;
  allocation?: number;
  status: ParticipantStatus;
  contactEmail?: string;
  contactPhone?: string;
  company?: string;
}

// Define types for documents
export type DocumentStatus = 'pending' | 'approved' | 'rejected';

export interface Document {
  size: React.ReactNode | Iterable<React.ReactNode>;
  id: string;
  name: string;
  type: string;
  uploadedBy: string;
  uploadDate: string;
  status: DocumentStatus;
  url?: string;
  comments?: string[];
}

// Define types for tasks
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'blocked';

export interface Task {
  id: string;
  description: string;
  assignedTo: string;
  createdBy: string;
  createdAt: string;
  dueDate: string;
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high';
  comments?: string[];
}

// Define types for notes
export interface Note {
  author: any;
  date: string | number | Date;
  content: React.ReactNode | Iterable<React.ReactNode>;
  id: string;
  text: string;
  createdBy: string;
  createdAt: string;
  isPrivate?: boolean;
}

// Timeline event
export interface TimelineEvent {
  id: string;
  date: string;
  event: string;
  user: string;
  details?: string;
  relatedEntityId?: string;
  relatedEntityType?: 'document' | 'task' | 'participant' | 'note';
}

// Deal type
export type DealType =
  | 'syndication'
  | 'origination'
  | 'participation'
  | 'refinance'
  | 'acquisition';

// Deal status
export type DealStatus =
  | 'prospect'
  | 'submitted'
  | 'underwriting'
  | 'approved'
  | 'commitment_issued'
  | 'closing'
  | 'funded'
  | 'closed'
  | 'declined';

// Deal interface
export interface Deal {
  createdDate: string | number | Date;
  expectedCloseDate: string | number | Date;
  termUnit: React.ReactNode | Iterable<React.ReactNode>;
  interestRate: React.ReactNode | Iterable<React.ReactNode>;
  assignedTo: React.ReactNode | Iterable<React.ReactNode>;
  id: string;
  name: string;
  type: DealType;
  status: DealStatus;
  amount: number;
  term?: number; // in months
  rate?: number; // interest rate
  createdAt: string;
  createdBy: string;
  closingDate?: string;
  borrower: {
    id: string;
    name: string;
    type: string;
    contactInfo?: {
      name: string;
      email: string;
      phone: string;
    };
  };
  property?: {
    address: string;
    city: string;
    state: string;
    zip: string;
    type: string;
    units?: number;
    squareFeet?: number;
  };
  participants: Participant[];
  timeline: TimelineEvent[];
  documents: Document[];
  tasks: Task[];
  notes: Note[];
  tags?: string[];
}
