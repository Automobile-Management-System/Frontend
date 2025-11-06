import { 
  ServiceProgressDto, 
  AppointmentStatus, 
  TimerResponseDto, 
  TimeLogDto,
  AppointmentStatusEnum,
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
      
      // Data is already in string format from the backend, no mapping needed.
      return rawData.map(item => ({
          ...item,
          // status: item.status (already a string)
          // serviceType: item.serviceType (already a string)
          customerId: item.customerId || item.appointmentId 
      }));
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
      // Convert status string back to numeric enum for API
      const statusEnum = typeof newStatus === 'number' 
          ? newStatus 
          : AppointmentStatusEnum[newStatus as keyof typeof AppointmentStatusEnum]; // Use the corrected enum
      
      const requestBody = { 
          appointmentId, 
          newStatus: statusEnum, // API expects 'newStatus' field name with numeric value
          userId, 
          ...(notes && { notes }) 
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