from __future__ import annotations

from typing import List

from backend.data.dummy_data import MOVIES
from backend.recommenders.common import format_recommendation


def recommend_hybrid(content_based: List[dict], collaborative: List[dict], top_k: int = 5) -> List[dict]:
    combined = {}

    for rec in content_based:
        combined.setdefault(
            rec["title"],
            {
                "movie": next(movie for movie in MOVIES if movie["title"] == rec["title"]),
                "content_score": 0.0,
                "collab_score": 0.0,
            },
        )
        combined[rec["title"]]["content_score"] = max(combined[rec["title"]]["content_score"], rec["score"])

    for rec in collaborative:
        combined.setdefault(
            rec["title"],
            {
                "movie": next(movie for movie in MOVIES if movie["title"] == rec["title"]),
                "content_score": 0.0,
                "collab_score": 0.0,
            },
        )
        combined[rec["title"]]["collab_score"] = max(combined[rec["title"]]["collab_score"], rec["score"])

    ranked = []
    for value in combined.values():
        movie = value["movie"]
        score = (0.5 * value["content_score"]) + (0.5 * value["collab_score"])
        ranked.append((movie, score, value["content_score"], value["collab_score"]))

    ranked.sort(key=lambda item: item[1], reverse=True)

    output = []
    for movie, score, content_score, collab_score in ranked[:top_k]:
        reason = f"Hybrid avg(Content={content_score:.3f}, Collaborative={collab_score:.3f})"
        output.append(format_recommendation(movie, score, reason, "hybrid"))
    return output
