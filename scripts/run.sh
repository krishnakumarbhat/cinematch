#!/usr/bin/env bash
# run.sh — Start the CineMatch backend (serves API + built frontend)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

unset PYTHONPATH

cd "$PROJECT_ROOT"

# Activate venv if present
if [ -f ".venv/bin/activate" ]; then
    source .venv/bin/activate
fi

echo "=== Starting CineMatch AI ==="
echo "Backend:  http://localhost:5002"
echo "API:      http://localhost:5002/api/health"
echo ""

exec python 00_main.py
