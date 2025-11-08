// "use client";

// import React, { useEffect, useState } from "react";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import {
//   Calendar,
//   DollarSign, 
//   Wrench,
//   ArrowRight,
//   CheckCircle,
//   Car,
// } from "lucide-react";
// import { Badge } from "@/components/ui/badge";
// import { useRouter } from "next/navigation";
// import { VehicleDialog } from "../../../../components/customer/VehicleDialog";
// import { toast } from "sonner"; 

// const API_BASE = "http://localhost:5001/api/CustomerDashboard";

// export default function CustomerDashboard() {
//   const router = useRouter();
//   const [isVehicleDialogOpen, setIsVehicleDialogOpen] = useState(false);
//   const [stats, setStats] = useState({
//     upcoming: 0,
//     inProgress: 0,
//     completed: 0,
//     pendingPayments: 0,
//   });
//   const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
//   const [recentModifications, setRecentModifications] = useState<any[]>([]);
//   const [error, setError] = useState<string | null>(null);

//   // Helper to safely parse JSON
//   const safeJson = async (res: Response) => {
//     try {
//       const text = await res.text();
//       return text ? JSON.parse(text) : null;
//     } catch (err) {
//       console.error("Failed to parse JSON:", err);
//       return null;
//     }
//   };

//   // Fetch dashboard data
//   const fetchDashboardData = async () => {
//     setError(null);

//     try {
//       const [
//         upcomingRes,
//         inProgressRes,
//         completedRes,
//         pendingPaymentsRes,
//         latestServicesRes,
//         latestModsRes,
//       ] = await Promise.all([
//         fetch(`${API_BASE}/upcoming-count`, { credentials: "include" }),
//         fetch(`${API_BASE}/inprogress-count`, { credentials: "include" }),
//         fetch(`${API_BASE}/completed-count`, { credentials: "include" }),
//         fetch(`${API_BASE}/pending-payments-total`, { credentials: "include" }),
//         fetch(`${API_BASE}/latest-services`, { credentials: "include" }),
//         fetch(`${API_BASE}/latest-modifications`, { credentials: "include" }),
//       ]);

//       if (upcomingRes.status === 401) {
//         setError("User not logged in. Please login to view dashboard.");
//         return;
//       }

//       const upcomingData = await safeJson(upcomingRes);
//       const inProgressData = await safeJson(inProgressRes);
//       const completedData = await safeJson(completedRes);
//       const pendingPaymentsData = await safeJson(pendingPaymentsRes);
//       const latestServicesData = (await safeJson(latestServicesRes)) || [];
//       const latestModsData = (await safeJson(latestModsRes)) || [];

//       setStats({
//         upcoming: upcomingData?.upcomingCount || 0,
//         inProgress: inProgressData?.inProgressCount || 0,
//         completed: completedData?.completedCount || 0,
//         pendingPayments: pendingPaymentsData?.pendingPaymentsTotal || 0,
//       });

//       // Transform the data to group services and modifications by appointment
//       const transformedServices = latestServicesData.map((item: any) => ({
//         id: item.date,
//         services: item.services,
//         date: new Date(item.date).toLocaleDateString(),
//         status: "completed",
//       }));

//       const transformedMods = latestModsData.map((item: any) => ({
//         id: item.date,
//         modifications: item.modifications,
//         date: new Date(item.date).toLocaleDateString(),
//         status: "completed",
//       }));

