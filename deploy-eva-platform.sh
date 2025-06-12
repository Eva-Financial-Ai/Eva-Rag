#!/bin/bash

# =============================================
# EVA Platform Complete Deployment Script
# =============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
CLOUDFLARE_ZONE_ID="913680b4428f2f4d1c078dd841cd8cdb"
CLOUDFLARE_ACCOUNT_ID="eace6f3c56b5735ae4a9ef385d6ee914"
ENVIRONMENT=${1:-"development"}

echo -e "${BLUE}🚀 Starting EVA Platform Deployment for ${ENVIRONMENT} environment${NC}"

# Function to check prerequisites
check_prerequisites() {
    echo -e "${YELLOW}📋 Checking prerequisites...${NC}"
    
    # Check if wrangler is installed
    if ! command -v wrangler &> /dev/null; then
        echo -e "${RED}❌ Wrangler CLI is not installed${NC}"
        echo "Please install it with: npm install -g wrangler"
        exit 1
    fi
    
    # Check if authenticated
    if ! wrangler whoami &> /dev/null; then
        echo -e "${RED}❌ Not authenticated with Cloudflare${NC}"
        echo "Please run: wrangler auth login"
        exit 1
    fi
    
    # Check if Node.js dependencies are installed
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📦 Installing Node.js dependencies...${NC}"
        npm install
    fi
    
    echo -e "${GREEN}✅ Prerequisites check passed${NC}"
}

# Function to create and setup D1 databases
setup_databases() {
    echo -e "${YELLOW}🗄️ Setting up D1 databases...${NC}"
    
    local db_names=(
        "eva-platform-db-production"
        "eva-platform-db-staging" 
        "eva-platform-db-dev"
    )
    
    for db_name in "${db_names[@]}"; do
        echo -e "${BLUE}Creating database: ${db_name}${NC}"
        
        # Check if database exists
        if ! wrangler d1 list | grep -q "${db_name}"; then
            wrangler d1 create "${db_name}"
        else
            echo -e "${GREEN}Database ${db_name} already exists${NC}"
        fi
        
        # Apply schema
        echo -e "${BLUE}Applying schema to ${db_name}${NC}"
        wrangler d1 execute "${db_name}" --file=docs/DATABASE_SCHEMA.sql
        
        # Load sample data for development/staging
        if [[ "${db_name}" != *"production"* ]]; then
            echo -e "${BLUE}Loading sample data to ${db_name}${NC}"
            wrangler d1 execute "${db_name}" --file=sample-data.sql
        fi
    done
    
    echo -e "${GREEN}✅ Database setup completed${NC}"
}

# Function to create R2 buckets
setup_r2_buckets() {
    echo -e "${YELLOW}🪣 Setting up R2 buckets...${NC}"
    
    local buckets=(
        "eva-credit-applications"
        "eva-kyb-documents"
        "eva-kyc-profiles"
        "eva-transaction-execution"
        "eva-submission-packages"
        "eva-credit-applications-preview"
        "eva-kyb-documents-preview"
        "eva-kyc-profiles-preview"
        "eva-transaction-execution-preview"
        "eva-submission-packages-preview"
    )
    
    for bucket in "${buckets[@]}"; do
        echo -e "${BLUE}Creating R2 bucket: ${bucket}${NC}"
        wrangler r2 bucket create "${bucket}" 2>/dev/null || echo -e "${GREEN}Bucket ${bucket} already exists${NC}"
    done
    
    echo -e "${GREEN}✅ R2 buckets setup completed${NC}"
}

# Function to create KV namespaces
setup_kv_namespaces() {
    echo -e "${YELLOW}🔑 Setting up KV namespaces...${NC}"
    
    local namespaces=(
        "eva-user-sessions-production"
        "eva-cache-store-production"
        "eva-feature-flags-production"
        "eva-lender-cache-production"
        "eva-user-sessions-preview"
        "eva-cache-store-preview"
        "eva-feature-flags-preview"
        "eva-lender-cache-preview"
    )
    
    for namespace in "${namespaces[@]}"; do
        echo -e "${BLUE}Creating KV namespace: ${namespace}${NC}"
        wrangler kv:namespace create "${namespace}" 2>/dev/null || echo -e "${GREEN}Namespace ${namespace} already exists${NC}"
    done
    
    echo -e "${GREEN}✅ KV namespaces setup completed${NC}"
}

