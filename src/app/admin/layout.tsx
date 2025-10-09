"use client";

import { useState } from "react";
import AdminSidebar from "../../../components/admin/adminsidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // ✅ useState must be inside the component
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
       <div className="flex h-screen bg-gray-50">
      {/* Sidebar Component */}
      <AdminSidebar isOpen={sidebarOpen} onToggle={handleToggle} />

  
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
  
  );
}
