"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { Calendar, Clock, Car, Edit, X } from "lucide-react";
import { BookingForm } from "@/components/appointments/BookingForm";
import { appointmentAPI } from "@/services/appointmentAPI";
import { AppointmentResponse, Vehicle, PaginatedResult } from "@/types/appointments";
import { handleApiError, formatApiDate, formatApiTime } from "@/lib/apiUtils";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";

// Add custom styles for animations
const customStyles = `
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
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = customStyles;
  document.head.appendChild(styleSheet);
}

const AppointmentsPage = () => {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showBookingForm, setShowBookingForm] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize] = useState(10); // Fixed page size

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
        return;
      }
      if (user.role !== "Customer") {
        router.push("/unauthorized");
        return;
      }
      loadAppointments();
    }
  }, [user, authLoading, router]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadAppointments(page);
  };

  const handleAppointmentCreated = () => {
    // Reset to first page and reload
    setCurrentPage(1);
    loadAppointments(1);
  };

  const loadAppointments = async (page: number = currentPage) => {
    try {
      setLoading(true);
      setError("");
      
      // Load appointments and vehicles in parallel
      const [paginatedResult, vehs] = await Promise.all([
        appointmentAPI.getMyAppointmentsPaginated({ page, pageSize }),
        appointmentAPI.getVehicles().catch((e) => {
          console.warn("Failed to load vehicles for mapping:", e);
          return [] as Vehicle[];
        }),
      ]);
      
      setAppointments(paginatedResult.data);
      setVehicles(vehs);
      setTotalPages(paginatedResult.totalPages);
      setTotalItems(paginatedResult.totalItems);
      setCurrentPage(paginatedResult.currentPage);
    } catch (err) {
      console.error("Failed to load appointments:", err);
      setError(handleApiError(err));
      setAppointments([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: any) => {
    // Map numeric enum first
    if (typeof status === "number") {
      switch (status) {
        case 0: // Pending
          return "bg-yellow-100 text-yellow-800";
        case 1: // Upcoming
          return "bg-blue-100 text-blue-800";
        case 2: // InProgress
          return "bg-purple-100 text-purple-800";
        case 3: // Completed
          return "bg-green-100 text-green-800";
        case 4: // Rejected
          return "bg-red-100 text-red-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    }

    const normalized = String(status || "")
      .replace(/\s+/g, "")
      .toLowerCase();
    switch (normalized) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      case "inprogress":
        return "bg-purple-100 text-purple-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: any) => {
    if (typeof status === "number") {
      switch (status) {
        case 0:
          return "Pending";
        case 1:
          return "Upcoming";
        case 2:
          return "In Progress";
        case 3:
          return "Completed";
        case 4:
          return "Rejected";
        default:
          return String(status);
      }
    }
    const s = String(status || "").trim();
    const normalized = s.replace(/\s+/g, "").toLowerCase();
    switch (normalized) {
      case "pending":
        return "Pending";
      case "upcoming":
        return "Upcoming";
      case "inprogress":
        return "In Progress";
      case "completed":
        return "Completed";
      case "rejected":
        return "Rejected";
      default:
        // Fallback: title-case the raw string
        return s.charAt(0).toUpperCase() + s.slice(1);
    }
  };

  const getAnyVehicleId = (obj: any): number | undefined => {
    if (!obj) return undefined;
    const possible = [
      "vehicleId",
      "id",
      "VehicleId",
      "ID",
      "vehicleID",
      "Id",
      "customerVehicleId",
      "carId",
      "vehicleid",
    ];
    for (const key of possible) {
      if (obj[key] !== undefined && obj[key] !== null) {
        const v =
          typeof obj[key] === "string" ? parseInt(obj[key], 10) : obj[key];
        if (!Number.isNaN(v)) return v as number;
      }
    }
    return undefined;
  };

  const getVehicleNumber = (appointment: AppointmentResponse) => {
    // Direct fields on appointment
    const direct =
      (appointment as any).registrationNumber ||
      (appointment as any).licensePlate ||
      (appointment as any).vehicleRegistrationNumber ||
      (appointment as any).vehicleNumber ||
      (appointment as any).vehicleNo ||
      (appointment as any).regNumber ||
      (appointment as any).registrationNo;

    if (direct) return direct as string;

    // Nested vehicle object on appointment
    const fromVehicle = (appointment as any).vehicle || {};
    const nested =
      fromVehicle.registrationNumber ||
      fromVehicle.licensePlate ||
      fromVehicle.regNumber;
    if (nested) return nested as string;

    // Lookup via loaded vehicles by id
    const apptVehId = getAnyVehicleId(appointment);
    if (apptVehId && vehicles.length > 0) {
      const match = vehicles.find((v) => getAnyVehicleId(v) === apptVehId);
      if (match) {
        return (
          match.registrationNumber ||
          match.licensePlate ||
          (match as any).regNumber ||
          "N/A"
        );
      }
    }
    return "N/A";
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="h-8 bg-gray-200 rounded-lg w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="h-32 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Enhanced Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                My Appointments
              </h1>
              <p className="text-gray-600 text-lg">
                Manage your service appointments with ease
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => setShowBookingForm(true)}
                className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a87] hover:from-[#1a2f4f] hover:to-[#1e3a5f] text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <span className="mr-2">+</span>
                Book New Appointment
              </Button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-6 py-4 rounded-r-lg mb-6 shadow-sm">
            <div className="flex items-center">
              <X className="h-5 w-5 mr-2" />
              {error}
            </div>
          </div>
        )}

        {/* Enhanced Appointments List */}
        <div className="space-y-6">
          {appointments.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Car className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                No appointments yet
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Start your journey with us by booking your first service
                appointment. Our expert team is ready to help you.
              </p>
              <Button
                onClick={() => setShowBookingForm(true)}
                className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a87] hover:from-[#1a2f4f] hover:to-[#1e3a5f] text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <span className="mr-2">+</span>
                Book Your First Appointment
              </Button>
            </div>
          ) : (
            <>
              {appointments.map((appointment, index) => (
                <div
                  key={appointment.appointmentId}
                  className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] group"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: "fadeInUp 0.6s ease-out both",
                  }}
                >
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
                    {/* Left Section - Main Info */}
                    <div className="flex-1 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#1e3a5f] transition-colors">
                            {appointment.services
                              .map((s) => s.serviceName)
                              .join(", ")}
                          </h3>
                          <div className="flex items-center gap-2">
                            <Badge
                              className={`${getStatusColor(
                                appointment.status
                              )} font-medium px-3 py-1`}
                            >
                              {getStatusLabel(appointment.status)}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              ID: #{appointment.appointmentId}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500 mb-1">
                            Total Amount
                          </p>
                          <p className="text-2xl font-bold text-green-600">
                            $
                            {appointment.services
                              .reduce((sum, s) => sum + s.basePrice, 0)
                              .toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {/* Date, Time, Vehicle Info */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">
                              Date
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                              {formatApiDate(appointment.dateTime)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <Clock className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">
                              Time
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                              {formatApiTime(appointment.dateTime)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Car className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">
                              Vehicle
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                              {getVehicleNumber(appointment)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Services */}
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-gray-700">
                          Services Included:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {appointment.services.map((service, index) => (
                            <div
                              key={index}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300"
                            >
                              <span>{service.serviceName}</span>
                              <span className="text-green-600 font-bold">
                                ${service.basePrice}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action Buttons removed as requested */}
                    </div>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mt-8">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    pageSize={pageSize}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </div>

        <BookingForm
          isOpen={showBookingForm}
          onCloseAction={() => setShowBookingForm(false)}
          onSuccessAction={handleAppointmentCreated}
        />
      </div>
    </div>
  );
};

export default AppointmentsPage;
