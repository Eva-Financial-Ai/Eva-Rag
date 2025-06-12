import React, { useCallback, useState } from 'react';
import { useEVACustomerContext } from '../contexts/EVACustomerContext';
import { BusinessLookupTool } from '../tools/BusinessLookupTool';
import { BusinessLookupResult, BusinessRecord } from '../types/businessLookup';
import { logError } from '../utils/auditLogger';

interface EVABusinessLookupIntegrationProps {
  isVisible: boolean;
  onLookupComplete: (results: EVAFormattedResults) => void;
  onLookupError: (error: string) => void;
  onClose: () => void;
  businessName?: string;
  dbaName?: string;
  states?: string[];
}

interface EVAFormattedResults {
  summary: string;
  businessRecords: BusinessRecord[];
  documentCount: number;
  evaContext: {
    conversationSummary: string;
    nextSteps: string[];
    complianceNotes: string[];
  };
}

const formatEntityType = (type: string): string => {
  const typeMap: Record<string, string> = {
    corporation: 'Corporation',
    llc: 'Limited Liability Company',
    partnership: 'Partnership',
    sole_proprietorship: 'Sole Proprietorship',
    lp: 'Limited Partnership',
    llp: 'Limited Liability Partnership',
    nonprofit: 'Nonprofit Organization',
    cooperative: 'Cooperative',
    benefit_corporation: 'Benefit Corporation',
    professional_corporation: 'Professional Corporation',
    series_llc: 'Series LLC',
    pllc: 'Professional LLC',
    statutory_trust: 'Statutory Trust',
    business_trust: 'Business Trust',
    general_partnership: 'General Partnership',
    other: 'Other Entity Type',
  };
  return typeMap[type] || type.charAt(0).toUpperCase() + type.slice(1);
};

const formatStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    active: 'Active & In Good Standing',
    inactive: 'Inactive',
    suspended: 'Suspended',
    dissolved: 'Dissolved',
    revoked: 'Revoked',
    withdrawn: 'Withdrawn',
    merged: 'Merged',
    converted: 'Converted',
    administratively_dissolved: 'Administratively Dissolved',
    pending: 'Pending',
    expired: 'Expired',
    forfeited: 'Forfeited',
    void: 'Void',
    other: 'Other Status',
  };
  return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1);
};

const emptyUpdate = async () => {};

