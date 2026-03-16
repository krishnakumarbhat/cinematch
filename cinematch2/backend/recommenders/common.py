from __future__ import annotations

from typing import Dict, List, Tuple

from backend.data.dummy_data import MOVIES


def get_movie_map() -> Dict[int, dict]:
    return {movie["id"]: movie for movie in MOVIES}


def normalize_title(value: str) -> str:
    return value.strip().lower()


def index_titles() -> Dict[str, dict]:
    return {normalize_title(movie["title"]): movie for movie in MOVIES}


def classify_titles(titles: List[str]) -> List[dict]:
    title_index = index_titles()
    classified = []
    for title in titles:
        key = normalize_title(title)
        matched = title_index.get(key)
        if matched:
            classified.append(
                {
                    "input": title,
                    "matched_title": matched["title"],
                    "type": matched["type"],
                    "confidence": 1.0,
                }
            )
        else:
            classified.append(
                {
                    "input": title,
                    "matched_title": None,
                    "type": "Unknown",
                    "confidence": 0.0,
                }
            )
    return classified


def format_recommendation(movie: dict, score: float, reason: str, source_algorithm: str) -> dict:
    return {
        "title": movie["title"],
        "type": movie["type"],
        "year": movie["year"],
        "score": round(float(score), 4),
        "description": movie["description"],
        "reason": reason,
        "source_algorithm": source_algorithm,
    }


def resolve_known_movie_ids(titles: List[str]) -> Tuple[List[int], List[str]]:
    title_index = index_titles()
    known_ids = []
    unknown_titles = []
    for title in titles:
        movie = title_index.get(normalize_title(title))
        if movie:
            known_ids.append(movie["id"])
        else:
            unknown_titles.append(title)
    return known_ids, unknown_titles
