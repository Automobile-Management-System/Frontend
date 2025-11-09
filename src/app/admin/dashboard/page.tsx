// 'use client';

// import React, { useEffect, useState } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Bar, Line } from 'react-chartjs-2';
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   LineElement,
//   PointElement,
//   Title,
//   Tooltip,
//   Legend,
//   Filler,
// } from 'chart.js';
// import {
//   Users, Calendar, DollarSign, UserCheck, Wrench, TrendingUp, FileEdit,
//   ChevronLeft, ChevronRight, RefreshCw, Loader2, Bell
// } from 'lucide-react';
// import { useRouter } from 'next/navigation';
// import { toast } from 'sonner';
// import { useAdminWebSocket } from '@/hooks/useAdminWebSocket';

// // Register chart.js
// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   LineElement,
//   PointElement,
//   Title,
//   Tooltip,
//   Legend,
//   Filler
// );

// // ────────────────────────────────
// // DTOs
// // ────────────────────────────────
// interface AdminDashboardOverviewDto {
//   totalRevenue: number;
//   totalUsers: number;
//   totalCustomers: number;
//   totalAppointments: number;
// }
// interface WeeklyRevenueDto {
//   days: string[];
//   revenueList: number[];
// }
// interface WeeklyAppointmentsDto {
//   days: string[];
//   appointments: number[];
// }
// interface RecentUserDto {
//   userId: number;
//   fullName: string;
//   email: string;
//   role: string;
//   registeredDate: string;
// }

// const API_BASE = 'http://localhost:5000/api';

// export default function DashboardPage() {
//   const router = useRouter();

//   const [overview, setOverview] = useState<AdminDashboardOverviewDto | null>(null);
//   const [weeklyRevenue, setWeeklyRevenue] = useState<WeeklyRevenueDto | null>(null);
//   const [weeklyAppointments, setWeeklyAppointments] = useState<WeeklyAppointmentsDto | null>(null);
//   const [recentUsers, setRecentUsers] = useState<RecentUserDto[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);

//   const usersPerPage = 10;

//   // ───── Fetch Data ─────
//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   const fetchDashboardData = async (refresh = false) => {
//     if (refresh) setRefreshing(true);
//     try {
//       const [o, r, a, u] = await Promise.all([
//         fetch(`${API_BASE}/AdminDashboard/overview`, { credentials: 'include' }),
//         fetch(`${API_BASE}/AdminDashboard/weekly-revenue`, { credentials: 'include' }),
//         fetch(`${API_BASE}/AdminDashboard/weekly-appointments`, { credentials: 'include' }),
//         fetch(`${API_BASE}/AdminDashboard/recent-users?count=50`, { credentials: 'include' }),
//       ]);

//       if (o.ok) setOverview(await o.json());
//       if (r.ok) setWeeklyRevenue(await r.json());
//       if (a.ok) setWeeklyAppointments(await a.json());
//       if (u.ok) setRecentUsers(await u.json());
//     } catch (err) {
//       console.error('Failed to load dashboard:', err);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   // ───── WebSocket Hook ─────
//   const { socketConnected } = useAdminWebSocket({
//     adminId: 'admin@example.com',
//     onMessage: (data) => {
//       if (data.type === 'NEW_APPOINTMENT') {
//         fetchDashboardData(true);
//       }
//     },
//   });

//   // ───── Charts ─────
//   const revenueData = weeklyRevenue ? {
//     labels: weeklyRevenue.days,
//     datasets: [{
//       label: 'Revenue',
//       data: weeklyRevenue.revenueList,
//       borderColor: '#3b82f6',
//       backgroundColor: 'rgba(59, 130, 246, 0.1)',
//       tension: 0.4,
//       fill: true,
//       pointBackgroundColor: '#3b82f6',
//       pointBorderColor: '#fff',
//       pointBorderWidth: 2,
//       pointRadius: 4,
//     }],
//   } : null;

//   const apptData = weeklyAppointments ? {
//     labels: weeklyAppointments.days,
//     datasets: [{
//       label: 'Appointments',
//       data: weeklyAppointments.appointments,
//       backgroundColor: '#8b5cf6',
//       borderRadius: 6,
//     }],
//   } : null;

//   const chartOptions = {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: { legend: { display: false } },
//     scales: {
//       y: { beginAtZero: true, grid: { color: '#e5e7eb' } },
//       x: { grid: { display: false } },
//     },
//   };

