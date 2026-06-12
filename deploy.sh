#!/bin/bash
# BrainSAIT LINC Agent Ecosystem - Deployment Script
# Usage: ./deploy.sh [environment]
# Requires: wrangler authenticated, CF_API_TOKEN set in env

set -e

ENV="${1:-production}"
echo "Deploying to: $ENV"

# Validate
if [ "$ENV" = "production" ] && [ -z "$CF_API_TOKEN" ]; then
  echo "ERROR: CF_API_TOKEN not set. Export it or use --env staging"
  echo "  export CF_API_TOKEN=your_token_here"
  exit 1
fi

cd "$(dirname "$0")"

echo "[1/4] Building frontend..."
npm install 2>&1 | tail -1
npm run build 2>&1 | tail -3

echo "[2/4] Applying D1 schema..."
npx wrangler d1 execute brainsait-healthcare-d1 --file=wrangler/schema.sql --env "$ENV" 2>&1 | tail -5

echo "[3/4] Seeding patient data..."
npx wrangler d1 execute brainsait-healthcare-d1 --command="SELECT COUNT(*) as count FROM fhir_resources;" --env "$ENV" 2>&1 | tail -5

echo "[4/4] Deploying worker..."
npx wrangler deploy --env "$ENV" 2>&1 | tail -10

echo ""
echo "Deployment complete!"
echo "  Environment: $ENV"
echo "  Domain: iris-fhir.brainsait.org"
echo ""
echo "Post-deploy steps:"
echo "  1. Set secrets:"
echo "     wrangler secret put IRIS_PASSWORD --env $ENV"
echo "     wrangler secret put API_AUTH_TOKEN --env $ENV"
echo "  2. Seed data: curl https://iris-fhir.brainsait.org/__seed"
echo "  3. Test: curl https://iris-fhir.brainsait.org/api/health"
