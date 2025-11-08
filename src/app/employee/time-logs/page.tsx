"use client";

import { useState } from "react";
import {
  Clock,
  Calendar,
  RefreshCw,
  Timer,
  TrendingUp,
  CheckCircle2,
  Play,
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
import { formatHoursAndMinutes } from "@/lib/utils";
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

  const [viewMode, setViewMode] = useState<"services" | "modifications">("services");

  const formatDate = (dateString: string) => formatApiDate(dateString);
  const formatTime = (timeString: string) => formatApiTime(timeString);



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
    <div className="p-6 max-w-8xl mx-auto">
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
          totalCount={(() => {
            switch (viewMode) {
              case "services":
                return timeLogs.filter(log => 
                  log.completedServices && log.completedServices.length > 0
                ).length;
              case "modifications":
                return timeLogs.filter(log => 
                  log.completedModifications && log.completedModifications.length > 0
                ).length;
            }
          })()}
          viewMode={viewMode}
          onViewChange={setViewMode}
        />

{(() => {
          // Filter logs based on view mode
          const getFilteredLogs = () => {
            switch (viewMode) {
              case "services":
                return timeLogs.filter(log => 
                  log.completedServices && log.completedServices.length > 0
                );
              case "modifications":
                return timeLogs.filter(log => 
                  log.completedModifications && log.completedModifications.length > 0
                );
            }
          };

          const filteredLogs = getFilteredLogs();

          if (filteredLogs.length === 0) {
            const getEmptyMessage = () => {
              switch (viewMode) {
                case "services":
                  return {
                    title: "No service time logs found",
                    description: "There are no time logs with completed services."
                  };
                case "modifications":
                  return {
                    title: "No modification time logs found", 
                    description: "There are no time logs with completed modifications."
                  };
              }
            };

            const emptyMessage = getEmptyMessage();
            return (
              <EmptyState
                icon={Clock}
                title={emptyMessage.title}
                description={emptyMessage.description}
              />
            );
          }

          return (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[150px]">Customer</TableHead>
                    <TableHead className="min-w-[120px]">Vehicle</TableHead>
                    <TableHead className="min-w-[120px]">Start Time</TableHead>
                    <TableHead className="min-w-[120px]">End Time</TableHead>
                    <TableHead className="min-w-[80px]">Hours Logged</TableHead>
                    {viewMode === "services" && (
                      <TableHead className="min-w-[250px]">Completed Services</TableHead>
                    )}
                    {viewMode === "modifications" && (
                      <TableHead className="min-w-[250px]">Completed Modifications</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.logId} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        {log.customerName}
                      </TableCell>
                      <TableCell className="font-medium text-gray-600">
                        {log.vehicleRegNumber}
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
                          {log.hoursLogged ? formatHoursAndMinutes(log.hoursLogged) : "0h 0m"}
                        </span>
                      </TableCell>

                      {/* Show only services in "services" view */}
                      {viewMode === "services" && (
                        <TableCell>
                          <div className="flex flex-wrap gap-1 max-w-[400px]">
                            {log.completedServices?.map((service, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium"
                              >
                                {service}
                              </span>
                            ))}
                          </div>
                        </TableCell>
                      )}

                      {/* Show only modifications in "modifications" view */}
                      {viewMode === "modifications" && (
                        <TableCell>
                          <div className="flex flex-wrap gap-1 max-w-[400px]">
                            {log.completedModifications?.map((modification, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium"
                              >
                                {modification}
                              </span>
                            ))}
                          </div>
                        </TableCell>
                      )}

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
