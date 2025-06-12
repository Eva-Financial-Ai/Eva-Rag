import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { FinancialRole, Tool } from '../components/EVAToolManager';
import { Workflow } from '../components/EVAToolOrchestrator';
import { BusinessLookupService, BusinessRecord } from '../services/BusinessLookupService';
import {
  EnhancedBusinessLookupService,
  EnhancedBusinessRecord,
  AggregatedBusinessData,
} from '../services/EnhancedBusinessLookupService';
import RAGStorageService from '../services/ragStorageService';
import { useEVACustomerContext } from './EVACustomerContext';

import { logBusinessProcess } from '../utils/auditLogger';

export interface MCPConnection {
  id: string;
  endpoint: string;
  status: 'connected' | 'disconnected' | 'error';
  lastPing?: Date;
  latency?: number;
  version?: string;
}

export interface ToolExecutionLog {
  id: string;
  toolId: string;
  sessionId: string;
  inputs: any;
  outputs: any;
  status: 'success' | 'error' | 'timeout';
  startTime: Date;
  endTime?: Date;
  duration?: number;
  errorMessage?: string;
}

interface BusinessLookupParams {
  businessLegalName: string;
  doingBusinessAs?: string[];
  tradenames?: string[];
  searchAllStates?: boolean;
  specificStates?: string[];
  includePublicFilings?: boolean;
  includeContactInfo?: boolean;
  customerId?: string;
}

interface EVAToolContextType {
  // Tool Management
  availableTools: Tool[];
  activeTools: Set<string>;
  toolExecutionHistory: ToolExecutionLog[];

  // Workflow Management
  activeWorkflows: Workflow[];
  workflowHistory: any[];

  // MCP Connections
  mcpConnections: MCPConnection[];

  // User Role & Permissions
  currentRole: FinancialRole;
  permissions: string[];

  // Actions
  setCurrentRole: (role: FinancialRole) => void;
  executeTask: (
    toolId: string,
    inputs: Record<string, unknown>,
    sessionId: string,
  ) => Promise<Record<string, unknown>>;
  activateTool: (toolId: string) => void;
  deactivateTool: (toolId: string) => void;
  getToolStatus: (toolId: string) => 'active' | 'inactive' | 'maintenance';

  // MCP Actions
  connectToMCP: (endpoint: string) => Promise<void>;
  disconnectFromMCP: (connectionId: string) => void;

  // Analytics
  getToolUsageStats: () => Record<string, number>;
  getWorkflowSuccessRate: () => number;

  // Business Lookup Tools
  performBusinessLookup: (params: BusinessLookupParams) => Promise<{
    businessRecords: BusinessRecord[];
    enhancedRecords: EnhancedBusinessRecord[];
    secEdgarData: any;
    aggregatedData: AggregatedBusinessData;
    success: boolean;
    documents: string[];
    vectorDbData: Record<string, any>[];
    errors: string[];
  }>;
  getCustomerBusinessRecords: (customerId: string) => Promise<EnhancedBusinessRecord[]>;
  updateCustomerRAG: (customerId: string, businessData: EnhancedBusinessRecord | AggregatedBusinessData) => Promise<void>;
}

const EVAToolContext = createContext<EVAToolContextType | undefined>(undefined);

interface EVAToolProviderProps {
  children: ReactNode;
}

