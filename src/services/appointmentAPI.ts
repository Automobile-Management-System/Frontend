import { config } from "@/lib/config";
import { ApiError } from "@/lib/apiUtils";
import { api as axiosApi } from "@/services/api";
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
    // Use the Services endpoint required for booking (must include serviceId)
    const url = `${config.apiBaseUrl}/Services`;
    const response = await fetch(url, getFetchOptions());

    if (!response.ok) {
      throw new ApiError("Failed to fetch services", response.status);
    }

    // Normalize response; ensure we return items with a numeric serviceId
    const data = await response.json();
    const raw: any =
      (data && (data.items ?? data.data ?? data.services)) ?? data;

    const arr: any[] = Array.isArray(raw) ? raw : [];
    const normalized: Service[] = arr
      .map((s) => {
        const id = Number(
          s?.serviceId ?? s?.ServiceId ?? s?.id ?? s?.ID ?? s?.serviceID
        );
        if (!Number.isFinite(id)) return null;
        return {
          serviceId: id,
          serviceName: s?.serviceName ?? s?.name ?? "Unnamed Service",
          description: s?.description ?? "",
          basePrice: Number(s?.basePrice ?? s?.price ?? 0) || 0,
        } as Service;
      })
      .filter(Boolean) as Service[];

    if (!Array.isArray(raw)) {
      console.warn("Unexpected services response shape:", data);
    }

    return normalized;
  },

  async getVehicles(): Promise<Vehicle[]> {
    // Use the new CustomerVehicle endpoint that returns IDs
    const url = `${config.apiBaseUrl}/CustomerVehicle/my-vehicles`;
    const response = await fetch(url, getFetchOptions());
    if (!response.ok) {
      throw new ApiError("Failed to fetch vehicles", response.status);
    }
    const data = await response.json();
    const arr: any[] = Array.isArray(data) ? data : [];
    const normalized: Vehicle[] = arr.map((v) => ({
      vehicleId:
        v?.vehicleId ??
        v?.VehicleId ??
        v?.id ??
        v?.ID ??
        v?.vehicleID ??
        v?.Id ??
        v?.customerVehicleId,
      id: v?.id,
      VehicleId: v?.VehicleId,
      ID: v?.ID,
      vehicleID: v?.vehicleID,
      Id: v?.Id,
      customerVehicleId: v?.customerVehicleId,
      make: v?.make ?? v?.brand,
      brand: v?.brand,
      model: v?.model,
      year: v?.year,
      licensePlate: v?.licensePlate,
      registrationNumber:
        v?.registrationNumber ??
        v?.vehicleRegistrationNumber ??
        v?.regNo ??
        v?.plateNumber,
      fuelType: v?.fuelType,
      chassisNumber: v?.chassisNumber,
    }));
    console.log("Vehicles from CustomerVehicle/my-vehicles:", normalized);
    return normalized;
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

    // Backend may return slot names like "EightAm","TenAm","OnePm","ThreePm".
    // Map these to numeric indices used by the UI/back-end submission: 0,1,3,4
    const nameToIndex: Record<string, number> = {
      EightAm: 0,
      TenAm: 1,
      OnePm: 3,
      ThreePm: 4,
      // tolerate lowercase/other variants
      eightam: 0,
      tenam: 1,
      onepm: 3,
      threepm: 4,
      "08:00-10:00": 0,
      "10:00-12:00": 1,
      "13:00-15:00": 3,
      "15:00-17:00": 4,
    };

    const coerceSlotIndex = (slotValue: any): number | null => {
      if (slotValue == null) return null;
      if (typeof slotValue === "number" && [0, 1, 3, 4].includes(slotValue))
        return slotValue;
      if (typeof slotValue === "string") {
        const trimmed = slotValue.trim();
        const asNum = Number(trimmed);
        if (Number.isFinite(asNum) && [0, 1, 3, 4].includes(asNum))
          return asNum;
        const mapped =
          nameToIndex[trimmed] ?? nameToIndex[trimmed.toLowerCase()];
        if (typeof mapped === "number") return mapped;
      }
      return null;
    };

    // Normalize to TimeSlot[] whether backend returns an array or a keyed object
    const normalize = (slotNum: number | null, value: any): TimeSlot | null => {
      if (slotNum == null) return null;
      const booked = Number(value?.booked ?? 0);
      const capacity = Number(value?.capacity ?? 0);
      const remainingCalc =
        capacity > 0
          ? capacity - booked
          : Number(value?.remaining ?? value?.count ?? 0);
      const remaining = Math.max(
        0,
        Number.isFinite(remainingCalc) ? remainingCalc : 0
      );
      const isAvailFlag = value?.available ?? value?.isAvailable;
      const available = Boolean(isAvailFlag ?? remaining > 0);
      return { slot: slotNum, available, count: remaining };
    };

    let out: TimeSlot[] = [];
    if (Array.isArray(data)) {
      out = data
        .map((s: any) => normalize(coerceSlotIndex(s?.slot), s))
        .filter((s: TimeSlot | null): s is TimeSlot => Boolean(s))
        .filter((s: TimeSlot) => [0, 1, 3, 4].includes(s.slot));
    } else if (data && typeof data === "object") {
      out = Object.entries<any>(data)
        .map(([k, v]) => normalize(coerceSlotIndex(k), v))
        .filter((s: TimeSlot | null): s is TimeSlot => Boolean(s))
        .filter((s) => [0, 1, 3, 4].includes(s.slot));
    }

    return out;
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
