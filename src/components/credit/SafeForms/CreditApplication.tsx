import React, { useState, useEffect, useRef, useMemo } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { v4 as uuidv4 } from 'uuid'; // For unique owner IDs
import Select, { MultiValue, GroupBase } from 'react-select'; // Import react-select and GroupBase
import DocumentUploadModal from '../../common/FileUpload/DocumentUploadModal';
import { UploadedDocument } from '../../../services/shieldLedgerService';
import StateDropdown from '../../common/StateDropdown';
import { isFutureDate, isUnderAge } from '../../../utils/dateValidation';
import { validateEmail, validatePhone, formatPhoneNumber } from '../../../utils/formValidation';

// Define Entity Types and their KYB Document Requirements
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const entityDocumentRequirements = {
  sole_proprietorship: {
    displayName: 'Sole Proprietorship',
    documents: [
      "Owner's personal tax return with Schedule C included",
      'Doing Business As (DBA) registration or certificate',
      'Local Business License Filling',
    ],
  },
  partnership: {
    displayName: 'Partnership',
    documents: [
      'Partnership agreement',
      'Form 1065 (U.S. Return of Partnership Income)',
      'EIN Confirmation Letter from the IRS',
      'K-1 Form from the most recent tax return',
    ],
  },
  llc: {
    displayName: 'Limited Liability Company (LLC)',
    documents: [
      'Articles of Organization',
      'Operating Agreement',
      'EIN Confirmation Letter from the IRS',
      'Certificate of Good Standing from the state',
      'LLC Resolution showing the authority to act on behalf of the LLC',
    ],
  },
  c_corp: {
    displayName: 'Corporation (C Corp)',
    documents: [
      'Articles of Incorporation',
      'Stock certificates',
      'Bylaws',
      'Corporate resolutions',
      'EIN Confirmation Letter from the IRS',
      'Form 1120',
      'Certificate of Good Standing from the state',
    ],
  },
  s_corp: {
    displayName: 'Corporation (S Corp)',
    documents: [
      'Articles of Incorporation',
      'Bylaws',
      'Corporate resolutions',
      'EIN Confirmation Letter from the IRS',
      'Form 1120S',
      'Personal tax return with Schedule E attached',
      'Certificate of Good Standing from the state',
    ],
  },
  non_profit: {
    displayName: 'Non-Profit Organization',
    documents: [
      'Articles of Incorporation',
      'IRS Determination Letter confirming tax-exempt status',
      'Bylaws',
      'EIN Confirmation Letter from the IRS',
      'Certificate of Good Standing from the state',
    ],
  },
  trust_estate: {
    displayName: 'Trusts and Estates',
    documents: [
      'Trust Agreement',
      'EIN Confirmation Letter from the IRS',
      'Certificate of Trust (if applicable)',
    ],
  },
  cooperative: {
    displayName: 'Cooperatives',
    documents: [
      'Articles of Incorporation',
      'Bylaws',
      'EIN Confirmation Letter from the IRS',
      'Membership agreements',
    ],
  },
  // Add other entity types as needed
};

// --- Constants for KYD Document Requirements ---
const CITIZENSHIP_DOCUMENT_REQUIREMENTS = {
  us_citizen: {
    displayName: 'U.S. Citizen',
    documents: {
      primary: [
        'U.S. Passport or U.S. Passport Card',
        'Certificate of U.S. Citizenship (N-560 or N-561)',
        'Certificate of Naturalization (N-550 or N-570)',
        "State-issued Enhanced Driver's License",
      ],
      secondary: [
        // if primary not available, two required from this list
        'Original or certified U.S. Birth Certificate',
        'Consular Report of Birth Abroad (FS-240, DS-1350, or FS-545)',
        'Government employee ID card with photo',
        'U.S. Military ID card or draft record',
        'Social Security Card plus government-issued photo ID',
      ],
      note: 'Requires at least one primary document, or two secondary documents if no primary is available.',
    },
  },
  permanent_resident: {
    displayName: 'Permanent Resident',
    documents: {
      primary: [
        'Permanent Resident Card (Form I-551, "Green Card")',
        'Foreign passport with I-551 stamp or MRIV',
        'Employment Authorization Document (EAD) with Category C08, C09, or C33',
        'Form I-797 Notice of Action showing approval of status with valid foreign passport',
      ],
      note: 'Requires one document from the list.',
    },
  },
  temporary_visa_holder: {
    displayName: 'Temporary Visa Holder',
    documents: {
      primary: [
        'Valid Foreign Passport with appropriate visa',
        'Form I-94 Arrival/Departure Record or I-94W',
        'Employment Authorization Document (EAD), if applicable',
        'USCIS approval notice relevant to status (e.g., I-797)',
      ],
      additional_by_visa_type: {
        // These are examples, can be expanded
        'E-1/E-2 (Treaty Trader/Investor)': 'Trade agreement documentation',
        'H-1B (Specialty Occupation)': 'Labor Condition Application',
        'L-1A/L-1B (Intracompany Transferee)': 'Evidence of qualifying relationship',
        'O-1 (Extraordinary Ability)': 'Evidence of extraordinary ability/achievement',
        'TN (NAFTA Professional)': 'Proof of Canadian/Mexican citizenship, educational credentials',
      },
      note: 'Requires core documents plus any relevant additional documents based on visa type.',
    },
  },
  refugee_asylee: {
    displayName: 'Refugee/Asylee',
    documents: {
      primary: [
        'Form I-94 with refugee or asylum stamp',
        'Employment Authorization Document (EAD)',
        'Refugee Travel Document (Form I-571)',
        'Approval letter from USCIS granting asylum or refugee status',
        'Order from Immigration Judge granting asylum',
      ],
      note: 'Requires one document from the list.',
    },
  },
  dual_citizen_us_foreign: {
    displayName: 'Dual Citizen (U.S. + Foreign Country)',
    documents: {
      primary: [
        'U.S. Passport or Certificate of U.S. Citizenship (N-560 or N-561)',
        'Valid Foreign Passport from second country of citizenship (optional but recommended)',
        // "Documents establishing identity and citizenship from both countries" is a bit vague for a list,
        // so focusing on the explicit passport/certificate mentions.
      ],
      note: 'Requires U.S. proof. Foreign passport is recommended. Ensure identity and citizenship from both can be established.',
    },
  },
  other_non_resident_alien: {
    displayName: 'Other (Non-Resident Alien/Foreign National)',
    documents: {
      primary: [
        'Valid Foreign Passport',
        'Evidence of legal entry into U.S. if applicable',
        'Documentation of permanent residence in another country',
        'Tax identification documents (e.g., W-8BEN, ITIN)',
        'Proof of foreign address',
      ],
      note: 'Requires documents confirming foreign nationality and U.S. tax/entry status if applicable.',
    },
  },
};

// --- Business Entity KYB Document Requirements (from previous step) ---
const fullEntityDocRequirements = {
  sole_proprietorship: {
    displayName: 'Sole Proprietorship',
    documents: [
      "Owner's personal tax return with Schedule C included",
      'Doing Business As (DBA) registration or certificate',
      'Local Business License Filling',
    ],
  },
  partnership: {
    displayName: 'Partnership',
    documents: [
      'Partnership agreement',
      'Form 1065 (U.S. Return of Partnership Income)',
      'EIN Confirmation Letter from the IRS',
      'K-1 Form from the most recent tax return',
    ],
  },
  llc: {
    displayName: 'Limited Liability Company (LLC)',
    documents: [
      'Articles of Organization',
      'Operating Agreement',
      'EIN Confirmation Letter from the IRS',
      'Certificate of Good Standing from the state',
      'LLC Resolution showing the authority to act on behalf of the LLC',
    ],
  },
  c_corp: {
    displayName: 'Corporation (C Corp)',
    documents: [
      'Articles of Incorporation',
      'Stock certificates',
      'Bylaws',
      'Corporate resolutions',
      'EIN Confirmation Letter from the IRS',
      'Form 1120',
      'Certificate of Good Standing from the state',
    ],
  },
  s_corp: {
    displayName: 'Corporation (S Corp)',
    documents: [
      'Articles of Incorporation',
      'Bylaws',
      'Corporate resolutions',
      'EIN Confirmation Letter from the IRS',
      'Form 1120S',
      'Personal tax return with Schedule E attached',
      'Certificate of Good Standing from the state',
    ],
  },
  non_profit: {
    displayName: 'Non-Profit Organization',
    documents: [
      'Articles of Incorporation',
      'IRS Determination Letter confirming tax-exempt status',
      'Bylaws',
      'EIN Confirmation Letter from the IRS',
      'Certificate of Good Standing from the state',
    ],
  },
  trust_estate: {
    displayName: 'Trusts and Estates',
    documents: [
      'Trust Agreement',
      'EIN Confirmation Letter from the IRS',
      'Certificate of Trust (if applicable)',
    ],
  },
  cooperative: {
    displayName: 'Cooperatives',
    documents: [
      'Articles of Incorporation',
      'Bylaws',
      'EIN Confirmation Letter from the IRS',
      'Membership agreements',
    ],
  },
};

// Define state-specific additional document requirements and regulations by entity type
interface StateSpecificRequirement {
  documents: string[];
  regulations: string[];
  filingFees?: string; // Optional fee information
  renewalRequirements?: string; // Optional renewal information
  specialNotes?: string; // Optional additional information
}

type StateEntityRequirements = Record<string, Record<string, StateSpecificRequirement>>;

