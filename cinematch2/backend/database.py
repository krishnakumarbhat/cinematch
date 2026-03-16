from __future__ import annotations

import sqlite3
from pathlib import Path
from typing import Optional
from uuid import uuid4

from werkzeug.security import check_password_hash, generate_password_hash

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "cinematch.db"


def get_connection() -> sqlite3.Connection:
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def init_db() -> None:
    with get_connection() as connection:
        cursor = connection.cursor()
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
            """
        )
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS sessions (
                token TEXT PRIMARY KEY,
                user_id INTEGER NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            );
            """
        )
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS recommendation_runs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                watched_titles TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            );
            """
        )


def register_user(username: str, password: str) -> dict:
    password_hash = generate_password_hash(password)
    try:
        with get_connection() as connection:
            cursor = connection.cursor()
            cursor.execute(
                "INSERT INTO users (username, password_hash) VALUES (?, ?)",
                (username, password_hash),
            )
            user_id = cursor.lastrowid
            return {"id": user_id, "username": username}
    except sqlite3.IntegrityError as error:
        raise ValueError("Username already exists") from error


def login_user(username: str, password: str) -> dict:
    with get_connection() as connection:
        cursor = connection.cursor()
        cursor.execute("SELECT id, username, password_hash FROM users WHERE username = ?", (username,))
        user = cursor.fetchone()
        if user is None or not check_password_hash(user["password_hash"], password):
            raise ValueError("Invalid credentials")

        token = str(uuid4())
        cursor.execute("INSERT INTO sessions (token, user_id) VALUES (?, ?)", (token, user["id"]))
        return {"token": token, "user": {"id": user["id"], "username": user["username"]}}


def get_user_by_token(token: str) -> Optional[dict]:
    with get_connection() as connection:
        cursor = connection.cursor()
        cursor.execute(
            """
            SELECT users.id, users.username
            FROM sessions
            JOIN users ON users.id = sessions.user_id
            WHERE sessions.token = ?
            """,
            (token,),
        )
        user = cursor.fetchone()
        if user is None:
            return None
        return {"id": user["id"], "username": user["username"]}


def log_recommendation_run(user_id: int, watched_titles: str) -> None:
    with get_connection() as connection:
        cursor = connection.cursor()
        cursor.execute(
            "INSERT INTO recommendation_runs (user_id, watched_titles) VALUES (?, ?)",
            (user_id, watched_titles),
        )
