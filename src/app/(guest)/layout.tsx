'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { getDashboardByRole } from '@/lib/utils';

// Simple loading component
const LoadingSpinner = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-900">
    <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-blue-500 border-t-transparent"></div>
  </div>
);

export default function GuestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return; // Wait until loading is complete
    }

    if (user) {
      // User is logged in, redirect them away from guest pages
      const dashboardUrl = getDashboardByRole(user.role);
      router.push(dashboardUrl);
    }
  }, [user, isLoading, router]);

  // While loading or redirecting, show a spinner
  if (isLoading || user) {
    return <LoadingSpinner />;
  }

  // If not loading and no user, show the login/signup page
  return <>{children}</>;
}