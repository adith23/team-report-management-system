"""
Vector service to manage report indexing and semantic similarity queries.

Integrates with Pinecone Cloud.
Falls back to a fully functional in-memory vector database using local cosine similarity
when Pinecone credentials are not configured.
"""

import logging
from pinecone import Pinecone, ServerlessSpec

from app.config import settings
from app.services.ai.embedding_service import EmbeddingService

logger = logging.getLogger(__name__)


class VectorService:
    """
    Handles report indexing, embedding generation, and vector retrieval.
    """

    def __init__(self, embedding_service: EmbeddingService) -> None:
        self._embedding_service = embedding_service
        self._api_key = settings.PINECONE_API_KEY
        self._index_name = settings.PINECONE_INDEX_NAME
        
        # Local in-memory store for fallback/mock operations
        self._mock_db = []
        self._index = None

        if self._api_key and self._api_key != "your-pinecone-key-here":
            try:
                self._pc = Pinecone(api_key=self._api_key)
                
                # Check and create index if necessary (multilingual-e5-large uses 1024 dimensions)
                existing_indexes = [idx.name for idx in self._pc.list_indexes()]
                if self._index_name not in existing_indexes:
                    logger.info("Creating serverless Pinecone index: %s (1024 dimensions)", self._index_name)
                    self._pc.create_index(
                        name=self._index_name,
                        dimension=1024,
                        metric="cosine",
                        spec=ServerlessSpec(cloud="aws", region="us-east-1"),
                    )
                self._index = self._pc.Index(self._index_name)
                logger.info("Pinecone service initialized successfully on index: %s", self._index_name)
            except Exception as e:
                logger.error("Failed to initialize Pinecone: %s. Reverting to Mock mode.", str(e))
                self._index = None
        else:
            logger.warning("PINECONE_API_KEY not configured. Running VectorService in local mock mode.")

    def _format_report_text(self, report_data: dict) -> str:
        """
        Produce a clean, structured text representation of a report for embedding.
        """
        lines = [
            f"Weekly Report submitted by {report_data.get('user_name', 'Unknown')}",
            f"Project: {report_data.get('project_name', 'Uncategorized')}",
            f"Reporting Week: {report_data.get('week_start', '')} to {report_data.get('week_end', '')}",
            f"Hours Worked: {report_data.get('hours_worked') or 0} hrs",
        ]
        
        tasks_completed = report_data.get("tasks_completed", [])
        if tasks_completed:
            lines.append("Completed Tasks:")
            for t in tasks_completed:
                lines.append(f"- {t}")

        tasks_planned = report_data.get("tasks_planned", [])
        if tasks_planned:
            lines.append("Planned Tasks for Next Week:")
            for t in tasks_planned:
                lines.append(f"- {t}")

        blockers = report_data.get("blockers", [])
        if blockers:
            lines.append("Blockers / Challenges:")
            for b in blockers:
                status = "Resolved" if b.get("is_resolved") else "UNRESOLVED"
                lines.append(f"- [{status}] {b.get('description')}")
        
        if report_data.get("notes"):
            lines.append(f"Additional Notes: {report_data.get('notes')}")

        return "\n".join(lines)

    async def upsert_report(self, report_id: str, report_data: dict) -> None:
        """
        Generate embedding for a report and insert/update it in the vector database.
        """
        text_content = self._format_report_text(report_data)
        
        try:
            # Pass is_query=False for indexing text passages
            vector = await self._embedding_service.get_embedding(text_content, is_query=False)
        except Exception as e:
            logger.error("Failed to generate embedding during upsert: %s", str(e))
            return

        metadata = {
            "report_id": report_id,
            "user_id": report_data.get("user_id", ""),
            "user_name": report_data.get("user_name", ""),
            "project_name": report_data.get("project_name", ""),
            "week_start": report_data.get("week_start", ""),
            "hours_worked": float(report_data.get("hours_worked") or 0.0),
            "text": text_content,
        }

        # 1. Update local mock database
        self._mock_db = [item for item in self._mock_db if item["id"] != report_id]
        self._mock_db.append({
            "id": report_id,
            "values": vector,
            "metadata": metadata,
        })
        logger.info("Local vector cache updated for report_id: %s", report_id)

        # 2. Update Pinecone index if active
        if self._index:
            try:
                self._index.upsert(
                    vectors=[(report_id, vector, metadata)]
                )
                logger.info("Pinecone database index updated for report_id: %s", report_id)
            except Exception as e:
                logger.error("Pinecone upsert failed for report_id %s: %s", report_id, str(e))

    async def query_similar(self, query: str, limit: int = 5) -> list[dict]:
        """
        Embed the user query and retrieve top-k semantically matching report structures.
        """
        try:
            # Pass is_query=True for query embedding
            query_vector = await self._embedding_service.get_embedding(query, is_query=True)
        except Exception as e:
            logger.error("Failed to embed query: %s", str(e))
            return []

        # 1. Query Pinecone Cloud if active
        if self._index:
            try:
                response = self._index.query(
                    vector=query_vector,
                    top_k=limit,
                    include_metadata=True,
                )
                results = []
                for match in response.matches:
                    results.append({
                        "id": match.id,
                        "score": match.score,
                        "metadata": match.metadata,
                        "text": match.metadata.get("text", ""),
                    })
                logger.info("Pinecone RAG retrieval returned %s matches for query: %s", len(results), query[:30])
                return results
            except Exception as e:
                logger.error("Pinecone similarity search failed: %s. Falling back to local search.", str(e))

        # 2. Local Fallback Search (In-memory cosine similarity using pure Python)
        if not self._mock_db:
            logger.debug("Local mock database is empty; no reports cached for search.")
            return []

        scored_items = []
        for item in self._mock_db:
            # Pure Python dot product of normalized lists (length 1024)
            dot_product = sum(a * b for a, b in zip(query_vector, item["values"]))
            scored_items.append({
                "id": item["id"],
                "score": float(dot_product),
                "metadata": item["metadata"],
                "text": item["metadata"]["text"],
            })

        scored_items.sort(key=lambda x: x["score"], reverse=True)
        results = scored_items[:limit]
        logger.info("Local RAG retrieval returned %s matches for query: %s", len(results), query[:30])
        return results
