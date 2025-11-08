"use client";

import { useState, useEffect, useCallback } from "react";
import { serviceProgressAPI } from "../services/serviceProgressAPI";
import {
  ServiceProgressDto,
  AppointmentStatus,
  TimerResponseDto,
} from "../types/serviceProgress";

export const useServiceProgress = (employeeId: number) => {
  const [serviceProgress, setServiceProgress] = useState<ServiceProgressDto[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServiceProgress = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      const appointments =
        await serviceProgressAPI.getEmployeeServiceProgress(employeeId);

      setServiceProgress(appointments);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch service progress"
      );
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  const refreshData = useCallback(() => {
    fetchServiceProgress();
  }, [fetchServiceProgress]);

  const refreshPendingServices = useCallback(async () => {
    try {
      const data =
        await serviceProgressAPI.getEmployeeServiceProgress(employeeId);
      setServiceProgress(data);
    } catch (err) {
      console.error("Silent refresh failed:", err);
    }
  }, [employeeId]);

  const startTimer = useCallback(
    async (
      appointmentId: number,
      userId: number
    ): Promise<TimerResponseDto> => {
      try {
        const result = await serviceProgressAPI.startTimer(appointmentId, userId);

        if (result.success) {
          const startTime =
            result.activeTimeLog?.startDateTime || new Date().toISOString();

          setServiceProgress((prevServices) =>
            prevServices.map((service) =>
              service.appointmentId === appointmentId
                ? {
                    ...service,
                    isTimerActive: true,
                    currentTimerStartTime: startTime,
                    status: "InProgress",
                  }
                : service
            )
          );
        } else {
          throw new Error(result.message || "Failed to start timer");
        }
        return result;
      } catch (error) {
        refreshPendingServices();
        throw error;
      }
    },
    [refreshPendingServices]
  );

  // --- MODIFICATION START ---
  // Updated pauseTimer to use the totalTimeLogged from the API response
  const pauseTimer = useCallback(
    async (
      appointmentId: number,
      userId: number
    ): Promise<TimerResponseDto> => {
      try {
        const result = await serviceProgressAPI.pauseTimer(appointmentId, userId);

        if (result.success) {
          setServiceProgress((prevServices) =>
            prevServices.map((service) =>
              service.appointmentId === appointmentId
                ? {
                    ...service,
                    isTimerActive: false,
                    currentTimerStartTime: undefined,
                    // Use the new total time from the API response
                    totalTimeLogged: result.totalTimeLogged,
                  }
                : service
            )
          );
        } else {
          throw new Error(result.message || "Failed to pause timer");
        }
        return result;
      } catch (error) {
        throw error;
      }
    },
    []
  );
  // --- MODIFICATION END ---

  const stopTimer = useCallback(
    async (
      appointmentId: number,
      userId: number
    ): Promise<TimerResponseDto> => {
      try {
        const result = await serviceProgressAPI.stopTimer(appointmentId, userId);
        refreshPendingServices();
        return result;
      } catch (error) {
        throw error;
      }
    },
    [refreshPendingServices]
  );

  // --- MODIFICATION START ---
  // Updated stopTimerOnly to also use the totalTimeLogged from the API response
// ... imports

  // --- MODIFICATION START ---
  // Updated stopTimerOnly to also use the totalTimeLogged from the API response
  const stopTimerOnly = useCallback(
    async (
      appointmentId: number,
      userId: number
    ): Promise<TimerResponseDto> => {
      try {
        const result = await serviceProgressAPI.stopTimer(appointmentId, userId);

        // --- THIS IS THE FIX ---
        // OLD: Manually updating state
        // if (result.success) {
        //   setServiceProgress((prevServices) => ... );
        // } else {
        //   throw new Error(result.message || "Failed to stop timer");
        // }

        // NEW: Refresh all data from the server
        // This ensures the new "Completed" status and all timer
        // info is 100% accurate from the database.
        if (result.success) {
          refreshPendingServices(); // Re-fetch data
        } else {
          throw new Error(result.message || "Failed to stop timer");
        }
        // --- END FIX ---
        
        return result;
      } catch (error) {
        throw error;
      }
    },
    [refreshPendingServices] // <-- Add dependency
  );
  // --- MODIFICATION END ---
// ... rest of the file
  // --- MODIFICATION END ---

  const updateStatus = useCallback(
    async (
      appointmentId: number,
      newStatus: AppointmentStatus | number,
      notes?: string
    ): Promise<void> => {
      try {
        await serviceProgressAPI.updateStatus(
          appointmentId,
          newStatus,
          employeeId,
          notes
        );

        const statusFromNumber: { [key: number]: string } = {
          0: "Pending",
          1: "Upcoming",
          2: "InProgress",
          3: "Completed",
          4: "Rejected",
        };

        const statusString =
          typeof newStatus === "number"
            ? (statusFromNumber[newStatus] as AppointmentStatus) || "Upcoming"
            : newStatus;

        setServiceProgress((prevServices) => {
          const updatedServices = prevServices.map((service) =>
            service.appointmentId === appointmentId
              ? { ...service, status: statusString as AppointmentStatus }
              : service
          );

          return updatedServices;
        });
      } catch (error) {
        throw error;
      }
    },
    [employeeId]
  );

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