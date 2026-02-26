/**
 * Error message mappings for user-friendly error display.
 */

export type Language = 'en';

// Error code to message mapping
const errorMessages: Record<string, string> = {
  // Authentication errors
  UNAUTHORIZED: 'Please log in to continue',
  TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
  INVALID_TOKEN: 'Invalid authentication. Please log in again.',
  INVALID_CREDENTIALS: 'Invalid email or password',
  FORBIDDEN: "You don't have permission to perform this action",

  // Not found errors
  NOT_FOUND: 'The requested resource was not found',
  GUEST_NOT_FOUND: 'Guest not found',
  WEDDING_NOT_FOUND: 'Wedding not found',
  INVALID_INVITATION_LINK: 'This invitation link is invalid or has expired',

  // Validation errors
  VALIDATION_ERROR: 'Please check your input and try again',
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid phone number',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters',
  PASSWORDS_DO_NOT_MATCH: 'Passwords do not match',

  // File upload errors
  FILE_TOO_LARGE: 'File is too large. Please select a smaller file.',
  INVALID_FILE_TYPE: 'Invalid file type. Please select a supported file format.',
  FILE_UPLOAD_ERROR: 'Failed to upload file. Please try again.',
  EMPTY_FILE: 'The uploaded file is empty',

  // Conflict errors
  CONFLICT: 'This resource already exists',
  EMAIL_ALREADY_EXISTS: 'An account with this email already exists',
  DUPLICATE_GUEST: 'A guest with this information already exists',

  // Network errors
  NETWORK_ERROR: 'Unable to connect. Please check your internet connection.',
  TIMEOUT: 'The request timed out. Please try again.',

  // Server errors
  INTERNAL_SERVER_ERROR: 'Something went wrong. Please try again later.',
  SERVICE_UNAVAILABLE: 'Service is temporarily unavailable. Please try again later.',
  DATABASE_ERROR: 'A database error occurred. Please try again.',

  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please wait a moment and try again.',

  // RSVP specific
  RSVP_ALREADY_SUBMITTED: 'You have already submitted your RSVP',
  RSVP_DEADLINE_PASSED: 'The RSVP deadline has passed',

  // Generic errors
  BAD_REQUEST: 'Invalid request. Please check your input.',
  UNKNOWN_ERROR: 'An unexpected error occurred',
};

// Success messages
export const successMessages: Record<string, string> = {
  // CRUD operations
  CREATE_SUCCESS: 'Created successfully',
  UPDATE_SUCCESS: 'Updated successfully',
  DELETE_SUCCESS: 'Deleted successfully',
  SAVE_SUCCESS: 'Saved successfully',

  // Authentication
  LOGIN_SUCCESS: 'Welcome back!',
  LOGOUT_SUCCESS: 'You have been logged out',
  REGISTER_SUCCESS: 'Account created successfully',

  // Guest actions
  RSVP_SUCCESS: 'Your RSVP has been submitted',
  GUEST_ADDED: 'Guest added successfully',
  GUEST_UPDATED: 'Guest updated successfully',
  GUEST_DELETED: 'Guest removed successfully',
  GUESTS_IMPORTED: 'Guests imported successfully',

  // File operations
  UPLOAD_SUCCESS: 'File uploaded successfully',
  EXPORT_SUCCESS: 'Export completed successfully',

  // Invitation
  INVITATION_SENT: 'Invitation sent successfully',
  LINK_COPIED: 'Link copied to clipboard',
};

/**
 * Get error message by code
 */
export function getErrorMessage(
  code: string,
  _language: Language = 'en',
  fallback?: string
): string {
  const message = errorMessages[code];
  if (message) {
    return message;
  }
  return fallback || errorMessages.UNKNOWN_ERROR;
}

/**
 * Get success message by code
 */
export function getSuccessMessage(
  code: string,
  _language: Language = 'en',
  fallback?: string
): string {
  const message = successMessages[code];
  if (message) {
    return message;
  }
  return fallback || 'Operation completed successfully';
}

/**
 * Get error message from API error response
 */
export function getApiErrorMessage(
  error: unknown,
  _language: Language = 'en'
): string {
  if (typeof error === 'object' && error !== null) {
    const apiError = error as {
      error_code?: string;
      detail?: string;
      message?: string;
    };

    // Try to get message from error code first
    if (apiError.error_code && errorMessages[apiError.error_code]) {
      return getErrorMessage(apiError.error_code);
    }

    // Fall back to detail or message
    if (apiError.detail) {
      return apiError.detail;
    }
    if (apiError.message) {
      return apiError.message;
    }
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  return getErrorMessage('UNKNOWN_ERROR');
}

/**
 * Get HTTP status based error message
 */
export function getStatusErrorMessage(
  status: number,
  _language: Language = 'en'
): string {
  const statusMessages: Record<number, string> = {
    400: 'BAD_REQUEST',
    401: 'UNAUTHORIZED',
    403: 'FORBIDDEN',
    404: 'NOT_FOUND',
    409: 'CONFLICT',
    422: 'VALIDATION_ERROR',
    429: 'RATE_LIMIT_EXCEEDED',
    500: 'INTERNAL_SERVER_ERROR',
    502: 'SERVICE_UNAVAILABLE',
    503: 'SERVICE_UNAVAILABLE',
    504: 'TIMEOUT',
  };

  const code = statusMessages[status] || 'UNKNOWN_ERROR';
  return getErrorMessage(code);
}

/**
 * Format validation errors from API
 */
export function formatValidationErrors(
  errors: Record<string, string> | Array<{ loc: string[]; msg: string }>,
  _language: Language = 'en'
): Record<string, string> {
  if (Array.isArray(errors)) {
    // Handle array format (Pydantic)
    return errors.reduce(
      (acc, err) => {
        const field = err.loc.filter((l) => l !== 'body').join('.');
        acc[field] = err.msg;
        return acc;
      },
      {} as Record<string, string>
    );
  }

  // Handle object format
  return errors;
}

export default errorMessages;
