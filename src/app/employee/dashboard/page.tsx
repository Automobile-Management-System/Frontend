'use client';

import { 
  Calendar, PlayCircle, Clock, CheckCircle2, 
  TrendingUp, ArrowRight, MoreHorizontal, RefreshCw, AlertCircle 
} from 'lucide-react';
import { useEmployeeDashboard } from '@/hooks/useEmployeeDashboard';
import { useAuth } from '@/app/context/AuthContext';
import { LoadingSpinner, LoadingCard } from '@/components/ui/loading';
import { ErrorDisplay, EmptyState } from '@/components/ui/error';
import { formatApiDate, formatApiTime } from '@/lib/apiUtils';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const { 
    todayStats, 
    inProgressStats, 
    completedServiceCount,
    completedModificationCount,
    recentServices, 
    recentModifications, 
    loading, 
    error, 
    refreshData 
  } = useEmployeeDashboard();

  const formatDate = (dateString?: string | null) => formatApiDate(dateString);
  const formatTime = (timeString?: string | null) => formatApiTime(timeString);

  const getStatusColor = (status: string | undefined | null) => {
    if (!status) {
      return 'bg-gray-100 text-gray-800';
    }
    
    const normalizedStatus = status.toString().toLowerCase().trim();
    console.log('Processing status:', normalizedStatus); // Debug log
    
    switch (normalizedStatus) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'inprogress':
      case 'in progress':
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'upcoming':
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'cancelled':
      case 'canceled':
        return 'bg-red-100 text-red-800';
      case 'on hold':
      case 'on-hold':
      case 'paused':
        return 'bg-purple-100 text-purple-800';
      case 'review':
      case 'under review':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getServiceStatus = (service: any) => {
    // Check various possible status field names from the backend
    return service.status || 
           service.Status || 
           service.appointmentStatus || 
           service.AppointmentStatus ||
           service.serviceStatus ||
           service.ServiceStatus ||
           'Unknown';
  };

  const getServiceField = (service: any, fieldName: string, fallback: any = 'Unknown') => {
    // Helper function to get service field with various possible names
    let value;
    
    // Map our expected field names to actual API field names
    switch(fieldName) {
      case 'time':
      case 'date':
        value = service.startTime || service.date || service.appointmentTime || service.time;
        break;
      case 'vehicleId':
        value = service.vehicleId || service.VehicleId || service.vehicle_id;
        break;
      case 'serviceName':
        value = service.serviceName || service.ServiceName || service.service_name;
        break;
      case 'customerName':
        value = service.customerName || service.CustomerName || service.customer_name;
        break;
      case 'address':
        value = service.address || service.Address || service.location;
        break;
      default:
        value = service[fieldName] || 
                service[fieldName.charAt(0).toUpperCase() + fieldName.slice(1)] ||
                fallback;
    }
    
    console.log(`getServiceField - ${fieldName}:`, value);
    return value;
  };

  const getModificationStatus = (modification: any) => {
    // Based on your API response, the status field is 'appointmentStatus'
    const status = modification.appointmentStatus || 
           modification.status || 
           modification.Status || 
           modification.modificationStatus || 
           modification.ModificationStatus ||
           modification.projectStatus ||
           modification.ProjectStatus ||
           modification.state ||
           modification.State ||
           'Unknown';
    
    console.log('getModificationStatus - input:', modification, 'output:', status);
    return status;
  };

  const getModificationField = (modification: any, fieldName: string, fallback: any = 'Unknown') => {
    // Helper function to get field with various possible names
    let value;
    
    // Map our expected field names to actual API field names
    switch(fieldName) {
      case 'projectName':
        value = modification.modificationTitle || modification.projectName;
        break;
      case 'customerName':
        value = modification.customerName || `Vehicle ${modification.vehicleId}` || 'Unknown Customer';
        break;
      case 'dueDate':
        value = modification.date || modification.dueDate;
        break;
      case 'progress':
        value = modification.progress || 0; // Your API doesn't have progress, so default to 0
        break;
      default:
        value = modification[fieldName] || 
                modification[fieldName.charAt(0).toUpperCase() + fieldName.slice(1)] ||
                fallback;
    }
    
    console.log(`getModificationField - ${fieldName}:`, value);
    return value;
  };

  const formatStatus = (status: string | undefined | null) => {
    if (!status) return 'Unknown';
    return status.toString().charAt(0).toUpperCase() + status.toString().slice(1).toLowerCase();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingCard title="Dashboard Header" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <LoadingCard title="Today's Appointments" />
          <LoadingCard title="In Progress" />
          <LoadingCard title="Completed Services" />
          <LoadingCard title="Completed Modifications" />
        </div>
        <div className="flex items-center justify-center min-h-96">
          <LoadingSpinner size="lg" text="Loading dashboard data..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorDisplay 
        title="Error Loading Dashboard"
        message={error}
        onRetry={refreshData}
      />
    );
  }
  return (
    <div className="space-y-6 p-4">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {user?.firstName}!
            </h1>
            <p className="text-gray-600 mt-1">Here's your schedule for today</p>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={refreshData}
              className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            <div className="text-right">
              <p className="text-sm text-gray-500">Today's Date</p>
              <p className="text-lg font-semibold text-gray-900">
                {todayStats?.date ? formatDate(todayStats.date) : new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Today's Appointments */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today Upcoming Appointments</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {todayStats?.upcomingAppointmentCount ?? 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Active Tasks */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">InProgress Appointments</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {inProgressStats?.inProgressAppointmentCount ?? 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <PlayCircle className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Total Completed Services */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed Services</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {completedServiceCount?.completedServiceCount ?? 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Total Completed Modifications */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed Modifications</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {completedModificationCount?.completedModificationCount ?? 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

    
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Recent Services */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Today Recent Services</h2>
              <button className="flex items-center text-sm text-blue-600 hover:text-blue-700">
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Your recent services for {recentServices?.date ? formatDate(recentServices.date) : 'today'}
            </p>
          </div>
          
          <div className="p-6 space-y-4">
            {recentServices?.recentServices?.length ? (
              recentServices.recentServices.map((service, index) => {
                // Debug: Log the service data to see what's being received
                console.log('Service data:', service);
                
                // Create a unique key using multiple fields with fallback to index
                const uniqueKey = service?.appointmentId || 
                                 `${service?.serviceName}-${service?.customerName}-${index}` ||
                                 `service-${index}`;
                
                return (
                  <div key={uniqueKey} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-900">
                          {formatTime(getServiceField(service, 'time', null))}
                        </p>
                        <p className="text-xs text-gray-500">
                          V-{getServiceField(service, 'vehicleId', 'N/A')}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {getServiceField(service, 'serviceName', 'Unknown Service')}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {getServiceField(service, 'customerName', 'Unknown Customer')} • {getServiceField(service, 'address', 'No address')}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(getServiceStatus(service))}`}>
                      {formatStatus(getServiceStatus(service))}
                    </span>
                  </div>
                );
              })
            ) : (
              <EmptyState 
                icon={Calendar}
                title="No Recent Services"
                description="No recent services found for today"
              />
            )}
          </div>
        </div>


        {/* Today's Recent Modifications */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Today Recent Modifications</h2>
              <button className="flex items-center text-sm text-blue-600 hover:text-blue-700">
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Your recent modifications for {recentModifications?.date ? formatDate(recentModifications.date) : 'today'}
            </p>
          </div>
          
          <div className="p-6 space-y-4">
            {recentModifications?.recentModifications?.length ? (
              recentModifications.recentModifications.map((modification, index) => {
                // Enhanced Debug: Show all available fields in the modification object
                console.log('=== MODIFICATION DEBUG ===');
                console.log('Full modification object:', modification);
                console.log('Available keys:', Object.keys(modification || {}));
                console.log('modificationTitle:', modification?.modificationTitle);
                console.log('appointmentStatus:', modification?.appointmentStatus);
                console.log('vehicleId:', modification?.vehicleId);
                console.log('date:', modification?.date);
                console.log('=== END MODIFICATION DEBUG ===');
                
                // Safety check
                if (!modification) {
                  console.warn('Modification object is null or undefined');
                  return null;
                }
                
                // Create a unique key using multiple fields with fallback to index
                const uniqueKey = modification?.vehicleId ? 
                                 `${modification.vehicleId}-${modification.modificationTitle}-${modification.date}` :
                                 `${modification?.modificationTitle}-${modification?.appointmentStatus}-${index}` ||
                                 `modification-${index}`;
                
                return (
                  <div key={uniqueKey} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-900">
                          {formatTime(getModificationField(modification, 'date', null))}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {getModificationField(modification, 'projectName', 'Unknown Project')}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {getModificationField(modification, 'customerName', 'Unknown Customer')} • Due {formatDate(getModificationField(modification, 'dueDate', null))}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(getModificationStatus(modification))}`}>
                      {formatStatus(getModificationStatus(modification))}
                    </span>
                  </div>
                );
              })
            ) : (
              <EmptyState 
                icon={TrendingUp}
                title="No Recent Modifications"
                description="No recent modifications found for today"
              />
            )}
          </div>
        </div>

      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button 
            onClick={() => window.location.href = '/employee/appointments'}
            className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <Calendar className="w-5 h-5 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">View All Appointments</span>
          </button>
          <button 
            onClick={() => window.location.href = '/employee/service_progress'}
            className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">Update Progress</span>
          </button>
          <button 
            onClick={() => window.location.href = '/customer/modifications'}
            className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <MoreHorizontal className="w-5 h-5 text-orange-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">Manage Modifications</span>
          </button>
          <button 
            onClick={refreshData}
            className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <RefreshCw className="w-5 h-5 text-purple-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">Refresh Data</span>
          </button>
        </div>
      </div>
    </div>
  );
}