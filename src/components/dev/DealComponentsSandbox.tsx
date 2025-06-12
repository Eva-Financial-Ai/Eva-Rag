import React from 'react';
import { Card } from '../common/Card';

interface DealComponentsSandboxProps {
  darkMode?: boolean;
}

/**
 * Sandbox for testing deal structuring components
 */
const DealComponentsSandbox: React.FC<DealComponentsSandboxProps> = ({ darkMode = false }) => {
  return (
    <div className={darkMode ? 'text-white' : 'text-gray-800'}>
      <h2 className="text-2xl font-bold mb-6">Transaction Structuring Components</h2>

      <Card className={`mb-8 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
        <h3 className="text-lg font-semibold mb-4">Deal Components</h3>
        <div className="p-4 border rounded">
          <p>Deal structuring components will be implemented here.</p>
        </div>
      </Card>
    </div>
  );
};

export default DealComponentsSandbox;
