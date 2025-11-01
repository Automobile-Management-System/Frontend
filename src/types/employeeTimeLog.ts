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

export interface EmployeeTimeLogResponse {
  success: boolean;
  count: number;
  data: EmployeeTimeLogDTO[];
}

export interface TimeLogStats {
  totalHoursToday: number;
  totalHoursThisWeek: number;
  totalHoursThisMonth: number;
  activeLogs: number;
  completedLogsToday: number;
}