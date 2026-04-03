"""
TitleClassifier — Normalizes user input and matches against known catalog.

O(n) lookup via pre-built hash map of normalized titles.
"""
from __future__ import annotations

from typing import List, Tuple

from src.data.MovieDataset import MovieDataset


class TitleClassifier:

    def __init__(self) -> None:
        self._index = MovieDataset.get_title_index()

    def classify(self, titles: List[str]) -> List[dict]:
        results = []
        for title in titles:
            key = title.strip().lower()
            movie = self._index.get(key)
            if movie:
                results.append({
                    "input": title,
                    "matched_title": movie["title"],
                    "type": movie["type"],
                    "confidence": 1.0,
                })
            else:
                results.append({
                    "input": title,
                    "matched_title": None,
                    "type": "Unknown",
                    "confidence": 0.0,
                })
        return results

    def resolve_ids(self, titles: List[str]) -> Tuple[List[int], List[str]]:
        """Return (known_movie_ids, unknown_title_strings)."""
        known, unknown = [], []
        for title in titles:
            movie = self._index.get(title.strip().lower())
            if movie:
                known.append(movie["id"])
            else:
                unknown.append(title)
        return known, unknown

    @staticmethod
    def format_recommendation(movie: dict, score: float, reason: str, source: str) -> dict:
        return {
            "title": movie["title"],
            "type": movie["type"],
            "year": movie["year"],
            "score": round(float(score), 4),
            "description": movie["description"],
            "reason": reason,
            "source_algorithm": source,
        }