//   // ───── Pagination ─────
//   const indexOfLast = currentPage * usersPerPage;
//   const indexOfFirst = indexOfLast - usersPerPage;
//   const currentUsers = recentUsers.slice(indexOfFirst, indexOfLast);
//   const totalPages = Math.ceil(recentUsers.length / usersPerPage);

//   const formatDate = (d: string) =>
//     new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

//   const getRoleColor = (role: string) => {
//     switch (role.toLowerCase()) {
//       case 'admin': return 'bg-red-100 text-red-700';
//       case 'employee': return 'bg-blue-100 text-blue-700';
//       case 'customer': return 'bg-green-100 text-green-700';
//       default: return 'bg-gray-100 text-gray-700';
//     }
//   };

//   // ───── Loading State ─────
//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <Loader2 className="h-8 w-8 animate-spin" />
//       </div>
//     );
//   }

//   // ───── UI ─────
//   return (
//     <div className="p-6 space-y-6">
//       {/* Header */}
//       <div className="flex justify-between items-start">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
//           <p className="text-gray-600 flex items-center gap-2">
//             Real-time system overview
//             <span className={`flex items-center gap-1 text-sm ${socketConnected ? 'text-green-600' : 'text-red-600'}`}>
//               <Bell className="h-4 w-4" />
//               {socketConnected ? 'Live Connected' : 'Disconnected'}
//             </span>
//           </p>
//         </div>
//         <Button onClick={() => fetchDashboardData(true)} disabled={refreshing}>
//           <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
//           Refresh
//         </Button>
//       </div>

//       {/* Overview */}
//       {overview && (
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//           {[
//             { label: 'Total Users', value: overview.totalUsers, icon: Users, color: 'blue' },
//             { label: 'Revenue', value: `$${(overview.totalRevenue / 1000).toFixed(1)}k`, icon: DollarSign, color: 'green' },
//             { label: 'Appointments', value: overview.totalAppointments, icon: Calendar, color: 'purple' },
//             { label: 'Customers', value: overview.totalCustomers, icon: UserCheck, color: 'orange' },
//           ].map((c, i) => (
//             <Card key={i}>
//               <CardContent className="p-6">
//                 <div className="flex justify-between">
//                   <div>
//                     <p className="text-sm text-gray-600">{c.label}</p>
//                     <p className="text-3xl font-bold mt-2">{c.value}</p>
//                   </div>
//                   <div className={`h-10 w-10 bg-${c.color}-100 rounded-lg flex items-center justify-center`}>
//                     <c.icon className={`h-5 w-5 text-${c.color}-600`} />
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       )}

//       {/* Charts */}
//       <div className="grid lg:grid-cols-2 gap-6">
//         <Card>
//           <CardHeader><CardTitle>Weekly Revenue</CardTitle></CardHeader>
//           <CardContent className="h-80">
//             {revenueData ? <Line data={revenueData} options={chartOptions} /> : <p className="text-center text-gray-500">No data</p>}
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader><CardTitle>Weekly Appointments</CardTitle></CardHeader>
//           <CardContent className="h-80">
//             {apptData ? <Bar data={apptData} options={chartOptions} /> : <p className="text-center text-gray-500">No data</p>}
//           </CardContent>
//         </Card>
//       </div>

//       {/* Recent Users */}
//       <Card>
//         <CardHeader><CardTitle>Recent Users</CardTitle></CardHeader>
//         <CardContent>
//           {currentUsers.length > 0 ? (
//             <>
//               <table className="w-full">
//                 <thead>
//                   <tr className="border-b">
//                     <th className="text-left p-4">User</th>
//                     <th className="text-left p-4">Email</th>
//                     <th className="text-left p-4">Role</th>
//                     <th className="text-left p-4">Date</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {currentUsers.map(u => (
//                     <tr key={u.userId} className="border-b hover:bg-gray-50">
//                       <td className="p-4 flex items-center gap-3">
//                         <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
//                           <UserCheck className="h-5 w-5 text-blue-600" />
//                         </div>
//                         <span className="font-medium">{u.fullName}</span>
//                       </td>
//                       <td className="p-4 text-sm text-gray-600">{u.email}</td>
//                       <td className="p-4">
//                         <span className={`px-2 py-1 rounded-full text-xs ${getRoleColor(u.role)}`}>
//                           {u.role}
//                         </span>
//                       </td>
//                       <td className="p-4 text-sm text-gray-600">{formatDate(u.registeredDate)}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>

