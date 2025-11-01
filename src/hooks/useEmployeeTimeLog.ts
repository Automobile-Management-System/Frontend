// src/hooks/useEmployeeTimeLog.ts

import { useState, useEffect, useCallback } from 'react';
import { EmployeeTimeLogDTO, TimeLogStats, TimeLogSearchParams } from '@/types/employeeTimeLog';
import { employeeTimeLogAPI } from '@/services/employeeTimeLogAPI';

interface PaginationState {
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export function useEmployeeTimeLog() {
  const [timeLogs, setTimeLogs] = useState<EmployeeTimeLogDTO[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    totalCount: 0,
    pageNumber: 1,
    pageSize: 10,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [searchParams, setSearchParams] = useState<TimeLogSearchParams>({
    pageNumber: 1,
    pageSize: 10,
    search: '',
    startDate: '',
    endDate: '',
  });
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

  const fetchTimeLogs = useCallback(async (params?: TimeLogSearchParams) => {
    try {
      setLoading(true);
      setError(null);
      
      // Ensure defaults are properly set
      const queryParams = {
        pageNumber: 1,
        pageSize: 10,
        search: '',
        startDate: '',
        endDate: '',
        ...searchParams,
        ...params
      };
      
      const response = await employeeTimeLogAPI.getMyTimeLogs(queryParams);
      
      if (response.success) {
        setTimeLogs(response.data);
        setPagination(response.pagination);
        setStats(calculateStats(response.data));
        
        // Update search params state if new params were provided
        if (params) {
          setSearchParams(queryParams);
        }
      } else {
        throw new Error('Failed to fetch time logs');
      }
    } catch (err) {
      console.error('Error fetching time logs:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching time logs');
    } finally {
      setLoading(false);
    }
  }, [searchParams, calculateStats]);

  const updateSearch = useCallback((newParams: Partial<TimeLogSearchParams>) => {
    const updatedParams = {
      ...searchParams,
      ...newParams,
      pageNumber: newParams.pageNumber || 1, // Reset to page 1 when searching
    };
    fetchTimeLogs(updatedParams);
  }, [searchParams, fetchTimeLogs]);

  const goToPage = useCallback((page: number) => {
    const updatedParams = {
      ...searchParams,
      pageNumber: page,
    };
    fetchTimeLogs(updatedParams);
  }, [searchParams, fetchTimeLogs]);

  const refreshData = useCallback(() => {
    fetchTimeLogs();
  }, [fetchTimeLogs]);

  useEffect(() => {
    fetchTimeLogs();
  }, []);

  return {
    timeLogs,
    pagination,
    searchParams,
    stats,
    loading,
    error,
    updateSearch,
    goToPage,
    refreshData,
  };
}