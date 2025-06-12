import React from 'react';

/**
 * Typography Test Component
 * 
 * This component demonstrates the unified typography system
 * and helps verify that Helvetica Neue + Inter fonts are loading
 * with the 12% size increase applied globally.
 */
const TypographyTest: React.FC = () => {
  return (
    <div className="p-8 max-w-4xl mx-auto bg-white shadow-lg rounded-lg m-4">
      <div className="border-b border-gray-200 pb-6 mb-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          EVA AI Typography System Test
        </h1>
        <p className="text-lg text-gray-600">
          Verifying Helvetica Neue primary font with Inter backup and 12% size increase
        </p>
      </div>

      {/* Font Stack Verification */}
      <section className="mb-8">
        <h2 className="text-3xl font-semibold text-gray-900 mb-4">Font Stack Test</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Primary Font Stack</h3>
            <p className="font-primary text-xl">
              The quick brown fox jumps over the lazy dog
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Should render in Helvetica Neue, then Inter, then system fonts
            </p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Monospace for Financial Data</h3>
            <p className="font-mono text-xl">
              $1,234,567.89
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Should render in SF Mono or Monaco for precise alignment
            </p>
          </div>
        </div>
      </section>

      {/* Size Hierarchy Test */}
      <section className="mb-8">
        <h2 className="text-3xl font-semibold text-gray-900 mb-4">Size Hierarchy (12% Increase Applied)</h2>
        <div className="space-y-4">
          <div>
            <h1 className="text-6xl font-bold text-gray-900">Hero Text (67px)</h1>
            <p className="text-sm text-gray-500">text-6xl - For major headlines</p>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Page Title (40px)</h1>
            <p className="text-sm text-gray-500">text-4xl - For page titles</p>
          </div>
          <div>
            <h2 className="text-3xl font-semibold text-gray-800">Section Header (34px)</h2>
            <p className="text-sm text-gray-500">text-3xl - For major sections</p>
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-gray-800">Subsection (27px)</h3>
            <p className="text-sm text-gray-500">text-2xl - For subsections</p>
          </div>
          <div>
            <h4 className="text-xl font-medium text-gray-700">Card Title (22px)</h4>
            <p className="text-sm text-gray-500">text-xl - For card titles</p>
          </div>
          <div>
            <p className="text-base text-gray-700">Body Text (18px) - Base size increased from 16px</p>
            <p className="text-sm text-gray-500">text-base - For standard body text</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Small Text (16px) - For captions and labels</p>
            <p className="text-xs text-gray-500">text-sm - For secondary information</p>
          </div>
        </div>
      </section>

      {/* Financial Components Test */}
      <section className="mb-8">
        <h2 className="text-3xl font-semibold text-gray-900 mb-4">Financial Components</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
              Total Applications
            </div>
            <div className="text-3xl font-bold text-gray-900">
              1,247
            </div>
            <div className="text-sm text-green-600 mt-1">
              +12% from last month
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
              Approved Amount
            </div>
            <div className="currency text-3xl text-green-600">
              $2,450,000
            </div>
            <div className="text-sm text-gray-600 mt-1">
              This month
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
              Average Rate
            </div>
            <div className="font-mono text-3xl font-bold text-blue-600">
              4.25%
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Current average
            </div>
          </div>
        </div>
      </section>

      {/* Form Components Test */}
      <section className="mb-8">
        <h2 className="text-3xl font-semibold text-gray-900 mb-4">Form Components</h2>
        <div className="max-w-md">
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Loan Amount
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-base"
              placeholder="Enter amount"
            />
            <p className="text-sm text-gray-500 mt-1">
              Minimum amount: $10,000
            </p>
          </div>
          <div className="flex space-x-3">
            <button className="px-4 py-2 bg-blue-600 text-white text-base font-medium rounded-md hover:bg-blue-700">
              Submit Application
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-normal rounded-md hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </div>
      </section>

      {/* Data Table Test */}
      <section className="mb-8">
        <h2 className="text-3xl font-semibold text-gray-900 mb-4">Data Table</h2>
        <div className="overflow-x-auto">
          <table className="data-table w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-sm font-semibold uppercase tracking-wide text-left p-3 border-b">
                  Application ID
                </th>
                <th className="text-sm font-semibold uppercase tracking-wide text-left p-3 border-b">
                  Borrower
                </th>
                <th className="text-sm font-semibold uppercase tracking-wide text-right p-3 border-b">
                  Amount
                </th>
                <th className="text-sm font-semibold uppercase tracking-wide text-center p-3 border-b">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="text-base p-3 border-b">APP-2024-001</td>
                <td className="text-base p-3 border-b">John Smith</td>
                <td className="currency text-right p-3 border-b">$75,000</td>
                <td className="text-center p-3 border-b">
                  <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    Approved
                  </span>
                </td>
              </tr>
              <tr>
                <td className="text-base p-3 border-b">APP-2024-002</td>
                <td className="text-base p-3 border-b">Jane Doe</td>
                <td className="currency text-right p-3 border-b">$125,000</td>
                <td className="text-center p-3 border-b">
                  <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                    Pending
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Browser Font Detection */}
      <section className="mb-8">
        <h2 className="text-3xl font-semibold text-gray-900 mb-4">Browser Font Detection</h2>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-base mb-2">
            <strong>Instructions:</strong> Open browser DevTools (F12) → Network tab → Filter by "Fonts"
          </p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>✅ You should see Inter fonts loading from Google Fonts</li>
            <li>✅ Computed styles should show 'Helvetica Neue' as primary font</li>
            <li>✅ Font sizes should be 12% larger than before</li>
            <li>✅ Financial values should use monospace fonts</li>
          </ul>
        </div>
      </section>

      {/* Responsive Test */}
      <section>
        <h2 className="text-3xl font-semibold text-gray-900 mb-4">Responsive Test</h2>
        <div className="p-4 border border-gray-200 rounded-lg">
          <p className="text-base mb-2">
            Resize your browser window to test responsive typography:
          </p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li><strong>Desktop:</strong> Full size hierarchy maintained</li>
            <li><strong>Tablet (768px):</strong> Headings scale down slightly</li>
            <li><strong>Mobile (480px):</strong> Base size becomes 16px minimum</li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default TypographyTest; 