// components/employee/TimeLogFilters.tsx

import { useState } from "react";
import { Search, X } from "lucide-react";
import { TimeLogSearchParams } from "@/types/employeeTimeLog";

interface TimeLogFiltersProps {
  searchParams: TimeLogSearchParams;
  onFiltersChange: (params: Partial<TimeLogSearchParams>) => void;
  totalCount: number;
  viewMode?: "services" | "modifications";
  onViewChange?: (mode: "services" | "modifications") => void;
}

export default function TimeLogFilters({
  searchParams,
  onFiltersChange,
  totalCount,
  viewMode = "services",
  onViewChange,
}: TimeLogFiltersProps) {
  const [localSearch, setLocalSearch] = useState(searchParams.search || "");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange({
      search: localSearch,
      pageNumber: 1,
    });
  };

  const clearFilters = () => {
    setLocalSearch("");
    onFiltersChange({
      search: "",
      pageNumber: 1,
    });
  };

  const hasActiveFilters = !!searchParams.search;

  return (
    <div className="border-b border-gray-200 bg-gray-50 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Search Form */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center gap-2"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by customer name, vehicle, service, or modification..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[350px]"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
          </form>

          {/* View Mode Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onViewChange && onViewChange("services")}
              className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                viewMode === "services"
                  ? "bg-blue-100 border-blue-300 text-blue-700"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Services
            </button>
            <button
              type="button"
              onClick={() => onViewChange && onViewChange("modifications")}
              className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                viewMode === "modifications"
                  ? "bg-purple-100 border-purple-300 text-purple-700"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Modifications
            </button>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>

        <div className="text-sm text-gray-600">
          {totalCount} {totalCount === 1 ? "log" : "logs"} ({viewMode})
        </div>
      </div>
    </div>
  );
}