// State-specific requirements indexed by state, then by entity type
// This is a sample - you will need to populate with accurate state-specific requirements
const STATE_SPECIFIC_REQUIREMENTS: StateEntityRequirements = {
  California: {
    sole_proprietorship: {
      documents: [
        'California Fictitious Business Name Statement (if using a name other than your legal name)',
        "California Seller's Permit (if selling taxable goods)",
        'Local Business License specific to your city/county in California',
      ],
      regulations: [
        'Must register with California Secretary of State if using a fictitious business name',
        'Must renew FBN statement every 5 years',
        'Local business tax registration may be required in specific cities/counties',
      ],
      filingFees:
        'FBN Statement: $26-$58 depending on county; Local Business License: Varies by location ($50-$500)',
      renewalRequirements: 'FBN renewal every 5 years; Annual business tax renewal',
    },
    llc: {
      documents: [
        'Articles of Organization filed with California Secretary of State',
        'California LLC Operating Agreement',
        'Statement of Information (Form LLC-12)',
        'California LLC Franchise Tax payment confirmation',
      ],
      regulations: [
        'California LLCs must file Statement of Information within 90 days of formation',
        'California imposes an annual $800 minimum franchise tax',
        'Must file Statement of Information every two years ($20 fee)',
      ],
      filingFees: 'Filing fee: $70 for Articles of Organization; $20 for Statement of Information',
      renewalRequirements:
        'Biennial Statement of Information filing; Annual $800 minimum franchise tax',
    },
    // Add other entity types for California
  },
  Delaware: {
    c_corp: {
      documents: [
        'Delaware Certificate of Incorporation',
        'Delaware Corporate Bylaws',
        'Delaware Annual Franchise Tax Report',
        'Confirmation of Delaware Registered Agent',
      ],
      regulations: [
        'Must maintain a registered agent in Delaware',
        'Must file annual franchise tax report by March 1',
        'Directors meetings not required to be held in Delaware',
      ],
      filingFees:
        'Incorporation filing fee: $89 minimum; Annual franchise tax: $175-$200,000 based on shares',
      renewalRequirements: 'Annual franchise tax report and payment',
    },
    llc: {
      documents: [
        'Delaware Certificate of Formation',
        'Delaware LLC Operating Agreement',
        'Confirmation of Delaware Registered Agent',
        'Delaware Annual LLC Tax payment confirmation',
      ],
      regulations: [
        'Must maintain a registered agent in Delaware',
        'Annual LLC tax of $300 due by June 1',
        'No requirement for operating agreement, but strongly recommended',
      ],
      filingFees: 'Formation filing fee: $90; Annual LLC tax: $300 flat fee',
      renewalRequirements: 'Annual LLC tax payment',
    },
    // Add other entity types for Delaware
  },
  'New York': {
    llc: {
      documents: [
        'New York Articles of Organization',
        'NY Publication Affidavit (proof of publishing formation notice in two newspapers)',
        'NY Certificate of Publication',
        'NY LLC Operating Agreement',
        'NY Biennial Statement filing receipt',
      ],
      regulations: [
        'Must publish notice of formation in two newspapers for 6 consecutive weeks',
        'Must file Certificate of Publication within 120 days of formation',
        'Must have a New York address for service of process',
        'Must file Biennial Statement every two years',
      ],
      filingFees:
        'Filing fee: $200; Publication costs: $600-$1,200 depending on county; Biennial statement: $9',
      renewalRequirements: 'Biennial statement filing every two years with $9 fee',
      specialNotes:
        'NY has unique publication requirements that can be costly, especially in NYC counties',
    },
    // Add other entity types for New York
  },
  // Add requirements for other states
};

// Utility function to merge base KYB requirements with state-specific requirements
const getEntityRequirementsForState = (
  entityType: string,
  state: string
): {
  documents: string[];
  regulations: string[];
  filingFees?: string;
  renewalRequirements?: string;
  specialNotes?: string;
  primaryDocumentType?: string; // Adding this field to indicate the primary document type needed
} => {
  const baseRequirements =
    fullEntityDocRequirements[entityType as keyof typeof fullEntityDocRequirements];
  const stateReqs = STATE_SPECIFIC_REQUIREMENTS[state]?.[entityType];

  if (!baseRequirements) {
    return { documents: [], regulations: [] };
  }

  // If no state-specific requirements exist, return just the base requirements
  if (!stateReqs) {
    return {
      documents: baseRequirements.documents,
      regulations: [],
      primaryDocumentType: getPrimaryDocumentType(entityType, state),
    };
  }

  // Merge base and state-specific requirements
  return {
    documents: [...baseRequirements.documents, ...stateReqs.documents],
    regulations: stateReqs.regulations,
    filingFees: stateReqs.filingFees,
    renewalRequirements: stateReqs.renewalRequirements,
    specialNotes: stateReqs.specialNotes,
    primaryDocumentType: getPrimaryDocumentType(entityType, state),
  };
};

// Helper function to determine primary document type based on entity type and state
const getPrimaryDocumentType = (entityType: string, state: string): string => {
  // This would ideally be a comprehensive mapping of entity types to their primary documents by state
  // For now, providing a simple implementation based on common patterns
  if (entityType === 'sole_proprietorship') {
    return 'Business Registration Certificate or DBA Filing';
  } else if (entityType === 'llc') {
    return state === 'Delaware' ? 'Delaware Certificate of Formation' : 'Articles of Organization';
  } else if (entityType === 'c_corp' || entityType === 's_corp') {
    return state === 'Delaware'
      ? 'Delaware Certificate of Incorporation'
      : 'Articles of Incorporation';
  } else if (entityType === 'partnership') {
    return 'Partnership Agreement';
  } else if (entityType === 'trust_estate') {
    return 'Trust Agreement or Trust Certificate';
  } else if (entityType === 'non_profit') {
    return '501(c)(3) Determination Letter';
  } else if (entityType === 'cooperative') {
    return 'Articles of Incorporation for Cooperative';
  }

  return 'Business Formation Document';
};

// --- Owner Interfaces ---
interface IndividualOwnerDetails {
  firstName: string;
  lastName: string;
  title: string;
  ownershipPercentage: string;
  ssn: string;
  dob: string;
  citizenshipStatus: string; // Key from CITIZENSHIP_DOCUMENT_REQUIREMENTS
  homeAddressStreet: string;
  homeAddressCity: string;
  homeAddressState: string;
  homeAddressZip: string;
  contactPhone: string;
  email: string;
  ssnSignatureData: string | null;
  requiredKydDocumentsList: string[];
  authorizationCheck1: boolean; // Accuracy confirmation
  authorizationCheck2: boolean; // Authorized to request credit
  authorizationCheck3: boolean; // Consent for credit checks
}

interface BusinessTrustOwnerDetails {
  entityName: string;
  ein: string;
  entityType: string; // Key from ENTITY_DOCUMENT_REQUIREMENTS
  einSignatureData: string | null;
  requiredKybDocumentsList: string[];
  // Potentially representative details
}

interface Owner {
  id: string;
  ownerType: 'individual' | 'business_trust';
  isPrimary: boolean; // True for the first owner, can be used for display logic
  individualDetails?: IndividualOwnerDetails;
  businessTrustDetails?: BusinessTrustOwnerDetails;
}

// --- Component Props ---
interface CreditApplicationProps {
  onSubmit: (data: any) => void;
  onSave: (data: any) => void;
  initialData?: Record<string, any>; // This will need to adapt to the new owners array structure
}

const US_STATES = [
  'Alabama',
  'Alaska',
  'Arizona',
  'Arkansas',
  'California',
  'Colorado',
  'Connecticut',
  'Delaware',
  'Florida',
  'Georgia',
  'Hawaii',
  'Idaho',
  'Illinois',
  'Indiana',
  'Iowa',
  'Kansas',
  'Kentucky',
  'Louisiana',
  'Maine',
  'Maryland',
  'Massachusetts',
  'Michigan',
  'Minnesota',
  'Mississippi',
  'Missouri',
  'Montana',
  'Nebraska',
  'Nevada',
  'New Hampshire',
  'New Jersey',
  'New Mexico',
  'New York',
  'North Carolina',
  'North Dakota',
  'Ohio',
  'Oklahoma',
  'Oregon',
  'Pennsylvania',
  'Rhode Island',
  'South Carolina',
  'South Dakota',
  'Tennessee',
  'Texas',
  'Utah',
  'Vermont',
  'Virginia',
  'Washington',
  'West Virginia',
  'Wisconsin',
  'Wyoming',
];

// --- NAICS Options Type and Placeholder Data ---
interface OptionType {
  value: string;
  label: string;
  type?: 'NAICS' | 'SIC'; // Optional: to differentiate if needed later
}

interface GroupedOptionType {
  label: string; // Primary NAICS Category Label
  options: OptionType[]; // Sub-NAICS and SIC codes
}

