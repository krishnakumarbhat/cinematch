from __future__ import annotations

from collections import defaultdict
from typing import Dict, List

from backend.data.dummy_data import MOVIES, USER_SEQUENCES
from backend.recommenders.common import format_recommendation


def _build_transition_counts() -> Dict[int, Dict[int, int]]:
    transitions = defaultdict(lambda: defaultdict(int))
    for sequence in USER_SEQUENCES:
        for left, right in zip(sequence, sequence[1:]):
            transitions[left][right] += 1
    return transitions


def recommend_sequential(watched_movie_ids: List[int], top_k: int = 5) -> List[dict]:
    if not watched_movie_ids:
        return []

    transitions = _build_transition_counts()
    last_movie = watched_movie_ids[-1]

    next_counts = transitions.get(last_movie, {})
    if not next_counts:
        fallback_counts = defaultdict(int)
        for movie_id in watched_movie_ids:
            for candidate, count in transitions.get(movie_id, {}).items():
                fallback_counts[candidate] += count
        next_counts = fallback_counts

    total = sum(next_counts.values()) or 1
    movie_map = {movie["id"]: movie for movie in MOVIES}
    watched_set = set(watched_movie_ids)

    ranked = []
    for movie_id, count in next_counts.items():
        if movie_id in watched_set or movie_id not in movie_map:
            continue
        probability = count / total
        ranked.append((movie_map[movie_id], probability, count))

    ranked.sort(key=lambda item: item[1], reverse=True)

    output = []
    for movie, probability, count in ranked[:top_k]:
        reason = f"Transition count={count}, next-step probability={probability:.3f}"
        output.append(format_recommendation(movie, probability, reason, "sequential"))
    return output
