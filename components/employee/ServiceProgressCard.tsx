"use client";

import React, { useState, useEffect } from "react";
import {
  ServiceProgressDto,
  AppointmentStatus,
} from "../../src/types/serviceProgress";

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
  const [elapsedTime, setElapsedTime] = useState<string>("0h 0m");

  useEffect(() => {
    if (!appointment.isTimerActive || !appointment.currentTimerStartTime)
      return;

    const interval = setInterval(() => {
      const start = new Date(appointment.currentTimerStartTime!);
      const now = new Date();
      const diff = now.getTime() - start.getTime();

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setElapsedTime(`${hours}h ${minutes}m`);
    }, 1000);

    return () => clearInterval(interval);
  }, [appointment.isTimerActive, appointment.currentTimerStartTime]);

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "InProgress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "Cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "Rejected":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getServiceTypeColor = (type: string) => {
    return type === "Service"
      ? "bg-purple-100 text-purple-800 border-purple-200"
      : "bg-orange-100 text-orange-800 border-orange-200";
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-semibold text-gray-900">
              {appointment.serviceTitle}
            </h3>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium border ${getServiceTypeColor(
                appointment.serviceType
              )}`}
            >
              {appointment.serviceType}
            </span>
          </div>
          <p className="text-gray-600">Customer: {appointment.customerName}</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
            appointment.status
          )}`}
        >
          {typeof appointment.status === "string"
            ? appointment.status.replace(/([A-Z])/g, " $1").trim()
            : String(appointment.status)
                .replace(/([A-Z])/g, " $1")
                .trim()}
        </span>
      </div>

      {/* Timer Display */}
      <div className="flex items-center gap-4 mb-6">
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
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-sm text-gray-600">
            {appointment.isTimerActive
              ? elapsedTime
              : `${appointment.totalTimeLogged.toFixed(1)}h logged`}
          </span>
        </div>

        {appointment.isTimerActive && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-600 font-medium">
              Timer running
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {!appointment.isTimerActive ? (
          <button
            onClick={onStartTimer}
            disabled={
              appointment.status === "Completed" ||
              appointment.status === "Cancelled"
            }
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-6 4h8M6 6h12M6 18h12"
              />
            </svg>
            Start Timer
          </button>
        ) : (
          <button
            onClick={onPauseTimer}
            className="flex-1 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 flex items-center justify-center gap-2"
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
                d="M10 9v6m4-6v6"
              />
            </svg>
            Pause Timer
          </button>
        )}

        {appointment.isTimerActive && (
          <button
            onClick={onStopAndComplete}
            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Stop & Complete
          </button>
        )}

        <button
          onClick={onUpdateStatus}
          disabled={
            appointment.status === "Completed" ||
            appointment.status === "Cancelled"
          }
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed flex items-center gap-2"
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
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          Update Status
        </button>
      </div>
    </div>
  );
};
