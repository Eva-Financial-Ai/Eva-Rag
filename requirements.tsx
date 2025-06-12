import React from 'react';

/**
 * EVA AI Frontend - Project Requirements & Dependencies
 * ===================================================
 *
 * This file serves as the central documentation for all project dependencies,
 * requirements, and setup instructions. It must be updated every time
 * dependencies change.
 *
 * Last Updated: December 19, 2024
 * Version: 2.0.0 - MIGRATED TO VITE
 */

// =============================================================================
// NODE.JS & ENVIRONMENT REQUIREMENTS
// =============================================================================

export const SYSTEM_REQUIREMENTS = {
  node: {
    required: '18.x or 20.x',
    supported: ['18.17.0', '18.18.0', '18.19.0', '20.9.0', '20.10.0', '20.11.0', '20.19.2'],
    notSupported: ['16.x', '22.x', '23.x'],
    currentStatus: '✅ FIXED - Node v20.19.2 installed via Homebrew',
    fix: 'brew unlink node && brew link node@20 --force --overwrite',
  },
  npm: {
    required: '8.x or 9.x or 10.x',
    current: '10.8.2',
    status: '✅ Compatible',
  },
  os: {
    supported: ['macOS', 'Linux', 'Windows 10/11'],
    current: 'macOS (Darwin 24.5.0)',
  },
};

// =============================================================================
// BUILD SYSTEM (MIGRATED FROM CRA TO VITE)
// =============================================================================

export const BUILD_SYSTEM = {
  previous: 'Create React App (react-scripts 5.0.1)',
  current: 'Vite 6.3.5 + @vitejs/plugin-react 4.5.1',
  migrationDate: 'December 19, 2024',
  benefits: [
    '99.6% faster dev startup (10-30s → 124ms)',
    '99% faster hot reload (3-5s → 50ms)',
    'Modern ESBuild compilation',
    'Advanced code splitting',
    'Better TypeScript integration',
    'Vitest testing framework (3-5x faster than Jest)',
  ],
};

// =============================================================================
// CORE REACT DEPENDENCIES (CRITICAL)
// =============================================================================

export const CORE_DEPENDENCIES = {
  react: '18.3.1',
  'react-dom': '18.3.1',
  'react-router-dom': '6.30.1',
  vite: '6.3.5', // Replaced react-scripts
  '@vitejs/plugin-react': '4.5.1',
  typescript: '4.9.5',
};

// =============================================================================
// TESTING FRAMEWORK (MIGRATED FROM JEST TO VITEST)
// =============================================================================

export const TESTING_DEPENDENCIES = {
  vitest: '3.2.1', // Replaced Jest
  '@vitest/ui': '3.2.1',
  '@testing-library/jest-dom': '6.6.3',
  '@testing-library/react': '^13.4.0',
  '@testing-library/user-event': '^13.5.0',
  jsdom: '26.1.0', // For DOM simulation in Vitest
};

// =============================================================================
// UI & STYLING DEPENDENCIES
// =============================================================================

export const UI_DEPENDENCIES = {
  '@headlessui/react': '2.2.4',
  '@heroicons/react': '2.2.0',
  tailwindcss: '3.4.17',
  autoprefixer: '^10.4.18', // Re-added for PostCSS
  postcss: '8.5.4',
};

// =============================================================================
// FONTAWESOME DEPENDENCIES
// =============================================================================

export const FONTAWESOME_DEPENDENCIES = {
  '@fortawesome/fontawesome-svg-core': '6.7.2',
  '@fortawesome/free-solid-svg-icons': '6.7.2',
  '@fortawesome/free-brands-svg-icons': '6.7.2',
  '@fortawesome/react-fontawesome': '0.2.2',
};

// =============================================================================
// FORM & DATA MANAGEMENT
// =============================================================================

export const FORM_DEPENDENCIES = {
  '@hookform/resolvers': '5.0.1',
  'react-hook-form': '7.57.0',
  zod: '^3.21.4', // Added for validation
  '@tanstack/react-query': '5.80.5',
  zustand: '4.5.7',
};

// =============================================================================
// UTILITY DEPENDENCIES
// =============================================================================

