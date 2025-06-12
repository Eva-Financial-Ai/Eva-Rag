import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig, loadEnv } from 'vite';
import checker from 'vite-plugin-checker';

export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react({
        // Optimize JSX runtime for production
        jsxRuntime: 'automatic',
      }),
      // Add type checking and ESLint in development
      command === 'serve' && checker({
        typescript: true, // Only enable TypeScript checking in development
        eslint: {
          lintCommand: 'eslint ./src --ext .ts,.tsx',
          dev: {
            logLevel: ['error', 'warning'],
          },
        },
        overlay: {
          initialIsOpen: false,
          position: 'br',
          badgeStyle: 'margin-bottom: 12px; margin-right: 12px;',
        },
        enableBuild: false, // Disable during build to prevent duplicates
        // Ensure unique diagnostic handling
        terminal: true, // Use terminal output instead of overlay for better performance
      }),
    ],

    // Development server config
    server: {
      port: 5173,
      host: true,
      open: true,
      // Prevent hot reload loops
      hmr: {
        overlay: false, // Disable error overlay to prevent stuck reloads
      },
      // Proxy configuration for API calls
      proxy: {
        '/api': {
          target: env.REACT_APP_API_URL || 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
        },
        '/auth': {
          target: env.REACT_APP_API_URL || 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
        },
        '/graphql': {
          target: env.REACT_APP_API_URL || 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
        },
      },
      strictPort: true,
    },

    // Vitest configuration
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/tests/setupTests.ts',
      css: true,
      reporters: ['verbose'],
      exclude: [
        'node_modules/',
        'tests-disabled/**',
        'src/tests-disabled/**',
        '**/*.disabled.*',
        'code-cleanup-system/**',
        // Temporarily disable legacy Jest-heavy suites
        'src/api/**/__tests__/**',
        'src/services/**/__tests__/**',
        'src/components/**/__tests__/**',
      ],
      coverage: {
        reporter: ['text', 'json', 'html'],
        exclude: [
          'node_modules/',
          'src/setupTests.ts',
          'tests-disabled/**',
          'src/tests-disabled/**',
          'code-cleanup-system/**',
        ],
      },
    },

    // Optimized build configuration
    build: {
      outDir: 'build',
      sourcemap: false,
      assetsDir: 'static',
      // Increase chunk size limit for better performance
      chunkSizeWarningLimit: 1000,
      // Optimize build performance
      minify: 'esbuild',
      target: 'es2020',
      rollupOptions: {
        output: {
          // Advanced code splitting strategy
          manualChunks: {
            // Core React libraries
            'react-vendor': ['react', 'react-dom'],

            // Routing and navigation
            router: ['react-router-dom'],

            // Authentication
            auth: ['@headlessui/react'],

            // UI Components and Icons
            'ui-components': [
              '@heroicons/react',
              '@fortawesome/react-fontawesome',
              '@fortawesome/fontawesome-svg-core',
              '@fortawesome/free-solid-svg-icons',
              '@fortawesome/free-brands-svg-icons',
            ],

            // Forms and validation
            forms: ['react-hook-form', '@hookform/resolvers', 'zod'],

            // Data visualization
            charts: ['recharts', 'react-chartjs-2', 'chart.js'],

            // Data fetching and state
            data: ['@tanstack/react-query', 'axios', 'zustand'],

            // Utilities
            utils: ['date-fns', 'lodash.debounce', 'uuid', 'crypto-js'],

            // Animation and interaction
            animations: ['framer-motion', '@react-spring/web'],

            // Heavy libraries
            pdf: ['jspdf', 'jspdf-autotable', 'html2canvas', 'canvg'],
            ocr: ['tesseract.js'],
            media: ['react-advanced-cropper'],
          },
          // Production-optimized file naming
          entryFileNames: 'static/js/[name].[hash].js',
          chunkFileNames: 'static/js/[name].[hash].chunk.js',
          assetFileNames: 'static/media/[name].[hash].[ext]',
        },
        // Tree shaking optimization
        treeshake: {
          moduleSideEffects: false,
          propertyReadSideEffects: false,
          tryCatchDeoptimization: false,
        },
      },
      commonjsOptions: {
        include: [/node_modules/],
        transformMixedEsModules: true,
      },
    },

    // Enhanced path resolution
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        src: resolve(__dirname, 'src'),
        components: resolve(__dirname, 'src/components'),
        pages: resolve(__dirname, 'src/pages'),
        utils: resolve(__dirname, 'src/utils'),
        hooks: resolve(__dirname, 'src/hooks'),
        contexts: resolve(__dirname, 'src/contexts'),
        services: resolve(__dirname, 'src/services'),
        types: resolve(__dirname, 'src/types'),
        api: resolve(__dirname, 'src/api'),
        styles: resolve(__dirname, 'src/styles'),
        buffer: 'buffer',
        stream: 'stream-browserify',
        util: 'util',
        crypto: 'crypto-browserify',
        path: 'path-browserify',
        os: 'os-browserify/browser',
        vm: 'vm-browserify',
        url: 'url',
        process: 'process/browser',
      },
    },

    // Environment variables - Support both REACT_APP_ and VITE_ prefixes
    envPrefix: ['REACT_APP_', 'VITE_'],

    // Define global constants for CRA compatibility
    define: {
      global: 'globalThis',
      'process.env': JSON.stringify({
        NODE_ENV: mode,
        // Pass through all REACT_APP_ environment variables
        ...Object.keys(env)
          .filter(key => key.startsWith('REACT_APP_'))
          .reduce((acc, key) => {
            acc[key] = env[key];
            return acc;
          }, {}),
        // Environment-specific configs
        REACT_APP_ENVIRONMENT: env.REACT_APP_ENVIRONMENT || mode,
        REACT_APP_VERSION: env.REACT_APP_VERSION || '1.2.0',
        REACT_APP_AUTH0_DOMAIN: env.REACT_APP_AUTH0_DOMAIN || 'eva-platform.us.auth0.com',
        REACT_APP_AUTH0_CLIENT_ID: env.REACT_APP_AUTH0_CLIENT_ID || 'EVAPlatformAuth2023',
      }),
    },

    // Enhanced dependency optimization
    optimizeDeps: {
      include: [
        // Core dependencies
        'react',
        'react-dom',
        'react-router-dom',

        // UI libraries
        '@headlessui/react',
        '@heroicons/react',
        '@fortawesome/react-fontawesome',
        '@fortawesome/fontawesome-svg-core',

        // Forms
        'react-hook-form',
        '@hookform/resolvers',
        'zod',

        // State and data
        '@tanstack/react-query',
        'axios',
        'zustand',

        // Utilities
        'date-fns',
        'framer-motion',
        'react-toastify',
        'lodash.debounce',
        'uuid',
        'buffer',
        'process',
        'canvg',
      ],
      exclude: [
        // Exclude problematic dependencies
        '@testing-library/jest-dom',
        'cypress',
        'msw',
      ],
    },

    // CSS configuration
    css: {
      postcss: './postcss.config.js',
      devSourcemap: true,
      // CSS code splitting
      codeGeneration: 'es2020',
    },

    // Public directory
    publicDir: 'public',

    // Relative paths for deployment
    base: './',

    // Enhanced esbuild configuration
    esbuild: {
      target: 'es2020',
      logLevel: 'error',
      // Optimize production builds
      drop: mode === 'production' ? ['console', 'debugger'] : [],
      // Enable JSX optimization
      jsx: 'automatic',
    },
  };
});
