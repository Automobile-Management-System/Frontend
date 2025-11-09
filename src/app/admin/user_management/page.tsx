

// "use client";

// import React, { useState, useEffect } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
// import { Button } from "../../../components/ui/button";
// import { Badge } from "../../../components/ui/badge";
// import { Input } from "../../../components/ui/input";
// import { Plus, Search, Edit2, UserCheck, UserX, Eye } from "lucide-react";
// import { Tabs, TabsContent } from "../../../components/ui/tabs";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
// import { UserDialog } from "../../../../components/admin/UserDialog";
// import { toast } from "sonner";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
// import Pagination from "../../../../components/admin/Pagination"; 

// interface UserAccount {
//   userId: number;
//   firstName: string;
//   lastName: string;
//   email: string;
//   phoneNumber: string;
//   address?: string;
//   role: "customer" | "employee" | "admin";
//   status: "Active" | "Inactive";
// }

// const BASE_URL = "http://localhost:5000/api/UserManagement";

// export default function UserManagement() {
//   const [users, setUsers] = useState<UserAccount[]>([]);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [roleFilter, setRoleFilter] = useState<"all" | "customer" | "employee" | "admin">("all");
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
//   const [viewUser, setViewUser] = useState<UserAccount | null>(null);
//   const [viewDialogOpen, setViewDialogOpen] = useState(false);
//   const [pageNumber, setPageNumber] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [totalCount, setTotalCount] = useState(0); 

//   // Count states
//   const [totalUsers, setTotalUsers] = useState(0);
//   const [activeUsers, setActiveUsers] = useState(0);
//   const [activeCustomers, setActiveCustomers] = useState(0);
//   const [activeEmployees, setActiveEmployees] = useState(0);

//   // Fetch users from backend
//   const fetchUsers = async () => {
//     try {
//       const queryParams = new URLSearchParams();
//       if (searchQuery) queryParams.append("search", searchQuery);
//       if (roleFilter !== "all") queryParams.append("role", roleFilter);
//       queryParams.append("pageNumber", pageNumber.toString());
//       queryParams.append("pageSize", "10");

//       const res = await fetch(`${BASE_URL}/all?${queryParams.toString()}`, { credentials: "include" });
//       if (!res.ok) throw new Error("Failed to fetch users");
//       const data = await res.json();

//       const items: UserAccount[] = Array.isArray(data) ? data : data.items || [];
//       const count: number = data.totalCount || items.length;

//       setUsers(items);
//       setTotalCount(count);
//       setTotalPages(Math.ceil(count / 10));
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to load users");
//       setUsers([]);
//       setTotalCount(0);
//       setTotalPages(1);
//     }
//   };

//   // Fetch counts from API
//   const fetchCounts = async () => {
//     try {
//       const [totalRes, activeRes, customersRes, employeesRes] = await Promise.all([
//         fetch(`${BASE_URL}/count/total`, { credentials: "include" }),
//         fetch(`${BASE_URL}/count/active`, { credentials: "include" }),
//         fetch(`${BASE_URL}/count/active-customers`, { credentials: "include" }),
//         fetch(`${BASE_URL}/count/active-employees`, { credentials: "include" }),
//       ]);

//       if (!totalRes.ok || !activeRes.ok || !customersRes.ok || !employeesRes.ok)
//         throw new Error("Failed to fetch counts");

//       const [totalData, activeData, customerData, employeeData] = await Promise.all([
//         totalRes.json(),
//         activeRes.json(),
//         customersRes.json(),
//         employeesRes.json(),
//       ]);

//       setTotalUsers(totalData);
//       setActiveUsers(activeData);
//       setActiveCustomers(customerData);
//       setActiveEmployees(employeeData);
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to load user counts");
//     }
//   };

//   useEffect(() => {
//     fetchUsers();
//   }, [searchQuery, roleFilter, pageNumber]);

//   useEffect(() => {
//     fetchCounts();
//   }, []);

//   // Fetch full user with address before editing
//   const handleEditUser = async (user: UserAccount) => {
//     try {
//       const res = await fetch(`${BASE_URL}/${user.userId}`, { credentials: "include" });
//       if (!res.ok) throw new Error("Failed to fetch user details");
//       const fullUser: UserAccount = await res.json();

