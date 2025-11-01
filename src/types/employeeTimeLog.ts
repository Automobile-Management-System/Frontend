// src/types/employeeTimeLog.ts

export interface EmployeeTimeLogDTO {
  logId: number;
  startDateTime: string;
  endDateTime?: string;
  hoursLogged?: number;
  isActive: boolean;
  notes?: string;
  customerName: string;
  services: string[];
  modifications: string[];
}

export interface PaginatedEmployeeTimeLogResponse {
  success: boolean;
  pagination: {
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  data: EmployeeTimeLogDTO[];
}

export interface TimeLogSearchParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface TimeLogStats {
  totalHoursToday: number;
  totalHoursThisWeek: number;
  totalHoursThisMonth: number;
  activeLogs: number;
  completedLogsToday: number;
}