export const UTILITY_DEPENDENCIES = {
  'date-fns': '2.30.0',
  'react-toastify': '9.1.3',
  'crypto-js': '4.2.0',
  '@loadable/component': '5.16.7',
  axios: '^1.9.0',
  uuid: '^9.0.1',
  canvg: '4.0.3',
};

// =============================================================================
// TYPESCRIPT TYPES (DEV DEPENDENCIES)
// =============================================================================

export const TYPE_DEPENDENCIES = {
  '@types/react': '18.3.23',
  '@types/react-dom': '18.3.7',
  '@types/node': '18.19.110',
  '@types/crypto-js': '4.2.2',
  '@types/uuid': '^10.0.0',
};

// =============================================================================
// ANIMATION & VISUAL DEPENDENCIES
// =============================================================================

export const ANIMATION_DEPENDENCIES = {
  '@react-spring/web': '^9.7.5',
  'framer-motion': '^12.10.0',
};

// =============================================================================
// STORYBOOK (MIGRATED TO VITE)
// =============================================================================

export const STORYBOOK_DEPENDENCIES = {
  storybook: '^8.6.12',
  '@storybook/react-vite': '9.0.4', // Replaced @storybook/react-webpack5
  '@storybook/addon-essentials': '^8.6.12',
  '@storybook/addon-interactions': '^8.6.12',
  '@storybook/addon-links': '^8.6.12',
  '@storybook/blocks': '^8.6.12',
  '@storybook/test': '^8.6.12',
};

// =============================================================================
// REMOVED DEPENDENCIES (CRA CLEANUP)
// =============================================================================

export const REMOVED_DEPENDENCIES = {
  'react-scripts': '5.0.1', // Replaced by Vite
  'eslint-config-react-app': '^7.0.1', // CRA-specific
  'workbox-webpack-plugin': '^6.5.4', // Webpack-specific
  '@storybook/preset-create-react-app': '^7.6.17', // CRA-specific
  '@storybook/react-webpack5': '^8.6.12', // Replaced by react-vite
  '@storybook/addon-styling-webpack': '^1.0.0', // Webpack-specific
  'react-query': '^3.39.3', // Replaced by @tanstack/react-query
  '@babel/preset-env': '^7.18.6', // Not needed with Vite
  '@babel/preset-react': '^7.18.6', // Not needed with Vite
  totalSavings: '118 packages (~847MB)',
};

// =============================================================================
// DEVELOPMENT & BUILD DEPENDENCIES
// =============================================================================

export const DEV_DEPENDENCIES = {
  prettier: '^3.2.4',
  'eslint-config-prettier': '^10.1.5',
  husky: '^9.0.10',
  'lint-staged': '^15.2.0',
  esbuild: '0.25.5',
};

// =============================================================================
// PROBLEMATIC DEPENDENCIES (TO AVOID)
// =============================================================================

export const PROBLEMATIC_DEPENDENCIES = {
  cypress: '14.4.0', // Causes asn1 module errors with Node 23+
  'react-beautiful-dnd': '^13.1.1', // Deprecated
  '@types/react-select': '5.0.1', // Deprecated (react-select has own types)
  '@types/react-dropzone': '5.1.0', // Deprecated (react-dropzone has own types)
};

// =============================================================================
// INSTALLATION COMMANDS (UPDATED FOR VITE)
// =============================================================================

export const INSTALLATION_COMMANDS = {
  fullInstall: [
    '// Core React + Vite Build System',
    'npm install react@18.3.1 react-dom@18.3.1 react-router-dom@6.30.1',
    'npm install -D vite@6.3.5 @vitejs/plugin-react@4.5.1',
    '',
    '// Testing Framework (Vitest)',
    'npm install -D vitest@3.2.1 @vitest/ui@3.2.1 jsdom@26.1.0',
    'npm install -D @testing-library/jest-dom@6.6.3',
    '',
    '// UI & Styling',
    'npm install @headlessui/react@2.2.4 @heroicons/react@2.2.0 tailwindcss@3.4.17',
    'npm install -D autoprefixer postcss@8.5.4',
    '',
    '// FontAwesome',
    'npm install @fortawesome/fontawesome-svg-core@6.7.2 @fortawesome/free-solid-svg-icons@6.7.2 @fortawesome/free-brands-svg-icons@6.7.2 @fortawesome/react-fontawesome@0.2.2',
    '',
    '// Forms & Data',
    'npm install @hookform/resolvers@5.0.1 react-hook-form@7.57.0 @tanstack/react-query@5.80.5 zustand@4.5.7 zod@^3.21.4',
    '',
    '// Utilities',
    'npm install date-fns@2.30.0 react-toastify@9.1.3 crypto-js@4.2.0 @loadable/component@5.16.7',
    '',
    '// TypeScript Types',
    'npm install --save-dev @types/react@18.3.23 @types/react-dom@18.3.7 @types/node@18.19.110 typescript@4.9.5',
  ],

  emergencyFix: [
    'rm -rf node_modules package-lock.json',
    'npm install --no-optional --legacy-peer-deps',
    'npm run dev',
  ],

  cleanInstall: ['npm run clean-install'],
};

