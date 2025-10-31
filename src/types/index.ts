// src/types/index.ts
export interface Vehicle {
  vehicleId: Key | null | undefined;
  id: number;
  model: string;
  registrationNumber: string;
}

export interface ModificationRequest {
  modificationId: number;
  title: string;
  description: string;
  vehicleId: number;
  vehicle?: Vehicle;
  createdDate: string;
  createdDateString: string;
  requestStatus: 'Pending' | 'In Progress' | 'Completed';
  appointmentId?: number;
  appointmentSummary?: string;
  userId: number;
}