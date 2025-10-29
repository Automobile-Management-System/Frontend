'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import EmployeeSidebar from '../../../components/employee/employeesidebar'; // Use your sidebar
import { useState } from 'react';

// Simple loading component
const LoadingSpinner = () => (
  <div className="flex h-screen items-center justify-center bg-gray-50">
     <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-blue-500 border-t-transparent"></div>
  </div>
);

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const allowedRoles = ['Admin', 'Employee'];

  useEffect(() => {
    if (isLoading) {
      return; 
    }

    if (!user) {
      router.push('/login');
      return;
    }

    // If user's role is not in the allowed list
    if (!allowedRoles.includes(user.role)) {
      router.push('/unauthorized');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || !allowedRoles.includes(user.role)) {
    return <LoadingSpinner />;
  }
  
  // User is authorized
  const handleToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <EmployeeSidebar isOpen={sidebarOpen} onToggle={handleToggle} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}