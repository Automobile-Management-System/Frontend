// components/employee/TimeLogFilters.tsx

import { useState } from "react";
import { Search, Calendar, Filter, X } from "lucide-react";
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
  const [showFilters, setShowFilters] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchParams.search || "");
  const [localStartDate, setLocalStartDate] = useState(
    searchParams.startDate || ""
  );
  const [localEndDate, setLocalEndDate] = useState(searchParams.endDate || "");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange({
      search: localSearch,
      pageNumber: 1,
    });
  };

  const handleDateFilter = () => {
    onFiltersChange({
      startDate: localStartDate,
      endDate: localEndDate,
      pageNumber: 1,
    });
  };

  const clearFilters = () => {
    setLocalSearch("");
    setLocalStartDate("");
    setLocalEndDate("");
    onFiltersChange({
      search: "",
      startDate: "",
      endDate: "",
      pageNumber: 1,
    });
  };

  const hasActiveFilters =
    searchParams.search || searchParams.startDate || searchParams.endDate;

  return (
    <div className="border-b border-gray-200 bg-gray-50 p-4">
      <div className="flex items-center justify-between mb-4">
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
                placeholder="Search by customer name..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[250px]"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
          </form>

          {/* View Mode Buttons: Services / Modifications */}
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
                  ? "bg-blue-100 border-blue-300 text-blue-700"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Modifications
            </button>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              showFilters || hasActiveFilters
                ? "bg-blue-100 border-blue-300 text-blue-700"
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {
                  [
                    searchParams.search,
                    searchParams.startDate,
                    searchParams.endDate,
                  ].filter(Boolean).length
                }
              </span>
            )}
          </button>

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

        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            {totalCount} {totalCount === 1 ? "log" : "logs"} found
          </div>

          {/* Page Size Selector */}
          {/* <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Show:</span>
            <select
              value={searchParams.pageSize || 10}
              onChange={(e) => onFiltersChange({ pageSize: parseInt(e.target.value), pageNumber: 1 })}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm text-gray-600">per page</span>
          </div> */}
        </div>
      </div>

      {/* Date Filters */}
      {showFilters && (
        <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">
              Date Range:
            </span>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="startDate" className="text-sm text-gray-600">
              From:
            </label>
            <input
              id="startDate"
              type="date"
              value={localStartDate}
              onChange={(e) => setLocalStartDate(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="endDate" className="text-sm text-gray-600">
              To:
            </label>
            <input
              id="endDate"
              type="date"
              value={localEndDate}
              onChange={(e) => setLocalEndDate(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          <button
            onClick={handleDateFilter}
            className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}
