import React, { useState, Suspense, lazy } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

// Lazy-load component categories to reduce initial load time
const CommonComponents = lazy(() => import('../components/dev/CommonComponentsSandbox'));
const RiskComponents = lazy(() => import('../components/dev/RiskComponentsSandbox'));
const DealComponents = lazy(() => import('../components/dev/DealComponentsSandbox'));
const DocumentComponents = lazy(() => import('../components/dev/DocumentComponentsSandbox'));

// Component category metadata
const componentCategories = [
  { id: 'common', name: 'Common UI', component: CommonComponents },
  { id: 'risk', name: 'Risk Assessment', component: RiskComponents },
  { id: 'deal', name: 'Transaction Structuring', component: DealComponents },
  { id: 'document', name: 'Document Management', component: DocumentComponents },
];

/**
 * Component Sandbox Page
 *
 * A development environment for testing components in isolation.
 * Components can be viewed with different props, states, and themes.
 */
const ComponentSandbox: React.FC = () => {
  const { categoryId } = useParams<{ categoryId?: string }>();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [showResponsiveTools, setShowResponsiveTools] = useState(false);
  const [viewportWidth, setViewportWidth] = useState('100%');

  // Select the active category based on URL param
  const activeCategory = componentCategories.find(cat => cat.id === categoryId);
  const ActiveComponent = activeCategory?.component;

  // Handle category change
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    navigate(`/component-sandbox/${e.target.value}`);
  };

  return (
    <div
      className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}
    >
      {/* Header */}
      <header
        className={`p-4 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} border-b flex flex-wrap justify-between items-center`}
      >
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold">Component Sandbox</h1>

          <select
            value={categoryId || ''}
            onChange={handleCategoryChange}
            className={`px-3 py-1 rounded ${darkMode ? 'bg-gray-700' : 'bg-white'}`}
          >
            <option value="" disabled>
              Select a category
            </option>
            {componentCategories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowResponsiveTools(!showResponsiveTools)}
            className={`px-3 py-1 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
          >
            {showResponsiveTools ? 'Hide Responsive Tools' : 'Show Responsive Tools'}
          </button>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`px-3 py-1 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
          >
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>

          <Link to="/" className={`px-3 py-1 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
            Exit Sandbox
          </Link>
        </div>
      </header>

      {/* Responsive tools */}
      {showResponsiveTools && (
        <div className={`p-4 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} border-b`}>
          <div className="flex items-center space-x-4">
            <span>Viewport width:</span>

            {['320px', '768px', '1024px', '1440px', '100%'].map(width => (
              <button
                key={width}
                onClick={() => setViewportWidth(width)}
                className={`px-3 py-1 rounded ${
                  viewportWidth === width
                    ? darkMode
                      ? 'bg-blue-600'
                      : 'bg-blue-500 text-white'
                    : darkMode
                      ? 'bg-gray-700'
                      : 'bg-gray-200'
                }`}
              >
                {width}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main content */}
      <main className={`p-4 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
        {!categoryId ? (
          <div className="text-center py-16">
            <h2 className="text-2xl mb-4">Select a component category to begin</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {componentCategories.map(cat => (
                <Link
                  key={cat.id}
                  to={`/component-sandbox/${cat.id}`}
                  className={`p-6 rounded-lg border ${
                    darkMode
                      ? 'bg-gray-800 border-gray-700 hover:bg-gray-700'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }
                    transition-colors duration-200 text-center`}
                >
                  <h3 className="text-lg font-semibold mb-2">{cat.name}</h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    View and test {cat.name.toLowerCase()} components
                  </p>
                </Link>
              ))}
            </div>
          </div>
        ) : ActiveComponent ? (
          <div style={{ width: viewportWidth, margin: '0 auto' }}>
            <Suspense fallback={<div className="text-center py-8">Loading components...</div>}>
              <ActiveComponent darkMode={darkMode} />
            </Suspense>
          </div>
        ) : (
          <div className="text-center py-16">
            <h2 className="text-2xl mb-4">Category not found</h2>
            <Link
              to="/component-sandbox"
              className={`inline-block px-4 py-2 rounded ${darkMode ? 'bg-blue-600' : 'bg-blue-500 text-white'}`}
            >
              Back to categories
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default ComponentSandbox;
