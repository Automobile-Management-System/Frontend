import { useState, useEffect } from 'react';
import { adminDashboardAPI, DashboardData, SystemAlert } from '@/lib/api/adminDashboard';

export const useAdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching dashboard data...');
      const data = await adminDashboardAPI.getDashboardData();
      console.log('Dashboard data received:', data);
      setDashboardData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dashboard data';
      setError(errorMessage);
      console.error('Dashboard API Error:', err);
      console.error('Error details:', {
        message: errorMessage,
        stack: err instanceof Error ? err.stack : undefined
      });
    } finally {
      setLoading(false);
    }
  };

  const markAlertAsRead = async (alertId: string) => {
    try {
      await adminDashboardAPI.markAlertAsRead(alertId);
      // Update local state to mark alert as read
      if (dashboardData) {
        const updatedAlerts = dashboardData.systemAlerts.map(alert =>
          alert.id === alertId ? { ...alert, isRead: true } : alert
        );
        setDashboardData({
          ...dashboardData,
          systemAlerts: updatedAlerts
        });
      }
    } catch (err) {
      console.error('Error marking alert as read:', err);
    }
  };

  const refreshData = () => {
    fetchDashboardData();
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return {
    dashboardData,
    loading,
    error,
    markAlertAsRead,
    refreshData,
  };
};