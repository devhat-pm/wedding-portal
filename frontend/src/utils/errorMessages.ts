/**
 * Error message mappings for user-friendly error display.
 * Supports English and Arabic messages.
 */

export type Language = 'en' | 'ar';

interface ErrorMessageConfig {
  en: string;
  ar: string;
}

// Error code to message mapping
const errorMessages: Record<string, ErrorMessageConfig> = {
  // Authentication errors
  UNAUTHORIZED: {
    en: 'Please log in to continue',
    ar: 'يرجى تسجيل الدخول للمتابعة',
  },
  TOKEN_EXPIRED: {
    en: 'Your session has expired. Please log in again.',
    ar: 'انتهت صلاحية جلستك. يرجى تسجيل الدخول مرة أخرى.',
  },
  INVALID_TOKEN: {
    en: 'Invalid authentication. Please log in again.',
    ar: 'مصادقة غير صالحة. يرجى تسجيل الدخول مرة أخرى.',
  },
  INVALID_CREDENTIALS: {
    en: 'Invalid email or password',
    ar: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
  },
  FORBIDDEN: {
    en: "You don't have permission to perform this action",
    ar: 'ليس لديك صلاحية لتنفيذ هذا الإجراء',
  },

  // Not found errors
  NOT_FOUND: {
    en: 'The requested resource was not found',
    ar: 'المورد المطلوب غير موجود',
  },
  GUEST_NOT_FOUND: {
    en: 'Guest not found',
    ar: 'الضيف غير موجود',
  },
  WEDDING_NOT_FOUND: {
    en: 'Wedding not found',
    ar: 'الحفل غير موجود',
  },
  INVALID_INVITATION_LINK: {
    en: 'This invitation link is invalid or has expired',
    ar: 'رابط الدعوة هذا غير صالح أو منتهي الصلاحية',
  },

  // Validation errors
  VALIDATION_ERROR: {
    en: 'Please check your input and try again',
    ar: 'يرجى التحقق من المدخلات والمحاولة مرة أخرى',
  },
  REQUIRED_FIELD: {
    en: 'This field is required',
    ar: 'هذا الحقل مطلوب',
  },
  INVALID_EMAIL: {
    en: 'Please enter a valid email address',
    ar: 'يرجى إدخال بريد إلكتروني صالح',
  },
  INVALID_PHONE: {
    en: 'Please enter a valid phone number',
    ar: 'يرجى إدخال رقم هاتف صالح',
  },
  PASSWORD_TOO_SHORT: {
    en: 'Password must be at least 8 characters',
    ar: 'يجب أن تتكون كلمة المرور من 8 أحرف على الأقل',
  },
  PASSWORDS_DO_NOT_MATCH: {
    en: 'Passwords do not match',
    ar: 'كلمات المرور غير متطابقة',
  },

  // File upload errors
  FILE_TOO_LARGE: {
    en: 'File is too large. Please select a smaller file.',
    ar: 'الملف كبير جدًا. يرجى اختيار ملف أصغر.',
  },
  INVALID_FILE_TYPE: {
    en: 'Invalid file type. Please select a supported file format.',
    ar: 'نوع الملف غير صالح. يرجى اختيار تنسيق ملف مدعوم.',
  },
  FILE_UPLOAD_ERROR: {
    en: 'Failed to upload file. Please try again.',
    ar: 'فشل في تحميل الملف. يرجى المحاولة مرة أخرى.',
  },
  EMPTY_FILE: {
    en: 'The uploaded file is empty',
    ar: 'الملف المحمل فارغ',
  },

  // Conflict errors
  CONFLICT: {
    en: 'This resource already exists',
    ar: 'هذا المورد موجود بالفعل',
  },
  EMAIL_ALREADY_EXISTS: {
    en: 'An account with this email already exists',
    ar: 'يوجد حساب بهذا البريد الإلكتروني بالفعل',
  },
  DUPLICATE_GUEST: {
    en: 'A guest with this information already exists',
    ar: 'يوجد ضيف بهذه المعلومات بالفعل',
  },

  // Network errors
  NETWORK_ERROR: {
    en: 'Unable to connect. Please check your internet connection.',
    ar: 'تعذر الاتصال. يرجى التحقق من اتصالك بالإنترنت.',
  },
  TIMEOUT: {
    en: 'The request timed out. Please try again.',
    ar: 'انتهت مهلة الطلب. يرجى المحاولة مرة أخرى.',
  },

  // Server errors
  INTERNAL_SERVER_ERROR: {
    en: 'Something went wrong. Please try again later.',
    ar: 'حدث خطأ ما. يرجى المحاولة مرة أخرى لاحقًا.',
  },
  SERVICE_UNAVAILABLE: {
    en: 'Service is temporarily unavailable. Please try again later.',
    ar: 'الخدمة غير متاحة مؤقتًا. يرجى المحاولة مرة أخرى لاحقًا.',
  },
  DATABASE_ERROR: {
    en: 'A database error occurred. Please try again.',
    ar: 'حدث خطأ في قاعدة البيانات. يرجى المحاولة مرة أخرى.',
  },

  // Rate limiting
  RATE_LIMIT_EXCEEDED: {
    en: 'Too many requests. Please wait a moment and try again.',
    ar: 'طلبات كثيرة جدًا. يرجى الانتظار لحظة والمحاولة مرة أخرى.',
  },

  // RSVP specific
  RSVP_ALREADY_SUBMITTED: {
    en: 'You have already submitted your RSVP',
    ar: 'لقد قمت بالفعل بإرسال تأكيد الحضور',
  },
  RSVP_DEADLINE_PASSED: {
    en: 'The RSVP deadline has passed',
    ar: 'انتهى الموعد النهائي لتأكيد الحضور',
  },

  // Generic errors
  BAD_REQUEST: {
    en: 'Invalid request. Please check your input.',
    ar: 'طلب غير صالح. يرجى التحقق من المدخلات.',
  },
  UNKNOWN_ERROR: {
    en: 'An unexpected error occurred',
    ar: 'حدث خطأ غير متوقع',
  },
};

