
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import AdminSidebar from "../../../components/admin/adminsidebar"; 
import { Toaster } from 'sonner';

// Simple loading component
const LoadingSpinner = () => (
  <div className="flex h-screen items-center justify-center bg-gray-50">
    <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-blue-500 border-t-transparent"></div>
  </div>
);

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true); 

  useEffect(() => {
    if (isLoading) return; // Wait for session check

    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== 'Admin') {
      router.push('/unauthorized'); // Redirect if not admin
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== 'Admin') {
    return <LoadingSpinner />;
  }

  const handleToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Toaster for toast notifications */}
      <Toaster position="top-right" richColors />

      <AdminSidebar isOpen={sidebarOpen} onToggle={handleToggle} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
