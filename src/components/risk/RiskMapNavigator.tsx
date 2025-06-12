import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkflow } from '../../contexts/WorkflowContext';
import { useLoadingStatus } from '../../services/LoadingService';
import ModularLoading from '../common/ModularLoading';
import riskMapService, { RiskData } from './RiskMapService';
import RiskCriteriaConfig, { RiskCriteria } from './RiskCriteriaConfig';

import { debugLog } from '../../utils/auditLogger';

// Define and export RiskMapType
export type RiskMapType = 'unsecured' | 'equipment' | 'realestate';

// Define and export RISK_MAP_VIEWS
export const RISK_MAP_VIEWS = {
  EVA_REPORT_SCORE: 'eva_report_score',
  LAB: 'lab',
};

// Re-export service mapping functions
export const mapLoanTypeToRiskMapType = riskMapService.mapLoanTypeToRiskMapType;
export const mapRiskMapTypeToLoanType = riskMapService.mapRiskMapTypeToLoanType;

// Import RiskCategory directly to avoid circular dependencies
export type RiskCategory =
  | 'all'
  | 'credit'
  | 'capacity'
  | 'collateral'
  | 'capital'
  | 'conditions'
  | 'character'
  | 'customer_retention';

// Update component props to accept the props used in other components
interface RiskMapNavigatorProps {
  selectedCategory?: string;
  onCategorySelect?: (category: RiskCategory) => void;
  riskMapType?: RiskMapType;
  onRiskMapTypeChange?: (type: RiskMapType) => void;
  activeView?: string;
  onViewChange?: (view: string) => void;
  onCriteriaChange?: (criteria: RiskCriteria[]) => void;
  transactionId?: string;
}

/**
 * RiskMapNavigator component - Manages risk assessment data and views
 * Refactored for improved performance and maintainability
 */
