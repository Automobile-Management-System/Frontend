'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { CustomerNavbar } from '../../../components/customer/navbar';
import { CustomerFooter } from '../../../components/customer/footer';
import React from 'react';

// Simple loading component
const LoadingSpinner = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-blue-500 border-t-transparent"></div>
  </div>
);

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return; // Wait for session check
    }

    // If not loading and no user, redirect to login
    if (!user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Show loading spinner while checking auth
  if (isLoading || !user) {
    return <LoadingSpinner />;
  }

  // User is authenticated
  return (
    <div className="flex flex-col min-h-screen">
      <header>
        <CustomerNavbar />
      </header>
      <main className="flex-grow container mx-auto px-4 py-6">
        {children}
      </main>
      <footer className="mt-auto">
        <CustomerFooter />
      </footer>
    </div>
  );
}