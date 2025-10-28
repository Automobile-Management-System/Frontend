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
    newStatus: AppointmentStatus,
    notes?: string
  ) => void;
}

export const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({
  appointment,
  onClose,
  onUpdate,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<AppointmentStatus>(
    appointment.status
  );
  const [notes, setNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const statusOptions: {
    value: AppointmentStatus;
    label: string;
    description: string;
  }[] = [
    {
      value: "Pending",
      label: "Pending",
      description: "Service is scheduled but not started",
    },
    {
      value: "InProgress",
      label: "In Progress",
      description: "Currently working on the service",
    },
    {
      value: "Completed",
      label: "Completed",
      description: "Service has been finished",
    },
    {
      value: "Cancelled",
      label: "Cancelled",
      description: "Service has been cancelled",
    },
    {
      value: "Rejected",
      label: "Rejected",
      description: "Service request was rejected",
    },
  ];

  const handleUpdate = async () => {
    setIsUpdating(true);
    setError(null);
    try {
      await onUpdate(
        appointment.appointmentId,
        selectedStatus,
        notes || undefined
      );
    } catch (err) {
      console.error("Status update error:", err);
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl max-w-lg w-full border border-white/20 overflow-hidden transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-width">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold text-white">
                Update Service Status
              </h3>
              <p className="text-blue-100 mt-1">
                Modify the current status of the service
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-blue-100 hover:text-white hover:bg-white/20 rounded-full p-2 transition-colors duration-200"
            >
              <svg
                className="w-6 h-6"
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
        <div className="p-8">
          {/* Service Info */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 mb-8 border border-gray-100">
            <div className="flex items-start gap-4">
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
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012-2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">
                  {appointment.serviceTitle}
                </h4>
                <div className="space-y-1">
                  <p className="text-gray-700 flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-gray-500"
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
                    {appointment.customerName}
                  </p>
                  <p className="text-gray-700 flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-gray-500"
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
                    Current:{" "}
                    <span className="font-semibold">{appointment.status}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Status Selection */}
          <div className="mb-8">
            <label className="block text-lg font-semibold text-gray-900 mb-4">
              Select New Status
            </label>
            <div className="space-y-3">
              {statusOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-start cursor-pointer p-4 rounded-2xl border-2 transition-all duration-200 hover:shadow-md ${
                    selectedStatus === option.value
                      ? "border-blue-500 bg-blue-50 shadow-lg"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value={option.value}
                    checked={selectedStatus === option.value}
                    onChange={(e) =>
                      setSelectedStatus(e.target.value as AppointmentStatus)
                    }
                    className="mt-1 mr-4 w-5 h-5 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 text-lg">
                      {option.label}
                    </div>
                    <div className="text-gray-600 mt-1">
                      {option.description}
                    </div>
                  </div>
                  {selectedStatus === option.value && (
                    <div className="ml-2 p-1 bg-blue-500 rounded-full">
                      <svg
                        className="w-4 h-4 text-white"
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

          {/* Notes */}
          <div className="mb-8">
            <label
              htmlFor="notes"
              className="block text-lg font-semibold text-gray-900 mb-4"
            >
              Additional Notes{" "}
              <span className="text-gray-500 font-normal">(Optional)</span>
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 resize-none text-gray-900 placeholder-gray-400"
              placeholder="Add any additional notes about the status change, reasons, or next steps..."
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-8 p-6 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-2xl">
              <div className="flex items-start">
                <div className="p-2 bg-red-100 rounded-xl">
                  <svg
                    className="h-6 w-6 text-red-600"
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
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-red-800">
                    Unable to Update Status
                  </h3>
                  <p className="mt-2 text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-200 p-8">
          <div className="flex flex-col sm:flex-row gap-4 sm:justify-end">
            <button
              onClick={onClose}
              disabled={isUpdating}
              className="px-8 py-4 text-gray-700 bg-white border-2 border-gray-300 rounded-2xl hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 font-semibold transition-all duration-200 transform hover:scale-105 disabled:transform-none"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              disabled={isUpdating || selectedStatus === appointment.status}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none"
            >
              {isUpdating && (
                <svg
                  className="animate-spin h-5 w-5"
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
              {isUpdating ? "Updating..." : "Update Status"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
