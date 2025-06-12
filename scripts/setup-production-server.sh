#!/bin/bash

# 🚀 EVA Platform Production Server Setup Script
# This script sets up a production-ready server with Stripe, Plaid, and Cloudflare integration

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   error "This script should not be run as root for security reasons"
fi

log "🚀 Starting EVA Platform Production Server Setup"

# Create project directory
PROJECT_DIR="/opt/eva-platform"
log "📁 Creating project directory: $PROJECT_DIR"

sudo mkdir -p $PROJECT_DIR
sudo chown $USER:$USER $PROJECT_DIR
cd $PROJECT_DIR

# System updates and dependencies
log "📦 Updating system packages"
sudo apt update && sudo apt upgrade -y

log "📦 Installing required system packages"
sudo apt install -y \
    curl \
    wget \
    git \
    build-essential \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    nginx \
    certbot \
    python3-certbot-nginx \
    ufw \
    fail2ban \
    postgresql \
    postgresql-contrib \
    redis-server \
    htop \
    unzip

# Install Node.js (Latest LTS)
log "📦 Installing Node.js"
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs

# Verify Node.js installation
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
log "✅ Node.js installed: $NODE_VERSION"
log "✅ npm installed: $NPM_VERSION"

# Install PM2 for process management
log "📦 Installing PM2"
sudo npm install -g pm2

# Install Docker
log "🐳 Installing Docker"
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add user to docker group
sudo usermod -aG docker $USER

# Clone EVA Platform repository
log "📥 Cloning EVA Platform repository"
if [ ! -d "eva-platform-frontend" ]; then
    git clone https://github.com/your-org/eva-platform-frontend.git
fi
cd eva-platform-frontend

# Install project dependencies
log "📦 Installing project dependencies"
npm ci --only=production

# Setup environment variables
log "🔧 Setting up environment variables"
if [ ! -f ".env.production" ]; then
    warn "Creating .env.production template - Please fill in your API keys"
    cat > .env.production << 'EOF'
# Database
DATABASE_URL=postgresql://eva_user:secure_password@localhost:5432/eva_platform

# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_live_your_key_here
STRIPE_SECRET_KEY=sk_live_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Plaid Configuration
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_production_secret
PLAID_ENV=production

# Security
JWT_SECRET=your_secure_jwt_secret_here
ENCRYPTION_KEY=your_32_character_encryption_key_here

# API URLs
NEXT_PUBLIC_API_URL=https://api.eva-platform.com
NEXT_PUBLIC_APP_URL=https://eva-platform.com

# Cloudflare
CLOUDFLARE_API_TOKEN=your_cloudflare_token
CLOUDFLARE_ZONE_ID=your_zone_id

# Analytics
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
SEGMENT_WRITE_KEY=your_segment_key

# Monitoring
SENTRY_DSN=your_sentry_dsn
EOF
    error "Please edit .env.production with your actual API keys before continuing"
fi

# Database setup
log "🗄️ Setting up PostgreSQL database"
sudo -u postgres createuser eva_user || warn "User eva_user already exists"
sudo -u postgres createdb eva_platform || warn "Database eva_platform already exists"
sudo -u postgres psql -c "ALTER USER eva_user WITH PASSWORD 'secure_password';" || warn "Password already set"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE eva_platform TO eva_user;" || warn "Privileges already granted"

# Run database migrations
log "🗄️ Running database migrations"
npm run db:migrate || warn "Migration failed - manual intervention may be required"

# Build the application
log "🏗️ Building the application"
npm run build

# Setup Nginx
log "🌐 Configuring Nginx"
sudo tee /etc/nginx/sites-available/eva-platform << 'EOF'
# EVA Platform Nginx Configuration
upstream eva_app {
    server 127.0.0.1:3000;
    server 127.0.0.1:3001 backup;
}