// Note: This is still a sample. You will need to replace this with the complete NAICS/SIC data.
// The structure shows how to properly organize the hierarchical data:
// - Primary NAICS categories (2-digit) as group labels
// - Sub-NAICS codes (3-6 digit) and related SIC codes as options within each group
// The full dataset should include all NAICS primary categories and their sub-codes
const HIERARCHICAL_NAICS_SIC_OPTIONS: GroupedOptionType[] = [
  {
    label: '11 - Agriculture, Forestry, Fishing and Hunting (NAICS Primary)',
    options: [
      { value: '111', label: '111 - Crop Production (NAICS Sub)', type: 'NAICS' },
      { value: '1111', label: '1111 - Oilseed and Grain Farming (NAICS Specific)', type: 'NAICS' },
      {
        value: '1112',
        label: '1112 - Vegetable and Melon Farming (NAICS Specific)',
        type: 'NAICS',
      },
      { value: '1113', label: '1113 - Fruit and Tree Nut Farming (NAICS Specific)', type: 'NAICS' },
      { value: '112', label: '112 - Animal Production and Aquaculture (NAICS Sub)', type: 'NAICS' },
      {
        value: '1121',
        label: '1121 - Cattle Ranching and Farming (NAICS Specific)',
        type: 'NAICS',
      },
      { value: '113', label: '113 - Forestry and Logging (NAICS Sub)', type: 'NAICS' },
      { value: '114', label: '114 - Fishing, Hunting and Trapping (NAICS Sub)', type: 'NAICS' },
      {
        value: '115',
        label: '115 - Support Activities for Agriculture and Forestry (NAICS Sub)',
        type: 'NAICS',
      },
      { value: '0100', label: '0100 - Agricultural Production - Crops (SIC)', type: 'SIC' },
      {
        value: '0200',
        label: '0200 - Agricultural Production - Livestock and Animal Specialties (SIC)',
        type: 'SIC',
      },
      { value: '0700', label: '0700 - Agricultural Services (SIC)', type: 'SIC' },
      { value: '0800', label: '0800 - Forestry (SIC)', type: 'SIC' },
      { value: '0900', label: '0900 - Fishing, Hunting, and Trapping (SIC)', type: 'SIC' },
    ],
  },
  {
    label: '21 - Mining, Quarrying, and Oil and Gas Extraction (NAICS Primary)',
    options: [
      { value: '211', label: '211 - Oil and Gas Extraction (NAICS Sub)', type: 'NAICS' },
      { value: '212', label: '212 - Mining (except Oil and Gas) (NAICS Sub)', type: 'NAICS' },
      { value: '213', label: '213 - Support Activities for Mining (NAICS Sub)', type: 'NAICS' },
      { value: '1000', label: '1000 - Metal Mining (SIC)', type: 'SIC' },
      { value: '1200', label: '1200 - Coal Mining (SIC)', type: 'SIC' },
      { value: '1300', label: '1300 - Oil and Gas Extraction (SIC)', type: 'SIC' },
      {
        value: '1400',
        label: '1400 - Mining and Quarrying of Nonmetallic Minerals, Except Fuels (SIC)',
        type: 'SIC',
      },
    ],
  },
  {
    label: '22 - Utilities (NAICS Primary)',
    options: [
      { value: '221', label: '221 - Utilities (NAICS Sub)', type: 'NAICS' },
      {
        value: '2211',
        label: '2211 - Electric Power Generation, Transmission and Distribution (NAICS Specific)',
        type: 'NAICS',
      },
      { value: '2212', label: '2212 - Natural Gas Distribution (NAICS Specific)', type: 'NAICS' },
      {
        value: '2213',
        label: '2213 - Water, Sewage and Other Systems (NAICS Specific)',
        type: 'NAICS',
      },
      { value: '4900', label: '4900 - Electric, Gas, and Sanitary Services (SIC)', type: 'SIC' },
    ],
  },
  {
    label: '23 - Construction (NAICS Primary)',
    options: [
      { value: '236', label: '236 - Construction of Buildings (NAICS Sub)', type: 'NAICS' },
      {
        value: '2361',
        label: '2361 - Residential Building Construction (NAICS Specific)',
        type: 'NAICS',
      },
      {
        value: '2362',
        label: '2362 - Nonresidential Building Construction (NAICS Specific)',
        type: 'NAICS',
      },
      {
        value: '237',
        label: '237 - Heavy and Civil Engineering Construction (NAICS Sub)',
        type: 'NAICS',
      },
      { value: '238', label: '238 - Specialty Trade Contractors (NAICS Sub)', type: 'NAICS' },
      { value: '1500', label: '1500 - General Building Contractors (SIC)', type: 'SIC' },
      {
        value: '1520',
        label: '1520 - General Building Contractors - Residential Buildings (SIC)',
        type: 'SIC',
      },
      {
        value: '1600',
        label: '1600 - Heavy Construction Other Than Building Construction Contractors (SIC)',
        type: 'SIC',
      },
      {
        value: '1700',
        label: '1700 - Construction - Special Trade Contractors (SIC)',
        type: 'SIC',
      },
    ],
  },
  {
    label: '31-33 - Manufacturing (NAICS Primary)',
    options: [
      { value: '311', label: '311 - Food Manufacturing (NAICS Sub)', type: 'NAICS' },
      {
        value: '312',
        label: '312 - Beverage and Tobacco Product Manufacturing (NAICS Sub)',
        type: 'NAICS',
      },
      { value: '313', label: '313 - Textile Mills (NAICS Sub)', type: 'NAICS' },
      { value: '2000', label: '2000 - Food and Kindred Products (SIC)', type: 'SIC' },
      { value: '2100', label: '2100 - Tobacco Products (SIC)', type: 'SIC' },
      { value: '2200', label: '2200 - Textile Mill Products (SIC)', type: 'SIC' },
      // Add more manufacturing codes as needed
    ],
  },
  {
    label: '54 - Professional, Scientific, and Technical Services (NAICS Primary)',
    options: [
      {
        value: '541',
        label: '541 - Professional, Scientific, and Technical Services (NAICS Sub)',
        type: 'NAICS',
      },
      { value: '5411', label: '5411 - Legal Services (NAICS Specific)', type: 'NAICS' },
      {
        value: '5412',
        label:
          '5412 - Accounting, Tax Preparation, Bookkeeping, and Payroll Services (NAICS Specific)',
        type: 'NAICS',
      },
      {
        value: '5413',
        label: '5413 - Architectural, Engineering, and Related Services (NAICS Specific)',
        type: 'NAICS',
      },
      {
        value: '5414',
        label: '5414 - Specialized Design Services (NAICS Specific)',
        type: 'NAICS',
      },
      {
        value: '5415',
        label: '5415 - Computer Systems Design and Related Services (NAICS Specific)',
        type: 'NAICS',
      },
      {
        value: '5416',
        label: '5416 - Management, Scientific, and Technical Consulting Services (NAICS Specific)',
        type: 'NAICS',
      },
      {
        value: '5417',
        label: '5417 - Scientific Research and Development Services (NAICS Specific)',
        type: 'NAICS',
      },
      {
        value: '5418',
        label: '5418 - Advertising, Public Relations, and Related Services (NAICS Specific)',
        type: 'NAICS',
      },
      {
        value: '5419',
        label: '5419 - Other Professional, Scientific, and Technical Services (NAICS Specific)',
        type: 'NAICS',
      },
      {
        value: '7370',
        label:
          '7370 - Computer Programming, Data Processing, And Other Computer Related Services (SIC)',
        type: 'SIC',
      },
      { value: '8100', label: '8100 - Legal Services (SIC)', type: 'SIC' },
      {
        value: '8700',
        label: '8700 - Engineering, Accounting, Research, Management, And Related Services (SIC)',
        type: 'SIC',
      },
    ],
  },
  // Add remaining NAICS primary categories here (41-53, 55-92)
  // THIS IS INCOMPLETE - You need to provide the full hierarchical NAICS/SIC dataset
];

// !!! REPLACE WITH YOUR COMPREHENSIVE COUNTY DATA !!!
const US_COUNTIES_BY_STATE: Record<string, string[]> = {
  California: ['Los Angeles', 'San Francisco', 'San Diego', 'Orange', 'Riverside'],
  Texas: ['Harris', 'Dallas', 'Tarrant', 'Bexar', 'Travis'],
  'New York': ['Kings (Brooklyn)', 'Queens', 'New York (Manhattan)', 'Suffolk', 'Bronx'],
  // Add all other states and their counties
};

// Helper to find an option by value across all groups for initialData mapping
const findOptionInGroupedData = (
  value: string,
  groupedOptions: GroupedOptionType[]
): OptionType | undefined => {
  for (const group of groupedOptions) {
    const found = group.options.find(opt => opt.value === value);
    if (found) return found;
  }
  return undefined;
};

// Custom styles for react-select
const customSelectStyles = {
  control: (base: any) => ({
    ...base,
    minHeight: '38px',
    borderColor: '#e2e8f0',
    boxShadow: 'none',
    '&:hover': {
      borderColor: '#cbd5e0',
    },
  }),
  menuList: (base: any) => ({
    ...base,
    padding: '8px',
    maxHeight: '350px',
  }),
  menu: (base: any) => ({
    ...base,
    zIndex: 100,
  }),
  groupHeading: (base: any) => ({
    ...base,
    fontWeight: 600,
    fontSize: '0.9em',
    color: '#2c5282', // Blue-800
    backgroundColor: '#ebf8ff', // Blue-100
    padding: '8px 12px',
    marginBottom: 0,
    borderBottom: '1px solid #bee3f8', // Blue-200
    position: 'sticky',
    top: 0,
    zIndex: 9,
  }),
  group: (base: any) => ({
    ...base,
    paddingTop: 0,
    paddingBottom: '8px',
    border: '1px solid #e2e8f0',
    borderRadius: '4px',
    marginBottom: '8px',
  }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isSelected
      ? '#3182ce'
      : state.isFocused
        ? '#e6f7ff'
        : base.backgroundColor,
    paddingLeft: state.data.type === 'NAICS' ? '24px' : '32px', // Indent based on type
    fontSize: '0.9em',
    color: state.isSelected ? 'white' : '#2d3748',
    ':active': {
      backgroundColor: state.isSelected ? '#3182ce' : '#e6f7ff',
    },
    ':before': {
      content: state.data.type ? `"${state.data.type}"` : '""',
      display: 'inline-block',
      width: state.data.type === 'NAICS' ? '45px' : '30px',
      fontSize: '0.7em',
      color: state.isSelected ? 'white' : state.data.type === 'NAICS' ? '#2c5282' : '#805ad5',
      marginRight: '8px',
      padding: '1px 4px',
      borderRadius: '2px',
      backgroundColor: state.isSelected
        ? 'rgba(255,255,255,0.2)'
        : state.data.type === 'NAICS'
          ? '#ebf8ff'
          : '#faf5ff',
    },
  }),
  multiValue: (base: any) => ({
    ...base,
    backgroundColor: '#ebf8ff',
    borderRadius: '4px',
  }),
  multiValueLabel: (base: any, state: any) => ({
    ...base,
    color: '#2c5282',
    fontSize: '0.85em',
    padding: '3px 6px',
  }),
  multiValueRemove: (base: any) => ({
    ...base,
    color: '#4299e1',
    ':hover': {
      backgroundColor: '#bee3f8',
      color: '#2c5282',
    },
  }),
  valueContainer: (base: any) => ({
    ...base,
    padding: '2px 8px',
  }),
};

