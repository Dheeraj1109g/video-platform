class AppException(Exception):
    def __init__(self, status_code: int, message: str, error_code: str = "APP_ERROR"):
        self.status_code = status_code
        self.message = message
        self.error_code = error_code

class InvalidOTPException(AppException):
    def __init__(self):
        super().__init__(400, "Invalid or expired OTP", "INVALID_OTP")

class UserNotVerifiedException(AppException):
    def __init__(self):
        super().__init__(403, "Account not verified", "USER_NOT_VERIFIED")

class UserAlreadyExistsException(AppException):
    def __init__(self):
        super().__init__(409, "User already exists", "USER_EXISTS")

class InvalidCredentialsException(AppException):
    def __init__(self):
        super().__init__(401, "Invalid email or password", "INVALID_CREDENTIALS")

class UnauthorizedException(AppException):
    def __init__(self):
        super().__init__(401, "Authentication required", "UNAUTHORIZED")

class NotFoundException(AppException):
    def __init__(self, resource: str = "Resource"):
        super().__init__(404, f"{resource} not found", "NOT_FOUND")

class FileValidationException(AppException):
    def __init__(self, message: str):
        super().__init__(400, message, "INVALID_FILE")