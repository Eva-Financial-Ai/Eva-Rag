import React, { useState, useEffect } from 'react';
import { enableMockWebSocket, disableMockWebSocket } from '../../services/mockWebSocketServer';
import { useUserPermissions, UserRole } from '../../hooks/useUserPermissions';
import {
  WifiIcon,
  CogIcon,
  PlayIcon,
  PauseIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  BoltIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

interface MockWebSocketControlProps {
  className?: string;
}

const MockWebSocketControl: React.FC<MockWebSocketControlProps> = ({ className = '' }) => {
  const { currentRole } = useUserPermissions();
  const [isEnabled, setIsEnabled] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    messageInterval: 5000,
    simulateErrors: false,
    simulateLatency: true,
    enableBusinessScenarios: true,
    scenarioInterval: 15000,
  });
  const [lastScenario, setLastScenario] = useState<string>('');
  const [scenarioCount, setScenarioCount] = useState(0);

  // Check if current user is a system user
  const isSystemUser = [
    UserRole.SYSTEM_ADMIN,
    UserRole.EVA_ADMIN,
    UserRole.COMPLIANCE_OFFICER,
    UserRole.SUPPORT_REP,
  ].includes(currentRole);

  useEffect(() => {
    // Check if mock WebSocket is enabled
    const isMockEnabled = (window as any).WebSocket?.name === 'MockWebSocket';
    setIsEnabled(isMockEnabled);

    // Load saved settings
    const savedSettings = localStorage.getItem('mockWebSocketSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  useEffect(() => {
    // Listen for scenario events
    const handleScenarioEvent = (event: CustomEvent) => {
      if (event.detail?.scenario) {
        setLastScenario(event.detail.scenario);
        setScenarioCount(prev => prev + 1);
      }
    };

    window.addEventListener('mockws:scenario' as any, handleScenarioEvent as any);
    return () => {
      window.removeEventListener('mockws:scenario' as any, handleScenarioEvent as any);
    };
  }, []);

  const toggleMockWebSocket = () => {
    if (isEnabled) {
      disableMockWebSocket();
      setIsEnabled(false);
      // Reload to apply changes
      window.location.reload();
    } else {
      enableMockWebSocket();
      setIsEnabled(true);
      // Reload to apply changes
      window.location.reload();
    }
  };

  const updateSettings = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    // Store in localStorage for persistence
    localStorage.setItem('mockWebSocketSettings', JSON.stringify(newSettings));
  };

  const triggerScenario = (scenario: string) => {
    // Dispatch custom event to trigger specific scenario
    window.dispatchEvent(new CustomEvent('mockws:trigger-scenario', { detail: { scenario } }));
  };

  // Only show in development AND for system users
  if (process.env.NODE_ENV !== 'development' || !isSystemUser) {
    return null;
  }

  return (
    <div className={`fixed bottom-4 left-4 z-50 ${className}`}>
      {/* Main Control Button */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3">
        <div className="flex items-center space-x-3">
          <WifiIcon className={`w-5 h-5 ${isEnabled ? 'text-green-500' : 'text-gray-400'}`} />
          <span className="text-sm font-medium text-gray-700">Mock WebSocket</span>
          <button
            onClick={toggleMockWebSocket}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              isEnabled
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {isEnabled ? 'Enabled' : 'Disabled'}
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1 text-gray-500 hover:text-gray-700"
          >
            <CogIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mt-3 pt-3 border-t border-gray-200 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Update Interval (ms)
                </label>
                <input
                  type="number"
                  value={settings.messageInterval}
                  onChange={e => updateSettings('messageInterval', parseInt(e.target.value))}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                  min="1000"
                  step="1000"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Scenario Interval (ms)
                </label>
                <input
                  type="number"
                  value={settings.scenarioInterval}
                  onChange={e => updateSettings('scenarioInterval', parseInt(e.target.value))}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                  min="5000"
                  step="5000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-gray-600">Simulate Errors</label>
                <button
                  onClick={() => updateSettings('simulateErrors', !settings.simulateErrors)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    settings.simulateErrors ? 'bg-red-500' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      settings.simulateErrors ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-gray-600">Simulate Latency</label>
                <button
                  onClick={() => updateSettings('simulateLatency', !settings.simulateLatency)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    settings.simulateLatency ? 'bg-blue-500' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      settings.simulateLatency ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-gray-600">Business Scenarios</label>
                <button
                  onClick={() =>
                    updateSettings('enableBusinessScenarios', !settings.enableBusinessScenarios)
                  }
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    settings.enableBusinessScenarios ? 'bg-purple-500' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      settings.enableBusinessScenarios ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Manual Scenario Triggers */}
            {isEnabled && settings.enableBusinessScenarios && (
              <div className="pt-3 border-t border-gray-200">
                <p className="text-xs font-medium text-gray-600 mb-2">Trigger Scenarios</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => triggerScenario('morning_rush')}
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    <BoltIcon className="w-3 h-3 inline mr-1" />
                    Morning Rush
                  </button>
                  <button
                    onClick={() => triggerScenario('compliance_sweep')}
                    className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                  >
                    <ExclamationTriangleIcon className="w-3 h-3 inline mr-1" />
                    Compliance
                  </button>
                  <button
                    onClick={() => triggerScenario('month_end_processing')}
                    className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                  >
                    <ChartBarIcon className="w-3 h-3 inline mr-1" />
                    Month End
                  </button>
                  <button
                    onClick={() => triggerScenario('fraud_alert')}
                    className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                  >
                    <ExclamationTriangleIcon className="w-3 h-3 inline mr-1" />
                    Fraud Alert
                  </button>
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                {isEnabled ? (
                  <span className="flex items-center text-green-600">
                    <PlayIcon className="w-3 h-3 mr-1" />
                    Mock server is running
                  </span>
                ) : (
                  <span className="flex items-center text-gray-400">
                    <PauseIcon className="w-3 h-3 mr-1" />
                    Mock server is stopped
                  </span>
                )}
              </p>
              {settings.simulateErrors && (
                <p className="text-xs text-red-500 mt-1 flex items-center">
                  <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
                  Error simulation active
                </p>
              )}
              {settings.enableBusinessScenarios && isEnabled && (
                <p className="text-xs text-purple-600 mt-1 flex items-center">
                  <ClockIcon className="w-3 h-3 mr-1" />
                  Scenarios: {scenarioCount} run
                  {lastScenario && <span className="ml-1">({lastScenario})</span>}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Info Tooltip */}
      <div className="mt-2 text-xs text-gray-500 bg-white rounded px-2 py-1 shadow">
        {isEnabled
          ? 'Using mock WebSocket server for development'
          : 'Using real WebSocket connection'}
      </div>
    </div>
  );
};

export default MockWebSocketControl;
