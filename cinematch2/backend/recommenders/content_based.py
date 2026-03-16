from __future__ import annotations

from typing import List

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.neighbors import NearestNeighbors

from backend.data.dummy_data import MOVIES
from backend.recommenders.common import format_recommendation


def _movie_corpus() -> List[str]:
    corpus = []
    for movie in MOVIES:
        text_blob = " ".join(
            [
                movie["title"],
                " ".join(movie["genres"]),
                movie["director"],
                " ".join(movie["actors"]),
                movie["description"],
            ]
        )
        corpus.append(text_blob)
    return corpus


def recommend_content_based(watched_movie_ids: List[int], top_k: int = 5) -> List[dict]:
    if not watched_movie_ids:
        return []

    movie_ids = [movie["id"] for movie in MOVIES]
    id_to_idx = {movie_id: index for index, movie_id in enumerate(movie_ids)}

    corpus = _movie_corpus()
    tfidf = TfidfVectorizer(stop_words="english")
    tfidf_matrix = tfidf.fit_transform(corpus)

    watched_indices = [id_to_idx[movie_id] for movie_id in watched_movie_ids if movie_id in id_to_idx]
    if not watched_indices:
        return []

    watched_profile = np.asarray(tfidf_matrix[watched_indices].mean(axis=0))
    cosine_scores = cosine_similarity(watched_profile, tfidf_matrix).flatten()

    knn = NearestNeighbors(metric="cosine", algorithm="brute")
    knn.fit(tfidf_matrix)
    knn_distances, knn_indices = knn.kneighbors(tfidf_matrix[watched_indices], n_neighbors=min(len(MOVIES), top_k + len(watched_indices)))

    knn_score_map = {}
    for distances, indices in zip(knn_distances, knn_indices):
        for distance, index in zip(distances, indices):
            knn_score_map[index] = max(knn_score_map.get(index, 0.0), 1.0 - float(distance))

    watched_set = set(watched_movie_ids)
    scored_candidates = []
    for movie in MOVIES:
        if movie["id"] in watched_set:
            continue
        idx = id_to_idx[movie["id"]]
        cosine_score = float(cosine_scores[idx])
        neighbor_score = float(knn_score_map.get(idx, 0.0))
        combined = (0.7 * cosine_score) + (0.3 * neighbor_score)
        scored_candidates.append((movie, combined, cosine_score, neighbor_score))

    scored_candidates.sort(key=lambda item: item[1], reverse=True)

    output = []
    for movie, combined, cosine_score, neighbor_score in scored_candidates[:top_k]:
        reason = f"TF-IDF + Cosine={cosine_score:.3f}, KNN similarity={neighbor_score:.3f}"
        output.append(format_recommendation(movie, combined, reason, "content_based"))
    return output