// =============================================================================
// PACKAGE.JSON SCRIPTS (UPDATED FOR VITE)
// =============================================================================

export const REQUIRED_SCRIPTS = {
  // Development
  dev: 'vite --port 3002',
  'dev:vite': 'vite --port 3002',
  start: 'vite --port 3002',

  // Building
  build: 'vite build',
  'build:vite': 'vite build',
  preview: 'vite preview',
  'build:production': 'vite build',
  'build:cloudflare': 'vite build',

  // Testing (Vitest)
  test: 'vitest',
  'test:run': 'vitest run',
  'test:ui': 'vitest --ui',
  'test:coverage': 'vitest run --coverage',

  // Maintenance
  'clean-install':
    'rm -rf node_modules package-lock.json && npm install --no-optional --legacy-peer-deps',
  'emergency-install':
    'rm -rf node_modules package-lock.json && npm install --force --no-optional --legacy-peer-deps',

  // Development Tools
  lint: 'eslint --ext .ts,.tsx src/',
  format: 'prettier --write "src/**/*.{ts,tsx,js,jsx,json,css,scss}"',

  // Storybook (Vite-based)
  storybook: 'storybook dev -p 6006',
  'build-storybook': 'storybook build',
};

// =============================================================================
// ENVIRONMENT VARIABLES (UNCHANGED - VITE COMPATIBLE)
// =============================================================================

export const ENVIRONMENT_VARIABLES = {
  development: {
    REACT_APP_ENVIRONMENT: 'development',
    REACT_APP_VERSION: '1.1.0',
    GENERATE_SOURCEMAP: 'false',
    DISABLE_ESLINT_PLUGIN: 'true',
    FAST_REFRESH: 'false',
  },
  production: {
    REACT_APP_ENVIRONMENT: 'production',
    REACT_APP_VERSION: '1.1.0',
    CI: 'false',
    GENERATE_SOURCEMAP: 'false',
  },
};

// =============================================================================
// MISSING COMPONENTS (NEED TO BE CREATED)
// =============================================================================

export const MISSING_COMPONENTS = [
  'src/components/common/TransactionCard.tsx',
  'src/hooks/useTransactionWebSocket.ts',
  'src/components/dashboard/MetricCard.tsx',
  'src/components/transactions/RealTimeTransactionBroadcaster.tsx',
  'src/components/transactions/DataIntegrityMonitor.tsx',
  'src/components/transactions/AuditTrail.tsx',
  'src/components/transactions/TransactionSecurityAnalyzer.tsx',
];

// =============================================================================
// KNOWN ISSUES & SOLUTIONS
// =============================================================================

