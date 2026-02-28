from __future__ import annotations

from typing import Dict, List

import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

from backend.data.dummy_data import MOVIES, USER_INTERACTIONS
from backend.recommenders.common import format_recommendation


def _build_interaction_matrix() -> tuple[np.ndarray, List[str], List[int]]:
    user_ids = list(USER_INTERACTIONS.keys())
    movie_ids = [movie["id"] for movie in MOVIES]

    matrix = np.zeros((len(user_ids), len(movie_ids)), dtype=np.float32)
    movie_index = {movie_id: index for index, movie_id in enumerate(movie_ids)}

    for user_row, user_id in enumerate(user_ids):
        for movie_id in USER_INTERACTIONS[user_id]:
            matrix[user_row, movie_index[movie_id]] = 1.0

    return matrix, user_ids, movie_ids


def _matrix_factorization_svd_score(matrix: np.ndarray, k: int = 3) -> np.ndarray:
    if matrix.size == 0:
        return matrix
    u, s, vt = np.linalg.svd(matrix, full_matrices=False)
    k = min(k, len(s))
    u_k = u[:, :k]
    s_k = np.diag(s[:k])
    vt_k = vt[:k, :]
    return u_k @ s_k @ vt_k


def recommend_collaborative(watched_movie_ids: List[int], top_k: int = 5) -> List[dict]:
    if not watched_movie_ids:
        return []

    matrix, user_ids, movie_ids = _build_interaction_matrix()
    movie_index = {movie_id: index for index, movie_id in enumerate(movie_ids)}

    pseudo_user = np.zeros((1, len(movie_ids)), dtype=np.float32)
    for movie_id in watched_movie_ids:
        if movie_id in movie_index:
            pseudo_user[0, movie_index[movie_id]] = 1.0

    user_sim = cosine_similarity(pseudo_user, matrix).flatten()

    weighted_scores = np.zeros(len(movie_ids), dtype=np.float32)
    denom = float(np.sum(np.abs(user_sim))) + 1e-8
    for user_idx in range(matrix.shape[0]):
        weighted_scores += user_sim[user_idx] * matrix[user_idx]
    user_user_scores = weighted_scores / denom

    item_item_sim = cosine_similarity(matrix.T)
    item_projection = pseudo_user @ item_item_sim
    item_item_scores = item_projection.flatten()

    augmented_matrix = np.vstack([matrix, pseudo_user])
    svd_pred = _matrix_factorization_svd_score(augmented_matrix)
    svd_scores = svd_pred[-1]

    watched_set = set(watched_movie_ids)
    candidates = []
    for movie in MOVIES:
        movie_id = movie["id"]
        if movie_id in watched_set:
            continue
        idx = movie_index[movie_id]
        score = (0.35 * user_user_scores[idx]) + (0.35 * item_item_scores[idx]) + (0.30 * svd_scores[idx])
        candidates.append((movie, float(score), float(user_user_scores[idx]), float(item_item_scores[idx]), float(svd_scores[idx])))

    candidates.sort(key=lambda item: item[1], reverse=True)

    output = []
    for movie, score, uu, ii, svd in candidates[:top_k]:
        reason = f"User-User={uu:.3f}, Item-Item={ii:.3f}, SVD={svd:.3f}"
        output.append(format_recommendation(movie, score, reason, "collaborative"))
    return output