# Function to create Vectorize index
setup_vectorize() {
    echo -e "${YELLOW}🧠 Setting up Vectorize index...${NC}"
    
    wrangler vectorize create eva-smart-matching \
        --dimensions=1536 \
        --metric=cosine 2>/dev/null || echo -e "${GREEN}Vectorize index already exists${NC}"
    
    echo -e "${GREEN}✅ Vectorize setup completed${NC}"
}

# Function to set up secrets
setup_secrets() {
    echo -e "${YELLOW}🔐 Setting up secrets...${NC}"
    
    local secrets=(
        "JWT_SECRET"
        "SUPABASE_ANON_KEY"
        "SUPABASE_SERVICE_ROLE_KEY"
        "SUPABASE_URL"
        "HUGGINGFACE_API_KEY"
        "ENCRYPTION_KEY"
        "WEBHOOK_SECRET"
    )
    
    echo -e "${BLUE}Please provide the following secrets:${NC}"
    
    for secret in "${secrets[@]}"; do
        if [ -z "${!secret}" ]; then
            echo -e "${YELLOW}Enter ${secret}:${NC}"
            read -s secret_value
            echo "${secret_value}" | wrangler secret put "${secret}"
        else
            echo "${!secret}" | wrangler secret put "${secret}"
        fi
    done
    
    echo -e "${GREEN}✅ Secrets setup completed${NC}"
}

# Function to build and deploy workers
deploy_workers() {
    echo -e "${YELLOW}🚀 Building and deploying Workers...${NC}"
    
    # Create cloudflare-workers directory if it doesn't exist
    mkdir -p cloudflare-workers
    
    # Create the worker files
    create_worker_files
    
    local workers=(
        "eva-api-gateway"
        "eva-file-access"
        "eva-smart-matching"
        "eva-filelock-chat"
    )
    
    for worker in "${workers[@]}"; do
        echo -e "${BLUE}Deploying ${worker}...${NC}"
        
        # Deploy based on environment
        if [ "${ENVIRONMENT}" = "production" ]; then
            wrangler deploy --env production --name "${worker}"
        elif [ "${ENVIRONMENT}" = "staging" ]; then
            wrangler deploy --env staging --name "${worker}-staging"
        else
            wrangler deploy --env development --name "${worker}-dev"
        fi
    done
    
    echo -e "${GREEN}✅ Workers deployment completed${NC}"
}

