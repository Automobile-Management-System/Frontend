"use client";

import React, { useState } from "react";
import {
  ServiceProgressDto,
  AppointmentStatus,
} from "../../src/types/serviceProgress";

interface StatusUpdateModalProps {
  appointment: ServiceProgressDto;
  onClose: () => void;
  onUpdate: (
    appointmentId: number,
    newStatus: AppointmentStatus | number,
    notes?: string
  ) => void;
}

export const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({
  appointment,
  onClose,
  onUpdate,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<
    AppointmentStatus | number
  >(appointment.status);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const statusOptions: {
    value: AppointmentStatus; 
    label: string;
    description: string;
  }[] = [
    {
      value: "Upcoming", 
      label: "Upcoming",
      description: "Service is scheduled and upcoming",
    },
    {
      value: "Completed",
      label: "Completed",
      description: "Service has been finished",
    },
    {
      value: "InProgress",
      label: "In Progress",
      description: "Currently working on the service",
    },
  ];

  const handleUpdate = async () => {
    setIsUpdating(true);
    setError(null);
    try {
      await onUpdate(appointment.appointmentId, selectedStatus);
    } catch (err) {
      console.error("Status update error:", err);
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl max-w-md w-full border border-white/20 overflow-hidden transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-width">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-white">Update Status</h3>
              {/* Updated to use new fields */}
              <p className="text-blue-100 text-sm truncate">
                {appointment.serviceType === 'Service'
                  ? appointment.customerVehicleName
                  : appointment.modificationTitle}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-blue-100 hover:text-white hover:bg-white/20 rounded-full p-1.5 transition-colors duration-200"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Service Info */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 mb-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <svg
                  className="w-4 h-4 text-blue-600"
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
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600 truncate">
                  {appointment.customerName}
                </p>
                <p className="text-xs text-gray-500">
                  Current:{" "}
                  <span className="font-medium">{appointment.status}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Status Selection */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Select New Status
            </label>
            <div className="space-y-2">
              {statusOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center cursor-pointer p-3 rounded-xl border transition-all duration-200 hover:shadow-sm ${
                    selectedStatus === option.value
                      ? "border-blue-500 bg-blue-50 shadow-md"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value={option.value}
                    checked={selectedStatus === option.value}
                    onChange={(e) => {
                      setSelectedStatus(e.target.value as AppointmentStatus);
                    }}
                    className="mr-3 w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm">
                      {option.label}
                    </div>
                    <div className="text-gray-500 text-xs mt-0.5 line-clamp-1">
                      {option.description}
                    </div>
                  </div>
                  {selectedStatus === option.value && (
                    <div className="ml-2 p-1 bg-blue-500 rounded-full">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <div className="p-1 bg-red-100 rounded-lg">
                  <svg
                    className="h-4 w-4 text-red-600"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Update Failed
                  </h3>
                  <p className="mt-1 text-xs text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 p-4">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isUpdating}
              className="flex-1 px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 text-sm font-medium transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              disabled={isUpdating || selectedStatus === appointment.status}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200"
            >
              {isUpdating && (
                <svg
                  className="animate-spin h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              )}
              {isUpdating ? "Updating..." : "Update"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};