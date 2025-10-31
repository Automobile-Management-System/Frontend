import React from "react";
import { PlusCircle } from "lucide-react";

export interface ModificationCardProps {
  title: string;
  description: string;
  appointmentSummary?: string;
  createdDateString?: string;
  createdTimeString?: string;
  requestStatus: "Pending" | "InProgress" | "Completed" | "Rejected";
}

const statusColors: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-800",
  InProgress: "bg-blue-100 text-blue-800",
  Completed: "bg-green-100 text-green-800",
  Rejected: "bg-red-100 text-red-800",
};

export const ModificationCard: React.FC<ModificationCardProps> = ({
  title,
  description,
  appointmentSummary,
  createdDateString,
  createdTimeString,
  requestStatus,
}) => (
  <div className="bg-white rounded-2xl shadow p-6 border border-gray-100 hover:shadow-lg transition group">
    <div className="flex items-center gap-3 mb-2">
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-blue-700">
        <PlusCircle size={22} />
      </div>
      <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
      <span
        className={`ml-auto px-3 py-1 text-xs rounded-full font-semibold tracking-wide shadow-sm ${
          statusColors[requestStatus] || "bg-gray-100 text-gray-600"
        }`}
      >
        {requestStatus}
      </span>
    </div>
    <p className="text-gray-600 mb-2 line-clamp-2">{description}</p>
    {appointmentSummary && (
      <div className="flex items-center text-sm text-gray-400 mb-1">
        <span>{appointmentSummary}</span>
      </div>
    )}
    {(createdDateString || createdTimeString) && (
      <div className="text-xs text-gray-400 mt-1">
        {createdDateString && <span>Created: {createdDateString}</span>}
        {createdTimeString && <span> ⏰ {createdTimeString}</span>}
      </div>
    )}
  </div>
);
