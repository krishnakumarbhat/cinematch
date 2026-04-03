"""
Routes — Defines all API endpoints for CineMatch.

Execution: 01_AppFactory.py → HERE
Uses: 03_AuthMiddleware.py, RecommendationPipeline, Database
"""
from __future__ import annotations

import importlib
import json
from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory

from src.models.Database import Database
from src.recommenders.RecommendationPipeline import RecommendationPipeline

DIST_DIR = Path(__file__).resolve().parent.parent / "frontend" / "dist"


def register_routes(app: Flask, db: Database) -> None:
    auth = importlib.import_module("src.03_AuthMiddleware")
    pipeline = RecommendationPipeline()

    # -- Static / SPA serving --------------------------------------------------

    @app.get("/")
    def root():
        index = DIST_DIR / "index.html"
        if index.exists():
            return send_from_directory(DIST_DIR, "index.html")
        return jsonify({
            "message": "Frontend not built. Run: cd frontend && npm run build",
            "api": ["/api/health", "/api/auth/register", "/api/auth/login", "/api/recommend"],
        }), 200

    @app.get("/<path:path>")
    def serve_frontend(path: str):
        if path.startswith("api/"):
            return jsonify({"error": "Not found"}), 404
        target = DIST_DIR / path
        if target.exists() and target.is_file():
            return send_from_directory(DIST_DIR, path)
        index = DIST_DIR / "index.html"
        if index.exists():
            return send_from_directory(DIST_DIR, "index.html")
        return jsonify({"error": "Frontend build not found"}), 404

    # -- Health ----------------------------------------------------------------

    @app.get("/api/health")
    def health():
        return {"status": "ok"}, 200

    # -- Auth ------------------------------------------------------------------

    @app.post("/api/auth/register")
    def register():
        payload = request.get_json(silent=True) or {}
        username = str(payload.get("username", "")).strip()
        password = str(payload.get("password", "")).strip()
        if len(username) < 3 or len(password) < 4:
            return jsonify({"error": "Username min 3 chars, password min 4 chars"}), 400
        try:
            user = db.register_user(username, password)
            return jsonify({"user": user}), 201
        except ValueError as exc:
            return jsonify({"error": str(exc)}), 409

    @app.post("/api/auth/login")
    def login():
        payload = request.get_json(silent=True) or {}
        username = str(payload.get("username", "")).strip()
        password = str(payload.get("password", "")).strip()
        if not username or not password:
            return jsonify({"error": "Username and password required"}), 400
        try:
            result = db.login_user(username, password)
            return jsonify(result), 200
        except ValueError as exc:
            return jsonify({"error": str(exc)}), 401

    # -- Recommendations -------------------------------------------------------

    @app.post("/api/recommend")
    def recommend():
        payload = request.get_json(silent=True) or {}
        watched_titles = payload.get("watched_titles", [])
        if not isinstance(watched_titles, list) or not watched_titles:
            return jsonify({"error": "watched_titles must be a non-empty list"}), 400

        watched_titles = [str(t).strip() for t in watched_titles if str(t).strip()]
        if not watched_titles:
            return jsonify({"error": "No valid titles provided"}), 400

        user = auth.resolve_user(request, db)

        result = pipeline.run(watched_titles)

        if user["id"] > 0:
            db.log_recommendation(user["id"], json.dumps(watched_titles))

        return jsonify({
            "user": user,
            "watched_titles": watched_titles,
            "classification": result["classification"],
            "algorithms": result["algorithms"],
            "retrieval_context": result["retrieval_context"],
            "summary": result["summary"],
        }), 200