//               {totalPages > 1 && (
//                 <div className="flex justify-between items-center mt-4">
//                   <p className="text-sm text-gray-600">
//                     Showing {indexOfFirst + 1}–{Math.min(indexOfLast, recentUsers.length)} of {recentUsers.length}
//                   </p>
//                   <div className="flex gap-2">
//                     <Button variant="outline" size="sm" disabled={currentPage === 1}
//                       onClick={() => setCurrentPage(p => p - 1)}>
//                       <ChevronLeft className="h-4 w-4" />
//                     </Button>
//                     <Button variant="outline" size="sm" disabled={currentPage === totalPages}
//                       onClick={() => setCurrentPage(p => p + 1)}>
//                       <ChevronRight className="h-4 w-4" />
//                     </Button>
//                   </div>
//                 </div>
//               )}
//             </>
//           ) : (
//             <p className="text-center py-8 text-gray-500">No users yet</p>
//           )}
//         </CardContent>
//       </Card>

//       {/* Quick Actions */}
//       <Card>
//         <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
//         <CardContent>
//           <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
//             {[
//               { icon: Users, label: 'Manage Users', path: '/admin/user_management' },
//               { icon: Wrench, label: 'Services', path: '/admin/service_management' },
//               { icon: TrendingUp, label: 'Analytics', path: '/admin/analytics' },
//               { icon: FileEdit, label: 'Requests', path: '/admin/modification_requests' },
//             ].map((a, i) => (
//               <Button key={i} variant="outline" className="h-24 flex flex-col gap-2"
//                 onClick={() => router.push(a.path)}>
//                 <a.icon className="h-8 w-8" />
//                 <span>{a.label}</span>
//               </Button>
//             ))}
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }


'use client';

import React, { useEffect, useState } from 'react';
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
  Filler,
} from 'chart.js';
import {
  Users, Calendar, DollarSign, UserCheck, Wrench, TrendingUp, FileEdit,
  ChevronLeft, ChevronRight, RefreshCw, Loader2, Bell
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAdminWebSocket } from '@/hooks/useAdminWebSocket';

// Register chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// ────────────────────────────────
// DTOs
// ────────────────────────────────
interface AdminDashboardOverviewDto {
  totalRevenue: number;
  totalUsers: number;
  totalCustomers: number;
  totalAppointments: number;
}
interface WeeklyRevenueDto {
  days: string[];
  revenueList: number[];
}
interface WeeklyAppointmentsDto {
  days: string[];
  appointments: number[];
}
interface RecentUserDto {
  userId: number;
  fullName: string;
  email: string;
  role: string;
  registeredDate: string;
}

const API_BASE = 'http://localhost:5000/api';

