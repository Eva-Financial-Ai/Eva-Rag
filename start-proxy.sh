#!/bin/bash

echo "🚀 Eva Platform Proxy Starter"
echo "============================"
echo ""
echo "Select proxy type:"
echo "1) Development Proxy (Integrated with React)"
echo "2) Nginx Reverse Proxy (Docker)"
echo "3) Node.js Proxy Server"
echo "4) Exit"
echo ""
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo "✅ Development proxy is already configured in src/setupProxy.js"
        echo "Just restart your React development server:"
        echo ""
        echo "  npm start"
        echo ""
        echo "The proxy will automatically handle:"
        echo "  - /api/* → localhost:5000"
        echo "  - /app1/* → localhost:3000"
        echo "  - /auth/* → localhost:8080"
        ;;
    2)
        echo "🐳 Starting Nginx reverse proxy..."
        if ! command -v docker &> /dev/null; then
            echo "❌ Docker is not installed. Please install Docker Desktop first."
            echo "Visit: https://www.docker.com/products/docker-desktop"
            exit 1
        fi
        docker-compose -f docker-compose.proxy.yml up -d
        echo "✅ Nginx proxy started on http://localhost"
        echo ""
        echo "Routes:"
        echo "  - / → Eva Platform (port 3006)"
        echo "  - /app2/ → Other app (port 3000)"
        echo "  - /api/ → Backend API (port 5000)"
        echo ""
        echo "To stop: docker-compose -f docker-compose.proxy.yml down"
        ;;
    3)
        echo "🟢 Starting Node.js proxy server..."
        if [ ! -f "node_modules/express/package.json" ]; then
            echo "Installing required dependencies..."
            npm install express http-proxy-middleware
        fi
        echo ""
        echo "Starting proxy on port 8080..."
        node proxy-server.js
        ;;
    4)
        echo "👋 Exiting..."
        exit 0
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac
