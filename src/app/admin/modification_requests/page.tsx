
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getSignalRConnection } from '@/lib/signalr';

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CheckCircle, XCircle, Clock, AlertCircle, User, FileText,
  Car, Calendar
} from 'lucide-react';

// ---------------------------------------------------------------------------
// INTERFACES (MATCHES API EXACTLY)
// ---------------------------------------------------------------------------
interface ModificationRequest {
  modificationId: number;
  modificationName: string;
  description: string;
  userName: string;
  vehicleNumber: string;
  status: string;
  dateTime: string;
  amount: number;
  assignee: string;
  appointmentId: number;
}

interface AssignedEmployee {
  employeeId: number;
  employeeName: string;
  assignedCount: number;
}

// ---------------------------------------------------------------------------
// FETCH HELPERS
// ---------------------------------------------------------------------------
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('authToken');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

// ---------------------------------------------------------------------------
// MAIN COMPONENT
// ---------------------------------------------------------------------------
export default function ModificationRequestsPage() {
  const [allData, setAllData] = useState<ModificationRequest[]>([]);
  const [employees, setEmployees] = useState<AssignedEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ModificationRequest | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [estimatedCost, setEstimatedCost] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [submitting, setSubmitting] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  // -------------------------------------------------------------------------
  // FETCH ALL REQUESTS
  // -------------------------------------------------------------------------
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchWithAuth(
        `${API_BASE_URL}/admin/modification-requests?pageNumber=1&pageSize=1000`
      );
      setAllData(res.data || []);
      setTotalCount(res.totalCount || 0);
    } catch (err) {
      console.error('Failed to fetch all data', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // -------------------------------------------------------------------------
  // FETCH EMPLOYEES (daily count)
  // -------------------------------------------------------------------------
  const fetchEmployeesWithDailyCount = async (date: string) => {
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/admin/modification-requests/all-employees-daily-count?date=${encodeURIComponent(date)}`
      );
      setEmployees(res || []);
    } catch (err) {
      console.error('Failed to fetch employees with daily counts', err);
    }
  };

  // -------------------------------------------------------------------------
  // SIGNALR – REAL-TIME NEW REQUEST (NO TOAST - handled by NotificationBar)
  // -------------------------------------------------------------------------
  useEffect(() => {
    const conn = getSignalRConnection();

    const handler = (newRequest: ModificationRequest) => {
      // Just update the data silently - NotificationBar handles the toast
      setAllData(prev => {
        if (prev.some(r => r.modificationId === newRequest.modificationId)) return prev;
        return [newRequest, ...prev];
      });
      setTotalCount(c => c + 1);
    };

    conn.on('NewModificationRequest', handler);

    return () => {
      conn.off('NewModificationRequest', handler);
    };
  }, []);

  // -------------------------------------------------------------------------
  // INITIAL LOAD
  // -------------------------------------------------------------------------
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // -------------------------------------------------------------------------
  // REVIEW HANDLER
  // -------------------------------------------------------------------------
  const handleReview = async (request: ModificationRequest) => {
    setSelectedRequest(request);
    setEstimatedCost(request.amount.toString());
    setSelectedAssignee(null);
    setDialogOpen(true);

    const requestDate = new Date(request.dateTime).toISOString().split('T')[0];
    await fetchEmployeesWithDailyCount(requestDate);

    if (request.assignee && request.assignee !== 'Unassigned') {
      setTimeout(() => {
        const emp = employees.find(e => e.employeeName === request.assignee);
        if (emp) setSelectedAssignee(emp.employeeId);
      }, 150);
    }
  };

  // -------------------------------------------------------------------------
  // APPROVE
  // -------------------------------------------------------------------------
  const handleApprove = async () => {
    if (!selectedRequest) return;
    try {
      setSubmitting(true);
      const payload = {
        action: 'approve',
        estimatedCost: estimatedCost ? parseFloat(estimatedCost) : undefined,
        assigneeId: selectedAssignee || undefined,
      };
      await fetchWithAuth(`${API_BASE_URL}/admin/modification-requests/${selectedRequest.modificationId}/review`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      setToastMsg({ type: 'success', message: 'Request approved successfully!' });
      setDialogOpen(false);
      await fetchAllData();
    } catch (e: any) {
      setToastMsg({ type: 'error', message: e.message || 'Failed to approve request.' });
    } finally {
      setSubmitting(false);
    }
  };

  // -------------------------------------------------------------------------
  // REJECT
  // -------------------------------------------------------------------------
  const handleReject = () => setShowRejectConfirm(true);
  const confirmReject = async () => {
    if (!selectedRequest) return;
    try {
      setSubmitting(true);
      await fetchWithAuth(`${API_BASE_URL}/admin/modification-requests/${selectedRequest.modificationId}/review`, {
        method: 'PUT',
        body: JSON.stringify({ action: 'reject' }),
      });
      setToastMsg({ type: 'success', message: 'Request rejected.' });
      setDialogOpen(false);
      setShowRejectConfirm(false);
      await fetchAllData();
    } catch (e: any) {
      setToastMsg({ type: 'error', message: e.message || 'Failed to reject request.' });
    } finally {
      setSubmitting(false);
    }
  };

  // -------------------------------------------------------------------------
  // STATUS CONFIG
  // -------------------------------------------------------------------------
  const getStatusConfig = (status: string) => {
    const s = (status ?? '').toLowerCase();
    switch (s) {
      case 'pending':
        return { text: 'Pending', className: 'bg-yellow-100 text-yellow-800', icon: Clock };
      case 'inprogress':
        return { text: 'In Progress', className: 'bg-blue-100 text-blue-800', icon: AlertCircle };
      case 'upcoming':
      case 'approved':
        return { text: 'Approved', className: 'bg-green-100 text-green-800', icon: CheckCircle };
      case 'completed':
        return { text: 'Completed', className: 'bg-green-100 text-green-800', icon: CheckCircle };
      case 'rejected':
        return { text: 'Rejected', className: 'bg-red-100 text-red-800', icon: XCircle };
      default:
        return { text: status || 'Unknown', className: 'bg-gray-100 text-gray-800', icon: Clock };
    }
  };

  // -------------------------------------------------------------------------
  // SORT / FILTER / PAGINATION (SAFE FROM UNDEFINED)
  // -------------------------------------------------------------------------
  const sortedAll = [...allData].sort((a, b) => {
    const aStatus = (a.status ?? '').toLowerCase();
    const bStatus = (b.status ?? '').toLowerCase();

    const aP = aStatus === 'pending';
    const bP = bStatus === 'pending';

    if (aP && !bP) return -1;
    if (!aP && bP) return 1;

    return new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime();
  });

  const filteredAll = filterStatus === 'all'
    ? sortedAll
    : sortedAll.filter(r => (r.status ?? '').toLowerCase() === filterStatus.toLowerCase());

  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const requestsToShow = filteredAll.slice(startIdx, endIdx);
  const totalPages = Math.ceil(filteredAll.length / pageSize);

  const goToPage = (p: number) => setCurrentPage(p);

  // -------------------------------------------------------------------------
  // PAGINATION RENDER
  // -------------------------------------------------------------------------
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);

    for (let i = start; i <= end; i++) pages.push(i);

    return (
      <div className="flex items-center justify-between px-6 py-4 border-t border-[#D5D9DE]">
        <div className="text-sm text-[#1F2A3C]">
          Showing <span className="font-medium">{startIdx + 1}</span> to{' '}
          <span className="font-medium">{Math.min(endIdx, filteredAll.length)}</span> of{' '}
          <span className="font-medium">{filteredAll.length}</span> requests
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 border border-[#D5D9DE] rounded-lg text-[#1F2A3C] hover:bg-[#F7F9FB] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          {start > 1 && (
            <>
              <button onClick={() => goToPage(1)} className="px-3 py-2 border border-[#D5D9DE] rounded-lg text-[#1F2A3C] hover:bg-[#F7F9FB] transition-colors">
                1
              </button>
              {start > 2 && <span className="px-2 text-[#B8BDC5]">...</span>}
            </>
          )}

          {pages.map(p => (
            <button
              key={p}
              onClick={() => goToPage(p)}
              className={`px-3 py-2 border rounded-lg transition-colors ${
                p === currentPage
                  ? 'bg-[#0B2E66] text-white border-[#0B2E66]'
                  : 'border-[#D5D9DE] text-[#1F2A3C] hover:bg-[#F7F9FB]'
              }`}
            >
              {p}
            </button>
          ))}

          {end < totalPages && (
            <>
              {end < totalPages - 1 && <span className="px-2 text-[#B8BDC5]">...</span>}
              <button onClick={() => goToPage(totalPages)} className="px-3 py-2 border border-[#D5D9DE] rounded-lg text-[#1F2A3C] hover:bg-[#F7F9FB] transition-colors">
                {totalPages}
              </button>
            </>
          )}

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 border border-[#D5D9DE] rounded-lg text-[#1F2A3C] hover:bg-[#F7F9FB] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  // -------------------------------------------------------------------------
  // TOAST AUTO-HIDE
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (toastMsg) {
      const t = setTimeout(() => setToastMsg(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toastMsg]);

  // -------------------------------------------------------------------------
  // STATS (SAFE FROM UNDEFINED)
  // -------------------------------------------------------------------------
  const pendingRequests = allData.filter(r => (r.status ?? '').toLowerCase() === 'pending').length;
  const approvedRequests = allData.filter(r => ['approved', 'upcoming'].includes((r.status ?? '').toLowerCase())).length;
  const rejectedRequests = allData.filter(r => (r.status ?? '').toLowerCase() === 'rejected').length;

  const stats = [
    { title: 'Total Requests', value: totalCount, color: 'text-[#0B2E66]', bgColor: 'bg-[#F7F9FB]', icon: FileText },
    { title: 'Pending', value: pendingRequests, color: 'text-[#F7D23B]', bgColor: 'bg-yellow-50', icon: Clock },
    { title: 'Approved', value: approvedRequests, color: 'text-[#33CC7A]', bgColor: 'bg-green-50', icon: CheckCircle },
    { title: 'Rejected', value: rejectedRequests, color: 'text-[#E63946]', bgColor: 'bg-red-50', icon: XCircle },
  ];

  // -------------------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------------------
  return (
    <div className="container mx-auto p-4 space-y-6">
      <h2 className="text-3xl font-bold text-[#0B2E66]">Modification Requests</h2>

      {/* Summary Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <div className={`h-10 w-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <Label className="font-semibold">Filter Status:</Label>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="inprogress">In Progress</SelectItem>
            <SelectItem value="upcoming">Approved</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-lg text-muted-foreground">Loading...</div>
        </div>
      ) : requestsToShow.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No modification requests found.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {requestsToShow.map(req => {
            const statusCfg = getStatusConfig(req.status);
            const StatusIcon = statusCfg.icon;
            return (
              <Card key={req.modificationId} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-xl">{req.modificationName}</CardTitle>
                      <CardDescription className="text-sm text-gray-600">
                        {req.description}
                      </CardDescription>
                    </div>
                    <Badge className={`${statusCfg.className} flex items-center gap-1`}>
                      <StatusIcon className="h-3 w-3" />
                      {statusCfg.text}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      <span className="font-semibold">Customer:</span>
                      <span className="text-gray-700">{req.userName || '–'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      <span className="font-semibold">Vehicle:</span>
                      <span className="text-gray-700">{req.vehicleNumber || '–'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      <span className="font-semibold">Date & Time:</span>
                      <span className="text-gray-700">
                        {req.dateTime && !isNaN(new Date(req.dateTime).getTime())
                          ? new Date(req.dateTime).toLocaleString()
                          : '–'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      <span className="font-semibold">Assignee:</span>
                      <span className="text-gray-700">{req.assignee || 'Unassigned'}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold text-[#33CC7A]">
                        Rs. {req.amount.toLocaleString()}
                      </div>
                      {(req.status ?? '').toLowerCase() === 'pending' && (
                        <Button onClick={() => handleReview(req)} className="bg-[#0B2E66] hover:bg-[#1E63CC]">
                          Review Request
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && renderPagination()}

      {/* Review Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Review Modification Request</DialogTitle>
            <DialogDescription>Approve or reject this modification request</DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div>
                  <span className="font-semibold text-lg">{selectedRequest.modificationName}</span>
                </div>
                <div className="text-sm text-gray-600">{selectedRequest.description}</div>
                <div className="grid grid-cols-2 gap-2 pt-2 text-sm">
                  <div>
                    <span className="font-semibold">Customer:</span> {selectedRequest.userName || '–'}
                  </div>
                  <div>
                    <span className="font-semibold">Vehicle:</span> {selectedRequest.vehicleNumber || '–'}
                  </div>
                  <div>
                    <span className="font-semibold">Date:</span>{' '}
                    {selectedRequest.dateTime && !isNaN(new Date(selectedRequest.dateTime).getTime())
                      ? new Date(selectedRequest.dateTime).toLocaleString()
                      : '–'}
                  </div>
                  <div>
                    <span className="font-semibold">Assignee:</span> {selectedRequest.assignee || 'Unassigned'}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cost">Estimated Cost (Rs.)</Label>
                <Input
                  id="cost"
                  type="number"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(e.target.value)}
                  placeholder="Enter estimated cost"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignee">Assign Employee</Label>
                <Select
                  value={selectedAssignee ? selectedAssignee.toString() : ''}
                  onValueChange={(val) => setSelectedAssignee(parseInt(val))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map(emp => (
                      <SelectItem key={emp.employeeId} value={emp.employeeId.toString()}>
                        {emp.employeeName} ({emp.assignedCount} assigned)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={submitting}>
              <XCircle className="h-4 w-4 mr-1" /> Reject
            </Button>
            <Button
              onClick={handleApprove}
              disabled={submitting || !selectedAssignee}
              className="bg-[#33CC7A] hover:bg-green-600 disabled:opacity-50"
            >
              <CheckCircle className="h-4 w-4 mr-1" /> Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Confirmation Dialog */}
      <Dialog open={showRejectConfirm} onOpenChange={setShowRejectConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Rejection</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this modification request? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectConfirm(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmReject} disabled={submitting}>
              Yes, Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <Alert className={toastMsg.type === 'success' ? 'bg-[#33CC7A] text-white border-[#33CC7A]' : 'bg-[#E63946] text-white border-[#E63946]'}>
            <AlertDescription className="font-semibold text-white text-base">
              {toastMsg.message}
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}