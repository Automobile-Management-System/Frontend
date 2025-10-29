'use client';

import React, { useState, useEffect } from 'react';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, XCircle, Clock, AlertCircle, User,  FileText, 
  Hourglass
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

// Interfaces
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

// Fetch helpers
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('authToken');
  const headers = { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }), ...options.headers };
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export default function ModificationRequestsPage() {
  const [requests, setRequests] = useState<ModificationRequest[]>([]);
  const [employees, setEmployees] = useState<AssignedEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ModificationRequest | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [estimatedCost, setEstimatedCost] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [submitting, setSubmitting] = useState(false);

  // Fetch modification requests
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await fetchWithAuth(`${API_BASE_URL}/admin/modification-requests`);
      setRequests(res.data || []);
    } catch (err) {
      console.error('Failed to fetch requests', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch assigned appointments for employees
  const fetchEmployees = async () => {
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/admin/modification-requests/assigned-appointments`);
      setEmployees(res || []);
    } catch (err) {
      console.error('Failed to fetch employees', err);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchEmployees();
  }, []);

  const handleReview = (request: ModificationRequest) => {
    setSelectedRequest(request);
    setEstimatedCost(request.amount.toString());
    setSelectedAssignee(request.assignee === 'Unassigned' ? null : employees.find(e => e.employeeName === request.assignee)?.employeeId || null);
    setDialogOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    try {
      setSubmitting(true);
      const payload = {
        action: 'approve',
        estimatedCost: estimatedCost ? parseFloat(estimatedCost) : undefined,
        assigneeId: selectedAssignee || undefined
      };
      await fetchWithAuth(`${API_BASE_URL}/admin/modification-requests/${selectedRequest.modificationId}/review`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      setDialogOpen(false);
      await fetchRequests();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    try {
      setSubmitting(true);
      const payload = {
        action: 'reject'
      };
      await fetchWithAuth(`${API_BASE_URL}/admin/modification-requests/${selectedRequest.modificationId}/review`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      setDialogOpen(false);
      await fetchRequests();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return { text: 'Pending', className: 'bg-yellow-100 text-yellow-800', icon: Clock };
      case 'inprogress': return { text: 'In Progress', className: 'bg-blue-100 text-blue-800', icon: AlertCircle };
      case 'approved': return { text: 'Approved', className: 'bg-green-100 text-green-800', icon: CheckCircle };
      case 'rejected': return { text: 'Rejected', className: 'bg-red-100 text-red-800', icon: XCircle };
      default: return { text: status, className: 'bg-gray-100 text-gray-800', icon: Clock };
    }
  };


  const filteredRequests = requests.filter(r => filterStatus === 'all' || r.status.toLowerCase() === filterStatus.toLowerCase());
// Summary statistics
const totalRequests = requests.length;
const pendingRequests = requests.filter(r => r.status.toLowerCase() === 'pending').length;
const inProgressRequests = requests.filter(r => r.status.toLowerCase() === 'inprogress').length;
const completedRequests = requests.filter(r => r.status.toLowerCase() === 'completed').length;
const RejectedRequests = requests.filter(r => r.status.toLowerCase() === 'rejected').length;
const UpcomingRequests = requests.filter(r => r.status.toLowerCase() === 'upcoming').length;

const stats = [
  { title: 'Total Requests', value: totalRequests, color: 'text-blue-600', bgColor: 'bg-blue-50', icon: FileText },
  { title: 'Pending', value: pendingRequests, color: 'text-yellow-600', bgColor: 'bg-yellow-50', icon: Clock },
    { title: 'Approved', value: UpcomingRequests, color: 'text-blue-600', bgColor: 'bg-blue-50', icon: CheckCircle },
  { title: 'In Progress', value: inProgressRequests, color: 'text-yellow-600', bgColor: 'bg-yellow-50', icon: Hourglass },
  { title: 'Completed', value: completedRequests, color: 'text-green-600', bgColor: 'bg-green-50', icon: CheckCircle },
  { title: 'Rejected', value: RejectedRequests, color: 'text-red-600', bgColor: 'bg-red-50', icon: XCircle },
];

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h2 className="text-2xl font-bold">Modification Requests</h2>
{/* Summary Stats */}
<div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
  {stats.map(stat => {
    const Icon = stat.icon;
    return (
      <Card key={stat.title}>
        <CardHeader className="flex justify-between items-center pb-2">
          <CardTitle className="text-sm text-muted-foreground">{stat.title}</CardTitle>
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
        <Label>Filter Status:</Label>
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
      {loading ? <p>Loading...</p> : (
        <div className="grid gap-4">
          {filteredRequests.map(req => {
            const statusCfg = getStatusConfig(req.status);
            const StatusIcon = statusCfg.icon;
            return (
              <Card key={req.modificationId}>
                <CardHeader className="flex justify-between">
                  <div>
                    <CardTitle>{req.modificationName}</CardTitle>
                    <CardDescription>
                      <User className="h-4 w-4 inline" /> {req.userName} • {req.vehicleNumber} • {new Date(req.dateTime).toLocaleString()}
                    </CardDescription>
                  </div>
                  <Badge className={statusCfg.className}>
                    <StatusIcon className="h-4 w-4 mr-1 inline" /> {statusCfg.text}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p>{req.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    Rs. {req.amount}
                  </div>
                  <div className="mt-2">Assignee: {req.assignee}</div>
                  {req.status.toLowerCase() === 'pending' && (
                    <Button className="mt-2" onClick={() => handleReview(req)}>Review</Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Review Request</DialogTitle>
            <DialogDescription>Approve or reject this modification request</DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div>
                <p><strong>{selectedRequest.modificationName}</strong></p>
                <p>{selectedRequest.description}</p>
                <p>Customer: {selectedRequest.userName}</p>
                <p>Vehicle: {selectedRequest.vehicleNumber}</p>
                <p>Date: {new Date(selectedRequest.dateTime).toLocaleString()}</p>
                <p>Current Assignee: {selectedRequest.assignee}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost">Estimated Cost</Label>
                <Input id="cost" type="number" value={estimatedCost} onChange={e => setEstimatedCost(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignee">Assign Employee</Label>
                <Select value={selectedAssignee ? selectedAssignee.toString() : ''} onValueChange={val => setSelectedAssignee(parseInt(val))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map(emp => (
                      <SelectItem key={emp.employeeId} value={emp.employeeId.toString()}>
                        {emp.employeeName} ({emp.assignedCount})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={submitting}><XCircle className="h-4 w-4 mr-1" /> Reject</Button>
            <Button onClick={handleApprove} disabled={submitting}><CheckCircle className="h-4 w-4 mr-1" /> Approve</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
