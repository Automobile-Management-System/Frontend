export type AppointmentStatus = 'Pending' | 'InProgress' | 'Completed';

export type ServiceType = 'Service' | 'Modifications';

// Enum mappings for API communication
export const AppointmentStatusEnum = {
  'Pending': 1,      // Now maps to 1 (Upcoming)
  'Completed': 2,    // Now maps to 2 (Completed)
  'InProgress': 3    // Now maps to 3 (In Progress)
} as const;

export const ServiceTypeEnum = {
  'Service': 1,
  'Modifications': 2
} as const;

// Reverse mappings for converting from API
export const AppointmentStatusFromEnum = {
  1: 'Pending',      // API sends 1 → display as "Upcoming" (Pending)
  2: 'Completed',    // API sends 2 → display as "Completed"
  3: 'InProgress'    // API sends 3 → display as "In Progress"
} as const;

export const ServiceTypeFromEnum = {
  1: 'Service',
  2: 'Modifications'
} as const;

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
  customerId: number; // Made required - should be provided by backend
  status: AppointmentStatus;
  serviceType: ServiceType;
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
  newStatus: AppointmentStatus;
  userId: number;
  notes?: string;
}

export interface TimerResponseDto {
  success: boolean;
  message: string;
  activeTimeLog?: TimeLogDto;
  totalTimeLogged: number;
}