// In: services/adminPaymentAPI.ts

import {
    AdminPayment,
    GlobalPaymentStats,
    PaginatedPaymentsResponse,
    PaymentCount,
    PaymentQueryParameters,
    TotalRevenue,
    UpdatePaymentStatusDto,
  } from '@/types/adminPayment'; // Adjust this import path as needed
  import { ApiError, handleApiError } from '@/lib/apiUtils'; // Adjust this import path
  import { config } from '@/lib/config'; // Adjust this import path
  
  class AdminPaymentAPI {
    /**
     * Helper for standard GET requests that return JSON.
     */
    private async makeRequest<T>(endpoint: string): Promise<T> {
      try {
        const response = await fetch(`${config.apiBaseUrl}${endpoint}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
  
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new ApiError(
            errorData?.message || `HTTP error! status: ${response.status}`,
            response.status,
            errorData
          );
        }
  
        return await response.json();
      } catch (error) {
        if (error instanceof ApiError) {
          throw error;
        }
        throw new Error(handleApiError(error));
      }
    }
  
    /**
     * Helper for mutations (PATCH, POST) that expect a 204 No Content response.
     */
    private async makeMutationRequest(
      endpoint: string,
      method: 'PATCH' | 'POST',
      body: any
    ): Promise<void> {
      try {
        const response = await fetch(`${config.apiBaseUrl}${endpoint}`, {
          method: method,
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(body),
        });
  
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new ApiError(
            errorData?.message || `HTTP error! status: ${response.status}`,
            response.status,
            errorData
          );
        }
        // 204 No Content successfully returns void
        return;
      } catch (error) {
        if (error instanceof ApiError) {
          throw error;
        }
        throw new Error(handleApiError(error));
      }
    }
  
    /**
     * Fetches the paginated list of payments.
     */
    async getPayments(
      params: PaymentQueryParameters
    ): Promise<PaginatedPaymentsResponse> {
      const queryParams = new URLSearchParams();
      queryParams.append('pageNumber', params.pageNumber.toString());
  
      // Add optional parameters if they exist
      if (params.search) queryParams.append('search', params.search);
      if (params.status && params.status !== 'all')
        queryParams.append('status', params.status);
      if (params.paymentMethod && params.paymentMethod !== 'all')
        queryParams.append('paymentMethod', params.paymentMethod);
  
      try {
        const response = await fetch(
          `${config.apiBaseUrl}/admin/payments?${queryParams.toString()}`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          }
        );
  
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new ApiError(
            errorData?.message || `HTTP error! status: ${response.status}`,
            response.status,
            errorData
          );
        }
  
        const payments: AdminPayment[] = await response.json();
        const totalCountHeader = response.headers.get('X-Total-Count');
        const totalCount = totalCountHeader
          ? parseInt(totalCountHeader, 10)
          : 0;
  
        return { payments, totalCount };
      } catch (error) {
        if (error instanceof ApiError) {
          throw error;
        }
        throw new Error(handleApiError(error));
      }
    }
  
    /**
     * Fetches all global stats in parallel.
     */
    async getGlobalStats(): Promise<GlobalPaymentStats> {
      try {
        const [revenueData, pendingData, completedData, failedData] =
          await Promise.all([
            this.makeRequest<TotalRevenue>('/admin/payments/revenue'),
            this.makeRequest<PaymentCount>('/admin/payments/count/pending'),
            this.makeRequest<PaymentCount>('/admin/payments/count/completed'),
            this.makeRequest<PaymentCount>('/admin/payments/count/failed'),
          ]);
  
        return {
          totalRevenue: revenueData.totalRevenue || 0,
          pendingCount: pendingData.count || 0,
          completedCount: completedData.count || 0,
          failedCount: failedData.count || 0,
        };
      } catch (error) {
        console.error('Failed to fetch global stats:', error);
        throw new Error(handleApiError(error));
      }
    }
  
    /**
     * Updates a payment's status.
     */
    async updatePaymentStatus(
      id: number,
      dto: UpdatePaymentStatusDto
    ): Promise<void> {
      return this.makeMutationRequest(`/admin/payments/${id}`, 'PATCH', dto);
    }
  }
  
  export const adminPaymentAPI = new AdminPaymentAPI();