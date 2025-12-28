#!/bin/bash

# Legion Development Environment Setup

set -e

echo "LEGION DEVELOPMENT SETUP"
echo ""

# Check prerequisites
echo "Checking prerequisites..."

if ! command -v docker &>/dev/null; then
  echo "Docker not found. Please install Docker first."
  echo "   Visit: https://docs.docker.com/get-docker/"
  exit 1
fi

if ! command -v docker-compose &>/dev/null; then
  echo "Docker Compose not found. Please install Docker Compose first."
  exit 1
fi

echo "Docker and Docker Compose found"
echo ""

# Check for .env file
if [ ! -f .env ]; then
  echo "No .env file found."
  echo "   Creating from .env.example..."

  if [ -f .env.example ]; then
    cp .env.example .env
    echo ".env file created"
    echo ""
    echo "IMPORTANT: You need to add real secrets to .env"
    echo "   Run: ./scripts/generate-secrets.sh"
    echo "   Then copy the generated secrets to your .env file"
    echo ""
    read -p "Press Enter after you've updated .env with secrets..."
  else
    echo ".env.example not found!"
    exit 1
  fi
fi

# Verify required variables
echo "Verifying environment variables..."
required_vars=("POSTGRES_USER" "POSTGRES_PASSWORD" "LEGION_JWT_SECRET")
missing_vars=()

for var in "${required_vars[@]}"; do
  if ! grep -q "^${var}=" .env || grep -q "^${var}=CHANGE_ME_MATE" .env; then
    missing_vars+=("$var")
  fi
done

if [ ${#missing_vars[@]} -gt 0 ]; then
  echo "Missing or placeholder values for:"
  for var in "${missing_vars[@]}"; do
    echo "   - $var"
  done
  echo ""
  echo "Run: ./scripts/generate-secrets.sh"
  echo "Then update your .env file with the generated values"
  exit 1
fi

echo "Environment variables configured"
echo ""

# Clean up old containers
echo "Cleaning up old containers..."
docker-compose down -v 2>/dev/null || true

# Build and start services
echo "Building and starting services..."
docker-compose up -d --build

# Wait for services
echo "Waiting for services to be healthy..."
sleep 5

# Check service health
echo ""
echo "Service Status:"
docker-compose ps

echo ""
echo "Legion is ready"
echo ""
echo "Access Legion:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8080"
echo "   API Docs: http://localhost:8080/swagger-ui.html"
echo ""
echo "Useful commands:"
echo "   View logs:     docker-compose logs -f"
echo "   Stop services: docker-compose down"
echo "   Restart:       docker-compose restart"
echo ""
