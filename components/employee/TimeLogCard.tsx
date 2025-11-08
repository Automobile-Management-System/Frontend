import { Play, CheckCircle2 } from 'lucide-react';
import { EmployeeTimeLogDTO } from '@/types/employeeTimeLog';
import { formatApiDate, formatApiTime } from '@/lib/apiUtils';

interface TimeLogCardProps {
  log: EmployeeTimeLogDTO;
}

export default function TimeLogCard({ log }: TimeLogCardProps) {
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

  const getStatusBadge = () => {
    // FIX 1: 'isActive' does not exist. Use '!log.endDateTime' to check for active status.
    if (!log.endDateTime) {
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

  return (
    <div className="p-6 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h3 className="font-semibold text-gray-900">{log.customerName}</h3>
            {getStatusBadge()}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Start Time</p>
              <p className="text-sm text-gray-900">
                {formatDate(log.startDateTime)} at {formatTime(log.startDateTime)}
              </p>
            </div>

            {log.endDateTime && (
              <div>
                <p className="text-sm font-medium text-gray-600">End Time</p>
                <p className="text-sm text-gray-900">
                  {formatDate(log.endDateTime)} at {formatTime(log.endDateTime)}
                </p>
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-gray-600">Duration</p>
              <p className="text-sm text-gray-900">
                {log.hoursLogged ? `${log.hoursLogged.toFixed(1)}h` : formatDuration(log.startDateTime, log.endDateTime)}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600">Log ID</p>
              <p className="text-sm text-gray-900">#{log.logId}</p>
            </div>
          </div>

          {/* FIX 2: Use 'completedServices' and optional chaining '?.'. */}
          {log.completedServices && log.completedServices.length > 0 && (
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-600 mb-2">Services</p>
              <div className="flex flex-wrap gap-2">
                {/* FIX 3: Use 'completedServices' and add types for 'service' and 'index' */}
                {log.completedServices.map((service: string, index: number) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-medium"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* FIX 4: Use 'completedModifications' and optional chaining '?.'. */}
          {log.completedModifications && log.completedModifications.length > 0 && (
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-600 mb-2">Modifications</p>
              <div className="flex flex-wrap gap-2">
                {/* FIX 5: Use 'completedModifications' and add types for 'modification' and 'index' */}
                {log.completedModifications.map((modification: string, index: number) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-purple-100 text-purple-800 rounded-md text-xs font-medium"
                  >
                    {modification}
                  </span>
                ))}
              </div>
            </div>
          )}

          {log.notes && (
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Notes</p>
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{log.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}