import React from 'react';
import { createRoot } from 'react-dom/client';
// import { ComponentTesterApp } from './components/testing/ComponentTesterApp';

const containerElement = document.getElementById('root');
if (!containerElement) throw new Error('Failed to find the root element');
const root = createRoot(containerElement);

root.render(
  <React.StrictMode>
    <div className="p-8">
      <h1 className="mb-4 text-2xl font-bold">Test Runner Disabled</h1>
      <p className="text-gray-600">
        Component testing is temporarily disabled during development. The ComponentTesterApp
        component is not available.
      </p>
      <div className="mt-4 rounded-lg bg-blue-50 p-4">
        <p className="text-blue-800">
          To enable testing, ensure the ComponentTesterApp component exists at:
          <code className="mt-2 block rounded bg-blue-100 p-2">
            src/components/testing/ComponentTesterApp.tsx
          </code>
        </p>
      </div>
    </div>
  </React.StrictMode>,
);