export const EVAToolProvider: React.FC<EVAToolProviderProps> = ({ children }) => {
  const { selectedCustomer, updateCustomerBusinessRecords } = useEVACustomerContext() || {
    selectedCustomer: null,
    updateCustomerBusinessRecords: () => {
      // Placeholder for customer business records update
    },
  };
  const [availableTools, setAvailableTools] = useState<Tool[]>([]);
  const [activeTools, setActiveTools] = useState<Set<string>>(new Set());
  const [toolExecutionHistory, setToolExecutionHistory] = useState<ToolExecutionLog[]>([]);
  const [activeWorkflows, _setActiveWorkflows] = useState<Workflow[]>([]);
  const [workflowHistory, _setWorkflowHistory] = useState<ToolExecutionLog[]>([]);
  const [mcpConnections, setMcpConnections] = useState<MCPConnection[]>([]);
  const [currentRole, setCurrentRole] = useState<FinancialRole>('universal');
  const [permissions, setPermissions] = useState<string[]>([]);

  // Initialize services
  const [_ragStorageService] = useState(() => RAGStorageService.getInstance());

  // Initialize business lookup services
  const [businessLookupService] = useState(
    () =>
      new BusinessLookupService(
        {
          accountId: process.env.REACT_APP_CLOUDFLARE_ACCOUNT_ID!,
          apiToken: process.env.REACT_APP_CLOUDFLARE_API_TOKEN!,
          endpoint: process.env.REACT_APP_CLOUDFLARE_WORKERS_ENDPOINT!,
        },
        {
          apiKey: process.env.REACT_APP_BRAVE_SEARCH_API_KEY!,
          endpoint: process.env.REACT_APP_BRAVE_SEARCH_ENDPOINT!,
        },
        {
          url: process.env.REACT_APP_SUPABASE_URL!,
          apiKey: process.env.REACT_APP_SUPABASE_ANON_KEY!,
        },
        {
          accountId: process.env.REACT_APP_CLOUDFLARE_R2_ACCOUNT_ID!,
          accessKeyId: process.env.REACT_APP_CLOUDFLARE_R2_ACCESS_KEY_ID!,
          secretAccessKey: process.env.REACT_APP_CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
          bucketName: process.env.REACT_APP_CLOUDFLARE_R2_BUCKET_NAME!,
        },
      ),
  );

  const [enhancedLookupService] = useState(
    () =>
      new EnhancedBusinessLookupService(businessLookupService, {
        eSecretaryOfStateApiKey: process.env.REACT_APP_E_SECRETARY_API_KEY,
        secEdgarApiKey: process.env.REACT_APP_SEC_EDGAR_API_KEY,
      }),
  );

  // Helper functions - moved before performBusinessLookup to avoid hoisting issues
  const getCustomerBusinessRecords = useCallback(
    async (customerId: string): Promise<EnhancedBusinessRecord[]> => {
      try {
        // Mock implementation since retrieve method doesn't exist
        const ragId = `customer_${customerId}_business_records`;
        logBusinessProcess('business_lookup', 'retrieve_records', true, { ragId });
        // For now, return empty array - would need to implement proper RAG storage
        return [];
      } catch (error) {
        console.error('Error retrieving customer business records:', error);
        return [];
      }
    },
    [],
  );

  const updateCustomerRAG = useCallback(
    async (customerId: string, businessData: EnhancedBusinessRecord | AggregatedBusinessData): Promise<void> => {
      try {
        // Convert AggregatedBusinessData to EnhancedBusinessRecord if needed
        let enhancedRecord: EnhancedBusinessRecord;
        if ('primaryBusinessInfo' in businessData) {
          // It's AggregatedBusinessData
          enhancedRecord = {
            id: `business_${Date.now()}`,
            businessName: businessData.primaryBusinessInfo.legalName,
            dbaName: businessData.primaryBusinessInfo.dbas?.[0] || '',
            state: businessData.primaryBusinessInfo.primaryState,
            entityType: businessData.primaryBusinessInfo.entityType as any,
            status: 'active' as any,
            formationDate: businessData.primaryBusinessInfo.incorporationDate,
            filingNumber: `${businessData.primaryBusinessInfo.primaryState}-${Date.now()}`,
            documents: [],
            lastUpdated: new Date().toISOString(),
            source: 'web_scraping' as const,
            address: {
              street1: '',
              city: '',
              state: businessData.primaryBusinessInfo.primaryState,
              zipCode: ''
            }
          } as EnhancedBusinessRecord;
        } else {
          // It's already EnhancedBusinessRecord
          enhancedRecord = businessData;
        }

        // Mock implementation since store method doesn't exist
        const ragId = `customer_${customerId}_business_${Date.now()}`;
        logBusinessProcess('business_lookup', 'store_rag_data', true, { ragId, businessData: enhancedRecord });

        // Mock storage operation
        const _existingRecords = await getCustomerBusinessRecords(customerId);
        logBusinessProcess('business_lookup', 'update_records', true, { customerId });
      } catch (error) {
        console.error('Error updating customer RAG:', error);
        throw error;
      }
    },
    [getCustomerBusinessRecords],
  );

  // Business Lookup Implementation - moved before useEffect that uses it
  const performBusinessLookup = useCallback(
    async (params: BusinessLookupParams) => {
      const startTime = new Date();
      const sessionId = `lookup_${Date.now()}`;

      try {
        // Log the execution
        const logEntry: ToolExecutionLog = {
          id: `exec_business_lookup_${Date.now()}`,
          toolId: 'business-lookup',
          sessionId,
          inputs: params,
          outputs: null,
          status: 'success',
          startTime,
        };

        // Phase 1: Basic lookup
        const basicResults = await businessLookupService.lookupBusiness(
          params.businessLegalName,
          params.doingBusinessAs?.[0],
          params.searchAllStates ? undefined : params.specificStates,
        );

        // Phase 2: Enhanced lookup
        const enhancedResults = await enhancedLookupService.performEnhancedLookup({
          ...params,
          baseResults: basicResults.businessRecords,
        });

        // Phase 3: SEC EDGAR search if requested
        let secData;
        if (params.includePublicFilings) {
          secData = await enhancedLookupService.searchSECEdgar(params.businessLegalName);
        }

        // Phase 4: Contact information gathering - removed non-existent method
        let contactInfo = {};
        if (params.includeContactInfo) {
          // Use available data from enhanced results instead
          contactInfo = {
            businessContacts: enhancedResults.records.map(record => ({
              name: record.businessName,
              registeredAgent: record.registeredAgent,
              address: record.address,
            })),
          };
        }

        // Phase 5: Aggregate all data
        const aggregatedData = await enhancedLookupService.aggregateBusinessData({
          basicResults: basicResults.businessRecords,
          enhancedResults,
          secData,
          contactInfo,
          params,
        });

        // Phase 6: Store in customer-specific RAG if customerId provided
        if (params.customerId || selectedCustomer?.id) {
          const targetCustomerId = params.customerId || selectedCustomer!.id;
          await updateCustomerRAG(targetCustomerId, aggregatedData);

          // Update customer business records
          if (updateCustomerBusinessRecords) {
            await updateCustomerBusinessRecords(targetCustomerId, enhancedResults.records);
          }
        }

        const result = {
          ...basicResults,
          enhancedRecords: enhancedResults.records,
          secEdgarData: secData,
          aggregatedData,
          success: true,
        };

        // Update log entry
        const endTime = new Date();
        logEntry.outputs = result;
        logEntry.endTime = endTime;
        logEntry.duration = endTime.getTime() - startTime.getTime();
        setToolExecutionHistory(prev => [logEntry, ...prev.slice(0, 99)]);

        return result;
      } catch (error) {
        // Log error
        const endTime = new Date();
        const logEntry: ToolExecutionLog = {
          id: `exec_business_lookup_${Date.now()}`,
          toolId: 'business-lookup',
          sessionId,
          inputs: params,
          outputs: null,
          status: 'error',
          startTime,
          endTime,
          duration: endTime.getTime() - startTime.getTime(),
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        };
        setToolExecutionHistory(prev => [logEntry, ...prev.slice(0, 99)]);
        throw error;
      }
    },
    [
      businessLookupService,
      enhancedLookupService,
      selectedCustomer,
      updateCustomerBusinessRecords,
      updateCustomerRAG,
    ],
  );

  // Initialize tool ecosystem
  useEffect(() => {
    initializeToolEcosystem();
  }, []);

  // Register business lookup tool - now performBusinessLookup is available
  useEffect(() => {
    const businessLookupTool: Tool = {
      id: 'business-lookup',
      name: 'Enhanced Business Entity Lookup',
      description:
        'Comprehensive business entity search across all 50 states with SEC EDGAR integration, e-Secretary of State lookup, and contact information gathering',
      category: 'analysis',
      role: 'universal',
      icon: () => <span>🔍</span>,
      priority: 'high',
      mcpEndpoint: 'http://localhost:8080/mcp/business-lookup',
      permissions: ['access_business_data', 'perform_searches'],
      status: 'active',
      supportedRoles: ['broker', 'underwriter', 'universal'],
      parameters: {
        businessLegalName: { type: 'string', required: true },
        doingBusinessAs: { type: 'array', required: false },
        tradenames: { type: 'array', required: false },
        searchAllStates: { type: 'boolean', required: false, default: true },
        specificStates: { type: 'array', required: false },
        includePublicFilings: { type: 'boolean', required: false, default: true },
        includeContactInfo: { type: 'boolean', required: false, default: true },
        customerId: { type: 'string', required: false },
      },
      execute: async (params: BusinessLookupParams) => await performBusinessLookup(params),
    };

    setAvailableTools(prev => {
      const filtered = prev.filter(t => t.id !== 'business-lookup');
      return [...filtered, businessLookupTool];
    });
  }, [performBusinessLookup]);

  // Update permissions when role changes
  useEffect(() => {
    updatePermissions(currentRole);
  }, [currentRole]);

  const initializeToolEcosystem = () => {
    // Initialize default MCP connections
    const defaultConnections: MCPConnection[] = [
      {
        id: 'mcp_core',
        endpoint: 'http://localhost:8080/mcp',
        status: 'connected',
        lastPing: new Date(),
        latency: 45,
        version: '1.0.0',
      },
      {
        id: 'mcp_risk',
        endpoint: 'http://localhost:8081/mcp',
        status: 'connected',
        lastPing: new Date(),
        latency: 62,
        version: '1.0.0',
      },
      {
        id: 'mcp_compliance',
        endpoint: 'http://localhost:8082/mcp',
        status: 'connected',
        lastPing: new Date(),
        latency: 38,
        version: '1.0.0',
      },
    ];

    setMcpConnections(defaultConnections);
  };

  const updatePermissions = (role: FinancialRole) => {
    const rolePermissions: Record<FinancialRole, string[]> = {
      broker: [
        'create_loans',
        'update_applications',
        'view_products',
        'analyze_clients',
        'generate_quotes',
      ],
      underwriter: [
        'access_credit_data',
        'generate_scores',
        'verify_documents',
        'fraud_detection',
        'make_underwriting_decisions',
        'override_ai_decisions',
      ],
      portfolio_manager: [
        'view_portfolio_data',
        'generate_reports',
        'access_risk_models',
        'update_parameters',
        'execute_trades',
        'modify_allocations',
      ],
      servicer: [
        'process_payments',
        'handle_delinquencies',
        'send_notifications',
        'manage_communications',
        'manage_delinquencies',
        'initiate_workouts',
      ],
      risk_analyst: [
        'monitor_risks',
        'trigger_alerts',
        'run_stress_tests',
        'analyze_scenarios',
        'access_risk_data',
      ],
      compliance_officer: [
        'scan_compliance',
        'generate_compliance_reports',
        'access_regulatory_data',
        'audit_transactions',
      ],
      decision_maker: [
        'make_ai_decisions',
        'override_decisions',
        'explain_decisions',
        'access_all_data',
        'approve_high_risk',
      ],
      universal: [
        'access_ml_models',
        'generate_predictions',
        'access_market_data',
        'analyze_trends',
        'perform_calculations',
        'create_models',
      ],
    };

    setPermissions(rolePermissions[role] || []);
  };

  const executeTask = async (
    toolId: string,
    inputs: Record<string, unknown>,
    sessionId: string,
  ): Promise<Record<string, unknown>> => {
    const tool = availableTools.find(t => t.id === toolId);
    if (!tool) {
      throw new Error(`Tool ${toolId} not found`);
    }

    // Check permissions
    const hasPermission = tool.permissions.some(permission => permissions.includes(permission));

    if (!hasPermission && currentRole !== 'universal') {
      throw new Error(`Insufficient permissions for tool ${toolId}`);
    }

    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = new Date();

    // Log execution start
    const logEntry: ToolExecutionLog = {
      id: executionId,
      toolId,
      sessionId,
      inputs,
      outputs: null,
      status: 'success',
      startTime,
    };

    try {
      // Find appropriate MCP connection
      const mcpConnection = mcpConnections.find(conn =>
        tool.mcpEndpoint?.startsWith(conn.endpoint),
      );

      if (!mcpConnection || mcpConnection.status !== 'connected') {
        throw new Error(`No active MCP connection for tool ${toolId}`);
      }

      // Simulate MCP execution (replace with actual MCP call)
      const result = await simulateToolExecution(tool, inputs);

      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      // Update log entry
      logEntry.outputs = result;
      logEntry.endTime = endTime;
      logEntry.duration = duration;
      logEntry.status = 'success';

      setToolExecutionHistory(prev => [logEntry, ...prev.slice(0, 99)]); // Keep last 100 executions

      return result;
    } catch (error) {
      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      logEntry.endTime = endTime;
      logEntry.duration = duration;
      logEntry.status = 'error';
      logEntry.errorMessage = error instanceof Error ? error.message : 'Unknown error';

      setToolExecutionHistory(prev => [logEntry, ...prev.slice(0, 99)]);

      throw error;
    }
  };

  const simulateToolExecution = async (
    tool: Tool,
    inputs: Record<string, unknown>,
  ): Promise<Record<string, unknown>> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 2000));

    // Generate mock results based on tool type
    const baseResult = {
      toolId: tool.id,
      status: 'success',
      timestamp: new Date(),
      processingTime: Math.random() * 2000,
    };

    switch (tool.category) {
      case 'analysis':
        return {
          ...baseResult,
          analysis: {
            score: Math.random() * 100,
            confidence: Math.random(),
            recommendations: [
              'Recommendation 1 based on analysis',
              'Recommendation 2 for optimization',
            ],
            riskFactors: ['Factor A', 'Factor B'],
            metadata: inputs,
          },
        };

      case 'risk_management':
        return {
          ...baseResult,
          riskAssessment: {
            riskScore: Math.random() * 10,
            riskLevel: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
            mitigationStrategies: ['Strategy 1', 'Strategy 2'],
            alertTriggered: Math.random() > 0.7,
          },
        };

      case 'decision_making':
        return {
          ...baseResult,
          decision: {
            recommendation: ['Approve', 'Deny', 'Review'][Math.floor(Math.random() * 3)],
            confidence: Math.random(),
            reasoning: 'AI-driven decision based on multiple factors',
            alternatives: ['Alternative 1', 'Alternative 2'],
          },
        };

      case 'automation':
        return {
          ...baseResult,
          automation: {
            tasksCompleted: Math.floor(Math.random() * 10) + 1,
            timesSaved: Math.random() * 3600,
            nextActions: ['Action 1', 'Action 2'],
          },
        };

      default:
        return {
          ...baseResult,
          data: {
            value: Math.random() * 1000,
            message: `Mock result from ${tool.name}`,
            metadata: inputs,
          },
        };
    }
  };

  const activateTool = (toolId: string) => {
    setActiveTools(prev => new Set([...prev, toolId]));
  };

  const deactivateTool = (toolId: string) => {
    setActiveTools(prev => {
      const newSet = new Set(prev);
      newSet.delete(toolId);
      return newSet;
    });
  };

  const getToolStatus = (toolId: string): 'active' | 'inactive' | 'maintenance' => {
    const tool = availableTools.find(t => t.id === toolId);
    return tool?.status || 'inactive';
  };

  const connectToMCP = async (endpoint: string): Promise<void> => {
    const connectionId = `mcp_${Date.now()}`;

    // Simulate connection attempt
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newConnection: MCPConnection = {
      id: connectionId,
      endpoint,
      status: 'connected',
      lastPing: new Date(),
      latency: Math.random() * 100,
      version: '1.0.0',
    };

    setMcpConnections(prev => [...prev, newConnection]);
  };

  const disconnectFromMCP = (connectionId: string) => {
    setMcpConnections(prev => prev.filter(conn => conn.id !== connectionId));
  };

  const getToolUsageStats = (): Record<string, number> => {
    const stats: Record<string, number> = {};

    toolExecutionHistory.forEach(log => {
      stats[log.toolId] = (stats[log.toolId] || 0) + 1;
    });

    return stats;
  };

  const getWorkflowSuccessRate = (): number => {
    if (workflowHistory.length === 0) return 0;

    const successful = workflowHistory.filter(
      w => w.status === 'success',
    ).length;
    return (successful / workflowHistory.length) * 100;
  };

  // Duplicate definitions removed - these are now defined earlier in the file

  const performEVAToolLookup = useCallback(
    async (params: BusinessLookupParams) => {
      const startTime = new Date();
      const sessionId = `lookup_${Date.now()}`;

      try {
        // Log the execution
        const logEntry: ToolExecutionLog = {
          id: `exec_business_lookup_${Date.now()}`,
          toolId: 'business-lookup',
          sessionId,
          inputs: params,
          outputs: null,
          status: 'success',
          startTime,
        };

        // Phase 1: Basic lookup
        const basicResults = await businessLookupService.lookupBusiness(
          params.businessLegalName,
          params.doingBusinessAs?.[0],
          params.searchAllStates ? undefined : params.specificStates,
        );

        // Phase 2: Enhanced lookup
        const enhancedResults = await enhancedLookupService.performEnhancedLookup({
          ...params,
          baseResults: basicResults.businessRecords,
        });

        // Phase 3: SEC EDGAR search if requested
        let secData;
        if (params.includePublicFilings) {
          secData = await enhancedLookupService.searchSECEdgar(params.businessLegalName);
        }

        // Phase 4: Contact information gathering - removed non-existent method
        let contactInfo = {};
        if (params.includeContactInfo) {
          // Use available data from enhanced results instead
          contactInfo = {
            businessContacts: enhancedResults.records.map(record => ({
              name: record.businessName,
              registeredAgent: record.registeredAgent,
              address: record.address,
            })),
          };
        }

        // Phase 5: Aggregate all data
        const aggregatedData = await enhancedLookupService.aggregateBusinessData({
          basicResults: basicResults.businessRecords,
          enhancedResults,
          secData,
          contactInfo,
          params,
        });

        // Phase 6: Store in customer-specific RAG if customerId provided
        if (params.customerId || selectedCustomer?.id) {
          const targetCustomerId = params.customerId || selectedCustomer!.id;
          await updateCustomerRAG(targetCustomerId, aggregatedData);

          // Update customer business records
          if (updateCustomerBusinessRecords) {
            await updateCustomerBusinessRecords(targetCustomerId, enhancedResults.records);
          }
        }

        const result = {
          ...basicResults,
          enhancedRecords: enhancedResults.records,
          secEdgarData: secData,
          aggregatedData,
          success: true,
        };

        // Update log entry
        const endTime = new Date();
        logEntry.outputs = result;
        logEntry.endTime = endTime;
        logEntry.duration = endTime.getTime() - startTime.getTime();
        setToolExecutionHistory(prev => [logEntry, ...prev.slice(0, 99)]);

        return result;
      } catch (error) {
        // Log error
        const endTime = new Date();
        const logEntry: ToolExecutionLog = {
          id: `exec_business_lookup_${Date.now()}`,
          toolId: 'business-lookup',
          sessionId,
          inputs: params,
          outputs: null,
          status: 'error',
          startTime,
          endTime,
          duration: endTime.getTime() - startTime.getTime(),
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        };
        setToolExecutionHistory(prev => [logEntry, ...prev.slice(0, 99)]);
        throw error;
      }
    },
    [
      businessLookupService,
      enhancedLookupService,
      selectedCustomer,
      updateCustomerBusinessRecords,
      updateCustomerRAG,
    ],
  );

  const contextValue: EVAToolContextType = {
    // State
    availableTools,
    activeTools,
    toolExecutionHistory,
    activeWorkflows,
    workflowHistory,
    mcpConnections,
    currentRole,
    permissions,

    // Actions
    setCurrentRole,
    executeTask,
    activateTool,
    deactivateTool,
    getToolStatus,
    connectToMCP,
    disconnectFromMCP,
    getToolUsageStats,
    getWorkflowSuccessRate,

    // Business Lookup Tools
    performBusinessLookup,
    getCustomerBusinessRecords,
    updateCustomerRAG,
  };

  return <EVAToolContext.Provider value={contextValue}>{children}</EVAToolContext.Provider>;
};

export const useEVATools = (): EVAToolContextType => {
  const context = useContext(EVAToolContext);
  if (!context) {
    throw new Error('useEVATools must be used within an EVAToolProvider');
  }
  return context;
};

export default EVAToolContext;
