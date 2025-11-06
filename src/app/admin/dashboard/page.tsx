// 'use client';

// import React, { useState, useEffect } from 'react';
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
// } from 'chart.js';
// import { 
//   Users, 
//   Calendar, 
//   DollarSign, 
//   UserCheck, 
//   Wrench, 
//   TrendingUp, 
//   FileEdit,
//   ChevronLeft,
//   ChevronRight,
//   RefreshCw,
//   Loader2
// } from 'lucide-react';
// import { useRouter } from 'next/navigation';

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   LineElement,
//   PointElement,
//   Title,
//   Tooltip,
//   Legend
// );

// // Interfaces matching backend DTOs
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
//   profilePicture?: string;
//   registeredDate: string;
// }

// const API_BASE = 'http://localhost:5001/api';

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

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   const fetchDashboardData = async (isRefresh = false) => {
//     if (isRefresh) setRefreshing(true);
    
//     try {
//       const [overviewRes, revenueRes, appointmentsRes, usersRes] = await Promise.all([
//         fetch(`${API_BASE}/AdminDashboard/overview`, { credentials: 'include' }),
//         fetch(`${API_BASE}/AdminDashboard/weekly-revenue`, { credentials: 'include' }),
//         fetch(`${API_BASE}/AdminDashboard/weekly-appointments`, { credentials: 'include' }),
//         fetch(`${API_BASE}/AdminDashboard/recent-users?count=50`, { credentials: 'include' }),
//       ]);

//       if (overviewRes.ok) {
//         const data = await overviewRes.json();
//         console.log('Overview data:', data);
//         setOverview(data);
//       }
      
//       if (revenueRes.ok) {
//         const data = await revenueRes.json();
//         console.log('Weekly revenue data:', data);
//         setWeeklyRevenue(data);
//       }
      
//       if (appointmentsRes.ok) {
//         const data = await appointmentsRes.json();
//         console.log('Weekly appointments data:', data);
//         setWeeklyAppointments(data);
//       }
      
//       if (usersRes.ok) {
//         const data = await usersRes.json();
//         console.log('Recent users data:', data);
//         setRecentUsers(data);
//       }
//     } catch (error) {
//       console.error('Error fetching dashboard data:', error);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-[400px]">
//         <div className="flex items-center gap-2 text-gray-600">
//           <Loader2 className="h-6 w-6 animate-spin" />
//           <span>Loading dashboard...</span>
//         </div>
//       </div>
//     );
//   }
//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-[400px]">
//         <div className="flex items-center gap-2 text-gray-600">
//           <Loader2 className="h-6 w-6 animate-spin" />
//           <span>Loading dashboard...</span>
//         </div>
//       </div>
//     );
//   }

//   // Chart data
//   const revenueChartData = weeklyRevenue ? {
//     labels: weeklyRevenue.days,
//     datasets: [
//       {
//         label: 'Revenue ($)',
//         data: weeklyRevenue.revenueList,
//         borderColor: '#3b82f6',
//         backgroundColor: 'rgba(59, 130, 246, 0.1)',
//         tension: 0.4,
//         fill: true,
//         pointBackgroundColor: '#3b82f6',
//         pointBorderColor: '#fff',
//         pointBorderWidth: 2,
//         pointRadius: 4,
//       },
//     ],
//   } : null;

//   const appointmentsChartData = weeklyAppointments ? {
//     labels: weeklyAppointments.days,
//     datasets: [
//       {
//         label: 'Appointments',
//         data: weeklyAppointments.appointments,
//         backgroundColor: '#8b5cf6',
//         borderRadius: 6,
//       },
//     ],
//   } : null;

//   const chartOptions = {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//       legend: {
//         display: false,
//       },
//       tooltip: {
//         backgroundColor: '#fff',
//         titleColor: '#000',
//         bodyColor: '#000',
//         borderColor: '#e5e7eb',
//         borderWidth: 1,
//       },
//     },
//     scales: {
//       y: {
//         beginAtZero: true,
//         grid: {
//           color: '#e5e7eb',
//         },
//       },
//       x: {
//         grid: {
//           display: false,
//         },
//       },
//     },
//   };

//   // Pagination
//   const indexOfLastUser = currentPage * usersPerPage;
//   const indexOfFirstUser = indexOfLastUser - usersPerPage;
//   const currentUsers = recentUsers.slice(indexOfFirstUser, indexOfLastUser);
//   const totalPages = Math.ceil(recentUsers.length / usersPerPage);

//   const formatDate = (dateString: string) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', { 
//       month: 'short', 
//       day: 'numeric', 
//       year: 'numeric' 
//     });
//   };

//   const getRoleColor = (role: string) => {
//     switch (role.toLowerCase()) {
//       case 'admin':
//         return 'bg-red-100 text-red-700';
//       case 'employee':
//         return 'bg-blue-100 text-blue-700';
//       case 'customer':
//         return 'bg-green-100 text-green-700';
//       default:
//         return 'bg-gray-100 text-gray-700';
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-6 space-y-6">
//       {/* Header */}
//       <div className="flex justify-between items-start">
//         <div>
//           <h1 className="text-3xl font-semibold text-gray-900">Admin Dashboard</h1>
//           <p className="text-gray-600 mt-1">System overview and key metrics</p>
//         </div>
//         <Button
//           onClick={() => fetchDashboardData(true)}
//           disabled={refreshing}
//           className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm"
//         >
//           <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
//           Refresh
//         </Button>
//       </div>

//       {/* Overview Cards */}
//       {overview && (
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//           <Card className="bg-white border-0 shadow-sm">
//             <CardContent className="p-6">
//               <div className="flex justify-between items-start">
//                 <div>
//                   <p className="text-sm text-gray-600">Total Users</p>
//                   <p className="text-3xl font-semibold mt-2">{overview.totalUsers}</p>
//                   <p className="text-xs text-gray-500 mt-1">All registered users</p>
//                 </div>
//                 <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
//                   <Users className="h-5 w-5 text-blue-600" />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           <Card className="bg-white border-0 shadow-sm">
//             <CardContent className="p-6">
//               <div className="flex justify-between items-start">
//                 <div>
//                   <p className="text-sm text-gray-600">Total Revenue</p>
//                   <p className="text-3xl font-semibold mt-2">${(overview.totalRevenue / 1000).toFixed(1)}k</p>
//                   <p className="text-xs text-gray-500 mt-1">All time revenue</p>
//                 </div>
//                 <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
//                   <DollarSign className="h-5 w-5 text-green-600" />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           <Card className="bg-white border-0 shadow-sm">
//             <CardContent className="p-6">
//               <div className="flex justify-between items-start">
//                 <div>
//                   <p className="text-sm text-gray-600">Total Appointments</p>
//                   <p className="text-3xl font-semibold mt-2">{overview.totalAppointments}</p>
//                   <p className="text-xs text-gray-500 mt-1">All bookings</p>
//                 </div>
//                 <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
//                   <Calendar className="h-5 w-5 text-purple-600" />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           <Card className="bg-white border-0 shadow-sm">
//             <CardContent className="p-6">
//               <div className="flex justify-between items-start">
//                 <div>
//                   <p className="text-sm text-gray-600">Total Customers</p>
//                   <p className="text-3xl font-semibold mt-2">{overview.totalCustomers}</p>
//                   <p className="text-xs text-gray-500 mt-1">Active customers</p>
//                 </div>
//                 <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
//                   <UserCheck className="h-5 w-5 text-orange-600" />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       )}

//       {/* Charts */}
//       <div className="grid lg:grid-cols-2 gap-6">
//         <Card className="bg-white border-0 shadow-sm">
//           <CardHeader>
//             <CardTitle className="text-lg font-semibold">Weekly Revenue</CardTitle>
//             <CardDescription className="text-sm text-gray-500">Revenue trends for the past week</CardDescription>
//           </CardHeader>
//           <CardContent className="h-[300px]">
//             {revenueChartData ? (
//               <Line data={revenueChartData} options={chartOptions} />
//             ) : (
//               <div className="flex items-center justify-center h-full text-gray-500">
//                 <p className="text-sm">No revenue data available</p>
//               </div>
//             )}
//           </CardContent>
//         </Card>

//         <Card className="bg-white border-0 shadow-sm">
//           <CardHeader>
//             <CardTitle className="text-lg font-semibold">Weekly Appointments</CardTitle>
//             <CardDescription className="text-sm text-gray-500">Booking volume for the past week</CardDescription>
//           </CardHeader>
//           <CardContent className="h-[300px]">
//             {appointmentsChartData ? (
//               <Bar data={appointmentsChartData} options={chartOptions} />
//             ) : (
//               <div className="flex items-center justify-center h-full text-gray-500">
//                 <p className="text-sm">No appointment data available</p>
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </div>

//       {/* Recent Users */}
//       <Card className="bg-white border-0 shadow-sm">
//         <CardHeader>
//           <CardTitle className="text-lg font-semibold">Recent Users</CardTitle>
//           <CardDescription className="text-sm text-gray-500">Newly registered users</CardDescription>
//         </CardHeader>
//         <CardContent>
//           {currentUsers.length > 0 ? (
//             <>
//               <div className="overflow-x-auto">
//                 <table className="w-full">
//                   <thead>
//                     <tr className="border-b border-gray-200">
//                       <th className="text-left p-4 text-sm font-medium text-gray-700">User</th>
//                       <th className="text-left p-4 text-sm font-medium text-gray-700">Email</th>
//                       <th className="text-left p-4 text-sm font-medium text-gray-700">Role</th>
//                       <th className="text-left p-4 text-sm font-medium text-gray-700">Registered</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {currentUsers.map((user) => (
//                       <tr key={user.userId} className="border-b border-gray-100 hover:bg-gray-50">
//                         <td className="p-4">
//                           <div className="flex items-center gap-3">
//                             <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
//                               <UserCheck className="h-5 w-5 text-blue-600" />
//                             </div>
//                             <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
//                           </div>
//                         </td>
//                         <td className="p-4 text-sm text-gray-600">{user.email}</td>
//                         <td className="p-4">
//                           <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
//                             {user.role}
//                           </span>
//                         </td>
//                         <td className="p-4 text-sm text-gray-600">{formatDate(user.registeredDate)}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>

//               {/* Pagination */}
//               {totalPages > 1 && (
//                 <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
//                   <p className="text-sm text-gray-600">
//                     Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, recentUsers.length)} of {recentUsers.length} users
//                   </p>
//                   <div className="flex gap-2">
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
//                       disabled={currentPage === 1}
//                     >
//                       <ChevronLeft className="h-4 w-4" />
//                       Previous
//                     </Button>
//                     <div className="flex items-center gap-1">
//                       {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
//                         <Button
//                           key={page}
//                           variant={currentPage === page ? "default" : "outline"}
//                           size="sm"
//                           onClick={() => setCurrentPage(page)}
//                           className={currentPage === page ? "bg-blue-600 text-white" : ""}
//                         >
//                           {page}
//                         </Button>
//                       ))}
//                     </div>
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
//                       disabled={currentPage === totalPages}
//                     >
//                       Next
//                       <ChevronRight className="h-4 w-4" />
//                     </Button>
//                   </div>
//                 </div>
//               )}
//             </>
//           ) : (
//             <div className="flex items-center justify-center h-48 text-gray-500">
//               <p className="text-sm">No users found</p>
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {/* Quick Actions */}
//       <Card className="bg-white border-0 shadow-sm">
//         <CardHeader>
//           <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
//           <CardDescription className="text-sm text-gray-500">Common administrative tasks</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
//             <Button
//               variant="outline"
//               className="h-auto py-6 flex flex-col gap-3 hover:bg-blue-50 hover:border-blue-300 transition-colors"
//               onClick={() => router.push('/admin/user_management')}
//             >
//               <Users className="h-8 w-8 text-blue-600" />
//               <span className="font-medium">Manage Users</span>
//             </Button>
//             <Button
//               variant="outline"
//               className="h-auto py-6 flex flex-col gap-3 hover:bg-purple-50 hover:border-purple-300 transition-colors"
//               onClick={() => router.push('/admin/service_management')}
//             >
//               <Wrench className="h-8 w-8 text-purple-600" />
//               <span className="font-medium">Manage Services</span>
//             </Button>
//             <Button
//               variant="outline"
//               className="h-auto py-6 flex flex-col gap-3 hover:bg-green-50 hover:border-green-300 transition-colors"
//               onClick={() => router.push('/admin/analytics')}
//             >
//               <TrendingUp className="h-8 w-8 text-green-600" />
//               <span className="font-medium">View Analytics</span>
//             </Button>
//             <Button
//               variant="outline"
//               className="h-auto py-6 flex flex-col gap-3 hover:bg-orange-50 hover:border-orange-300 transition-colors"
//               onClick={() => router.push('/admin/modification_requests')}
//             >
//               <FileEdit className="h-8 w-8 text-orange-600" />
//               <span className="font-medium">Modification Requests</span>
//             </Button>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }




// 'use client';

// import React, { useState, useEffect, useRef } from 'react';
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
// } from 'chart.js';
// import { 
//   Users, 
//   Calendar, 
//   DollarSign, 
//   UserCheck, 
//   Wrench, 
//   TrendingUp, 
//   FileEdit,
//   ChevronLeft,
//   ChevronRight,
//   RefreshCw,
//   Loader2,
//   Bell
// } from 'lucide-react';
// import { useRouter } from 'next/navigation';
// import * as signalR from '@microsoft/signalr';
// import { toast } from 'sonner'; // ← Already using sonner

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   LineElement,
//   PointElement,
//   Title,
//   Tooltip,
//   Legend
// );

// // === Interfaces (unchanged) ===
// interface AdminDashboardOverviewDto {
//   totalRevenue: number;
//   totalUsers: number;
//   totalCustomers: number;
//   totalAppointments: number;
// }
// interface WeeklyRevenueDto { days: string[]; revenueList: number[]; }
// interface WeeklyAppointmentsDto { days: string[]; appointments: number[]; }
// interface RecentUserDto {
//   userId: number;
//   fullName: string;
//   email: string;
//   role: string;
//   profilePicture?: string;
//   registeredDate: string;
// }

// const API_BASE = 'http://localhost:5001/api';
// const HUB_URL = 'http://localhost:5001/hubs/admin-notify';

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
//   const connectionRef = useRef<signalR.HubConnection | null>(null);

//   // === SIGNALR: Real-time new user registration ===
//   useEffect(() => {
//     const connect = async () => {
//       const connection = new signalR.HubConnectionBuilder()
//         .withUrl(HUB_URL, {
//           withCredentials: true,
//           transport: signalR.HttpTransportType.WebSockets
//         })
//         .withAutomaticReconnect()
//         .build();

//       connection.on('NewUserRegistered', (user: RecentUserDto) => {
//         // Show sonner toast
//         toast.success(
//           <div className="flex items-center gap-3">
//             <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center">
//               <Users className="h-5 w-5 text-blue-600" />
//             </div>
//             <div>
//               <p className="font-medium">{user.fullName}</p>
//               <p className="text-xs text-gray-600">New {user.role.toLowerCase()} registered</p>
//             </div>
//           </div>,
//           { duration: 5000 }
//         );

//         // Auto-prepend to recent users list
//         setRecentUsers(prev => [user, ...prev].slice(0, 100));
//       });

//       try {
//         await connection.start();
//         connectionRef.current = connection;
//       } catch (err) {
//         console.error('SignalR connection failed:', err);
//         toast.error('Live updates unavailable');
//       }
//     };

//     connect();

//     return () => {
//       connectionRef.current?.stop();
//     };
//   }, []);

//   // === FETCH DATA (unchanged) ===
//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   const fetchDashboardData = async (isRefresh = false) => {
//     if (isRefresh) setRefreshing(true);
//     try {
//       const [overviewRes, revenueRes, appointmentsRes, usersRes] = await Promise.all([
//         fetch(`${API_BASE}/AdminDashboard/overview`, { credentials: 'include' }),
//         fetch(`${API_BASE}/AdminDashboard/weekly-revenue`, { credentials: 'include' }),
//         fetch(`${API_BASE}/AdminDashboard/weekly-appointments`, { credentials: 'include' }),
//         fetch(`${API_BASE}/AdminDashboard/recent-users?count=50`, { credentials: 'include' }),
//       ]);

//       if (overviewRes.ok) setOverview(await overviewRes.json());
//       if (revenueRes.ok) setWeeklyRevenue(await revenueRes.json());
//       if (appointmentsRes.ok) setWeeklyAppointments(await appointmentsRes.json());
//       if (usersRes.ok) setRecentUsers(await usersRes.json());
//     } catch (error) {
//       console.error('Error fetching dashboard data:', error);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   // === CHARTS & PAGINATION (unchanged) ===
//   const revenueChartData = weeklyRevenue ? {
//     labels: weeklyRevenue.days,
//     datasets: [{
//       label: 'Revenue ($)',
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

//   const appointmentsChartData = weeklyAppointments ? {
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
//     plugins: { legend: { display: false }, tooltip: { backgroundColor: '#fff', titleColor: '#000', bodyColor: '#000', borderColor: '#e5e7eb', borderWidth: 1 } },
//     scales: { y: { beginAtZero: true, grid: { color: '#e5e7eb' } }, x: { grid: { display: false } } },
//   };

//   const indexOfLastUser = currentPage * usersPerPage;
//   const indexOfFirstUser = indexOfLastUser - usersPerPage;
//   const currentUsers = recentUsers.slice(indexOfFirstUser, indexOfLastUser);
//   const totalPages = Math.ceil(recentUsers.length / usersPerPage);

//   const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
//   const getRoleColor = (role: string) => {
//     switch (role.toLowerCase()) {
//       case 'admin': return 'bg-red-100 text-red-700';
//       case 'employee': return 'bg-blue-100 text-blue-700';
//       case 'customer': return 'bg-green-100 text-green-700';
//       default: return 'bg-gray-100 text-gray-700';
//     }
//   };

//   // === RENDER ===
//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-[400px]">
//         <div className="flex items-center gap-2 text-gray-600">
//           <Loader2 className="h-6 w-6 animate-spin" />
//           <span>Loading dashboard...</span>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 p-6 space-y-6">
//       {/* Header */}
//       <div className="flex justify-between items-start">
//         <div>
//           <h1 className="text-3xl font-semibold text-gray-900">Admin Dashboard</h1>
//           <p className="text-gray-600 mt-1">System overview and key metrics</p>
//         </div>
//         <div className="flex items-center gap-3">
//           <Button
//             onClick={() => fetchDashboardData(true)}
//             disabled={refreshing}
//             className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm"
//           >
//             <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
//             Refresh
//           </Button>
//           <div className="relative">
//             <Bell className="h-5 w-5 text-gray-600" />
//             {recentUsers.length > 0 && (
//               <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full animate-ping"></span>
//             )}
//             {recentUsers.length > 0 && (
//               <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* === REST OF YOUR UI (Cards, Charts, Table, Pagination, Quick Actions) === */}
//       {/* KEEP EVERYTHING BELOW THIS LINE EXACTLY AS IN YOUR ORIGINAL FILE */}

//       {/* Overview Cards */}
//       {overview && (
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//           <Card className="bg-white border-0 shadow-sm">
//             <CardContent className="p-6">
//               <div className="flex justify-between items-start">
//                 <div>
//                   <p className="text-sm text-gray-600">Total Users</p>
//                   <p className="text-3xl font-semibold mt-2">{overview.totalUsers}</p>
//                   <p className="text-xs text-gray-500 mt-1">All registered users</p>
//                 </div>
//                 <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
//                   <Users className="h-5 w-5 text-blue-600" />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           <Card className="bg-white border-0 shadow-sm">
//             <CardContent className="p-6">
//               <div className="flex justify-between items-start">
//                 <div>
//                   <p className="text-sm text-gray-600">Total Revenue</p>
//                   <p className="text-3xl font-semibold mt-2">${(overview.totalRevenue / 1000).toFixed(1)}k</p>
//                   <p className="text-xs text-gray-500 mt-1">All time revenue</p>
//                 </div>
//                 <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
//                   <DollarSign className="h-5 w-5 text-green-600" />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           <Card className="bg-white border-0 shadow-sm">
//             <CardContent className="p-6">
//               <div className="flex justify-between items-start">
//                 <div>
//                   <p className="text-sm text-gray-600">Total Appointments</p>
//                   <p className="text-3xl font-semibold mt-2">{overview.totalAppointments}</p>
//                   <p className="text-xs text-gray-500 mt-1">All bookings</p>
//                 </div>
//                 <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
//                   <Calendar className="h-5 w-5 text-purple-600" />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           <Card className="bg-white border-0 shadow-sm">
//             <CardContent className="p-6">
//               <div className="flex justify-between items-start">
//                 <div>
//                   <p className="text-sm text-gray-600">Total Customers</p>
//                   <p className="text-3xl font-semibold mt-2">{overview.totalCustomers}</p>
//                   <p className="text-xs text-gray-500 mt-1">Active customers</p>
//                 </div>
//                 <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
//                   <UserCheck className="h-5 w-5 text-orange-600" />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       )}

//       {/* Charts */}
//       <div className="grid lg:grid-cols-2 gap-6">
//         <Card className="bg-white border-0 shadow-sm">
//           <CardHeader>
//             <CardTitle className="text-lg font-semibold">Weekly Revenue</CardTitle>
//             <CardDescription className="text-sm text-gray-500">Revenue trends for the past week</CardDescription>
//           </CardHeader>
//           <CardContent className="h-[300px]">
//             {revenueChartData ? (
//               <Line data={revenueChartData} options={chartOptions} />
//             ) : (
//               <div className="flex items-center justify-center h-full text-gray-500">
//                 <p className="text-sm">No revenue data available</p>
//               </div>
//             )}
//           </CardContent>
//         </Card>

//         <Card className="bg-white border-0 shadow-sm">
//           <CardHeader>
//             <CardTitle className="text-lg font-semibold">Weekly Appointments</CardTitle>
//             <CardDescription className="text-sm text-gray-500">Booking volume for the past week</CardDescription>
//           </CardHeader>
//           <CardContent className="h-[300px]">
//             {appointmentsChartData ? (
//               <Bar data={appointmentsChartData} options={chartOptions} />
//             ) : (
//               <div className="flex items-center justify-center h-full text-gray-500">
//                 <p className="text-sm">No appointment data available</p>
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </div>

//       {/* Recent Users */}
//       <Card className="bg-white border-0 shadow-sm">
//         <CardHeader>
//           <CardTitle className="text-lg font-semibold">Recent Users</CardTitle>
//           <CardDescription className="text-sm text-gray-500">Newly registered users</CardDescription>
//         </CardHeader>
//         <CardContent>
//           {currentUsers.length > 0 ? (
//             <>
//               <div className="overflow-x-auto">
//                 <table className="w-full">
//                   <thead>
//                     <tr className="border-b border-gray-200">
//                       <th className="text-left p-4 text-sm font-medium text-gray-700">User</th>
//                       <th className="text-left p-4 text-sm font-medium text-gray-700">Email</th>
//                       <th className="text-left p-4 text-sm font-medium text-gray-700">Role</th>
//                       <th className="text-left p-4 text-sm font-medium text-gray-700">Registered</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {currentUsers.map((user) => (
//                       <tr key={user.userId} className="border-b border-gray-100 hover:bg-gray-50">
//                         <td className="p-4">
//                           <div className="flex items-center gap-3">
//                             <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
//                               <UserCheck className="h-5 w-5 text-blue-600" />
//                             </div>
//                             <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
//                           </div>
//                         </td>
//                         <td className="p-4 text-sm text-gray-600">{user.email}</td>
//                         <td className="p-4">
//                           <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
//                             {user.role}
//                           </span>
//                         </td>
//                         <td className="p-4 text-sm text-gray-600">{formatDate(user.registeredDate)}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>

//               {totalPages > 1 && (
//                 <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
//                   <p className="text-sm text-gray-600">
//                     Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, recentUsers.length)} of {recentUsers.length} users
//                   </p>
//                   <div className="flex gap-2">
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
//                       disabled={currentPage === 1}
//                     >
//                       <ChevronLeft className="h-4 w-4" />
//                       Previous
//                     </Button>
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
//                       disabled={currentPage === totalPages}
//                     >
//                       Next
//                       <ChevronRight className="h-4 w-4" />
//                     </Button>
//                   </div>
//                 </div>
//               )}
//             </>
//           ) : (
//             <div className="flex items-center justify-center h-48 text-gray-500">
//               <p className="text-sm">No users found</p>
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {/* Quick Actions */}
//       <Card className="bg-white border-0 shadow-sm">
//         <CardHeader>
//           <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
//           <CardDescription className="text-sm text-gray-500">Common administrative tasks</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
//             <Button
//               variant="outline"
//               className="h-auto py-6 flex flex-col gap-3 hover:bg-blue-50 hover:border-blue-300 transition-colors"
//               onClick={() => router.push('/admin/user_management')}
//             >
//               <Users className="h-8 w-8 text-blue-600" />
//               <span className="font-medium">Manage Users</span>
//             </Button>
//             <Button
//               variant="outline"
//               className="h-auto py-6 flex flex-col gap-3 hover:bg-purple-50 hover:border-purple-300 transition-colors"
//               onClick={() => router.push('/admin/service_management')}
//             >
//               <Wrench className="h-8 w-8 text-purple-600" />
//               <span className="font-medium">Manage Services</span>
//             </Button>
//             <Button
//               variant="outline"
//               className="h-auto py-6 flex flex-col gap-3 hover:bg-green-50 hover:border-green-300 transition-colors"
//               onClick={() => router.push('/admin/analytics')}
//             >
//               <TrendingUp className="h-8 w-8 text-green-600" />
//               <span className="font-medium">View Analytics</span>
//             </Button>
//             <Button
//               variant="outline"
//               className="h-auto py-6 flex flex-col gap-3 hover:bg-orange-50 hover:border-orange-300 transition-colors"
//               onClick={() => router.push('/admin/modification_requests')}
//             >
//               <FileEdit className="h-8 w-8 text-orange-600" />
//               <span className="font-medium">Modification Requests</span>
//             </Button>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }



// 'use client';

// import React, { useState, useEffect, useRef } from 'react';
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
//   Filler, // ← Critical for Line chart fill
// } from 'chart.js';
// import { 
//   Users, 
//   Calendar, 
//   DollarSign, 
//   UserCheck, 
//   Wrench, 
//   TrendingUp, 
//   FileEdit,
//   ChevronLeft,
//   ChevronRight,
//   RefreshCw,
//   Loader2,
//   Bell,
//   X,
//   Trash2
// } from 'lucide-react';
// import { useRouter } from 'next/navigation';
// import * as signalR from '@microsoft/signalr';
// import { toast } from 'sonner';

// // Register Chart.js components
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

// // ──────────────────────────────────────────────────────────────
// // DTO INTERFACES
// // ──────────────────────────────────────────────────────────────
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
//   profilePicture?: string;
//   registeredDate: string;
// }

// interface Notification {
//   id: string;
//   userId: number;
//   fullName: string;
//   email: string;
//   role: string;
//   timestamp: string;
// }

// const getRoleColor = (role: string) => {
//   switch (role.toLowerCase()) {
//     case 'admin':    return 'bg-red-100 text-red-700';
//     case 'employee': return 'bg-blue-100 text-blue-700';
//     case 'customer': return 'bg-green-100 text-green-700';
//     default:         return 'bg-gray-100 text-gray-700';
//   }
// };

// const API_BASE = 'http://localhost:5001/api';
// const HUB_URL = 'http://localhost:5001/hubs/admin-notify';
// const NOTIF_STORAGE_KEY = 'admin-notifications';

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

//   const connectionRef = useRef<signalR.HubConnection | null>(null);
//   const [notifications, setNotifications] = useState<Notification[]>([]);
//   const [showNotifBar, setShowNotifBar] = useState(false);

//   // Load notifications
//   useEffect(() => {
//     const saved = localStorage.getItem(NOTIF_STORAGE_KEY);
//     if (saved) {
//       try {
//         setNotifications(JSON.parse(saved));
//       } catch {}
//     }
//   }, []);

//   // Save notifications
//   useEffect(() => {
//     localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(notifications));
//   }, [notifications]);

//   // SignalR
//   useEffect(() => {
//     const connect = async () => {
//       const conn = new signalR.HubConnectionBuilder()
//         .withUrl(HUB_URL, { withCredentials: true })
//         .withAutomaticReconnect()
//         .build();

//       conn.on('NewUserRegistered', (user: RecentUserDto) => {
//         const notif: Notification = {
//           id: Date.now().toString(),
//           userId: user.userId,
//           fullName: user.fullName,
//           email: user.email,
//           role: user.role,
//           timestamp: new Date().toISOString(),
//         };

//         toast.success(
//           <div className="flex items-center gap-3">
//             <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center">
//               <Users className="h-5 w-5 text-blue-600" />
//             </div>
//             <div>
//               <p className="font-medium">{user.fullName}</p>
//               <p className="text-xs text-gray-600">New {user.role.toLowerCase()} registered</p>
//             </div>
//           </div>,
//           { duration: 4000 }
//         );

//         setRecentUsers(prev => [user, ...prev].slice(0, 100));
//         setNotifications(prev => [notif, ...prev].slice(0, 50));
//       });

//       try {
//         await conn.start();
//         connectionRef.current = conn;
//       } catch (err) {
//         toast.error('Live updates offline');
//       }
//     };

//     connect();
//     return () => { connectionRef.current?.stop(); };
//   }, []);

//   // Fetch data
//   useEffect(() => { fetchDashboardData(); }, []);

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
//     } catch {
//       toast.error('Failed to load data');
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   const clearAll = () => {
//     setNotifications([]);
//     toast.success('Cleared');
//   };

//   const removeNotif = (id: string) => {
//     setNotifications(prev => prev.filter(n => n.id !== id));
//   };

//   // Charts
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

//   const options = {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: { legend: { display: false } },
//     scales: {
//       y: { beginAtZero: true, grid: { color: '#e5e7eb' } },
//       x: { grid: { display: false } },
//     },
//   };

//   const idxLast = currentPage * usersPerPage;
//   const idxFirst = idxLast - usersPerPage;
//   const current = recentUsers.slice(idxFirst, idxLast);
//   const totalPages = Math.ceil(recentUsers.length / usersPerPage);

//   const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <Loader2 className="h-8 w-8 animate-spin" />
//       </div>
//     );
//   }

//   return (
//     <>
//       {/* Notification Sidebar */}
//       <div className={`fixed inset-y-0 right-0 w-80 bg-white shadow-2xl transition-transform z-50 ${showNotifBar ? 'translate-x-0' : 'translate-x-full'}`}>
//         <div className="flex items-center justify-between p-4 border-b">
//           <h3 className="font-bold flex items-center gap-2">
//             <Bell className="h-5 w-5" />
//             Notifications ({notifications.length})
//           </h3>
//           <div className="flex gap-2">
//             {notifications.length > 0 && (
//               <Button size="sm" variant="ghost" onClick={clearAll}>
//                 <Trash2 className="h-4 w-4" />
//               </Button>
//             )}
//             <Button size="sm" variant="ghost" onClick={() => setShowNotifBar(false)}>
//               <X className="h-4 w-4" />
//             </Button>
//           </div>
//         </div>
//         <div className="overflow-y-auto h-full">
//           {notifications.length === 0 ? (
//             <p className="p-8 text-center text-gray-500">No new notifications</p>
//           ) : (
//             notifications.map(n => (
//               <div key={n.id} className="p-4 border-b hover:bg-gray-50 flex justify-between">
//                 <div>
//                   <p className="font-medium text-sm">{n.fullName}</p>
//                   <p className="text-xs text-gray-600">{n.email}</p>
//                   <p className="text-xs text-gray-500">{new Date(n.timestamp).toLocaleTimeString()}</p>
//                   <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${getRoleColor(n.role)}`}>
//                     {n.role}
//                   </span>
//                 </div>
//                 <Button size="sm" variant="ghost" onClick={() => removeNotif(n.id)}>
//                   <X className="h-4 w-4" />
//                 </Button>
//               </div>
//             ))
//           )}
//         </div>
//       </div>

//       {/* Main Dashboard */}
//       <div className="min-h-screen bg-gray-50 p-6 space-y-6">
//         <div className="flex justify-between items-start">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
//             <p className="text-gray-600">Real-time system overview</p>
//           </div>
//           <div className="flex gap-3">
//             <Button onClick={() => fetchDashboardData(true)} disabled={refreshing}>
//               <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
//               Refresh
//             </Button>
//             <Button onClick={() => setShowNotifBar(true)} className="relative">
//               <Bell className="h-5 w-5" />
//               {notifications.length > 0 && (
//                 <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse"></span>
//               )}
//             </Button>
//           </div>
//         </div>

//         {/* Cards */}
//         {overview && (
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//             {[
//               { label: 'Total Users', value: overview.totalUsers, icon: Users, color: 'blue' },
//               { label: 'Revenue', value: `$${(overview.totalRevenue / 1000).toFixed(1)}k`, icon: DollarSign, color: 'green' },
//               { label: 'Appointments', value: overview.totalAppointments, icon: Calendar, color: 'purple' },
//               { label: 'Customers', value: overview.totalCustomers, icon: UserCheck, color: 'orange' },
//             ].map((c, i) => (
//               <Card key={i}>
//                 <CardContent className="p-6">
//                   <div className="flex justify-between">
//                     <div>
//                       <p className="text-sm text-gray-600">{c.label}</p>
//                       <p className="text-3xl font-bold mt-2">{c.value}</p>
//                     </div>
//                     <div className={`h-10 w-10 bg-${c.color}-100 rounded-lg flex items-center justify-center`}>
//                       <c.icon className={`h-5 w-5 text-${c.color}-600`} />
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         )}

