"""
RecommendationPipeline — Orchestrates all recommenders in sequence.

Execution flow:
  classify → [content_based, collaborative, sequential] → hybrid → summary

Why plain Python over LangGraph: four function calls don't need a DAG framework;
native orchestration is simpler, faster, and has zero extra dependencies.
"""
from __future__ import annotations

from typing import Dict, List

from src.recommenders.TitleClassifier import TitleClassifier
from src.recommenders.ContentBasedRecommender import ContentBasedRecommender
from src.recommenders.CollaborativeRecommender import CollaborativeRecommender
from src.recommenders.HybridRecommender import HybridRecommender
from src.recommenders.SequentialRecommender import SequentialRecommender


class RecommendationPipeline:

    def __init__(self) -> None:
        self._classifier = TitleClassifier()
        self._content = ContentBasedRecommender()
        self._collab = CollaborativeRecommender()
        self._hybrid = HybridRecommender()
        self._sequential = SequentialRecommender()

    def run(self, watched_titles: List[str]) -> Dict[str, object]:
        # Step 1 — classify user input against known catalog
        classification = self._classifier.classify(watched_titles)
        known_ids, unknown = self._classifier.resolve_ids(watched_titles)

        # Step 2 — run independent recommenders
        content_results = self._content.recommend(known_ids, top_k=5)
        collab_results = self._collab.recommend(known_ids, top_k=5)
        seq_results = self._sequential.recommend(known_ids, top_k=5)

        # Step 3 — blend content + collaborative into hybrid ensemble
        hybrid_results = self._hybrid.recommend(content_results, collab_results, top_k=5)

        # Step 4 — build lightweight retrieval context from TF-IDF
        retrieval = self._build_retrieval_context(watched_titles)

        # Step 5 — summary
        summary = {
            "known_inputs": len(known_ids),
            "unknown_inputs": unknown,
            "algorithms": {
                "content_based": len(content_results),
                "collaborative": len(collab_results),
                "hybrid": len(hybrid_results),
                "sequential": len(seq_results),
            },
            "retrieval": retrieval,
        }

        return {
            "classification": classification,
            "algorithms": {
                "content_based": content_results,
                "collaborative": collab_results,
                "hybrid": hybrid_results,
                "sequential": seq_results,
            },
            "retrieval_context": retrieval,
            "summary": summary,
        }

    @staticmethod
    def _build_retrieval_context(titles: List[str]) -> List[dict]:
        """Simple keyword-based context builder (replaces LlamaIndex/ChromaDB)."""
        from src.data.MovieDataset import MovieDataset

        query = " ".join(titles).lower()
        matches = []
        for movie in MovieDataset.MOVIES:
            blob = f"{movie['title']} {' '.join(movie['genres'])} {movie['description']}".lower()
            overlap = sum(1 for word in query.split() if word in blob)
            if overlap > 0:
                matches.append((overlap, movie))

        matches.sort(key=lambda x: x[0], reverse=True)
        top = matches[:4]

        if not top:
            return [{"source": "keyword_match", "text": "No matching context found."}]

        context_text = " | ".join(
            f"{m['title']} ({m['type']}, {m['year']}): {m['description']}"
            for _, m in top
        )
        return [{"source": "keyword_match", "text": context_text}]
