// src/services/api.ts
import axios from 'axios';

const BASE_URL = 'http://localhost:5001/api/customer-modification-requests';
const VEHICLE_URL = 'http://localhost:5001/api/customer-vehicles';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

const vehicleInstance = axios.create({
  baseURL: VEHICLE_URL,
  withCredentials: true,
});

export const api = {
  getAllRequests: () => axiosInstance.get(''),
  createRequest: (data: any) => axiosInstance.post('', data),
  getUserVehicles: () => vehicleInstance.get(''),
};