//       setEditingUser(fullUser);
//       setDialogOpen(true);
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to load user for editing");
//     }
//   };

//   // Correct PUT request with proper status case
//   const handleCreateUser = async (data: any) => {
//     try {
//       if (editingUser) {
//         // EDIT MODE: PUT /api/UserManagement/{id}
//         const res = await fetch(`${BASE_URL}/${editingUser.userId}`, {
//           method: "PUT",
//           headers: { "Content-Type": "application/json" },
//           credentials: "include",
//           body: JSON.stringify({
//             firstName: data.firstName,
//             lastName: data.lastName,
//             phoneNumber: data.phoneNumber,
//             address: data.address,
//             status: data.status.charAt(0).toUpperCase() + data.status.slice(1), // "active" → "Active"
//           }),
//         });

//         if (!res.ok) {
//           const err = await res.text();
//           throw new Error(err || "Failed to update user");
//         }

//         toast.success("User updated successfully"); 
//       } else {
//         // CREATE MODE
//         const res = await fetch(`${BASE_URL}/add-employee`, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           credentials: "include",
//           body: JSON.stringify({
//             ...data,
//             role: "employee",
//           }),
//         });

//         if (!res.ok) {
//           const err = await res.text();
//           throw new Error(err || "Failed to add user");
//         }

//         toast.success("User created successfully");
//       }

//       setDialogOpen(false);
//       setEditingUser(null);
//       fetchUsers();
//       fetchCounts();
//     } catch (err: any) {
//       console.error(err);
//       toast.error(err.message || "Operation failed");
//     }
//   };

//   const handleToggleStatus = async (user: UserAccount) => {
//     try {
//       const url = `${BASE_URL}/${user.status === "Active" ? "deactivate" : "activate"}/${user.userId}`;
//       const res = await fetch(url, { method: "PUT", credentials: "include" });
//       if (!res.ok) throw new Error("Failed to update status");

//       toast.success(`User ${user.status === "Active" ? "deactivated" : "activated"} successfully`);
//       fetchUsers();
//       fetchCounts();
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to update status");
//     }
//   };

//   const handleViewUser = async (user: UserAccount) => {
//     try {
//       const res = await fetch(`${BASE_URL}/${user.userId}`, { credentials: "include" });
//       if (!res.ok) throw new Error("Failed to fetch user");

//       const data: UserAccount = await res.json();
//       setViewUser(data);
//       setViewDialogOpen(true);
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to load user");
//     }
//   };

//   const renderUserTable = (userList: UserAccount[]) => {
//     if (!Array.isArray(userList)) return null;

