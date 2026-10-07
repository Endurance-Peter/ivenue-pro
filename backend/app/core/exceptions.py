class AppException(Exception):
    def __init__(self, message: str, status_code: int = 400, code: str = "application_error"):
        self.message = message
        self.status_code = status_code
        self.code = code
        super().__init__(message)


class AuthenticationException(AppException):
    def __init__(self, message: str = "Authentication is required."):
        super().__init__(message, status_code=401, code="authentication_required")


class UserNotFoundException(AppException):
    def __init__(self, phone: str):
        super().__init__(
            message=f"No signup was found for phone number {phone}.",
            status_code=404,
            code="user_not_found",
        )


class InvalidVerificationCodeException(AppException):
    def __init__(self):
        super().__init__(
            message="The verification code is invalid.",
            status_code=400,
            code="invalid_verification_code",
        )


class VerificationRateLimitException(AppException):
    def __init__(self):
        super().__init__("Please wait before requesting another code.", 429, "verification_rate_limited")


class VerificationExpiredException(AppException):
    def __init__(self):
        super().__init__("The verification code has expired.", 400, "verification_expired")
