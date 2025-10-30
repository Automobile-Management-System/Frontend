import { 
  EmployeeDashboardStats, 
  InProgressAppointments, 
  CompletedServiceCount,
  CompletedModificationCount,
  RecentServicesResponse, 
  RecentModificationsResponse 
} from '@/types/employeeDashboard';
import { ApiError, handleApiError } from '@/lib/apiUtils';
import { config } from '@/lib/config';

class EmployeeDashboardAPI {
  private async makeRequest<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${config.apiBaseUrl}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
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

  async getTodayUpcomingAppointments(): Promise<EmployeeDashboardStats> {
    return this.makeRequest<EmployeeDashboardStats>('/EmployeeDashboard/appointments/today/upcoming-count');
  }

  async getInProgressAppointments(): Promise<InProgressAppointments> {
    return this.makeRequest<InProgressAppointments>('/EmployeeDashboard/appointments/inprogress-count');
  }

  async getCompletedServiceCount(): Promise<CompletedServiceCount> {
    return this.makeRequest<CompletedServiceCount>('/EmployeeDashboard/appointments/completed/services-count');
  }

  async getCompletedModificationCount(): Promise<CompletedModificationCount> {
    return this.makeRequest<CompletedModificationCount>('/EmployeeDashboard/appointments/completed/modifications-count');
  }

  async getTodayRecentServices(): Promise<RecentServicesResponse> {
    return this.makeRequest<RecentServicesResponse>('/EmployeeDashboard/appointments/today/recent-services');
  }

  async getTodayRecentModifications(): Promise<RecentModificationsResponse> {
    return this.makeRequest<RecentModificationsResponse>('/EmployeeDashboard/appointments/today/recent-modifications');
  }
}

export const employeeDashboardAPI = new EmployeeDashboardAPI();