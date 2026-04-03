"""
AuthMiddleware — Token extraction and user resolution.

Why separated: keeps auth logic decoupled from route handlers,
enabling easy swap to JWT or OAuth later.
"""
from __future__ import annotations

from flask import Request

from src.models.Database import Database


def extract_bearer_token(req: Request) -> str | None:
    header = req.headers.get("Authorization", "")
    if not header.startswith("Bearer "):
        return None
    return header[7:].strip() or None


def resolve_user(req: Request, db: Database) -> dict:
    """Return authenticated user dict or guest fallback."""
    token = extract_bearer_token(req)
    if not token:
        return {"id": 0, "username": "guest"}
    user = db.get_user_by_token(token)
    if not user:
        return {"id": 0, "username": "guest"}
    return user
