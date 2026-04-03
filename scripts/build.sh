#!/usr/bin/env bash
# build.sh — Build frontend for production
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "=== Building CineMatch Frontend ==="

cd "$PROJECT_ROOT/frontend"
npm run build

echo "✓ Frontend built → frontend/dist/"
echo "Flask will serve it at http://localhost:5002"
