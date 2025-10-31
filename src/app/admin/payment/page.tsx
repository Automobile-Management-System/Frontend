'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  DollarSign,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Calendar,
  User,
  RefreshCw,
  Download, // Added for the invoice button
} from 'lucide-react';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import ReportDownloadButton from '../../../../components/admin/ReportDownloadButton'; // This component is kept as-is

// 1. Interface matching the API response (no changes)
interface ApiPayment {
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

// Enum for status (no changes)
enum PaymentStatus {
  Pending = 'Pending',
  Completed = 'Completed',
  Failed = 'Failed',
  Refunded = 'Refunded', // Added Refunded to match your filter
}

// API URL (centralized for easy changes)
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
const PAGE_SIZE = 10; // Match your backend's DefaultPageSize

// 2. NEW: Debounce hook
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

export default function PaymentsView() {
  // 3. State for payments, loading, and errors
  const [payments, setPayments] = useState<ApiPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 4. NEW: State for Global Stats
  const [globalStats, setGlobalStats] = useState({
    totalRevenue: 0,
    pendingCount: 0,
    completedCount: 0,
    failedCount: 0,
  });

  // 5. State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterMethod, setFilterMethod] = useState<string>('all');
  const debouncedSearchTerm = useDebounce(searchTerm, 500); // 500ms delay

  // 6. Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPayments, setTotalPayments] = useState(0);
  const totalPages = Math.ceil(totalPayments / PAGE_SIZE);

  // 7. NEW: Data fetching function for Global Stats
  const fetchStats = useCallback(async () => {
    try {
      const [revenueRes, pendingRes, completedRes, failedRes] =
        await Promise.all([
          fetch(`${API_BASE_URL}/admin/payments/revenue`),
          fetch(`${API_BASE_URL}/admin/payments/count/pending`),
          fetch(`${API_BASE_URL}/admin/payments/count/completed`),
          fetch(`${API_BASE_URL}/admin/payments/count/failed`),
        ]);

      const revenueData = await revenueRes.json();
      const pendingData = await pendingRes.json();
      const completedData = await completedRes.json();
      const failedData = await failedRes.json();

      setGlobalStats({
        totalRevenue: revenueData.totalRevenue || 0,
        pendingCount: pendingData.count || 0,
        completedCount: completedData.count || 0,
        failedCount: failedData.count || 0,
      });
    } catch (e: any) {
      console.error('Failed to fetch stats:', e.message);
      toast.error('Failed to refresh dashboard stats.');
    }
  }, []);

  // 8. MODIFIED: Data fetching function for Payments (with server-side filters)
  const fetchPayments = useCallback(
    async (
      page: number,
      search: string,
      status: string,
      method: string
    ) => {
      setIsLoading(true);
      setError(null);
      try {
        // Build query parameters
        const params = new URLSearchParams();
        params.append('pageNumber', page.toString());
        if (search) params.append('search', search);
        if (status !== 'all') params.append('status', status);
        if (method !== 'all') params.append('paymentMethod', method);

        const response = await fetch(
          `${API_BASE_URL}/admin/payments?${params.toString()}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const totalCountHeader = response.headers.get('X-Total-Count');
        setTotalPayments(totalCountHeader ? parseInt(totalCountHeader, 10) : 0);

        const data: ApiPayment[] = await response.json();
        setPayments(data);
        
        // If we fetched page 1, reset to it
        if (page === 1 && currentPage !== 1) {
          setCurrentPage(1);
        }

      } catch (e: any) {
        setError(`Failed to fetch payments: ${e.message}`);
        toast.error(`Failed to fetch payments: ${e.message}`);
      } finally {
        setIsLoading(false);
      }
    },
    [currentPage] // Only re-create if currentPage changes
  );

  // 9. MODIFIED: useEffect to fetch data on mount and on filter/page change
  useEffect(() => {
    // Fetch payments when filters, debounced search, or page changes
    fetchPayments(
      currentPage,
      debouncedSearchTerm,
      filterStatus,
      filterMethod
    );
  }, [
    fetchPayments,
    currentPage,
    debouncedSearchTerm,
    filterStatus,
    filterMethod,
  ]);
  
  // 10. NEW: useEffect to fetch stats on mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // 11. MODIFIED: Update handler now re-fetches stats
  const handleStatusChange = async (paymentId: number, newStatus: string) => {
    const originalPayments = [...payments];
    const payment = originalPayments.find((p) => p.paymentId === paymentId);
    if (!payment) return;

    // Optimistic UI update
    setPayments((prevPayments) =>
      prevPayments.map((p) =>
        p.paymentId === paymentId ? { ...p, status: newStatus } : p
      )
    );

    const promise = fetch(`${API_BASE_URL}/admin/payments/${paymentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });

    toast.promise(promise, {
      loading: 'Updating status...',
      success: (response) => {
        if (!response.ok) {
          throw new Error('Failed to update status on server.');
        }
        // --- RE-FETCH DATA ON SUCCESS ---
        // Re-fetch current page (to get new invoice link if created)
        fetchPayments(
          currentPage,
          debouncedSearchTerm,
          filterStatus,
          filterMethod
        );
        // Re-fetch global stats (counts and revenue will change)
        fetchStats();
        return 'Payment status updated successfully!';
      },
      error: (err) => {
        setPayments(originalPayments); // Revert optimistic update
        return `Error: ${err.message}`;
      },
    });
  };

  // 12. Helper functions (no changes)
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Completed':
        return {
          text: 'Completed',
          icon: CheckCircle,
          color: 'text-green-600',
        };
      case 'Pending':
        return { text: 'Pending', icon: Clock, color: 'text-yellow-600' };
      case 'Failed':
        return { text: 'Failed', icon: XCircle, color: 'text-red-600' };
      case 'Refunded':
        return {
          text: 'Refunded',
          icon: DollarSign,
          color: 'text-gray-600',
        };
      default:
        return { text: status, icon: Clock, color: 'text-gray-600' };
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'CreditCard':
        return 'Credit Card';
      case 'DebitCard':
        return 'Debit Card';
      case 'BankTransfer':
        return 'Bank Transfer';
      case 'Cash':
        return 'Cash';
      default:
        return method;
    }
  };

  // 13. REMOVED: All client-side filtering logic (`filteredPayments`)

  // 14. MODIFIED: Stats array now uses globalStats state
  const stats = [
    {
      title: 'Total Revenue',
      value: `LKR ${globalStats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-green-600',
    },
    {
      title: 'Pending Payments',
      value: globalStats.pendingCount,
      icon: Clock,
      color: 'text-yellow-600',
    },
    {
      title: 'Completed Payments',
      value: globalStats.completedCount,
      icon: CheckCircle,
      color: 'text-blue-600',
    },
    {
      title: 'Failed Payments',
      value: globalStats.failedCount,
      icon: XCircle,
      color: 'text-red-600',
    },
  ];

  // Main component render
  return (
    <div className="min-h-screen bg-[#F7F9FB] p-6">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[#0B2E66]">
            Payment Management
          </h1>
          <p className="text-[#1F2A3C] mt-2">
            View and manage all payment transactions
          </p>
        </div>

        {/* Stats Cards (Now uses global data) */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.title}
                className="bg-white rounded-lg shadow p-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-[#1F2A3C]">
                    {stat.title}
                  </div>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div className="text-3xl font-bold text-[#0B2E66]">
                  {stat.value}
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters & Actions Bar */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-xl font-semibold text-[#0B2E66]">Filters</h2>

            {/* NOTE: This button component is from your original code.
                Ensure the endpoint '/admin/payments/report' exists and returns a file.
                This API endpoint was not in the provided documentation. */}
            <ReportDownloadButton
              endpoint="/admin/payments/report"
              fileName="Payments_Report.pdf"
              buttonLabel="Export Report"
              className="flex items-center gap-2 bg-[#0B2E66] hover:bg-[#1E63CC] text-white px-4 py-2 rounded-lg transition-colors"
            />
          </div>
          <div className="grid sm:grid-cols-3 gap-4 mt-4">
            <div className="space-y-2">
              <Label
                htmlFor="search"
                className="text-sm font-medium text-[#1F2A3C]"
              >
                Search
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="        Search by customer, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-full px-3 py-2 border border-[#D5D9DE] rounded-lg focus:ring-2 focus:ring-[#1E63CC] focus:border-transparent"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="status"
                className="text-sm font-medium text-[#1F2A3C]"
              >
                Status
              </Label>
              <Select
                value={filterStatus}
                onValueChange={(value) => {
                  setFilterStatus(value);
                  setCurrentPage(1); // Reset to page 1 on filter change
                }}
              >
                <SelectTrigger
                  id="status"
                  className="w-full px-3 py-2 border border-[#D5D9DE] rounded-lg focus:ring-2 focus:ring-[#1E63CC] focus:border-transparent"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                  <SelectItem value="Refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="method"
                className="text-sm font-medium text-[#1F2A3C]"
              >
                Payment Method
              </Label>
              <Select
                value={filterMethod}
                onValueChange={(value) => {
                  setFilterMethod(value);
                  setCurrentPage(1); // Reset to page 1 on filter change
                }}
              >
                <SelectTrigger
                  id="method"
                  className="w-full px-3 py-2 border border-[#D5D9DE] rounded-lg focus:ring-2 focus:ring-[#1E63CC] focus:border-transparent"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="CreditCard">Credit Card</SelectItem>
                  <SelectItem value="DebitCard">Debit Card</SelectItem>
                  <SelectItem value="BankTransfer">Bank Transfer</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Payments Table (Now uses `payments` directly) */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader className="bg-[#F7F9FB] border-b border-[#D5D9DE]">
                <TableRow>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-[#B8BDC5] uppercase tracking-wider">
                    Payment ID
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-[#B8BDC5] uppercase tracking-wider">
                    Customer
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-[#B8BDC5] uppercase tracking-wider">
                    Service / Mod
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-[#B8BDC5] uppercase tracking-wider">
                    Amount
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-[#B8BDC5] uppercase tracking-wider">
                    Method
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-[#B8BDC5] uppercase tracking-wider">
                    Status
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-[#B8BDC5] uppercase tracking-wider">
                    Date
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-[#B8BDC5] uppercase tracking-wider">
                    Invoice
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white divide-y divide-[#D5D9DE]">
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="px-6 py-12 text-center">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto text-[#B8BDC5]" />
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="px-6 py-12 text-center text-[#E63946]"
                    >
                      {error}
                    </TableCell>
                  </TableRow>
                ) : payments.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="px-6 py-12 text-center text-[#B8BDC5]"
                    >
                      No payments found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((payment) => (
                    <TableRow
                      key={payment.paymentId}
                      className="hover:bg-[#F7F9FB]"
                    >
                      <TableCell className="px-6 py-4 font-mono text-sm text-[#0B2E66]">
                        PAY-{payment.paymentId}
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-[#B8BDC5]" />
                          <div>
                            <div className="font-medium text-[#0B2E66]">
                              {payment.customerFirstName}{' '}
                              {payment.customerLastName}
                            </div>
                            <div className="text-xs text-[#1F2A3C]">
                              {payment.customerEmail}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-sm text-[#1F2A3C] max-w-[200px] truncate">
                        {payment.appointmentType === 'Service'
                          ? payment.serviceNames.join(', ') ||
                            'General Service'
                          : payment.modificationTitles.join(', ') ||
                            'General Modification'}
                      </TableCell>
                      <TableCell className="px-6 py-4 font-medium text-[#0B2E66]">
                        {`LKR ${payment.amount.toFixed(2)}`}
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-[#1F2A3C]">
                          <CreditCard className="h-4 w-4 text-[#B8BDC5]" />
                          {getPaymentMethodLabel(payment.paymentMethod)}
                        </div>
                      </TableCell>

                      {/* Interactive Status Column */}
                      <TableCell className="px-6 py-4">
                        <Select
                          value={payment.status}
                          onValueChange={(newStatus) =>
                            handleStatusChange(payment.paymentId, newStatus)
                          }
                        >
                          <SelectTrigger className="w-[120px] px-3 py-2 border border-[#D5D9DE] rounded-lg focus:ring-2 focus:ring-[#1E63CC] focus:border-transparent">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.values(PaymentStatus).map((status) => {
                              const config = getStatusConfig(status);
                              const Icon = config.icon;
                              return (
                                <SelectItem key={status} value={status}>
                                  <div className="flex items-center gap-2">
                                    <Icon
                                      className={`h-3 w-3 ${config.color}`}
                                    />
                                    {config.text}
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </TableCell>

                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm text-[#1F2A3C]">
                          <Calendar className="h-4 w-4 text-[#B8BDC5]" />
                          {new Date(
                            payment.paymentDateTime
                          ).toLocaleDateString()}
                        </div>
                      </TableCell>
                      
                      {/* --- MODIFIED INVOICE BUTTON --- */}
                      <TableCell className="px-6 py-4 text-center">
                        {payment.invoiceLink ? (
                          <Button asChild variant="outline" size="sm">
                            <a
                              href={payment.invoiceLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1"
                            >
                              <Download className="h-3 w-3" />
                              View
                            </a>
                          </Button>
                        ) : (
                          <span className="text-xs text-gray-400">N/A</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls (No changes) */}
          <div className="flex items-center justify-end space-x-2 p-4 border-t border-[#D5D9DE]">
            <span className="text-sm text-[#1F2A3C]">
              Page {currentPage} of {totalPages > 0 ? totalPages : 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || isLoading}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={currentPage >= totalPages || isLoading}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}