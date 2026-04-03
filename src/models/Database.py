"""
Database — Singleton SQLite manager for user auth and logging.

Why Singleton: one shared connection pool avoids file-lock contention
on the single SQLite database file.
"""
from __future__ import annotations

import sqlite3
from pathlib import Path
from typing import Optional
from uuid import uuid4

from werkzeug.security import check_password_hash, generate_password_hash

DB_PATH = Path(__file__).resolve().parent.parent.parent / "cinematch.db"


class Database:
    _instance: Optional["Database"] = None
    _initialized: bool = False

    def __new__(cls) -> "Database":
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def _connect(self) -> sqlite3.Connection:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        return conn

    def init(self) -> None:
        if self._initialized:
            return
        with self._connect() as conn:
            c = conn.cursor()
            c.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT NOT NULL UNIQUE,
                    password_hash TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """)
            c.execute("""
                CREATE TABLE IF NOT EXISTS sessions (
                    token TEXT PRIMARY KEY,
                    user_id INTEGER NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id)
                )
            """)
            c.execute("""
                CREATE TABLE IF NOT EXISTS recommendation_runs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    watched_titles TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id)
                )
            """)
        self._initialized = True

    def register_user(self, username: str, password: str) -> dict:
        pw_hash = generate_password_hash(password)
        try:
            with self._connect() as conn:
                cur = conn.cursor()
                cur.execute(
                    "INSERT INTO users (username, password_hash) VALUES (?, ?)",
                    (username, pw_hash),
                )
                return {"id": cur.lastrowid, "username": username}
        except sqlite3.IntegrityError as exc:
            raise ValueError("Username already exists") from exc

    def login_user(self, username: str, password: str) -> dict:
        with self._connect() as conn:
            cur = conn.cursor()
            cur.execute(
                "SELECT id, username, password_hash FROM users WHERE username = ?",
                (username,),
            )
            row = cur.fetchone()
            if row is None or not check_password_hash(row["password_hash"], password):
                raise ValueError("Invalid credentials")
            token = str(uuid4())
            cur.execute(
                "INSERT INTO sessions (token, user_id) VALUES (?, ?)",
                (token, row["id"]),
            )
            return {"token": token, "user": {"id": row["id"], "username": row["username"]}}

    def get_user_by_token(self, token: str) -> Optional[dict]:
        with self._connect() as conn:
            cur = conn.cursor()
            cur.execute(
                "SELECT u.id, u.username FROM sessions s "
                "JOIN users u ON u.id = s.user_id WHERE s.token = ?",
                (token,),
            )
            row = cur.fetchone()
            return {"id": row["id"], "username": row["username"]} if row else None

    def log_recommendation(self, user_id: int, watched_titles: str) -> None:
        with self._connect() as conn:
            conn.cursor().execute(
                "INSERT INTO recommendation_runs (user_id, watched_titles) VALUES (?, ?)",
                (user_id, watched_titles),
            )
