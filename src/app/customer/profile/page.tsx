import { headers } from 'next/headers';
import ProfileClient from '@/components/profile/ProfileClient';

export default async function CustomerProfilePage() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
  let initialProfile = null;

  try {
    const hdrs = await headers();
    const cookie = hdrs.get('cookie') || '';
    const res = await fetch(`${baseUrl}/api/ProfileManagement`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        cookie,
      },
      cache: 'no-store',
    });

    if (res.ok) {
      initialProfile = await res.json();
    }
  } catch (e) {
    // swallow and render client with null profile
  }

  return (
    <ProfileClient
      title="Customer Profile"
      description="Manage your account information and vehicle details"
      initialProfile={initialProfile}
    />
  );
}