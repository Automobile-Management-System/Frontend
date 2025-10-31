import axios from 'axios';

const BASE_URL = 'https://localhost:7230/api/customer-modification-requests';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // Get all requests (optional)
  getAllRequests: () => axiosInstance.get(''),

  // Get requests for a specific user
  getUserRequests: (userId: number) => axiosInstance.get(`/user/${userId}`),

  // Add a new request
  createRequest: (data: any) => axiosInstance.post('', data),

  // ✅ Get vehicles for a specific user
  getUserVehicles: (userId: number) =>
    axios.get(`https://localhost:7230/api/customer-vehicles/user/${userId}`),
};
