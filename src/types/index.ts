export interface Vehicle {
  vehicleId: number;
  model: string;
  registrationNumber: string;
}

export type RequestStatus = 'Pending' | 'Upcoming' | 'In Progress' | 'Completed' | 'Rejected';

export interface ModificationRequest {
  displayAmount: any;
  vehicleRegistrationNumber: string;
  modificationId: number;
  title: string;
  description: string;
  vehicleId: number;
  vehicle?: Vehicle;
  createdDate: string;
  createdDateString: string;
  createdTimeString: string;
  requestStatus: RequestStatus; // ← AppointmentStatus from backend
  appointmentId?: number;
  userId: number;
}
