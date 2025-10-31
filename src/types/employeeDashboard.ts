export interface EmployeeDashboardStats {
  employeeId: number;
  date: string;
  upcomingAppointmentCount: number;
}

export interface InProgressAppointments {
  employeeId: number;
  status: string;
  inProgressAppointmentCount: number;
}

export interface CompletedServiceCount {
  employeeId: number;
  status: string;
  completedServiceCount: number;
}

export interface CompletedModificationCount {
  employeeId: number;
  status: string;
  completedModificationCount: number;
}

export interface RecentService {
  appointmentId: number;
  serviceName: string;
  customerName: string;
  startTime: string;
  endTime: string;
  status?: string;
  address: string;
}

export interface RecentServicesResponse {
  employeeId: number;
  date: string;
  recentServices: RecentService[];
}

export interface RecentModification {
  modificationTitle: string;  // Changed from projectName
  appointmentStatus: string;  // This is the status field
  vehicleId: number;         // Added vehicleId
  date: string;              // This is the date field
}

export interface RecentModificationsResponse {
  employeeId: number;
  date: string;
  recentModifications: RecentModification[];
}