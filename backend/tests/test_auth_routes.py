def signup_payload() -> dict[str, str]:
    return {
        "full_name": "Ada Lovelace",
        "email": "ada@example.com",
        "password": "correct-horse-battery-staple",
        "role": "customer",
    }


def test_signup_endpoint_returns_session(client):
    response = client.post("/api/v1/auth/signup", json=signup_payload())

    assert response.status_code == 201
    assert response.json()["user"]["email"] == "ada@example.com"
    assert response.json()["user"]["role"] == "customer"
    assert response.json()["token_type"] == "bearer"


def test_signin_endpoint_returns_session_for_existing_user(client):
    client.post("/api/v1/auth/signup", json=signup_payload())

    response = client.post(
        "/api/v1/auth/signin/request",
        json={"email": "ada@example.com", "password": "correct-horse-battery-staple"},
    )

    assert response.status_code == 200
    assert response.json()["user"]["is_verified"] is True
    assert response.json()["token_type"] == "bearer"


def test_signin_rejects_unknown_credentials(client):
    response = client.post(
        "/api/v1/auth/signin/request",
        json={"email": "unknown@example.com", "password": "wrong-password"},
    )

    assert response.status_code == 401
    assert response.json()["error"]["message"] == "The email or password is incorrect."


def test_me_requires_bearer_token(client):
    response = client.get("/api/v1/auth/me")

    assert response.status_code == 401
    assert response.json()["error"]["code"] == "authentication_required"


def test_me_returns_authenticated_user(client):
    signup_response = client.post("/api/v1/auth/signup", json=signup_payload())
    token = signup_response.json()["access_token"]

    response = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 200
    assert response.json()["email"] == "ada@example.com"
