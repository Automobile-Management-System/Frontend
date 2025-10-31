// In: types/adminPayment.ts

/**
 * Main interface for a payment object, matching the backend's AdminPaymentDetailDto.
 */
export interface AdminPayment {
    paymentId: number;
    amount: number;
    status: string;
    paymentMethod: string;
    paymentDateTime: string;
    invoiceLink: string | null;
    appointmentId: number;
    customerId: number;
    customerFirstName: string;
    customerLastName: string;
    customerEmail: string;
    customerPhoneNumber: string | null;
    appointmentType: string;
    serviceNames: string[];
    modificationTitles: string[];
  }
  
  /**
   * Enums for payment status and method, matching the backend.
   */
  export enum PaymentStatus {
    Pending = 'Pending',
    Completed = 'Completed',
    Failed = 'Failed',
    Refunded = 'Refunded',
  }
  
  export enum PaymentMethod {
    CreditCard = 'CreditCard',
    DebitCard = 'DebitCard',
    BankTransfer = 'BankTransfer',
    Cash = 'Cash',
  }
  
  /**
   * Type for the query parameters sent to the GET /payments endpoint.
   */
  export interface PaymentQueryParameters {
    pageNumber: number;
    search?: string;
    status?: PaymentStatus | string;
    paymentMethod?: PaymentMethod | string;
  }
  
  /**
   * Type for the paginated response from GET /payments.
   */
  export interface PaginatedPaymentsResponse {
    payments: AdminPayment[];
    totalCount: number;
  }
  
  /**
   * Types for the global stats endpoints.
   */
  export interface TotalRevenue {
    totalRevenue: number;
  }
  
  export interface PaymentCount {
    count: number;
  }
  
  /**
   * Combined type for the global stats state in the component.
   */
  export interface GlobalPaymentStats {
    totalRevenue: number;
    pendingCount: number;
    completedCount: number;
    failedCount: number;
  }
  
  /**
   * DTO (Data Transfer Object) for updating a payment's status.
   */
  export interface UpdatePaymentStatusDto {
    status: PaymentStatus | string;
  }