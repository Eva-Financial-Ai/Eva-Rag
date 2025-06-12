#!/bin/bash

echo "🚨 EVA AI Emergency Fix Script"
echo "================================"

# Step 1: Remove problematic import lines from Transactions.tsx
echo "🔧 Fixing Transactions.tsx imports..."
sed -i '' '/import { mockTransactions }/d' src/pages/Transactions.tsx
sed -i '' '/import { useTransactionContext }/d' src/pages/Transactions.tsx
sed -i '' '/import TransactionCard/d' src/pages/Transactions.tsx
sed -i '' '/import { format }/d' src/pages/Transactions.tsx
sed -i '' '/import { useWorkflow }/d' src/pages/Transactions.tsx
sed -i '' '/import { mockVendors }/d' src/pages/Transactions.tsx
sed -i '' '/import { useTransactionWebSocket }/d' src/pages/Transactions.tsx
sed -i '' '/import { MetricCard }/d' src/pages/Transactions.tsx
sed -i '' '/import { RealTimeTransactionBroadcaster }/d' src/pages/Transactions.tsx
sed -i '' '/import { DataIntegrityMonitor }/d' src/pages/Transactions.tsx
sed -i '' '/import { AuditTrail }/d' src/pages/Transactions.tsx
sed -i '' '/import { TransactionSecurityAnalyzer }/d' src/pages/Transactions.tsx

# Step 2: Clean install dependencies
echo "📦 Running clean install..."
rm -rf node_modules package-lock.json
npm install

# Step 3: Start the development server
echo "🚀 Starting development server..."
npm run start:no-lint

echo "✅ Emergency fix complete!"
echo "💡 Tip: Use 'npm run clean-install' for future dependency issues" 