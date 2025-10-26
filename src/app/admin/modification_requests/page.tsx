'use client';

import React, { useState, useEffect } from 'react';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, XCircle, Clock, AlertCircle, User, Calendar, 
  FileText, Loader2, X 
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

// Interfaces
interface ModificationRequest {
  id: number;
  customerId: number;
  customerName: string;
  appointmentId: number;
  serviceType: string;
  appointmentDate: string;
  title: string;
  description: string;
  requestType: string;
  status: string;
  estimatedCost?: number;
  adminResponse?: string;
  respondedBy?: string;
  respondedAt?: string;
  createdAt: string;
}

interface ReviewRequestPayload {
  action: 'approve' | 'reject';
  adminResponse: string;
  estimatedCost?: number;
  respondedBy: number;
}

interface ToastMessage {
  id: number;
  title: string;
  description: string;
  type: 'success' | 'error' | 'warning';
}

// API helpers
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('authToken');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      const errorText = await response.text();
      let error;
      try {
        error = JSON.parse(errorText);
      } catch {
        error = { message: errorText || 'Request failed' };
      }
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    return response.json();
  } catch (err) {
    throw err;
  }
};

const getAllRequests = async (): Promise<ModificationRequest[]> => {
  return fetchWithAuth(`${API_BASE_URL}/admin/modification-requests`);
};

