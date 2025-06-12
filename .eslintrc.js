module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: ['react-app', 'react-app/jest'],
  rules: {
    // TIER 1 MANDATORY - Financial Compliance Rules

    // Console rules for financial applications
    'no-console': [
      'warn',
      {
        allow: ['error', 'warn'], // Allow error and warning logs for audit trails
      },
    ],

    // React Hooks rules (CRITICAL for financial apps)
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // TypeScript rules for financial safety
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      },
    ],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/ban-ts-comment': 'warn',
    '@typescript-eslint/no-empty-function': 'warn',

    // Security-related rules for financial apps
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-script-url': 'error',

    // Code quality rules
    'no-useless-escape': 'warn',
    'prefer-const': 'warn',
    'no-var': 'error',

    // React specific rules
    'react/jsx-uses-react': 'off', // Not needed in React 17+
    'react/react-in-jsx-scope': 'off', // Not needed in React 17+
    'react/prop-types': 'off',

    // Accessibility rules (important for financial applications)
    'jsx-a11y/anchor-is-valid': 'warn',
    'jsx-a11y/alt-text': 'warn',
  },
  overrides: [
    // Special rules for development files
    {
      files: [
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.spec.ts',
        '**/*.spec.tsx',
        '**/test/**/*',
        '**/tests/**/*',
        '**/dev/**/*',
        '**/*.dev.*',
        '**/utils/auditLogger.ts', // Allow console in audit logger
        '**/utils/consoleErrorSuppressor.ts', // Allow console in suppressor
        '**/scripts/**/*', // Allow console in scripts
        '**/monitoring/**/*', // Allow console in monitoring
      ],
      rules: {
        'no-console': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
      },
    },

    // Special rules for configuration files
    {
      files: [
        '**/*.config.js',
        '**/*.config.ts',
        '**/webpack.config.js',
        '**/craco.config.js',
        '**/.eslintrc.js',
      ],
      rules: {
        'no-console': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        'import/no-anonymous-default-export': 'off',
      },
    },

    // Special rules for mock/demo files
    {
      files: [
        '**/mock/**/*',
        '**/mocks/**/*',
        '**/*.mock.*',
        '**/demo/**/*',
        '**/*.demo.*',
        '**/example/**/*',
        '**/*.example.*',
      ],
      rules: {
        'no-console': 'warn', // More lenient for demos
        '@typescript-eslint/no-explicit-any': 'warn',
      },
    },
  ],
  settings: {
    react: {
      version: 'detect',
    },
  },
  ignorePatterns: ['build/', 'dist/', 'node_modules/', '*.min.js', 'public/', 'coverage/'],
};
