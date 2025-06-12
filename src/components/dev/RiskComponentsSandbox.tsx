import React from 'react';
import { Card } from '../common/Card';

interface RiskComponentsSandboxProps {
  darkMode?: boolean;
}

/**
 * Sandbox for testing risk assessment components
 */
const RiskComponentsSandbox: React.FC<RiskComponentsSandboxProps> = ({ darkMode = false }) => {
  return (
    <div className={darkMode ? 'text-white' : 'text-gray-800'}>
      <h2 className="text-2xl font-bold mb-6">Risk Assessment Components</h2>

      <Card className={`mb-8 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
        <h3 className="text-lg font-semibold mb-4">Risk Components</h3>
        <div className="p-4 border rounded">
          <p>Risk assessment components will be implemented here.</p>
        </div>
      </Card>
    </div>
  );
};

export default RiskComponentsSandbox;