export const EVABusinessLookupIntegration: React.FC<EVABusinessLookupIntegrationProps> = ({
  isVisible,
  onLookupComplete,
  onLookupError,
  onClose,
  businessName = '',
  dbaName,
  states,
}) => {
  const evaCustomerContext = useEVACustomerContext();
  const customer = evaCustomerContext?.selectedCustomer;
  const updateCustomerBusinessRecords =
    evaCustomerContext?.updateCustomerBusinessRecords || emptyUpdate;
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [lookupProgress, setLookupProgress] = useState<string>('');

  // Auto-populate from customer context if available
  const defaultBusinessName = businessName || customer?.businessName || '';
  const defaultStates = states || [];

  const handleLookupComplete = useCallback(
    async (results: BusinessLookupResult) => {
      const generateConversationSummary = (
        records: BusinessRecord[],
        documents: string[],
        errors: string[],
      ): string => {
        if (records.length === 0) {
          return `❌ **Business Lookup Complete - No Results Found**
    
    I searched across ${errors.length > 0 ? 'multiple' : 'available'} state registries but couldn't find any records for "${defaultBusinessName}".
    
    ${
      errors.length > 0
        ? `**Issues encountered:**\n${errors
            .slice(0, 3)
            .map(e => `• ${e}`)
            .join('\n')}\n\n`
        : ''
    }
    
    **Possible reasons:**
    • Business name spelling variation
    • Registered under different name or DBA
    • Recently formed (not yet in database)
    • Registered in different state than searched
    
    **Next steps:**
    • Try alternative business name spellings
    • Search with DBA or "doing business as" name
    • Expand search to additional states
    • Verify business formation status`;
        }

        const states = [...new Set(records.map(r => r.state))];

        let summary = `✅ **Business Lookup Complete - ${records.length} Record${records.length > 1 ? 's' : ''} Found**\n\n`;

        // Main business information
        records.forEach((record, index) => {
          const statusEmoji =
            record.status === 'active'
              ? '🟢'
              : record.status === 'inactive'
                ? '🟡'
                : record.status === 'suspended'
                  ? '🔴'
                  : '⚪';

          summary += `${index === 0 ? '📋 **Primary Record:**' : `📋 **Additional Record ${index + 1}:**`}\n`;
          summary += `• **Name:** ${record.businessName}\n`;
          summary += `• **State:** ${record.state}\n`;
          summary += `• **Type:** ${formatEntityType(record.entityType)}\n`;
          summary += `• **Status:** ${statusEmoji} ${formatStatus(record.status)}\n`;
          summary += `• **Filing #:** ${record.filingNumber}\n`;

          if (record.formationDate) {
            summary += `• **Formed:** ${new Date(record.formationDate).toLocaleDateString()}\n`;
          }

          if (record.registeredAgent) {
            summary += `• **Registered Agent:** ${typeof record.registeredAgent === 'string' ? record.registeredAgent : record.registeredAgent.name}\n`;
          }

          summary += '\n';
        });

        // Document summary
        if (documents.length > 0) {
          summary += `📄 **Documents Retrieved:** ${documents.length} document${documents.length > 1 ? 's' : ''}\n`;
          summary += `• Certificates and formations ✓\n`;
          summary += `• Annual reports and filings ✓\n`;
          summary += `• Registered agent information ✓\n\n`;
        }

        // Multi-state operations
        if (states.length > 1) {
          summary += `🌎 **Multi-State Operations:** Active in ${states.length} states\n`;
          summary += `• States: ${states.join(', ')}\n\n`;
        }

        return summary;
      };

      const generateNextSteps = (records: BusinessRecord[]): string[] => {
        const steps: string[] = [];

        if (records.length === 0) {
          return [
            'Try searching with alternative business name variations',
            'Search using DBA or trade names',
            'Expand search to additional states',
            'Verify business formation with business owner',
          ];
        }

        const activeRecords = records.filter(r => r.status === 'active');
        const inactiveRecords = records.filter(r => r.status !== 'active');

        if (activeRecords.length > 0) {
          steps.push('Review business documents for compliance requirements');
          steps.push('Verify current registered agent information');
          steps.push('Check annual report filing status');
        }

        if (inactiveRecords.length > 0) {
          steps.push('Investigate status of inactive business entities');
          steps.push('Determine if business reinstatement is needed');
        }

        const states = [...new Set(records.map(r => r.state))];
        if (states.length > 1) {
          steps.push('Review multi-state compliance requirements');
          steps.push('Verify good standing status in all states');
        }

        steps.push('Update customer profile with business information');
        steps.push('Set up monitoring for future compliance changes');

        return steps;
      };

      const generateComplianceNotes = (records: BusinessRecord[]): string[] => {
        const notes: string[] = [];

        records.forEach(record => {
          const currentYear = new Date().getFullYear();

          // Status-based compliance notes
          if (record.status === 'active') {
            notes.push(`✅ ${record.state}: Business in good standing`);
          } else if (record.status === 'suspended') {
            notes.push(`⚠️ ${record.state}: Business suspended - may need reinstatement`);
          } else if (record.status === 'dissolved') {
            notes.push(`🚫 ${record.state}: Business dissolved - verify current operations`);
          }

          // Formation date compliance
          if (record.formationDate) {
            const formationYear = new Date(record.formationDate).getFullYear();
            if (currentYear - formationYear > 1) {
              notes.push(`📅 ${record.state}: Check ${currentYear} annual report filing status`);
            }
          }

          // Entity-specific compliance
          if (record.entityType === 'llc' && record.state === 'NY') {
            notes.push(`📰 NY LLC: Verify biennial publication requirement compliance`);
          }

          if (record.entityType === 'corporation') {
            notes.push(`🏢 ${record.state}: Verify corporate governance and meeting requirements`);
          }
        });

        return notes;
      };

      const formatResultsForEVA = (results: BusinessLookupResult): EVAFormattedResults => {
        const { businessRecords, documents, errors } = results;

        // Generate conversation summary
        const conversationSummary = generateConversationSummary(
          businessRecords,
          documents.map(doc => doc.toString()),
          errors,
        );

        // Generate next steps
        const nextSteps = generateNextSteps(businessRecords);

        // Generate compliance notes
        const complianceNotes = generateComplianceNotes(businessRecords);

        return {
          summary: conversationSummary,
          businessRecords,
          documentCount: documents.length,
          evaContext: {
            conversationSummary,
            nextSteps,
            complianceNotes,
          },
        };
      };

      setIsProcessing(true);
      setLookupProgress('Processing results for EVA...');

      try {
        // Store results in customer context
        if (customer?.id) {
          await updateCustomerBusinessRecords(customer.id, results.businessRecords);
        }

        // Format results for EVA conversation
        const evaResults = formatResultsForEVA(results);

        setLookupProgress('Analysis complete');
        onLookupComplete(evaResults);
      } catch (error) {
        logError('business_lookup', error, {
          customerId: customer?.id,
          businessName: defaultBusinessName,
        });
        onLookupError(
          `Failed to process results: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      } finally {
        setIsProcessing(false);
      }
    },
    [customer, updateCustomerBusinessRecords, onLookupComplete, onLookupError, defaultBusinessName],
  );

  if (!isVisible) {
    return null;
  }

  return (
    <div className="eva-business-lookup-integration">
      {/* Processing overlay */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white mx-4 max-w-md rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
              <p className="text-gray-700">{lookupProgress}</p>
            </div>
          </div>
        </div>
      )}

      {/* Business Lookup Tool */}
      <BusinessLookupTool
        onResultsReady={handleLookupComplete}
        onError={onLookupError}
        businessName={defaultBusinessName}
        dbaName={dbaName}
        states={defaultStates}
        showCloseButton={true}
        onClose={onClose}
        className="eva-integration"
      />

      {/* EVA Integration Styles */}
      <style>
        {`
          .eva-business-lookup-integration .eva-integration {
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            max-height: 80vh;
            overflow-y: auto;
          }

          .eva-business-lookup-integration .eva-integration .lookup-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 1rem;
            border-radius: 12px 12px 0 0;
          }

          .eva-business-lookup-integration .eva-integration .results-section {
            border-top: 2px solid #e5e7eb;
            margin-top: 1rem;
            padding-top: 1rem;
          }

          @media (max-width: 768px) {
            .eva-business-lookup-integration .eva-integration {
              max-height: 95vh;
              margin: 0.5rem;
            }
          }
        `}
      </style>
    </div>
  );
};
