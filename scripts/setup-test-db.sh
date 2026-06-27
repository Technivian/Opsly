#!/bin/bash

# Test Database Setup Script
# Creates a separate PostgreSQL database for automated testing

set -e

DB_USER=${DB_USER:-"haroonwahed"}
TEST_DB_NAME=${TEST_DB_NAME:-"opsly_test"}
DATABASE_URL="postgresql://${DB_USER}@localhost:5432/${TEST_DB_NAME}"

echo "🧪 Setting up test database: ${TEST_DB_NAME}"

# Check if PostgreSQL is running
if ! pg_isready -q; then
  echo "❌ PostgreSQL is not running. Please start PostgreSQL and try again."
  exit 1
fi

# Drop test database if exists
echo "Dropping existing test database (if any)..."
dropdb --if-exists "${TEST_DB_NAME}" 2>/dev/null || true

# Create test database
echo "Creating test database..."
createdb "${TEST_DB_NAME}"

# Set environment variable for Drizzle
export DATABASE_URL="${DATABASE_URL}"

# Push schema to test database
echo "Pushing schema to test database..."
npm run db:push

echo "✅ Test database ready: ${DATABASE_URL}"
echo ""
echo "To run tests:"
echo "  TEST_DATABASE_URL=${DATABASE_URL} npm test"
