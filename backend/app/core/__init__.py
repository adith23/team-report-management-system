"""
Core module — cross-cutting concerns: database, security, dependencies, exceptions, enums.

Re-exports the most commonly used symbols for convenience:
    from app.core import get_db, get_current_user, require_role, settings
"""

from app.core.database import get_db  # noqa: F401
from app.core.dependencies import get_current_user, require_role  # noqa: F401
from app.core.enums import ReportStatus, TaskType, UserRole  # noqa: F401
from app.core.exceptions import (  # noqa: F401
    AppException,
    BadRequestException,
    DuplicateException,
    ForbiddenException,
    NotFoundException,
    UnauthorizedException,
)
from app.core.security import (  # noqa: F401
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
    set_auth_cookie,
    clear_auth_cookie,
)
