import { useState, useEffect } from 'react';
import { employeeDashboardAPI } from '@/services/employeeDashboardAPI';
import { handleApiError } from '@/lib/apiUtils';
import { 
  EmployeeDashboardStats, 
  InProgressAppointments, 
  CompletedServiceCount,
  CompletedModificationCount,
  RecentServicesResponse, 
  RecentModificationsResponse 
} from '@/types/employeeDashboard';

interface DashboardData {
  upcomingStats: EmployeeDashboardStats | null;
  inProgressStats: InProgressAppointments | null;
  completedServiceCount: CompletedServiceCount | null;
  completedModificationCount: CompletedModificationCount | null;
  recentServices: RecentServicesResponse | null;
  recentModifications: RecentModificationsResponse | null;
}

interface DashboardState extends DashboardData {
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

export const useEmployeeDashboard = (): DashboardState => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    upcomingStats: null,
    inProgressStats: null,
    completedServiceCount: null,
    completedModificationCount: null,
    recentServices: null,
    recentModifications: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [upcomingStats, inProgressStats, completedServiceCount, completedModificationCount, recentServices, recentModifications] = await Promise.all([
        employeeDashboardAPI.getUpcomingAppointments(),
        employeeDashboardAPI.getInProgressAppointments(),
        employeeDashboardAPI.getCompletedServiceCount(),
        employeeDashboardAPI.getCompletedModificationCount(),
        employeeDashboardAPI.getRecentServices(),
        employeeDashboardAPI.getRecentModifications(),
      ]);

      // Debug: Log the API responses to see the actual data structure
      console.log('=== API DEBUG RESPONSES ===');
      console.log('upcomingStats:', JSON.stringify(upcomingStats, null, 2));
      console.log('inProgressStats:', JSON.stringify(inProgressStats, null, 2));
      console.log('completedServiceCount:', JSON.stringify(completedServiceCount, null, 2));
      console.log('completedModificationCount:', JSON.stringify(completedModificationCount, null, 2));
      console.log('recentServices:', JSON.stringify(recentServices, null, 2));
      console.log('recentModifications:', JSON.stringify(recentModifications, null, 2));
      console.log('=== END API DEBUG ===');

      setDashboardData({
        upcomingStats,
        inProgressStats,
        completedServiceCount,
        completedModificationCount,
        recentServices,
        recentModifications,
      });
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Dashboard data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    await fetchDashboardData();
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return {
    ...dashboardData,
    loading,
    error,
    refreshData,
  };
};