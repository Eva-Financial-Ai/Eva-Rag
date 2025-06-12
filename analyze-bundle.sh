#!/bin/bash

echo "Analyzing bundle size..."

# Build the app with stats
echo "Building the app with stats enabled..."
GENERATE_SOURCEMAP=true npm run build

# Create stats file for analysis
echo "Generating bundle stats file..."
cp build/asset-manifest.json build/stats.json

# Use source-map-explorer to analyze the main bundle
echo "Analyzing main bundle with source-map-explorer..."
npx source-map-explorer build/static/js/main.*.js --html bundle-analysis.html

echo "Bundle analysis complete. Open bundle-analysis.html in your browser to view the results." 