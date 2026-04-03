"""
CollaborativeRecommender — User-User + Item-Item cosine + SVD factorization.

Why three signals: user-user captures taste neighborhoods, item-item captures
content co-consumption, SVD captures latent factors. Blending 0.35/0.35/0.30
balances exploration vs exploitation.
"""
from __future__ import annotations

from typing import List

import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

from src.data.MovieDataset import MovieDataset
from src.recommenders.TitleClassifier import TitleClassifier


class CollaborativeRecommender:

    def __init__(self) -> None:
        self._movies = MovieDataset.MOVIES
        interactions = MovieDataset.USER_INTERACTIONS

        self._movie_ids = [m["id"] for m in self._movies]
        self._movie_idx = {mid: i for i, mid in enumerate(self._movie_ids)}
        user_ids = list(interactions.keys())

        # Build user-item interaction matrix
        self._matrix = np.zeros((len(user_ids), len(self._movie_ids)), dtype=np.float32)
        for row, uid in enumerate(user_ids):
            for mid in interactions[uid]:
                self._matrix[row, self._movie_idx[mid]] = 1.0

    def _svd_predict(self, matrix: np.ndarray, k: int = 3) -> np.ndarray:
        if matrix.size == 0:
            return matrix
        u, s, vt = np.linalg.svd(matrix, full_matrices=False)
        k = min(k, len(s))
        return u[:, :k] @ np.diag(s[:k]) @ vt[:k, :]

    def recommend(self, watched_ids: List[int], top_k: int = 5) -> List[dict]:
        if not watched_ids:
            return []

        n_movies = len(self._movie_ids)
        pseudo = np.zeros((1, n_movies), dtype=np.float32)
        for mid in watched_ids:
            if mid in self._movie_idx:
                pseudo[0, self._movie_idx[mid]] = 1.0

        # User-User similarity weighted scores
        user_sim = cosine_similarity(pseudo, self._matrix).flatten()
        weighted = np.zeros(n_movies, dtype=np.float32)
        for i in range(self._matrix.shape[0]):
            weighted += user_sim[i] * self._matrix[i]
        uu_scores = weighted / (np.sum(np.abs(user_sim)) + 1e-8)

        # Item-Item similarity projection
        ii_sim = cosine_similarity(self._matrix.T)
        ii_scores = (pseudo @ ii_sim).flatten()

        # SVD latent factor prediction
        augmented = np.vstack([self._matrix, pseudo])
        svd_pred = self._svd_predict(augmented)
        svd_scores = svd_pred[-1]

        watched_set = set(watched_ids)
        candidates = []
        for movie in self._movies:
            mid = movie["id"]
            if mid in watched_set:
                continue
            idx = self._movie_idx[mid]
            score = 0.35 * uu_scores[idx] + 0.35 * ii_scores[idx] + 0.30 * svd_scores[idx]
            candidates.append((movie, float(score), float(uu_scores[idx]), float(ii_scores[idx]), float(svd_scores[idx])))

        candidates.sort(key=lambda x: x[1], reverse=True)

        return [
            TitleClassifier.format_recommendation(
                m, score,
                f"User-User={uu:.3f}, Item-Item={ii:.3f}, SVD={sv:.3f}",
                "collaborative",
            )
            for m, score, uu, ii, sv in candidates[:top_k]
        ]
