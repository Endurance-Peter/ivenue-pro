def signup_payload() -> dict[str, str]:
    return {
        "phone": "08000000000",
        "full_name": "Ada Lovelace",
        "email": "ada@example.com",
        "account_type": "customer",
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
    assert response.json()["email"] == "ada@example.com"
    assert response.json()["is_verified"] is True


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
