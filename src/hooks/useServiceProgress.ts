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
            setLoading(true); // Set loading true on initial fetch
            
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

    // Smart refresh that fetches all data without showing a loading spinner
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
            const result = await serviceProgressAPI.startTimer(appointmentId, userId);
            refreshPendingServices(); 
            return result;
        } catch (error) {
            throw error;
        }
    }, [refreshPendingServices]);

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
            
            // Helper to convert number back to string for local state
            const statusFromNumber: { [key: number]: string } = {
                0: 'Pending',
                1: 'Upcoming',
                2: 'InProgress',
                3: 'Completed',
                4: 'Rejected'
            };

            // Convert number to string if needed, otherwise use the provided string
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