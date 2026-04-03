"""
Tests for recommendation algorithms.
Run: pytest tests/ -v
"""
from __future__ import annotations

import sys
from pathlib import Path

# Ensure project root is on sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.recommenders.TitleClassifier import TitleClassifier
from src.recommenders.ContentBasedRecommender import ContentBasedRecommender
from src.recommenders.CollaborativeRecommender import CollaborativeRecommender
from src.recommenders.HybridRecommender import HybridRecommender
from src.recommenders.SequentialRecommender import SequentialRecommender
from src.recommenders.RecommendationPipeline import RecommendationPipeline


class TestTitleClassifier:
    def test_known_title(self):
        tc = TitleClassifier()
        results = tc.classify(["Inception"])
        assert results[0]["matched_title"] == "Inception"
        assert results[0]["confidence"] == 1.0

    def test_unknown_title(self):
        tc = TitleClassifier()
        results = tc.classify(["Nonexistent Movie XYZ"])
        assert results[0]["matched_title"] is None
        assert results[0]["type"] == "Unknown"

    def test_resolve_ids(self):
        tc = TitleClassifier()
        known, unknown = tc.resolve_ids(["Inception", "FakeTitle"])
        assert 1 in known
        assert "FakeTitle" in unknown


class TestContentBased:
    def test_returns_recommendations(self):
        cb = ContentBasedRecommender()
        recs = cb.recommend([1, 2], top_k=3)
        assert len(recs) > 0
        assert all("title" in r for r in recs)

    def test_empty_input(self):
        cb = ContentBasedRecommender()
        assert cb.recommend([], top_k=3) == []


class TestCollaborative:
    def test_returns_recommendations(self):
        cf = CollaborativeRecommender()
        recs = cf.recommend([1, 4], top_k=3)
        assert len(recs) > 0

    def test_empty_input(self):
        cf = CollaborativeRecommender()
        assert cf.recommend([]) == []


class TestHybrid:
    def test_blends_results(self):
        cb = ContentBasedRecommender()
        cf = CollaborativeRecommender()
        content = cb.recommend([1, 2], top_k=5)
        collab = cf.recommend([1, 2], top_k=5)
        hybrid = HybridRecommender()
        recs = hybrid.recommend(content, collab, top_k=3)
        assert len(recs) > 0


class TestSequential:
    def test_returns_recommendations(self):
        seq = SequentialRecommender()
        recs = seq.recommend([15, 16], top_k=3)
        assert len(recs) > 0

    def test_empty_input(self):
        seq = SequentialRecommender()
        assert seq.recommend([]) == []


class TestPipeline:
    def test_full_pipeline(self):
        pipe = RecommendationPipeline()
        result = pipe.run(["Inception", "The Matrix"])
        assert "classification" in result
        assert "algorithms" in result
        algos = result["algorithms"]
        assert "content_based" in algos
        assert "collaborative" in algos
        assert "hybrid" in algos
        assert "sequential" in algos
        assert len(algos["content_based"]) > 0

    def test_unknown_titles(self):
        pipe = RecommendationPipeline()
        result = pipe.run(["CompletelyFakeMovie123"])
        assert result["summary"]["known_inputs"] == 0
        assert "CompletelyFakeMovie123" in result["summary"]["unknown_inputs"]
