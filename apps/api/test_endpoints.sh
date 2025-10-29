#!/bin/bash
# Manual test script for the API endpoints

BASE_URL="http://localhost:8000"

echo "=== Testing AI CV Maker API Endpoints ==="
echo ""

# Test /v1/generate
echo "1. Testing POST /v1/generate (returns both resume and cover letter):"
curl -s -X POST "$BASE_URL/v1/generate" \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{
    "candidate_text": "Senior Software Engineer with 5 years of experience in Python and FastAPI",
    "job_text": "Looking for a backend engineer with Python expertise"
  }' | python -m json.tool | head -30
echo ""

# Test /v1/generate/resume
echo "2. Testing POST /v1/generate/resume (returns only resume):"
curl -s -X POST "$BASE_URL/v1/generate/resume" \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{
    "candidate_text": "Senior Software Engineer with 5 years of experience",
    "job_text": "Backend engineer position"
  }' | python -m json.tool | head -20
echo ""

# Test /v1/generate/cover-letter
echo "3. Testing POST /v1/generate/cover-letter (returns only cover letter):"
curl -s -X POST "$BASE_URL/v1/generate/cover-letter" \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{
    "candidate_text": "Senior Software Engineer",
    "job_text": "Backend engineer"
  }' | python -m json.tool
echo ""

# Test middlewares
echo "4. Testing Request ID Middleware (check X-Request-ID header):"
curl -si -X POST "$BASE_URL/v1/generate/resume" \
  -H "Content-Type: application/json" \
  -d '{"candidate_text": "test", "job_text": "test"}' | grep -i "x-request-id"
echo ""

echo "5. Testing CORS Middleware (check Access-Control headers):"
curl -si -X POST "$BASE_URL/v1/generate/resume" \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{"candidate_text": "test", "job_text": "test"}' | grep -i "access-control"
echo ""

echo "=== All tests completed ==="
