#!/bin/bash

# =============================================
# EVA Platform Quick Deploy Script
# =============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT=${1:-"development"}
COMPONENT=${2:-"all"}

echo -e "${BLUE}🚀 EVA Platform Quick Deploy - ${ENVIRONMENT} environment${NC}"

# Function to deploy specific component
deploy_component() {
    local component=$1
    local env=$2
    
    echo -e "${YELLOW}Deploying ${component} to ${env}...${NC}"
    
    case $component in
        "api")
            wrangler deploy cloudflare-workers/eva-api-gateway.js --env ${env} --name eva-api-gateway-${env}
            ;;
        "files")
            wrangler deploy cloudflare-workers/eva-file-access-worker.js --env ${env} --name eva-file-access-${env}
            ;;
        "matching")
            wrangler deploy cloudflare-workers/eva-smart-matching-worker.js --env ${env} --name eva-smart-matching-${env}
            ;;
        "chat")
            wrangler deploy cloudflare-workers/eva-filelock-chat-worker.js --env ${env} --name eva-filelock-chat-${env}
            ;;
        "frontend")
            echo -e "${BLUE}Building frontend for ${env}...${NC}"
            if [ "${env}" = "production" ]; then
                npm run build
            else
                npm run build:dev
            fi
            ;;
        "db")
            echo -e "${BLUE}Updating database schema for ${env}...${NC}"
            wrangler d1 execute eva-platform-db-${env} --file=docs/DATABASE_SCHEMA.sql
            if [ "${env}" != "production" ]; then
                echo -e "${BLUE}Loading sample data...${NC}"
                wrangler d1 execute eva-platform-db-${env} --file=sample-data.sql
            fi
            ;;
        "all")
            deploy_component "api" ${env}
            deploy_component "files" ${env}
            deploy_component "matching" ${env}
            deploy_component "chat" ${env}
            deploy_component "db" ${env}
            deploy_component "frontend" ${env}
            ;;
        *)
            echo -e "${RED}Unknown component: ${component}${NC}"
            echo "Available components: api, files, matching, chat, frontend, db, all"
            exit 1
            ;;
    esac
    
    echo -e "${GREEN}✅ ${component} deployed successfully${NC}"
}

# Function to run health checks
run_health_check() {
    local env=$1
    
    echo -e "${YELLOW}🏥 Running health checks for ${env}...${NC}"
    
    if [ "${env}" = "production" ]; then
        local api_url="https://api.eva-platform.com"
    else
        local api_url="https://eva-api-gateway-${env}.eva-platform.workers.dev"
    fi
    
    echo -e "${BLUE}Testing API Gateway...${NC}"
    if curl -s -f "${api_url}/api/v1/health" > /dev/null; then
        echo -e "${GREEN}✅ API Gateway is healthy${NC}"
    else
        echo -e "${YELLOW}⚠️  API Gateway not yet responding${NC}"
    fi
}

# Function to show deployment URLs
show_urls() {
    local env=$1
    
    echo -e "${BLUE}"
    echo "================================================"
    echo "🌐 Deployment URLs for ${env}"
    echo "================================================"
    echo -e "${NC}"
    
    if [ "${env}" = "production" ]; then
        echo -e "${GREEN}Production URLs:${NC}"
        echo "  • API Gateway: https://api.eva-platform.com"
        echo "  • File Service: https://files.eva-platform.com"
        echo "  • Smart Matching: https://matching.eva-platform.com"
        echo "  • FileLock Chat: https://chat.eva-platform.com"
    else
        echo -e "${GREEN}${env^} URLs:${NC}"
        echo "  • API Gateway: https://eva-api-gateway-${env}.eva-platform.workers.dev"
        echo "  • File Service: https://eva-file-access-${env}.eva-platform.workers.dev"
        echo "  • Smart Matching: https://eva-smart-matching-${env}.eva-platform.workers.dev"
        echo "  • FileLock Chat: https://eva-filelock-chat-${env}.eva-platform.workers.dev"
    fi
    
    echo ""
    echo -e "${YELLOW}Health Check:${NC}"
    if [ "${env}" = "production" ]; then
        echo "  curl https://api.eva-platform.com/api/v1/health"
    else
        echo "  curl https://eva-api-gateway-${env}.eva-platform.workers.dev/api/v1/health"
    fi
}

# Function to setup environment
setup_environment() {
    local env=$1
    
    echo -e "${YELLOW}📋 Setting up ${env} environment...${NC}"
    
    # Check if environment files exist
    if [ ! -f "env.${env}.example" ]; then
        echo -e "${RED}Environment template env.${env}.example not found${NC}"
        exit 1
    fi
    
    # Copy environment file if it doesn't exist
    if [ ! -f ".env.${env}" ]; then
        echo -e "${BLUE}Creating .env.${env} from template...${NC}"
        cp "env.${env}.example" ".env.${env}"
        echo -e "${YELLOW}Please update .env.${env} with your configuration${NC}"
    fi
    
    echo -e "${GREEN}✅ Environment setup completed${NC}"
}

# Function to validate prerequisites
validate_prerequisites() {
    echo -e "${YELLOW}📋 Validating prerequisites...${NC}"
    
    # Check wrangler
    if ! command -v wrangler &> /dev/null; then
        echo -e "${RED}❌ Wrangler CLI not found${NC}"
        echo "Install with: npm install -g wrangler"
        exit 1
    fi
    
    # Check authentication
    if ! wrangler whoami &> /dev/null; then
        echo -e "${RED}❌ Not authenticated with Cloudflare${NC}"
        echo "Run: wrangler auth login"
        exit 1
    fi
    
    # Check worker files exist
    if [ ! -d "cloudflare-workers" ]; then
        echo -e "${YELLOW}Creating worker files...${NC}"
        mkdir -p cloudflare-workers
        # Create basic worker files if they don't exist
        ./deploy-eva-platform.sh ${ENVIRONMENT} 2>/dev/null || echo -e "${YELLOW}Run full deployment script first${NC}"
    fi
    
    echo -e "${GREEN}✅ Prerequisites validated${NC}"
}

# Main execution
main() {
    echo -e "${BLUE}"
    echo "========================================="
    echo "⚡ EVA Platform Quick Deploy"
    echo "🏦 Commercial Lending Platform"
    echo "========================================="
    echo -e "${NC}"
    
    validate_prerequisites
    setup_environment ${ENVIRONMENT}
    deploy_component ${COMPONENT} ${ENVIRONMENT}
    run_health_check ${ENVIRONMENT}
    show_urls ${ENVIRONMENT}
    
    echo ""
    echo -e "${GREEN}🎉 Quick deployment completed successfully!${NC}"
}

# Show usage if no arguments
if [ $# -eq 0 ]; then
    echo -e "${BLUE}Usage: $0 <environment> [component]${NC}"
    echo ""
    echo -e "${YELLOW}Environments:${NC}"
    echo "  development  - Development environment"
    echo "  staging      - Staging environment" 
    echo "  production   - Production environment"
    echo ""
    echo -e "${YELLOW}Components:${NC}"
    echo "  api          - API Gateway Worker"
    echo "  files        - File Access Worker"
    echo "  matching     - Smart Matching Worker"
    echo "  chat         - FileLock Chat Worker"
    echo "  frontend     - React Frontend Build"
    echo "  db           - Database Schema Update"
    echo "  all          - Deploy all components (default)"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo "  $0 development          # Deploy all to development"
    echo "  $0 production api       # Deploy only API Gateway to production"
    echo "  $0 staging frontend     # Build frontend for staging"
    echo "  $0 development db       # Update development database"
    exit 0
fi

# Run main function
main "$@" 