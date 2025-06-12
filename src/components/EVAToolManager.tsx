import {
  BanknotesIcon,
  BoltIcon,
  CalculatorIcon,
  ChartBarIcon,
  ChartPieIcon,
  ClipboardDocumentListIcon,
  CogIcon,
  DocumentMagnifyingGlassIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  role: FinancialRole;
  icon: React.ComponentType<any>;
  status: 'active' | 'inactive' | 'maintenance';
  permissions: string[];
  supportedRoles?: string[];
  execute?: (params: any) => Promise<any>;
  mcpEndpoint?: string;
  parameters?: Record<string, any>;
  lastUsed?: Date;
  usageCount?: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export type ToolCategory =
  | 'analysis'
  | 'risk_management'
  | 'decision_making'
  | 'monitoring'
  | 'calculation'
  | 'documentation'
  | 'prediction'
  | 'automation'
  | 'verification';

export type FinancialRole =
  | 'broker'
  | 'underwriter'
  | 'portfolio_manager'
  | 'servicer'
  | 'risk_analyst'
  | 'compliance_officer'
  | 'decision_maker'
  | 'universal';

interface EVAToolManagerProps {
  onToolSelect: (tool: Tool) => void;
  currentRole?: FinancialRole;
  compactMode?: boolean;
}

const EVAToolManager: React.FC<EVAToolManagerProps> = ({
  onToolSelect,
  currentRole = 'universal',
  compactMode = false,
}) => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | 'all'>('all');
  const [selectedRole, setSelectedRole] = useState<FinancialRole | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTools, setActiveTools] = useState<Set<string>>(new Set());

  // Initialize comprehensive financial tools
  useEffect(() => {
    const financialTools: Tool[] = [
      // BROKER TOOLS
      {
        id: 'loan_origination',
        name: 'Loan Origination System',
        description: 'Complete loan application processing and initial underwriting',
        category: 'automation',
        role: 'broker',
        icon: DocumentTextIcon,
        status: 'active',
        permissions: ['create_loans', 'update_applications'],
        mcpEndpoint: '/mcp/broker/origination',
        priority: 'critical',
      },
      {
        id: 'client_matching',
        name: 'Client-Product Matching',
        description: 'AI-powered matching of clients to optimal loan products',
        category: 'analysis',
        role: 'broker',
        icon: UserGroupIcon,
        status: 'active',
        permissions: ['view_products', 'analyze_clients'],
        mcpEndpoint: '/mcp/broker/matching',
        priority: 'high',
      },

      // UNDERWRITER TOOLS
      {
        id: 'credit_analysis',
        name: 'Advanced Credit Analysis',
        description: 'Comprehensive credit scoring and risk assessment',
        category: 'analysis',
        role: 'underwriter',
        icon: ChartBarIcon,
        status: 'active',
        permissions: ['access_credit_data', 'generate_scores'],
        mcpEndpoint: '/mcp/underwriter/credit',
        priority: 'critical',
      },
      {
        id: 'document_verification',
        name: 'Document Verification Suite',
        description: 'AI-powered document authentication and validation',
        category: 'automation',
        role: 'underwriter',
        icon: ShieldCheckIcon,
        status: 'active',
        permissions: ['verify_documents', 'fraud_detection'],
        mcpEndpoint: '/mcp/underwriter/verification',
        priority: 'critical',
      },
      {
        id: 'income_verification',
        name: 'Income Verification Engine',
        description: 'Multi-source income validation and employment verification',
        category: 'analysis',
        role: 'underwriter',
        icon: BanknotesIcon,
        status: 'active',
        permissions: ['access_income_data', 'verify_employment'],
        mcpEndpoint: '/mcp/underwriter/income',
        priority: 'high',
      },
      {
        id: 'automated_underwriting',
        name: 'Automated Underwriting Decision',
        description: 'AI-driven underwriting decisions with explainable outcomes',
        category: 'decision_making',
        role: 'underwriter',
        icon: BoltIcon,
        status: 'active',
        permissions: ['make_underwriting_decisions', 'override_ai_decisions'],
        mcpEndpoint: '/mcp/underwriter/decision',
        priority: 'critical',
      },

      // PORTFOLIO MANAGER TOOLS
      {
        id: 'portfolio_analytics',
        name: 'Portfolio Performance Analytics',
        description: 'Real-time portfolio performance tracking and analysis',
        category: 'analysis',
        role: 'portfolio_manager',
        icon: ChartPieIcon,
        status: 'active',
        permissions: ['view_portfolio_data', 'generate_reports'],
        mcpEndpoint: '/mcp/portfolio/analytics',
        priority: 'high',
      },
      {
        id: 'risk_modeling',
        name: 'Advanced Risk Modeling',
        description: 'Sophisticated risk models for portfolio optimization',
        category: 'risk_management',
        role: 'portfolio_manager',
        icon: ExclamationTriangleIcon,
        status: 'active',
        permissions: ['access_risk_models', 'update_parameters'],
        mcpEndpoint: '/mcp/portfolio/risk',
        priority: 'critical',
      },
      {
        id: 'rebalancing_engine',
        name: 'Portfolio Rebalancing Engine',
        description: 'Automated portfolio rebalancing based on risk tolerance',
        category: 'automation',
        role: 'portfolio_manager',
        icon: CogIcon,
        status: 'active',
        permissions: ['execute_trades', 'modify_allocations'],
        mcpEndpoint: '/mcp/portfolio/rebalance',
        priority: 'high',
      },

      // SERVICER TOOLS
      {
        id: 'payment_processing',
        name: 'Payment Processing System',
        description: 'Automated payment collection and processing',
        category: 'automation',
        role: 'servicer',
        icon: BanknotesIcon,
        status: 'active',
        permissions: ['process_payments', 'handle_delinquencies'],
        mcpEndpoint: '/mcp/servicer/payments',
        priority: 'critical',
      },
      {
        id: 'customer_communication',
        name: 'Customer Communication Hub',
        description: 'Automated customer notifications and support',
        category: 'automation',
        role: 'servicer',
        icon: UserGroupIcon,
        status: 'active',
        permissions: ['send_notifications', 'manage_communications'],
        mcpEndpoint: '/mcp/servicer/communication',
        priority: 'medium',
      },
      {
        id: 'delinquency_management',
        name: 'Delinquency Management System',
        description: 'Early intervention and workout strategies',
        category: 'risk_management',
        role: 'servicer',
        icon: ExclamationTriangleIcon,
        status: 'active',
        permissions: ['manage_delinquencies', 'initiate_workouts'],
        mcpEndpoint: '/mcp/servicer/delinquency',
        priority: 'high',
      },

      // MONITORING & RISK TOOLS
      {
        id: 'real_time_monitoring',
        name: 'Real-Time Risk Monitor',
        description: '24/7 portfolio and market risk monitoring',
        category: 'monitoring',
        role: 'risk_analyst',
        icon: EyeIcon,
        status: 'active',
        permissions: ['monitor_risks', 'trigger_alerts'],
        mcpEndpoint: '/mcp/monitor/realtime',
        priority: 'critical',
      },
      {
        id: 'compliance_scanner',
        name: 'Regulatory Compliance Scanner',
        description: 'Automated compliance monitoring and reporting',
        category: 'monitoring',
        role: 'compliance_officer',
        icon: ClipboardDocumentListIcon,
        status: 'active',
        permissions: ['scan_compliance', 'generate_compliance_reports'],
        mcpEndpoint: '/mcp/compliance/scanner',
        priority: 'critical',
      },
      {
        id: 'stress_testing',
        name: 'Stress Testing Engine',
        description: 'Comprehensive stress testing and scenario analysis',
        category: 'analysis',
        role: 'risk_analyst',
        icon: ExclamationTriangleIcon,
        status: 'active',
        permissions: ['run_stress_tests', 'analyze_scenarios'],
        mcpEndpoint: '/mcp/risk/stress',
        priority: 'high',
      },

      // PREDICTION & DECISION TOOLS
      {
        id: 'predictive_analytics',
        name: 'Predictive Analytics Suite',
        description: 'ML-powered predictions for defaults, prepayments, and market trends',
        category: 'prediction',
        role: 'universal',
        icon: ChartBarIcon,
        status: 'active',
        permissions: ['access_ml_models', 'generate_predictions'],
        mcpEndpoint: '/mcp/analytics/predictive',
        priority: 'high',
      },
      {
        id: 'decision_engine',
        name: 'AI Decision Engine',
        description: 'Central decision-making system with explainable AI',
        category: 'decision_making',
        role: 'decision_maker',
        icon: BoltIcon,
        status: 'active',
        permissions: ['make_ai_decisions', 'override_decisions', 'explain_decisions'],
        mcpEndpoint: '/mcp/decisions/engine',
        priority: 'critical',
      },
      {
        id: 'market_intelligence',
        name: 'Market Intelligence System',
        description: 'Real-time market analysis and competitive intelligence',
        category: 'analysis',
        role: 'universal',
        icon: ChartPieIcon,
        status: 'active',
        permissions: ['access_market_data', 'analyze_trends'],
        mcpEndpoint: '/mcp/market/intelligence',
        priority: 'medium',
      },

      // CALCULATION TOOLS
      {
        id: 'financial_calculator',
        name: 'Advanced Financial Calculator',
        description: 'Complex financial calculations and modeling',
        category: 'calculation',
        role: 'universal',
        icon: CalculatorIcon,
        status: 'active',
        permissions: ['perform_calculations', 'create_models'],
        mcpEndpoint: '/mcp/calc/financial',
        priority: 'medium',
      },

      // BUSINESS LOOKUP TOOLS
      {
        id: 'business_lookup',
        name: 'Business Lookup & Verification',
        description:
          'Comprehensive business record search across all 50 states using Cloudflare AI and Brave Search',
        category: 'verification',
        role: 'universal',
        icon: DocumentMagnifyingGlassIcon,
        status: 'active',
        permissions: ['business_search', 'document_access', 'state_records'],
        mcpEndpoint: '/mcp/business/lookup',
        priority: 'high',
      },

      // WEB SEARCH TOOLS
      {
        id: 'web_search_brave_pro',
        name: 'Web Search - Brave Pro',
        description:
          'Advanced web search using Brave Pro search engine for real-time market data, news, and research',
        category: 'analysis',
        role: 'universal',
        icon: MagnifyingGlassIcon,
        status: 'active',
        permissions: ['web_search', 'external_data_access'],
        mcpEndpoint: '/mcp/search/brave-pro',
        priority: 'high',
      },
      {
        id: 'web_search_profile_builder',
        name: 'Web Search - Profile Builder AI',
        description:
          'AI-powered profile building from web data to create comprehensive customer and business profiles',
        category: 'analysis',
        role: 'universal',
        icon: UserPlusIcon,
        status: 'active',
        permissions: ['web_search', 'profile_creation', 'data_enrichment'],
        mcpEndpoint: '/mcp/search/profile-builder',
        priority: 'high',
      },
    ];

    setTools(financialTools);
  }, []);

  // Filter tools based on selections
  const filteredTools = tools.filter(tool => {
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    const matchesRole =
      selectedRole === 'all' || tool.role === selectedRole || tool.role === 'universal';
    const matchesSearch =
      searchTerm === '' ||
      tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesRole && matchesSearch;
  });

  // Handle tool activation/deactivation
  const toggleTool = (toolId: string) => {
    setActiveTools(prev => {
      const newSet = new Set(prev);
      if (newSet.has(toolId)) {
        newSet.delete(toolId);
      } else {
        newSet.add(toolId);
      }
      return newSet;
    });
  };

  const getStatusColor = (status: Tool['status']) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'inactive':
        return 'text-gray-600 bg-gray-100';
      case 'maintenance':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: Tool['priority']) => {
    switch (priority) {
      case 'critical':
        return 'border-l-red-500';
      case 'high':
        return 'border-l-orange-500';
      case 'medium':
        return 'border-l-blue-500';
      case 'low':
        return 'border-l-gray-500';
      default:
        return 'border-l-gray-500';
    }
  };

  if (compactMode) {
    return (
      <div className="bg-white rounded-lg border p-4 shadow-sm">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
          {filteredTools.slice(0, 6).map(tool => (
            <button
              key={tool.id}
              onClick={() => onToolSelect(tool)}
              className="flex items-center space-x-2 rounded-lg p-2 transition-colors duration-200 hover:bg-gray-50"
            >
              <tool.icon className="h-4 w-4 text-blue-600" />
              <span className="truncate text-sm font-medium">{tool.name}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900">EVA Financial Tools Suite</h2>
        <p className="mt-1 text-sm text-gray-600">
          Comprehensive financial tools for all lending operations
        </p>
      </div>

      {/* Filters */}
      <div className="border-b border-gray-200 p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Search */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Search Tools</label>
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by name or description..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value as ToolCategory | 'all')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="analysis">Analysis</option>
              <option value="risk_management">Risk Management</option>
              <option value="decision_making">Decision Making</option>
              <option value="monitoring">Monitoring</option>
              <option value="calculation">Calculation</option>
              <option value="documentation">Documentation</option>
              <option value="prediction">Prediction</option>
              <option value="automation">Automation</option>
              <option value="verification">Verification</option>
            </select>
          </div>

          {/* Role Filter */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Financial Role</label>
            <select
              value={selectedRole}
              onChange={e => setSelectedRole(e.target.value as FinancialRole | 'all')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="broker">Broker</option>
              <option value="underwriter">Underwriter</option>
              <option value="portfolio_manager">Portfolio Manager</option>
              <option value="servicer">Servicer</option>
              <option value="risk_analyst">Risk Analyst</option>
              <option value="compliance_officer">Compliance Officer</option>
              <option value="decision_maker">Decision Maker</option>
              <option value="universal">Universal</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTools.map(tool => (
            <div
              key={tool.id}
              className={`rounded-lg border border-l-4 border-gray-200 p-4 transition-shadow duration-200 hover:shadow-md ${getPriorityColor(tool.priority)}`}
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <tool.icon className="h-8 w-8 text-blue-600" />
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">{tool.name}</h3>
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(tool.status)}`}
                    >
                      {tool.status}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => toggleTool(tool.id)}
                  className={`rounded-full p-2 transition-colors duration-200 ${
                    activeTools.has(tool.id)
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  }`}
                >
                  <BoltIcon className="h-4 w-4" />
                </button>
              </div>

              <p className="mb-3 line-clamp-2 text-sm text-gray-600">{tool.description}</p>

              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  <span className="inline-flex rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                    {tool.role.replace('_', ' ')}
                  </span>
                  <span className="bg-gray-100 inline-flex rounded px-2 py-1 text-xs font-medium text-gray-800">
                    {tool.category.replace('_', ' ')}
                  </span>
                </div>
                <button
                  onClick={() => onToolSelect(tool)}
                  className="text-white rounded bg-blue-600 px-3 py-1 text-sm transition-colors duration-200 hover:bg-blue-700"
                >
                  Use Tool
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredTools.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-gray-500">No tools found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Active Tools Summary */}
      {activeTools.size > 0 && (
        <div className="border-t border-gray-200 p-6">
          <h3 className="mb-3 text-lg font-semibold text-gray-900">
            Active Tools ({activeTools.size})
          </h3>
          <div className="flex flex-wrap gap-2">
            {Array.from(activeTools).map(toolId => {
              const tool = tools.find(t => t.id === toolId);
              return tool ? (
                <span
                  key={toolId}
                  className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800"
                >
                  <tool.icon className="mr-1 h-4 w-4" />
                  {tool.name}
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default EVAToolManager;
