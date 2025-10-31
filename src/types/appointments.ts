export interface Service {
  serviceId: number;
  serviceName: string;
  description: string;
  basePrice: number;
}

export interface Vehicle {
  vehicleId?: number;
  id?: number;
  VehicleId?: number;
  ID?: number;
  vehicleID?: number;
  Id?: number;
  customerVehicleId?: number;
  make?: string;
  brand?: string;
  model: string;
  year?: number;
  licensePlate?: string;
  registrationNumber?: string;
  fuelType?: string;
  chassisNumber?: string;
}

export interface TimeSlot {
  slot: string;
  available: boolean;
  count: number;
}

export interface AvailabilityResponse {
  [key: string]: {
    available: boolean;
    count: number;
  };
}

export interface CreateAppointmentDto {
  dateTime: string;
  serviceIds: number[];
  vehicleId: number | string; // Support both number and string as backend might expect different formats
}

export interface AppointmentResponse {
  appointmentId: number;
  dateTime: string;
  status: string;
  userId: number;
  userName?: string;
  services: {
    serviceName: string;
    basePrice: number;
  }[];
}
