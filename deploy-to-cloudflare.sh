#!/bin/bash

echo "🚀 Starting Cloudflare deployment process..."

# Check if environment is specified
ENVIRONMENT=${1:-production}

echo "📋 Deploying to: $ENVIRONMENT"

# Load environment variables based on environment
if [ "$ENVIRONMENT" = "staging" ]; then
  export $(cat .env.staging | grep -v '^#' | xargs)
  ZONE_ID=$REACT_APP_CLOUDFLARE_ZONE_ID
  DOMAIN="evafin.ai"
elif [ "$ENVIRONMENT" = "production" ]; then
  export $(cat .env.production | grep -v '^#' | xargs)
  ZONE_ID=$REACT_APP_CLOUDFLARE_ZONE_ID
  DOMAIN="evafi.ai"
else
  echo "❌ Invalid environment. Use 'staging' or 'production'"
  exit 1
fi

# Build the application
echo "🔨 Building the application..."
npx vite build

if [ $? -ne 0 ]; then
  echo "❌ Build failed"
  exit 1
fi

# Deploy to Cloudflare Pages
echo "☁️ Deploying to Cloudflare Pages..."
npx wrangler pages deploy build \
  --project-name="evafi-platform-$ENVIRONMENT" \
  --branch="$ENVIRONMENT" \
  --commit-dirty=true

if [ $? -ne 0 ]; then
  echo "❌ Cloudflare Pages deployment failed"
  exit 1
fi

# Deploy Workers
echo "⚡ Deploying API Gateway Worker..."
cd workers
npx wrangler deploy --env $ENVIRONMENT

if [ $? -ne 0 ]; then
  echo "❌ Worker deployment failed"
  cd ..
  exit 1
fi
cd ..

# Update DNS records
echo "🌐 Updating DNS records..."
curl -X PUT "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
  -H "X-Auth-Email: $REACT_APP_CLOUDFLARE_EMAIL" \
  -H "X-Auth-Key: $REACT_APP_CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json"

echo "✅ Deployment complete!"
echo "🌐 Your app is available at: https://demo.$DOMAIN"
echo ""
echo "📋 Next steps:"
echo "1. Verify the deployment at https://demo.$DOMAIN"
echo "2. Check worker logs: npx wrangler tail --env $ENVIRONMENT"
echo "3. Monitor performance in Cloudflare dashboard"