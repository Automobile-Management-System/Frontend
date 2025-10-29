'use client';

import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface Service {
  serviceId: number;
  serviceName: string;
  description: string;
  basePrice: number;
}

interface ServiceStats {
  totalServices: number;
  averagePrice: number;
}

interface ServiceFormData {
  serviceName: string;
  description: string;
  basePrice: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export default function ServiceManagementPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [stats, setStats] = useState<ServiceStats>({ totalServices: 0, averagePrice: 0 });
  const [loading, setLoading] = useState(true);
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; serviceId: number | null }>({ 
    open: false, 
    serviceId: null 
  });
  
  const [formData, setFormData] = useState<ServiceFormData>({
    serviceName: '',
    description: '',
    basePrice: 0
  });

  useEffect(() => {
    fetchServices();
    fetchStats();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  const fetchServices = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/Services`);
      if (!response.ok) throw new Error('Failed to fetch services');
      const data = await response.json();
      setServices(data);
    } catch (error) {
      showToast('Failed to load services', 'error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/Services/stats`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleOpenDialog = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setFormData({
        serviceName: service.serviceName,
        description: service.description,
        basePrice: service.basePrice
      });
    } else {
      setEditingService(null);
      setFormData({
        serviceName: '',
        description: '',
        basePrice: 0
      });
    }
    setServiceDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setServiceDialogOpen(false);
    setEditingService(null);
    setFormData({
      serviceName: '',
      description: '',
      basePrice: 0
    });
  };

  const handleSubmit = async () => {
    if (!formData.serviceName || !formData.description || formData.basePrice <= 0) {
      showToast('Please fill in all fields correctly', 'error');
      return;
    }

    try {
      if (editingService) {
        const response = await fetch(`${API_BASE_URL}/Services/${editingService.serviceId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (!response.ok) throw new Error('Failed to update service');
        showToast('Service updated successfully', 'success');
      } else {
        const response = await fetch(`${API_BASE_URL}/Services`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (!response.ok) throw new Error('Failed to create service');
        showToast('Service created successfully', 'success');
      }

      fetchServices();
      fetchStats();
      handleCloseDialog();
    } catch (error) {
      showToast(editingService ? 'Failed to update service' : 'Failed to create service', 'error');
      console.error(error);
    }
  };

  const handleDeleteClick = (id: number) => {
    setDeleteDialog({ open: true, serviceId: id });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.serviceId) return;

    try {
      const response = await fetch(`${API_BASE_URL}/Services/${deleteDialog.serviceId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete service');
      
      showToast('Service deleted successfully', 'success');
      fetchServices();
      fetchStats();
    } catch (error) {
      showToast('Failed to delete service', 'error');
      console.error(error);
    } finally {
      setDeleteDialog({ open: false, serviceId: null });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, serviceId: null });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0B2E66]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9FB] p-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <Alert className={toast.type === 'success' ? 'bg-[#33CC7A] text-white border-[#33CC7A]' : 'bg-[#E63946] text-white border-[#E63946]'}>
            <AlertDescription className="font-semibold text-white text-base">
              {toast.message}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !open && handleDeleteCancel()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the service from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-[#E63946] hover:bg-[#d42f3d]">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Service Dialog */}
      {serviceDialogOpen && (
        <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-2xl font-bold text-[#1F2A3C] mb-4">
              {editingService ? 'Edit Service' : 'Add New Service'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1F2A3C] mb-1">
                  Service Name
                </label>
                <input
                  type="text"
                  value={formData.serviceName}
                  onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
                  className="w-full px-3 py-2 border border-[#D5D9DE] rounded-lg focus:ring-2 focus:ring-[#1E63CC] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1F2A3C] mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-[#D5D9DE] rounded-lg focus:ring-2 focus:ring-[#1E63CC] focus:border-transparent"
                  rows={3}
                />
              </div>
               <div>
                <label className="block text-sm font-medium text-[#1F2A3C] mb-1">
                  Base Price (LKR)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.basePrice || ''}
                  onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-[#D5D9DE] rounded-lg focus:ring-2 focus:ring-[#1E63CC] focus:border-transparent"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseDialog}
                  className="flex-1 px-4 py-2 border border-[#D5D9DE] rounded-lg text-[#1F2A3C] hover:bg-[#F7F9FB] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex-1 px-4 py-2 bg-[#0B2E66] text-white rounded-lg hover:bg-[#1E63CC] transition-colors"
                >
                  {editingService ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[#0B2E66]">Automobile Service Management</h1>
          <p className="text-[#1F2A3C] mt-2">
            Manage your automobile services and pricing
          </p>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#0B2E66]">Service Catalog</h2>
            <p className="text-sm text-[#B8BDC5]">Manage available services and pricing</p>
          </div>
          <button
            onClick={() => handleOpenDialog()}
            className="flex items-center gap-2 bg-[#0B2E66] hover:bg-[#1E63CC] text-white px-4 py-2 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Service
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-[#1F2A3C] mb-2">Total Services</div>
            <div className="text-3xl font-bold text-[#0B2E66]">{stats.totalServices}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-[#1F2A3C] mb-2">Average Price</div>
            <div className="text-3xl font-bold text-[#0B2E66]">
              {stats.averagePrice.toFixed(2)} <span className="text-lg text-[#B8BDC5]">LKR</span>
            </div>
          </div>
        </div>

        {/* Services Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F7F9FB] border-b border-[#D5D9DE]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#B8BDC5] uppercase tracking-wider">
                    Service Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#B8BDC5] uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#B8BDC5] uppercase tracking-wider">
                    Base Price
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-[#B8BDC5] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#D5D9DE]">
                {services.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-[#B8BDC5]">
                      No services found. Click "Add Service" to create one.
                    </td>
                  </tr>
                ) : (
                  [...services].sort((a, b) => a.serviceName.localeCompare(b.serviceName)).map((service) => (
                    <tr key={service.serviceId} className="hover:bg-[#F7F9FB]">
                      <td className="px-6 py-4">
                        <div className="font-medium text-[#0B2E66]">{service.serviceName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-[#1F2A3C]">{service.description}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 font-medium text-[#0B2E66]">
                          {service.basePrice.toFixed(2)} <span className="text-sm text-[#B8BDC5]">LKR</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenDialog(service)}
                            className="p-2 text-[#0B2E66] hover:bg-[#F7F9FB] rounded-lg transition-colors"
                            title="Edit"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteClick(service.serviceId)}
                            className="p-2 text-[#E63946] hover:bg-[#FEF2F2] rounded-lg transition-colors"
                            title="Delete"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}