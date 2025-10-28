'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import AdminSidebar from "../../../components/admin/adminsidebar"; // Use your existing sidebar
import { useState } from 'react';

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
  const [sidebarOpen, setSidebarOpen] = useState(true); // Your sidebar state

  useEffect(() => {
    if (isLoading) {
      return; // Wait for session check
    }

    // If not loading and no user, redirect to login
    if (!user) {
      router.push('/login');
      return;
    }

    // If user exists but is not an Admin, redirect to unauthorized page
    if (user.role !== 'Admin') {
      router.push('/unauthorized'); // Or redirect to their own dashboard
    }
  }, [user, isLoading, router]);

  // Show loading spinner while checking auth or if user is not authorized
  if (isLoading || !user || user.role !== 'Admin') {
    return <LoadingSpinner />;
  }

  // User is authenticated and authorized as Admin
  const handleToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar isOpen={sidebarOpen} onToggle={handleToggle} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}