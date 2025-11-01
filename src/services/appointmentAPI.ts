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

    // Convert backend response to TimeSlot format
    const timeSlots = [
      { value: "08:00-10:00", label: "8:00 AM - 10:00 AM" },
      { value: "10:00-12:00", label: "10:00 AM - 12:00 PM" },
      { value: "13:00-15:00", label: "1:00 PM - 3:00 PM" },
      { value: "15:00-17:00", label: "3:00 PM - 5:00 PM" },
    ];

    return timeSlots.map((slot) => ({
      slot: slot.value,
      available: data[slot.value]?.available ?? true,
      count: data[slot.value]?.count ?? 5,
    }));
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