//     return (
//       <Table>
//         <TableHeader>
//           <TableRow>
//             <TableHead>ID</TableHead>
//             <TableHead>Name</TableHead>
//             <TableHead>Email</TableHead>
//             <TableHead>Phone</TableHead>
//             <TableHead>Role</TableHead>
//             <TableHead>Status</TableHead>
//             <TableHead className="text-right">Actions</TableHead>
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {userList.map((user) => (
//             <TableRow key={user.userId}>
//               <TableCell>{user.userId}</TableCell>
//               <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
//               <TableCell>{user.email}</TableCell>
//               <TableCell>{user.phoneNumber}</TableCell>
//               <TableCell>{user.role}</TableCell>
//               <TableCell>
//                 <Badge className={user.status === "Active" ? "bg-green-500" : "bg-red-600"}>
//                   {user.status}
//                 </Badge>
//               </TableCell>
//               <TableCell className="text-right">
//                 <div className="flex justify-end gap-2">
//                   <Button
//                     variant="ghost"
//                     size="icon"
//                     onClick={() => handleToggleStatus(user)}
//                     title={user.status === "Active" ? "Deactivate" : "Activate"}
//                   >
//                     {user.status === "Active" ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
//                   </Button>
//                   <Button variant="ghost" size="icon" onClick={() => handleEditUser(user)} title="Edit User">
//                     <Edit2 className="h-4 w-4" />
//                   </Button>
//                   <Button variant="ghost" size="icon" onClick={() => handleViewUser(user)} title="View User">
//                     <Eye className="h-4 w-4" />
//                   </Button>
//                 </div>
//               </TableCell>
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>
//     );
//   };

//   const customers = users.filter((u) => u.role === "customer");
//   const employees = users.filter((u) => u.role === "employee");
//   const admins = users.filter((u) => u.role === "admin");

//   return (
//     <div className="mx-5 my-5 space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h2 className="text-3xl text-[#0B2E66] font-bold">User Management</h2>
//           <p className="text-[#1F2A3C] mt-2">Manage customer and employee accounts</p>
//         </div>
//         <Button onClick={() => setDialogOpen(true)} className="bg-[#0B2E66] text-white hover:bg-[#1E63CC]">
//           <Plus className="h-4 w-4 mr-2" />
//           Add Employee
//         </Button>
//       </div>

//       <div className="grid sm:grid-cols-4 gap-4">
//         <Card>
//           <CardHeader className="pb-3">
//             <CardTitle className="text-sm">Total Users</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl">{totalUsers}</div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="pb-3">
//             <CardTitle className="text-sm">Active Users</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl">{activeUsers}</div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="pb-3">
//             <CardTitle className="text-sm">Total Customers</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl">{activeCustomers}</div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="pb-3">
//             <CardTitle className="text-sm">Total Employees</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl">{activeEmployees}</div>
//           </CardContent>
//         </Card>
//       </div>

//       <Card>
//         <CardHeader>
//           <div className="flex items-center gap-4">
//             <div className="relative flex-1">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
//               <Input
//                 placeholder="Search users by name, email"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="pl-9"
//               />
//             </div>

//             <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as any)}>
//               <SelectTrigger className="w-40">
//                 <SelectValue placeholder="Filter by role" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All</SelectItem>
//                 <SelectItem value="customer">Customer</SelectItem>
//                 <SelectItem value="employee">Employee</SelectItem>
//                 <SelectItem value="admin">Admin</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>
//         </CardHeader>

//         <CardContent>
//           <Tabs defaultValue="all" className="w-full">
//             <TabsContent value="all" className="mt-6">
//               {renderUserTable(users)}
//             </TabsContent>
//             <TabsContent value="customers" className="mt-6">
//               {renderUserTable(customers)}
//             </TabsContent>
//             <TabsContent value="employees" className="mt-6">
//               {renderUserTable(employees)}
//             </TabsContent>
//             <TabsContent value="admins" className="mt-6">
//               {renderUserTable(admins)}
//             </TabsContent>
//           </Tabs>

//           <Pagination
//             currentPage={pageNumber}
//             totalPages={totalPages}
//             totalItems={totalCount}
//             pageSize={10}
//             onPageChange={setPageNumber}
//           />
//         </CardContent>
//       </Card>

//       <UserDialog
//         open={dialogOpen}
//         onOpenChange={(open) => {
//           setDialogOpen(open);
//           if (!open) setEditingUser(null);
//         }}
//         onSubmit={handleCreateUser}
//         initialData={editingUser}
//       />

//       <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>User Details</DialogTitle>
//           </DialogHeader>
//           {viewUser && (
//             <div className="space-y-2">
//               <p><strong>ID:</strong> {viewUser.userId}</p>
//               <p><strong>Name:</strong> {viewUser.firstName} {viewUser.lastName}</p>
//               <p><strong>Email:</strong> {viewUser.email}</p>
//               <p><strong>Phone:</strong> {viewUser.phoneNumber}</p>
//               <p><strong>Address:</strong> {viewUser.address || "—"}</p>
//               <p><strong>Role:</strong> {viewUser.role}</p>
//               <p><strong>Status:</strong> {viewUser.status}</p>
//             </div>
//           )}
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }



"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Input } from "../../../components/ui/input";
import { Plus, Search, Edit2, UserCheck, UserX, Eye } from "lucide-react";
import { Tabs, TabsContent } from "../../../components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { UserDialog } from "../../../../components/admin/UserDialog";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import Pagination from "../../../../components/admin/Pagination"; 
// import { useAdminWebSocket } from "../../../../hooks/useAdminWebSocket"; // ✅ Import WebSocket hook
import { useAdminWebSocket } from '@/hooks/useAdminWebSocket';

interface UserAccount {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address?: string;
  role: "customer" | "employee" | "admin";
  status: "Active" | "Inactive";
}

const BASE_URL = "http://localhost:5000/api/UserManagement";

export default function UserManagement() {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "customer" | "employee" | "admin">("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [viewUser, setViewUser] = useState<UserAccount | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0); 

  // Count states
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [activeCustomers, setActiveCustomers] = useState(0);
  const [activeEmployees, setActiveEmployees] = useState(0);

  // ✅ WebSocket live refresh
  const handleWebSocketMessage = useCallback((data: any) => {
    console.log("📡 WebSocket update received:", data);

    if (data.type === "USER_STATUS_UPDATED" || data.type === "NEW_USER_ADDED") {
      toast.info("🔄 User data updated, refreshing...");
      fetchUsers();
      fetchCounts();
    }
  }, []);

  // ✅ Connect WebSocket (assuming adminId is stored in localStorage or context)
  const adminId = typeof window !== "undefined" ? localStorage.getItem("adminId") || "admin" : "admin";
  const { socketConnected } = useAdminWebSocket({ adminId, onMessage: handleWebSocketMessage });

  // Fetch users from backend
  const fetchUsers = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (searchQuery) queryParams.append("search", searchQuery);
      if (roleFilter !== "all") queryParams.append("role", roleFilter);
      queryParams.append("pageNumber", pageNumber.toString());
      queryParams.append("pageSize", "10");

      const res = await fetch(`${BASE_URL}/all?${queryParams.toString()}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();

      const items: UserAccount[] = Array.isArray(data) ? data : data.items || [];
      const count: number = data.totalCount || items.length;

      setUsers(items);
      setTotalCount(count);
      setTotalPages(Math.ceil(count / 10));
    } catch (err) {
      console.error(err);
      toast.error("Failed to load users");
      setUsers([]);
      setTotalCount(0);
      setTotalPages(1);
    }
  };

  // Fetch counts
  const fetchCounts = async () => {
    try {
      const [totalRes, activeRes, customersRes, employeesRes] = await Promise.all([
        fetch(`${BASE_URL}/count/total`, { credentials: "include" }),
        fetch(`${BASE_URL}/count/active`, { credentials: "include" }),
        fetch(`${BASE_URL}/count/active-customers`, { credentials: "include" }),
        fetch(`${BASE_URL}/count/active-employees`, { credentials: "include" }),
      ]);

      const [totalData, activeData, customerData, employeeData] = await Promise.all([
        totalRes.json(),
        activeRes.json(),
        customersRes.json(),
        employeesRes.json(),
      ]);

      setTotalUsers(totalData);
      setActiveUsers(activeData);
      setActiveCustomers(customerData);
      setActiveEmployees(employeeData);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load user counts");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchQuery, roleFilter, pageNumber]);

  useEffect(() => {
    fetchCounts();
  }, []);

  // Handle Edit, Create, Toggle, and View (same as before)...

  const handleEditUser = async (user: UserAccount) => {
    try {
      const res = await fetch(`${BASE_URL}/${user.userId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch user details");
      const fullUser: UserAccount = await res.json();
      setEditingUser(fullUser);
      setDialogOpen(true);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load user for editing");
    }
  };

  const handleCreateUser = async (data: any) => {
    try {
      if (editingUser) {
        const res = await fetch(`${BASE_URL}/${editingUser.userId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            firstName: data.firstName,
            lastName: data.lastName,
            phoneNumber: data.phoneNumber,
            address: data.address,
            status: data.status.charAt(0).toUpperCase() + data.status.slice(1),
          }),
        });

        if (!res.ok) throw new Error(await res.text() || "Failed to update user");
        toast.success("User updated successfully");
      } else {
        const res = await fetch(`${BASE_URL}/add-employee`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ ...data, role: "employee" }),
        });

        if (!res.ok) throw new Error(await res.text() || "Failed to add user");
        toast.success("User created successfully");
      }

      setDialogOpen(false);
      setEditingUser(null);
      fetchUsers();
      fetchCounts();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Operation failed");
    }
  };

  const handleToggleStatus = async (user: UserAccount) => {
    try {
      const url = `${BASE_URL}/${user.status === "Active" ? "deactivate" : "activate"}/${user.userId}`;
      const res = await fetch(url, { method: "PUT", credentials: "include" });
      if (!res.ok) throw new Error("Failed to update status");
      toast.success(`User ${user.status === "Active" ? "deactivated" : "activated"} successfully`);
      fetchUsers();
      fetchCounts();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };

  const handleViewUser = async (user: UserAccount) => {
    try {
      const res = await fetch(`${BASE_URL}/${user.userId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch user");
      const data: UserAccount = await res.json();
      setViewUser(data);
      setViewDialogOpen(true);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load user");
    }
  };

  const renderUserTable = (userList: UserAccount[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {userList.map((user) => (
          <TableRow key={user.userId}>
            <TableCell>{user.userId}</TableCell>
            <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.phoneNumber}</TableCell>
            <TableCell>{user.role}</TableCell>
            <TableCell>
              <Badge className={user.status === "Active" ? "bg-green-500" : "bg-red-600"}>{user.status}</Badge>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleToggleStatus(user)}>
                  {user.status === "Active" ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleEditUser(user)}>
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleViewUser(user)}>
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const customers = users.filter((u) => u.role === "customer");
  const employees = users.filter((u) => u.role === "employee");
  const admins = users.filter((u) => u.role === "admin");

  return (
    <div className="mx-5 my-5 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl text-[#0B2E66] font-bold">User Management</h2>
          <p className="text-[#1F2A3C] mt-2">Manage customer and employee accounts</p>
          <p className="text-sm text-gray-500 mt-1">
            WebSocket: {socketConnected ? "🟢 Connected" : "🔴 Disconnected"}
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="bg-[#0B2E66] text-white hover:bg-[#1E63CC]">
          <Plus className="h-4 w-4 mr-2" />
          Add Employee
        </Button>
      </div>

      {/* Count Cards */}
      <div className="grid sm:grid-cols-4 gap-4">
        <Card><CardHeader className="pb-3"><CardTitle className="text-sm">Total Users</CardTitle></CardHeader><CardContent><div className="text-2xl">{totalUsers}</div></CardContent></Card>
        <Card><CardHeader className="pb-3"><CardTitle className="text-sm">Active Users</CardTitle></CardHeader><CardContent><div className="text-2xl">{activeUsers}</div></CardContent></Card>
        <Card><CardHeader className="pb-3"><CardTitle className="text-sm">Total Customers</CardTitle></CardHeader><CardContent><div className="text-2xl">{activeCustomers}</div></CardContent></Card>
        <Card><CardHeader className="pb-3"><CardTitle className="text-sm">Total Employees</CardTitle></CardHeader><CardContent><div className="text-2xl">{activeEmployees}</div></CardContent></Card>
      </div>

      {/* Search + Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search users by name, email" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
            <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as any)}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Filter by role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="employee">Employee</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {renderUserTable(users)}
          <Pagination currentPage={pageNumber} totalPages={totalPages} totalItems={totalCount} pageSize={10} onPageChange={setPageNumber} />
        </CardContent>
      </Card>

      {/* User Dialog + View Dialog */}
      <UserDialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingUser(null); }} onSubmit={handleCreateUser} initialData={editingUser} />
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>User Details</DialogTitle></DialogHeader>
          {viewUser && (
            <div className="space-y-2">
              <p><strong>ID:</strong> {viewUser.userId}</p>
              <p><strong>Name:</strong> {viewUser.firstName} {viewUser.lastName}</p>
              <p><strong>Email:</strong> {viewUser.email}</p>
              <p><strong>Phone:</strong> {viewUser.phoneNumber}</p>
              <p><strong>Address:</strong> {viewUser.address || "—"}</p>
              <p><strong>Role:</strong> {viewUser.role}</p>
              <p><strong>Status:</strong> {viewUser.status}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
