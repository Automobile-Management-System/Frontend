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
  Download,
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
import ReportDownloadButton from '../../../../components/admin/ReportDownloadButton';

// Import the new types and API service
import {
  AdminPayment,
  PaymentStatus,
  PaymentMethod,
  GlobalPaymentStats,
  PaymentQueryParameters,
} from '@/types/adminPayment'; // Adjust path as needed
import { adminPaymentAPI } from '@/services/adminPaymentAPI'; // Adjust path as needed

// Debounce hook
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
  // State for payments, loading, and errors
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for Global Stats
  const [globalStats, setGlobalStats] = useState<GlobalPaymentStats>({
    totalRevenue: 0,
    pendingCount: 0,
    completedCount: 0,
    failedCount: 0,
  });

  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterMethod, setFilterMethod] = useState<string>('all');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPayments, setTotalPayments] = useState(0);
  const totalPages = Math.ceil(totalPayments / 10); // Use hardcoded page size or import

  // Data fetching function for Global Stats
  const fetchStats = useCallback(async () => {
    try {
      const stats = await adminPaymentAPI.getGlobalStats();
      setGlobalStats(stats);
    } catch (e: any) {
      console.error('Failed to fetch stats:', e.message);
      toast.error(`Failed to refresh dashboard stats: ${e.message}`);
    }
  }, []);

  // Data fetching function for Payments
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
        const params: PaymentQueryParameters = {
          pageNumber: page,
          search: search || undefined,
          status: status !== 'all' ? status : undefined,
          paymentMethod: method !== 'all' ? method : undefined,
        };
        
        const { payments, totalCount } = await adminPaymentAPI.getPayments(params);

        setTotalPayments(totalCount);
        setPayments(payments);

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
    [currentPage]
  );

  // useEffect to fetch data on mount and on filter/page change
  useEffect(() => {
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

  // useEffect to fetch stats on mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Update handler
  const handleStatusChange = async (paymentId: number, newStatus: string) => {
    const originalPayments = [...payments];

    // Optimistic UI update
    setPayments((prevPayments) =>
      prevPayments.map((p) =>
        p.paymentId === paymentId ? { ...p, status: newStatus } : p
      )
    );

    // Use the API service
    const promise = adminPaymentAPI.updatePaymentStatus(paymentId, {
      status: newStatus,
    });

    toast.promise(promise, {
      loading: 'Updating status...',
      success: () => {
        // Re-fetch data on success
        fetchPayments(
          currentPage,
          debouncedSearchTerm,
          filterStatus,
          filterMethod
        );
        fetchStats();
        return 'Payment status updated successfully!';
      },
      error: (err: Error) => {
        setPayments(originalPayments); // Revert
        return `Error: ${err.message}`;
      },
    });
  };

  // Helper functions
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
      case PaymentMethod.CreditCard:
        return 'Credit Card';
      case PaymentMethod.DebitCard:
        return 'Debit Card';
      case PaymentMethod.BankTransfer:
        return 'Bank Transfer';
      case PaymentMethod.Cash:
        return 'Cash';
      default:
        return method;
    }
  };

  // Stats array
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

  // Main component render (JSX remains the same)
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

        {/* Stats Cards */}
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
            <ReportDownloadButton
              endpoint="/admin/payments/report"
              fileName="Payments_Report.pdf"
              buttonLabel="Export Report"
              className="flex items-center gap-2 bg-[#0B2E66] hover:bg-[#1E63CC] text-white px-4 py-2 rounded-lg transition-colors"
              // Pass current filters to the report button
              params={{
                search: debouncedSearchTerm || undefined,
                status: filterStatus !== 'all' ? filterStatus : undefined,
                paymentMethod: filterMethod !== 'all' ? filterMethod : undefined,
              }}
            />
          </div>
          <div className="grid sm:grid-cols-3 gap-4 mt-4">
            {/* Search Input */}
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
                  placeholder="Search by customer, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-full px-3 py-2 border border-[#D5D9DE] rounded-lg focus:ring-2 focus:ring-[#1E63CC] focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
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
                  setCurrentPage(1);
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
                  {Object.values(PaymentStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Method Filter */}
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
                  setCurrentPage(1);
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
                  {Object.values(PaymentMethod).map((method) => (
                    <SelectItem key={method} value={method}>
                      {getPaymentMethodLabel(method)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Payments Table */}
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

          {/* Pagination Controls */}
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