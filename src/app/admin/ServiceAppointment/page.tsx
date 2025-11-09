'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { User, Calendar, Car, Wrench, Clock, CheckCircle, AlertCircle, Loader, Clock1 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert'; // <-- Added

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface ServiceAppointment {
  appointmentId: number;
  dateTime: string;
  slotTime: string;
  status: string;
  amount: number;
  customerName: string;
  vehicleNumber: string;
  services: { serviceId: number; serviceName: string; basePrice: number }[];
  assignedEmployees: { employeeId: number; employeeName: string }[];
}

interface AvailableEmployee {
  employeeId: number;
  employeeName: string;
  email: string;
  phoneNumber: string;
  assignedCount?: number;
}

// Helper for auth fetch
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('authToken');
  const headers = { 
    'Content-Type': 'application/json', 
    ...(token && { Authorization: `Bearer ${token}` }), 
    ...options.headers 
  };
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export default function ServiceAppointmentsPage() {
  const [appointments, setAppointments] = useState<ServiceAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [availableEmployees, setAvailableEmployees] = useState<AvailableEmployee[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<ServiceAppointment | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const [pageNumber, setPageNumber] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Stats from total count (not from current page)
  const [totalStats, setTotalStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0
  });

  // Toast state
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchAppointments = async (page = 1) => {
    try {
      setLoading(true);
      // Fetch all appointments to properly filter and sort
      const res = await fetchWithAuth(
        `${API_BASE_URL}/admin/service-appointments?pageNumber=1&pageSize=1000`
      );
      
      let allData = res.data || [];
      
      // Apply status filter
      if (statusFilter !== 'all') {
        allData = allData.filter((a: ServiceAppointment) => 
          a.status.toLowerCase() === statusFilter.toLowerCase()
        );
      }
      
      // Sort: pending items first, then by date descending
      const sortedData = allData.sort((a: ServiceAppointment, b: ServiceAppointment) => {
        const isPendingA = a.status.toLowerCase() === 'pending';
        const isPendingB = b.status.toLowerCase() === 'pending';
        
        // Pending items always come first
        if (isPendingA && !isPendingB) return -1;
        if (!isPendingA && isPendingB) return 1;
        
        // Within same status group, sort by date descending (latest first)
        return new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime();
      });

      // Calculate pagination after filtering
      const totalFiltered = sortedData.length;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedData = sortedData.slice(startIndex, endIndex);

      setAppointments(paginatedData);
      setTotalCount(totalFiltered);
      setPageNumber(page);
    } catch (err) {
      console.error('Failed to fetch appointments', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all appointments to calculate stats
  const fetchStats = async () => {
    try {
      // Fetch all appointments (large page size to get all)
      const res = await fetchWithAuth(
        `${API_BASE_URL}/admin/service-appointments?pageNumber=1&pageSize=1000`
      );
      const allAppointments: ServiceAppointment[] = res.data || [];
      
      setTotalStats({
        total: allAppointments.length,
        pending: allAppointments.filter(a => a.status.toLowerCase() === 'pending').length,
        inProgress: allAppointments.filter(a => a.status.toLowerCase() === 'inprogress').length,
        completed: allAppointments.filter(a => a.status.toLowerCase() === 'completed').length,
      });
    } catch (err) {
      console.error('Failed to fetch stats', err);
    }
  };

  const fetchAvailableEmployees = async (date: string, slotTime: string) => {
    try {
      // Map slot time to enum value
      const slotTimeMap: { [key: string]: number } = {
        'EightAm': 0,
        'TenAm': 1,
        'TwelvePm': 2,
        'OnePm': 3
       
      };
      
      const slotTimeValue = slotTimeMap[slotTime] ?? 0;
      
      // Fetch available employees
      const employees = await fetchWithAuth(
        `${API_BASE_URL}/admin/service-appointments/available-employees?date=${encodeURIComponent(date)}&slotTime=${slotTimeValue}`
      );

      // Fetch task count for each employee
      const employeesWithCount = await Promise.all(
        employees.map(async (emp: any) => {
          const assignments = await fetchWithAuth(
            `${API_BASE_URL}/admin/service-appointments/employee-assignments?employeeId=${emp.employeeId}&date=${encodeURIComponent(date)}`
          );
          return {
            ...emp,
            assignedCount: assignments.length
          };
        })
      );

      setAvailableEmployees(employeesWithCount);
    } catch (err) {
      console.error('Failed to fetch available employees', err);
      setAvailableEmployees([]);
    }
  };

  const handleAssignClick = (appointment: ServiceAppointment) => {
    setSelectedAppointment(appointment);
    setDialogOpen(true);
    setSelectedEmployeeId('');
    fetchAvailableEmployees(appointment.dateTime, appointment.slotTime);
  };

  const handleAssignEmployee = async () => {
    if (!selectedAppointment || !selectedEmployeeId) return;
    try {
      setSubmitting(true);
      await fetchWithAuth(
        `${API_BASE_URL}/admin/service-appointments/${selectedAppointment.appointmentId}/assign-employee`,
        {
          method: 'POST',
          body: JSON.stringify({ employeeId: parseInt(selectedEmployeeId) }),
        }
      );
      setToast({ type: 'success', message: 'Employee assigned successfully!' }); // Success toast
      setDialogOpen(false);
      await fetchAppointments(pageNumber);
      await fetchStats();
    } catch (err: any) {
      const msg = err?.message?.includes('already assigned')
        ? 'This employee is already assigned to the slot.'
        : 'Failed to assign employee. Please try again.';
      setToast({ type: 'error', message: msg }); // Error toast
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    setPageNumber(1); // Reset to page 1 when filter changes
    fetchAppointments(1);
    fetchStats();
  }, [statusFilter]);

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const getStatusBadgeColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'pending') return 'bg-yellow-100 text-yellow-800';
    if (statusLower === 'inprogress') return 'bg-blue-100 text-blue-800';
    if (statusLower === 'completed') return 'bg-green-100 text-green-800';
    if (statusLower === 'upcoming') return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  };

  const formatSlotTime = (slotTime: string): string => {
    const timeMap: { [key: string]: string } = {
      'EightAm': '08:00 AM',
      'TenAm': '10:00 AM',
      'TwelvePm': '12:00 PM',
      'OnePm': '01:00 PM',
      'ThreePm': '03:00 PM',
      'FivePm': '05:00 PM'
    };
    return timeMap[slotTime] || slotTime;
  };

  const stats = [
    { 
      title: 'Total Service Appointments', 
      value: totalStats.total, 
      color: 'text-[#0B2E66]', 
      bgColor: 'bg-[#F7F9FB]', 
      icon: Wrench 
    },
    { 
      title: 'Pending', 
      value: totalStats.pending, 
      color: 'text-[#F7D23B]', 
      bgColor: 'bg-yellow-50', 
      icon: Clock1 
    },
    { 
      title: 'In Progress', 
      value: totalStats.inProgress, 
      color: 'text-[#1E63CC]', 
      bgColor: 'bg-blue-50', 
      icon: Loader 
    },
    { 
      title: 'Completed', 
      value: totalStats.completed, 
      color: 'text-[#33CC7A]', 
      bgColor: 'bg-green-50', 
      icon: CheckCircle 
    },
  ];

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h2 className="text-3xl font-bold text-[#0B2E66]">Service Appointments</h2>

      {/* Stats Cards */}
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

      {/* Status Filter below cards */}
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium">Filter by Status:</Label>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="inprogress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12 text-muted-foreground">
          <Loader className="h-6 w-6 animate-spin mr-2" />
          Loading...
        </div>
      ) : appointments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No service appointments found.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {appointments.map(app => (
            <Card key={app.appointmentId} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl font-bold text-[#0B2E66]">
                      {new Date(app.dateTime).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </CardTitle>
                    <CardDescription className="text-base text-gray-600 mt-1 font-medium">
                      {formatSlotTime(app.slotTime)}
                    </CardDescription>
                  </div>
                  <Badge className={`capitalize text-sm px-3 py-1 ${getStatusBadgeColor(app.status)}`}>
                    {app.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-base">
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-gray-500" />
                    <span className="text-base"><strong>Customer:</strong> {app.customerName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Car className="h-5 w-5 text-gray-500" />
                    <span className="text-base"><strong>Vehicle:</strong> {app.vehicleNumber}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex items-start gap-2">
                    <Wrench className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div className="text-base">
                      <strong>Services:</strong>
                      <div className="text-gray-600 mt-1">
                        {app.services.map(s => `${s.serviceName} (Rs. ${s.basePrice})`).join(', ')}
                      </div>
                    </div>
                  </div>
                </div>

                {app.assignedEmployees.length > 0 && (
                  <div className="text-base text-gray-700 pt-2 flex items-start gap-2">
                    <User className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <strong>Assigned Employees:</strong>{' '}
                      <span className="text-gray-600">
                        {app.assignedEmployees.map(e => e.employeeName).join(', ')}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center border-t pt-3">
                  <div className="text-xl font-bold text-green-600">Rs. {app.amount.toLocaleString()}</div>
                  
                  {/* Show assign button only for pending status */}
                  {app.status.toLowerCase() === 'pending' && (
                    <Button
                      variant="default"
                      onClick={() => handleAssignClick(app)}
                      className="bg-[#0B2E66] hover:bg-[#1E63CC]"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" /> Assign Employee
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

   {/* Pagination */}
{totalPages > 1 && (
  <div className="flex justify-end gap-2 pt-6">
    <Button
      variant="outline"
      onClick={() => fetchAppointments(pageNumber - 1)}
      disabled={pageNumber === 1}
    >
      Previous
    </Button>
    
    {[...Array(totalPages)].map((_, i) => {
      const page = i + 1;
      if (
        page === 1 ||
        page === totalPages ||
        (page >= pageNumber - 1 && page <= pageNumber + 1)
      ) {
        return (
          <Button
            key={i}
            variant={page === pageNumber ? 'default' : 'outline'}
            onClick={() => fetchAppointments(page)}
            className={page === pageNumber ? 'bg-[#0B2E66]' : ''}
          >
            {page}
          </Button>
        );
      } else if (page === pageNumber - 2 || page === pageNumber + 2) {
        return <span key={i} className="px-2">...</span>;
      }
      return null;
    })}
    
    <Button
      variant="outline"
      onClick={() => fetchAppointments(pageNumber + 1)}
      disabled={pageNumber === totalPages}
    >
      Next
    </Button>
  </div>
)}


      {/* Assign Employee Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Employee</DialogTitle>
            <DialogDescription>
              Select an available employee for this appointment.
            </DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg space-y-1">
                <div className="text-base">
                  <strong>Date:</strong> {new Date(selectedAppointment.dateTime).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
                <div className="text-base">
                  <strong>Slot:</strong> {formatSlotTime(selectedAppointment.slotTime)}
                </div>
                <div className="text-base">
                  <strong>Customer:</strong> {selectedAppointment.customerName}
                </div>
                <div className="text-base">
                  <strong>Vehicle:</strong> {selectedAppointment.vehicleNumber}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Select Employee</Label>
                <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose available employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableEmployees.length === 0 ? (
                      <div className="p-2 text-gray-500 text-sm">No available employees for this slot</div>
                    ) : (
                      availableEmployees.map(emp => (
                        <SelectItem key={emp.employeeId} value={emp.employeeId.toString()}>
                          {emp.employeeName} ({emp.assignedCount})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setDialogOpen(false)} 
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignEmployee}
              disabled={!selectedEmployeeId || submitting}
              className="bg-green-600 hover:bg-green-600"
            >
              {submitting ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Assigning...
                </>
              ) : (
                'Assign'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

     {/* Toast Alert */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <Alert className={toast.type === 'success' ? 'bg-[#D1FAE5] border-[#10B981]' : 'bg-[#FEE2E2] border-[#E63946]'}>
            <AlertDescription className={`flex items-center gap-2 font-semibold text-base ${toast.type === 'success' ? 'text-[#047857]' : 'text-[#E63946]'}`}>
              {toast.type === 'success' ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              {toast.message}
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}