"""
Custom exception classes for the Wedding Guest Management System.
Provides consistent error handling across the application.
"""
from datetime import datetime
from typing import Any, Dict, Optional
from fastapi import HTTPException, status


class AppException(HTTPException):
    """Base exception class for the application."""

    def __init__(
        self,
        status_code: int,
        detail: str,
        error_code: str,
        headers: Optional[Dict[str, str]] = None
    ):
        super().__init__(
            status_code=status_code,
            detail=detail,
            headers=headers
        )
        self.error_code = error_code
        self.timestamp = datetime.utcnow().isoformat()


class NotFoundException(AppException):
    """Exception raised when a resource is not found."""

    def __init__(
        self,
        resource: str = "Resource",
        resource_id: Optional[Any] = None,
        detail: Optional[str] = None
    ):
        message = detail or f"{resource} not found"
        if resource_id:
            message = detail or f"{resource} with ID '{resource_id}' not found"

        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=message,
            error_code="NOT_FOUND"
        )
        self.resource = resource
        self.resource_id = resource_id


class UnauthorizedException(AppException):
    """Exception raised when user is not authenticated."""

    def __init__(
        self,
        detail: str = "Authentication required",
        error_code: str = "UNAUTHORIZED"
    ):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            error_code=error_code,
            headers={"WWW-Authenticate": "Bearer"}
        )


class ForbiddenException(AppException):
    """Exception raised when user doesn't have permission."""

    def __init__(
        self,
        detail: str = "You don't have permission to access this resource",
        error_code: str = "FORBIDDEN"
    ):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail,
            error_code=error_code
        )


class ValidationException(AppException):
    """Exception raised when input validation fails."""

    def __init__(
        self,
        detail: str = "Validation error",
        errors: Optional[Dict[str, Any]] = None,
        error_code: str = "VALIDATION_ERROR"
    ):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=detail,
            error_code=error_code
        )
        self.errors = errors or {}


class TokenExpiredException(AppException):
    """Exception raised when authentication token has expired."""

    def __init__(
        self,
        detail: str = "Token has expired",
        error_code: str = "TOKEN_EXPIRED"
    ):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            error_code=error_code,
            headers={"WWW-Authenticate": "Bearer"}
        )


class InvalidTokenException(AppException):
    """Exception raised when authentication token is invalid."""

    def __init__(
        self,
        detail: str = "Invalid token",
        error_code: str = "INVALID_TOKEN"
    ):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            error_code=error_code,
            headers={"WWW-Authenticate": "Bearer"}
        )


class ConflictException(AppException):
    """Exception raised when there's a resource conflict."""

    def __init__(
        self,
        detail: str = "Resource already exists",
        error_code: str = "CONFLICT"
    ):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=detail,
            error_code=error_code
        )


class BadRequestException(AppException):
    """Exception raised for bad requests."""

    def __init__(
        self,
        detail: str = "Bad request",
        error_code: str = "BAD_REQUEST"
    ):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail,
            error_code=error_code
        )


class FileUploadException(AppException):
    """Exception raised when file upload fails."""

    def __init__(
        self,
        detail: str = "File upload failed",
        error_code: str = "FILE_UPLOAD_ERROR"
    ):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail,
            error_code=error_code
        )


class RateLimitException(AppException):
    """Exception raised when rate limit is exceeded."""

    def __init__(
        self,
        detail: str = "Rate limit exceeded. Please try again later.",
        error_code: str = "RATE_LIMIT_EXCEEDED",
        retry_after: Optional[int] = None
    ):
        headers = {}
        if retry_after:
            headers["Retry-After"] = str(retry_after)

        super().__init__(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=detail,
            error_code=error_code,
            headers=headers if headers else None
        )


class DatabaseException(AppException):
    """Exception raised when database operation fails."""

    def __init__(
        self,
        detail: str = "Database operation failed",
        error_code: str = "DATABASE_ERROR"
    ):
        super().__init__(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=detail,
            error_code=error_code
        )


class ExternalServiceException(AppException):
    """Exception raised when external service call fails."""

    def __init__(
        self,
        service: str = "External service",
        detail: Optional[str] = None,
        error_code: str = "EXTERNAL_SERVICE_ERROR"
    ):
        message = detail or f"{service} is currently unavailable"
        super().__init__(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=message,
            error_code=error_code
        )


# Error response model for documentation
class ErrorResponse:
    """Standard error response format."""

    def __init__(
        self,
        detail: str,
        error_code: str,
        timestamp: str,
        errors: Optional[Dict[str, Any]] = None
    ):
        self.detail = detail
        self.error_code = error_code
        self.timestamp = timestamp
        self.errors = errors


def create_error_response(
    detail: str,
    error_code: str,
    errors: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """Create a standardized error response dictionary."""
    response = {
        "detail": detail,
        "error_code": error_code,
        "timestamp": datetime.utcnow().isoformat()
    }
    if errors:
        response["errors"] = errors
    return response
