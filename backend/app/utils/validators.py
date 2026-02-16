"""
Validation utilities for the Wedding Guest Management System.
Provides validators for file uploads, phone numbers, URLs, and more.
"""
import re
import mimetypes
from typing import List, Optional, Tuple
from fastapi import UploadFile
from app.utils.exceptions import ValidationException, FileUploadException


# File type configurations
ALLOWED_IMAGE_TYPES = {
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/webp": [".webp"],
    "image/gif": [".gif"]
}

ALLOWED_DOCUMENT_TYPES = {
    "application/pdf": [".pdf"],
    "application/msword": [".doc"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"]
}

ALLOWED_EXCEL_TYPES = {
    "application/vnd.ms-excel": [".xls"],
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
    "text/csv": [".csv"]
}

ALLOWED_VIDEO_TYPES = {
    "video/mp4": [".mp4"],
    "video/webm": [".webm"],
    "video/quicktime": [".mov"]
}

# Size limits in bytes
MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10 MB
MAX_DOCUMENT_SIZE = 20 * 1024 * 1024  # 20 MB
MAX_EXCEL_SIZE = 5 * 1024 * 1024  # 5 MB
MAX_VIDEO_SIZE = 100 * 1024 * 1024  # 100 MB


class FileValidator:
    """Validates uploaded files for type and size."""

    @staticmethod
    async def validate_file(
        file: UploadFile,
        allowed_types: dict,
        max_size: int,
        file_type_name: str = "file"
    ) -> Tuple[str, bytes]:
        """
        Validate a file's type and size.

        Args:
            file: The uploaded file
            allowed_types: Dictionary of allowed MIME types and extensions
            max_size: Maximum file size in bytes
            file_type_name: Name of the file type for error messages

        Returns:
            Tuple of (content_type, file_content)

        Raises:
            FileUploadException: If validation fails
        """
        # Read file content
        content = await file.read()
        await file.seek(0)  # Reset file pointer

        # Check file size
        if len(content) > max_size:
            max_size_mb = max_size / (1024 * 1024)
            actual_size_mb = len(content) / (1024 * 1024)
            raise FileUploadException(
                detail=f"File size ({actual_size_mb:.1f} MB) exceeds maximum allowed size ({max_size_mb:.1f} MB)",
                error_code="FILE_TOO_LARGE"
            )

        # Check if file is empty
        if len(content) == 0:
            raise FileUploadException(
                detail="Uploaded file is empty",
                error_code="EMPTY_FILE"
            )

        # Detect MIME type from extension (fallback to declared content type)
        detected_type = file.content_type
        if file.filename:
            guessed_type, _ = mimetypes.guess_type(file.filename)
            if guessed_type:
                detected_type = guessed_type

        # Validate MIME type
        if detected_type not in allowed_types:
            allowed_extensions = []
            for exts in allowed_types.values():
                allowed_extensions.extend(exts)
            raise FileUploadException(
                detail=f"Invalid {file_type_name} type. Allowed types: {', '.join(allowed_extensions)}",
                error_code="INVALID_FILE_TYPE"
            )

        # Validate file extension matches MIME type
        if file.filename:
            extension = "." + file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
            if extension and extension not in allowed_types.get(detected_type, []):
                raise FileUploadException(
                    detail=f"File extension doesn't match content type",
                    error_code="EXTENSION_MISMATCH"
                )

        return detected_type, content

    @staticmethod
    async def validate_image(file: UploadFile, max_size: int = MAX_IMAGE_SIZE) -> Tuple[str, bytes]:
        """Validate an image file."""
        return await FileValidator.validate_file(
            file, ALLOWED_IMAGE_TYPES, max_size, "image"
        )

    @staticmethod
    async def validate_document(file: UploadFile, max_size: int = MAX_DOCUMENT_SIZE) -> Tuple[str, bytes]:
        """Validate a document file."""
        return await FileValidator.validate_file(
            file, ALLOWED_DOCUMENT_TYPES, max_size, "document"
        )

    @staticmethod
    async def validate_excel(file: UploadFile, max_size: int = MAX_EXCEL_SIZE) -> Tuple[str, bytes]:
        """Validate an Excel/CSV file."""
        return await FileValidator.validate_file(
            file, ALLOWED_EXCEL_TYPES, max_size, "Excel/CSV"
        )

    @staticmethod
    async def validate_video(file: UploadFile, max_size: int = MAX_VIDEO_SIZE) -> Tuple[str, bytes]:
        """Validate a video file."""
        return await FileValidator.validate_file(
            file, ALLOWED_VIDEO_TYPES, max_size, "video"
        )


class ExcelValidator:
    """Validates Excel file contents for guest import."""

    REQUIRED_COLUMNS = ["name"]
    OPTIONAL_COLUMNS = [
        "name_ar", "email", "phone", "whatsapp", "group_name",
        "side", "relation", "plus_ones", "notes"
    ]

    @staticmethod
    def validate_columns(columns: List[str]) -> Tuple[bool, List[str]]:
        """
        Validate that required columns exist.

        Returns:
            Tuple of (is_valid, missing_columns)
        """
        columns_lower = [col.lower().strip() for col in columns]
        missing = []

        for required in ExcelValidator.REQUIRED_COLUMNS:
            if required not in columns_lower:
                missing.append(required)

        return len(missing) == 0, missing

    @staticmethod
    def validate_row_data(row: dict, row_number: int) -> List[str]:
        """
        Validate a single row of data.

        Returns:
            List of validation error messages
        """
        errors = []

        # Validate name
        name = row.get("name", "").strip()
        if not name:
            errors.append(f"Row {row_number}: Name is required")
        elif len(name) > 200:
            errors.append(f"Row {row_number}: Name is too long (max 200 characters)")

        # Validate email if provided
        email = row.get("email", "").strip()
        if email and not PhoneValidator.is_valid_email(email):
            errors.append(f"Row {row_number}: Invalid email format")

        # Validate phone if provided
        phone = row.get("phone", "").strip()
        if phone and not PhoneValidator.is_valid_phone(phone):
            errors.append(f"Row {row_number}: Invalid phone format")

        # Validate side if provided
        side = row.get("side", "").strip().lower()
        if side and side not in ["groom", "bride", "both", ""]:
            errors.append(f"Row {row_number}: Side must be 'groom', 'bride', or 'both'")

        # Validate plus_ones if provided
        plus_ones = row.get("plus_ones", "")
        if plus_ones:
            try:
                plus_ones_int = int(plus_ones)
                if plus_ones_int < 0 or plus_ones_int > 10:
                    errors.append(f"Row {row_number}: Plus ones must be between 0 and 10")
            except ValueError:
                errors.append(f"Row {row_number}: Plus ones must be a number")

        return errors


class PhoneValidator:
    """Validates phone numbers and formats."""

    # Pattern for international phone numbers
    PHONE_PATTERN = re.compile(
        r"^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,3}[)]?[-\s\.]?[0-9]{3,4}[-\s\.]?[0-9]{3,4}$"
    )

    # Saudi Arabia phone patterns
    SAUDI_MOBILE_PATTERN = re.compile(r"^(?:\+966|966|0)?5[0-9]{8}$")
    SAUDI_LANDLINE_PATTERN = re.compile(r"^(?:\+966|966|0)?1[1-9][0-9]{7}$")

    # Email pattern
    EMAIL_PATTERN = re.compile(
        r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    )

    @staticmethod
    def is_valid_phone(phone: str) -> bool:
        """Check if phone number is valid."""
        if not phone:
            return False
        # Remove common separators for validation
        cleaned = re.sub(r"[\s\-\.\(\)]", "", phone)
        return bool(PhoneValidator.PHONE_PATTERN.match(cleaned))

    @staticmethod
    def is_valid_saudi_phone(phone: str) -> bool:
        """Check if phone number is a valid Saudi number."""
        if not phone:
            return False
        cleaned = re.sub(r"[\s\-\.\(\)]", "", phone)
        return bool(
            PhoneValidator.SAUDI_MOBILE_PATTERN.match(cleaned) or
            PhoneValidator.SAUDI_LANDLINE_PATTERN.match(cleaned)
        )

    @staticmethod
    def format_phone(phone: str, country_code: str = "+966") -> str:
        """
        Format phone number to international format.

        Args:
            phone: The phone number to format
            country_code: The country code to use (default: Saudi Arabia)

        Returns:
            Formatted phone number
        """
        if not phone:
            return ""

        # Remove all non-digit characters except +
        cleaned = re.sub(r"[^\d+]", "", phone)

        # If starts with 0, replace with country code
        if cleaned.startswith("0"):
            cleaned = country_code + cleaned[1:]

        # If doesn't start with +, add country code
        if not cleaned.startswith("+"):
            if cleaned.startswith(country_code.replace("+", "")):
                cleaned = "+" + cleaned
            else:
                cleaned = country_code + cleaned

        return cleaned

    @staticmethod
    def is_valid_email(email: str) -> bool:
        """Check if email is valid."""
        if not email:
            return False
        return bool(PhoneValidator.EMAIL_PATTERN.match(email.strip()))


class URLValidator:
    """Validates URLs."""

    URL_PATTERN = re.compile(
        r"^https?:\/\/"
        r"(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|"
        r"localhost|"
        r"\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})"
        r"(?::\d+)?"
        r"(?:/?|[/?]\S+)$",
        re.IGNORECASE
    )

    @staticmethod
    def is_valid_url(url: str) -> bool:
        """Check if URL is valid."""
        if not url:
            return False
        return bool(URLValidator.URL_PATTERN.match(url.strip()))

    @staticmethod
    def is_valid_https_url(url: str) -> bool:
        """Check if URL is valid and uses HTTPS."""
        if not url:
            return False
        return url.strip().lower().startswith("https://") and URLValidator.is_valid_url(url)

    @staticmethod
    def sanitize_url(url: str) -> str:
        """
        Sanitize a URL by removing potentially dangerous characters.

        Args:
            url: The URL to sanitize

        Returns:
            Sanitized URL
        """
        if not url:
            return ""

        # Remove whitespace
        url = url.strip()

        # Remove javascript: and data: URLs
        lower_url = url.lower()
        if lower_url.startswith("javascript:") or lower_url.startswith("data:"):
            return ""

        return url


class InputValidator:
    """General input validation utilities."""

    @staticmethod
    def sanitize_string(value: str, max_length: int = 1000) -> str:
        """
        Sanitize a string by trimming whitespace and limiting length.

        Args:
            value: The string to sanitize
            max_length: Maximum allowed length

        Returns:
            Sanitized string
        """
        if not value:
            return ""

        # Strip whitespace
        value = value.strip()

        # Limit length
        if len(value) > max_length:
            value = value[:max_length]

        return value

    @staticmethod
    def validate_required(value: Optional[str], field_name: str) -> str:
        """
        Validate that a required field has a value.

        Args:
            value: The value to validate
            field_name: Name of the field for error messages

        Returns:
            The value if valid

        Raises:
            ValidationException: If value is empty
        """
        if not value or not value.strip():
            raise ValidationException(
                detail=f"{field_name} is required",
                errors={field_name: "This field is required"}
            )
        return value.strip()

    @staticmethod
    def validate_length(
        value: str,
        field_name: str,
        min_length: int = 0,
        max_length: int = 1000
    ) -> str:
        """
        Validate string length.

        Args:
            value: The value to validate
            field_name: Name of the field for error messages
            min_length: Minimum allowed length
            max_length: Maximum allowed length

        Returns:
            The value if valid

        Raises:
            ValidationException: If length is out of bounds
        """
        length = len(value.strip())

        if length < min_length:
            raise ValidationException(
                detail=f"{field_name} must be at least {min_length} characters",
                errors={field_name: f"Must be at least {min_length} characters"}
            )

        if length > max_length:
            raise ValidationException(
                detail=f"{field_name} must be at most {max_length} characters",
                errors={field_name: f"Must be at most {max_length} characters"}
            )

        return value.strip()

    @staticmethod
    def validate_enum(value: str, field_name: str, allowed_values: List[str]) -> str:
        """
        Validate that value is one of allowed values.

        Args:
            value: The value to validate
            field_name: Name of the field for error messages
            allowed_values: List of allowed values

        Returns:
            The value if valid

        Raises:
            ValidationException: If value is not in allowed list
        """
        if value not in allowed_values:
            raise ValidationException(
                detail=f"{field_name} must be one of: {', '.join(allowed_values)}",
                errors={field_name: f"Must be one of: {', '.join(allowed_values)}"}
            )
        return value

    @staticmethod
    def validate_numeric_range(
        value: int,
        field_name: str,
        min_value: Optional[int] = None,
        max_value: Optional[int] = None
    ) -> int:
        """
        Validate that a number is within range.

        Args:
            value: The value to validate
            field_name: Name of the field for error messages
            min_value: Minimum allowed value
            max_value: Maximum allowed value

        Returns:
            The value if valid

        Raises:
            ValidationException: If value is out of range
        """
        if min_value is not None and value < min_value:
            raise ValidationException(
                detail=f"{field_name} must be at least {min_value}",
                errors={field_name: f"Must be at least {min_value}"}
            )

        if max_value is not None and value > max_value:
            raise ValidationException(
                detail=f"{field_name} must be at most {max_value}",
                errors={field_name: f"Must be at most {max_value}"}
            )

        return value
