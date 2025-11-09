'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { DollarSign, Calendar, TrendingUp, FileDown, RefreshCw } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

// Updated interfaces to match backend DTOs
interface AnalyticsOverviewDto {
  totalRevenue: number;
  totalAppointments: number;
  averageRevenuePerMonth: number;
  growthRate: number;
}

interface ServiceCompletionDto {
  serviceName: string;
  totalAppointments: number;
  completedAppointments: number;
  completionRate: number;
}

interface EmployeePerformanceDto {
  employeeName: string;
  completedAppointments: number;
  revenueGenerated: number;
  averageRating: number;
}

interface RevenueTrendDto {
  revenueByMonth: { [key: string]: number };
  appointmentsByMonth: { [key: string]: number };
}

interface CustomerActivityDto {
  totalCustomers: number;
  activeCustomers: number;
  averageAppointmentsPerCustomer: number;
  averageRating: number;
}

const API_BASE = 'http://localhost:5000/api';

const AnalyticsPage: React.FC = () => {
  const [overview, setOverview] = useState<AnalyticsOverviewDto | null>(null);
  const [serviceCompletion, setServiceCompletion] = useState<ServiceCompletionDto[]>([]);
  const [employeePerformance, setEmployeePerformance] = useState<EmployeePerformanceDto[]>([]);
  const [revenueTrend, setRevenueTrend] = useState<RevenueTrendDto | null>(null);
  const [customerActivity, setCustomerActivity] = useState<CustomerActivityDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'revenue' | 'service' | 'employee'>('revenue');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const [overviewRes, serviceRes, employeeRes, trendRes, customerRes] = await Promise.all([
        fetch(`${API_BASE}/AdminAnalytics/overview`, { credentials: 'include' }),
        fetch(`${API_BASE}/AdminAnalytics/service-completion-rates`, { credentials: 'include' }),
        fetch(`${API_BASE}/AdminAnalytics/employee-performance`, { credentials: 'include' }),
        fetch(`${API_BASE}/AdminAnalytics/revenue-trend`, { credentials: 'include' }),
        fetch(`${API_BASE}/AdminAnalytics/customer-activity`, { credentials: 'include' }),
      ]);

      if (overviewRes.ok) {
        const data = await overviewRes.json();
        console.log('Overview data:', data);
        setOverview(data);
      } else {
        console.error('Overview failed:', overviewRes.status);
      }
      
      if (serviceRes.ok) {
        const data = await serviceRes.json();
        console.log('Service completion data:', data);
        setServiceCompletion(data);
      } else {
        console.error('Service completion failed:', serviceRes.status);
      }
      
      if (employeeRes.ok) {
        const data = await employeeRes.json();
        console.log('Employee performance data:', data);
        setEmployeePerformance(data);
      } else {
        console.error('Employee performance failed:', employeeRes.status);
      }
      
      if (trendRes.ok) {
        const data = await trendRes.json();
        console.log('Revenue trend data:', data);
        setRevenueTrend(data);
      } else {
        console.error('Revenue trend failed:', trendRes.status);
      }
      
      if (customerRes.ok) {
        const data = await customerRes.json();
        console.log('Customer activity data:', data);
        setCustomerActivity(data);
      } else {
        console.error('Customer activity failed:', customerRes.status);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const downloadReport = async () => {
    try {
      const response = await fetch(`${API_BASE}/AdminAnalytics/generate-report`, { credentials: 'include' });
      
      if (response.status === 403) {
        alert('Access Denied: You do not have permission to download this report.');
        return;
      }

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'AnalyticsReport.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Failed to download report. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Format month labels (e.g., "2025-01" -> "Jan")
  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short' });
  };

  // Revenue Trend Chart Data
  const revenueTrendChartData = revenueTrend && 
    revenueTrend.revenueByMonth && 
    Object.keys(revenueTrend.revenueByMonth).length > 0 ? {
    labels: Object.keys(revenueTrend.revenueByMonth).map(formatMonth),
    datasets: [
      {
        label: 'Revenue (Rs)',
        data: Object.values(revenueTrend.revenueByMonth),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        yAxisID: 'y',
      },
      {
        label: 'Appointments',
        data: Object.values(revenueTrend.appointmentsByMonth || {}),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        yAxisID: 'y1',
      },
    ],
  } : null;

  const revenueTrendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#fff',
        titleColor: '#000',
        bodyColor: '#000',
        borderColor: '#e5e7eb',
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        beginAtZero: true,
        grid: {
          color: '#e5e7eb',
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        beginAtZero: true,
        grid: {
          drawOnChartArea: false,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  // Monthly Comparison Chart Data
  const monthlyComparisonData = revenueTrend && 
    revenueTrend.revenueByMonth && 
    Object.keys(revenueTrend.revenueByMonth).length > 0 ? {
    labels: Object.keys(revenueTrend.revenueByMonth).map(formatMonth),
    datasets: [
      {
        label: 'Revenue (Rs)',
        data: Object.values(revenueTrend.revenueByMonth),
        backgroundColor: '#3b82f6',
        borderRadius: 6,
      },
    ],
  } : null;

  const monthlyComparisonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#fff',
        titleColor: '#000',
        bodyColor: '#000',
        borderColor: '#e5e7eb',
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#e5e7eb',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-semibold text-[#0B2E66]">Analytics & Reports</h1>
          <p className="text-gray-600 mt-1">Track performance and generate insights</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            variant="outline"
            className="bg-[#0B2E66] hover:bg-[#0a2757] text-white border-0 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={downloadReport}
            className="bg-[#0B2E66] hover:bg-[#0a2757] text-white border-0 shadow-sm"
          >
            <FileDown className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-3xl font-semibold mt-2">Rs {overview.totalRevenue.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">Year to date</p>
                </div>
                <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600">Appointments</p>
                  <p className="text-3xl font-semibold mt-2">{overview.totalAppointments}</p>
                  <p className="text-xs text-gray-500 mt-1">Total bookings</p>
                </div>
                <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600">Avg Revenue</p>
                  <p className="text-3xl font-semibold mt-2">Rs {overview.averageRevenuePerMonth.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">Per month</p>
                </div>
                <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600">Growth Rate</p>
                  <p className={`text-3xl font-semibold mt-2 ${overview.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {overview.growthRate >= 0 ? '+' : ''}{overview.growthRate.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Month over month</p>
                </div>
                <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className={`h-5 w-5 ${overview.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('revenue')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'revenue'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Revenue & Appointments
        </button>
        <button
          onClick={() => setActiveTab('service')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'service'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Service Distribution
        </button>
        <button
          onClick={() => setActiveTab('employee')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'employee'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Employee Performance
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'revenue' && (
        <div className="space-y-6">
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Revenue Trend</CardTitle>
              <CardDescription className="text-sm text-gray-500">Monthly revenue and appointment volume</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {revenueTrendChartData ? (
                <Line data={revenueTrendChartData} options={revenueTrendOptions} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <p className="text-sm">No revenue data available</p>
                    <p className="text-xs mt-1">Data will appear once transactions are recorded</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Monthly Comparison</CardTitle>
              <CardDescription className="text-sm text-gray-500">Revenue by month</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {monthlyComparisonData ? (
                <Bar data={monthlyComparisonData} options={monthlyComparisonOptions} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <p className="text-sm">No monthly data available</p>
                    <p className="text-xs mt-1">Data will appear once transactions are recorded</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'service' && (
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Service Distribution</CardTitle>
            <CardDescription className="text-sm text-gray-500">Total and completed appointments by service</CardDescription>
          </CardHeader>
          <CardContent>
            {serviceCompletion.length > 0 ? (
              <div className="space-y-3">
                {serviceCompletion.map((service, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-sm transition-all"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{service.serviceName}</h3>
                    </div>
                    
                    <div className="flex items-center gap-8">
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">Total</p>
                        <p className="text-xl font-bold text-gray-900">{service.totalAppointments}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">Completed</p>
                        <p className="text-xl font-bold text-green-600">{service.completedAppointments}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-500">
                <div className="text-center">
                  <p className="text-sm">No service data available</p>
                  <p className="text-xs mt-1">Data will appear once services are created and appointments are made</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'employee' && (
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Employee Performance</CardTitle>
            <CardDescription className="text-sm text-gray-500">Completed appointments and revenue generated</CardDescription>
          </CardHeader>
          <CardContent>
            {employeePerformance.length > 0 ? (
              <div className="space-y-6">
                {employeePerformance.map((emp, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{emp.employeeName}</p>
                        <p className="text-xs text-gray-500">
                          {emp.completedAppointments} appointments • Rs {emp.revenueGenerated.toLocaleString()} revenue • ⭐ {emp.averageRating.toFixed(1)}
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${Math.min((emp.completedAppointments / Math.max(...employeePerformance.map(e => e.completedAppointments))) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-500">
                <div className="text-center">
                  <p className="text-sm">No employee performance data available</p>
                  <p className="text-xs mt-1">Data will appear once employees complete appointments</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnalyticsPage;
