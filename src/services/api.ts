// src/services/api.ts
import axios from 'axios';
import { Vehicle } from '@/types';

const VEHICLE_URL = 'http://localhost:5001/api/CustomerVehicle';
const BASE_URL = 'http://localhost:5001/api/customer-modification-requests';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

const vehicleInstance = axios.create({
  baseURL: VEHICLE_URL,
  withCredentials: true,
});

// Type for creating request
export interface CreateRequestPayload {
  title: string;
  description: string;
  vehicleId: number;
  requestDate: string; // ISO string
}

export const api = {
  // Requests
  getAllRequests: () => axiosInstance.get(''),
  createRequest: (data: CreateRequestPayload) => axiosInstance.post('', data),

  // Vehicles
  getUserVehicles: () => vehicleInstance.get<Vehicle[]>('/my-vehicles'),
};
