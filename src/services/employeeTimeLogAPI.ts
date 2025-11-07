// src/services/employeeTimeLogAPI.ts

import { PaginatedEmployeeTimeLogResponse, TimeLogSearchParams } from '@/types/employeeTimeLog';
import { ApiError, handleApiError } from '@/lib/apiUtils';
import { config } from '@/lib/config';

class EmployeeTimeLogAPI {
  private async makeRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${config.apiBaseUrl}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new ApiError(
          errorData?.message || `HTTP error! status: ${response.status}`,
          response.status,
          errorData
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your connection and try again.');
      }
      
      console.error(`API call failed for ${endpoint}:`, error);
      throw new Error(handleApiError(error));
    }
  }

  private buildQueryString(params: TimeLogSearchParams): string {
    const searchParams = new URLSearchParams();
    
    // Set defaults to match backend defaults
    const pageNumber = params.pageNumber || 1;
    const pageSize = params.pageSize || 10;
    
    searchParams.append('pageNumber', pageNumber.toString());
    searchParams.append('pageSize', pageSize.toString());
    
    if (params.search && params.search.trim()) {
      searchParams.append('search', params.search.trim());
    }
    
    return searchParams.toString();
  }

  async getMyTimeLogs(params: TimeLogSearchParams = {}): Promise<PaginatedEmployeeTimeLogResponse> {
    const queryString = this.buildQueryString(params);
    const endpoint = `/EmployeeTimeLog/history${queryString ? `?${queryString}` : ''}`;
    return this.makeRequest<PaginatedEmployeeTimeLogResponse>(endpoint);
  }
}

export const employeeTimeLogAPI = new EmployeeTimeLogAPI();