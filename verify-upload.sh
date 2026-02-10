#!/bin/bash

# 1. Login as Admin
echo "Logging in as Admin..."
ADMIN_TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@rathinam.in", "password": "password123"}' \
  | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$ADMIN_TOKEN" ]; then
  echo "Failed to get admin token"
  exit 1
fi

echo "Admin Token received."

# 2. Upload CSV
echo "Uploading students.csv..."
curl -X POST http://localhost:3000/students/upload \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -F "file=@students.csv"

echo -e "\n\nUpload completed. Fetching students..."

# 3. List Students
curl -s -X GET http://localhost:3000/students \
  -H "Authorization: Bearer $ADMIN_TOKEN"