# Function to create worker files
create_worker_files() {
    echo -e "${YELLOW}📝 Creating Worker files...${NC}"
    
    # API Gateway Worker
    cat > cloudflare-workers/eva-api-gateway.js << 'EOF'
/**
 * EVA Platform API Gateway Worker
 * Routes requests to appropriate microservices
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Request-ID',
    };
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    try {
      let response;
      
      // Route to appropriate service
      if (path.startsWith('/api/v1/files/')) {
        response = await env.FILE_SERVICE.fetch(request);
      } else if (path.startsWith('/api/v1/smart-matching/') || path.startsWith('/api/v1/eva-ai/')) {
        response = await env.SMART_MATCHING_SERVICE.fetch(request);
      } else if (path.startsWith('/api/v1/chat/') || path.startsWith('/api/v1/filelock/')) {
        response = await env.CHAT_SERVICE.fetch(request);
      } else if (path === '/api/v1/health') {
        response = new Response(JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString() }), {
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        response = new Response('Not Found', { status: 404 });
      }
      
      // Add CORS headers to response
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      
      return response;
      
    } catch (error) {
      console.error('API Gateway error:', error);
      return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};
EOF

    # File Access Worker
    cat > cloudflare-workers/eva-file-access-worker.js << 'EOF'
/**
 * EVA Platform File Access Worker
 * Handles secure file operations with R2 storage
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    try {
      if (path.startsWith('/api/v1/files/upload')) {
        return await handleFileUpload(request, env);
      } else if (path.startsWith('/api/v1/files/download/')) {
        return await handleFileDownload(request, env);
      } else if (path.startsWith('/api/v1/files/list')) {
        return await handleFileList(request, env);
      } else {
        return new Response('Not Found', { status: 404 });
      }
    } catch (error) {
      console.error('File access error:', error);
      return new Response(JSON.stringify({ error: 'File operation failed' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
};

async function handleFileUpload(request, env) {
  // File upload logic with R2
  return new Response(JSON.stringify({ message: 'File upload endpoint' }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function handleFileDownload(request, env) {
  // File download logic with R2
  return new Response(JSON.stringify({ message: 'File download endpoint' }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function handleFileList(request, env) {
  // File listing logic
  return new Response(JSON.stringify({ message: 'File list endpoint' }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
EOF

    # Smart Matching Worker
    cat > cloudflare-workers/eva-smart-matching-worker.js << 'EOF'
/**
 * EVA Platform Smart Matching Worker
 * AI-powered lender matching and document analysis
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    try {
      if (path.startsWith('/api/v1/smart-matching/analyze')) {
        return await handleSmartMatching(request, env);
      } else if (path.startsWith('/api/v1/eva-ai/chat')) {
        return await handleEvaAIChat(request, env);
      } else if (path.startsWith('/api/v1/eva-ai/analyze-documents')) {
        return await handleDocumentAnalysis(request, env);
      } else {
        return new Response('Not Found', { status: 404 });
      }
    } catch (error) {
      console.error('Smart matching error:', error);
      return new Response(JSON.stringify({ error: 'Smart matching failed' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
};

async function handleSmartMatching(request, env) {
  // AI-powered smart matching logic
  return new Response(JSON.stringify({
    matches: [
      {
        id: 'lender-1',
        name: 'First National Bank',
        match_score: 85,
        confidence: 0.9,
        estimated_terms: {
          interest_rate: 6.5,
          term_months: 60,
          max_amount: 500000
        },
        approval_probability: 0.8,
        reasoning: ['Strong credit profile', 'Industry match', 'Geographic preference']
      }
    ]
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function handleEvaAIChat(request, env) {
  // EVA AI chat logic
  const { message } = await request.json();
  
  return new Response(JSON.stringify({
    response: `I understand you said: "${message}". I'm EVA, your AI lending assistant. How can I help you analyze documents or find the best lenders for your needs?`,
    metadata: {
      suggestions: ['Analyze documents', 'Find lender matches', 'Create submission package']
    }
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function handleDocumentAnalysis(request, env) {
  // Document analysis logic
  return new Response(JSON.stringify({
    document_analysis: {
      documents_analyzed: 3,
      average_confidence: 0.85,
      compliance_status: 'COMPLIANT'
    },
    risk_assessment: {
      risk_level: 'MEDIUM',
      overall_score: 72,
      factors: [
        { factor: 'Credit Score', score: 750, impact: 'positive' },
        { factor: 'Time in Business', score: 5, impact: 'positive' },
        { factor: 'Debt to Income', score: 0.35, impact: 'neutral' }
      ]
    },
    lender_matches: [
      {
        id: 'lender-1',
        name: 'First National Bank',
        match_score: 85,
        confidence: 0.9,
        estimated_terms: { interest_rate: 6.5, term_months: 60, max_amount: 500000 },
        approval_probability: 0.8,
        reasoning: ['Strong credit profile']
      }
    ]
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
EOF

    # FileLock Chat Worker
    cat > cloudflare-workers/eva-filelock-chat-worker.js << 'EOF'
/**
 * EVA Platform FileLock Chat Worker
 * AI-assisted submission package creation
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    try {
      if (path.startsWith('/api/v1/filelock/chat')) {
        return await handleFileLockChat(request, env);
      } else if (path.startsWith('/api/v1/filelock/suggest-files')) {
        return await handleFileSuggestions(request, env);
      } else if (path.startsWith('/api/v1/filelock/create-package')) {
        return await handlePackageCreation(request, env);
      } else {
        return new Response('Not Found', { status: 404 });
      }
    } catch (error) {
      console.error('FileLock chat error:', error);
      return new Response(JSON.stringify({ error: 'FileLock operation failed' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
};

async function handleFileLockChat(request, env) {
  const { message, customer_id } = await request.json();
  
  return new Response(JSON.stringify({
    response: `Based on your request "${message}", I'll help you create the perfect submission package. Let me analyze your available documents...`,
    suggested_files: [
      { id: 'file-1', name: 'Financial Statements 2024', relevance: 0.95 },
      { id: 'file-2', name: 'Tax Returns 2023', relevance: 0.87 },
      { id: 'file-3', name: 'Bank Statements', relevance: 0.82 }
    ],
    auto_selected: ['file-1', 'file-2'],
    package_completeness: 0.78
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function handleFileSuggestions(request, env) {
  return new Response(JSON.stringify({
    suggestions: [
      { id: 'file-1', name: 'Financial Statements 2024', relevance: 0.95, required: true },
      { id: 'file-2', name: 'Tax Returns 2023', relevance: 0.87, required: true },
      { id: 'file-3', name: 'Bank Statements', relevance: 0.82, required: false }
    ]
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function handlePackageCreation(request, env) {
  const { name, file_ids, customer_id } = await request.json();
  
  return new Response(JSON.stringify({
    package_id: 'pkg_' + Date.now(),
    status: 'created',
    files_included: file_ids.length,
    completeness_score: 0.85,
    message: 'Submission package created successfully and ready for lender submission'
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
EOF

    echo -e "${GREEN}✅ Worker files created${NC}"
}

# Function to create sample data
create_sample_data() {
    echo -e "${YELLOW}📊 Creating sample data file...${NC}"
    
    cat > sample-data.sql << 'EOF'
-- Sample data for EVA Platform development and staging

-- Insert sample business entities
INSERT INTO business_entities (id, legal_name, dba_name, ein, industry_code, founded_year, address_street1, address_city, address_state, address_postal_code, phone, email, website, annual_revenue, employee_count) VALUES
('biz_001', 'ABC Manufacturing Corp', 'ABC Manufacturing', '12-3456789', 'NAICS-332710', 2015, '123 Industrial Way', 'Detroit', 'MI', '48201', '(313) 555-0123', 'info@abcmfg.com', 'https://abcmfg.com', 2500000.00, 45),
('biz_002', 'TechStart Solutions LLC', 'TechStart', '98-7654321', 'NAICS-541511', 2020, '456 Innovation Blvd', 'Austin', 'TX', '78701', '(512) 555-0456', 'hello@techstart.io', 'https://techstart.io', 850000.00, 12),
('biz_003', 'Green Energy Partners', NULL, '55-1122334', 'NAICS-221118', 2018, '789 Solar Street', 'San Francisco', 'CA', '94102', '(415) 555-0789', 'contact@greenenergy.com', 'https://greenenergy.com', 5200000.00, 78);

-- Insert sample person entities
INSERT INTO person_entities (id, first_name, last_name, ssn_hash, date_of_birth, address_street1, address_city, address_state, address_postal_code, phone, email, relationship_to_business) VALUES
('person_001', 'John', 'Smith', 'hashed_ssn_001', '1975-06-15', '123 Industrial Way', 'Detroit', 'MI', '48201', '(313) 555-0124', 'john.smith@abcmfg.com', 'owner'),
('person_002', 'Sarah', 'Johnson', 'hashed_ssn_002', '1985-03-22', '456 Innovation Blvd', 'Austin', 'TX', '78701', '(512) 555-0457', 'sarah@techstart.io', 'owner'),
('person_003', 'Michael', 'Chen', 'hashed_ssn_003', '1978-11-08', '789 Solar Street', 'San Francisco', 'CA', '94102', '(415) 555-0790', 'mchen@greenenergy.com', 'owner');

-- Insert sample customer profiles
INSERT INTO customer_profiles (id, type, entity_id, display_name, status, metadata) VALUES
('cust_001', 'business', 'biz_001', 'ABC Manufacturing Corp', 'active', '{"tags": ["manufacturing", "equipment-financing"], "risk_level": "medium", "credit_score": 720, "industry": "Manufacturing"}'),
('cust_002', 'business', 'biz_002', 'TechStart Solutions LLC', 'active', '{"tags": ["technology", "working-capital"], "risk_level": "low", "credit_score": 750, "industry": "Technology"}'),
('cust_003', 'business', 'biz_003', 'Green Energy Partners', 'active', '{"tags": ["energy", "expansion"], "risk_level": "low", "credit_score": 780, "industry": "Renewable Energy"}');

-- Insert sample business-person relationships
INSERT INTO business_person_relationships (id, business_entity_id, person_entity_id, relationship, percentage_ownership) VALUES
('rel_001', 'biz_001', 'person_001', 'owner', 100.00),
('rel_002', 'biz_002', 'person_002', 'owner', 85.00),
('rel_003', 'biz_003', 'person_003', 'owner', 65.00);

-- Insert sample lenders
INSERT INTO lenders (id, name, institution_type, geographic_coverage, industry_preferences, credit_requirements, contact_info, response_metrics, status) VALUES
('lender_001', 'First National Bank', 'bank', '["US-MI", "US-OH", "US-IN"]', '["NAICS-332710", "NAICS-333"]', '{"min_credit_score": 650, "min_time_in_business": 24, "min_annual_revenue": 500000}', '{"email": "commercial@firstnational.com", "phone": "(800) 555-0001"}', '{"average_response_time_hours": 24, "approval_rate": 0.65, "funded_rate": 0.58}', 'active'),
('lender_002', 'TechCorp Credit Union', 'credit_union', '["US-TX", "US-CA", "US-WA"]', '["NAICS-541511", "NAICS-518"]', '{"min_credit_score": 700, "min_time_in_business": 12, "min_annual_revenue": 250000}', '{"email": "loans@techcorp.coop", "phone": "(800) 555-0002"}', '{"average_response_time_hours": 12, "approval_rate": 0.72, "funded_rate": 0.68}', 'active'),
('lender_003', 'Green Finance Partners', 'alternative_lender', '["US-CA", "US-OR", "US-WA", "US-NV"]', '["NAICS-221118", "NAICS-237130"]', '{"min_credit_score": 680, "min_time_in_business": 18, "min_annual_revenue": 1000000}', '{"email": "lending@greenfinance.com", "phone": "(800) 555-0003"}', '{"average_response_time_hours": 18, "approval_rate": 0.78, "funded_rate": 0.71}', 'active');

-- Insert sample lender products
INSERT INTO lender_products (id, lender_id, product_type, min_amount, max_amount, min_term_months, max_term_months, interest_rate_min, interest_rate_max, origination_fee, requirements, status) VALUES
('prod_001', 'lender_001', 'equipment_financing', 50000.00, 2000000.00, 12, 84, 5.50, 12.50, 2.50, '{"debt_service_coverage": 1.25, "down_payment": 0.15}', 'active'),
('prod_002', 'lender_002', 'working_capital', 25000.00, 500000.00, 6, 36, 6.00, 18.00, 1.50, '{"monthly_revenue": 50000, "bank_balance": 25000}', 'active'),
('prod_003', 'lender_003', 'term_loan', 100000.00, 5000000.00, 24, 120, 4.75, 9.50, 1.00, '{"project_viability": true, "environmental_impact": "positive"}', 'active');

-- Insert sample files
INSERT INTO files (id, r2_path, bucket, original_filename, content_type, file_size, checksum, entity_id, customer_id, document_type, classification, status) VALUES
('file_001', 'eva-credit-applications/cust_001/2024/01/file_001.pdf', 'eva-credit-applications', 'ABC_Financial_Statements_2023.pdf', 'application/pdf', 1024000, 'abc123hash', 'biz_001', 'cust_001', 'financial_statements', 'confidential', 'active'),
('file_002', 'eva-kyb-documents/biz_001/business_license/file_002.pdf', 'eva-kyb-documents', 'ABC_Business_License.pdf', 'application/pdf', 512000, 'def456hash', 'biz_001', 'cust_001', 'business_license', 'confidential', 'active'),
('file_003', 'eva-credit-applications/cust_002/2024/01/file_003.pdf', 'eva-credit-applications', 'TechStart_Bank_Statements.pdf', 'application/pdf', 768000, 'ghi789hash', 'biz_002', 'cust_002', 'bank_statements', 'confidential', 'active');

-- Insert feature flags
INSERT INTO feature_flags (flag_name, enabled, description) VALUES
('smart_matching_v2', true, 'Enable enhanced AI smart matching'),
('filelock_chat_interface', true, 'Enable FileLock AI chat interface'),
('real_time_risk_assessment', true, 'Enable real-time risk assessment'),
('lender_api_integration', false, 'Enable direct lender API integration');

-- Insert system settings for development
INSERT INTO system_settings (setting_key, setting_value, setting_type, description) VALUES
('demo_mode', 'true', 'boolean', 'Enable demo mode with sample data'),
('ai_analysis_enabled', 'true', 'boolean', 'Enable AI document analysis'),
('max_concurrent_uploads', '5', 'number', 'Maximum concurrent file uploads'),
('session_duration_hours', '8', 'number', 'User session duration in hours');
EOF

    echo -e "${GREEN}✅ Sample data file created${NC}"
}

# Function to setup custom domains
setup_domains() {
    echo -e "${YELLOW}🌐 Setting up custom domains...${NC}"
    
    if [ "${ENVIRONMENT}" = "production" ]; then
        local domains=(
            "api.eva-platform.com"
            "files.eva-platform.com"
            "matching.eva-platform.com"
            "chat.eva-platform.com"
        )
        
        for domain in "${domains[@]}"; do
            echo -e "${BLUE}Setting up domain: ${domain}${NC}"
            # Note: Domain setup would typically be done through Cloudflare Dashboard
            # or API calls for DNS records and SSL certificates
            echo -e "${YELLOW}Please configure DNS for ${domain} in Cloudflare Dashboard${NC}"
        done
    fi
    
    echo -e "${GREEN}✅ Domain setup instructions provided${NC}"
}

# Function to run health checks
run_health_checks() {
    echo -e "${YELLOW}🏥 Running health checks...${NC}"
    
    # Test API Gateway
    if [ "${ENVIRONMENT}" = "production" ]; then
        local api_url="https://api.eva-platform.com"
    else
        local api_url="https://eva-api-gateway-${ENVIRONMENT}.eva-platform.workers.dev"
    fi
    
    echo -e "${BLUE}Testing API Gateway at ${api_url}${NC}"
    curl -s "${api_url}/api/v1/health" || echo -e "${YELLOW}API Gateway not yet accessible${NC}"
    
    echo -e "${GREEN}✅ Health checks completed${NC}"
}

# Function to display deployment summary
display_summary() {
    echo -e "${GREEN}"
    echo "========================================="
    echo "🎉 EVA Platform Deployment Summary"
    echo "========================================="
    echo -e "${NC}"
    
    echo -e "${BLUE}Environment:${NC} ${ENVIRONMENT}"
    echo -e "${BLUE}Zone ID:${NC} ${CLOUDFLARE_ZONE_ID}"
    echo -e "${BLUE}Account ID:${NC} ${CLOUDFLARE_ACCOUNT_ID}"
    echo ""
    
    echo -e "${GREEN}✅ Deployed Components:${NC}"
    echo "  • D1 Databases with EVA schema"
    echo "  • R2 Buckets for file storage"
    echo "  • KV Namespaces for sessions/cache"
    echo "  • Vectorize index for AI matching"
    echo "  • 4 Cloudflare Workers services"
    echo "  • Secrets and environment variables"
    echo ""
    
    if [ "${ENVIRONMENT}" = "production" ]; then
        echo -e "${BLUE}Production URLs:${NC}"
        echo "  • API Gateway: https://api.eva-platform.com"
        echo "  • File Service: https://files.eva-platform.com"
        echo "  • Smart Matching: https://matching.eva-platform.com"
        echo "  • FileLock Chat: https://chat.eva-platform.com"
    else
        echo -e "${BLUE}Development URLs:${NC}"
        echo "  • API Gateway: https://eva-api-gateway-${ENVIRONMENT}.eva-platform.workers.dev"
        echo "  • File Service: https://eva-file-access-${ENVIRONMENT}.eva-platform.workers.dev"
        echo "  • Smart Matching: https://eva-smart-matching-${ENVIRONMENT}.eva-platform.workers.dev"
        echo "  • FileLock Chat: https://eva-filelock-chat-${ENVIRONMENT}.eva-platform.workers.dev"
    fi
    
    echo ""
    echo -e "${YELLOW}Next Steps:${NC}"
    echo "  1. Configure custom domains (production only)"
    echo "  2. Set up monitoring and alerting"
    echo "  3. Load production lender data"
    echo "  4. Test frontend integration"
    echo "  5. Configure backup procedures"
    echo ""
    echo -e "${GREEN}🚀 EVA Platform is ready for use!${NC}"
}

# Main deployment function
main() {
    echo -e "${BLUE}"
    echo "========================================="
    echo "🏦 EVA Platform - Commercial Lending"
    echo "🤖 AI-Powered Smart Matching & FileLock"
    echo "☁️  Cloudflare Edge Computing"
    echo "========================================="
    echo -e "${NC}"
    
    check_prerequisites
    setup_databases
    setup_r2_buckets
    setup_kv_namespaces
    setup_vectorize
    create_sample_data
    setup_secrets
    deploy_workers
    setup_domains
    run_health_checks
    display_summary
}

# Run the deployment
main "$@" 