const reviewRequest = async (id: number, payload: ReviewRequestPayload): Promise<ModificationRequest> => {
  return fetchWithAuth(`${API_BASE_URL}/admin/modification-requests/${id}/review`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
};

// Toast Component
function Toast({ message, onClose }: { message: ToastMessage; onClose: () => void }) {
  const bgColor =
    message.type === 'success'
      ? 'bg-green-50 border-green-200'
      : message.type === 'error'
      ? 'bg-red-50 border-red-200'
      : 'bg-yellow-50 border-yellow-200';

  const iconColor =
    message.type === 'success'
      ? 'text-green-600'
      : message.type === 'error'
      ? 'text-red-600'
      : 'text-yellow-600';

  const Icon =
    message.type === 'success'
      ? CheckCircle
      : message.type === 'error'
      ? XCircle
      : AlertCircle;

  useEffect(() => {
    const timer = setTimeout(() => onClose(), 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg ${bgColor}`}>
      <Icon className={`h-5 w-5 ${iconColor}`} />
      <div className="flex-1">
        <p className="font-semibold text-sm">{message.title}</p>
        <p className="text-sm text-gray-600 mt-1">{message.description}</p>
      </div>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// Main Component
export default function ModificationRequestsPage() {
  const [requests, setRequests] = useState<ModificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ModificationRequest | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [submitting, setSubmitting] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (title: string, description: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToasts(prev => [...prev, { id: Date.now(), title, description, type }]);
  };
  const removeToast = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await getAllRequests();
      setRequests(data);
    } catch (error: any) {
      showToast('Error', `Failed to load: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleReview = (r: ModificationRequest) => {
    setSelectedRequest(r);
    setResponseText(r.adminResponse || '');
    setEstimatedCost(r.estimatedCost?.toString() || '');
    setDialogOpen(true);
  };

  const handleApproveOrReject = async (action: 'approve' | 'reject') => {
    if (!selectedRequest) return showToast('Error', 'No request selected', 'error');
    if (!responseText.trim()) return showToast('Validation Error', 'Please provide a response', 'error');

    try {
      setSubmitting(true);
      const adminId = parseInt(localStorage.getItem('userId') || '1');
      const payload: ReviewRequestPayload = {
        action,
        adminResponse: responseText,
        estimatedCost: estimatedCost && estimatedCost.trim() !== '' ? parseFloat(estimatedCost) : undefined,
        respondedBy: adminId,
      };

      await reviewRequest(selectedRequest.id, payload);
      showToast('Success', `Request ${action}ed successfully`, 'success');
      setDialogOpen(false);
      setResponseText('');
      setEstimatedCost('');
      setSelectedRequest(null);
      await fetchRequests();
    } catch (error: any) {
      showToast('Error', `Failed to ${action}: ${error.message}`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'requested': return { className: 'bg-yellow-100 text-yellow-800', text: 'Pending', icon: Clock };
      case 'approved': return { className: 'bg-green-100 text-green-800', text: 'Approved', icon: CheckCircle };
      case 'rejected': return { className: 'bg-red-100 text-red-800', text: 'Rejected', icon: XCircle };
      case 'completed': return { className: 'bg-gray-100 text-gray-800', text: 'Completed', icon: CheckCircle };
      default: return { className: 'bg-blue-100 text-blue-800', text: status, icon: Clock };
    }
  };

  const filteredRequests = requests.filter(r =>
    filterStatus === 'all' || r.status.toLowerCase() === filterStatus.toLowerCase()
  );

  const stats = [
    { title: 'Pending', value: requests.filter(r => r.status.toLowerCase() === 'requested').length, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { title: 'Approved', value: requests.filter(r => r.status.toLowerCase() === 'approved').length, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { title: 'Rejected', value: requests.filter(r => r.status.toLowerCase() === 'rejected').length, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
    { title: 'Total', value: requests.length, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
  ];

  if (loading) return (
    <div className="flex justify-center items-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return (
    <>
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
        {toasts.map(t => <Toast key={t.id} message={t} onClose={() => removeToast(t.id)} />)}
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        <div>
          <h2 className="text-3xl font-bold mb-1">Modification Requests</h2>
          <p className="text-muted-foreground text-sm">Review and manage customer modification requests</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(stat => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm text-muted-foreground">{stat.title}</CardTitle>
                  <div className={`h-10 w-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
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
        <div className="flex flex-wrap items-center gap-4">
          <Label>Filter by Status:</Label>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Requests</SelectItem>
              <SelectItem value="requested">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Requests */}
        <div className="grid gap-6">
          {filteredRequests.map(request => {
            const statusCfg = getStatusConfig(request.status);
            const StatusIcon = statusCfg.icon;
            return (
              <Card key={request.id} className="hover:shadow-md transition-shadow p-3 sm:p-4">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                      <CardTitle className="text-lg sm:text-xl">{request.title}</CardTitle>
                      <CardDescription className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        {request.customerName}
                        <span className="mx-1">•</span>
                        <Calendar className="h-4 w-4" />
                        {new Date(request.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className={`${statusCfg.className} flex items-center gap-1`}>
                      <StatusIcon className="h-3 w-3" /> {statusCfg.text}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Service Details</p>
                    <p className="text-sm">
                      <span className="font-medium">{request.serviceType}</span> • 
                      <span> Scheduled: {new Date(request.appointmentDate).toLocaleDateString()}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Description</p>
                    <p className="text-sm">{request.description}</p>
                  </div>
                  {request.adminResponse && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Admin Response</p>
                      <p className="text-sm">{request.adminResponse}</p>
                    </div>
                  )}
                  {request.status.toLowerCase() === 'requested' && (
                    <div className="flex gap-2 pt-2">
                      <Button onClick={() => handleReview(request)}>Review Request</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {filteredRequests.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No modification requests found</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Review Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Review Modification Request</DialogTitle>
              <DialogDescription>Approve or reject the customer's modification request</DialogDescription>
            </DialogHeader>

            {selectedRequest && (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <h4 className="font-semibold">{selectedRequest.title}</h4>
                  <p className="text-sm text-muted-foreground">{selectedRequest.description}</p>
                  <div className="text-sm">
                    <span className="font-medium">Customer:</span> {selectedRequest.customerName}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Service:</span> {selectedRequest.serviceType}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cost">Estimated Additional Cost (optional)</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(e.target.value)}
                    disabled={submitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="response">Admin Response *</Label>
                  <Textarea
                    id="response"
                    placeholder="Provide details about your decision..."
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    rows={4}
                    disabled={submitting}
                  />
                </div>
              </div>
            )}

            <DialogFooter className="flex flex-wrap gap-2 justify-end">
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => handleApproveOrReject('reject')} disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <XCircle className="h-4 w-4 mr-2" />}
                Reject
              </Button>
              <Button onClick={() => handleApproveOrReject('approve')} disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                Approve
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
