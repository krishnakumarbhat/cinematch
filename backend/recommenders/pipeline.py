from __future__ import annotations

import json
import importlib
from typing import Dict, List, TypedDict

from langgraph.graph import END, START, StateGraph

from backend.data.dummy_data import MOVIES
from backend.recommenders.collaborative import recommend_collaborative
from backend.recommenders.common import classify_titles, resolve_known_movie_ids
from backend.recommenders.content_based import recommend_content_based
from backend.recommenders.hybrid import recommend_hybrid
from backend.recommenders.sequential import recommend_sequential


class RecommendationState(TypedDict, total=False):
    watched_titles: List[str]
    watched_movie_ids: List[int]
    unknown_titles: List[str]
    classification: List[dict]
    content_based: List[dict]
    collaborative: List[dict]
    hybrid: List[dict]
    sequential: List[dict]
    retrieval_context: List[dict]
    summary: str


def _build_retrieval_context(watched_titles: List[str], top_k: int = 4) -> List[dict]:
    try:
        chromadb = importlib.import_module("chromadb")
        llama_core = importlib.import_module("llama_index.core")
        llama_schema = importlib.import_module("llama_index.core.schema")
        llama_chroma = importlib.import_module("llama_index.vector_stores.chroma")

        VectorStoreIndex = getattr(llama_core, "VectorStoreIndex")
        Document = getattr(llama_schema, "Document")
        ChromaVectorStore = getattr(llama_chroma, "ChromaVectorStore")

        docs = [
            Document(
                text=f"{movie['title']} ({movie['type']}, {movie['year']}): {movie['description']} | Genres: {', '.join(movie['genres'])}"
            )
            for movie in MOVIES
        ]

        chroma_client = chromadb.EphemeralClient()
        chroma_collection = chroma_client.create_collection("cinematch_movies")
        vector_store = ChromaVectorStore(chroma_collection=chroma_collection)

        index = VectorStoreIndex.from_documents(docs, vector_store=vector_store)
        query_engine = index.as_query_engine(similarity_top_k=top_k)

        joined_query = ", ".join(watched_titles)
        response = query_engine.query(f"Find similar titles and themes for: {joined_query}")

        return [
            {
                "source": "llamaindex_chromadb",
                "text": str(response),
            }
        ]
    except Exception as error:
        return [
            {
                "source": "llamaindex_chromadb",
                "text": f"Retrieval unavailable: {error}",
            }
        ]


def _classify_node(state: RecommendationState) -> RecommendationState:
    watched_titles = state["watched_titles"]
    watched_movie_ids, unknown_titles = resolve_known_movie_ids(watched_titles)
    classification = classify_titles(watched_titles)
    return {
        "watched_movie_ids": watched_movie_ids,
        "unknown_titles": unknown_titles,
        "classification": classification,
    }


def _content_node(state: RecommendationState) -> RecommendationState:
    return {"content_based": recommend_content_based(state.get("watched_movie_ids", []), top_k=5)}


def _collaborative_node(state: RecommendationState) -> RecommendationState:
    return {"collaborative": recommend_collaborative(state.get("watched_movie_ids", []), top_k=5)}


def _sequential_node(state: RecommendationState) -> RecommendationState:
    return {"sequential": recommend_sequential(state.get("watched_movie_ids", []), top_k=5)}


def _hybrid_node(state: RecommendationState) -> RecommendationState:
    content_based = state.get("content_based", [])
    collaborative = state.get("collaborative", [])
    return {"hybrid": recommend_hybrid(content_based, collaborative, top_k=5)}


def _retrieval_node(state: RecommendationState) -> RecommendationState:
    watched_titles = state.get("watched_titles", [])
    return {"retrieval_context": _build_retrieval_context(watched_titles)}


def _summary_node(state: RecommendationState) -> RecommendationState:
    unknown = state.get("unknown_titles", [])
    summary = {
        "known_inputs": len(state.get("watched_movie_ids", [])),
        "unknown_inputs": unknown,
        "algorithms": {
            "content_based": len(state.get("content_based", [])),
            "collaborative": len(state.get("collaborative", [])),
            "hybrid": len(state.get("hybrid", [])),
            "sequential": len(state.get("sequential", [])),
        },
        "retrieval": state.get("retrieval_context", []),
    }
    return {"summary": json.dumps(summary)}


def _build_graph():
    builder = StateGraph(RecommendationState)

    builder.add_node("run_classify", _classify_node)
    builder.add_node("run_content", _content_node)
    builder.add_node("run_collaborative", _collaborative_node)
    builder.add_node("run_sequential", _sequential_node)
    builder.add_node("run_hybrid", _hybrid_node)
    builder.add_node("run_retrieval", _retrieval_node)
    builder.add_node("run_summary", _summary_node)

    builder.add_edge(START, "run_classify")
    builder.add_edge("run_classify", "run_content")
    builder.add_edge("run_classify", "run_collaborative")
    builder.add_edge("run_classify", "run_sequential")
    builder.add_edge("run_content", "run_hybrid")
    builder.add_edge("run_collaborative", "run_hybrid")
    builder.add_edge("run_hybrid", "run_retrieval")
    builder.add_edge("run_sequential", "run_retrieval")
    builder.add_edge("run_retrieval", "run_summary")
    builder.add_edge("run_summary", END)

    return builder.compile()


GRAPH = _build_graph()


def run_recommendation_pipeline(watched_titles: List[str]) -> Dict[str, object]:
    state: RecommendationState = {"watched_titles": watched_titles}
    output = GRAPH.invoke(state)

    return {
        "classification": output.get("classification", []),
        "algorithms": {
            "content_based": output.get("content_based", []),
            "collaborative": output.get("collaborative", []),
            "hybrid": output.get("hybrid", []),
            "sequential": output.get("sequential", []),
        },
        "retrieval_context": output.get("retrieval_context", []),
        "summary": output.get("summary", "{}"),
    }
