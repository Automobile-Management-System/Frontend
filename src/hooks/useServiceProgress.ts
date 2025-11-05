'use client'

import { useState, useEffect, useCallback } from 'react';
import { serviceProgressAPI } from '../services/serviceProgressAPI';
import { 
  ServiceProgressDto, 
  AppointmentStatus, 
  TimerResponseDto,
  AppointmentStatusFromEnum
} from '../types/serviceProgress';

export const useServiceProgress = (employeeId: number) => {
  const [serviceProgress, setServiceProgress] = useState<ServiceProgressDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper functions for localStorage - now handles all non-pending services
  const getStorageKey = () => `nonPendingServices_employee_${employeeId}`;
  
  const getStoredNonPendingServices = (): ServiceProgressDto[] => {
    try {
      const stored = localStorage.getItem(getStorageKey());
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const storeNonPendingServices = (nonPendingServices: ServiceProgressDto[]) => {
    try {
      // Only keep services from the last 7 days to prevent localStorage bloat
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentServices = nonPendingServices.filter(service => {
        try {
          const appointmentDate = new Date(service.appointmentDateTime);
          return appointmentDate > sevenDaysAgo;
        } catch {
          return true; // Keep if date parsing fails
        }
      });
      
      localStorage.setItem(getStorageKey(), JSON.stringify(recentServices));
    } catch {
      // Ignore storage errors
    }
  };

  const fetchServiceProgress = useCallback(async () => {
    try {
      setError(null);
      
      // Try to get all appointments first, fall back to pending-only if needed
      const allAppointments = await serviceProgressAPI.getAllEmployeeAppointments(employeeId);
      
      // Get stored non-pending services from localStorage
      const storedNonPendingServices = getStoredNonPendingServices();
      
      // If we got all appointments from API, use them as primary source
      let primaryServices = allAppointments;
      
      // Merge with localStorage - prioritize API data, add any missing from localStorage
      const finalServices = [...primaryServices];
      
      // Add any services from localStorage that aren't in the API response
      storedNonPendingServices.forEach(storedService => {
        const existsInAPI = finalServices.some(apiService => apiService.appointmentId === storedService.appointmentId);
        if (!existsInAPI) {
          finalServices.push(storedService);
        }
      });
      
      // Store all non-pending services from the final merged list in localStorage
      // This ensures persistence across page refreshes
      const nonPendingServices = finalServices.filter(service => service.status !== 'Pending');
      if (nonPendingServices.length > 0) {
        storeNonPendingServices(nonPendingServices);
      }
      
      setServiceProgress(finalServices);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch service progress');
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  const refreshData = useCallback(() => {
    fetchServiceProgress();
  }, [fetchServiceProgress]);

  // Smart refresh that only updates pending services without losing non-pending ones
  const refreshPendingServices = useCallback(async () => {
    try {
      const data = await serviceProgressAPI.getEmployeeServiceProgress(employeeId);
      
      // Update only pending services, keep existing non-pending services
      setServiceProgress(prevServices => {
        // Get current non-pending services
        const existingNonPending = prevServices.filter(service => service.status !== 'Pending');
        
        // Update or add pending services from API
        const updatedServices = [...existingNonPending];
        
        data.forEach(apiService => {
          const existingIndex = updatedServices.findIndex(s => s.appointmentId === apiService.appointmentId);
          if (existingIndex >= 0) {
            // Update existing service with fresh data from API
            updatedServices[existingIndex] = apiService;
          } else {
            // Add new pending service
            updatedServices.push(apiService);
          }
        });
        
        return updatedServices;
      });
    } catch (err) {
      // Silently handle refresh errors to avoid disrupting user experience
    }
  }, [employeeId]);

  const startTimer = useCallback(async (appointmentId: number, userId: number): Promise<TimerResponseDto> => {
    try {
      const result = await serviceProgressAPI.startTimer(appointmentId, userId);
      // Update only the specific service's timer state without losing other services
      setServiceProgress(prevServices => 
        prevServices.map(service => 
          service.appointmentId === appointmentId 
            ? { ...service, isTimerActive: true, currentTimerStartTime: new Date().toISOString() }
            : service
        )
      );
      return result;
    } catch (error) {
      throw error;
    }
  }, []);

  const pauseTimer = useCallback(async (appointmentId: number, userId: number): Promise<TimerResponseDto> => {
    try {
      const result = await serviceProgressAPI.pauseTimer(appointmentId, userId);
      // Update only the specific service's timer state without losing other services
      setServiceProgress(prevServices => 
        prevServices.map(service => 
          service.appointmentId === appointmentId 
            ? { ...service, isTimerActive: false, currentTimerStartTime: undefined }
            : service
        )
      );
      return result;
    } catch (error) {
      throw error;
    }
  }, []);

  const stopTimer = useCallback(async (appointmentId: number, userId: number): Promise<TimerResponseDto> => {
    try {
      const result = await serviceProgressAPI.stopTimer(appointmentId, userId);
      // Update only the specific service's timer state without losing other services
      setServiceProgress(prevServices => 
        prevServices.map(service => 
          service.appointmentId === appointmentId 
            ? { ...service, isTimerActive: false, currentTimerStartTime: undefined }
            : service
        )
      );
      return result;
    } catch (error) {
      throw error;
    }
  }, []);

  const stopTimerOnly = useCallback(async (appointmentId: number, userId: number): Promise<TimerResponseDto> => {
    try {
      const result = await serviceProgressAPI.stopTimer(appointmentId, userId);
      // Don't refresh data - let caller handle state updates
      return result;
    } catch (error) {
      throw error;
    }
  }, []);

  const updateStatus = useCallback(async (
    appointmentId: number, 
    newStatus: AppointmentStatus | number, 
    notes?: string
  ): Promise<void> => {
    try {
      await serviceProgressAPI.updateStatus(appointmentId, newStatus, employeeId, notes);
      
      // Update the local state for all status changes to keep services visible
      setServiceProgress(prevServices => {
        // Convert numeric status to string status for local state
        const statusString = typeof newStatus === 'number' 
          ? AppointmentStatusFromEnum[newStatus as keyof typeof AppointmentStatusFromEnum] || 'Pending'
          : newStatus;
          
        const updatedServices = prevServices.map(service => 
          service.appointmentId === appointmentId 
            ? { ...service, status: statusString as AppointmentStatus }
            : service
        );
        
        // Store all non-pending services in localStorage
        const nonPendingServices = updatedServices.filter(service => service.status !== 'Pending');
        storeNonPendingServices(nonPendingServices);
        
        return updatedServices;
      });
    } catch (error) {
      throw error;
    }
  }, [employeeId]);

  useEffect(() => {
    fetchServiceProgress();
  }, [fetchServiceProgress]);

  // Helper function to clear non-pending services (useful for testing)
  const clearNonPendingServices = useCallback(() => {
    try {
      localStorage.removeItem(getStorageKey());
      fetchServiceProgress(); // Refresh to show only active services
    } catch {
      // Ignore storage errors
    }
  }, [fetchServiceProgress]);

  return {
    serviceProgress,
    loading,
    error,
    startTimer,
    pauseTimer,
    stopTimer,
    stopTimerOnly,
    updateStatus,
    refreshData,
    refreshPendingServices,
    clearNonPendingServices
  };
};