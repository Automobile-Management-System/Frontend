'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  DollarSign, 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Clock,
  Search,
  Filter,
  Calendar,
  User,
  RefreshCw,
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
// Import the reusable report button. Adjust the path as necessary.
import ReportDownloadButton from '../../../../components/admin/ReportDownloadButton'; 

// 1. Interface matching the API response
interface ApiPayment {
  paymentId: number;
  amount: number;
  status: string; // "Pending", "Completed", etc.
  paymentMethod: string; // "BankTransfer", "CreditCard", etc.
  paymentDateTime: string;
  invoiceLink: string | null;
  appointmentId: number;
  customerId: number;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  customerPhoneNumber: string | null;
  appointmentType: string; // "Modifications", "Service"
  serviceNames: string[];
  modificationTitles: string[];
}

// Enum for status to ensure type safety
enum PaymentStatus {
  Pending = 'Pending',
  Completed = 'Completed',
  Failed = 'Failed',
  Refunded = 'Refunded'
}

// API URL (centralized for easy changes)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
const PAGE_SIZE = 10; // Match your backend's DefaultPageSize

export default function PaymentsView() {
  // 2. State for payments, loading, and errors
  const [payments, setPayments] = useState<ApiPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterMethod, setFilterMethod] = useState<string>('all');

  // 3. NEW: Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPayments, setTotalPayments] = useState(0);
  const totalPages = Math.ceil(totalPayments / PAGE_SIZE);

  // 4. MODIFIED: Data fetching function with pagination
  const fetchPayments = useCallback(async (page: number) => {
    setIsLoading(true);
    setError(null);
    try {
      // Append pageNumber to the request
      const response = await fetch(`${API_BASE_URL}/admin/payments?pageNumber=${page}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Read the total count from the response header
      const totalCountHeader = response.headers.get('X-Total-Count');
      setTotalPayments(totalCountHeader ? parseInt(totalCountHeader, 10) : 0);

      const data: ApiPayment[] = await response.json();
      setPayments(data);
    } catch (e: any) {
      setError(`Failed to fetch payments: ${e.message}`);
      toast.error(`Failed to fetch payments: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  }, []); // No dependencies, as it's called by useEffect

  // 5. MODIFIED: useEffect to fetch data on mount and on page change
  useEffect(() => {
    fetchPayments(currentPage);
  }, [fetchPayments, currentPage]);

  // 6. Update handler for PATCH
  const handleStatusChange = async (paymentId: number, newStatus: string) => {
    const originalPayments = [...payments];
    const payment = originalPayments.find(p => p.paymentId === paymentId);
    if (!payment) return;

    setPayments(prevPayments => 
      prevPayments.map(p => 
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
        return 'Payment status updated successfully!';
      },
      error: (err) => {
        setPayments(originalPayments);
        return `Error: ${err.message}`;
      },
    });
  };

  // 7. Helper functions
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Completed':
        return { 
          text: 'Completed',
          icon: CheckCircle,
          color: 'text-green-600'
        };
      case 'Pending':
        return { 
          text: 'Pending',
          icon: Clock,
          color: 'text-yellow-600'
        };
      case 'Failed':
        return { 
          text: 'Failed',
          icon: XCircle,
          color: 'text-red-600'
        };
      case 'Refunded':
        return { 
          text: 'Refunded',
          icon: DollarSign,
          color: 'text-gray-600'
        };
      default:
        return { text: status, icon: Clock, color: 'text-gray-600' };
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'CreditCard': return 'Credit Card';
      case 'DebitCard': return 'Debit Card';
      case 'BankTransfer': return 'Bank Transfer';
      case 'Cash': return 'Cash';
      default: return method;
    }
  };

  // 8. MODIFIED: Filtering logic now applies to the *paginated* data
  // Note: For server-side filtering, these filters would be passed to fetchPayments
  const filteredPayments = payments.filter(payment => {
    const customerName = `${payment.customerFirstName} ${payment.customerLastName}`.toLowerCase();
    const serviceDetails = (payment.appointmentType === 'Service'
      ? payment.serviceNames.join(' ')
      : payment.modificationTitles.join(' ')
    ).toLowerCase();
    
    const searchLower = searchTerm.toLowerCase();

    const matchesSearch = 
      customerName.includes(searchLower) ||
      serviceDetails.includes(searchLower) ||
      String(payment.paymentId).includes(searchLower) ||
      payment.customerEmail.toLowerCase().includes(searchLower);
    
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    const matchesMethod = filterMethod === 'all' || payment.paymentMethod === filterMethod;

    return matchesSearch && matchesStatus && matchesMethod;
  });

  // 9. Stats calculations
  // Note: These stats are for the *current page* only.
  // For global stats, you'd need a separate API endpoint.
  const totalRevenue = payments
    .filter(p => p.status === 'Completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingAmount = payments
    .filter(p => p.status === 'Pending')
    .reduce((sum, p) => sum + p.amount, 0);

  const stats = [
    {
      title: 'Total Revenue (Page)',
      value: `LKR ${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-green-600',
    },
    {
      title: 'Pending (Page)',
      value: `LKR ${pendingAmount.toFixed(2)}`,
      icon: Clock,
      color: 'text-yellow-600',
    },
    {
      title: 'Completed (Page)',
      value: payments.filter(p => p.status === 'Completed').length,
      icon: CheckCircle,
      color: 'text-blue-600',
    },
    {
      title: 'Failed (Page)',
      value: payments.filter(p => p.status === 'Failed').length,
      icon: XCircle,
      color: 'text-red-600',
    },
  ];

  // Main component render
  return (
    <div className="min-h-screen bg-[#F7F9FB] p-6">
      {/* MODIFIED: Removed 'max-w-7xl mx-auto' for full-width layout */}
      <div className="space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[#0B2E66]">Payment Management</h1>
          <p className="text-[#1F2A3C] mt-2">
            View and manage all payment transactions
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.title} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-[#1F2A3C]">{stat.title}</div>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div className="text-3xl font-bold text-[#0B2E66]">{stat.value}</div>
              </div>
            );
          })}
        </div>

        {/* Filters & Actions Bar */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-xl font-semibold text-[#0B2E66]">Filters</h2>
            
            {/* MODIFIED: Replaced Button with ReportDownloadButton */}
            <ReportDownloadButton
              endpoint="/admin/payments/report" // <-- Ensure this endpoint exists on your backend
              fileName="Payments_Report.pdf"
              buttonLabel="Export Report"
              className="flex items-center gap-2 bg-[#0B2E66] hover:bg-[#1E63CC] text-white px-4 py-2 rounded-lg transition-colors"
            />
          </div>
          <div className="grid sm:grid-cols-3 gap-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="search" className="text-sm font-medium text-[#1F2A3C]">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by customer, service, ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-full px-3 py-2 border border-[#D5D9DE] rounded-lg focus:ring-2 focus:ring-[#1E63CC] focus:border-transparent"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium text-[#1F2A3C]">Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger id="status" className="w-full px-3 py-2 border border-[#D5D9DE] rounded-lg focus:ring-2 focus:ring-[#1E63CC] focus:border-transparent">
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
              <Label htmlFor="method" className="text-sm font-medium text-[#1F2A3C]">Payment Method</Label>
              <Select value={filterMethod} onValueChange={setFilterMethod}>
                <SelectTrigger id="method" className="w-full px-3 py-2 border border-[#D5D9DE] rounded-lg focus:ring-2 focus:ring-[#1E63CC] focus:border-transparent">
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

        {/* Payments Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader className="bg-[#F7F9FB] border-b border-[#D5D9DE]">
                <TableRow>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-[#B8BDC5] uppercase tracking-wider">Payment ID</TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-[#B8BDC5] uppercase tracking-wider">Customer</TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-[#B8BDC5] uppercase tracking-wider">Service / Mod</TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-[#B8BDC5] uppercase tracking-wider">Amount</TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-[#B8BDC5] uppercase tracking-wider">Method</TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-[#B8BDC5] uppercase tracking-wider">Status</TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-[#B8BDC5] uppercase tracking-wider">Date</TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-[#B8BDC5] uppercase tracking-wider">Invoice</TableHead>
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
                    <TableCell colSpan={8} className="px-6 py-12 text-center text-[#E63946]">
                      {error}
                    </TableCell>
                  </TableRow>
                ) : filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="px-6 py-12 text-center text-[#B8BDC5]">
                      No payments found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.paymentId} className="hover:bg-[#F7F9FB]">
                      <TableCell className="px-6 py-4 font-mono text-sm text-[#0B2E66]">PAY-{payment.paymentId}</TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-[#B8BDC5]" />
                          <div>
                            <div className="font-medium text-[#0B2E66]">{payment.customerFirstName} {payment.customerLastName}</div>
                            <div className="text-xs text-[#1F2A3C]">{payment.customerEmail}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-sm text-[#1F2A3C] max-w-[200px] truncate">
                        {payment.appointmentType === 'Service'
                          ? payment.serviceNames.join(', ') || 'General Service'
                          : payment.modificationTitles.join(', ') || 'General Modification'
                        }
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
                            {Object.values(PaymentStatus).map(status => {
                              const config = getStatusConfig(status);
                              const Icon = config.icon;
                              return (
                                <SelectItem key={status} value={status}>
                                  <div className="flex items-center gap-2">
                                    <Icon className={`h-3 w-3 ${config.color}`} />
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
                          {new Date(payment.paymentDateTime).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 font-mono text-xs text-[#1F2A3C]">
                        {payment.invoiceLink || '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* 10. NEW: Pagination Controls */}
          <div className="flex items-center justify-end space-x-2 p-4 border-t border-[#D5D9DE]">
            <span className="text-sm text-[#1F2A3C]">
              Page {currentPage} of {totalPages > 0 ? totalPages : 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || isLoading}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => prev + 1)}
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