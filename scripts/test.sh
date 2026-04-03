#!/usr/bin/env bash
# test.sh — Run the backend test suite in an isolated environment
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

unset PYTHONPATH
export PYTEST_DISABLE_PLUGIN_AUTOLOAD=1

cd "$PROJECT_ROOT"

if [ -f ".venv/bin/activate" ]; then
    source .venv/bin/activate
fi

python -m pytest tests -v