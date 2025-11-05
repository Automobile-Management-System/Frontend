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

interface PagedResult {
  items: Service[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
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
  const [pagedResult, setPagedResult] = useState<PagedResult | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
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
    fetchServices(currentPage);
    fetchStats();
  }, [currentPage, searchQuery]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  const fetchServices = async (page: number) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/Services?pageNumber=${page}&pageSize=10`);
      if (!response.ok) throw new Error('Failed to fetch services');
      const data: PagedResult = await response.json();
      setPagedResult(data);
      
      // Filter services based on search query
      if (searchQuery.trim()) {
        const filtered = data.items.filter(service =>
          service.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          service.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setServices(filtered);
      } else {
        setServices(data.items);
      }
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

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
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

      fetchServices(currentPage);
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
      
      // If we deleted the last item on a page other than page 1, go to previous page
      if (services.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        fetchServices(currentPage);
      }
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

  const renderPagination = () => {
    if (!pagedResult || pagedResult.totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(pagedResult.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-between px-6 py-4 border-t border-[#D5D9DE]">
        <div className="text-sm text-[#1F2A3C]">
          Showing <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> to{' '}
          <span className="font-medium">
            {Math.min(currentPage * 10, pagedResult.totalCount)}
          </span>{' '}
          of <span className="font-medium">{pagedResult.totalCount}</span> services
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!pagedResult.hasPreviousPage}
            className="px-3 py-2 border border-[#D5D9DE] rounded-lg text-[#1F2A3C] hover:bg-[#F7F9FB] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          {startPage > 1 && (
            <>
              <button
                onClick={() => handlePageChange(1)}
                className="px-3 py-2 border border-[#D5D9DE] rounded-lg text-[#1F2A3C] hover:bg-[#F7F9FB] transition-colors"
              >
                1
              </button>
              {startPage > 2 && <span className="px-2 text-[#B8BDC5]">...</span>}
            </>
          )}

          {pages.map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-2 border rounded-lg transition-colors ${
                page === currentPage
                  ? 'bg-[#0B2E66] text-white border-[#0B2E66]'
                  : 'border-[#D5D9DE] text-[#1F2A3C] hover:bg-[#F7F9FB]'
              }`}
            >
              {page}
            </button>
          ))}

          {endPage < pagedResult.totalPages && (
            <>
              {endPage < pagedResult.totalPages - 1 && <span className="px-2 text-[#B8BDC5]">...</span>}
              <button
                onClick={() => handlePageChange(pagedResult.totalPages)}
                className="px-3 py-2 border border-[#D5D9DE] rounded-lg text-[#1F2A3C] hover:bg-[#F7F9FB] transition-colors"
              >
                {pagedResult.totalPages}
              </button>
            </>
          )}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!pagedResult.hasNextPage}
            className="px-3 py-2 border border-[#D5D9DE] rounded-lg text-[#1F2A3C] hover:bg-[#F7F9FB] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  if (loading && !pagedResult) {
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
        {/* Header with Add Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#0B2E66]">Service Catalog</h1>
            <p className="text-[#1F2A3C] mt-2">
              Manage available services and pricing
            </p>
          </div>
          
          {/* Add Button */}
          <button
            onClick={() => handleOpenDialog()}
            className="flex items-center justify-center gap-2 bg-[#0B2E66] hover:bg-[#1E63CC] text-white px-6 py-2.5 rounded-lg transition-colors whitespace-nowrap"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
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

        {/* Search Bar */}
        <div className="relative w-full sm:max-w-md">
          <svg
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#B8BDC5]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search services..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-12 pr-4 py-2.5 border border-[#D5D9DE] rounded-lg focus:ring-2 focus:ring-[#1E63CC] focus:border-transparent text-[#1F2A3C]"
          />
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
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0B2E66]"></div>
                      </div>
                    </td>
                  </tr>
                ) : services.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-[#B8BDC5]">
                      No services found. Click "Add Service" to create one.
                    </td>
                  </tr>
                ) : (
                  services.map((service) => (
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
          
          {/* Pagination */}
          {renderPagination()}
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