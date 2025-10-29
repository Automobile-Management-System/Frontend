'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { getDashboardByRole } from '@/lib/utils';

export default function Unauthorized() {
    const { user } = useAuth();

    const homeUrl = user ? getDashboardByRole(user.role) : '/login';

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 text-white">
            <h1 className="text-6xl font-bold text-red-500">403</h1>
            <h2 className="mt-4 text-3xl font-semibold">Access Denied</h2>
            <p className="mt-2 text-gray-400">
                You do not have permission to view this page.
            </p>
            <Link href={homeUrl} className="mt-8 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-500">
                Go to Your Dashboard
            </Link>
        </div>
    );
}