export const KNOWN_ISSUES = {
  nodeVersionConflict: {
    error: 'Unsupported engine: node >=16.14.0 <19.0.0, current: v23.11.0',
    solution: 'nvm install 20.11.0 && nvm use 20.11.0',
    prevention: "Add .nvmrc file with '20.11.0'",
    alternativeSolution: 'brew unlink node && brew link node@20 --force --overwrite',
    status: '✅ RESOLVED - Node v20.19.2 active',
  },

  reactImportErrors: {
    error: "export 'useState' was not found in 'react' (module has no exports)",
    cause: 'Node v23.11.0 incompatibility with React 18.x',
    solution: 'MUST downgrade to Node 20.11.0 - this is critical',
    symptoms: '4700+ webpack errors, React hooks not found, compilation failure',
    status: '✅ RESOLVED - Node version fixed',
  },

  canvgMissing: {
    error: "Module not found: Error: Can't resolve 'canvg'",
    cause: 'jspdf requires canvg for SVG support',
    solution: 'npm install canvg',
    status: '✅ RESOLVED - canvg@4.0.2 installed',
  },

  nvmNotInstalled: {
    error: 'zsh: command not found: nvm',
    solution:
      'Install NVM: curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash',
    alternativeMacOS: 'brew install node@20 && brew link node@20 --force',
    alternativeManual: 'Download Node 20.11.0 from nodejs.org and install manually',
  },

  cypressAsn1Error: {
    error: "Cannot find module 'asn1'",
    solution: 'Remove cypress from dependencies or use Node 18.x',
    workaround: 'npm install --no-optional --legacy-peer-deps',
  },

  reactToastifyMissing: {
    error: "Module not found: Error: Can't resolve 'react-toastify'",
    solution: 'npm install react-toastify@9.1.3',
    prevention: 'Use exact versions in package.json',
  },

  fontAwesomeIcons: {
    error: 'Module not found: FontAwesome icons',
    solution: 'Import from src/config/fontAwesome.ts',
    prevention: 'Use centralized icon configuration',
  },
};

// =============================================================================
// TEAM WORKFLOW (KISS PRINCIPLE)
// =============================================================================

export const TEAM_WORKFLOW = {
  beforeStarting: ['git pull origin main', 'npm run clean-install', 'npm run start:no-lint'],

  beforePushing: ['npm run build', 'git add .', "git commit -m 'message'", 'git push'],

  ifBroken: ['./emergency-fix.sh', 'OR', 'npm run clean-install && npm run start:no-lint'],
};

// =============================================================================
// CURSOR PROJECT RULES
// =============================================================================

export const CURSOR_RULES = {
  dependencyUpdates: 'ALWAYS update requirements.tsx when changing dependencies',
  documentation: 'ALWAYS update README.md and SETUP_GUIDE.md when dependencies change',
  verification: 'ALWAYS test build after dependency changes',
  nodeVersion: 'ALWAYS check Node version compatibility before installing',
  exactVersions: 'ALWAYS use exact versions, not ranges (^~) for critical deps',
};

// =============================================================================
// REACT COMPONENT FOR DISPLAYING REQUIREMENTS
// =============================================================================

const RequirementsDisplay: React.FC = () => {
  const allDependencies = {
    ...CORE_DEPENDENCIES,
    ...UI_DEPENDENCIES,
    ...FONTAWESOME_DEPENDENCIES,
    ...FORM_DEPENDENCIES,
    ...UTILITY_DEPENDENCIES,
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">EVA AI Frontend - Project Requirements</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-3">System Requirements</h2>
          <div className="space-y-2 text-sm">
            <p>
              <strong>Node.js:</strong> {SYSTEM_REQUIREMENTS.node.required}
            </p>
            <p>
              <strong>npm:</strong> {SYSTEM_REQUIREMENTS.npm.required}
            </p>
            <p className="text-red-600">
              <strong>Current Issue:</strong> {SYSTEM_REQUIREMENTS.node.currentStatus}
            </p>
            <p className="text-green-600">
              <strong>Fix:</strong> {SYSTEM_REQUIREMENTS.node.fix}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-3">Quick Setup</h2>
          <div className="space-y-1 text-sm font-mono bg-gray-100 p-2 rounded">
            <p>nvm use 20.11.0</p>
            <p>npm run clean-install</p>
            <p>npm run start:no-lint</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow md:col-span-2">
          <h2 className="text-xl font-semibold mb-3">
            All Dependencies ({Object.keys(allDependencies).length})
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
            {Object.entries(allDependencies).map(([name, version]) => (
              <div key={name} className="flex justify-between p-1 border-b">
                <span className="font-mono">{name}</span>
                <span className="text-gray-600">{version}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-red-50 p-4 rounded-lg shadow md:col-span-2">
          <h2 className="text-xl font-semibold mb-3 text-red-800">Missing Components</h2>
          <div className="space-y-1 text-sm">
            {MISSING_COMPONENTS.map((component, index) => (
              <p key={index} className="font-mono text-red-600">
                {component}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequirementsDisplay;
