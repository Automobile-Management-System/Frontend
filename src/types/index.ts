// src/types/index.ts

export interface Vehicle {
  vehicleId: number;
  model: string;
  registrationNumber: string;
}

export type RequestStatus = 'Pending' | 'In Progress' | 'Completed' | 'Rejected';

export interface ModificationRequest {
  modificationId: number;
  title: string;
  description: string;
  vehicleId: number;
  vehicle?: Vehicle;
  createdDate: string;
  createdDateString: string;
  createdTimeString: string;
  requestStatus: RequestStatus;
  appointmentId?: number;
  appointmentSummary?: string;
  userId: number;
}