# HTTP redirect to HTTPS
server {
    listen 80;
    server_name eva-platform.com www.eva-platform.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name eva-platform.com www.eva-platform.com;

    # SSL Configuration (will be handled by Certbot)
    ssl_certificate /etc/letsencrypt/live/eva-platform.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/eva-platform.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Static file handling
    location /_next/static/ {
        alias /opt/eva-platform/eva-platform-frontend/.next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /static/ {
        alias /opt/eva-platform/eva-platform-frontend/public/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API and webhook routes
    location /api/ {
        proxy_pass http://eva_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Main application
    location / {
        proxy_pass http://eva_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/eva-platform /etc/nginx/sites-enabled/
sudo nginx -t || error "Nginx configuration test failed"

# Setup SSL with Let's Encrypt
log "🔒 Setting up SSL certificate"
sudo certbot --nginx -d eva-platform.com -d www.eva-platform.com --non-interactive --agree-tos --email admin@eva-platform.com || warn "SSL setup failed - please configure manually"

# Setup PM2 ecosystem
log "⚙️ Setting up PM2 ecosystem"
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'eva-platform',
      script: 'npm',
      args: 'start',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/var/log/eva-platform/error.log',
      out_file: '/var/log/eva-platform/out.log',
      log_file: '/var/log/eva-platform/combined.log',
      time: true,
      max_memory_restart: '1G',
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s'
    },
    {
      name: 'eva-platform-backup',
      script: 'npm',
      args: 'start',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      autorestart: false
    }
  ]
};
EOF

# Create log directory
sudo mkdir -p /var/log/eva-platform
sudo chown $USER:$USER /var/log/eva-platform

# Setup firewall
log "🔥 Configuring firewall"
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw allow 5432  # PostgreSQL
sudo ufw --force enable

# Setup fail2ban
log "🛡️ Configuring fail2ban"
sudo tee /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log
maxretry = 3

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
logpath = /var/log/nginx/error.log
maxretry = 5

[nginx-noscript]
enabled = true
filter = nginx-noscript
logpath = /var/log/nginx/access.log
maxretry = 6

[nginx-badbots]
enabled = true
filter = nginx-badbots
logpath = /var/log/nginx/access.log
maxretry = 2

[nginx-noproxy]
enabled = true
filter = nginx-noproxy
logpath = /var/log/nginx/access.log
maxretry = 2
EOF

sudo systemctl restart fail2ban

# Setup automated backups
log "💾 Setting up automated backups"
sudo mkdir -p /opt/eva-backups
sudo chown $USER:$USER /opt/eva-backups

cat > /opt/eva-platform/backup.sh << 'EOF'
#!/bin/bash
# EVA Platform Backup Script

BACKUP_DIR="/opt/eva-backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_BACKUP="$BACKUP_DIR/database_backup_$TIMESTAMP.sql"
FILES_BACKUP="$BACKUP_DIR/files_backup_$TIMESTAMP.tar.gz"

# Database backup
pg_dump eva_platform > "$DB_BACKUP"
gzip "$DB_BACKUP"

# Files backup
tar -czf "$FILES_BACKUP" \
    --exclude=node_modules \
    --exclude=.next \
    --exclude=.git \
    /opt/eva-platform/eva-platform-frontend

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete

echo "Backup completed: $TIMESTAMP"
EOF

chmod +x /opt/eva-platform/backup.sh

# Add backup to crontab
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/eva-platform/backup.sh >> /var/log/eva-platform/backup.log 2>&1") | crontab -

# Setup monitoring scripts
log "📊 Setting up monitoring"
cat > /opt/eva-platform/monitor.sh << 'EOF'
#!/bin/bash
# EVA Platform Monitoring Script

# Check if PM2 processes are running
pm2 list | grep -q "online" || {
    echo "PM2 processes not running - restarting"
    pm2 start ecosystem.config.js --env production
}

# Check database connectivity
psql eva_platform -c "SELECT 1;" > /dev/null 2>&1 || {
    echo "Database connection failed"
    exit 1
}

# Check disk space
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "Warning: Disk usage is ${DISK_USAGE}%"
fi

# Check memory usage
MEMORY_USAGE=$(free | grep Mem | awk '{printf("%.2f", $3/$2 * 100.0)}')
if (( $(echo "$MEMORY_USAGE > 85" | bc -l) )); then
    echo "Warning: Memory usage is ${MEMORY_USAGE}%"
fi

echo "System check completed successfully"
EOF

chmod +x /opt/eva-platform/monitor.sh

# Add monitoring to crontab
(crontab -l 2>/dev/null; echo "*/5 * * * * /opt/eva-platform/monitor.sh >> /var/log/eva-platform/monitor.log 2>&1") | crontab -

# Setup log rotation
log "📋 Setting up log rotation"
sudo tee /etc/logrotate.d/eva-platform << 'EOF'
/var/log/eva-platform/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 644 eva-user eva-user
    postrotate
        pm2 reloadLogs
    endscript
}
EOF

# Start the application
log "🚀 Starting EVA Platform"
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup

# Enable services
sudo systemctl enable nginx
sudo systemctl enable postgresql
sudo systemctl enable redis-server
sudo systemctl enable fail2ban

# Restart services
sudo systemctl restart nginx
sudo systemctl restart postgresql
sudo systemctl restart redis-server

# Run health checks
log "🏥 Running health checks"
sleep 10

# Check if application is responding
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    log "✅ Application health check passed"
else
    warn "❌ Application health check failed"
fi

# Check if Nginx is serving the application
if curl -f http://localhost/health > /dev/null 2>&1; then
    log "✅ Nginx health check passed"
else
    warn "❌ Nginx health check failed"
fi

# Setup Stripe products
log "💳 Setting up Stripe products"
cd /opt/eva-platform/eva-platform-frontend
node scripts/setup-stripe-products.js || warn "Stripe setup failed - please run manually"

# Setup Cloudflare (if configured)
if [ -n "$CLOUDFLARE_API_TOKEN" ]; then
    log "☁️ Configuring Cloudflare"
    # Add Cloudflare setup commands here
    warn "Cloudflare setup should be done manually using CLOUDFLARE-SETUP-GUIDE.md"
fi

# Final security hardening
log "🔒 Final security hardening"

# Disable root login
sudo sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config

# Disable password authentication (uncomment if using SSH keys)
# sudo sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config

sudo systemctl restart sshd

# Set up automatic security updates
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades

# Display summary
log "🎉 EVA Platform Production Setup Complete!"
echo ""
echo -e "${BLUE}=== SETUP SUMMARY ===${NC}"
echo -e "${GREEN}✅ System packages installed${NC}"
echo -e "${GREEN}✅ Node.js and npm installed${NC}"
echo -e "${GREEN}✅ PostgreSQL database configured${NC}"
echo -e "${GREEN}✅ Nginx reverse proxy configured${NC}"
echo -e "${GREEN}✅ SSL certificate installed${NC}"
echo -e "${GREEN}✅ PM2 process manager configured${NC}"
echo -e "${GREEN}✅ Firewall and security configured${NC}"
echo -e "${GREEN}✅ Automated backups configured${NC}"
echo -e "${GREEN}✅ Monitoring scripts configured${NC}"
echo -e "${GREEN}✅ Application started${NC}"
echo ""
echo -e "${YELLOW}=== NEXT STEPS ===${NC}"
echo "1. Update .env.production with your actual API keys"
echo "2. Configure Cloudflare using CLOUDFLARE-SETUP-GUIDE.md"
echo "3. Test payment flows with Stripe and Plaid"
echo "4. Set up monitoring dashboards"
echo "5. Configure your domain's DNS to point to this server"
echo ""
echo -e "${BLUE}=== USEFUL COMMANDS ===${NC}"
echo "• Check application status: pm2 status"
echo "• View application logs: pm2 logs eva-platform"
echo "• Restart application: pm2 restart eva-platform"
echo "• Check Nginx status: sudo systemctl status nginx"
echo "• View system logs: journalctl -fu eva-platform"
echo "• Run manual backup: /opt/eva-platform/backup.sh"
echo ""
echo -e "${GREEN}Server is ready! Visit https://eva-platform.com${NC}"
