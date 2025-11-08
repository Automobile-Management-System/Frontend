"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ServiceProgressCard } from "../../../../components/employee/ServiceProgressCard";
import { StatusUpdateModal } from "../../../../components/employee/StatusUpdateModal";
import { useServiceProgress } from "../../../hooks/useServiceProgress";
import { useAuth } from "../../context/AuthContext";
import {
  ServiceProgressDto,
  AppointmentStatus,
} from "../../../types/serviceProgress";
// Import new components
import { ServiceProgressControls } from "../../../../components/employee/ServiceProgressControls";
import { PaginationControls } from "../../../../components/employee/PaginationControls";
import { QuickFilterTabs } from "../../../../components/employee/QuickFilterTabs";
import { RefreshCw } from "lucide-react";

const ITEMS_PER_PAGE = 10;

const ServiceProgressPage: React.FC = () => {
  // --- NEW: Client-side rendering check ---
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);
  // --- END NEW ---

  const { user, isLoading: authLoading } = useAuth();
  const employeeId = user?.employeeId || user?.id;

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
  } = useServiceProgress(employeeId || 0);

  const [selectedAppointment, setSelectedAppointment] =
    useState<ServiceProgressDto | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);

  // --- State for Controls ---
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("date-desc");
  const [activeTabFilter, setActiveTabFilter] = useState("all");

  useEffect(() => {
    const interval = setInterval(() => {
      refreshPendingServices();
    }, 30000);
    return () => clearInterval(interval);
  }, [refreshPendingServices]);


  // --- Logic for Filtering, Sorting, and Pagination ---
  const filteredAndSortedProgress = useMemo(() => {
    let items = serviceProgress;

    // 1. Filter by Tab
    if (activeTabFilter === "Active") {
      items = items.filter(item => item.isTimerActive);
    } else if (activeTabFilter !== "all") {
      items = items.filter(item => item.status === activeTabFilter);
    }

    // 2. Filter by Search Term
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      items = items.filter(item =>
        item.customerName.toLowerCase().includes(lowerSearch) ||
        item.customerVehicleName.toLowerCase().includes(lowerSearch) ||
        (item.modificationTitle && item.modificationTitle.toLowerCase().includes(lowerSearch)) ||
        item.serviceNames.some(name => name.toLowerCase().includes(lowerSearch))
      );
    }

    // 3. Sort
    switch (sortOption) {
      case "date-asc":
        items.sort((a, b) => new Date(a.appointmentDateTime).getTime() - new Date(b.appointmentDateTime).getTime());
        break;
      case "status":
        const statusOrder: { [key in AppointmentStatus]?: number } = {
          "InProgress": 1,
          "Upcoming": 2,
          "Completed": 3,
        };
        items.sort((a, b) => (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99));
        break;
      case "date-desc":
      default:
        items.sort((a, b) => new Date(b.appointmentDateTime).getTime() - new Date(a.appointmentDateTime).getTime());
        break;
    }

    return items;
  }, [serviceProgress, activeTabFilter, searchTerm, sortOption]);

  // Reset to page 1 if filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTabFilter, searchTerm, sortOption]);

  const totalPages = Math.ceil(filteredAndSortedProgress.length / ITEMS_PER_PAGE);

  const paginatedProgress = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedProgress.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAndSortedProgress, currentPage]);
 
  const handleTimerAction = async (
    action: () => Promise<any>,
    actionName: string
  ) => {
    if (!employeeId) {
      alert("Employee ID not found. Please refresh the page and try again.");
      return;
    }
    try {
      await action();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error(`${actionName} failed:`, errorMessage);
      if (errorMessage.includes("No active timer found")) {
        alert("No active timer found. The timer may have already been stopped.");
      } else {
        alert(`${actionName} failed: ${errorMessage}`);
      }
      refreshPendingServices();
    }
  };

  const handleStatusUpdate = async (
    appointmentId: number,
    newStatus: AppointmentStatus | number,
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

  // --- THIS IS THE CORRECTED FUNCTION ---
  const handleStopAndComplete = async (appointmentId: number) => {
        if (!employeeId) {
          alert("Employee ID not found. Please refresh the page and try again.");
          return;
        }
        
        // We only need to call stopTimerOnly.
        // The backend's /timer/stop endpoint handles everything:
        // 1. Stops the timer
        // 2. Sets status to "Completed"
        // 3. Creates the payment record
        //
        // Your useServiceProgress hook now refreshes data automatically.
        try {
          await stopTimerOnly(appointmentId, employeeId);
        } catch (error) {
           const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
           console.error("Failed to stop and complete:", errorMessage);
           alert(`Failed to complete the service: ${errorMessage}`);
           refreshPendingServices(); // Refresh just in case
        }
      };
  // --- END CORRECTION ---

  const openStatusModal = (appointment: ServiceProgressDto) => {
    setSelectedAppointment(appointment);
    setShowStatusModal(true);
  };

  // --- NEW: Wrap all return logic in the client check ---
  if (!isClient) {
    // Render the auth loading spinner by default.
    // This avoids the mismatch because the server will render this,
    // and the client will *also* render this on the first pass.
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // (Original logic now runs safely on the client)
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
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
              Authentication Required
            </h3>
            <p className="text-gray-600 mb-6">
              Please log in to access the service progress dashboard.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (user.role !== "Employee") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6">
        <div className="max-w-md mx-auto">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8 text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Access Denied
            </h3>
            <p className="text-gray-600 mb-6">
              This page is only accessible to employees.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!employeeId) {
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
              Employee ID Not Found
            </h3>
            <p className="text-gray-600 mb-6">
              Unable to retrieve your employee ID. Please contact support.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            {/* ... skeleton ... */}
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

  const stats = {
    all: serviceProgress.length,
    upcoming: serviceProgress.filter((s) => s.status === "Upcoming").length,
    inProgress: serviceProgress.filter((s) => s.status === "InProgress").length,
    completed: serviceProgress.filter((s) => s.status === "Completed").length,
    active: serviceProgress.filter((s) => s.isTimerActive).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Service Progress
              </h1>
              <p className="text-gray-600 mt-1">
                Monitor your service
                appointments and track work progress
              </p>
            </div>
            <button
            onClick={refreshData}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ... stats cards ... */}
      </div>

      {/* --- Main Content --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
       
        <ServiceProgressControls
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          sortOption={sortOption}
          onSortChange={setSortOption}
          totalResults={filteredAndSortedProgress.length}
        />

        <QuickFilterTabs
          activeTab={activeTabFilter}
          onTabChange={setActiveTabFilter}
          counts={{
            all: stats.all,
            upcoming: stats.upcoming,
            inProgress: stats.inProgress,
            completed: stats.completed,
            active: stats.active,
          }}
        />

        {paginatedProgress.length === 0 ? (
          <div className="text-center py-16">
            {/* ... no services found ... */}
          </div>
        ) : (
          <div className="space-y-8">
            {paginatedProgress.map((appointment, index) => (
              <div
                key={appointment.appointmentId}
                className="transform hover:scale-[1.02] transition-all duration-300"
                style={{
                  animationName: "fadeInUp",
                  animationDuration: "0.6s",
                  animationTimingFunction: "ease-out",
                  animationFillMode: "forwards",
                  animationDelay: `${index * 100}ms`,
                }}
              >
                <ServiceProgressCard
                  appointment={appointment}
                  onStartTimer={() =>
                    handleTimerAction(
                      () => startTimer(appointment.appointmentId, employeeId!),
                      "Start timer"
                    )
                  }
                  onPauseTimer={() =>
                    handleTimerAction(
                      () => pauseTimer(appointment.appointmentId, employeeId!),
                      "Pause timer"
                    )
                  }
                  onStopTimer={() =>
                    handleTimerAction(
                      () => stopTimer(appointment.appointmentId, employeeId!),
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

        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

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