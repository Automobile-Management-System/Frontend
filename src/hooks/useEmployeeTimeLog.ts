// src/hooks/useEmployeeTimeLog.ts

import { useState, useEffect, useCallback } from 'react';
import { EmployeeTimeLogDTO, TimeLogStats } from '@/types/employeeTimeLog';
import { employeeTimeLogAPI } from '@/services/employeeTimeLogAPI';

export function useEmployeeTimeLog() {
  const [timeLogs, setTimeLogs] = useState<EmployeeTimeLogDTO[]>([]);
  const [stats, setStats] = useState<TimeLogStats>({
    totalHoursToday: 0,
    totalHoursThisWeek: 0,
    totalHoursThisMonth: 0,
    activeLogs: 0,
    completedLogsToday: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateStats = useCallback((logs: EmployeeTimeLogDTO[]): TimeLogStats => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let totalHoursToday = 0;
    let totalHoursThisWeek = 0;
    let totalHoursThisMonth = 0;
    let activeLogs = 0;
    let completedLogsToday = 0;

    logs.forEach(log => {
      const logDate = new Date(log.startDateTime);
      const hours = log.hoursLogged || 0;

      // Count active logs
      if (log.isActive) {
        activeLogs++;
      }

      // Today's stats
      if (logDate >= today) {
        totalHoursToday += hours;
        if (!log.isActive) {
          completedLogsToday++;
        }
      }

      // This week's stats
      if (logDate >= startOfWeek) {
        totalHoursThisWeek += hours;
      }

      // This month's stats
      if (logDate >= startOfMonth) {
        totalHoursThisMonth += hours;
      }
    });

    return {
      totalHoursToday,
      totalHoursThisWeek,
      totalHoursThisMonth,
      activeLogs,
      completedLogsToday,
    };
  }, []);

  const fetchTimeLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await employeeTimeLogAPI.getMyTimeLogs();
      
      if (response.success) {
        setTimeLogs(response.data);
        setStats(calculateStats(response.data));
      } else {
        throw new Error('Failed to fetch time logs');
      }
    } catch (err) {
      console.error('Error fetching time logs:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching time logs');
    } finally {
      setLoading(false);
    }
  }, [calculateStats]);

  const refreshData = useCallback(() => {
    fetchTimeLogs();
  }, [fetchTimeLogs]);

  useEffect(() => {
    fetchTimeLogs();
  }, [fetchTimeLogs]);

  return {
    timeLogs,
    stats,
    loading,
    error,
    refreshData,
  };
}