"""
Generic base repository — abstract CRUD operations.

Implements the Repository Pattern with Python generics.
All entity-specific repositories inherit from this base
and add their own query methods.

This eliminates code duplication across repositories:
- get_by_id, get_all, create, update, delete
are implemented once and reused everywhere.

Type parameter ModelType is bound to Base, ensuring
only SQLAlchemy models can be used.
"""

import uuid
from typing import Generic, TypeVar, Type, Sequence

from sqlalchemy import select, func, inspect
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.base import Base

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    """
    Generic repository providing standard CRUD operations.

    Follows the Repository Pattern — all concrete repositories
    inherit from this and add entity-specific queries.

    Usage:
        class UserRepository(BaseRepository[User]):
            def __init__(self, session: AsyncSession):
                super().__init__(User, session)

            async def get_by_email(self, email: str) -> User | None:
                ...
    """

    def __init__(self, model: Type[ModelType], session: AsyncSession) -> None:
        """
        Initialize the repository with a model class and database session.

        Args:
            model: The SQLAlchemy model class (e.g., User, Project).
            session: The async database session for this request.
        """
        self._model = model
        self._session = session

    async def get_by_id(self, id: uuid.UUID) -> ModelType | None:
        """
        Fetch a single entity by its UUID primary key.

        Args:
            id: The entity's UUID.

        Returns:
            The entity if found, None otherwise.
        """
        return await self._session.get(self._model, id)

    async def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
    ) -> Sequence[ModelType]:
        """
        Fetch all entities with offset-based pagination.

        Args:
            skip: Number of records to skip (offset).
            limit: Maximum number of records to return.

        Returns:
            Sequence of entity instances.
        """
        stmt = select(self._model).offset(skip).limit(limit)
        result = await self._session.execute(stmt)
        return result.scalars().all()

    async def count(self) -> int:
        """
        Count total entities of this model type.

        Returns:
            Total count as integer.
        """
        stmt = select(func.count()).select_from(self._model)
        result = await self._session.execute(stmt)
        return result.scalar_one()

    async def create(self, obj: ModelType) -> ModelType:
        """
        Insert a new entity into the database.

        The session is flushed (not committed) so the object
        receives its generated fields (id, timestamps).
        Commit happens at the request boundary via get_db().

        Args:
            obj: The ORM model instance to insert.

        Returns:
            The same instance with generated fields populated.
        """
        self._session.add(obj)
        await self._session.flush()
        # Refresh only column attributes to avoid expiring lazy='raise' relationships
        mapper = inspect(obj.__class__)
        columns = [c.key for c in mapper.column_attrs]
        await self._session.refresh(obj, attribute_names=columns)
        return obj

    async def update(self, obj: ModelType, data: dict) -> ModelType:
        """
        Update an existing entity with a dictionary of changes.

        Only the fields present in `data` are modified.
        Unchanged fields are not touched.

        Args:
            obj: The ORM model instance to update.
            data: Dictionary of field_name → new_value.

        Returns:
            The updated instance with refreshed fields.
        """
        for key, value in data.items():
            if hasattr(obj, key):
                setattr(obj, key, value)
        await self._session.flush()
        # Refresh only column attributes to avoid expiring lazy='raise' relationships
        mapper = inspect(obj.__class__)
        columns = [c.key for c in mapper.column_attrs]
        await self._session.refresh(obj, attribute_names=columns)
        return obj

    async def delete(self, obj: ModelType) -> None:
        """
        Hard-delete an entity from the database.

        For soft-delete, use update() with is_active=False instead.

        Args:
            obj: The ORM model instance to delete.
        """
        await self._session.delete(obj)
        await self._session.flush()
