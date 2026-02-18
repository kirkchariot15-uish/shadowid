#!/bin/bash

# ShadowID Contract Deployment Script
# Deploys the shadowid.aleo contract to Aleo testnet

set -e

echo "=================================================="
echo "  ShadowID Contract Deployment to Aleo Testnet"
echo "=================================================="
echo ""

# Check if Leo is installed
if ! command -v leo &> /dev/null; then
    echo "❌ Leo is not installed. Please install from: https://developer.aleo.org/leo/installation"
    exit 1
fi

echo "✓ Leo CLI detected"
echo ""

# Navigate to contracts directory
cd contracts

echo "📦 Building contract..."
leo build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✓ Build successful"
echo ""

# Deploy to testnet
echo "🚀 Deploying to Aleo testnet..."
echo "   Program: shadowid.aleo"
echo ""

# NOTE: Requires Aleo wallet with testnet credits
# Get testnet credits from: https://faucet.aleo.org

leo deploy --network testnet

if [ $? -eq 0 ]; then
    echo ""
    echo "=================================================="
    echo "  ✓ Deployment Successful!"
    echo "=================================================="
    echo ""
    echo "Contract deployed: shadowid.aleo"
    echo "Network: Aleo Testnet"
    echo ""
    echo "Next steps:"
    echo "1. Note your program ID from the output above"
    echo "2. Update NEXT_PUBLIC_ALEO_PROGRAM_ID in .env.local"
    echo "3. Verify deployment on Aleo Explorer"
    echo ""
else
    echo ""
    echo "❌ Deployment failed"
    echo ""
    echo "Common issues:"
    echo "- Insufficient testnet credits (get from https://faucet.aleo.org)"
    echo "- Network connectivity issues"
    echo "- Invalid wallet configuration"
    exit 1
fi
