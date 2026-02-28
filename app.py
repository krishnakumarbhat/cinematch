from __future__ import annotations

import json
from functools import wraps
from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

from backend.database import get_user_by_token, init_db, log_recommendation_run, login_user, register_user
from backend.recommenders.pipeline import run_recommendation_pipeline

BASE_DIR = Path(__file__).resolve().parent
DIST_DIR = BASE_DIR / "dist"

app = Flask(__name__, static_folder=str(DIST_DIR), static_url_path="")
CORS(app)


@app.before_request
def _init() -> None:
    init_db()


@app.get("/")
def root():
    index_file = DIST_DIR / "index.html"
    if index_file.exists():
        return send_from_directory(DIST_DIR, "index.html")
    return (
        jsonify(
            {
                "message": "Frontend build not found. Run: npm run build (or npm run dev for Vite).",
                "api_endpoints": [
                    "/api/health",
                    "/api/auth/register",
                    "/api/auth/login",
                    "/api/recommend",
                ],
            }
        ),
        200,
    )


@app.get("/<path:path>")
def serve_frontend(path: str):
    if path.startswith("api/"):
        return jsonify({"error": "Not found"}), 404

    target = DIST_DIR / path
    if target.exists() and target.is_file():
        return send_from_directory(DIST_DIR, path)

    index_file = DIST_DIR / "index.html"
    if index_file.exists():
        return send_from_directory(DIST_DIR, "index.html")

    return jsonify({"error": "Frontend build not found"}), 404


@app.get("/api")
def api_root() -> tuple[dict, int]:
    return {
        "status": "ok",
        "message": "Use /api/health, /api/auth/register, /api/auth/login, /api/recommend",
    }, 200


def _extract_bearer_token() -> str | None:
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None
    return auth_header.replace("Bearer ", "", 1).strip()


def login_required(handler):
    @wraps(handler)
    def wrapper(*args, **kwargs):
        token = _extract_bearer_token()
        if not token:
            return jsonify({"error": "Missing auth token"}), 401

        user = get_user_by_token(token)
        if not user:
            return jsonify({"error": "Invalid or expired auth token"}), 401

        return handler(user, *args, **kwargs)

    return wrapper


def _resolve_user_from_request() -> dict:
    token = _extract_bearer_token()
    if not token:
        return {"id": 0, "username": "guest"}

    user = get_user_by_token(token)
    if not user:
        raise ValueError("Invalid or expired auth token")
    return user


@app.get("/api/health")
def health() -> tuple[dict, int]:
    return {"status": "ok"}, 200


@app.post("/api/auth/register")
def register():
    payload = request.get_json(silent=True) or {}
    username = str(payload.get("username", "")).strip()
    password = str(payload.get("password", "")).strip()

    if len(username) < 3 or len(password) < 4:
        return jsonify({"error": "Username/password too short"}), 400

    try:
        user = register_user(username, password)
        return jsonify({"user": user}), 201
    except ValueError as error:
        return jsonify({"error": str(error)}), 409


@app.post("/api/auth/login")
def login():
    payload = request.get_json(silent=True) or {}
    username = str(payload.get("username", "")).strip()
    password = str(payload.get("password", "")).strip()

    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400

    try:
        result = login_user(username, password)
        return jsonify(result), 200
    except ValueError as error:
        return jsonify({"error": str(error)}), 401


@app.post("/api/recommend")
def recommend():
    payload = request.get_json(silent=True) or {}
    watched_titles = payload.get("watched_titles", [])

    if not isinstance(watched_titles, list) or not watched_titles:
        return jsonify({"error": "watched_titles must be a non-empty list"}), 400

    watched_titles = [str(item).strip() for item in watched_titles if str(item).strip()]
    if not watched_titles:
        return jsonify({"error": "No valid movie titles provided"}), 400

    try:
        user = _resolve_user_from_request()
    except ValueError as error:
        return jsonify({"error": str(error)}), 401

    result = run_recommendation_pipeline(watched_titles)
    if user["id"] > 0:
        log_recommendation_run(user_id=user["id"], watched_titles=json.dumps(watched_titles))

    return (
        jsonify(
            {
                "user": user,
                "watched_titles": watched_titles,
                "classification": result["classification"],
                "algorithms": result["algorithms"],
                "retrieval_context": result["retrieval_context"],
                "summary": json.loads(result["summary"]),
            }
        ),
        200,
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5002, debug=True)
