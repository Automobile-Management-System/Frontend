'use client'

import { useState, useEffect, useCallback } from 'react';
import { serviceProgressAPI } from '../services/serviceProgressAPI';
import { ServiceProgressDto, AppointmentStatus, TimerResponseDto } from '../types/serviceProgress';

export const useServiceProgress = (employeeId: number) => {
  const [serviceProgress, setServiceProgress] = useState<ServiceProgressDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper functions for localStorage
  const getStorageKey = () => `completedServices_employee_${employeeId}`;
  
  const getStoredCompletedServices = (): ServiceProgressDto[] => {
    try {
      const stored = localStorage.getItem(getStorageKey());
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const storeCompletedServices = (completedServices: ServiceProgressDto[]) => {
    try {
      // Only keep completed services from the last 7 days to prevent localStorage bloat
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentCompleted = completedServices.filter(service => {
        try {
          const appointmentDate = new Date(service.appointmentDateTime);
          return appointmentDate > sevenDaysAgo;
        } catch {
          return true; // Keep if date parsing fails
        }
      });
      
      localStorage.setItem(getStorageKey(), JSON.stringify(recentCompleted));
    } catch {
      // Ignore storage errors
    }
  };

  const fetchServiceProgress = useCallback(async () => {
    try {
      setError(null);
      const data = await serviceProgressAPI.getEmployeeServiceProgress(employeeId);

      // Get stored completed services from localStorage
      const storedCompletedServices = getStoredCompletedServices();
      
      // Merge active services from API with stored completed services
      const activeServices = data;
      
      // Remove any duplicates between active and completed services
      const filteredCompleted = storedCompletedServices.filter(
        completed => !activeServices.some(active => active.appointmentId === completed.appointmentId)
      );
      
      const mergedServices = [...activeServices, ...filteredCompleted];
      setServiceProgress(mergedServices);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch service progress');
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  const refreshData = useCallback(() => {
    fetchServiceProgress();
  }, [fetchServiceProgress]);

  const startTimer = useCallback(async (appointmentId: number, userId: number): Promise<TimerResponseDto> => {
    try {
      const result = await serviceProgressAPI.startTimer(appointmentId, userId);
      await fetchServiceProgress(); // Refresh data
      return result;
    } catch (error) {
      throw error;
    }
  }, [fetchServiceProgress]);

  const pauseTimer = useCallback(async (appointmentId: number, userId: number): Promise<TimerResponseDto> => {
    try {
      const result = await serviceProgressAPI.pauseTimer(appointmentId, userId);
      await fetchServiceProgress(); // Refresh data
      return result;
    } catch (error) {
      throw error;
    }
  }, [fetchServiceProgress]);

  const stopTimer = useCallback(async (appointmentId: number, userId: number): Promise<TimerResponseDto> => {
    try {
      const result = await serviceProgressAPI.stopTimer(appointmentId, userId);
      await fetchServiceProgress(); // Refresh data
      return result;
    } catch (error) {
      throw error;
    }
  }, [fetchServiceProgress]);

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
    newStatus: AppointmentStatus, 
    notes?: string
  ): Promise<void> => {
    try {
      await serviceProgressAPI.updateStatus(appointmentId, newStatus, employeeId, notes);
      
      // If marking as completed, update the local state and store in localStorage
      if (newStatus === 'Completed') {
        setServiceProgress(prevServices => {
          const updatedServices = prevServices.map(service => 
            service.appointmentId === appointmentId 
              ? { ...service, status: 'Completed' as AppointmentStatus }
              : service
          );
          
          // Store completed services in localStorage
          const completedServices = updatedServices.filter(service => service.status === 'Completed');
          storeCompletedServices(completedServices);
          
          return updatedServices;
        });
      } else {
        // For other status updates, refresh from API
        await fetchServiceProgress();
      }
    } catch (error) {
      throw error;
    }
  }, [employeeId, fetchServiceProgress]);

  useEffect(() => {
    fetchServiceProgress();
  }, [fetchServiceProgress]);

  // Helper function to clear completed services (useful for testing)
  const clearCompletedServices = useCallback(() => {
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
    clearCompletedServices
  };
};