//         {/* Charts */}
//         <div className="grid lg:grid-cols-2 gap-6">
//           <Card>
//             <CardHeader>
//               <CardTitle>Weekly Revenue</CardTitle>
//             </CardHeader>
//             <CardContent className="h-80">
//               {revenueData ? <Line data={revenueData} options={options} /> : <p className="text-center text-gray-500">No data</p>}
//             </CardContent>
//           </Card>
//           <Card>
//             <CardHeader>
//               <CardTitle>Weekly Appointments</CardTitle>
//             </CardHeader>
//             <CardContent className="h-80">
//               {apptData ? <Bar data={apptData} options={options} /> : <p className="text-center text-gray-500">No data</p>}
//             </CardContent>
//           </Card>
//         </div>

//         {/* Recent Users */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Recent Users</CardTitle>
//           </CardHeader>
//           <CardContent>
//             {current.length > 0 ? (
//               <>
//                 <table className="w-full">
//                   <thead>
//                     <tr className="border-b">
//                       <th className="text-left p-4">User</th>
//                       <th className="text-left p-4">Email</th>
//                       <th className="text-left p-4">Role</th>
//                       <th className="text-left p-4">Date</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {current.map(u => (
//                       <tr key={u.userId} className="border-b hover:bg-gray-50">
//                         <td className="p-4 flex items-center gap-3">
//                           <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
//                             <UserCheck className="h-5 w-5 text-blue-600" />
//                           </div>
//                           <span className="font-medium">{u.fullName}</span>
//                         </td>
//                         <td className="p-4 text-sm text-gray-600">{u.email}</td>
//                         <td className="p-4">
//                           <span className={`px-2 py-1 rounded-full text-xs ${getRoleColor(u.role)}`}>
//                             {u.role}
//                           </span>
//                         </td>
//                         <td className="p-4 text-sm text-gray-600">{formatDate(u.registeredDate)}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//                 {totalPages > 1 && (
//                   <div className="flex justify-between items-center mt-4">
//                     <p className="text-sm text-gray-600">
//                       Showing {idxFirst + 1}–{Math.min(idxLast, recentUsers.length)} of {recentUsers.length}
//                     </p>
//                     <div className="flex gap-2">
//                       <Button variant="outline" size="sm" disabled={currentPage === 1}
//                         onClick={() => setCurrentPage(p => p - 1)}>
//                         <ChevronLeft className="h-4 w-4" />
//                       </Button>
//                       <Button variant="outline" size="sm" disabled={currentPage === totalPages}
//                         onClick={() => setCurrentPage(p => p + 1)}>
//                         <ChevronRight className="h-4 w-4" />
//                       </Button>
//                     </div>
//                   </div>
//                 )}
//               </>
//             ) : (
//               <p className="text-center py-8 text-gray-500">No users yet</p>
//             )}
//           </CardContent>
//         </Card>

