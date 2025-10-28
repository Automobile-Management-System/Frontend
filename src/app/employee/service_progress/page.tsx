"use client";

import React, { useState, useEffect } from "react";
import { ServiceProgressCard } from "../../../../components/employee/ServiceProgressCard";
import { StatusUpdateModal } from "../../../../components/employee/StatusUpdateModal";
import { useServiceProgress } from "../../../hooks/useServiceProgress";
import {
  ServiceProgressDto,
  AppointmentStatus,
} from "../../../types/serviceProgress";

interface ServiceProgressPageProps {
  employeeId?: number;
}

const ServiceProgressPage: React.FC<ServiceProgressPageProps> = ({
  employeeId = 3, // Default employee ID, you can get this from auth context
}) => {
  const {
    serviceProgress,
    loading,
    error,
    startTimer,
    pauseTimer,
    stopTimer,
    stopTimerOnly,
    updateStatus,
    refreshData,
  } = useServiceProgress(employeeId);

  const [selectedAppointment, setSelectedAppointment] =
    useState<ServiceProgressDto | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);

  useEffect(() => {
    // Refresh data every 30 seconds
    const interval = setInterval(() => {
      refreshData();
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshData]);

  const handleTimerAction = async (
    action: () => Promise<any>,
    actionName: string
  ) => {
    try {
      await action();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error(`${actionName} failed:`, errorMessage);

      // Show user-friendly error message
      if (errorMessage.includes("No active timer found")) {
        alert(
          "No active timer found for this appointment. The timer may have already been stopped."
        );
      } else {
        alert(`${actionName} failed: ${errorMessage}`);
      }

      // Refresh data to sync the current state
      refreshData();
    }
  };

  const handleStatusUpdate = async (
    appointmentId: number,
    newStatus: AppointmentStatus,
    notes?: string
  ) => {
    try {
      await updateStatus(appointmentId, newStatus, notes);
      setShowStatusModal(false);
      setSelectedAppointment(null);
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleStopAndComplete = async (appointmentId: number) => {
    try {
      // First stop the timer directly (without auto-refresh to avoid overriding local state)
      try {
        await stopTimerOnly(appointmentId, employeeId);
      } catch (timerError) {
        const errorMessage =
          timerError instanceof Error ? timerError.message : "Unknown error";
        console.error("Stop timer failed:", errorMessage);

        // If timer fails but it's because there's no active timer, that's okay - continue with status update
        if (!errorMessage.includes("No active timer found")) {
          throw timerError; // Re-throw if it's a different error
        }
      }

      // Then update status to completed (this will update local state and keep service visible)
      await updateStatus(appointmentId, "Completed", "Service completed");
    } catch (error) {
      console.error("Failed to stop and complete:", error);
      // Show user-friendly error message
      alert("Failed to complete the service. Please try again.");

      // Refresh data to sync the current state
      refreshData();
    }
  };

  const openStatusModal = (appointment: ServiceProgressDto) => {
    setSelectedAppointment(appointment);
    setShowStatusModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-64 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-gray-300 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <h3 className="font-bold">Error loading service progress</h3>
            <p>{error}</p>
            <button
              onClick={refreshData}
              className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Service Progress
              </h1>
              <p className="text-gray-600 mt-1">
                Track time and update work status
              </p>
            </div>
            <button
              onClick={refreshData}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6">
        {serviceProgress.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012-2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No active services
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              You don't have any active service appointments assigned.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {serviceProgress.map((appointment) => (
              <ServiceProgressCard
                key={appointment.appointmentId}
                appointment={appointment}
                onStartTimer={() =>
                  handleTimerAction(
                    () => startTimer(appointment.appointmentId, employeeId),
                    "Start timer"
                  )
                }
                onPauseTimer={() =>
                  handleTimerAction(
                    () => pauseTimer(appointment.appointmentId, employeeId),
                    "Pause timer"
                  )
                }
                onStopTimer={() =>
                  handleTimerAction(
                    () => stopTimer(appointment.appointmentId, employeeId),
                    "Stop timer"
                  )
                }
                onStopAndComplete={() =>
                  handleStopAndComplete(appointment.appointmentId)
                }
                onUpdateStatus={() => openStatusModal(appointment)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {showStatusModal && selectedAppointment && (
        <StatusUpdateModal
          appointment={selectedAppointment}
          onClose={() => {
            setShowStatusModal(false);
            setSelectedAppointment(null);
          }}
          onUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
};

export default ServiceProgressPage;
