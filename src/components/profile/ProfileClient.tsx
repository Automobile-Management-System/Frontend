"use client";

import { useState } from "react";
import ProfileCard from "../../../components/common/ProfileCard";
import type { ProfileData, ProfileUpdateDto } from "@/services/profileAPI";
import { profileApiService } from "@/services/profileAPI";
import { toast } from "sonner";

interface ProfileClientProps {
  title: string;
  description: string;
  initialProfile: ProfileData | null;
}

export default function ProfileClient({ title, description, initialProfile }: ProfileClientProps) {
  const [profileData, setProfileData] = useState<ProfileData | null>(initialProfile);

  const isGoogleUser = (): boolean => {
    return profileData?.email?.includes("@gmail.com") || false;
  };

  const handleSave = async (updatedFields: Record<string, string>) => {
    try {
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
        setProfileData((prev) => (prev ? { ...prev, ...updatedFields } : prev));
        toast.success("Profile updated successfully!");
      } else {
        toast.error(result.error || "Failed to update profile");
        throw new Error(result.error || "Failed to update profile");
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to update profile:", error);
      throw error;
    }
  };

  if (!profileData) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Profile</h2>
          <p className="text-gray-600 mb-4">Profile data not available</p>
        </div>
      </div>
    );
  }

  const profileFields = [
    {
      id: "firstName",
      label: "First Name",
      value: profileData.firstName || "",
      type: "text" as const,
      editable: true,
    },
    {
      id: "lastName",
      label: "Last Name",
      value: profileData.lastName || "",
      type: "text" as const,
      editable: true,
    },
    {
      id: "email",
      label: "Email Address",
      value: profileData.email || "",
      type: "email" as const,
      editable: true,
    },
    {
      id: "phoneNumber",
      label: "Phone Number",
      value: profileData.phoneNumber || "",
      type: "tel" as const,
      editable: true,
    },
    {
      id: "address",
      label: "Address",
      value: profileData.address || "",
      type: "text" as const,
      editable: true,
    },
    {
      id: "password",
      label: "Password",
      value: "••••••••",
      type: "password" as const,
      editable: true,
    },
    {
      id: "profilePicture",
      label: "Profile Picture",
      value: profileData.profilePicture || "",
      type: "readonly" as const,
      editable: false,
    },
  ];

  return (
    <ProfileCard
      title={title}
      description={description}
      fields={profileFields}
      onSave={handleSave}
      isGoogleUser={isGoogleUser()}
    />
  );
}
