"""
Embedding service to generate vector representations of report text.

Uses Pinecone's hosted Inference API (multilingual-e5-large, 1024 dimensions).
This eliminates third-party dependencies on OpenAI for vector embedding calculations.
Falls back to a deterministic pseudo-random mock embedding if API keys are not present.
"""

import logging
import hashlib
import asyncio
import random
import math
from pinecone import Pinecone

from app.config import settings

logger = logging.getLogger(__name__)


class EmbeddingService:
    """
    Handles generation of semantic vector embeddings using Pinecone's inference models.
    """

    def __init__(self) -> None:
        self._api_key = settings.PINECONE_API_KEY
        if self._api_key and self._api_key != "your-pinecone-key-here":
            try:
                self._pc = Pinecone(api_key=self._api_key)
            except Exception as e:
                logger.error("Failed to initialize Pinecone client in EmbeddingService: %s", str(e))
                self._pc = None
        else:
            self._pc = None
            logger.warning(
                "PINECONE_API_KEY is not set. EmbeddingService will run in MOCK mode."
            )

    async def get_embedding(self, text: str, is_query: bool = False) -> list[float]:
        """
        Generate a 1024-dimension float vector embedding using Pinecone Inference.
        
        Args:
            text: Text segment to embed.
            is_query: If True, uses 'query' input type parameters. Otherwise uses 'passage'.
        """
        if not self._pc:
            # Generate deterministic mock vector based on MD5 hash of text (1024 dimensions) using pure Python
            hasher = hashlib.md5(text.encode("utf-8"))
            hash_bytes = hasher.digest()
            seed = int.from_bytes(hash_bytes[:4], "big")
            
            # Use standard random module to generate deterministic random floats
            local_rand = random.Random(seed)
            vector = [local_rand.gauss(0, 1) for _ in range(1024)]
            
            # Normalize vector to unit length
            magnitude = math.sqrt(sum(x * x for x in vector))
            if magnitude > 0:
                vector = [float(x / magnitude) for x in vector]
            return vector

        try:
            input_type = "query" if is_query else "passage"
            
            # Execute synchronous SDK call in secondary thread to avoid event loop blocking
            response = await asyncio.to_thread(
                self._pc.inference.embed,
                model="multilingual-e5-large",
                inputs=[text],
                parameters={"input_type": input_type, "truncate": "END"},
            )
            
            # Parse result values
            return response[0].values
        except Exception as e:
            logger.error("Pinecone Inference embedding generation failed: %s", str(e))
            # Safe fallback: local mock vector so pipeline doesn't break on API outages
            hasher = hashlib.md5(text.encode("utf-8"))
            hash_bytes = hasher.digest()
            seed = int.from_bytes(hash_bytes[:4], "big")
            local_rand = random.Random(seed)
            vector = [local_rand.gauss(0, 1) for _ in range(1024)]
            magnitude = math.sqrt(sum(x * x for x in vector))
            if magnitude > 0:
                vector = [float(x / magnitude) for x in vector]
            return vector
