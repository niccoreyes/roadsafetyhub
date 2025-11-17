// Error Handling Utilities
import { toast } from '@/hooks/use-toast';

export enum FhirErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  CLIENT_ERROR = 'CLIENT_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  PARSING_ERROR = 'PARSING_ERROR',
}

export interface FhirError {
  type: FhirErrorType;
  message: string;
  status?: number;
  url?: string;
  originalError?: any;
}

/**
 * Handles FHIR errors and creates user-friendly messages
 */
export function handleFhirError(error: any, url?: string): FhirError {
  // Check if it's a network error
  if (error?.name === 'TypeError' && error?.message?.includes('fetch')) {
    return {
      type: FhirErrorType.NETWORK_ERROR,
      message: "Network error. Please check your connection and try again.",
      url,
      originalError: error,
    };
  }

  // Check if it's an abort error (timeout)
  if (error?.name === 'AbortError') {
    return {
      type: FhirErrorType.TIMEOUT_ERROR,
      message: "Request timeout. The server is taking too long to respond.",
      url,
      originalError: error,
    };
  }

  // Check if it's a response error with status
  if (error?.status) {
    const status = error.status;
    let message = `HTTP ${status} error`;
    
    switch (status) {
      case 401:
        message = "Authentication failed. Please check your credentials.";
        return {
          type: FhirErrorType.AUTH_ERROR,
          message,
          status,
          url,
          originalError: error,
        };
      case 403:
        message = "Access forbidden. You don't have permission to access this resource.";
        break;
      case 404:
        message = "Resource not found. The requested FHIR resource doesn't exist.";
        break;
      case 429:
        message = "Too many requests. Please wait before trying again.";
        break;
      case 500:
        message = "Internal server error. The FHIR server encountered an unexpected condition.";
        break;
      case 502:
        message = "Bad gateway. The FHIR server is temporarily unavailable.";
        break;
      case 503:
        message = "Service unavailable. The FHIR server is currently down for maintenance.";
        break;
      case 504:
        message = "Gateway timeout. The FHIR server did not respond in time.";
        break;
      default:
        if (status >= 400 && status < 500) {
          message = `Client error ${status}. Please verify your request parameters.`;
          return {
            type: FhirErrorType.CLIENT_ERROR,
            message,
            status,
            url,
            originalError: error,
          };
        } else if (status >= 500) {
          message = `Server error ${status}. The FHIR server encountered an issue.`;
          return {
            type: FhirErrorType.SERVER_ERROR,
            message,
            status,
            url,
            originalError: error,
          };
        }
    }
    
    return {
      type: FhirErrorType.CLIENT_ERROR,
      message,
      status,
      url,
      originalError: error,
    };
  }

  // Default case for other errors
  return {
    type: FhirErrorType.PARSING_ERROR,
    message: error?.message || "An unexpected error occurred while processing FHIR data",
    url,
    originalError: error,
  };
}

/**
 * Shows user-friendly toast notification for FHIR errors
 */
export function showErrorToast(fhirError: FhirError) {
  // Determine toast variant based on error type
  let variant: 'destructive' | 'default' = 'destructive';
  
  // Show toast with error info
  toast({
    title: getErrorTitle(fhirError.type),
    description: fhirError.message,
    variant,
  });
}

function getErrorTitle(errorType: FhirErrorType): string {
  switch (errorType) {
    case FhirErrorType.AUTH_ERROR:
      return "Authentication Error";
    case FhirErrorType.NETWORK_ERROR:
      return "Network Error";
    case FhirErrorType.TIMEOUT_ERROR:
      return "Timeout Error";
    case FhirErrorType.SERVER_ERROR:
      return "Server Error";
    case FhirErrorType.CLIENT_ERROR:
      return "Request Error";
    default:
      return "Error";
  }
}