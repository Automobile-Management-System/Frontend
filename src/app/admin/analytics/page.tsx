'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Users, Calendar, DollarSign, UserCheck, FileDown, RefreshCw, TrendingUp, BarChart3 } from 'lucide-react';

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

interface AnalyticsOverviewDto {
  totalAppointments: number;
  completedAppointments: number;
  totalRevenue: number;
  totalCustomers: number;
  totalEmployees: number;
}

interface ServiceCompletionDto {
  serviceName: string;
  totalAppointments: number;
  completedAppointments: number;
  completionRate: number;
}

interface EmployeePerformanceDto {
  employeeName: string;
  appointmentsHandled: number;
  averageRating: number;
  totalHoursLogged: number;
}

interface RevenueStatsDto {
  totalRevenue: number;
  revenueByMonth: { [key: string]: number };
}

interface CustomerActivityDto {
  totalCustomers: number;
  activeCustomers: number;
  averageAppointmentsPerCustomer: number;
  averageRating: number;
}

const API_BASE = 'http://localhost:5000/api'; // Adjust to your backend URL

const AnalyticsPage: React.FC = () => {
  const [overview, setOverview] = useState<AnalyticsOverviewDto | null>(null);
  const [serviceCompletion, setServiceCompletion] = useState<ServiceCompletionDto[]>([]);
  const [employeePerformance, setEmployeePerformance] = useState<EmployeePerformanceDto[]>([]);
  const [revenueStats, setRevenueStats] = useState<RevenueStatsDto | null>(null);
  const [customerActivity, setCustomerActivity] = useState<CustomerActivityDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const [overviewRes, serviceRes, employeeRes, revenueRes, customerRes] = await Promise.all([
        fetch(`${API_BASE}/AdminAnalytics/overview`, { credentials: 'include' }),
        fetch(`${API_BASE}/AdminAnalytics/service-completion-rates`, { credentials: 'include' }),
        fetch(`${API_BASE}/AdminAnalytics/employee-performance`, { credentials: 'include' }),
        fetch(`${API_BASE}/AdminAnalytics/revenue-stats`, { credentials: 'include' }),
        fetch(`${API_BASE}/AdminAnalytics/customer-activity`, { credentials: 'include' }),
      ]);

      setOverview(await overviewRes.json());
      setServiceCompletion(await serviceRes.json());
      setEmployeePerformance(await employeeRes.json());
      setRevenueStats(await revenueRes.json());
      setCustomerActivity(await customerRes.json());
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
    }
  };

  if (loading) return (
    <div className="p-6 space-y-6">
      <div className="animate-pulse">
        <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-lg"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-muted rounded-lg"></div>
          <div className="h-64 bg-muted rounded-lg"></div>
        </div>
      </div>
    </div>
  );

  const barData = {
    labels: serviceCompletion.map(s => s.serviceName),
    datasets: [
      {
        label: 'Completion Rate (%)',
        data: serviceCompletion.map(s => s.completionRate),
        backgroundColor: [
          '#1e3a8a', // blue-900
          '#1e40af', // blue-800
          '#2563eb', // blue-600
          '#3b82f6', // blue-500
          '#60a5fa', // blue-400
        ],
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const lineData = revenueStats ? {
    labels: Object.keys(revenueStats.revenueByMonth),
    datasets: [
      {
        label: 'Revenue ($)',
        data: Object.values(revenueStats.revenueByMonth),
        borderColor: '#1e3a8a',
        backgroundColor: 'rgba(30, 58, 138, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#1e3a8a',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  } : null;

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        backgroundColor: 'hsl(var(--popover))',
        titleColor: 'hsl(var(--popover-foreground))',
        bodyColor: 'hsl(var(--popover-foreground))',
        borderColor: 'hsl(var(--border))',
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'hsl(var(--border))',
        },
      },
      x: {
        grid: {
          color: 'hsl(var(--border))',
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-blue-900">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">Comprehensive insights into your automobile management system</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            variant="outline"
            className="hover:bg-blue-900/10 transition-colors border-blue-900 text-blue-900 hover:text-blue-900"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={downloadReport}
            className="bg-blue-900 hover:bg-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <FileDown className="w-4 h-4 mr-2" />
            Download PDF Report
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card className="group hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-card to-card/80 border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Appointments</CardTitle>
              <Calendar className="h-5 w-5 text-blue-900 group-hover:scale-110 transition-transform" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{overview.totalAppointments.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">All time bookings</p>
            </CardContent>
          </Card>
          <Card className="group hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-card to-card/80 border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed Appointments</CardTitle>
              <UserCheck className="h-5 w-5 text-blue-900 group-hover:scale-110 transition-transform" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{overview.completedAppointments.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Successfully finished</p>
            </CardContent>
          </Card>
          <Card className="group hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-card to-card/80 border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              <DollarSign className="h-5 w-5 text-blue-900 group-hover:scale-110 transition-transform" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">${overview.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Revenue generated</p>
            </CardContent>
          </Card>
          <Card className="group hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-card to-card/80 border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Customers</CardTitle>
              <Users className="h-5 w-5 text-blue-900 group-hover:scale-110 transition-transform" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{overview.totalCustomers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Registered users</p>
            </CardContent>
          </Card>
          <Card className="group hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-card to-card/80 border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Employees</CardTitle>
              <UserCheck className="h-5 w-5 text-blue-900 group-hover:scale-110 transition-transform" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{overview.totalEmployees.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Active staff</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-card to-card/80 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <BarChart3 className="h-6 w-6 text-blue-900" />
              Service Completion Rates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Bar data={barData} options={chartOptions} />
          </CardContent>
        </Card>
        {lineData && (
          <Card className="hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-card to-card/80 border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <TrendingUp className="h-6 w-6 text-blue-900" />
                Revenue Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Line data={lineData} options={chartOptions} />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Employee Performance Table */}
      <Card className="hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-card to-card/80 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Employee Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-semibold text-foreground">Employee</th>
                  <th className="text-left p-4 font-semibold text-foreground">Appointments Handled</th>
                  <th className="text-left p-4 font-semibold text-foreground">Average Rating</th>
                  <th className="text-left p-4 font-semibold text-foreground">Hours Logged</th>
                </tr>
              </thead>
              <tbody>
                {employeePerformance.map((emp, index) => (
                  <tr key={index} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                    <td className="p-4 text-foreground font-medium">{emp.employeeName}</td>
                    <td className="p-4 text-foreground">{emp.appointmentsHandled}</td>
                    <td className="p-4 text-foreground">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900/10 text-blue-900">
                        {emp.averageRating.toFixed(1)} ⭐
                      </span>
                    </td>
                    <td className="p-4 text-foreground">{emp.totalHoursLogged.toFixed(1)}h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Customer Activity */}
      {customerActivity && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-card to-card/80 border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Users className="h-6 w-6 text-blue-900" />
                Customer Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                <span className="text-muted-foreground">Total Customers</span>
                <span className="text-2xl font-bold text-foreground">{customerActivity.totalCustomers.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                <span className="text-muted-foreground">Active Customers</span>
                <span className="text-2xl font-bold text-foreground">{customerActivity.activeCustomers.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                <span className="text-muted-foreground">Avg Appointments/Customer</span>
                <span className="text-2xl font-bold text-foreground">{customerActivity.averageAppointmentsPerCustomer.toFixed(1)}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                <span className="text-muted-foreground">Average Rating</span>
                <span className="text-2xl font-bold text-foreground flex items-center gap-1">
                  {customerActivity.averageRating.toFixed(1)} <span className="text-blue-900">⭐</span>
                </span>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-blue-900/5 to-blue-800/5 border-0 shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileDown className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Generate Detailed Report</h3>
              <p className="text-muted-foreground mb-4">Download a comprehensive PDF report with all analytics data</p>
              <Button
                onClick={downloadReport}
                className="bg-blue-900 hover:bg-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <FileDown className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;