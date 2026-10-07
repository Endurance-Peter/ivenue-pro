def signup_payload() -> dict[str, str]:
    return {
        "phone": "08000000000",
        "full_name": "Ada Lovelace",
        "email": "ada@example.com",
        "role": "customer",
    }


def test_signup_endpoint_returns_verification_response(client):
    response = client.post("/api/v1/auth/signup", json=signup_payload())

    assert response.status_code == 202
    assert response.json() == {"message": "Verification code sent", "phone": "08000000000"}


def test_verify_endpoint_returns_created_user(client):
    client.post("/api/v1/auth/signup", json=signup_payload())

    response = client.post(
        "/api/v1/auth/verify",
        json={**signup_payload(), "code": "123456"},
    )

    assert response.status_code == 201
    assert response.json()["user"]["email"] == "ada@example.com"
    assert response.json()["user"]["role"] == "customer"
    assert response.json()["user"]["is_verified"] is True
    assert response.json()["token_type"] == "bearer"


def test_verify_endpoint_returns_not_found_for_unknown_user(client):
    response = client.post(
        "/api/v1/auth/verify",
        json={**signup_payload(), "phone": "08099999999", "code": "123456"},
    )

    assert response.status_code == 404
    assert response.json() == {
        "error": {
            "code": "user_not_found",
            "message": "No signup was found for phone number 08099999999.",
        }
    }


def test_verify_endpoint_rejects_invalid_code_shape(client):
    response = client.post(
        "/api/v1/auth/verify",
        json={**signup_payload(), "code": "123"},
    )

    assert response.status_code == 422
    assert response.json()["detail"][0]["type"] == "string_pattern_mismatch"


def test_signin_requires_existing_verified_user(client):
    response = client.post("/api/v1/auth/signin/request", json={"phone": "08099999999"})

    assert response.status_code == 404
    assert response.json()["error"]["code"] == "user_not_found"


def test_signin_returns_session_for_existing_user(client):
    client.post("/api/v1/auth/signup", json=signup_payload())
    client.post("/api/v1/auth/verify", json={**signup_payload(), "code": "123456"})

    request_response = client.post("/api/v1/auth/signin/request", json={"phone": "08000000000"})
    verify_response = client.post(
        "/api/v1/auth/signin/verify",
        json={"phone": "08000000000", "code": "123456"},
    )

    assert request_response.status_code == 202
    assert verify_response.status_code == 200
    assert verify_response.json()["token_type"] == "bearer"


def test_me_requires_bearer_token(client):
    response = client.get("/api/v1/auth/me")

    assert response.status_code == 401
    assert response.json()["error"]["code"] == "authentication_required"


def test_me_returns_authenticated_user(client):
    client.post("/api/v1/auth/signup", json=signup_payload())
    verify_response = client.post(
        "/api/v1/auth/verify",
        json={**signup_payload(), "code": "123456"},
    )
    token = verify_response.json()["access_token"]

    response = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 200
    assert response.json()["phone"] == "08000000000"