//         {/* Quick Actions */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Quick Actions</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
//               {[
//                 { icon: Users, label: 'Manage Users', path: '/admin/user_management' },
//                 { icon: Wrench, label: 'Services', path: '/admin/service_management' },
//                 { icon: TrendingUp, label: 'Analytics', path: '/admin/analytics' },
//                 { icon: FileEdit, label: 'Requests', path: '/admin/modification_requests' },
//               ].map((a, i) => (
//                 <Button key={i} variant="outline" className="h-24 flex flex-col gap-2"
//                   onClick={() => router.push(a.path)}>
//                   <a.icon className="h-8 w-8" />
//                   <span>{a.label}</span>
//                 </Button>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </>
//   );
// }


'use client';

import React, { useEffect, useState } from 'react';
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
  Filler,
} from 'chart.js';
import { 
  Users, Calendar, DollarSign, UserCheck, Wrench, TrendingUp, FileEdit,
  ChevronLeft, ChevronRight, RefreshCw, Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// Register Chart.js
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

// ──────────────────────────────────────────────────────────────
// DTOs
// ──────────────────────────────────────────────────────────────
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

const API_BASE = 'http://localhost:5001/api';

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

  // ───── Fetch data ─────
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

  const options = {
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
      case 'admin':    return 'bg-red-100 text-red-700';
      case 'employee': return 'bg-blue-100 text-blue-700';
      case 'customer': return 'bg-green-100 text-green-700';
      default:         return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Real-time system overview</p>
        </div>
        <Button onClick={() => fetchDashboardData(true)} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Overview Cards */}
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
          <CardHeader>
            <CardTitle>Weekly Revenue</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {revenueData ? <Line data={revenueData} options={options} /> : <p className="text-center text-gray-500">No data</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Weekly Appointments</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {apptData ? <Bar data={apptData} options={options} /> : <p className="text-center text-gray-500">No data</p>}
          </CardContent>
        </Card>
      </div>

      {/* Recent Users */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Users</CardTitle>
        </CardHeader>
        <CardContent>
          {currentUsers.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left p-4 text-sm font-medium text-gray-700">User</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-700">Email</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-700">Role</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-700">Registered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentUsers.map((user) => (
                      <tr key={user.userId} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <UserCheck className="h-5 w-5 text-blue-600" />
                            </div>
                            <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-gray-600">{user.email}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-gray-600">{formatDate(user.registeredDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
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
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
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

