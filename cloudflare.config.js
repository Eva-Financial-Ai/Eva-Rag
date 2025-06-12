/**
 * Cloudflare Configuration for EVA Platform
 * Optimized for Cloudflare Workers and Pages deployment
 */

module.exports = {
  // Build configuration
  build: {
    command: "npm run build:cloudflare",
    directory: "build",
    functions: "src/functions",
  },

  // Environment variables for different stages
  environments: {
    development: {
      NODE_ENV: "development",
      REACT_APP_API_URL: "http://localhost:3000/api",
      REACT_APP_ENVIRONMENT: "development",
    },
    staging: {
      NODE_ENV: "production",
      REACT_APP_API_URL: "https://eva-ai-platform-staging.workers.dev/api",
      REACT_APP_ENVIRONMENT: "staging",
    },
    production: {
      NODE_ENV: "production",
      REACT_APP_API_URL: "https://eva-platform.com/api",
      REACT_APP_ENVIRONMENT: "production",
    },
  },

  // Cloudflare Pages configuration
  pages: {
    // Custom headers for enhanced security
    headers: {
      "/*": [
        {
          key: "X-Frame-Options",
          value: "DENY",
        },
        {
          key: "X-Content-Type-Options",
          value: "nosniff",
        },
        {
          key: "X-XSS-Protection",
          value: "1; mode=block",
        },
        {
          key: "Referrer-Policy",
          value: "strict-origin-when-cross-origin",
        },
        {
          key: "Content-Security-Policy",
          value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.eva-platform.com;",
        },
      ],
      "/static/*": [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ],
    },

    // Redirects for old URLs
    redirects: [
      {
        source: "/old-dashboard",
        destination: "/dashboard",
        permanent: true,
      },
      {
        source: "/admin/*",
        destination: "/dashboard/admin/:splat",
        permanent: false,
      },
    ],

    // Rewrites for API proxying
    rewrites: [
      {
        source: "/api/:path*",
        destination: "https://api.eva-platform.com/:path*",
      },
    ],
  },

  // Workers configuration
  workers: {
    // Global error handling
    errorPages: {
      404: "/404.html",
      500: "/500.html",
    },

    // Rate limiting
    rateLimiting: {
      threshold: 1000,
      period: 60, // seconds
    },

    // Analytics
    analytics: {
      beacon: "https://cloudflareinsights.com/beacon.js",
    },
  },

  // Asset optimization
  assets: {
    // Image optimization
    images: {
      formats: ["webp", "avif"],
      quality: 85,
      sizes: [320, 640, 768, 1024, 1280, 1920],
    },

    // CSS and JS minification
    minification: {
      css: true,
      js: true,
      html: true,
    },

    // Compression
    compression: {
      gzip: true,
      brotli: true,
    },
  },

  // Development configuration
  dev: {
    port: 3000,
    host: "localhost",
    https: false,
    open: true,
  },
}; 