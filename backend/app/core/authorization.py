from enum import StrEnum
from typing import Final

from fastapi import Depends

from app.core.exceptions import AppException
from app.core.security import get_current_user
from app.models.user import User


class Role(StrEnum):
    CUSTOMER = "customer"
    HOST = "host"
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"


class Permission(StrEnum):
    VIEW_VENUES = "venues:view"
    MANAGE_OWN_VENUES = "venues:manage_own"
    MANAGE_ALL_VENUES = "venues:manage_all"
    MANAGE_USERS = "users:manage"
    MANAGE_BOOKINGS = "bookings:manage"
    VIEW_ANALYTICS = "analytics:view"
    MANAGE_ADMINS = "admins:manage"
    MANAGE_SYSTEM = "system:manage"


ROLE_PERMISSIONS: Final[dict[Role, frozenset[Permission]]] = {
    Role.CUSTOMER: frozenset({Permission.VIEW_VENUES}),
    Role.HOST: frozenset({Permission.VIEW_VENUES, Permission.MANAGE_OWN_VENUES}),
    Role.ADMIN: frozenset({
        Permission.VIEW_VENUES,
        Permission.MANAGE_ALL_VENUES,
        Permission.MANAGE_USERS,
        Permission.MANAGE_BOOKINGS,
        Permission.VIEW_ANALYTICS,
    }),
    Role.SUPER_ADMIN: frozenset(Permission),
}


class ForbiddenException(AppException):
    def __init__(self, message: str = "You do not have permission to perform this action."):
        super().__init__(message, status_code=403, code="forbidden")


def has_permission(user: User, permission: Permission) -> bool:
    try:
        role = Role(user.role)
    except ValueError:
        return False
    return permission in ROLE_PERMISSIONS[role]


def require_permission(user: User, permission: Permission) -> User:
    if not has_permission(user, permission):
        raise ForbiddenException()
    return user


def require_admin(user: User) -> User:
    if user.role not in {Role.ADMIN, Role.SUPER_ADMIN}:
        raise ForbiddenException("Admin access is required.")
    return user


async def get_current_admin(user: User = Depends(get_current_user)) -> User:
    return require_admin(user)