// Success messages
export const successMessages: Record<string, ErrorMessageConfig> = {
  // CRUD operations
  CREATE_SUCCESS: {
    en: 'Created successfully',
    ar: 'تم الإنشاء بنجاح',
  },
  UPDATE_SUCCESS: {
    en: 'Updated successfully',
    ar: 'تم التحديث بنجاح',
  },
  DELETE_SUCCESS: {
    en: 'Deleted successfully',
    ar: 'تم الحذف بنجاح',
  },
  SAVE_SUCCESS: {
    en: 'Saved successfully',
    ar: 'تم الحفظ بنجاح',
  },

  // Authentication
  LOGIN_SUCCESS: {
    en: 'Welcome back!',
    ar: 'مرحبًا بعودتك!',
  },
  LOGOUT_SUCCESS: {
    en: 'You have been logged out',
    ar: 'تم تسجيل خروجك',
  },
  REGISTER_SUCCESS: {
    en: 'Account created successfully',
    ar: 'تم إنشاء الحساب بنجاح',
  },

  // Guest actions
  RSVP_SUCCESS: {
    en: 'Your RSVP has been submitted',
    ar: 'تم إرسال تأكيد حضورك',
  },
  GUEST_ADDED: {
    en: 'Guest added successfully',
    ar: 'تمت إضافة الضيف بنجاح',
  },
  GUEST_UPDATED: {
    en: 'Guest updated successfully',
    ar: 'تم تحديث بيانات الضيف بنجاح',
  },
  GUEST_DELETED: {
    en: 'Guest removed successfully',
    ar: 'تمت إزالة الضيف بنجاح',
  },
  GUESTS_IMPORTED: {
    en: 'Guests imported successfully',
    ar: 'تم استيراد الضيوف بنجاح',
  },

  // File operations
  UPLOAD_SUCCESS: {
    en: 'File uploaded successfully',
    ar: 'تم تحميل الملف بنجاح',
  },
  EXPORT_SUCCESS: {
    en: 'Export completed successfully',
    ar: 'اكتمل التصدير بنجاح',
  },

  // Invitation
  INVITATION_SENT: {
    en: 'Invitation sent successfully',
    ar: 'تم إرسال الدعوة بنجاح',
  },
  LINK_COPIED: {
    en: 'Link copied to clipboard',
    ar: 'تم نسخ الرابط',
  },
};

/**
 * Get error message by code
 */
export function getErrorMessage(
  code: string,
  language: Language = 'en',
  fallback?: string
): string {
  const message = errorMessages[code];
  if (message) {
    return message[language];
  }
  return fallback || errorMessages.UNKNOWN_ERROR[language];
}

/**
 * Get success message by code
 */
export function getSuccessMessage(
  code: string,
  language: Language = 'en',
  fallback?: string
): string {
  const message = successMessages[code];
  if (message) {
    return message[language];
  }
  return fallback || 'Operation completed successfully';
}

/**
 * Get error message from API error response
 */
export function getApiErrorMessage(
  error: unknown,
  language: Language = 'en'
): string {
  if (typeof error === 'object' && error !== null) {
    const apiError = error as {
      error_code?: string;
      detail?: string;
      message?: string;
    };

    // Try to get message from error code first
    if (apiError.error_code && errorMessages[apiError.error_code]) {
      return getErrorMessage(apiError.error_code, language);
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

  return getErrorMessage('UNKNOWN_ERROR', language);
}

/**
 * Get HTTP status based error message
 */
export function getStatusErrorMessage(
  status: number,
  language: Language = 'en'
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
  return getErrorMessage(code, language);
}

/**
 * Format validation errors from API
 */
export function formatValidationErrors(
  errors: Record<string, string> | Array<{ loc: string[]; msg: string }>,
  language: Language = 'en'
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
