#!/bin/bash
# Cloudflare Live Access Script - BotFather v2.1
# Usage: source .env && ./cloudflare-live-access.sh <command>
set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

API_TOKEN="${CLOUDFLARE_API_TOKEN:-}"
API_BASE="https://api.cloudflare.com/client/v4"
ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID:-d7b99530559ab4f2545e9bdc72a7ab9b}"

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

verify_token() {
  [ -z "$API_TOKEN" ] && { log_error "Set CLOUDFLARE_API_TOKEN in .env"; return 1; }
  response=$(curl -s -X GET "$API_BASE/user/tokens/verify" \
    -H "Authorization: Bearer $API_TOKEN" \
    -H "Content-Type: application/json")
  if echo "$response" | grep -q '"active": true'; then
    log_success "Token active"
    return 0
  fi
  log_error "Invalid token"
  return 1
}

list_zones() {
  log_info "Zones:"
  curl -s -X GET "$API_BASE/zones?per_page=50" \
    -H "Authorization: Bearer $API_TOKEN" | jq -r '.result[] | "  \(.name) [\(.status)]"'
}

list_workers() {
  log_info "Workers (filtered):"
  curl -s -X GET "$API_BASE/accounts/$ACCOUNT_ID/workers/scripts?per_page=100" \
    -H "Authorization: Bearer $API_TOKEN" | jq -r '.result[]? | .id' | grep -E "linc|masterlinc|givc|healthlinc|nphies" | head -20
}

get_zone_id() {
  curl -s -X GET "$API_BASE/zones?name=$1&per_page=1" \
    -H "Authorization: Bearer $API_TOKEN" | jq -r '.result[0].id // empty'
}

optimize() {
  zone_id=$(get_zone_id "$1")
  [ -z "$zone_id" ] && { log_error "Zone not found"; return 1; }
  
  curl -s -X PATCH "$API_BASE/zones/$zone_id/settings/polish" \
    -H "Authorization: Bearer $API_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"value":"lossless"}' | jq -r '.success'
  
  curl -s -X PATCH "$API_BASE/zones/$zone_id/settings/ssl" \
    -H "Authorization: Bearer $API_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"value":"full"}' | jq -r '.success'
  
  log_success "Optimized $1"
}

deploy_worker() {
  log_info "Deploying worker: $1"
  # Placeholder for worker deployment
  log_success "Worker $1 ready for deployment"
}

usage() {
  echo "BotFather Cloudflare Automation"
  echo "Usage: source .env && $0 <command>"
  echo ""
  echo "Commands:"
  echo "  verify             - Verify API token"
  echo "  list-zones        - List all zones"
  echo "  list-workers     - List LINC-related workers"
  echo "  optimize <zone>  - Optimize zone settings"
  echo "  deploy <worker>   - Deploy worker"
}

case "$1" in
  verify) verify_token ;;
  list-zones) list_zones ;;
  list-workers) list_workers ;;
  optimize) optimize "$2" ;;
  deploy) deploy_worker "$2" ;;
  *) usage ;;
esac