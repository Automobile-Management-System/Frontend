export class ApiError extends Error {
  public status: number;
  public data?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export const handleApiError = (error: any): string => {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 401:
        return 'Authentication failed. Please login again.';
      case 403:
        return 'Access denied. You do not have permission to view this data.';
      case 404:
        return 'Resource not found.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  }
  
  if (error.message?.includes('fetch')) {
    return 'Network error. Please check your connection and try again.';
  }
  
  return error.message || 'An unexpected error occurred.';
};

export const formatApiDate = (dateString?: string | null): string => {
  if (!dateString) return 'No date';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  } catch {
    return dateString;
  }
};

export const formatApiTime = (timeString?: string | null): string => {
  if (!timeString) return 'No time';
  
  try {
    const time = new Date(timeString);
    if (isNaN(time.getTime())) return 'Invalid time';
    
    return time.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  } catch {
    return timeString;
  }
};