// src/types/employeeTimeLog.ts

export interface EmployeeTimeLogDTO {
  logId: number;
  customerName: string;
  vehicleRegNumber: string;
  startDateTime: string;
  endDateTime?: string;
  hoursLogged?: number;
  notes?: string;
  completedServices?: string[];
  completedModifications?: string[];
}

export interface PaginatedEmployeeTimeLogResponse {
  data: EmployeeTimeLogDTO[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface TimeLogSearchParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
}

export interface TimeLogStats {
  totalHoursToday: number;
  totalHoursThisWeek: number;
  totalHoursThisMonth: number;
  activeLogs: number;
  completedLogsToday: number;
}