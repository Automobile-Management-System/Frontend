export type AppointmentStatus = 'Upcoming' | 'InProgress' | 'Completed' | 'Pending' | 'Rejected';

export type ServiceType = 'Service' | 'Modifications';

// Enum mappings for API communication (Sending data TO API)
export const AppointmentStatusEnum = {
  'Pending': 0,
  'Upcoming': 1,
  'InProgress': 2,
  'Completed': 3,
  'Rejected': 4
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
  customerName: string;
  customerId: number; 
  customerVehicleName: string; 
  status: AppointmentStatus; 
  serviceType: ServiceType; 
  appointmentDateTime: string;
  isTimerActive: boolean;
  currentTimerStartTime?: string;
  totalTimeLogged: number;
  
  // timeLogs: TimeLogDto[]; // <-- REMOVED THIS LINE

  serviceNames: string[];
  modificationTitle?: string;
  modificationDescription?: string;
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