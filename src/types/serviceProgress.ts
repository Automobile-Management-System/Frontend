export type AppointmentStatus = 'Upcoming' | 'InProgress' | 'Completed' | 'Pending' | 'Rejected';

export type ServiceType = 'Service' | 'Modifications';

// Enum mappings for API communication (Sending data TO API)
// This now matches your C# Enums.cs file
export const AppointmentStatusEnum = {
  'Pending': 0,
  'Upcoming': 1,
  'InProgress': 2,
  'Completed': 3,
  'Rejected': 4
} as const;

// NOTE: AppointmentStatusFromEnum and ServiceTypeFromEnum have been removed
// as the API now sends strings directly.

export interface TimeLogDto {
  logId: number;
  startDateTime: string;
  endDateTime?: string;
  hoursLogged: number;
  isActive: boolean;
}

export interface ServiceProgressDto {
  appointmentId: number;
  serviceTitle: string;
  customerName: string;
  customerId: number; 
  status: AppointmentStatus; // Type is now the string union
  serviceType: ServiceType; // Type is now the string union
  appointmentDateTime: string;
  isTimerActive: boolean;
  currentTimerStartTime?: string;
  totalTimeLogged: number;
  timeLogs: TimeLogDto[];
}

export interface TimerActionDto {
  appointmentId: number;
  userId: number;
}

export interface UpdateStatusDto {
  appointmentId: number;
  newStatus: AppointmentStatus; // This is a string
  userId: number;
  notes?: string;
}

export interface TimerResponseDto {
  success: boolean;
  message: string;
  activeTimeLog?: TimeLogDto;
  totalTimeLogged: number;
}