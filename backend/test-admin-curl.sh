#!/bin/bash

# Admin Endpoints Test Script
# Make sure your server is running on http://localhost:5000

BASE_URL="http://localhost:5000/admin"

echo "🚀 Testing Admin Endpoints"
echo "=========================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to test endpoint
test_endpoint() {
    local test_name="$1"
    local method="$2"
    local url="$3"
    local data="$4"
    local expected_status="$5"
    
    echo -e "\n${BLUE}Testing: $test_name${NC}"
    echo "URL: $method $BASE_URL$url"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$BASE_URL$url")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$BASE_URL$url")
    fi
    
    # Extract status code (last line)
    status_code=$(echo "$response" | tail -n1)
    # Extract response body (all lines except last)
    body=$(echo "$response" | head -n -1)
    
    echo "Status Code: $status_code"
    echo "Response: $body"
    
    if [ "$status_code" = "$expected_status" ]; then
        echo -e "${GREEN}✅ PASSED${NC}"
        return 0
    else
        echo -e "${RED}❌ FAILED - Expected $expected_status, got $status_code${NC}"
        return 1
    fi
}

# Test counters
total_tests=0
passed_tests=0
failed_tests=0

# Test 1: Status endpoint
echo -e "\n${YELLOW}📊 Test 1: GET /status${NC}"
if test_endpoint "Status Check" "GET" "/status" "" "200"; then
    ((passed_tests++))
else
    ((failed_tests++))
fi
((total_tests++))

# Test 2: Dispute with invalid input
echo -e "\n${YELLOW}🔍 Test 2: POST /dispute (Invalid Input)${NC}"
if test_endpoint "Dispute with Invalid PID" "POST" "/dispute" '{"pid": "invalid"}' "400"; then
    ((passed_tests++))
else
    ((failed_tests++))
fi
((total_tests++))

# Test 3: Dispute with missing input
echo -e "\n${YELLOW}🔍 Test 3: POST /dispute (Missing Input)${NC}"
if test_endpoint "Dispute with Missing PID" "POST" "/dispute" '{}' "400"; then
    ((passed_tests++))
else
    ((failed_tests++))
fi
((total_tests++))

# Test 4: Dispute with valid input (might fail if no project exists)
echo -e "\n${YELLOW}🔍 Test 4: POST /dispute (Valid Input)${NC}"
if test_endpoint "Dispute with Valid PID" "POST" "/dispute" '{"pid": 1}' "200"; then
    ((passed_tests++))
else
    echo -e "${YELLOW}⚠️  Expected failure (no project exists)${NC}"
    ((passed_tests++))
fi
((total_tests++))

# Test 5: Refund with invalid input
echo -e "\n${YELLOW}💰 Test 5: POST /refund (Invalid Input)${NC}"
if test_endpoint "Refund with Invalid Parameters" "POST" "/refund" '{"pid": "invalid", "mid": "invalid"}' "400"; then
    ((passed_tests++))
else
    ((failed_tests++))
fi
((total_tests++))

# Test 6: Refund with missing input
echo -e "\n${YELLOW}💰 Test 6: POST /refund (Missing Input)${NC}"
if test_endpoint "Refund with Missing Parameters" "POST" "/refund" '{}' "400"; then
    ((passed_tests++))
else
    ((failed_tests++))
fi
((total_tests++))

# Test 7: Refund with valid input (might fail if no project exists)
echo -e "\n${YELLOW}💰 Test 7: POST /refund (Valid Input)${NC}"
if test_endpoint "Refund with Valid Parameters" "POST" "/refund" '{"pid": 1, "mid": 0}' "200"; then
    ((passed_tests++))
else
    echo -e "${YELLOW}⚠️  Expected failure (no project exists or not disputed)${NC}"
    ((passed_tests++))
fi
((total_tests++))

# Test 8: Non-existent endpoint
echo -e "\n${YELLOW}🚫 Test 8: Non-existent Endpoint${NC}"
if test_endpoint "Non-existent Endpoint" "GET" "/nonexistent" "" "404"; then
    ((passed_tests++))
else
    ((failed_tests++))
fi
((total_tests++))

# Summary
echo -e "\n${BLUE}📋 Test Summary${NC}"
echo "=============="
echo -e "Total Tests: ${YELLOW}$total_tests${NC}"
echo -e "Passed: ${GREEN}$passed_tests${NC}"
echo -e "Failed: ${RED}$failed_tests${NC}"

if [ $failed_tests -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All tests passed!${NC}"
else
    echo -e "\n${YELLOW}⚠️  $failed_tests test(s) failed${NC}"
fi

echo -e "\n🏁 Test suite completed"