// Custom formatGroupLabel function
const formatGroupLabel = (data: GroupBase<OptionType>) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '4px 0',
      width: '100%',
    }}
  >
    <span style={{ fontWeight: 600 }}>{data.label}</span>
    <span
      style={{
        backgroundColor: '#e2e8f0',
        borderRadius: '9999px',
        color: '#4a5568',
        display: 'inline-block',
        fontSize: '0.8em',
        fontWeight: 600,
        lineHeight: '1.2',
        minWidth: '1.2em',
        padding: '0.2em 0.6em',
        textAlign: 'center',
      }}
    >
      {data.options.length}
    </span>
  </div>
);

const CreditApplication: React.FC<CreditApplicationProps> = ({ onSubmit, onSave, initialData }) => {
  // --- Top-level Form State ---
  const [legalBusinessName, setLegalBusinessName] = useState('');
  const [dba, setDba] = useState('');
  const [taxId, setTaxId] = useState('');
  const [dunsNumber, setDunsNumber] = useState('');
  const [formationState, setFormationState] = useState('');
  const [countyOfRegistration, setCountyOfRegistration] = useState('');
  const [countiesInSelectedState, setCountiesInSelectedState] = useState<string[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [businessEinSignature, _setBusinessEinSignature] = useState<string | null>(null);
  const [dateEstablished, setDateEstablished] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [industry, setIndustry] = useState<MultiValue<OptionType>>([]);
  const [applicantRequiredKybDocuments, setApplicantRequiredKybDocuments] = useState<string[]>([]);
  const [applicantStateRegulations, setApplicantStateRegulations] = useState<string[]>([]);
  const [applicantFilingFees, setApplicantFilingFees] = useState<string>('');
  const [applicantRenewalRequirements, setApplicantRenewalRequirements] = useState<string>('');
  const [applicantSpecialNotes, setApplicantSpecialNotes] = useState<string>('');
  const [primaryDocumentType, setPrimaryDocumentType] = useState<string>('');

  // Document Upload State
  const [showUploadModal, setShowUploadModal] = useState<string | null>(null);
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [primaryDocumentUploaded, setPrimaryDocumentUploaded] = useState<boolean>(false);
  const [supportingDocumentsUploaded, setSupportingDocumentsUploaded] = useState<boolean>(false);

  // Business Contact Info
  const [businessPhone, setBusinessPhone] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [companyLinkedInUrl, setCompanyLinkedInUrl] = useState('');
  const [businessInstagramUrl, setBusinessInstagramUrl] = useState('');
  const [businessFacebookUrl, setBusinessFacebookUrl] = useState('');
  const [businessAddressStreet, setBusinessAddressStreet] = useState('');
  const [businessAddressCity, setBusinessAddressCity] = useState('');
  const [businessAddressState, setBusinessAddressState] = useState('');
  const [businessAddressZip, setBusinessAddressZip] = useState('');

  // Loan Request Info
  const [amountRequested, setAmountRequested] = useState('');
  const [termRequested, setTermRequested] = useState('');
  const [useOfFunds, setUseOfFunds] = useState('');
  const [collateralDescription, setCollateralDescription] = useState('');

  // Business Financial Info
  const [annualBusinessRevenue, setAnnualBusinessRevenue] = useState('');
  const [monthlyGrossRevenue, setMonthlyGrossRevenue] = useState('');
  const [currentOutstandingBusinessDebt, setCurrentOutstandingBusinessDebt] = useState('');
  const [monthlyRentMortgage, setMonthlyRentMortgage] = useState('');

  // Banking Info
  const [bankName, setBankName] = useState('');
  const [connectPlaid, setConnectPlaid] = useState(false);

  // General Authorization (for overall application, not owner specific)
  const [mainAuthorization, setMainAuthorization] = useState(false);
  const [mainCertification, setMainCertification] = useState(false);

  // --- Owners State ---
  const initialPrimaryOwner = useMemo(
    (): Owner => ({
      id: uuidv4(),
      ownerType: 'individual',
      isPrimary: true,
      individualDetails: {
        firstName: '',
        lastName: '',
        title: '',
        ownershipPercentage: '',
        ssn: '',
        dob: '',
        citizenshipStatus: '',
        homeAddressStreet: '',
        homeAddressCity: '',
        homeAddressState: '',
        homeAddressZip: '',
        contactPhone: '',
        email: '',
        ssnSignatureData: null,
        requiredKydDocumentsList: [],
        authorizationCheck1: false,
        authorizationCheck2: false,
        authorizationCheck3: false,
      },
    }),
    []
  );
  const [owners, setOwners] = useState<Owner[]>([initialPrimaryOwner]);
  const sigPadRefs = useRef<Record<string, SignatureCanvas | null>>({});
  // Business EIN signature canvas is referenced but not actively used in this version
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _sigCanvasBusinessEin = useRef<SignatureCanvas | null>(null);

  const getKydDocumentsForCitizenship = React.useCallback((statusKey: string): string[] => {
    const config =
      CITIZENSHIP_DOCUMENT_REQUIREMENTS[
        statusKey as keyof typeof CITIZENSHIP_DOCUMENT_REQUIREMENTS
      ];
    if (!config) return [];

    let docs: string[] = [];
    const currentDocs = config.documents as any; // Use type assertion for simpler access

    if (currentDocs.primary && Array.isArray(currentDocs.primary)) {
      docs = docs.concat(currentDocs.primary.map((d: string) => `Primary: ${d}`));
    }
    if (currentDocs.secondary && Array.isArray(currentDocs.secondary)) {
      docs = docs.concat(currentDocs.secondary.map((d: string) => `Secondary: ${d}`));
    }
    if (currentDocs.note) {
      docs.push(`Note: ${currentDocs.note as string}`);
    }

    if (
      currentDocs.additional_by_visa_type &&
      typeof currentDocs.additional_by_visa_type === 'object' &&
      statusKey === 'temporary_visa_holder'
    ) {
      docs.push('Additional (by visa type - provide if applicable):');
      Object.entries(currentDocs.additional_by_visa_type).forEach(([visa, doc]) => {
        docs.push(`- ${visa}: ${doc as string}`);
      });
    }
    return docs;
  }, []);

  // --- Effects ---
  useEffect(() => {
    if (initialData) {
      setLegalBusinessName(initialData.legalBusinessName || '');
      setDba(initialData.dba || '');
      setTaxId(initialData.taxId || '');
      setDunsNumber(initialData.dunsNumber || '');
      setDateEstablished(initialData.dateEstablished || '');
      setFormationState(initialData.formationState || '');
      setCountyOfRegistration(initialData.countyOfRegistration || '');
      setBusinessType(initialData.businessType || '');

      if (initialData.industry) {
        let mappedIndustries: OptionType[] = [];
        if (Array.isArray(initialData.industry)) {
          // Handles array of codes (strings) or array of OptionType-like objects
          mappedIndustries = initialData.industry
            .map((ind: string | OptionType) => {
              if (typeof ind === 'string') {
                return (
                  findOptionInGroupedData(ind, HIERARCHICAL_NAICS_SIC_OPTIONS) || {
                    value: ind,
                    label: `${ind} (Custom/Unknown)`,
                  }
                );
              }
              // If it has value and label, assume it's OptionType compatible
              return ind.value && ind.label
                ? ind
                : { value: String(ind), label: `${String(ind)} (Custom/Unknown)` };
            })
            .filter(Boolean) as OptionType[];
        } else if (typeof initialData.industry === 'string') {
          // Handles a single code string
          const foundIndustry = findOptionInGroupedData(
            initialData.industry,
            HIERARCHICAL_NAICS_SIC_OPTIONS
          ) || { value: initialData.industry, label: `${initialData.industry} (Custom/Unknown)` };
          if (foundIndustry) mappedIndustries = [foundIndustry];
        } else if (
          typeof initialData.industry === 'object' &&
          initialData.industry.value &&
          initialData.industry.label
        ) {
          // Handles a single OptionType-like object
          mappedIndustries = [initialData.industry as OptionType];
        }
        setIndustry(mappedIndustries);
      } else {
        setIndustry([]);
      }
      // ... set other top-level fields ...
      setBusinessPhone(initialData.businessPhone || '');
      setBusinessEmail(initialData.businessEmail || '');
      setWebsite(initialData.website || '');
      setCompanyLinkedInUrl(initialData.companyLinkedInUrl || '');
      setBusinessInstagramUrl(initialData.businessInstagramUrl || '');
      setBusinessFacebookUrl(initialData.businessFacebookUrl || '');
      setBusinessAddressStreet(initialData.businessAddressStreet || '');
      setBusinessAddressCity(initialData.businessAddressCity || '');
      setBusinessAddressState(initialData.businessAddressState || '');
      setBusinessAddressZip(initialData.businessAddressZip || '');
      setAmountRequested(initialData.amountRequested || '');
      setTermRequested(initialData.termRequested || '');
      setUseOfFunds(initialData.useOfFunds || '');
      setCollateralDescription(initialData.collateralDescription || '');
      setAnnualBusinessRevenue(initialData.annualBusinessRevenue || '');
      setMonthlyGrossRevenue(initialData.monthlyGrossRevenue || '');
      setCurrentOutstandingBusinessDebt(initialData.currentOutstandingBusinessDebt || '');
      setMonthlyRentMortgage(initialData.monthlyRentMortgage || '');
      setBankName(initialData.bankName || '');
      setConnectPlaid(initialData.connectPlaid || false);
      setMainAuthorization(initialData.mainAuthorization || false);
      setMainCertification(initialData.mainCertification || false);

      if (
        initialData.owners &&
        Array.isArray(initialData.owners) &&
        initialData.owners.length > 0
      ) {
        // More robust mapping would be needed here, ensuring all nested structures are correctly formed
        setOwners(
          initialData.owners.map((ownerData: any) => ({
            ...initialPrimaryOwner, // Spread defaults first
            ...ownerData, // Then spread potentially partial data
            id: ownerData.id || uuidv4(), // Ensure ID exists
            individualDetails: ownerData.individualDetails
              ? {
                  ...initialPrimaryOwner.individualDetails!,
                  ...ownerData.individualDetails,
                  requiredKydDocumentsList: ownerData.individualDetails.citizenshipStatus
                    ? getKydDocumentsForCitizenship(ownerData.individualDetails.citizenshipStatus)
                    : [],
                }
              : initialPrimaryOwner.individualDetails,
            businessTrustDetails: ownerData.businessTrustDetails
              ? {
                  // Ensure businessTrustDetails has its defaults if any, and requiredKybDocs if applicable
                  ...(initialPrimaryOwner.businessTrustDetails || {}), // Provide default empty object if initialPrimaryOwner.businessTrustDetails is undefined
                  ...ownerData.businessTrustDetails,
                  // requiredKybDocumentsList: ownerData.businessTrustDetails.entityType ? getKybForEntityType(ownerData.businessTrustDetails.entityType) : [],
                }
              : initialPrimaryOwner.businessTrustDetails,
          }))
        );
      } else if (!initialData.owners && (initialData.ownerFirstName || initialData.ownerSsn)) {
        // Attempt to map from old flat structure to new primary owner structure
        // This is a basic example of backward compatibility
        const citizenship = initialData.citizenshipStatus || ''; // Assuming old data might have this
        setOwners([
          {
            ...initialPrimaryOwner,
            individualDetails: {
              ...initialPrimaryOwner.individualDetails!,
              firstName: initialData.ownerFirstName || '',
              lastName: initialData.ownerLastName || '',
              title: initialData.ownerTitle || '',
              ownershipPercentage: initialData.ownerPercentage || '',
              ssn: initialData.ownerSsn || '',
              dob: initialData.ownerDob || '',
              citizenshipStatus: citizenship,
              requiredKydDocumentsList: getKydDocumentsForCitizenship(citizenship),
              homeAddressStreet: initialData.ownerHomeAddressStreet || '',
              homeAddressCity: initialData.ownerHomeAddressCity || '',
              homeAddressState: initialData.ownerHomeAddressState || '',
              homeAddressZip: initialData.ownerHomeAddressZip || '',
              contactPhone: initialData.ownerContactPhone || '',
              email: initialData.ownerEmail || '',
            },
          },
        ]);
      }
    }
  }, [initialData, getKydDocumentsForCitizenship, initialPrimaryOwner]);

  useEffect(() => {
    if (businessType && formationState) {
      const requirements = getEntityRequirementsForState(businessType, formationState);
      setApplicantRequiredKybDocuments(requirements.documents);
      setApplicantStateRegulations(requirements.regulations);
      setApplicantFilingFees(requirements.filingFees || '');
      setApplicantRenewalRequirements(requirements.renewalRequirements || '');
      setApplicantSpecialNotes(requirements.specialNotes || '');
      setPrimaryDocumentType(requirements.primaryDocumentType || 'Business Formation Document');
    } else if (businessType) {
      // If only business type is set but no state, use just the base requirements
      const baseRequirements =
        fullEntityDocRequirements[businessType as keyof typeof fullEntityDocRequirements];
      setApplicantRequiredKybDocuments(baseRequirements ? baseRequirements.documents : []);
      setApplicantStateRegulations([]);
      setApplicantFilingFees('');
      setApplicantRenewalRequirements('');
      setApplicantSpecialNotes('');
      setPrimaryDocumentType(getPrimaryDocumentType(businessType, ''));
    } else {
      // Reset everything if no business type is selected
      setApplicantRequiredKybDocuments([]);
      setApplicantStateRegulations([]);
      setApplicantFilingFees('');
      setApplicantRenewalRequirements('');
      setApplicantSpecialNotes('');
      setPrimaryDocumentType('');
    }
  }, [businessType, formationState]);

  // Effect to update counties when formationState changes
  useEffect(() => {
    if (formationState && US_COUNTIES_BY_STATE[formationState]) {
      setCountiesInSelectedState(US_COUNTIES_BY_STATE[formationState]);
    } else {
      setCountiesInSelectedState([]);
    }
    setCountyOfRegistration(''); // Reset county if state changes
  }, [formationState]);

  // --- Validation Helpers ---
  // Using shared utilities from utils/dateValidation.ts

  // --- Owner Management Handlers ---
  const handleOwnerInputChange = (ownerId: string, fieldPath: string, value: any) => {
    // Validate DOB for age and future date
    if (fieldPath === 'individualDetails.dob') {
      if (isFutureDate(value)) {
        // Using console.error instead of alert for ESLint compliance
        console.error('Date of Birth cannot be in the future.');
        return; // Prevent update if invalid
      }
      if (isUnderAge(value, 18)) {
        // Using console.error instead of alert for ESLint compliance
        console.error('Owner must be at least 18 years old.');
        // Allow setting the value for now, but handleSubmit will catch it
        // Or you could return here to prevent setting an invalid DOB immediately
      }
    }

    setOwners(prevOwners =>
      prevOwners.map(owner => {
        if (owner.id === ownerId) {
          const updatedOwner = JSON.parse(JSON.stringify(owner)); // Deep clone to avoid state mutation issues
          const keys = fieldPath.split('.');
          let currentLevel: any = updatedOwner;
          keys.forEach((key, index) => {
            if (index === keys.length - 1) {
              currentLevel[key] = value;
            } else {
              if (!currentLevel[key]) currentLevel[key] = {}; // Create intermediate object if not exists
              currentLevel = currentLevel[key];
            }
          });
          if (
            fieldPath === 'individualDetails.citizenshipStatus' &&
            updatedOwner.ownerType === 'individual' &&
            updatedOwner.individualDetails
          ) {
            updatedOwner.individualDetails.requiredKydDocumentsList =
              getKydDocumentsForCitizenship(value);
          }
          return updatedOwner;
        }
        return owner;
      })
    );
  };

  const handleOwnerSignatureEnd = (
    ownerId: string,
    signatureData: string | null,
    type: 'ssn' | 'ein'
  ) => {
    setOwners(prevOwners =>
      prevOwners.map(owner => {
        if (owner.id === ownerId) {
          if (owner.ownerType === 'individual' && type === 'ssn' && owner.individualDetails) {
            return {
              ...owner,
              individualDetails: { ...owner.individualDetails, ssnSignatureData: signatureData },
            };
          } else if (
            owner.ownerType === 'business_trust' &&
            type === 'ein' &&
            owner.businessTrustDetails
          ) {
            // return { ...owner, businessTrustDetails: { ...owner.businessTrustDetails, einSignatureData: signatureData } };
            // BusinessTrust owner signature placeholder for now
          }
        }
        return owner;
      })
    );
  };

  const clearOwnerSignature = (ownerId: string, type: 'ssn' | 'ein') => {
    const refKey = type === 'ssn' ? `${ownerId}_ssn` : `${ownerId}_ein`;
    const ref = sigPadRefs.current[refKey];
    if (ref) {
      ref.clear();
    }
    handleOwnerSignatureEnd(ownerId, null, type);
  };

  const addOwner = () => {
    // For now, defaults to adding an individual. Later, could prompt for type.
    const newOwner: Owner = {
      id: uuidv4(),
      ownerType: 'individual',
      isPrimary: false,
      individualDetails: {
        firstName: '',
        lastName: '',
        title: '',
        ownershipPercentage: '',
        ssn: '',
        dob: '',
        citizenshipStatus: '',
        homeAddressStreet: '',
        homeAddressCity: '',
        homeAddressState: '',
        homeAddressZip: '',
        contactPhone: '',
        email: '',
        ssnSignatureData: null,
        requiredKydDocumentsList: [],
        authorizationCheck1: false,
        authorizationCheck2: false,
        authorizationCheck3: false,
      },
    };
    setOwners(prevOwners => [...prevOwners, newOwner]);
  };

  const removeOwner = (ownerId: string) => {
    setOwners(prevOwners => prevOwners.filter(owner => owner.id !== ownerId));
    // Clean up ref
    const ssnRefKey = `${ownerId}_ssn`;
    const einRefKey = `${ownerId}_ein`;
    if (sigPadRefs.current[ssnRefKey]) delete sigPadRefs.current[ssnRefKey];
    if (sigPadRefs.current[einRefKey]) delete sigPadRefs.current[einRefKey];
  };

  // --- Form Data Gathering & Submission ---
  const gatherFormData = () => {
    return {
      // Top-level applicant info
      legalBusinessName,
      dba,
      taxId,
      dunsNumber,
      formationState,
      countyOfRegistration,
      businessEinSignature,
      dateEstablished,
      businessType,
      industry: industry ? industry.map(opt => opt.value) : [],
      applicantRequiredKybDocuments,
      applicantStateRegulations,
      applicantFilingFees,
      applicantRenewalRequirements,
      applicantSpecialNotes,
      primaryDocumentType,

      // Add uploaded documents
      uploadedDocuments,

      businessPhone,
      businessEmail,
      website,
      companyLinkedInUrl,
      businessInstagramUrl,
      businessFacebookUrl,
      businessAddressStreet,
      businessAddressCity,
      businessAddressState,
      businessAddressZip,
      amountRequested,
      termRequested,
      useOfFunds,
      collateralDescription,
      annualBusinessRevenue,
      monthlyGrossRevenue,
      currentOutstandingBusinessDebt,
      monthlyRentMortgage,
      bankName,
      connectPlaid,
      mainAuthorization,
      mainCertification,
      // Owners array
      owners: owners.map(owner => {
        const { id, ...ownerData } = owner; // Exclude transient id from submission if not needed by backend
        // Further processing of ownerData if needed, e.g., trim signatures if sigPadRefs.current[id]?.isEmpty()
        if (owner.ownerType === 'individual' && owner.individualDetails) {
          const sigPad = sigPadRefs.current[`${id}_ssn`];
          if (sigPad?.isEmpty() && owner.individualDetails.ssnSignatureData) {
            // If signature pad is empty but data exists (e.g. after clear), nullify it
            return {
              ...ownerData,
              individualDetails: { ...ownerData.individualDetails!, ssnSignatureData: null },
            };
          }
        }
        // Similarly for business EIN signature
        const isBusinessEinSigEmpty = sigPadRefs.current[`${id}_ein`]?.isEmpty();
        if (isBusinessEinSigEmpty && taxId && businessEinSignature) {
          // This is for main business EIN sig
          // This logic is a bit mixed, businessEinSignature is top-level
        }

        return ownerData;
      }),
    };
  };

  const handleSave = () => onSave(gatherFormData());

  // Enhanced validation to check for primary owner equity percentage
  const validateOwnershipPercentage = (): { valid: boolean; message?: string } => {
    const primaryOwner = owners.find(owner => owner.isPrimary);

    if (primaryOwner && primaryOwner.individualDetails) {
      const ownershipPercentage = parseFloat(primaryOwner.individualDetails.ownershipPercentage);

      if (!isNaN(ownershipPercentage) && ownershipPercentage < 81) {
        return {
          valid: false,
          message: `The primary owner must have at least 81% ownership. Current: ${ownershipPercentage}%`,
        };
      }
    }

    return { valid: true };
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate Business Start Date
    if (isFutureDate(dateEstablished)) {
      console.error('Date Established cannot be in the future.');
      return;
    }

    // Validate all owner DOBs
    for (const owner of owners) {
      if (owner.ownerType === 'individual' && owner.individualDetails) {
        if (isFutureDate(owner.individualDetails.dob)) {
          console.error(
            `Owner ${owner.individualDetails.firstName || ''} ${owner.individualDetails.lastName || ''}'s Date of Birth cannot be in the future.`
          );
          return;
        }
        if (isUnderAge(owner.individualDetails.dob, 18)) {
          console.error(
            `Owner ${owner.individualDetails.firstName || ''} ${owner.individualDetails.lastName || ''} must be at least 18 years old.`
          );
          return;
        }
      }
    }

    // Validate primary owner has at least 81% ownership
    const ownershipValidation = validateOwnershipPercentage();
    if (!ownershipValidation.valid) {
      console.error(ownershipValidation.message);
      return;
    }

    onSubmit(gatherFormData());
  };

  // Common Tailwind classes
  const inputClass =
    'w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500';
  const checkboxClass = 'h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500'; // Base class for checkbox
  const btnPrimaryClass =
    'px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-700';
  const btnSecondaryClass =
    'px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500';
  const btnSecondaryXsClass =
    'px-2 py-1 text-xs font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300';

  // Get uploaded document by type
  const getUploadedDocumentByType = (docType: string): UploadedDocument | undefined => {
    return uploadedDocuments.find(doc => doc.documentType === docType);
  };

  // Handle document upload completion
  const handleDocumentUploadComplete = (document: UploadedDocument) => {
    setUploadedDocuments(prev => [...prev, document]);

    // Update the appropriate upload status based on document type
    if (document.documentType === 'primary') {
      setPrimaryDocumentUploaded(true);
    } else if (document.documentType === 'supporting') {
      setSupportingDocumentsUploaded(true);
    }

    // Close the modal after upload is complete
    setShowUploadModal(null);
  };

  // Handle data extracted from uploaded documents
  const handleExtractedData = (fields: Record<string, string>) => {
    // Update form fields with extracted data
    if (fields.legalBusinessName) setLegalBusinessName(fields.legalBusinessName);
    if (fields.taxId) setTaxId(fields.taxId);
    if (fields.dunsNumber) setDunsNumber(fields.dunsNumber);
    if (fields.businessAddressStreet) setBusinessAddressStreet(fields.businessAddressStreet);
    if (fields.dateEstablished) setDateEstablished(fields.dateEstablished);

    // Display a notification to user that fields were auto-filled
    // eslint-disable-next-line no-console
    console.info('Form fields have been populated with data extracted from your document.');
  };

  // --- Render ---
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Credit Application</h2>
      <form onSubmit={handleSubmit}>
        {/* --- Business Information Section (Main Applicant) --- */}
        <div className="mb-8 p-4 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-medium text-gray-700 mb-4 pb-2 border-b">
            Business Information (Applicant)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Legal Business Name, DBA, Tax ID, Date Established, Business Type, Industry */}
            <div>
              <label
                htmlFor="legalBusinessName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Legal Business Name
              </label>
              <input
                id="legalBusinessName"
                type="text"
                value={legalBusinessName}
                onChange={e => setLegalBusinessName(e.target.value)}
                className={inputClass}
                placeholder="Legal name as registered"
              />
            </div>
            <div>
              <label htmlFor="dba" className="block text-sm font-medium text-gray-700 mb-1">
                DBA (if applicable)
              </label>
              <input
                id="dba"
                type="text"
                value={dba}
                onChange={e => setDba(e.target.value)}
                className={inputClass}
                placeholder="Doing Business As"
              />
            </div>
            <div>
              <label htmlFor="taxId" className="block text-sm font-medium text-gray-700 mb-1">
                Tax ID / EIN
              </label>
              <input
                id="taxId"
                type="text"
                maxLength={9}
                value={taxId}
                onChange={e => setTaxId(e.target.value)}
                className={inputClass}
                placeholder="XX-XXXXXXX"
              />
            </div>
            <div>
              <label htmlFor="dunsNumber" className="block text-sm font-medium text-gray-700 mb-1">
                DUNS Number
              </label>
              <input
                id="dunsNumber"
                type="text"
                maxLength={9}
                value={dunsNumber}
                onChange={e => setDunsNumber(e.target.value)}
                className={inputClass}
                placeholder="XX-XXXXXXX"
              />
            </div>
            <div>
              <label
                htmlFor="dateEstablished"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Date Established
              </label>
              <input
                id="dateEstablished"
                type="date"
                value={dateEstablished}
                onChange={e => {
                  if (isFutureDate(e.target.value)) {
                    console.error('Date Established cannot be in the future.');
                  } else {
                    setDateEstablished(e.target.value);
                  }
                }}
                className={inputClass}
              />
            </div>
            <div>
              <label
                htmlFor="businessType"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Business Entity Type (Applicant)
              </label>
              <select
                id="businessType"
                value={businessType}
                onChange={e => setBusinessType(e.target.value)}
                className={inputClass}
              >
                <option value="">Select Business Type</option>
                {Object.entries(fullEntityDocRequirements).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value.displayName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">
                Industry (NAICS/SIC)
              </label>
              <Select
                id="industry"
                isMulti
                options={HIERARCHICAL_NAICS_SIC_OPTIONS}
                value={industry}
                onChange={selectedOptions => setIndustry(selectedOptions || [])}
                className="react-select-container"
                classNamePrefix="react-select"
                placeholder="Select industry codes..."
                getOptionLabel={option => `${option.label}`}
                formatGroupLabel={formatGroupLabel}
                styles={customSelectStyles}
                maxMenuHeight={350}
                menuPosition="fixed"
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                isSearchable={true}
                components={{
                  IndicatorSeparator: () => null,
                }}
              />
              <p className="text-xs text-gray-500 mt-1">
                Search by NAICS or SIC code or description. Select all applicable codes.
              </p>
            </div>
            <div>
              <label
                htmlFor="formationState"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                State of Formation
              </label>
              <select
                id="formationState"
                value={formationState}
                onChange={e => setFormationState(e.target.value)}
                className={inputClass}
              >
                <option value="">Select State</option>
                {US_STATES.map(state => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>
            {/* Conditional County of Registration Field */}
            {businessType === 'sole_proprietorship' && formationState && (
              <div className="md:col-span-1">
                <label
                  htmlFor="countyOfRegistration"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  County of Registration
                </label>
                <select
                  id="countyOfRegistration"
                  value={countyOfRegistration}
                  onChange={e => setCountyOfRegistration(e.target.value)}
                  className={inputClass}
                  disabled={countiesInSelectedState.length === 0}
                >
                  <option value="">Select County</option>
                  {countiesInSelectedState.map(county => (
                    <option key={county} value={county}>
                      {county}
                    </option>
                  ))}
                </select>
                {countiesInSelectedState.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">Select a state to see counties.</p>
                )}
              </div>
            )}

            {/* Business Address Fields */}
            <div className="md:col-span-2">
              <label
                htmlFor="businessAddressStreet"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Business Street Address *
              </label>
              <input
                id="businessAddressStreet"
                type="text"
                value={businessAddressStreet}
                onChange={e => setBusinessAddressStreet(e.target.value)}
                className={inputClass}
                placeholder="Enter street address"
                required
              />
            </div>

            <div>
              <label
                htmlFor="businessAddressCity"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                City *
              </label>
              <input
                id="businessAddressCity"
                type="text"
                value={businessAddressCity}
                onChange={e => setBusinessAddressCity(e.target.value)}
                className={inputClass}
                placeholder="Enter city"
                required
              />
            </div>

            <div>
              <label
                htmlFor="businessAddressState"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                State *
              </label>
              <select
                id="businessAddressState"
                value={businessAddressState}
                onChange={e => setBusinessAddressState(e.target.value)}
                className={inputClass}
                required
              >
                <option value="">Select State</option>
                {US_STATES.map(state => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="businessAddressZip"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                ZIP Code *
              </label>
              <input
                id="businessAddressZip"
                type="text"
                value={businessAddressZip}
                onChange={e => setBusinessAddressZip(e.target.value)}
                className={inputClass}
                placeholder="ZIP Code"
                required
                maxLength={10}
              />
            </div>
          </div>
          {/* Applicant KYB Document Requirements Section */}
          {applicantRequiredKybDocuments.length > 0 && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-300 rounded-md">
              <h4 className="text-base font-medium text-yellow-800 mb-2">
                KYB Requirements for{' '}
                {businessType &&
                  fullEntityDocRequirements[businessType as keyof typeof fullEntityDocRequirements]
                    ?.displayName}
              </h4>

              {/* Primary Document Section */}
              <div className="mb-3 p-3 bg-yellow-100 rounded-md">
                <h5 className="text-sm font-semibold text-yellow-800 mb-1">
                  Primary Verification Document Required:
                </h5>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-yellow-800">{primaryDocumentType}</p>
                  <button
                    type="button"
                    onClick={() => setShowUploadModal('primary')}
                    className={`px-3 py-1 text-sm font-medium text-yellow-800 ${primaryDocumentUploaded ? 'bg-green-200 border-green-400' : 'bg-yellow-200 border-yellow-400'} rounded hover:bg-yellow-300 transition-colors border`}
                  >
                    {primaryDocumentUploaded ? 'Document Uploaded ✓' : 'Upload Document'}
                  </button>
                </div>

                {primaryDocumentUploaded && getUploadedDocumentByType('primary') && (
                  <div className="mt-2 text-xs text-green-800 bg-green-50 p-2 rounded border border-green-200">
                    <p className="font-medium">✓ Document verified on Shield Ledger</p>
                    <p>File: {getUploadedDocumentByType('primary')?.name}</p>
                    <p>
                      Uploaded on:{' '}
                      {getUploadedDocumentByType('primary')?.uploadDate.toLocaleString()}
                    </p>
                    <p>Ledger Hash: {getUploadedDocumentByType('primary')?.ledgerHash}</p>
                  </div>
                )}

                <p className="text-xs text-yellow-700 mt-2">
                  This is the primary document needed to verify your business. Please upload a
                  clear, complete copy. Documents are securely stored as immutable records in Shield
                  Ledger.
                </p>
              </div>

              {/* Updated Supporting Documents Section */}
              <div className="mb-3">
                <h5 className="text-sm font-semibold text-yellow-700 mb-1">
                  Additional Supporting Documents (at least one required):
                </h5>
                <ul className="list-disc list-inside space-y-1 text-xs text-yellow-700 pl-2">
                  {applicantRequiredKybDocuments.map((doc, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span className="flex-1">{doc}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex justify-start">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal('supporting')}
                    className={`px-3 py-1 text-sm font-medium text-yellow-800 ${supportingDocumentsUploaded ? 'bg-green-200 border-green-400' : 'bg-yellow-200 border-yellow-400'} rounded hover:bg-yellow-300 transition-colors border`}
                  >
                    {supportingDocumentsUploaded
                      ? 'Documents Uploaded ✓'
                      : 'Upload Supporting Document(s)'}
                  </button>
                </div>

                {supportingDocumentsUploaded && (
                  <div className="mt-2 text-xs text-green-800 bg-green-50 p-2 rounded border border-green-200">
                    <p className="font-medium">
                      ✓ Supporting documents verified (
                      {uploadedDocuments.filter(d => d.documentType === 'supporting').length})
                    </p>
                    <ul className="mt-1">
                      {uploadedDocuments
                        .filter(d => d.documentType === 'supporting')
                        .map(doc => (
                          <li key={doc.id}>• {doc.name}</li>
                        ))}
                    </ul>
                  </div>
                )}

                <p className="text-xs text-yellow-600 mt-2 italic">
                  Based on your business type and state of formation, please upload at least one
                  supporting document from the list above. All documents are securely stored in
                  Shield Ledger with immutable record-keeping.
                </p>
              </div>

              {/* State-specific Regulations Section */}
              {applicantStateRegulations.length > 0 && (
                <div className="mb-3 border-t border-yellow-200 pt-2">
                  <h5 className="text-sm font-semibold text-yellow-700 mb-1">
                    {formationState} Regulations for{' '}
                    {businessType &&
                      fullEntityDocRequirements[
                        businessType as keyof typeof fullEntityDocRequirements
                      ]?.displayName}
                    :
                  </h5>
                  <ul className="list-disc list-inside space-y-1 text-xs text-yellow-700 pl-2">
                    {applicantStateRegulations.map((regulation, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>{regulation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Filing Fees Section */}
              {applicantFilingFees && (
                <div className="mb-3 border-t border-yellow-200 pt-2">
                  <h5 className="text-sm font-semibold text-yellow-700 mb-1">Filing Fees:</h5>
                  <p className="text-xs text-yellow-700 pl-2">{applicantFilingFees}</p>
                </div>
              )}

              {/* Renewal Requirements Section */}
              {applicantRenewalRequirements && (
                <div className="mb-3 border-t border-yellow-200 pt-2">
                  <h5 className="text-sm font-semibold text-yellow-700 mb-1">
                    Renewal Requirements:
                  </h5>
                  <p className="text-xs text-yellow-700 pl-2">{applicantRenewalRequirements}</p>
                </div>
              )}

              {/* Special Notes Section */}
              {applicantSpecialNotes && (
                <div className="mb-3 border-t border-yellow-200 pt-2">
                  <h5 className="text-sm font-semibold text-yellow-700 mb-1">Special Notes:</h5>
                  <p className="text-xs text-yellow-700 pl-2">{applicantSpecialNotes}</p>
                </div>
              )}

              <p className="mt-3 text-xs text-gray-500 border-t border-yellow-200 pt-2">
                Upload these documents via FileLock Drive. Documentation requirements may vary based
                on your specific business activities.
              </p>
            </div>
          )}
        </div>

        {/* Business Contact Info, Loan Request, Financials, Banking sections - Keep as is for now, but ensure classNames are consistent e.g. input-class */}
        {/* Example for one field, assuming 'input-class' is defined or replaced with actual Tailwind */}
        <div className="mb-8 p-4 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-medium text-gray-700 mb-4 pb-2 border-b">
            Business Contact Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="businessPhone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Business Phone
              </label>
              <input
                id="businessPhone"
                type="tel"
                value={businessPhone}
                onChange={e => setBusinessPhone(e.target.value)}
                className={inputClass}
                placeholder="(XXX) XXX-XXXX"
              />
            </div>
            {/* ... other business contact fields ... */}
            <div>
              <label
                htmlFor="businessEmail"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Business Email
              </label>
              <input
                id="businessEmail"
                type="email"
                value={businessEmail}
                onChange={e => setBusinessEmail(e.target.value)}
                className={inputClass}
                placeholder="email@business.com"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <input
                id="website"
                type="url"
                value={website}
                onChange={e => setWebsite(e.target.value)}
                className={inputClass}
                placeholder="https://www.example.com"
              />
            </div>
          </div>
        </div>
        {/* ... (Loan Request, Financials, Banking Sections here, ensure they use consistent styling) ... */}

        {/* --- Owners Section --- */}
        <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-4">Ownership Information</h3>
        {owners.map((owner, index) => (
          <div key={owner.id} className="mb-6 p-4 border border-gray-300 rounded-lg relative">
            <h4 className="text-lg font-medium text-gray-700 mb-3">
              {owner.isPrimary
                ? 'Primary Owner / Authorized Officer'
                : `Additional Owner ${index + 1}`}
              {owner.ownerType === 'individual' ? ' (Individual)' : ' (Business/Trust)'}
            </h4>
            {!owner.isPrimary && (
              <button
                type="button"
                onClick={() => removeOwner(owner.id)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-xs"
              >
                Remove Owner
              </button>
            )}

            {owner.ownerType === 'individual' && owner.individualDetails && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {/* Individual Owner Fields from image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <input
                    type="text"
                    value={owner.individualDetails.firstName}
                    onChange={e =>
                      handleOwnerInputChange(
                        owner.id,
                        'individualDetails.firstName',
                        e.target.value
                      )
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    type="text"
                    value={owner.individualDetails.lastName}
                    onChange={e =>
                      handleOwnerInputChange(owner.id, 'individualDetails.lastName', e.target.value)
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Title / Position
                  </label>
                  <input
                    type="text"
                    value={owner.individualDetails.title}
                    onChange={e =>
                      handleOwnerInputChange(owner.id, 'individualDetails.title', e.target.value)
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Ownership Percentage (%)
                  </label>
                  <input
                    type="number"
                    value={owner.individualDetails.ownershipPercentage}
                    onChange={e =>
                      handleOwnerInputChange(
                        owner.id,
                        'individualDetails.ownershipPercentage',
                        e.target.value
                      )
                    }
                    className={inputClass}
                  />
                </div>

                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Social Security Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={owner.individualDetails.ssn}
                    onChange={e =>
                      handleOwnerInputChange(owner.id, 'individualDetails.ssn', e.target.value)
                    }
                    className={inputClass}
                    placeholder="XXX-XX-XXXX"
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={owner.individualDetails.dob}
                    onChange={e =>
                      handleOwnerInputChange(owner.id, 'individualDetails.dob', e.target.value)
                    }
                    className={inputClass}
                  />
                </div>

                {/* SSN Signature Pad for Individual Owner */}
                <div className="md:col-span-2 mt-1 mb-3 p-3 border border-gray-300 rounded-md">
                  <p className="text-xs text-gray-600 mb-1">
                    E-sign for SSN for {owner.individualDetails.firstName || 'this owner'}:
                  </p>
                  <div
                    className="bg-gray-100 border border-gray-400 rounded-md"
                    style={{ minHeight: '100px', maxHeight: '120px', width: '100%' }}
                  >
                    <SignatureCanvas
                      ref={ref => {
                        sigPadRefs.current[`${owner.id}_ssn`] = ref;
                      }}
                      penColor="black"
                      canvasProps={{
                        className: 'w-full h-full',
                        style: { minHeight: '100px', maxHeight: '120px' },
                      }}
                      onEnd={() => {
                        const sigData = sigPadRefs.current[`${owner.id}_ssn`]?.toDataURL() || null;
                        handleOwnerSignatureEnd(owner.id, sigData, 'ssn');
                      }}
                    />
                  </div>
                  <div className="mt-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => clearOwnerSignature(owner.id, 'ssn')}
                      className={btnSecondaryXsClass}
                    >
                      Clear Signature
                    </button>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Citizenship Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={owner.individualDetails.citizenshipStatus}
                    onChange={e =>
                      handleOwnerInputChange(
                        owner.id,
                        'individualDetails.citizenshipStatus',
                        e.target.value
                      )
                    }
                    className={inputClass}
                  >
                    <option value="">Select Citizenship Status</option>
                    {Object.entries(CITIZENSHIP_DOCUMENT_REQUIREMENTS).map(([key, value]) => (
                      <option key={key} value={key}>
                        {value.displayName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Display Required KYD Documents for Individual Owner */}
                {owner.individualDetails.requiredKydDocumentsList.length > 0 && (
                  <div className="md:col-span-2 mt-2 p-3 bg-blue-50 border border-blue-300 rounded-md">
                    <h5 className="text-sm font-medium text-blue-800 mb-1">
                      Required Proof of Identity Documents for this Owner:
                    </h5>
                    <ul className="list-disc list-inside space-y-1 text-xs text-blue-700">
                      {owner.individualDetails.requiredKydDocumentsList.map((doc, i) => (
                        <li key={i} className="flex items-start">
                          <span className="mr-2">•</span>
                          <span className="flex-1">{doc}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3 flex justify-start">
                      <button
                        type="button"
                        onClick={() => setShowUploadModal('kyd')}
                        className={`px-3 py-1 text-sm font-medium text-blue-700 ${supportingDocumentsUploaded ? 'bg-green-200 border-green-400' : 'bg-blue-200 border-blue-400'} rounded hover:bg-blue-300 transition-colors border`}
                      >
                        {supportingDocumentsUploaded
                          ? 'Documents Uploaded ✓'
                          : 'Upload Identity Document(s)'}
                      </button>
                    </div>
                    <p className="text-xs text-blue-600 mt-2 italic">
                      Documents are secured with FileLink technology and stored as immutable records
                      on Shield Ledger for KYD compliance.
                    </p>
                  </div>
                )}
                {/* Address, Contact for Individual Owner */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Home Address (Street)
                  </label>
                  <input
                    type="text"
                    value={owner.individualDetails.homeAddressStreet}
                    onChange={e =>
                      handleOwnerInputChange(
                        owner.id,
                        'individualDetails.homeAddressStreet',
                        e.target.value
                      )
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <input
                    type="text"
                    value={owner.individualDetails.homeAddressCity}
                    onChange={e =>
                      handleOwnerInputChange(
                        owner.id,
                        'individualDetails.homeAddressCity',
                        e.target.value
                      )
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">State</label>
                  <input
                    type="text"
                    value={owner.individualDetails.homeAddressState}
                    onChange={e =>
                      handleOwnerInputChange(
                        owner.id,
                        'individualDetails.homeAddressState',
                        e.target.value
                      )
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Zip Code</label>
                  <input
                    type="text"
                    value={owner.individualDetails.homeAddressZip}
                    onChange={e =>
                      handleOwnerInputChange(
                        owner.id,
                        'individualDetails.homeAddressZip',
                        e.target.value
                      )
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Phone</label>
                  <input
                    type="tel"
                    value={owner.individualDetails.contactPhone}
                    onChange={e =>
                      handleOwnerInputChange(
                        owner.id,
                        'individualDetails.contactPhone',
                        e.target.value
                      )
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={owner.individualDetails.email}
                    onChange={e =>
                      handleOwnerInputChange(owner.id, 'individualDetails.email', e.target.value)
                    }
                    className={inputClass}
                  />
                </div>

                {/* Authorization Checkboxes for Individual Owner */}
                <div className="md:col-span-2 mt-3 space-y-2">
                  <div className="flex items-start">
                    <input
                      id={'auth1_' + owner.id}
                      type="checkbox"
                      checked={owner.individualDetails.authorizationCheck1}
                      onChange={e =>
                        handleOwnerInputChange(
                          owner.id,
                          'individualDetails.authorizationCheck1',
                          e.target.checked
                        )
                      }
                      className={'mt-0.5 ' + checkboxClass}
                    />{' '}
                    <label htmlFor={'auth1_' + owner.id} className="ml-2 text-sm text-gray-700">
                      By filling out, you confirm the accuracy of the information provided and
                      authorize verification. Your data may be shared for processing and will be
                      protected according to our Privacy Policy. Submission does not guarantee
                      approval.
                    </label>
                  </div>
                  <div className="flex items-start">
                    <input
                      id={'auth2_' + owner.id}
                      type="checkbox"
                      checked={owner.individualDetails.authorizationCheck2}
                      onChange={e =>
                        handleOwnerInputChange(
                          owner.id,
                          'individualDetails.authorizationCheck2',
                          e.target.checked
                        )
                      }
                      className={'mt-0.5 ' + checkboxClass}
                    />{' '}
                    <label htmlFor={'auth2_' + owner.id} className="ml-2 text-sm text-gray-700">
                      I am authorized to request credit, and debt for{' '}
                      {legalBusinessName || '{business name}'}.
                    </label>
                  </div>
                  <div className="flex items-start">
                    <input
                      id={'auth3_' + owner.id}
                      type="checkbox"
                      checked={owner.individualDetails.authorizationCheck3}
                      onChange={e =>
                        handleOwnerInputChange(
                          owner.id,
                          'individualDetails.authorizationCheck3',
                          e.target.checked
                        )
                      }
                      className={'mt-0.5 ' + checkboxClass}
                    />{' '}
                    <label htmlFor={'auth3_' + owner.id} className="ml-2 text-sm text-gray-700">
                      I Consent for my business and myself for credit checks, background checks, and
                      public records.
                    </label>
                  </div>
                </div>
              </div>
            )}

            {owner.ownerType === 'business_trust' && owner.businessTrustDetails && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Placeholder for Business/Trust Owner Fields */}
                <div>
                  <label>Entity Name</label>
                  <input
                    type="text"
                    value={owner.businessTrustDetails.entityName}
                    onChange={e =>
                      handleOwnerInputChange(
                        owner.id,
                        'businessTrustDetails.entityName',
                        e.target.value
                      )
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label>EIN</label>
                  <input
                    type="text"
                    value={owner.businessTrustDetails.ein}
                    onChange={e =>
                      handleOwnerInputChange(owner.id, 'businessTrustDetails.ein', e.target.value)
                    }
                    className={inputClass}
                  />
                </div>
                {/* ... more fields + EIN signature + KYB docs for this entity ... */}
                <p className="text-sm text-gray-500 md:col-span-2">
                  (More fields for Business/Trust owners, including EIN signature and KYB document
                  list, will be implemented here.)
                </p>
              </div>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addOwner}
          className="mt-2 mb-6 px-3 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Add Another Owner
        </button>

        {/* Overall Authorization and Certification (for the main application) */}
        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-medium text-gray-700 mb-4 pb-2 border-b">
            Application Authorization and Certification
          </h3>
          <div className="space-y-3">
            <div className="flex items-start">
              <input
                id="mainAuthorization"
                type="checkbox"
                required
                checked={mainAuthorization}
                onChange={e => setMainAuthorization(e.target.checked)}
                className={`h-4 w-4 mt-0.5 ${checkboxClass}`}
              />
              <label htmlFor="mainAuthorization" className="ml-2 text-sm text-gray-700">
                I authorize the lender to verify any information provided on this application and to
                obtain credit reports on the business and personal guarantors (as applicable).
              </label>
            </div>
            <div className="flex items-start">
              <input
                id="mainCertification"
                type="checkbox"
                required
                checked={mainCertification}
                onChange={e => setMainCertification(e.target.checked)}
                className={`h-4 w-4 mt-0.5 ${checkboxClass}`}
              />
              <label htmlFor="mainCertification" className="ml-2 text-sm text-gray-700">
                I certify that all information provided in this application is true, accurate, and
                complete to the best of my knowledge.
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 mt-8">
          <button type="button" onClick={handleSave} className={btnSecondaryClass}>
            Save as Draft
          </button>
          <button type="submit" className={btnPrimaryClass}>
            Submit Application
          </button>
        </div>
      </form>

      {/* Document Upload Modals */}
      {showUploadModal === 'primary' && (
        <DocumentUploadModal
          isOpen={true}
          docType="Primary Document"
          requiredDocuments={[primaryDocumentType]}
          docDescription="This is the primary document needed to verify your business entity. Please upload a clear, complete copy."
          onClose={() => setShowUploadModal(null)}
          onUploadComplete={doc =>
            handleDocumentUploadComplete({ ...doc, documentType: 'primary' })
          }
          onExtractedData={handleExtractedData}
        />
      )}

      {showUploadModal === 'supporting' && (
        <DocumentUploadModal
          isOpen={true}
          docType="Supporting Document"
          requiredDocuments={applicantRequiredKybDocuments}
          docDescription="Please upload at least one supporting document to verify your business entity."
          onClose={() => setShowUploadModal(null)}
          onUploadComplete={doc =>
            handleDocumentUploadComplete({ ...doc, documentType: 'supporting' })
          }
          onExtractedData={handleExtractedData}
        />
      )}

      {showUploadModal === 'kyd' && (
        <DocumentUploadModal
          isOpen={true}
          docType="Identity Document"
          requiredDocuments={
            owners.find(o => o.isPrimary)?.individualDetails?.requiredKydDocumentsList || []
          }
          docDescription="Please upload documents to verify your identity."
          onClose={() => setShowUploadModal(null)}
          onUploadComplete={doc => handleDocumentUploadComplete({ ...doc, documentType: 'kyd' })}
          onExtractedData={fields => {
            // Handle KYD document data differently - update owner fields
            const primaryOwner = owners.find(o => o.isPrimary);
            if (primaryOwner && primaryOwner.individualDetails && fields) {
              // Create a copy of owners array
              const updatedOwners = [...owners];
              // Find index of primary owner
              const index = updatedOwners.findIndex(o => o.isPrimary);

              if (index !== -1) {
                // Update specific fields
                if (fields.firstName)
                  updatedOwners[index].individualDetails!.firstName = fields.firstName;
                if (fields.lastName)
                  updatedOwners[index].individualDetails!.lastName = fields.lastName;
                if (fields.ssn) updatedOwners[index].individualDetails!.ssn = fields.ssn;
                if (fields.dob) updatedOwners[index].individualDetails!.dob = fields.dob;
                if (fields.address)
                  updatedOwners[index].individualDetails!.homeAddressStreet = fields.address;

                // Update state
                setOwners(updatedOwners);

                // Display notification
                // eslint-disable-next-line no-console
                console.info(
                  'Owner information has been updated with data extracted from your identity document.'
                );
              }
            }
          }}
        />
      )}
    </div>
  );
};

// Export both as named export and default
export { CreditApplication as default, CreditApplication };