const RiskMapNavigator: React.FC<RiskMapNavigatorProps> = ({
  selectedCategory,
  onCategorySelect,
  riskMapType: propRiskMapType,
  onRiskMapTypeChange,
  activeView,
  onViewChange,
  onCriteriaChange,
  transactionId
}) => {
  const navigate = useNavigate();
  const { currentTransaction } = useWorkflow();
  
  // Determine transaction ID from props or context
  const txId = transactionId || (currentTransaction?.id ?? 'unknown');
  
  // Component state
  const [activeType, setActiveType] = useState<RiskMapType>(propRiskMapType || 'unsecured');
  const [showConfigPanel, setShowConfigPanel] = useState<boolean>(false);
  const [riskData, setRiskData] = useState<RiskData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dataCache, setDataCache] = useState<Map<RiskMapType, RiskData>>(new Map());
  
  // Loading indicators through the LoadingService
  const [riskMapStatus, riskMapLoading] = useLoadingStatus('risk-map', 'main');
  const [riskScoreStatus, riskScoreLoading] = useLoadingStatus('risk-score', 'main');
  const [evaAnalysisStatus, evaAnalysisLoading] = useLoadingStatus('eva-analysis', 'main');
  
  // Pre-defined categories
  const categories: RiskCategory[] = useMemo(() => [
    'all',
    'credit', 
    'capacity', 
    'collateral', 
    'capital', 
    'conditions', 
    'character',
    'customer_retention'
  ], []);

  // Sync with parent component's riskMapType prop
  useEffect(() => {
    if (propRiskMapType && propRiskMapType !== activeType) {
      setActiveType(propRiskMapType);
    }
  }, [propRiskMapType, activeType]);
  
  // Centralized error handling
  const handleError = useCallback((error: any, message: string) => {
    console.error(`[RiskMapNavigator] ${message}:`, error);
    setErrorMessage(message);
    
    // Reset all loading indicators
    riskMapLoading.setError(message);
    riskScoreLoading.setError(message);
    evaAnalysisLoading.setError(message);
  }, [riskMapLoading, riskScoreLoading, evaAnalysisLoading]);
  
  // Load risk data with caching for performance
  const loadRiskData = useCallback(async (type: RiskMapType, forceReload = false) => {
    // Don't reload if we already have this data cached and no force reload requested
    if (!forceReload && dataCache.has(type)) {
      debugLog('general', 'log_statement', `[RiskMapNavigator] Using cached data for ${type}`)
      setRiskData(dataCache.get(type) || null);
      return;
    }
    
    debugLog('general', 'log_statement', `[RiskMapNavigator] Loading risk data for type: ${type}, txId: ${txId}`)
    
    try {
      // Start loading indicators with staggered timing for better UX
      riskMapLoading.startLoading(`Loading ${type} risk assessment data...`);
      
      setTimeout(() => {
        riskScoreLoading.startLoading(`Calculating ${type} risk score...`);
      }, 100);
      
      setTimeout(() => {
        evaAnalysisLoading.startLoading(`EVA AI is analyzing ${type} risk factors...`);
      }, 200);
      
      // Clear error state
      setErrorMessage(null);
      
      // Fetch data from the service
      const data = await riskMapService.fetchRiskData(type);
      debugLog('general', 'log_statement', `[RiskMapNavigator] Risk data loaded successfully for ${type}`)
      
      // Update state and cache
      setRiskData(data);
      setDataCache(prev => new Map(prev).set(type, data));
      
      // Complete loading indicators with staggered timing
      setTimeout(() => {
        riskScoreLoading.completeLoading('Risk score calculated successfully');
      }, 500);
      
      setTimeout(() => {
        riskMapLoading.completeLoading('Risk assessment loaded');
      }, 700);
      
      setTimeout(() => {
        evaAnalysisLoading.completeLoading('Analysis complete');
      }, 900);
    } catch (error) {
      handleError(error, 'Failed to load risk assessment data');
    }
  }, [txId, riskMapLoading, riskScoreLoading, evaAnalysisLoading, handleError, dataCache]);
  
  // Load data when component mounts or active type changes
  useEffect(() => {
    loadRiskData(activeType);
    
    // Cleanup loading indicators when component unmounts
    return () => {
      riskMapLoading.resetLoading();
      riskScoreLoading.resetLoading();
      evaAnalysisLoading.resetLoading();
    };
  }, [activeType, loadRiskData, riskMapLoading, riskScoreLoading, evaAnalysisLoading]);
  
  // Handler for risk map type changes
  const handleRiskMapTypeChange = useCallback((type: RiskMapType) => {
    if (type === activeType) return;
    
    setActiveType(type);
    
    // Call parent handler if provided
    if (onRiskMapTypeChange) {
      onRiskMapTypeChange(type);
    }
  }, [activeType, onRiskMapTypeChange]);
  
  // Handler for category selection
  const handleCategorySelection = useCallback((category: RiskCategory) => {
    if (onCategorySelect) {
      onCategorySelect(category);
    }
  }, [onCategorySelect]);
  
  // Handler for criteria changes
  const handleCriteriaChange = useCallback((criteria: RiskCriteria[]) => {
    debugLog('general', 'log_statement', '[RiskMapNavigator] Risk criteria updated:', criteria)
    
    if (onCriteriaChange) {
      onCriteriaChange(criteria);
    }
    
    // Force reload data after criteria changes
    loadRiskData(activeType, true);
  }, [onCriteriaChange, loadRiskData, activeType]);
  
  // Handler for view changes
  const handleViewChange = useCallback((view: string) => {
    if (onViewChange) {
      onViewChange(view);
    }
  }, [onViewChange]);
  
  // Function to navigate to EVA report
  const handleNavigateToEvaReport = useCallback(() => {
    navigate(`/risk-assessment/eva-report?transaction=${txId}&type=${activeType}`);
  }, [navigate, txId, activeType]);
  
  // Data display class helpers
  const getTypeColorClass = (type: RiskMapType): string => {
    switch(type) {
      case 'equipment': return 'text-green-700 bg-green-100';
      case 'realestate': return 'text-blue-700 bg-blue-100';
      default: return 'text-indigo-700 bg-indigo-100';
    }
  };
  
  // Title for current risk map type
  const riskMapTypeTitle = useMemo(() => {
    switch(activeType) {
      case 'equipment': return 'Equipment & Vehicles';
      case 'realestate': return 'Real Estate';
      default: return 'General Purpose';
    }
  }, [activeType]);

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      {/* Header section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Risk Assessment</h1>
          <p className="text-gray-600 mt-1">
            {riskMapTypeTitle} risk analysis for transaction {txId}
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => setShowConfigPanel(!showConfigPanel)}
            className="px-3 py-2 border rounded-md text-sm font-medium hover:bg-gray-50"
          >
            {showConfigPanel ? 'View Risk Map' : 'Configure Risk Criteria'}
          </button>
          
          <button
            onClick={handleNavigateToEvaReport}
            className="px-3 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700"
          >
            View Full EVA Report
          </button>
        </div>
      </div>
      
      {/* Error message */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-800">
          <p className="text-sm font-medium">{errorMessage}</p>
          <button 
            onClick={() => loadRiskData(activeType, true)}
            className="mt-1 text-sm text-red-700 hover:text-red-900 underline"
          >
            Retry loading
          </button>
        </div>
      )}
      
      {/* Risk Map Type Selector */}
      <div className="mb-6">
        <h2 className="text-base font-medium text-gray-700 mb-2">Risk Map Type</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleRiskMapTypeChange('unsecured')}
            className={`px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
              activeType === 'unsecured'
                ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            General Purpose
          </button>
          <button
            onClick={() => handleRiskMapTypeChange('equipment')}
            className={`px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
              activeType === 'equipment'
                ? 'bg-green-100 text-green-800 border border-green-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Equipment & Vehicles
          </button>
          <button
            onClick={() => handleRiskMapTypeChange('realestate')}
            className={`px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
              activeType === 'realestate'
                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Real Estate
          </button>
        </div>
      </div>
      
      {/* Loading indicators or main content */}
      {riskMapStatus.state === 'loading' ? (
        <div className="space-y-4">
          {/* EVA AI Analysis Loading */}
          <div className="mb-4">
            <ModularLoading 
              status={evaAnalysisStatus} 
              theme="red" 
              spinnerType="dots"
              size="full"
              className="border border-gray-200 bg-gray-50 p-4 rounded-md"
              showThoughtProcess={true}
            />
          </div>
          
          {/* Risk Map Loading */}
          <div className="mb-4">
            <ModularLoading 
              status={riskMapStatus} 
              theme="red" 
              spinnerType="circle"
              size="full"
              className="border border-gray-200 py-8 rounded-md"
            />
          </div>
        </div>
      ) : showConfigPanel ? (
        // Risk Criteria Configuration Panel
        <div className="border rounded-md p-4 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Risk Assessment Criteria Configuration</h3>
          <RiskCriteriaConfig 
            riskMapType={activeType}
            onConfigChange={handleCriteriaChange}
          />
        </div>
      ) : (
        // Risk Map Content
        <div>
          {/* View Mode Selector */}
          <div className="mb-6">
            <h2 className="text-base font-medium text-gray-700 mb-2">View Options</h2>
            <div className="flex space-x-2">
              {Object.entries(RISK_MAP_VIEWS).map(([key, view]) => (
                <button
                  key={view}
                  onClick={() => handleViewChange(view)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeView === view
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {key === 'EVA_REPORT_SCORE' ? 'EVA Risk Report & Score' : 'Risk Lab'}
                </button>
              ))}
            </div>
          </div>
          
          {/* Risk Category Selector */}
          {riskData && (
            <div className="mb-6">
              <h2 className="text-base font-medium text-gray-700 mb-2">Risk Categories</h2>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => handleCategorySelection(category)}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      selectedCategory === category
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Risk Data Summary */}
          {riskData && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="border rounded-md p-4 bg-gray-50">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Overall Risk Score</h3>
                <div className="flex items-end">
                  <span className="text-3xl font-bold text-gray-900">{riskData.score}</span>
                  <span className="text-sm text-gray-500 ml-2 mb-1">/100</span>
                </div>
                <div className="mt-2 text-xs text-gray-600">
                  Industry avg: {riskData.industry_avg}, 
                  Confidence: {riskData.confidence}%
                </div>
              </div>
              
              <div className="border rounded-md p-4 bg-gray-50">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Risk Type</h3>
                <span className={`inline-block px-2 py-1 rounded-md text-sm font-medium ${getTypeColorClass(activeType)}`}>
                  {riskMapTypeTitle}
                </span>
              </div>
              
              <div className="border rounded-md p-4 bg-gray-50">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Key Findings</h3>
                <div className="text-sm text-gray-700">
                  {riskData.findings.length > 0 ? 
                    `${riskData.findings.length} findings identified` : 
                    'No findings available'}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RiskMapNavigator;
