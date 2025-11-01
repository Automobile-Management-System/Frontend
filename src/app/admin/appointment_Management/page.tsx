"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Calendar, 
  Clock, 
  Car, 
  User, 
  Phone, 
  Mail, 
  Search,
  Filter,
  Download,
  Eye,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { appointmentAPI } from "@/services/appointmentAPI";
import { AppointmentResponse } from "@/types/appointments";
import { handleApiError, formatApiDate, formatApiTime } from "@/lib/apiUtils";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";

const AppointmentManagementPage = () => {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  // Data state
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize] = useState(10);
  
  // Filter and search state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
        return;
      }
      if (user.role !== "Admin") {
        router.push("/unauthorized");
        return;
      }
      loadAppointments();
    }
  }, [user, authLoading, router]);

  const loadAppointments = async (page: number = currentPage) => {
    try {
      setLoading(true);
      setError("");
      
      const paginatedResult = await appointmentAPI.getAllAppointmentsPaginated({ 
        page, 
        pageSize 
      });
      
      setAppointments(paginatedResult.data);
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadAppointments(page);
  };

  const getStatusColor = (status: any) => {
    if (typeof status === "number") {
      switch (status) {
        case 0: return "bg-yellow-100 text-yellow-800";
        case 1: return "bg-blue-100 text-blue-800";
        case 2: return "bg-purple-100 text-purple-800";
        case 3: return "bg-green-100 text-green-800";
        case 4: return "bg-red-100 text-red-800";
        default: return "bg-gray-100 text-gray-800";
      }
    }

    const normalized = String(status || "").replace(/\s+/g, "").toLowerCase();
    switch (normalized) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "upcoming": return "bg-blue-100 text-blue-800";
      case "inprogress": return "bg-purple-100 text-purple-800";
      case "completed": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: any) => {
    if (typeof status === "number") {
      switch (status) {
        case 0: return "Pending";
        case 1: return "Upcoming";
        case 2: return "In Progress";
        case 3: return "Completed";
        case 4: return "Rejected";
        default: return String(status);
      }
    }
    const s = String(status || "").trim();
    const normalized = s.replace(/\s+/g, "").toLowerCase();
    switch (normalized) {
      case "pending": return "Pending";
      case "upcoming": return "Upcoming";
      case "inprogress": return "In Progress";
      case "completed": return "Completed";
      case "rejected": return "Rejected";
      default: return s.charAt(0).toUpperCase() + s.slice(1);
    }
  };

  const toggleRowExpansion = (appointmentId: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(appointmentId)) {
      newExpanded.delete(appointmentId);
    } else {
      newExpanded.add(appointmentId);
    }
    setExpandedRows(newExpanded);
  };

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch = 
      searchTerm === "" ||
      appointment.appointmentId.toString().includes(searchTerm) ||
      (appointment.userName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (appointment.registrationNumber?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      appointment.services.some(s => 
        s.serviceName.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesStatus = 
      statusFilter === "all" ||
      getStatusLabel(appointment.status).toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="h-24 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="p-6">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Appointment Management
              </h1>
              <p className="text-gray-600 mt-1">
                View and manage all customer appointments
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
                {showFilters ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by ID, customer, vehicle..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="in progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </Card>

        {error && (
          <Card className="p-4 border-red-200 bg-red-50">
            <div className="text-red-700">{error}</div>
          </Card>
        )}

        {/* Appointments Table */}
        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              All Appointments ({totalItems})
            </h2>
          </div>

          {filteredAppointments.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No appointments found
              </h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== "all" 
                  ? "Try adjusting your filters"
                  : "No appointments have been created yet"
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Appointment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vehicle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAppointments.map((appointment) => (
                    <React.Fragment key={appointment.appointmentId}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              #{appointment.appointmentId}
                            </div>
                            <div className="text-sm text-gray-500">
                              {appointment.services.length} service(s)
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-gray-600" />
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {appointment.userName || "Unknown"}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {appointment.userId}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Car className="h-5 w-5 text-gray-400 mr-2" />
                            <div className="text-sm text-gray-900">
                              {appointment.registrationNumber || "N/A"}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-gray-900">
                              {formatApiDate(appointment.dateTime)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatApiTime(appointment.dateTime)}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={`${getStatusColor(appointment.status)} font-medium`}>
                            {getStatusLabel(appointment.status)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            ${appointment.services.reduce((sum, s) => sum + s.basePrice, 0).toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleRowExpansion(appointment.appointmentId)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                      
                      {/* Expanded row details */}
                      {expandedRows.has(appointment.appointmentId) && (
                        <tr>
                          <td colSpan={7} className="px-6 py-4 bg-gray-50">
                            <div className="space-y-4">
                              <h4 className="font-medium text-gray-900">Services Details</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {appointment.services.map((service, index) => (
                                  <div key={index} className="bg-white p-3 rounded-lg border">
                                    <div className="font-medium text-gray-900">
                                      {service.serviceName}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      ${service.basePrice.toFixed(2)}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                pageSize={pageSize}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AppointmentManagementPage;