export default function DashboardPage() {
  const router = useRouter();

  const [overview, setOverview] = useState<AdminDashboardOverviewDto | null>(null);
  const [weeklyRevenue, setWeeklyRevenue] = useState<WeeklyRevenueDto | null>(null);
  const [weeklyAppointments, setWeeklyAppointments] = useState<WeeklyAppointmentsDto | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const usersPerPage = 10;

  // ───── Fetch Data ─────
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async (refresh = false) => {
    if (refresh) setRefreshing(true);
    try {
      const [o, r, a, u] = await Promise.all([
        fetch(`${API_BASE}/AdminDashboard/overview`, { credentials: 'include' }),
        fetch(`${API_BASE}/AdminDashboard/weekly-revenue`, { credentials: 'include' }),
        fetch(`${API_BASE}/AdminDashboard/weekly-appointments`, { credentials: 'include' }),
        fetch(`${API_BASE}/AdminDashboard/recent-users?count=50`, { credentials: 'include' }),
      ]);

      if (o.ok) setOverview(await o.json());
      if (r.ok) setWeeklyRevenue(await r.json());
      if (a.ok) setWeeklyAppointments(await a.json());
      if (u.ok) setRecentUsers(await u.json());
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ───── WebSocket Hook ─────
  const { socketConnected } = useAdminWebSocket({
    adminId: 'admin@example.com',
    onMessage: (data) => {
      if (data.type === 'NEW_APPOINTMENT') {
        // Show toast notification
        toast.success(`📅 ${data.message || 'New appointment received'}`);

        // Dynamically update Recent Users table
        setRecentUsers(prev => [
          {
            userId: data.userId || 0,
            fullName: data.customerName || 'Unknown',
            email: data.email || '',
            role: 'customer',
            registeredDate: data.date || new Date().toISOString(),
          },
          ...prev
        ]);

        // Optionally update overview
        setOverview(prev => prev ? {
          ...prev,
          totalAppointments: prev.totalAppointments + 1,
          totalUsers: prev.totalUsers + 1 // increment if it's a new user
        } : prev);
      }
    },
  });

  // ───── Charts ─────
  const revenueData = weeklyRevenue ? {
    labels: weeklyRevenue.days,
    datasets: [{
      label: 'Revenue',
      data: weeklyRevenue.revenueList,
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#3b82f6',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4,
    }],
  } : null;

  const apptData = weeklyAppointments ? {
    labels: weeklyAppointments.days,
    datasets: [{
      label: 'Appointments',
      data: weeklyAppointments.appointments,
      backgroundColor: '#8b5cf6',
      borderRadius: 6,
    }],
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: '#e5e7eb' } },
      x: { grid: { display: false } },
    },
  };

  // ───── Pagination ─────
  const indexOfLast = currentPage * usersPerPage;
  const indexOfFirst = indexOfLast - usersPerPage;
  const currentUsers = recentUsers.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(recentUsers.length / usersPerPage);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin': return 'bg-red-100 text-red-700';
      case 'employee': return 'bg-blue-100 text-blue-700';
      case 'customer': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // ───── Loading State ─────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // ───── UI ─────
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 flex items-center gap-2">
            Real-time system overview
            <span className={`flex items-center gap-1 text-sm ${socketConnected ? 'text-green-600' : 'text-red-600'}`}>
              <Bell className="h-4 w-4" />
              {socketConnected ? 'Live Connected' : 'Disconnected'}
            </span>
          </p>
        </div>
        <Button onClick={() => fetchDashboardData(true)} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Overview */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Users', value: overview.totalUsers, icon: Users, color: 'blue' },
            { label: 'Revenue', value: `$${(overview.totalRevenue / 1000).toFixed(1)}k`, icon: DollarSign, color: 'green' },
            { label: 'Appointments', value: overview.totalAppointments, icon: Calendar, color: 'purple' },
            { label: 'Customers', value: overview.totalCustomers, icon: UserCheck, color: 'orange' },
          ].map((c, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{c.label}</p>
                    <p className="text-3xl font-bold mt-2">{c.value}</p>
                  </div>
                  <div className={`h-10 w-10 bg-${c.color}-100 rounded-lg flex items-center justify-center`}>
                    <c.icon className={`h-5 w-5 text-${c.color}-600`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Weekly Revenue</CardTitle></CardHeader>
          <CardContent className="h-80">
            {revenueData ? <Line data={revenueData} options={chartOptions} /> : <p className="text-center text-gray-500">No data</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Weekly Appointments</CardTitle></CardHeader>
          <CardContent className="h-80">
            {apptData ? <Bar data={apptData} options={chartOptions} /> : <p className="text-center text-gray-500">No data</p>}
          </CardContent>
        </Card>
      </div>

      {/* Recent Users */}
      <Card>
        <CardHeader><CardTitle>Recent Users</CardTitle></CardHeader>
        <CardContent>
          {currentUsers.length > 0 ? (
            <>
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">User</th>
                    <th className="text-left p-4">Email</th>
                    <th className="text-left p-4">Role</th>
                    <th className="text-left p-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.map(u => (
                    <tr key={u.userId} className="border-b hover:bg-gray-50">
                      <td className="p-4 flex items-center gap-3">
                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <UserCheck className="h-5 w-5 text-blue-600" />
                        </div>
                        <span className="font-medium">{u.fullName}</span>
                      </td>
                      <td className="p-4 text-sm text-gray-600">{u.email}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${getRoleColor(u.role)}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-600">{formatDate(u.registeredDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-4">
                  <p className="text-sm text-gray-600">
                    Showing {indexOfFirst + 1}–{Math.min(indexOfLast, recentUsers.length)} of {recentUsers.length}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => p - 1)}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(p => p + 1)}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-center py-8 text-gray-500">No users yet</p>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Users, label: 'Manage Users', path: '/admin/user_management' },
              { icon: Wrench, label: 'Services', path: '/admin/service_management' },
              { icon: TrendingUp, label: 'Analytics', path: '/admin/analytics' },
              { icon: FileEdit, label: 'Requests', path: '/admin/modification_requests' },
            ].map((a, i) => (
              <Button key={i} variant="outline" className="h-24 flex flex-col gap-2"
                onClick={() => router.push(a.path)}>
                <a.icon className="h-8 w-8" />
                <span>{a.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
