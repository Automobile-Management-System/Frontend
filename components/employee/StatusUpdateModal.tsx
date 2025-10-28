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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full m-4">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Update Service Status
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
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

        {/* Content */}
        <div className="p-6">
          {/* Service Info */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-1">
              {appointment.serviceTitle}
            </h4>
            <p className="text-sm text-gray-600">
              Customer: {appointment.customerName}
            </p>
            <p className="text-sm text-gray-600">
              Current Status: {appointment.status}
            </p>
          </div>

          {/* Status Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              New Status
            </label>
            <div className="space-y-2">
              {statusOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex items-start cursor-pointer"
                >
                  <input
                    type="radio"
                    name="status"
                    value={option.value}
                    checked={selectedStatus === option.value}
                    onChange={(e) =>
                      setSelectedStatus(e.target.value as AppointmentStatus)
                    }
                    className="mt-1 mr-3"
                  />
                  <div>
                    <div className="font-medium text-gray-900">
                      {option.label}
                    </div>
                    <div className="text-sm text-gray-600">
                      {option.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add any additional notes about the status change..."
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
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
                    Error updating status
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            disabled={isUpdating}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={isUpdating || selectedStatus === appointment.status}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
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
            Update Status
          </button>
        </div>
      </div>
    </div>
  );
};
