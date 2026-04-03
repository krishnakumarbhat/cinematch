"""
ContentBasedRecommender — TF-IDF vectorization + Cosine Similarity + KNN.

Why TF-IDF: efficient O(n·d) sparse representation; cosine similarity
is O(n·d) and KNN brute-force is acceptable for small catalogs.
"""
from __future__ import annotations

from typing import List

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.neighbors import NearestNeighbors

from src.data.MovieDataset import MovieDataset
from src.recommenders.TitleClassifier import TitleClassifier


class ContentBasedRecommender:

    def __init__(self) -> None:
        self._movies = MovieDataset.MOVIES
        self._ids = [m["id"] for m in self._movies]
        self._id_to_idx = {mid: i for i, mid in enumerate(self._ids)}
        self._corpus = self._build_corpus()
        self._tfidf = TfidfVectorizer(stop_words="english")
        self._matrix = self._tfidf.fit_transform(self._corpus)

    def _build_corpus(self) -> List[str]:
        return [
            " ".join([
                m["title"],
                " ".join(m["genres"]),
                m["director"],
                " ".join(m["actors"]),
                m["description"],
            ])
            for m in self._movies
        ]

    def recommend(self, watched_ids: List[int], top_k: int = 5) -> List[dict]:
        if not watched_ids:
            return []

        indices = [self._id_to_idx[mid] for mid in watched_ids if mid in self._id_to_idx]
        if not indices:
            return []

        # Average TF-IDF profile of watched titles
        profile = np.asarray(self._matrix[indices].mean(axis=0))
        cos_scores = cosine_similarity(profile, self._matrix).flatten()

        # KNN nearest neighbors from each watched title
        knn = NearestNeighbors(metric="cosine", algorithm="brute")
        knn.fit(self._matrix)
        n_neighbors = min(len(self._movies), top_k + len(indices))
        dists, knn_idxs = knn.kneighbors(self._matrix[indices], n_neighbors=n_neighbors)

        knn_scores: dict[int, float] = {}
        for row_dists, row_idxs in zip(dists, knn_idxs):
            for d, idx in zip(row_dists, row_idxs):
                knn_scores[idx] = max(knn_scores.get(idx, 0.0), 1.0 - float(d))

        watched_set = set(watched_ids)
        candidates = []
        for movie in self._movies:
            if movie["id"] in watched_set:
                continue
            idx = self._id_to_idx[movie["id"]]
            cs = float(cos_scores[idx])
            ks = float(knn_scores.get(idx, 0.0))
            combined = 0.7 * cs + 0.3 * ks
            candidates.append((movie, combined, cs, ks))

        candidates.sort(key=lambda x: x[1], reverse=True)

        return [
            TitleClassifier.format_recommendation(
                m, score, f"TF-IDF+Cosine={cs:.3f}, KNN={ks:.3f}", "content_based"
            )
            for m, score, cs, ks in candidates[:top_k]
        ]
