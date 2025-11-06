'use client'

import { useState, useEffect, useCallback } from 'react';
import { serviceProgressAPI } from '../services/serviceProgressAPI';
import { 
    ServiceProgressDto, 
    AppointmentStatus, 
    TimerResponseDto,
} from '../types/serviceProgress';

export const useServiceProgress = (employeeId: number) => {
    const [serviceProgress, setServiceProgress] = useState<ServiceProgressDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchServiceProgress = useCallback(async () => {
        try {
            setError(null);
            setLoading(true); 
            
            const appointments = await serviceProgressAPI.getEmployeeServiceProgress(employeeId);
            
            setServiceProgress(appointments);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch service progress');
        } finally {
            setLoading(false);
        }
    }, [employeeId]);

    const refreshData = useCallback(() => {
        fetchServiceProgress();
    }, [fetchServiceProgress]);

    const refreshPendingServices = useCallback(async () => {
        try {
            const data = await serviceProgressAPI.getEmployeeServiceProgress(employeeId);
            setServiceProgress(data); 
        } catch (err) {
            console.error("Silent refresh failed:", err);
        }
    }, [employeeId]);

    const startTimer = useCallback(async (appointmentId: number, userId: number): Promise<TimerResponseDto> => {
        try {
            // *** MODIFICATION START ***
            // Get the result from the API
            const result = await serviceProgressAPI.startTimer(appointmentId, userId);
            
            if (result.success && result.activeTimeLog) {
                // Update state immediately instead of waiting for refresh
                // This provides the new currentTimerStartTime instantly
                setServiceProgress(prevServices =>
                    prevServices.map(service =>
                        service.appointmentId === appointmentId
                            ? {
                                ...service,
                                isTimerActive: true,
                                currentTimerStartTime: result.activeTimeLog?.startDateTime, // Use the new time from the API
                                status: "InProgress" // Also update status locally
                              }
                            : service
                    )
                );
            } else {
                // If it failed or didn't return a log, refresh as a fallback
                refreshPendingServices();
            }
            return result;
            // *** MODIFICATION END ***
        } catch (error) {
            refreshPendingServices(); // Refresh on error
            throw error;
        }
    }, [refreshPendingServices]); // Keep dependency

    const pauseTimer = useCallback(async (appointmentId: number, userId: number): Promise<TimerResponseDto> => {
        try {
            const result = await serviceProgressAPI.pauseTimer(appointmentId, userId);
            
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
            refreshPendingServices(); 
            return result;
        } catch (error) {
            throw error;
        }
    }, [refreshPendingServices]);

    const stopTimerOnly = useCallback(async (appointmentId: number, userId: number): Promise<TimerResponseDto> => {
        try {
            const result = await serviceProgressAPI.stopTimer(appointmentId, userId);
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
            
            const statusFromNumber: { [key: number]: string } = {
                0: 'Pending',
                1: 'Upcoming',
                2: 'InProgress',
                3: 'Completed',
                4: 'Rejected'
            };

            const statusString = typeof newStatus === 'number'
                ? (statusFromNumber[newStatus] as AppointmentStatus) || 'Upcoming'
                : newStatus;
            
            setServiceProgress(prevServices => {
                const updatedServices = prevServices.map(service => 
                    service.appointmentId === appointmentId 
                    ? { ...service, status: statusString as AppointmentStatus }
                    : service
                );
                
                return updatedServices;
            });
        } catch (error) {
            throw error;
        }
    }, [employeeId]);

    useEffect(() => {
        if (employeeId) {
            fetchServiceProgress();
        }
    }, [employeeId, fetchServiceProgress]);

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
    };
};