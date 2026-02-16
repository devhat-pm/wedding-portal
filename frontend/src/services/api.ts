import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiError } from '../types';
import { getApiErrorMessage, getStatusErrorMessage } from '../utils/errorMessages';

// Base URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance with base configuration
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor to attach JWT token from localStorage
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    // Handle network errors (no response)
    if (!error.response) {
      const networkError: ApiError = {
        detail: error.message === 'Network Error'
          ? 'Unable to connect to the server. Please check your internet connection.'
          : error.message || 'A network error occurred',
        error_code: 'NETWORK_ERROR',
        status_code: 0,
      };
      return Promise.reject(networkError);
    }

    // Handle timeout
    if (error.code === 'ECONNABORTED') {
      const timeoutError: ApiError = {
        detail: 'Request timed out. Please try again.',
        error_code: 'TIMEOUT',
        status_code: 408,
      };
      return Promise.reject(timeoutError);
    }

    const status = error.response.status;
    const data = error.response.data;

    // Handle 401 Unauthorized
    if (status === 401) {
      // Check if it's a token expiration
      const errorCode = data?.error_code || 'UNAUTHORIZED';

      // Clear auth data
      localStorage.removeItem('access_token');
      localStorage.removeItem('wedding_id');

      // Only redirect if not already on login page and not guest portal
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login') && !currentPath.startsWith('/guest/')) {
        // Store the current path for redirect after login
        sessionStorage.setItem('redirectAfterLogin', currentPath);
        window.location.href = '/admin/login';
      }

      const authError: ApiError = {
        detail: data?.detail || 'Your session has expired. Please log in again.',
        error_code: errorCode,
        status_code: status,
      };
      return Promise.reject(authError);
    }

    // Handle 403 Forbidden
    if (status === 403) {
      const forbiddenError: ApiError = {
        detail: data?.detail || "You don't have permission to perform this action.",
        error_code: data?.error_code || 'FORBIDDEN',
        status_code: status,
      };
      return Promise.reject(forbiddenError);
    }

    // Handle 404 Not Found
    if (status === 404) {
      const notFoundError: ApiError = {
        detail: data?.detail || 'The requested resource was not found.',
        error_code: data?.error_code || 'NOT_FOUND',
        status_code: status,
      };
      return Promise.reject(notFoundError);
    }

    // Handle 422 Validation Error
    if (status === 422) {
      const validationError: ApiError = {
        detail: data?.detail || 'Please check your input and try again.',
        error_code: data?.error_code || 'VALIDATION_ERROR',
        status_code: status,
        errors: data?.errors,
      };
      return Promise.reject(validationError);
    }

    // Handle 429 Rate Limit
    if (status === 429) {
      const rateLimitError: ApiError = {
        detail: data?.detail || 'Too many requests. Please wait a moment and try again.',
        error_code: 'RATE_LIMIT_EXCEEDED',
        status_code: status,
      };
      return Promise.reject(rateLimitError);
    }

    // Handle 5xx Server Errors
    if (status >= 500) {
      const serverError: ApiError = {
        detail: data?.detail || 'Something went wrong on our end. Please try again later.',
        error_code: data?.error_code || 'INTERNAL_SERVER_ERROR',
        status_code: status,
      };
      return Promise.reject(serverError);
    }

    // Default error handling
    const apiError: ApiError = {
      detail: data?.detail || error.message || 'An error occurred',
      error_code: data?.error_code || `HTTP_${status}`,
      status_code: status,
      errors: data?.errors,
    };

    return Promise.reject(apiError);
  }
);

export default api;

// Helper to create FormData for file uploads
export const createFormData = (data: Record<string, unknown>): FormData => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (value instanceof File) {
        formData.append(key, value);
      } else if (value instanceof FileList) {
        Array.from(value).forEach((file) => {
          formData.append(key, file);
        });
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (item instanceof File) {
            formData.append(key, item);
          } else {
            formData.append(`${key}[${index}]`, JSON.stringify(item));
          }
        });
      } else if (typeof value === 'object') {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    }
  });

  return formData;
};

// Helper to check if error is a specific type
export const isNetworkError = (error: unknown): boolean => {
  return (error as ApiError)?.error_code === 'NETWORK_ERROR';
};

export const isAuthError = (error: unknown): boolean => {
  const code = (error as ApiError)?.error_code;
  return code === 'UNAUTHORIZED' || code === 'TOKEN_EXPIRED' || code === 'INVALID_TOKEN';
};

export const isValidationError = (error: unknown): boolean => {
  return (error as ApiError)?.error_code === 'VALIDATION_ERROR';
};

export const isNotFoundError = (error: unknown): boolean => {
  return (error as ApiError)?.error_code === 'NOT_FOUND';
};

export const isForbiddenError = (error: unknown): boolean => {
  return (error as ApiError)?.error_code === 'FORBIDDEN';
};

export const isServerError = (error: unknown): boolean => {
  const status = (error as ApiError)?.status_code;
  return status !== undefined && status >= 500;
};

// Get user-friendly error message
export const getErrorMessage = (error: unknown): string => {
  return getApiErrorMessage(error);
};

// Extract validation errors from API response
export const getValidationErrors = (error: unknown): Record<string, string> => {
  const apiError = error as ApiError;
  return apiError?.errors || {};
};
