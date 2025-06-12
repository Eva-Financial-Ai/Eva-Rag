#!/bin/bash

# =============================================================================
# EVA AI FINANCIAL PLATFORM - SERVER STARTUP SCRIPT
# =============================================================================

# Export all environment variables
export NODE_ENV=development
export REACT_APP_ENVIRONMENT=staging
export REACT_APP_API_URL=https://api.evafin.ai

# Auth0 Configuration
export REACT_APP_AUTH0_DOMAIN=evafi.us.auth0.com
export REACT_APP_AUTH0_CLIENT_ID=BbrWazHbCMd33mlvcZVQMDWRjWsIpd6c
export REACT_APP_AUTH0_AUDIENCE=https://your-api-audience
export AUTH0_API_AUDIENCE=https://evafi-api

# Financial Services
export PLAID_CLIENT_ID=6418eb26d9bca8001387b1db
export REACT_APP_PLAID_PUBLIC_KEY=4c46ca78f07d8973872ecd9d8bc03b
export REACT_APP_PLAID_CLIENT_ID=6418eb26d9bca8001387b1db
export REACT_APP_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key

# Additional Services
export REACT_APP_GEOAPIFY_API_KEY=a2abd490437d48db9a12c37f4a52e570

# Cloudflare Configuration
export CLOUDFLARE_ACCOUNT_ID=eace6f3c56b5735ae4a9ef385d6ee914
export CLOUDFLARE_API_TOKEN=jc34AyDPYbRlfalYKuili95zLtYciRE889B_BMIz
export CLOUDFLARE_EMAIL=support@evafi.ai
export CLOUDFLARE_IMAGES_API=QG4Ku8w8UNM29vIZV1VoMeHEAOi9U7UF
export CLOUDFLARE_STREAM_SUBDOMAIN=customer-9eikf9ekxbfirnkc.cloudflarestream.com

# Cloudflare R2 Storage
export R2_ACCOUNT_ID=eace6f3c56b5735ae4a9ef385d6ee914
export R2_ACCESS_KEY_ID=22aac1d0f8542cf6a9be1fdb44c68dc2
export R2_SECRET_ACCESS_KEY=0dc0cf11cea1d7ada5e3ae22b0630ee13c13dcd3b8361d778b3ebc67485c6b93
export R2_BUCKET_NAME=evafi-documents
export R2_ENDPOINT_URL=https://eace6f3c56b5735ae4a9ef385d6ee914.r2.cloudflarestorage.com

# Supabase Configuration
export SUPABASE_URL=https://qvtecrqbtblajnzoqial.supabase.co
export SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2dGVjcnFidGJsYWpuem9xaWFsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzY5MDc2NCwiZXhwIjoyMDYzMjY2NzY0fQ.5BYhXVrcSq3SFl8v-aS7AzObwZKbxnuDToIxEq2d2qk
export DATABASE_URL=postgresql://postgres:evafidatabase123@db.qvtecrqbtblajnzoqial.supabase.co:5432/postgres

# Application Configuration
export DEMO_MODE=false
export REACT_APP_DEMO_MODE=false

# Search Services
export BRAVE_WEB_SEARCH_PUBLIC=BSATKOc1OJmoLGrvuMo2mGlcHN3uZVA
export BRAVE_WEB_SEARCH_SECRET=BSAXT6b8J9uBKl5vzL4w31q5K2sNjXZ

# Feature Flags
export REACT_APP_ENABLE_ANALYTICS=true
export REACT_APP_ENABLE_SERVICE_WORKER=true
export REACT_APP_ENABLE_PWA=false
export REACT_APP_ENABLE_DEBUG=true

echo "🚀 Starting Eva AI Financial Platform..."
echo "📍 Environment: $REACT_APP_ENVIRONMENT"
echo "🔗 API URL: $REACT_APP_API_URL"
echo "🔐 Auth0 Domain: $REACT_APP_AUTH0_DOMAIN"

# Start the development server
npm run dev 