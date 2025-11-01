import { config } from "@/lib/config";
import { ApiError } from "@/lib/apiUtils";
import {
  Service,
  Vehicle,
  TimeSlot,
  CreateAppointmentDto,
  AppointmentResponse,
  AvailabilityResponse,
} from "@/types/appointments";

const getAuthHeaders = () => {
  return {
    "Content-Type": "application/json",
  };
};

const getFetchOptions = (method: string = "GET", body?: any) => {
  const options: RequestInit = {
    method,
    headers: getAuthHeaders(),
    credentials: "include", // This sends cookies
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  return options;
};

export const appointmentAPI = {
  async getServices(): Promise<Service[]> {
    const response = await fetch(
      `${config.apiBaseUrl}/Services`,
      getFetchOptions()
    );

    if (!response.ok) {
      throw new ApiError("Failed to fetch services", response.status);
    }

    return response.json();
  },

  async getVehicles(): Promise<Vehicle[]> {
    console.log(
      "Fetching vehicles from:",
      `${config.apiBaseUrl}/CustomerDashboard/vehicles`
    );
    const response = await fetch(
      `${config.apiBaseUrl}/CustomerDashboard/vehicles`,
      getFetchOptions()
    );

    if (!response.ok) {
      console.error(
        "Failed to fetch vehicles:",
        response.status,
        response.statusText
      );
      throw new ApiError("Failed to fetch vehicles", response.status);
    }

    const vehicles = await response.json();
    console.log("Raw vehicles response:", vehicles);
    return vehicles;
  },

  async getAvailability(date: string): Promise<TimeSlot[]> {
    const response = await fetch(
      `${config.apiBaseUrl}/Appointment/availability?date=${date}`,
      getFetchOptions()
    );

    if (!response.ok) {
      throw new ApiError("Failed to fetch availability", response.status);
    }

    const data = await response.json();

    // Backend returns an array of slot objects like:
    // [{ slot: 0, booked: 5, capacity: 5, remaining: 0, isAvailable: false }, ...]
    // We convert to our TimeSlot format with numeric slot index.
    const arr: any[] = Array.isArray(data) ? data : [];

    return (
      arr
        // Only consider known working slots per business hours (0,1,3,4)
        .filter((s) => [0, 1, 3, 4].includes(Number(s?.slot)))
        .map((s) => {
          const remaining = Number(
            s?.remaining ?? (s?.capacity ?? 0) - (s?.booked ?? 0)
          );
          const available = Boolean(s?.isAvailable) && remaining > 0;
          return {
            slot: Number(s?.slot),
            available,
            count: Math.max(0, remaining),
          } as TimeSlot;
        })
    );
  },

  async createAppointment(
    dto: CreateAppointmentDto
  ): Promise<AppointmentResponse> {
    console.log("Creating appointment with data:", dto);
    console.log(
      "Vehicle ID type:",
      typeof dto.vehicleId,
      "Value:",
      dto.vehicleId
    );

    const response = await fetch(
      `${config.apiBaseUrl}/Appointment/create`,
      getFetchOptions("POST", dto)
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Appointment creation failed:", response.status, errorText);
      console.error("Request payload was:", JSON.stringify(dto, null, 2));
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }
      throw new ApiError(
        errorData.message || `Failed to create appointment: ${response.status}`,
        response.status
      );
    }

    return response.json();
  },

  async getMyAppointments(): Promise<AppointmentResponse[]> {
    const response = await fetch(
      `${config.apiBaseUrl}/Appointment/my-appointments`,
      getFetchOptions()
    );

    if (!response.ok) {
      throw new ApiError("Failed to fetch appointments", response.status);
    }

    return response.json();
  },
};
