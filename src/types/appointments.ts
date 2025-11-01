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
  // Numeric slot index from backend (e.g., 0,1,3,4)
  slot: number;
  available: boolean;
  // Remaining capacity for that slot
  count: number;
}

export interface AvailabilityResponse {
  [key: string]: {
    available: boolean;
    count: number;
  };
}

export interface CreateAppointmentDto {
  // Backend expects a date-only string under the key `appointmentDateTime`
  // Example: "2025-11-01"
  appointmentDateTime: string;
  // Backend expects a slot index (0-based):
  // 0 -> 08:00-10:00, 1 -> 10:00-12:00, 2 -> 13:00-15:00, 3 -> 15:00-17:00
  slotsTime: number;
  serviceIds: number[];
  vehicleId: number;
}

export interface AppointmentResponse {
  appointmentId: number;
  dateTime: string;
  status: string | number;
  userId: number;
  userName?: string;
  services: {
    serviceName: string;
    basePrice: number;
  }[];
  // Optional vehicle info (backend may return any of these)
  vehicleId?: number | string;
  registrationNumber?: string;
  licensePlate?: string;
  vehicleRegistrationNumber?: string;
  vehicle?: Partial<Vehicle>;
}
