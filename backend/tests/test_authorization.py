import pytest

from app.core.authorization import Permission, Role, has_permission, require_admin
from app.core.exceptions import AppException
from app.models.user import User


def make_user(role: str) -> User:
    return User(role=role, phone="08000000000", full_name="Test User", email="test@example.com")


def test_super_admin_has_all_permissions():
    user = make_user(Role.SUPER_ADMIN)

    assert all(has_permission(user, permission) for permission in Permission)


def test_admin_cannot_manage_admins():
    user = make_user(Role.ADMIN)

    assert has_permission(user, Permission.MANAGE_USERS)
    assert not has_permission(user, Permission.MANAGE_ADMINS)


def test_customer_cannot_access_admin_boundary():
    with pytest.raises(AppException) as error:
        require_admin(make_user(Role.CUSTOMER))

    assert error.value.status_code == 403