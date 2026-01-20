#!/bin/bash

# Emergency Access Protocol - Quick Test Script
# This script runs all tests to verify the emergency access feature

echo "🚨 Emergency Access Protocol - Quick Test"
echo "=========================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -d "blockchain" ] || [ ! -d "frontend" ]; then
    echo -e "${RED}❌ Error: Must run from project root directory${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Step 1: Checking if blockchain node is running...${NC}"
if lsof -i :8545 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Blockchain node is running on port 8545${NC}"
else
    echo -e "${RED}❌ Blockchain node is not running${NC}"
    echo -e "${YELLOW}Please run: cd blockchain && npx hardhat node${NC}"
    exit 1
fi
echo ""

echo -e "${YELLOW}📋 Step 2: Checking contract deployment...${NC}"
if [ -f "blockchain/deployments/localhost.json" ]; then
    echo -e "${GREEN}✅ Contracts are deployed${NC}"
    echo -e "Deployment file: blockchain/deployments/localhost.json"
else
    echo -e "${RED}❌ Contracts not deployed${NC}"
    echo -e "${YELLOW}Please run: cd blockchain && npx hardhat run scripts/deploy.js --network localhost${NC}"
    exit 1
fi
echo ""

echo -e "${YELLOW}📋 Step 3: Running emergency access test...${NC}"
cd blockchain
npx hardhat run scripts/testEmergencyAccess.js --network localhost
TEST_RESULT=$?
cd ..

if [ $TEST_RESULT -eq 0 ]; then
    echo ""
    echo -e "${GREEN}=========================================="
    echo -e "✅ Emergency Access Test Passed!"
    echo -e "==========================================${NC}"
    echo ""
    echo -e "${GREEN}🎉 The Emergency Access Protocol is working correctly!${NC}"
    echo ""
    echo -e "${YELLOW}Next Steps:${NC}"
    echo "1. Start the frontend: cd frontend && npm run dev"
    echo "2. Navigate to /doctor/emergency in your browser"
    echo "3. Test the emergency access UI"
    echo ""
    echo -e "${YELLOW}📚 For detailed documentation, see:${NC}"
    echo "- EMERGENCY_ACCESS_IMPLEMENTATION.md"
    echo "- mds/EMERGENCY_ACCESS_GUIDE.md"
    echo ""
else
    echo ""
    echo -e "${RED}=========================================="
    echo -e "❌ Emergency Access Test Failed"
    echo -e "==========================================${NC}"
    echo ""
    echo -e "${YELLOW}Troubleshooting:${NC}"
    echo "1. Ensure blockchain node is running"
    echo "2. Ensure contracts are deployed"
    echo "3. Check the error messages above"
    echo "4. Try registering test entities: npx hardhat run scripts/registerTestEntities.js --network localhost"
    echo ""
    exit 1
fi
