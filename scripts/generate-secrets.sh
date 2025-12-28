#!/bin/bash

# Legion Secret Generation Script
# Generates cryptographically secure secrets

set -e

echo "LEGION SECRET GENERATOR"
echo ""

# Check if openssl is available
if ! command -v openssl &>/dev/null; then
  echo "Error: openssl is not installed"
  echo "   Install it first: sudo apt install openssl (Linux) or brew install openssl (Mac)"
  echo "   Yeah Sorry Windows Users you'll have to figure out how to get yours"
  exit 1
fi

# Generate JWT Secret (256 bits = 32 bytes = 64 hex chars)
echo "Generating JWT secret (HS256 compatible)..."
JWT_SECRET=$(openssl rand -hex 32)

# Generate Database Password (24 chars, alphanumeric)
echo "Generating database password..."
DB_PASSWORD=$(openssl rand -base64 24 | tr -d "=+/" | cut -c1-24)

# Display results
echo ""
echo "Done Generatin Secrets"
echo ""
echo "Copy these values to your .env file:"
echo ""
echo "LEGION_JWT_SECRET=$JWT_SECRET"
echo "SPRING_DATASOURCE_PASSWORD=$DB_PASSWORD"
echo "POSTGRES_PASSWORD=$DB_PASSWORD"
echo ""
echo "SECURITY WARNINGS:"
echo "If by I don't know how someone ever gets to use this"
echo ""
echo "   1. DO NOT commit these secrets to Git"
echo "   2. DO NOT share these secrets publicly"
echo "   3. Use different secrets for dev/staging/production"
echo "   4. Rotate secrets regularly (every 90 days recommended)"
echo "   5. Ja doing all this like it will get more than one user"
echo ""
