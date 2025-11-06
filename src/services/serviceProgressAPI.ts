import { 
  ServiceProgressDto, 
  AppointmentStatus, 
  TimerResponseDto, 
  TimeLogDto,
  AppointmentStatusEnum,
  ServiceTypeFromEnum,
  AppointmentStatusFromEnum
} from '../types/serviceProgress';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

class ServiceProgressAPI {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}/ServiceProgress${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData = null;
      
      try {
        errorData = JSON.parse(errorText);
      } catch {
        // If not JSON, keep as text
      }
      
      const errorMessage = errorData?.message || errorData?.error || errorText || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    return response.json();
  }

  async getEmployeeServiceProgress(employeeId: number): Promise<ServiceProgressDto[]> {
    const rawData = await this.request<any[]>(`/employee/${employeeId}`);
    
    // Convert numeric enums to string values for frontend use
    return rawData.map(item => ({
      ...item,
      status: AppointmentStatusFromEnum[item.status as keyof typeof AppointmentStatusFromEnum] || 'Pending',
      serviceType: ServiceTypeFromEnum[item.serviceType as keyof typeof ServiceTypeFromEnum] || 'Service',
      // TODO: Backend should provide customerId - using appointmentId as fallback for now
      customerId: item.customerId || item.appointmentId // Temporary fallback
    }));
  }

  // Try to get all appointments for an employee regardless of status
  async getAllEmployeeAppointments(employeeId: number): Promise<ServiceProgressDto[]> {
    try {
      // Try different potential endpoints that might return all appointments
      const endpoints = [
        `/employee/${employeeId}/all`,
        `/employee/${employeeId}?includeAll=true`,
        `/appointments/employee/${employeeId}`,
        `/all/employee/${employeeId}`
      ];

      for (const endpoint of endpoints) {
        try {
          const rawData = await this.request<any[]>(endpoint);
          
          // Convert numeric enums to string values for frontend use
          return rawData.map(item => ({
            ...item,
            status: AppointmentStatusFromEnum[item.status as keyof typeof AppointmentStatusFromEnum] || 'Pending',
            serviceType: ServiceTypeFromEnum[item.serviceType as keyof typeof ServiceTypeFromEnum] || 'Service',
            customerId: item.customerId || item.appointmentId
          }));
        } catch (error) {
          // Continue to next endpoint if this one fails
          continue;
        }
      }
      
      // If no special endpoint works, fall back to the original method
      return this.getEmployeeServiceProgress(employeeId);
    } catch (error) {
      // Fall back to original method if all fail
      return this.getEmployeeServiceProgress(employeeId);
    }
  }

  async getServiceProgressById(appointmentId: number): Promise<ServiceProgressDto> {
    return this.request<ServiceProgressDto>(`/appointment/${appointmentId}`);
  }

  async startTimer(appointmentId: number, userId: number): Promise<TimerResponseDto> {
    return this.request<TimerResponseDto>('/timer/start', {
      method: 'POST',
      body: JSON.stringify({ appointmentId, userId }),
    });
  }

  async pauseTimer(appointmentId: number, userId: number): Promise<TimerResponseDto> {
    return this.request<TimerResponseDto>('/timer/pause', {
      method: 'POST',
      body: JSON.stringify({ appointmentId, userId }),
    });
  }

  async stopTimer(appointmentId: number, userId: number): Promise<TimerResponseDto> {
    return this.request<TimerResponseDto>('/timer/stop', {
      method: 'POST',
      body: JSON.stringify({ appointmentId, userId }),
    });
  }

  async updateStatus(
    appointmentId: number, 
    newStatus: AppointmentStatus | number, 
    userId: number, 
    notes?: string
  ): Promise<void> {
    // Convert status to numeric enum for API
    const statusEnum = typeof newStatus === 'number' 
      ? newStatus 
      : AppointmentStatusEnum[newStatus];
    
    const requestBody = { 
      appointmentId, 
      newStatus: statusEnum, // API expects 'newStatus' field name with numeric value
      userId, 
      ...(notes && { notes }) // Only include notes if it's not empty
    };
    
    return this.request<void>('/status', {
      method: 'PUT',
      body: JSON.stringify(requestBody),
    });
  }

  async getActiveTimer(appointmentId: number, userId: number): Promise<TimeLogDto> {
    return this.request<TimeLogDto>(`/timer/active/${appointmentId}/${userId}`);
  }

  async getTotalLoggedTime(appointmentId: number): Promise<{ appointmentId: number; totalTimeLogged: number }> {
    return this.request<{ appointmentId: number; totalTimeLogged: number }>(`/time-logged/${appointmentId}`);
  }
}

export const serviceProgressAPI = new ServiceProgressAPI();