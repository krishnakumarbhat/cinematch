"""
SequentialRecommender — Markov-chain transition model.

Why Markov: O(S) build from viewing sequences, O(T) lookup per prediction,
where S = total sequence length and T = transition count from last watched.
"""
from __future__ import annotations

from collections import defaultdict
from typing import Dict, List

from src.data.MovieDataset import MovieDataset
from src.recommenders.TitleClassifier import TitleClassifier


class SequentialRecommender:

    def __init__(self) -> None:
        self._movies = MovieDataset.MOVIES
        self._movie_map = MovieDataset.get_movie_map()
        self._transitions = self._build_transitions()

    def _build_transitions(self) -> Dict[int, Dict[int, int]]:
        trans: dict[int, dict[int, int]] = defaultdict(lambda: defaultdict(int))
        for seq in MovieDataset.USER_SEQUENCES:
            for a, b in zip(seq, seq[1:]):
                trans[a][b] += 1
        return trans

    def recommend(self, watched_ids: List[int], top_k: int = 5) -> List[dict]:
        if not watched_ids:
            return []

        last = watched_ids[-1]
        counts = dict(self._transitions.get(last, {}))

        # Fallback: aggregate transitions from all watched titles
        if not counts:
            agg: dict[int, int] = defaultdict(int)
            for mid in watched_ids:
                for cand, cnt in self._transitions.get(mid, {}).items():
                    agg[cand] += cnt
            counts = dict(agg)

        total = sum(counts.values()) or 1
        watched_set = set(watched_ids)

        ranked = []
        for mid, cnt in counts.items():
            if mid in watched_set or mid not in self._movie_map:
                continue
            prob = cnt / total
            ranked.append((self._movie_map[mid], prob, cnt))

        ranked.sort(key=lambda x: x[1], reverse=True)

        return [
            TitleClassifier.format_recommendation(
                m, prob,
                f"Transition count={cnt}, probability={prob:.3f}",
                "sequential",
            )
            for m, prob, cnt in ranked[:top_k]
        ]
