'use client';

import { useState, useEffect } from 'react';
import ProfileCard from '../../../../components/common/ProfileCard';
import { useAuth } from '@/app/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, MapPin, Calendar, Building, Users, Settings, BarChart3, Key } from 'lucide-react';
import { profileApiService, ProfileData, ProfileUpdateDto, handleApiError } from '@/services/profileAPI';
import { toast } from 'sonner';

export default function AdminProfilePage() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to detect if user is a Google user
  const isGoogleUser = (): boolean => {
    // You can enhance this logic based on your backend implementation
    // For now, we'll assume Google users don't have a traditional password
    // You might want to add a field in your backend to track login method
    return profileData?.email?.includes('@gmail.com') || false;
    // Alternative: check if password field is empty or if there's a specific flag from backend
  };

  // Load profile data from API
  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError(null);
      
      const result = await profileApiService.getCurrentUserProfile();
      
      if (result.success && result.data) {
        setProfileData(result.data);
      } else {
        setError(result.error || 'Failed to load profile');
        handleApiError(result.error || 'Failed to load profile');
      }
      
      setLoading(false);
    };

    if (user) {
      loadProfile();
    }
  }, [user]);

  const handleSave = async (updatedFields: Record<string, string>) => {
    try {
      // Prepare update data according to ProfileUpdateDto interface
      const updateDto: ProfileUpdateDto = {};
      
      if (updatedFields.firstName) updateDto.firstName = updatedFields.firstName;
      if (updatedFields.lastName) updateDto.lastName = updatedFields.lastName;
      if (updatedFields.email) updateDto.email = updatedFields.email;
      if (updatedFields.phoneNumber) updateDto.phoneNumber = updatedFields.phoneNumber;
      if (updatedFields.address) updateDto.address = updatedFields.address;
      if (updatedFields.profilePicture) updateDto.profilePicture = updatedFields.profilePicture;
      if (updatedFields.password) updateDto.newPassword = updatedFields.password;

      const result = await profileApiService.updateCurrentUserProfile(updateDto);
      
      if (result.success) {
        // Update local state with the new values
        setProfileData(prev => prev ? { ...prev, ...updatedFields } : null);
        toast.success('Profile updated successfully!');
      } else {
        toast.error(result.error || 'Failed to update profile');
        throw new Error(result.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Failed to update admin profile:', error);
      throw error;
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !profileData) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Profile</h2>
          <p className="text-gray-600 mb-4">{error || 'Profile data not available'}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const profileFields = [
    {
      id: 'firstName',
      label: 'First Name',
      value: profileData.firstName || '',
      type: 'text' as const,
      icon: <Users className="w-4 h-4" />,
      editable: true
    },
    {
      id: 'lastName',
      label: 'Last Name',
      value: profileData.lastName || '',
      type: 'text' as const,
      icon: <Users className="w-4 h-4" />,
      editable: true
    },
    {
      id: 'email',
      label: 'Email Address',
      value: profileData.email || '',
      type: 'email' as const,
      icon: <Mail className="w-4 h-4" />,
      editable: true
    },
    {
      id: 'phoneNumber',
      label: 'Phone Number',
      value: profileData.phoneNumber || '',
      type: 'tel' as const,
      icon: <Phone className="w-4 h-4" />,
      editable: true
    },
    {
      id: 'address',
      label: 'Address',
      value: profileData.address || '',
      type: 'text' as const,
      icon: <MapPin className="w-4 h-4" />,
      editable: true
    },
    {
      id: 'password',
      label: 'Password',
      value: '••••••••', // Always show masked password
      type: 'password' as const,
      icon: <Key className="w-4 h-4" />,
      editable: true
    },
    {
      id: 'profilePicture',
      label: 'Profile Picture',
      value: profileData.profilePicture || '',
      type: 'readonly' as const,
      icon: <Settings className="w-4 h-4" />,
      editable: false
    }
  ];


  return (
    <ProfileCard
      title="Administrator Profile"
      description="Manage your administrative account information and settings"
      fields={profileFields}
      onSave={handleSave}
      isGoogleUser={isGoogleUser()}
    />
  );
}