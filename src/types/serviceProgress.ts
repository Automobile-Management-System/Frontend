export type AppointmentStatus = 'Pending' | 'InProgress' | 'Completed' | 'Cancelled' | 'Rejected';

export type ServiceType = 'Service' | 'Modifications';

// Enum mappings for API communication
export const AppointmentStatusEnum = {
  'Pending': 0,
  'InProgress': 1,
  'Completed': 2,
  'Cancelled': 3,
  'Rejected': 4
} as const;

export const ServiceTypeEnum = {
  'Service': 1,
  'Modifications': 2
} as const;

// Reverse mappings for converting from API
export const AppointmentStatusFromEnum = {
  0: 'Pending',
  1: 'InProgress', 
  2: 'Completed',
  3: 'Cancelled',
  4: 'Rejected'
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