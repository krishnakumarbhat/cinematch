#!/usr/bin/env bash
# setup.sh — One-time environment setup
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

unset PYTHONPATH

echo "=== CineMatch AI Setup ==="

# Python virtual environment
echo "[1/3] Creating Python virtual environment..."
cd "$PROJECT_ROOT"
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install --ignore-installed -r requirements.txt
echo "  ✓ Python dependencies installed"

# Frontend dependencies
echo "[2/3] Installing frontend dependencies..."
cd "$PROJECT_ROOT/frontend"
if [ -f package-lock.json ]; then
	npm ci
else
	npm install
fi
echo "  ✓ Frontend dependencies installed"

# Build frontend
echo "[3/3] Building frontend..."
npm run build
echo "  ✓ Frontend built → frontend/dist/"

echo ""
echo "=== Setup complete ==="
echo "Run: scripts/run.sh"
