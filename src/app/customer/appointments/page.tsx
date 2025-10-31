"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Car, Edit, X } from "lucide-react";
import { BookingForm } from "@/components/appointments/BookingForm";
import { appointmentAPI } from "@/services/appointmentAPI";
import { AppointmentResponse } from "@/types/appointments";
import { handleApiError, formatApiDate, formatApiTime } from "@/lib/apiUtils";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";

const AppointmentsPage = () => {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showBookingForm, setShowBookingForm] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
        return;
      }
      if (user.role !== 'Customer') {
        router.push('/unauthorized');
        return;
      }
      loadAppointments();
    }
  }, [user, authLoading, router]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await appointmentAPI.getMyAppointments();
      setAppointments(data);
    } catch (err) {
      console.error('Failed to load appointments:', err);
      setError(handleApiError(err));
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: any) => {
    const statusStr = String(status || '').toLowerCase();
    switch (statusStr) {
      case 'pending':
      case 'upcoming':
        return "bg-blue-100 text-blue-800";
      case 'in progress':
      case 'inprogress':
        return "bg-yellow-100 text-yellow-800";
      case 'completed':
        return "bg-green-100 text-green-800";
      case 'cancelled':
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            My Appointments
          </h1>
          <p className="text-gray-600">Manage your service appointments</p>
        </div>
        <Button 
          onClick={() => setShowBookingForm(true)}
          className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90"
        >
          <span className="mr-2">+</span>
          Book Appointment
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Appointments List */}
      <div className="space-y-4">
        {appointments.length === 0 ? (
          <div className="text-center py-12">
            <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments yet</h3>
            <p className="text-gray-600 mb-4">Book your first appointment to get started</p>
            <Button 
              onClick={() => setShowBookingForm(true)}
              className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90"
            >
              Book Appointment
            </Button>
          </div>
        ) : (
          appointments.map((appointment) => (
            <div
              key={appointment.appointmentId}
              className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {appointment.services.map(s => s.serviceName).join(", ")}
                  </h3>
                  <Badge className={getStatusColor(appointment.status)}>
                    {appointment.status}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total Price</p>
                  <p className="text-lg font-semibold text-gray-900">
                    ${appointment.services.reduce((sum, s) => sum + s.basePrice, 0).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">{formatApiDate(appointment.dateTime)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">{formatApiTime(appointment.dateTime)}</span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Services:</p>
                <div className="flex flex-wrap gap-2">
                  {appointment.services.map((service, index) => (
                    <span 
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      {service.serviceName} - ${service.basePrice}
                    </span>
                  ))}
                </div>
              </div>

              {String(appointment.status || '').toLowerCase() === "pending" && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-1" />
                    Reschedule
                  </Button>
                  <Button variant="outline" size="sm">
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <BookingForm 
        isOpen={showBookingForm}
        onClose={() => setShowBookingForm(false)}
        onSuccess={loadAppointments}
      />
    </div>
  );
};

export default AppointmentsPage;