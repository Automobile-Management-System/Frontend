// src/services/employeeTimeLogAPI.ts

import { EmployeeTimeLogResponse } from '@/types/employeeTimeLog';
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

  async getMyTimeLogs(): Promise<EmployeeTimeLogResponse> {
    return this.makeRequest<EmployeeTimeLogResponse>('/EmployeeTimeLog/my-logs');
  }
}

export const employeeTimeLogAPI = new EmployeeTimeLogAPI();