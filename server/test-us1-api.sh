#!/bin/bash

# Test script for US1 - Model Photo Upload API

BASE_URL="http://localhost:3000"
TEST_IMAGE="/tmp/test-model.jpg"

echo "=== Testing US1: Model Photo Upload API ==="
echo ""

# Step 1: Create a test image
echo "1. Creating test image..."
# Create a simple 100x100 JPEG file
python3 - <<EOF
from PIL import Image
import io

# Create a 100x100 red image
img = Image.new('RGB', (100, 100), color='red')
img.save('$TEST_IMAGE', 'JPEG')
print("Test image created at: $TEST_IMAGE")
EOF

# Step 2: Login to get JWT token
echo ""
echo "2. Logging in to get JWT token..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}')

echo "Login response: $LOGIN_RESPONSE"

# Extract access token
ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['accessToken'])" 2>/dev/null)

if [ -z "$ACCESS_TOKEN" ]; then
  echo "❌ Failed to get access token. Please ensure you have a test user with email: test@example.com, password: password123"
  exit 1
fi

echo "✅ Got access token: ${ACCESS_TOKEN:0:20}..."

# Step 3: Upload model photo
echo ""
echo "3. Uploading model photo..."
UPLOAD_RESPONSE=$(curl -s -X POST "$BASE_URL/api/outfit-change/models/upload" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -F "file=@$TEST_IMAGE" \
  -F "width=100" \
  -F "height=100")

echo "Upload response: $UPLOAD_RESPONSE"

# Check if upload was successful
if echo "$UPLOAD_RESPONSE" | grep -q '"success":true'; then
  echo "✅ Model photo uploaded successfully!"

  # Extract model photo ID
  MODEL_ID=$(echo $UPLOAD_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['id'])" 2>/dev/null)
  echo "Model photo ID: $MODEL_ID"
else
  echo "❌ Upload failed"
  exit 1
fi

# Step 4: Get user's model photos
echo ""
echo "4. Fetching user's model photos..."
LIST_RESPONSE=$(curl -s -X GET "$BASE_URL/api/outfit-change/models" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "List response: $LIST_RESPONSE"

if echo "$LIST_RESPONSE" | grep -q '"success":true'; then
  echo "✅ Successfully retrieved model photos list!"
  TOTAL=$(echo $LIST_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['total'])" 2>/dev/null)
  echo "Total model photos: $TOTAL"
else
  echo "❌ Failed to retrieve model photos"
  exit 1
fi

echo ""
echo "=== All US1 API tests passed! ✅ ==="
