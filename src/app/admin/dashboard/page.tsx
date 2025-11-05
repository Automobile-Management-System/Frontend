"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  ArrowRight,
  AlertCircle,
  UserCheck,
  Wrench,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";

import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import {
  formatCurrency,
  formatPercentage,
  formatTimeAgo,
  getAlertStyles,
} from "@/lib/utils/formatters";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function DashboardPage() {
  const { dashboardData, loading, error, markAlertAsRead, refreshData } =
    useAdminDashboard();

  // Navigation handler
  const handleNavigate = (tab: string) => {
    console.log("Navigate to:", tab);
    // Example: use Next.js router if needed
    // router.push(`/admin/${tab}`)
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: "#e5e7eb" } },
      x: { grid: { display: false } },
    },
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading dashboard data...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={refreshData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  if (!dashboardData) {
    return <div>No data available</div>;
  }

  const { stats, charts, recentUsers, systemAlerts } = dashboardData;

  // Provide default values in case of incomplete data
  const safeStats = {
    totalUsers: stats?.totalUsers ?? 0,
    activeBookings: stats?.activeBookings ?? 0,
    monthlyRevenue: stats?.monthlyRevenue ?? 0,
    growthRate: stats?.growthRate ?? 0,
    totalUsersChange: stats?.totalUsersChange ?? 0,
    activeBookingsChange: stats?.activeBookingsChange ?? 0,
    monthlyRevenueChange: stats?.monthlyRevenueChange ?? 0,
    growthRateChange: stats?.growthRateChange ?? 0,
  };

  const safeCharts = {
    weeklyRevenue: charts?.weeklyRevenue ?? [],
    weeklyAppointments: charts?.weeklyAppointments ?? [],
  };

  const safeRecentUsers = recentUsers ?? [];
  const safeSystemAlerts = systemAlerts ?? [];

  // Stats configuration
  const statsConfig = [
    {
      title: "Total Users",
      value: safeStats.totalUsers.toString(),
      change: formatPercentage(safeStats.totalUsersChange),
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      trend: safeStats.totalUsersChange >= 0 ? "up" : "down",
    },
    {
      title: "Active Bookings",
      value: safeStats.activeBookings.toString(),
      change: formatPercentage(safeStats.activeBookingsChange),
      icon: Calendar,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      trend: safeStats.activeBookingsChange >= 0 ? "up" : "down",
    },
    {
      title: "Monthly Revenue",
      value: formatCurrency(safeStats.monthlyRevenue),
      change: formatPercentage(safeStats.monthlyRevenueChange),
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100",
      trend: safeStats.monthlyRevenueChange >= 0 ? "up" : "down",
    },
    {
      title: "Growth Rate",
      value: formatPercentage(safeStats.growthRate),
      change: formatPercentage(safeStats.growthRateChange),
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      trend: safeStats.growthRateChange >= 0 ? "up" : "down",
    },
  ];

  // Chart data
  const revenueData = {
    labels: safeCharts.weeklyRevenue.map((item) => item.day),
    datasets: [
      {
        label: "Revenue",
        data: safeCharts.weeklyRevenue.map((item) => item.value),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59,130,246,0.2)",
        borderWidth: 2,
        tension: 0.4,
      },
    ],
  };

  const appointmentsData = {
    labels: safeCharts.weeklyAppointments.map((item) => item.day),
    datasets: [
      {
        label: "Appointments",
        data: safeCharts.weeklyAppointments.map((item) => item.value),
        backgroundColor: "#8b5cf6",
        borderRadius: 6,
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Admin Dashboard</h2>
          <p className="text-gray-600 mt-1">System overview and key metrics</p>
        </div>
        <Button onClick={refreshData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsConfig.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">{stat.title}</CardTitle>
                <div
                  className={`h-8 w-8 rounded-full ${stat.bgColor} flex items-center justify-center`}
                >
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p
                  className={`text-xs mt-1 ${
                    stat.trend === "up" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {stat.change} from last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Revenue</CardTitle>
            <CardDescription>Revenue trends for the past week</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <Line data={revenueData} options={chartOptions} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Appointments</CardTitle>
            <CardDescription>Booking volume for the past week</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <Bar data={appointmentsData} options={chartOptions} />
          </CardContent>
        </Card>
      </div>

      {/* Recent Users & Alerts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Users</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNavigate("users")}
              >
                View All
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
            <CardDescription>Newly registered users</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {safeRecentUsers.length === 0 ? (
              <p className="text-gray-500 text-sm">No recent users</p>
            ) : (
              <>
                {safeRecentUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <UserCheck className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="capitalize">
                        {user.role.toLowerCase()}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTimeAgo(user.registeredAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </CardContent>
        </Card>

        {/* System Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>System Alerts</CardTitle>
            <CardDescription>
              Important notifications and actions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {safeSystemAlerts.length === 0 ? (
              <p className="text-gray-500 text-sm">No active alerts</p>
            ) : (
              safeSystemAlerts
                .filter((alert) => !alert.isRead)
                .slice(0, 5)
                .map((alert) => {
                  const styles = getAlertStyles(alert.type);
                  return (
                    <div
                      key={alert.id}
                      className={`p-3 rounded-lg border ${styles.bg} ${
                        !alert.isRead ? "border-l-4" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <AlertCircle
                          className={`h-5 w-5 mt-0.5 ${styles.icon}`}
                        />
                        <div className="flex-1">
                          <p className="text-sm">{alert.message}</p>
                          <div className="flex items-center gap-2 mt-2">
                            {alert.actionType && (
                              <Button
                                variant="link"
                                size="sm"
                                className="px-0 h-auto"
                                onClick={() =>
                                  handleNavigate(alert.actionType!)
                                }
                              >
                                Take Action →
                              </Button>
                            )}
                            {!alert.isRead && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="px-2 h-auto text-xs"
                                onClick={() => markAlertAsRead(alert.id)}
                              >
                                Mark as Read
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
            )}
            {safeSystemAlerts.filter((alert) => !alert.isRead).length > 5 && (
              <Button variant="ghost" size="sm" className="w-full">
                View All Alerts (
                {safeSystemAlerts.filter((alert) => !alert.isRead).length})
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col gap-2"
              onClick={() => handleNavigate("users")}
            >
              <Users className="h-6 w-6" />
              <span>Manage Users</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col gap-2"
              onClick={() => handleNavigate("services")}
            >
              <Wrench className="h-6 w-6" />
              <span>Manage Services</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col gap-2"
              onClick={() => handleNavigate("analytics")}
            >
              <TrendingUp className="h-6 w-6" />
              <span>View Analytics</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col gap-2"
              onClick={() => alert("Export report functionality")}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Export Reports</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
