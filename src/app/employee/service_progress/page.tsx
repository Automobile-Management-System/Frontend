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
    refreshPendingServices,
  } = useServiceProgress(employeeId);

  const [selectedAppointment, setSelectedAppointment] =
    useState<ServiceProgressDto | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);

  useEffect(() => {
    // Smart refresh every 30 seconds - only updates pending services, preserves non-pending ones
    const interval = setInterval(() => {
      refreshPendingServices();
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshPendingServices]);

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

      // Smart refresh to sync pending services without losing non-pending ones
      refreshPendingServices();
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

      // Smart refresh to sync pending services without losing non-pending ones
      refreshPendingServices();
    }
  };

  const openStatusModal = (appointment: ServiceProgressDto) => {
    setSelectedAppointment(appointment);
    setShowStatusModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            {/* Header Skeleton */}
            <div className="mb-8">
              <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-80 mb-3"></div>
              <div className="h-6 bg-gray-200 rounded w-64"></div>
            </div>

            {/* Stats Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20"
                >
                  <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                  <div className="h-8 bg-gray-300 rounded w-12"></div>
                </div>
              ))}
            </div>

            {/* Cards Skeleton */}
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex-1">
                      <div className="h-6 bg-gray-300 rounded w-64 mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded w-40"></div>
                    </div>
                    <div className="h-8 bg-gray-200 rounded-full w-24"></div>
                  </div>
                  <div className="flex gap-4 mb-6">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div className="flex gap-3">
                    <div className="h-10 bg-gray-200 rounded-lg flex-1"></div>
                    <div className="h-10 bg-gray-200 rounded-lg flex-1"></div>
                    <div className="h-10 bg-gray-200 rounded-lg w-32"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6">
        <div className="max-w-md mx-auto">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Unable to Load Services
            </h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={refreshData}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const stats = {
    total: serviceProgress.length,
    pending: serviceProgress.filter((s) => s.status === "Pending").length,
    inProgress: serviceProgress.filter((s) => s.status === "InProgress").length,
    completed: serviceProgress.filter((s) => s.status === "Completed").length,
    activeTimers: serviceProgress.filter((s) => s.isTimerActive).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Service Progress Dashboard
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Monitor your service appointments and track work progress
              </p>
            </div>
            <button
              onClick={refreshData}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center gap-3"
            >
              <svg
                className="w-5 h-5"
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
              Refresh Data
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Services
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <svg
                  className="w-6 h-6 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.pending}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.inProgress}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.completed}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100">
                <div className="w-6 h-6 relative">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse absolute top-2 left-2"></div>
                  <svg
                    className="w-6 h-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Active Timers
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.activeTimers}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {serviceProgress.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-12 border border-white/20 shadow-2xl max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-blue-600"
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
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                No Services Available
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                You don't have any service appointments assigned at the moment.
                Check back later or contact your supervisor.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {serviceProgress.map((appointment, index) => (
              <div
                key={appointment.appointmentId}
                className="transform hover:scale-[1.02] transition-all duration-300"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: "fadeInUp 0.6s ease-out forwards",
                }}
              >
                <ServiceProgressCard
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
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

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
