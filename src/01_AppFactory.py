"""
AppFactory — Creates and configures the Flask application.

Why factory pattern: allows test isolation and multiple app configurations
without global state leaking between test runs.

Execution: 00_main.py → HERE → 02_Routes.py
"""
from __future__ import annotations

import importlib
from pathlib import Path

from flask import Flask
from flask_cors import CORS


DIST_DIR = Path(__file__).resolve().parent.parent / "frontend" / "dist"


def create_app() -> Flask:
    app = Flask(__name__, static_folder=str(DIST_DIR), static_url_path="")
    CORS(app)

    # Lazy-init DB on first request
    from src.models.Database import Database
    db = Database()

    @app.before_request
    def _ensure_db() -> None:
        db.init()

    # Register all API routes
    routes_module = importlib.import_module("src.02_Routes")
    routes_module.register_routes(app, db)

    return app
