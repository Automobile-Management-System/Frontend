"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, User, Edit, X } from "lucide-react";

const AppointmentsPage = () => {
  const appointments = [
    {
      id: 1,
      service: "House Cleaning",
      date: "Sunday, October 3, 2025",
      time: "10:00 AM",
      address: "123 Main St, Apt 4B",
      technician: "Sarah Smith",
      status: "Upcoming",
      statusColor: "bg-blue-100 text-blue-800",
    },
    {
      id: 2,
      service: "HVAC Maintenance",
      date: "Friday, October 3, 2025",
      time: "2:00 PM",
      address: "123 Main St, Apt 4B",
      technician: "Mike Johnson",
      status: "In Progress",
      statusColor: "bg-yellow-100 text-yellow-800",
      progress: 65,
    },
    {
      id: 3,
      service: "Plumbing Repair",
      date: "Sunday, September 28, 2025",
      time: "11:00 AM",
      address: "123 Main St, Apt 4B",
      technician: "Tom Wilson",
      status: "Completed",
      statusColor: "bg-green-100 text-green-800",
      progress: 100,
    },
  ];

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
        <Button className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90">
          <span className="mr-2">+</span>
          Book Appointment
        </Button>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {appointments.map((appointment) => (
          <div
            key={appointment.id}
            className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {appointment.service}
                </h3>
                <Badge className={appointment.statusColor}>
                  {appointment.status}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">{appointment.date}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="h-4 w-4" />
                <span className="text-sm">{appointment.time}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">{appointment.address}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1e3a5f] text-white text-sm font-medium">
                {appointment.technician.split(" ").map(n => n[0]).join("")}
              </div>
              <div>
                <p className="text-xs text-gray-500">Technician</p>
                <p className="text-sm font-medium text-gray-900">
                  {appointment.technician}
                </p>
              </div>
            </div>

            {appointment.progress !== undefined && (
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Progress</span>
                  <span className="text-sm font-medium text-gray-900">
                    {appointment.progress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#1e3a5f] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${appointment.progress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {appointment.status === "Upcoming" && (
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
        ))}
      </div>
    </div>
  );
};

export default AppointmentsPage;