//       setUpcomingAppointments(transformedServices);
//       setRecentModifications(transformedMods);
//     } catch (err) {
//       console.error("Error fetching dashboard data:", err);
//       setError("An unexpected error occurred while fetching dashboard data.");
//     }
//   };

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   const handleNavigate = (tabOrUrl: string) => {
//     if (tabOrUrl.startsWith("http")) {
//       window.location.href = tabOrUrl;
//     } else {
//       router.push(`/customer/${tabOrUrl}`);
//     }
//   };

//   const handleAddVehicle = async (vehicleData: any) => {
//     try {
//       const res = await fetch(`http://localhost:5001/api/CustomerVehicle`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify(vehicleData),
//       });

//       if (res.status === 401) {
//         setError("User not logged in. Cannot add vehicle.");
//         toast.error("User not logged in. Cannot add vehicle.");
//         return;
//       }

//       if (res.ok) {
//         toast.success("Vehicle added successfully!");
//         setIsVehicleDialogOpen(false);
//         fetchDashboardData();
//       } else {
//         const text = await res.text();
//         const err = text ? JSON.parse(text) : { message: "Unknown error" };
//         toast.error("Error adding vehicle: " + err.message);
//       }
//     } catch (err) {
//       console.error("Add Vehicle error:", err);
//       setError("Failed to add vehicle. Please try again later.");
//       toast.error("Failed to add vehicle. Please try again later.");
//     }
//   };

//   const statsConfig = [
//     {
//       title: "Upcoming Appointments",
//       value: stats.upcoming,
//       icon: Calendar,
//       color: "text-blue-600",
//       bgColor: "bg-blue-50",
//       action: () => handleNavigate("appointments"),
//     },
//     {
//       title: "Active Projects",
//       value: stats.inProgress,
//       icon: Wrench,
//       color: "text-purple-600",
//       bgColor: "bg-purple-50",
//       action: () => handleNavigate("modifications"),
//     },
//     {
//       title: "Pending Payments",
//       value: `LKR ${stats.pendingPayments}`,
//       icon: DollarSign,
//       color: "text-green-600",
//       bgColor: "bg-green-50",
//       action: () => handleNavigate("payments"),
//     },
//     {
//       title: "Completed Services",
//       value: stats.completed,
//       icon: CheckCircle,
//       color: "text-gray-600",
//       bgColor: "bg-gray-50",
//       action: () => handleNavigate("appointments"),
//     },
//   ];

//   return (
//     <div className="space-y-8 mx-5 my-5">
//       {error && (
//         <div className="p-4 bg-red-100 text-red-800 rounded-md">{error}</div>
//       )}

//       {/* Welcome Header with Add Vehicle */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h2 className="text-2xl font-semibold">Welcome Back!</h2>
//           <p className="text-muted-foreground mt-1">
//             Here's what's happening with your services
//           </p>
//         </div>
//         <Button
//           onClick={() => setIsVehicleDialogOpen(true)}
//           className="ml-4 bg-orange-400 text-white hover:bg-orange-300"
//           size="sm"
//         >
//           + Add Vehicle
//         </Button>
//       </div>

//       {/* Vehicle Dialog */}
//       <VehicleDialog
//         open={isVehicleDialogOpen}
//         onOpenChange={setIsVehicleDialogOpen}
//         onSubmit={handleAddVehicle}
//       />

//       {/* Stats Grid */}
//       <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
//         {statsConfig.map((stat) => {
//           const Icon = stat.icon;
//           return (
//             <Card
//               key={stat.title}
//               className="cursor-pointer hover:shadow-md transition-shadow"
//               onClick={stat.action}
//             >
//               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                 <CardTitle className="text-sm text-muted-foreground">
//                   {stat.title}
//                 </CardTitle>
//                 <div
//                   className={`h-10 w-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}
//                 >
//                   <Icon className={`h-5 w-5 ${stat.color}`} />
//                 </div>
//               </CardHeader>
//               <CardContent>
//                 <div className="text-2xl font-semibold">{stat.value}</div>
//               </CardContent>
//             </Card>
//           );
//         })}
//       </div>

//       {/* Recent Appointments + Modifications */}
//       <div className="grid lg:grid-cols-2 gap-6">
//         {/* Appointments */}
//         <Card>
//           <CardHeader>
//             <div className="flex items-center justify-between">
//               <div>
//                 <CardTitle>Recent Service Requests</CardTitle>
//                 <CardDescription className="mt-1">
//                   Your recent services
//                 </CardDescription>
//               </div>
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 onClick={() => handleNavigate("appointments")}
//               >
//                 View All
//                 <ArrowRight className="h-4 w-4 ml-2" />
//               </Button>
//             </div>
//           </CardHeader>
//           <CardContent className="space-y-3">
//             {upcomingAppointments.length === 0 && (
//               <p className="text-sm text-muted-foreground">
//                 No recent service requests found.
//               </p>
//             )}
//             {upcomingAppointments.map((appointment) => (
//               <div
//                 key={appointment.id}
//                 className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-gray-50 transition-colors"
//               >
//                 <div className="flex items-center gap-3">
//                   <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
//                     <Calendar className="h-5 w-5 text-blue-600" />
//                   </div>
//                   <div>
//                     <div className="text-sm">
//                       {appointment.services.map((service: string, idx: number) => (
//                         <div key={idx}>{service}</div>
//                       ))}
//                     </div>
//                     <p className="text-xs text-muted-foreground mt-0.5">
//                       {appointment.date}
//                     </p>
//                   </div>
//                 </div>
//                 <Badge
//                   variant={
//                     appointment.status === "in-progress" ? "default" : "secondary"
//                   }
//                   className={
//                     appointment.status === "in-progress"
//                       ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
//                       : "bg-green-100 text-green-800 hover:bg-green-100"
//                   }
//                 >
//                   {appointment.status === "in-progress"
//                     ? "In Progress"
//                     : "Completed"}
//                 </Badge>
//               </div>
//             ))}
//           </CardContent>
//         </Card>

//         {/* Modifications */}
//         <Card>
//           <CardHeader>
//             <div className="flex items-center justify-between">
//               <div>
//                 <CardTitle>Recent Modification Requests</CardTitle>
//                 <CardDescription className="mt-1">
//                   Your recent modifications
//                 </CardDescription>
//               </div>
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 onClick={() => handleNavigate("modifications")}
//               >
//                 View All
//                 <ArrowRight className="h-4 w-4 ml-2" />
//               </Button>
//             </div>
//           </CardHeader>
//           <CardContent className="space-y-3">
//             {recentModifications.length === 0 && (
//               <p className="text-sm text-muted-foreground">
//                 No recent modifications found.
//               </p>
//             )}
//             {recentModifications.map((mod) => (
//               <div
//                 key={mod.id}
//                 className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-gray-50 transition-colors"
//               >
//                 <div className="flex items-center gap-3">
//                   <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center">
//                     <Wrench className="h-5 w-5 text-purple-600" />
//                   </div>
//                   <div>
//                     <div className="text-sm">
//                       {mod.modifications.map((modification: string, idx: number) => (
//                         <div key={idx}>{modification}</div>
//                       ))}
//                     </div>
//                     <p className="text-xs text-muted-foreground mt-0.5">
//                       {mod.date}
//                     </p>
//                   </div>
//                 </div>
//                 <Badge
//                   variant={mod.status === "in-progress" ? "default" : "secondary"}
//                   className={
//                     mod.status 
//                   }
//                 >
//                   {mod.status === "in-progress" ? "In Progress" : "Completed"}
//                 </Badge>
//               </div>
//             ))}
//           </CardContent>
//         </Card>
//       </div>

//       {/* Quick Actions */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Quick Actions</CardTitle>
//           <CardDescription className="mt-1">
//             Common tasks and services
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
//             <Button
//               variant="outline"
//               className="h-auto py-6 flex flex-col gap-3 hover:bg-gray-50"
//               onClick={() => handleNavigate("appointments")}
//             >
//               <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center">
//                 <Calendar className="h-6 w-6 text-blue-600" />
//               </div>
//               <span className="text-sm">Request Service</span>
//             </Button>

//             <Button
//               variant="outline"
//               className="h-auto py-6 flex flex-col gap-3 hover:bg-gray-50"
//               onClick={() => handleNavigate("modifications")}
//             >
//               <div className="h-12 w-12 rounded-lg bg-purple-50 flex items-center justify-center">
//                 <Wrench className="h-6 w-6 text-purple-600" />
//               </div>
//               <span className="text-sm">Request Modification</span>
//             </Button>

//             <Button
//               variant="outline"
//               className="h-auto py-6 flex flex-col gap-3 hover:bg-gray-50"
//               onClick={() => handleNavigate("payments")}
//             >
//               <div className="h-12 w-12 rounded-lg bg-green-50 flex items-center justify-center">
//                 <DollarSign className="h-6 w-6 text-green-600" />
//               </div>
//               <span className="text-sm">Make Payment</span>
//             </Button>

//             <Button
//               variant="outline"
//               className="h-auto py-6 flex flex-col gap-3 hover:bg-gray-50"
//               onClick={() => handleNavigate("vehicles")}
//             >
//               <div className="h-12 w-12 rounded-lg bg-orange-50 flex items-center justify-center">
//                 <Car className="h-6 w-6 text-orange-600" />
//               </div>
//               <span className="text-sm">My Vehicles</span>
//             </Button>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }


"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  DollarSign, 
  Wrench,
  ArrowRight,
  CheckCircle,
  Car,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { VehicleDialog } from "../../../../components/customer/VehicleDialog";
import { toast } from "sonner"; 

const API_BASE = "http://localhost:5001/api/CustomerDashboard";

export default function CustomerDashboard() {
  const router = useRouter();
  const [isVehicleDialogOpen, setIsVehicleDialogOpen] = useState(false);
  const [stats, setStats] = useState({
    upcoming: 0,
    inProgress: 0,
    completed: 0,
    pendingPayments: 0,
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [recentModifications, setRecentModifications] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Helper to safely parse JSON
  const safeJson = async (res: Response) => {
    try {
      const text = await res.text();
      return text ? JSON.parse(text) : null;
    } catch (err) {
      console.error("Failed to parse JSON:", err);
      return null;
    }
  };

  // Helper to get badge styling based on real status
  const getStatusBadge = (status: string) => {
    const map: Record<
      string,
      { variant: "default" | "secondary" | "outline"; className: string; label: string }
    > = {
      Pending: {
        variant: "outline",
        className: "bg-orange-100 text-orange-800 hover:bg-orange-100",
        label: "Pending",
      },
      Upcoming: {
        variant: "secondary",
        className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
        label: "Upcoming",
      },
      InProgress: {
        variant: "default",
        className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
        label: "In Progress",
      },
      Completed: {
        variant: "secondary",
        className: "bg-green-100 text-green-800 hover:bg-green-100",
        label: "Completed",
      },
      Rejected: {
        variant: "outline",
        className: "bg-red-100 text-red-800 hover:bg-red-100",
        label: "Rejected",
      },
    };

    const cfg = map[status] ?? {
      variant: "secondary",
      className: "bg-gray-100 text-gray-800 hover:bg-gray-100",
      label: status,
    };

    return cfg;
  };

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    setError(null);

    try {
      const [
        upcomingRes,
        inProgressRes,
        completedRes,
        pendingPaymentsRes,
        latestServicesRes,
        latestModsRes,
      ] = await Promise.all([
        fetch(`${API_BASE}/upcoming-count`, { credentials: "include" }),
        fetch(`${API_BASE}/inprogress-count`, { credentials: "include" }),
        fetch(`${API_BASE}/completed-count`, { credentials: "include" }),
        fetch(`${API_BASE}/pending-payments-total`, { credentials: "include" }),
        fetch(`${API_BASE}/latest-services`, { credentials: "include" }),
        fetch(`${API_BASE}/latest-modifications`, { credentials: "include" }),
      ]);

      if (upcomingRes.status === 401) {
        setError("User not logged in. Please login to view dashboard.");
        return;
      }

      const upcomingData = await safeJson(upcomingRes);
      const inProgressData = await safeJson(inProgressRes);
      const completedData = await safeJson(completedRes);
      const pendingPaymentsData = await safeJson(pendingPaymentsRes);
      const latestServicesData = (await safeJson(latestServicesRes)) || [];
      const latestModsData = (await safeJson(latestModsRes)) || [];

      setStats({
        upcoming: upcomingData?.upcomingCount || 0,
        inProgress: inProgressData?.inProgressCount || 0,
        completed: completedData?.completedCount || 0,
        pendingPayments: pendingPaymentsData?.pendingPaymentsTotal || 0,
      });

      // Transform the data to group services and modifications by appointment
      const transformedServices = latestServicesData.map((item: any) => ({
        id: item.date,
        services: item.services,
        date: new Date(item.date).toLocaleDateString(),
        status: item.status, // Real status from backend
      }));

      const transformedMods = latestModsData.map((item: any) => ({
        id: item.date,
        modifications: item.modifications,
        date: new Date(item.date).toLocaleDateString(),
        status: item.status, // Real status from backend
      }));

      setUpcomingAppointments(transformedServices);
      setRecentModifications(transformedMods);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("An unexpected error occurred while fetching dashboard data.");
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleNavigate = (tabOrUrl: string) => {
    if (tabOrUrl.startsWith("http")) {
      window.location.href = tabOrUrl;
    } else {
      router.push(`/customer/${tabOrUrl}`);
    }
  };

  const handleAddVehicle = async (vehicleData: any) => {
    try {
      const res = await fetch(`http://localhost:5001/api/CustomerVehicle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(vehicleData),
      });

      if (res.status === 401) {
        setError("User not logged in. Cannot add vehicle.");
        toast.error("User not logged in. Cannot add vehicle.");
        return;
      }

      if (res.ok) {
        toast.success("Vehicle added successfully!");
        setIsVehicleDialogOpen(false);
        fetchDashboardData();
      } else {
        const text = await res.text();
        const err = text ? JSON.parse(text) : { message: "Unknown error" };
        toast.error("Error adding vehicle: " + err.message);
      }
    } catch (err) {
      console.error("Add Vehicle error:", err);
      setError("Failed to add vehicle. Please try again later.");
      toast.error("Failed to add vehicle. Please try again later.");
    }
  };

  const statsConfig = [
    {
      title: "Upcoming Appointments",
      value: stats.upcoming,
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      action: () => handleNavigate("appointments"),
    },
    {
      title: "Active Projects",
      value: stats.inProgress,
      icon: Wrench,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      action: () => handleNavigate("modifications"),
    },
    {
      title: "Pending Payments",
      value: `LKR ${stats.pendingPayments}`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
      action: () => handleNavigate("payments"),
    },
    {
      title: "Completed Services",
      value: stats.completed,
      icon: CheckCircle,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      action: () => handleNavigate("appointments"),
    },
  ];

  return (
    <div className="space-y-8 mx-5 my-5">
      {error && (
        <div className="p-4 bg-red-100 text-red-800 rounded-md">{error}</div>
      )}

      {/* Welcome Header with Add Vehicle */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Welcome Back!</h2>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your services
          </p>
        </div>
        <Button
          onClick={() => setIsVehicleDialogOpen(true)}
          className="ml-4 bg-[#0B2E66] text-white hover:bg-[#1E63CC]"
          size="sm"
        >
          + Add Vehicle
        </Button>
      </div>

      {/* Vehicle Dialog */}
      <VehicleDialog
        open={isVehicleDialogOpen}
        onOpenChange={setIsVehicleDialogOpen}
        onSubmit={handleAddVehicle}
      />

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsConfig.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={stat.action}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div
                  className={`h-10 w-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}
                >
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Services + Modifications */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Services */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Service Requests</CardTitle>
                <CardDescription className="mt-1">
                  Your recent services
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNavigate("services")}
              >
                View All
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingAppointments.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No recent service requests found.
              </p>
            )}
            {upcomingAppointments.map((appointment) => {
              const badge = getStatusBadge(appointment.status);
              return (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm">
                        {appointment.services.map((service: string, idx: number) => (
                          <div key={idx}>{service}</div>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {appointment.date}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={badge.variant}
                    className={badge.className}
                  >
                    {badge.label}
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Modifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Modification Requests</CardTitle>
                <CardDescription className="mt-1">
                  Your recent modifications
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNavigate("modifications")}
              >
                View All
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentModifications.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No recent modifications found.
              </p>
            )}
            {recentModifications.map((mod) => {
              const badge = getStatusBadge(mod.status);
              return (
                <div
                  key={mod.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center">
                      <Wrench className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-sm">
                        {mod.modifications.map((modification: string, idx: number) => (
                          <div key={idx}>{modification}</div>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {mod.date}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={badge.variant}
                    className={badge.className}
                  >
                    {badge.label}
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription className="mt-1">
            Common tasks and services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-auto py-6 flex flex-col gap-3 hover:bg-gray-50"
              onClick={() => handleNavigate("services")}
            >
              <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-sm">Request Service</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-6 flex flex-col gap-3 hover:bg-gray-50"
              onClick={() => handleNavigate("modifications")}
            >
              <div className="h-12 w-12 rounded-lg bg-purple-50 flex items-center justify-center">
                <Wrench className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-sm">Request Modification</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-6 flex flex-col gap-3 hover:bg-gray-50"
              onClick={() => handleNavigate("payments")}
            >
              <div className="h-12 w-12 rounded-lg bg-green-50 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-sm">Make Payment</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-6 flex flex-col gap-3 hover:bg-gray-50"
              onClick={() => handleNavigate("vehicles")}
            >
              <div className="h-12 w-12 rounded-lg bg-orange-50 flex items-center justify-center">
                <Car className="h-6 w-6 text-orange-600" />
              </div>
              <span className="text-sm">My Vehicles</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}