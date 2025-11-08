"use client";

import React, { useState, useEffect } from "react";
import {
  ServiceProgressDto,
  AppointmentStatus,
} from "../../src/types/serviceProgress";
// Import the new alert components
import { Alert, AlertTitle, AlertDescription } from "./Alert"; // Adjust path as needed

interface ServiceProgressCardProps {
  appointment: ServiceProgressDto;
  onStartTimer: () => void;
  onPauseTimer: () => void;
  onStopTimer: () => void;
  onStopAndComplete: () => void;
  onUpdateStatus: () => void;
}

export const ServiceProgressCard: React.FC<ServiceProgressCardProps> = ({
  appointment,
  onStartTimer,
  onPauseTimer,
  onStopTimer,
  onStopAndComplete,
  onUpdateStatus,
}) => {
  const [elapsedTime, setElapsedTime] = useState<string>("00:00:00");

  useEffect(() => {
    if (!appointment.isTimerActive || !appointment.currentTimerStartTime) {
      setElapsedTime("00:00:00"); // Reset when not active
      return;
    }

    const interval = setInterval(() => {
      const timeString = appointment.currentTimerStartTime!;
      const startTimeString = timeString.endsWith("Z")
        ? timeString
        : timeString + "Z";

      const start = new Date(startTimeString);

      const now = new Date();
      const diff = now.getTime() - start.getTime();

      if (diff < 0 || isNaN(diff)) {
        setElapsedTime("00:00:00");
        return;
      }

      const totalSeconds = Math.floor(diff / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      const formattedTime = [
        String(hours).padStart(2, "0"),
        String(minutes).padStart(2, "0"),
        String(seconds).padStart(2, "0"),
      ].join(":");

      setElapsedTime(formattedTime);
    }, 1000);

    return () => clearInterval(interval);
  }, [appointment.isTimerActive, appointment.currentTimerStartTime]);

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case "Upcoming":
        return "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border-amber-300";
      case "InProgress":
        return "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-300";
      case "Completed":
        return "bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border-emerald-300";
      default:
        return "bg-gradient-to-r from-slate-100 to-gray-100 text-slate-800 border-slate-300";
    }
  };

  const getServiceTypeColor = (type: string) => {
    return type === "Service"
      ? "bg-gradient-to-r from-violet-100 to-purple-100 text-violet-800 border-violet-300"
      : "bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border-orange-300";
  };

  const formatTotalTime = (totalHours: number) => {
    if (totalHours === 0 || isNaN(totalHours)) {
      return "00h 00m ";
    }

    const totalSeconds = Math.floor(totalHours * 3600);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [
      String(hours).padStart(2, "0") + "h",
      String(minutes).padStart(2, "0") + "m",
    ].join(" ");
  };

  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 hover:shadow-3xl transition-all duration-300 hover:bg-white/90">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-start gap-3 mb-3">
            {/* Title/Details Block */}
            <div className="flex-1">
              {appointment.serviceType === "Service" ? (
                <>
                  <h3 className="text-2xl font-bold text-gray-900 leading-tight mb-2">
                    Service for {appointment.customerVehicleName}
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 pl-1">
                    {appointment.serviceNames.map((name, index) => (
                      <li key={index} className="text-sm">
                        {name}
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <>
                  <h3 className="text-2xl font-bold text-gray-900 leading-tight">
                    {appointment.modificationTitle}
                  </h3>
                  <p className="text-gray-600 mt-1 text-sm">
                    {appointment.modificationDescription}
                  </p>
                </>
              )}
            </div>
            {/* Service Type Badge */}
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold border-2 shadow-lg ${getServiceTypeColor(
                appointment.serviceType
              )} transform hover:scale-105 transition-transform duration-200 whitespace-nowrap`}
            >
              {appointment.serviceType}
            </span>
          </div>
          {/* Customer Name */}
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <p className="text-gray-700 font-medium text-lg">
              {appointment.customerName}
            </p>
          </div>
        </div>
        {/* Status Badge */}
        <span
          className={`px-4 py-2 rounded-full text-sm font-bold border-2 shadow-lg ${getStatusColor(
            appointment.status
          )} transform hover:scale-105 transition-transform duration-200`}
        >
          {appointment.status.replace(/([A-Z])/g, " $1").trim()}
        </span>
      </div>

      {/* Timer Display */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 mb-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white rounded-xl shadow-md">
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
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Time Tracking
              </p>
              <span className="text-xl font-bold text-gray-900">
                {appointment.isTimerActive
                  ? elapsedTime
                  : `${formatTotalTime(appointment.totalTimeLogged)} logged`}
              </span>
            </div>
          </div>

          {/* === MODIFICATION: ALERT SYSTEM INTEGRATED === */}
          {appointment.isTimerActive && (
            <Alert className="bg-green-50 border-green-200 text-green-800">
              <svg
                className="h-4 w-4 text-green-600" // Matches cva spec
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
              <AlertTitle className="text-green-900">Timer Active</AlertTitle>
              <AlertDescription className="text-green-700">
                Work is currently in progress.
              </AlertDescription>
            </Alert>
          )}
          {/* === END MODIFICATION === */}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {!appointment.isTimerActive ? (
          <button
            onClick={onStartTimer}
            disabled={appointment.status === "Completed"}
            // === MODIFICATION: PRIMARY COLORS APPLIED ===
            className="bg-[#0B2E66] text-white px-6 py-4 rounded-2xl hover:bg-[#1E63CC] disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:transform-none"
            // === END MODIFICATION ===
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {/* Using a "play" icon for "Start" */}
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 3l14 9-14 9V3z"
              />
            </svg>
            Start Timer
          </button>
        ) : (
          <button
            onClick={onPauseTimer}
            className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-4 rounded-2xl hover:from-amber-600 hover:to-orange-700 flex items-center justify-center gap-3 font-semibold shadow-lg hover:shadow-xl transform hover:scale-1all duration-200"
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
                d="M10 9v6m4-6v6"
              />
            </svg>
            Pause Timer
          </button>
        )}

        {appointment.isTimerActive && (
          <button
            onClick={onStopAndComplete}
            className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-6 py-4 rounded-2xl hover:from-red-600 hover:to-rose-700 flex items-center justify-center gap-3 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Stop & Complete
          </button>
        )}

        <button
          onClick={onUpdateStatus}
          disabled={appointment.status === "Completed"}
          className="bg-white border-2 border-gray-200 text-gray-700 px-6 py-4 rounded-2xl hover:bg-gray-50 hover:border-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:border-gray-200 flex items-center justify-center gap-3 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:transform-none"
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
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          Update Status
        </button>
      </div>
    </div>
  );
};