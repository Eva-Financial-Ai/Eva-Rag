import React, { useState, useEffect } from 'react';

export interface BusinessEntity {
  type: 'corporation' | 'llc' | 'partnership' | 'sole_proprietorship' | 'trust' | 'government';
  formationState: string;
  incorporationDate?: string;
  parentEntity?: string;
  isMultiMember?: boolean;
  hasSubsidiaries?: boolean;
}

export interface KYBDocument {
  id: string;
  name: string;
  description: string;
  category: 'formation' | 'ownership' | 'authorization' | 'verification' | 'financial';
  required: boolean;
  urgency: 'high' | 'medium' | 'low';
  stateSpecific: boolean;
  acceptedFormats: string[];
  maxAgeMonths?: number;
  alternatives?: string[];
}

interface KYBDocumentRequirementsProps {
  businessEntity: BusinessEntity;
  onDocumentsUpdated: (documents: KYBDocument[]) => void;
  existingDocuments?: string[];
}

const KYBDocumentRequirements: React.FC<KYBDocumentRequirementsProps> = ({
  businessEntity,
  onDocumentsUpdated,
  existingDocuments = [],
}) => {
  const [requiredDocuments, setRequiredDocuments] = useState<KYBDocument[]>([]);
  const [loading, setLoading] = useState(true);

  // State-specific requirements mapping
  const stateRequirements = {
    delaware: {
      corporation: ['certificate_of_incorporation', 'certificate_of_good_standing', 'bylaws'],
      llc: ['certificate_of_formation', 'operating_agreement', 'certificate_of_good_standing'],
    },
    california: {
      corporation: ['articles_of_incorporation', 'statement_of_information', 'bylaws'],
      llc: ['articles_of_organization', 'operating_agreement', 'statement_of_information'],
    },
    nevada: {
      corporation: [
        'articles_of_incorporation',
        'list_of_officers',
        'certificate_of_good_standing',
      ],
      llc: ['articles_of_organization', 'operating_agreement', 'list_of_managers'],
    },
    texas: {
      corporation: ['certificate_of_formation', 'registered_agent_form', 'franchise_tax_account'],
      llc: ['certificate_of_formation', 'registered_agent_form', 'franchise_tax_account'],
    },
    florida: {
      corporation: ['articles_of_incorporation', 'annual_report', 'registered_agent_designation'],
      llc: ['articles_of_organization', 'annual_report', 'registered_agent_designation'],
    },
    new_york: {
      corporation: [
        'certificate_of_incorporation',
        'tax_clearance_certificate',
        'publication_affidavit',
      ],
      llc: ['articles_of_organization', 'publication_proof', 'biennial_statement'],
    },
  };

  // Document templates with state-specific variations
  const documentTemplates: Record<string, Omit<KYBDocument, 'id'>> = {
    // Formation Documents
    articles_of_incorporation: {
      name: 'Articles of Incorporation',
      description: 'Legal document establishing the corporation',
      category: 'formation',
      required: true,
      urgency: 'high',
      stateSpecific: true,
      acceptedFormats: ['pdf', 'doc', 'docx', 'jpg', 'png'],
      maxAgeMonths: 36,
    },
    certificate_of_incorporation: {
      name: 'Certificate of Incorporation',
      description: 'State-issued certificate of corporate formation',
      category: 'formation',
      required: true,
      urgency: 'high',
      stateSpecific: true,
      acceptedFormats: ['pdf', 'doc', 'docx', 'jpg', 'png'],
      maxAgeMonths: 36,
    },
    articles_of_organization: {
      name: 'Articles of Organization',
      description: 'Legal document establishing the LLC',
      category: 'formation',
      required: true,
      urgency: 'high',
      stateSpecific: true,
      acceptedFormats: ['pdf', 'doc', 'docx', 'jpg', 'png'],
      maxAgeMonths: 36,
    },
    certificate_of_formation: {
      name: 'Certificate of Formation',
      description: 'State-issued certificate of business formation',
      category: 'formation',
      required: true,
      urgency: 'high',
      stateSpecific: true,
      acceptedFormats: ['pdf', 'doc', 'docx', 'jpg', 'png'],
      maxAgeMonths: 36,
    },

    // Good Standing Documents
    certificate_of_good_standing: {
      name: 'Certificate of Good Standing',
      description: 'Current standing with state authorities',
      category: 'verification',
      required: true,
      urgency: 'high',
      stateSpecific: true,
      acceptedFormats: ['pdf', 'doc', 'docx', 'jpg', 'png'],
      maxAgeMonths: 6,
    },

    // Ownership & Governance Documents
    operating_agreement: {
      name: 'Operating Agreement',
      description: 'LLC management and ownership structure',
      category: 'ownership',
      required: true,
      urgency: 'medium',
      stateSpecific: false,
      acceptedFormats: ['pdf', 'doc', 'docx'],
      maxAgeMonths: 24,
    },
    bylaws: {
      name: 'Corporate Bylaws',
      description: 'Corporation governance and operational rules',
      category: 'ownership',
      required: true,
      urgency: 'medium',
      stateSpecific: false,
      acceptedFormats: ['pdf', 'doc', 'docx'],
      maxAgeMonths: 24,
    },
    partnership_agreement: {
      name: 'Partnership Agreement',
      description: 'Partnership terms and ownership structure',
      category: 'ownership',
      required: true,
      urgency: 'medium',
      stateSpecific: false,
      acceptedFormats: ['pdf', 'doc', 'docx'],
      maxAgeMonths: 24,
    },

    // Authorization Documents
    board_resolution: {
      name: 'Board Resolution',
      description: 'Corporate authorization for borrowing/transactions',
      category: 'authorization',
      required: true,
      urgency: 'high',
      stateSpecific: false,
      acceptedFormats: ['pdf', 'doc', 'docx'],
      maxAgeMonths: 12,
    },
    corporate_resolution: {
      name: 'Corporate Resolution',
      description: 'Board authorization for specific transactions',
      category: 'authorization',
      required: true,
      urgency: 'high',
      stateSpecific: false,
      acceptedFormats: ['pdf', 'doc', 'docx'],
      maxAgeMonths: 12,
    },
    member_resolution: {
      name: 'Member Resolution',
      description: 'LLC member authorization for transactions',
      category: 'authorization',
      required: true,
      urgency: 'high',
      stateSpecific: false,
      acceptedFormats: ['pdf', 'doc', 'docx'],
      maxAgeMonths: 12,
    },

    // Verification Documents
    registered_agent_designation: {
      name: 'Registered Agent Designation',
      description: 'Legal representative for service of process',
      category: 'verification',
      required: true,
      urgency: 'medium',
      stateSpecific: true,
      acceptedFormats: ['pdf', 'doc', 'docx', 'jpg', 'png'],
      maxAgeMonths: 12,
    },
    ein_verification: {
      name: 'EIN Verification Letter',
      description: 'IRS confirmation of tax identification number',
      category: 'verification',
      required: true,
      urgency: 'high',
      stateSpecific: false,
      acceptedFormats: ['pdf', 'doc', 'docx', 'jpg', 'png'],
      maxAgeMonths: 60,
    },

    // Beneficial Ownership
    beneficial_ownership_certification: {
      name: 'Beneficial Ownership Certification',
      description: 'FinCEN CDD Rule compliance (25%+ ownership)',
      category: 'ownership',
      required: true,
      urgency: 'high',
      stateSpecific: false,
      acceptedFormats: ['pdf', 'doc', 'docx'],
      maxAgeMonths: 12,
    },
    ownership_structure_chart: {
      name: 'Ownership Structure Chart',
      description: 'Visual representation of ownership hierarchy',
      category: 'ownership',
      required: true,
      urgency: 'medium',
      stateSpecific: false,
      acceptedFormats: ['pdf', 'doc', 'docx', 'jpg', 'png'],
      maxAgeMonths: 12,
    },

    // Financial Documents
    audited_financial_statements: {
      name: 'Audited Financial Statements',
      description: 'CPA-audited annual financial statements',
      category: 'financial',
      required: false,
      urgency: 'low',
      stateSpecific: false,
      acceptedFormats: ['pdf', 'doc', 'docx'],
      maxAgeMonths: 18,
    },
    tax_returns: {
      name: 'Business Tax Returns',
      description: 'Federal and state tax returns (last 2 years)',
      category: 'financial',
      required: true,
      urgency: 'medium',
      stateSpecific: false,
      acceptedFormats: ['pdf'],
      maxAgeMonths: 15,
    },

    // State-Specific Additional Documents
    franchise_tax_account: {
      name: 'Franchise Tax Account Status',
      description: 'Texas franchise tax compliance verification',
      category: 'verification',
      required: true,
      urgency: 'medium',
      stateSpecific: true,
      acceptedFormats: ['pdf', 'doc', 'docx', 'jpg', 'png'],
      maxAgeMonths: 12,
    },
    publication_proof: {
      name: 'Publication Proof',
      description: 'Proof of required legal publication (NY LLCs)',
      category: 'verification',
      required: true,
      urgency: 'medium',
      stateSpecific: true,
      acceptedFormats: ['pdf', 'doc', 'docx', 'jpg', 'png'],
      maxAgeMonths: 24,
    },
  };

  // Determine required documents based on business entity and state
  const determineRequiredDocuments = (): KYBDocument[] => {
    const documents: KYBDocument[] = [];
    const state = businessEntity.formationState.toLowerCase().replace(/\s+/g, '_');

    // Base documents for all entities
    documents.push({
      id: 'ein_verification',
      ...documentTemplates.ein_verification,
    });

    documents.push({
      id: 'beneficial_ownership_certification',
      ...documentTemplates.beneficial_ownership_certification,
    });

    // Entity-specific documents
    switch (businessEntity.type) {
      case 'corporation':
        // Formation documents
        if (stateRequirements[state]?.corporation?.includes('articles_of_incorporation')) {
          documents.push({
            id: 'articles_of_incorporation',
            ...documentTemplates.articles_of_incorporation,
          });
        } else {
          documents.push({
            id: 'certificate_of_incorporation',
            ...documentTemplates.certificate_of_incorporation,
          });
        }

        // Governance documents
        documents.push({
          id: 'bylaws',
          ...documentTemplates.bylaws,
        });

        // Authorization documents
        documents.push({
          id: 'board_resolution',
          ...documentTemplates.board_resolution,
        });

        // Good standing
        documents.push({
          id: 'certificate_of_good_standing',
          ...documentTemplates.certificate_of_good_standing,
        });
        break;

      case 'llc':
        // Formation documents
        if (stateRequirements[state]?.llc?.includes('articles_of_organization')) {
          documents.push({
            id: 'articles_of_organization',
            ...documentTemplates.articles_of_organization,
          });
        } else {
          documents.push({
            id: 'certificate_of_formation',
            ...documentTemplates.certificate_of_formation,
          });
        }

        // Governance documents
        documents.push({
          id: 'operating_agreement',
          ...documentTemplates.operating_agreement,
          required: businessEntity.isMultiMember !== false, // Required for multi-member LLCs
        });

        // Authorization documents
        if (businessEntity.isMultiMember) {
          documents.push({
            id: 'member_resolution',
            ...documentTemplates.member_resolution,
          });
        }

        // Good standing
        documents.push({
          id: 'certificate_of_good_standing',
          ...documentTemplates.certificate_of_good_standing,
        });
        break;

      case 'partnership':
        documents.push({
          id: 'partnership_agreement',
          ...documentTemplates.partnership_agreement,
        });

        documents.push({
          id: 'certificate_of_formation',
          ...documentTemplates.certificate_of_formation,
          name: 'Certificate of Partnership',
          description: 'State registration of partnership',
        });
        break;

      case 'sole_proprietorship':
        documents.push({
          id: 'dba_certificate',
          name: 'DBA Certificate',
          description: 'Doing Business As registration',
          category: 'formation',
          required: true,
          urgency: 'high',
          stateSpecific: true,
          acceptedFormats: ['pdf', 'doc', 'docx', 'jpg', 'png'],
          maxAgeMonths: 24,
        });

        documents.push({
          id: 'business_license',
          name: 'Business License',
          description: 'Local business operation license',
          category: 'verification',
          required: true,
          urgency: 'medium',
          stateSpecific: true,
          acceptedFormats: ['pdf', 'doc', 'docx', 'jpg', 'png'],
          maxAgeMonths: 12,
        });
        break;
    }

    // Add state-specific documents
    if (state === 'texas') {
      documents.push({
        id: 'franchise_tax_account',
        ...documentTemplates.franchise_tax_account,
      });
    }

    if (state === 'new_york' && businessEntity.type === 'llc') {
      documents.push({
        id: 'publication_proof',
        ...documentTemplates.publication_proof,
      });
    }

    // Add registered agent for all except sole proprietorships
    if (businessEntity.type !== 'sole_proprietorship') {
      documents.push({
        id: 'registered_agent_designation',
        ...documentTemplates.registered_agent_designation,
      });
    }

    // Add ownership structure for complex entities
    if (businessEntity.hasSubsidiaries || businessEntity.parentEntity) {
      documents.push({
        id: 'ownership_structure_chart',
        ...documentTemplates.ownership_structure_chart,
        required: true,
        urgency: 'high',
      });
    }

    // Add financial documents
    documents.push({
      id: 'tax_returns',
      ...documentTemplates.tax_returns,
    });

    // Audited financials for larger entities
    if (businessEntity.type === 'corporation' || businessEntity.hasSubsidiaries) {
      documents.push({
        id: 'audited_financial_statements',
        ...documentTemplates.audited_financial_statements,
        required: true,
        urgency: 'medium',
      });
    }

    return documents.sort((a, b) => {
      // Sort by urgency (high first), then required status, then alphabetically
      const urgencyOrder = { high: 0, medium: 1, low: 2 };
      if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
        return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
      }
      if (a.required !== b.required) {
        return a.required ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
  };

  useEffect(() => {
    setLoading(true);
    const documents = determineRequiredDocuments();
    setRequiredDocuments(documents);
    onDocumentsUpdated(documents);
    setLoading(false);
  }, [businessEntity]);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'text-red-700 bg-red-100 border-red-200';
      case 'medium':
        return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'low':
        return 'text-green-700 bg-green-100 border-green-200';
      default:
        return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'formation':
        return '📋';
      case 'ownership':
        return '👥';
      case 'authorization':
        return '✍️';
      case 'verification':
        return '✅';
      case 'financial':
        return '💰';
      default:
        return '📄';
    }
  };

  const isDocumentSubmitted = (documentId: string) => {
    return existingDocuments.includes(documentId);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">KYB Document Requirements</h3>
        <p className="text-sm text-gray-600">
          Based on your {businessEntity.type.replace('_', ' ')} formation in{' '}
          {businessEntity.formationState}, the following documents are required for verification:
        </p>
      </div>

      <div className="space-y-4">
        {requiredDocuments.map(doc => (
          <div
            key={doc.id}
            className={`border rounded-lg p-4 ${
              isDocumentSubmitted(doc.id)
                ? 'bg-green-50 border-green-200'
                : doc.required
                  ? 'bg-white border-gray-300'
                  : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <span className="text-xl mr-2">{getCategoryIcon(doc.category)}</span>
                  <h4 className="font-medium text-gray-900">{doc.name}</h4>
                  {doc.required && <span className="ml-2 text-red-500 text-sm">*</span>}
                  {isDocumentSubmitted(doc.id) && (
                    <span className="ml-2 text-green-600 text-sm">✓ Submitted</span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2">{doc.description}</p>

                <div className="flex flex-wrap gap-2 mb-2">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(
                      doc.urgency
                    )}`}
                  >
                    {doc.urgency.charAt(0).toUpperCase() + doc.urgency.slice(1)} Priority
                  </span>

                  {doc.stateSpecific && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                      State-Specific
                    </span>
                  )}

                  {doc.maxAgeMonths && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                      Max Age: {doc.maxAgeMonths} months
                    </span>
                  )}
                </div>

                <div className="text-xs text-gray-500">
                  Accepted formats: {doc.acceptedFormats.join(', ').toUpperCase()}
                </div>
              </div>

              <div className="ml-4">
                {!isDocumentSubmitted(doc.id) && (
                  <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                    Upload
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">📋 KYB Process Summary</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <p>
            • <strong>Required Documents:</strong>{' '}
            {requiredDocuments.filter(doc => doc.required).length} of {requiredDocuments.length}{' '}
            total
          </p>
          <p>
            • <strong>High Priority:</strong>{' '}
            {requiredDocuments.filter(doc => doc.urgency === 'high').length} documents
          </p>
          <p>
            • <strong>State-Specific:</strong>{' '}
            {requiredDocuments.filter(doc => doc.stateSpecific).length} documents
          </p>
          <p>
            • <strong>Submitted:</strong> {existingDocuments.length} of{' '}
            {requiredDocuments.filter(doc => doc.required).length} required documents
          </p>
        </div>
      </div>
    </div>
  );
};

export default KYBDocumentRequirements;
