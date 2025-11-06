"use client";

import { useState } from "react";
import {
  Clock,
  Calendar,
  Play,
  CheckCircle2,
  RefreshCw,
  Timer,
  TrendingUp,
} from "lucide-react";
import { useEmployeeTimeLog } from "@/hooks/useEmployeeTimeLog";
import { useAuth } from "@/app/context/AuthContext";
import { LoadingSpinner, LoadingCard } from "@/components/ui/loading";
import { ErrorDisplay, EmptyState } from "@/components/ui/error";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatApiDate, formatApiTime } from "@/lib/apiUtils";
import TimeLogStatsCard from "../../../../components/employee/TimeLogStatsCard";
import TimeLogFilters from "../../../../components/employee/TimeLogFilters";
import TimeLogPagination from "../../../../components/employee/TimeLogPagination";

export default function EmployeeTimeLogsPage() {
  const { user } = useAuth();
  const {
    timeLogs,
    pagination,
    searchParams,
    stats,
    loading,
    error,
    updateSearch,
    goToPage,
    refreshData,
  } = useEmployeeTimeLog();

  const [viewMode, setViewMode] = useState<"services" | "modifications">(
    "services"
  );

  const formatDate = (dateString: string) => formatApiDate(dateString);
  const formatTime = (timeString: string) => formatApiTime(timeString);

  const formatDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const diffMs = end.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return (
        <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
          <Play className="w-3 h-3" />
          Active
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
          <CheckCircle2 className="w-3 h-3" />
          Completed
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <LoadingSpinner />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {[...Array(5)].map((_, i) => (
            <LoadingCard key={i} title="Loading stats..." />
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <LoadingCard key={i} title="Loading time logs..." />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <ErrorDisplay message={error} onRetry={refreshData} />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Time Logs</h1>
          <p className="text-gray-600 mt-1">
            Track your working hours and activities
          </p>
        </div>
        <button
          onClick={refreshData}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <TimeLogStatsCard
          title="Today's Hours"
          value={`${stats.totalHoursToday.toFixed(1)}h`}
          icon={Timer}
          colorClass="bg-blue-100 text-blue-600"
        />
        <TimeLogStatsCard
          title="This Week"
          value={`${stats.totalHoursThisWeek.toFixed(1)}h`}
          icon={TrendingUp}
          colorClass="bg-green-100 text-green-600"
        />
        <TimeLogStatsCard
          title="This Month"
          value={`${stats.totalHoursThisMonth.toFixed(1)}h`}
          icon={Calendar}
          colorClass="bg-purple-100 text-purple-600"
        />
        <TimeLogStatsCard
          title="Active Logs"
          value={stats.activeLogs}
          icon={Play}
          colorClass="bg-yellow-100 text-yellow-600"
        />
        <TimeLogStatsCard
          title="Completed Today"
          value={stats.completedLogsToday}
          icon={CheckCircle2}
          colorClass="bg-green-100 text-green-600"
        />
      </div>

      {/* Time Logs Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Recent Time Logs
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Your recorded working sessions
              </p>
            </div>
            <div className="text-sm text-gray-500">
              Page {pagination.pageNumber} of {pagination.totalPages}
            </div>
          </div>
        </div>

        {/* Filters */}
        <TimeLogFilters
          searchParams={searchParams}
          onFiltersChange={updateSearch}
          viewMode={viewMode}
          onViewChange={(m) => setViewMode(m)}
          totalCount={pagination.totalCount}
        />

        {(() => {
          const filteredLogs = timeLogs.filter((log) =>
            viewMode === "services"
              ? log.services.length > 0
              : log.modifications.length > 0
          );

          if (filteredLogs.length === 0) {
            return (
              <EmptyState
                icon={Clock}
                title={
                  viewMode === "services"
                    ? "No service time logs found"
                    : "No modification time logs found"
                }
                description={
                  viewMode === "services"
                    ? "There are no time logs containing services."
                    : "There are no time logs containing modifications."
                }
              />
            );
          }

          return (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {/* <TableHead className="min-w-[80px]">Log ID</TableHead> */}
                    <TableHead className="min-w-[150px]">Customer</TableHead>
                    <TableHead className="min-w-[120px]">Start Time</TableHead>
                    <TableHead className="min-w-[120px]">End Time</TableHead>
                    <TableHead className="min-w-[80px]">Duration</TableHead>
                    <TableHead className="min-w-[100px]">Status</TableHead>
                    {viewMode === "services" ? (
                      <TableHead className="min-w-[150px]">Services</TableHead>
                    ) : (
                      <TableHead className="min-w-[150px]">
                        Modifications
                      </TableHead>
                    )}
                    <TableHead className="min-w-[200px]">Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.logId} className="hover:bg-gray-50">
                      {/* <TableCell className="font-mono text-sm">#{log.logId}</TableCell> */}
                      <TableCell className="font-medium">
                        {log.customerName}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">
                            {formatDate(log.startDateTime)}
                          </div>
                          <div className="text-gray-500">
                            {formatTime(log.startDateTime)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {log.endDateTime ? (
                          <div className="text-sm">
                            <div className="font-medium">
                              {formatDate(log.endDateTime)}
                            </div>
                            <div className="text-gray-500">
                              {formatTime(log.endDateTime)}
                            </div>
                          </div>
                        ) : (
                          <span className="text-yellow-600 text-sm font-medium">
                            Ongoing
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-blue-600">
                          {log.hoursLogged
                            ? `${log.hoursLogged.toFixed(1)}h`
                            : formatDuration(
                                log.startDateTime,
                                log.endDateTime
                              )}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(log.isActive)}</TableCell>
                      <TableCell>
                        {viewMode === "services" ? (
                          log.services.length > 0 ? (
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                              {log.services
                                .slice(0, 2)
                                .map((service, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium"
                                  >
                                    {service}
                                  </span>
                                ))}
                              {log.services.length > 2 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                                  +{log.services.length - 2} more
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">None</span>
                          )
                        ) : log.modifications.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {log.modifications
                              .slice(0, 2)
                              .map((modification, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium"
                                >
                                  {modification}
                                </span>
                              ))}
                            {log.modifications.length > 2 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                                +{log.modifications.length - 2} more
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">None</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {log.notes ? (
                          <div className="max-w-[200px]">
                            <p
                              className="text-sm text-gray-700 truncate"
                              title={log.notes}
                            >
                              {log.notes}
                            </p>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">
                            No notes
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          );
        })()}

        {/* Pagination */}
        {timeLogs.length > 0 && (
          <TimeLogPagination
            currentPage={pagination.pageNumber}
            totalPages={pagination.totalPages}
            hasNextPage={pagination.hasNextPage}
            hasPreviousPage={pagination.hasPreviousPage}
            onPageChange={goToPage}
            totalCount={pagination.totalCount}
            pageSize={pagination.pageSize}
          />
        )}
      </div>
    </div>
  );
}
