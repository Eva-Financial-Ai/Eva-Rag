#!/bin/bash

echo "🚀 Starting EVA AI Filelock Development Environment"
echo "=================================================="

# Kill any existing processes
echo "🧹 Cleaning up existing processes..."
pkill -f "wrangler dev" 2>/dev/null || true
pkill -f "npm start" 2>/dev/null || true
pkill -f "react-scripts" 2>/dev/null || true
sleep 2

# Start Cloudflare Worker
echo "🔧 Starting Cloudflare Worker on port 54135..."
npx wrangler dev --local --experimental-vectorize-bind-to-prod --port 54135 &
WORKER_PID=$!

# Wait for Worker to start
echo "⏳ Waiting for Worker to start..."
sleep 8

# Test Worker health
echo "🏥 Testing Worker health..."
if curl -s http://localhost:54135/api/health > /dev/null; then
    echo "✅ Worker is healthy!"
else
    echo "❌ Worker failed to start properly"
    kill $WORKER_PID 2>/dev/null || true
    exit 1
fi

# Start React dev server
echo "⚛️  Starting React development server..."
npm start &
REACT_PID=$!

# Wait for React to start
echo "⏳ Waiting for React to start..."
sleep 10

# Test React proxy
echo "🔗 Testing React proxy..."
if curl -s http://localhost:3000/api/health > /dev/null; then
    echo "✅ React proxy is working!"
else
    echo "❌ React proxy failed"
    kill $WORKER_PID $REACT_PID 2>/dev/null || true
    exit 1
fi

echo ""
echo "🎉 SUCCESS! Both services are running:"
echo "   📄 React App: http://localhost:3000"
echo "   🔧 Worker API: http://localhost:54135"
echo ""
echo "📋 To test file upload:"
echo "   curl -X POST http://localhost:3000/api/documents/upload -F \"file=@package.json\" -F \"transactionId=test\""
echo ""
echo "🛑 To stop all services:"
echo "   pkill -f \"wrangler dev\" && pkill -f \"npm start\""
echo ""

# Keep script running
echo "💡 Press Ctrl+C to stop all services..."
trap 'echo "🛑 Stopping services..."; kill $WORKER_PID $REACT_PID 2>/dev/null || true; exit 0' INT
wait 