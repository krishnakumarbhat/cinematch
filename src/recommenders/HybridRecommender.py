"""
HybridRecommender — Weighted ensemble of content-based + collaborative scores.

Why 50/50 blend: equal weighting lets both signals contribute without
bias; tunable via constructor parameter.
"""
from __future__ import annotations

from typing import List

from src.data.MovieDataset import MovieDataset
from src.recommenders.TitleClassifier import TitleClassifier


class HybridRecommender:

    def __init__(self, content_weight: float = 0.5) -> None:
        self._cw = content_weight
        self._movies = MovieDataset.MOVIES

    def recommend(
        self,
        content_results: List[dict],
        collab_results: List[dict],
        top_k: int = 5,
    ) -> List[dict]:
        combined: dict[str, dict] = {}

        for rec in content_results:
            combined.setdefault(rec["title"], {"content": 0.0, "collab": 0.0})
            combined[rec["title"]]["content"] = max(combined[rec["title"]]["content"], rec["score"])

        for rec in collab_results:
            combined.setdefault(rec["title"], {"content": 0.0, "collab": 0.0})
            combined[rec["title"]]["collab"] = max(combined[rec["title"]]["collab"], rec["score"])

        movie_map = {m["title"]: m for m in self._movies}
        ranked = []
        for title, scores in combined.items():
            movie = movie_map.get(title)
            if not movie:
                continue
            score = self._cw * scores["content"] + (1 - self._cw) * scores["collab"]
            ranked.append((movie, score, scores["content"], scores["collab"]))

        ranked.sort(key=lambda x: x[1], reverse=True)

        return [
            TitleClassifier.format_recommendation(
                m, score,
                f"Hybrid avg(Content={cs:.3f}, Collaborative={cl:.3f})",
                "hybrid",
            )
            for m, score, cs, cl in ranked[:top_k]
        ]
