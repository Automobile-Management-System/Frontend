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


  // --- NEW: Auto-refresh logic ---
  // This hook runs at the top level, respecting the Rules of Hooks
  useEffect(() => {
    // We only want to trigger a refresh if:
    // 1. Auth is no longer loading
    // 2. The employeeId is *still* not found
    if (!authLoading && !employeeId) {
      const timer = setTimeout(() => {
        window.location.reload(); // Trigger a page refresh
      }, 1000); // 5-second delay

      // Clean up the timer if the component unmounts
      return () => clearTimeout(timer);
    }
  }, [authLoading, employeeId]); // Re-run if auth state changes
  // --- End of new logic ---


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

  const handleStopAndComplete = async (appointmentId: number) => {
    if (!employeeId) {
      alert("Employee ID not found. Please refresh the page and try again.");
      return;
    }
    try {
      try {
        await stopTimerOnly(appointmentId, employeeId);
      } catch (timerError) {
        const errorMessage =
          timerError instanceof Error ? timerError.message : "Unknown error";
        console.error("Stop timer failed:", errorMessage);
        if (!errorMessage.includes("No active timer found")) {
          throw timerError;
        }
      }
      await updateStatus(appointmentId, 3, "Service completed"); // 3 = Completed
    } catch (error) {
      console.error("Failed to stop and complete:", error);
      alert("Failed to complete the service. Please try again.");
      refreshPendingServices();
    }
  };

  const openStatusModal = (appointment: ServiceProgressDto) => {
    setSelectedAppointment(appointment);
    setShowStatusModal(true);
  };

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
            {/* The auto-refresh logic will catch this state */}
            <p className="text-sm text-gray-500">
              Attempting to refresh
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

  // This is the block you provided
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
            {/* --- MODIFICATION: Added refresh message --- */}
            <p className="text-sm text-gray-500">
              Attempting to refresh in 5 seconds...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    // ... (Skeleton loading)
  }

  if (error) {
    // ... (Error display)
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
                  {stats.all}
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
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.upcoming}
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
                  {stats.active}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Main Content --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        
        {/* --- Search/Sort Controls --- */}
        <ServiceProgressControls
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          sortOption={sortOption}
          onSortChange={setSortOption}
          totalResults={filteredAndSortedProgress.length}
        />

        {/* --- NEW: Quick Filter Tabs --- */}
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

        {/* --- List of Cards --- */}
        {paginatedProgress.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-12 border border-white/20 shadow-2xl max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                No Services Found
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                {serviceProgress.length === 0
                  ? "You don't have any service appointments assigned."
                  : "No services match your current filters. Try adjusting your search."}
              </p>
            </div>
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

        {/* --- Pagination --- */}
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