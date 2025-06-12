import React, { useState, useEffect, useRef } from 'react';
import { ChevronDownIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { AgentModel } from './CustomAgentManager';
import AgentIcon from './AgentIcon';

interface AgentSelectorProps {
  selectedAgent: AgentModel | null;
  onSelectAgent: (agent: AgentModel) => void;
  onManageAgents: () => void;
  agents: AgentModel[];
}

// Default core agents used by EVA
export const DEFAULT_AGENTS: AgentModel[] = [
  {
    id: 'eva-fin-risk',
    name: 'EVA Risk',
    description: 'EVA Financial Risk Model',
    type: 'financial-risk',
    format: 'conversational',
    tone: 'professional',
    length: 'adaptive',
    features: [],
    performanceMetrics: [],
    customProblem: '',
    imageUrl: '/icons/risk-assessment-icon.svg',
  },
  {
    id: 'doc-ocr',
    name: 'Doc Easy',
    description: 'OCR & document analysis agent',
    type: 'document-ocr',
    format: 'report',
    tone: 'informational',
    length: 'medium',
    features: [],
    performanceMetrics: [],
    customProblem: '',
    imageUrl: '/icons/document-scan-icon.svg',
  },
  {
    id: 'branding-steve',
    name: 'Steve Branding',
    description: 'Branding & marketing guru',
    type: 'marketing',
    format: 'proposal',
    tone: 'casual',
    length: 'adaptive',
    features: [],
    performanceMetrics: [],
    customProblem: '',
    imageUrl: '/icons/marketing-icon.svg',
  },
  {
    id: 'neo-matrix',
    name: 'Neo',
    description: 'Matrix Normalizer Tool',
    type: 'data-normalization',
    format: 'report',
    tone: 'formal',
    length: 'adaptive',
    features: [],
    performanceMetrics: [],
    customProblem: '',
    imageUrl: '/icons/matrix-data-icon.svg',
  },
  {
    id: 'del-spooner',
    name: 'Del Spooner',
    description: 'Security & Regulation Compliance Detective',
    type: 'security,compliance',
    format: 'report',
    tone: 'formal',
    length: 'adaptive',
    features: [],
    performanceMetrics: [],
    customProblem: '',
    imageUrl: '/icons/security-shield-icon.svg',
  },
  {
    id: 'john-conner',
    name: 'John Conner',
    description: 'IT Architecture Specialist',
    type: 'it-architecture',
    format: 'formal-email',
    tone: 'professional',
    length: 'adaptive',
    features: [],
    performanceMetrics: [],
    customProblem: '',
    imageUrl: '/icons/server-architecture-icon.svg',
  },
  {
    id: 'mira-sales',
    name: 'Mira Sales',
    description: 'Sales & retention advisor',
    type: 'sales-retention',
    format: 'conversational',
    tone: 'professional',
    length: 'adaptive',
    features: [],
    performanceMetrics: [],
    customProblem: '',
    imageUrl: '/icons/sales-chart-icon.svg',
  },
  {
    id: 'ben-accounting',
    name: 'Ben',
    description: 'Accounting Specialist',
    type: 'accounting',
    format: 'report',
    tone: 'professional',
    length: 'medium',
    features: [],
    performanceMetrics: [],
    customProblem: '',
    imageUrl: '/icons/accounting-calculator-icon.svg',
  },
  {
    id: 'leo-trading',
    name: 'Leo',
    description: 'Trading Agent',
    type: 'trading',
    format: 'conversational',
    tone: 'professional',
    length: 'short',
    features: [],
    performanceMetrics: [],
    customProblem: '',
    imageUrl: '/icons/trading-chart-icon.svg',
  },
];

const AgentSelector: React.FC<AgentSelectorProps> = ({
  selectedAgent,
  onSelectAgent,
  onManageAgents,
  agents,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentAgent = selectedAgent || (agents.length > 0 ? agents[0] : null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!currentAgent) {
    // Handle case where no agents are available, perhaps show a disabled state or nothing
    return <div className="text-sm text-gray-500">No agents available</div>;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900 focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <AgentIcon
          agentId={currentAgent.id}
          agentName={currentAgent.name}
          iconUrl={currentAgent.imageUrl}
          size="sm"
        />
        <span className="font-medium hidden sm:inline-block">{currentAgent.name}</span>
        <ChevronDownIcon className="h-4 w-4 text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-2 w-64 right-0 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1 max-h-80 overflow-y-auto" role="menu" aria-orientation="vertical">
            {agents.map(agent => (
              <button
                key={agent.id}
                className={`w-full text-left px-4 py-3 text-sm ${
                  currentAgent.id === agent.id
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-700 hover:bg-gray-50'
                } flex items-center space-x-3`}
                onClick={() => {
                  onSelectAgent(agent);
                  setIsOpen(false);
                }}
                role="menuitem"
              >
                <AgentIcon
                  agentId={agent.id}
                  agentName={agent.name}
                  iconUrl={agent.imageUrl}
                  size="sm"
                />
                <div>
                  <div className="font-medium">{agent.name}</div>
                  <div className="text-xs text-gray-500 truncate w-40">{agent.description}</div>
                </div>
              </button>
            ))}

            {/* Divider */}
            <div className="border-t border-gray-100 my-1"></div>

            {/* Manage agents button */}
            <button
              className="w-full text-left px-4 py-3 text-sm text-blue-600 hover:bg-gray-50 flex items-center space-x-3"
              onClick={() => {
                onManageAgents();
                setIsOpen(false);
              }}
              role="menuitem"
            >
              <Cog6ToothIcon className="h-5 w-5 mr-0" />
              <span>Manage Agents</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentSelector;
