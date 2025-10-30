
export interface ProfileData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;  // Changed from 'phone' to 'phoneNumber' to match backend
  address?: string;
  profilePicture?: string;  // Added to match backend
  dateJoined: string;
  role: 'Admin' | 'Employee' | 'Customer';
  
}

export interface ProfileUpdateDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;  // Changed from 'phone' to 'phoneNumber' to match backend
  address?: string;
  profilePicture?: string;  // Added to match backend
  newPassword?: string;  // Changed from 'password' to 'newPassword' to match backend
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class ProfileApiService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

  /**
   * Get current user's profile from the backend
   */
  async getCurrentUserProfile(): Promise<ApiResponse<ProfileData>> {
    try {
      const response = await fetch(`${this.baseUrl}/ProfileManagement`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized access');
        }
        if (response.status === 404) {
          throw new Error('Profile not found');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error fetching profile:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch profile'
      };
    }
  }

  /**
   * Update current user's profile
   */
  async updateCurrentUserProfile(updateData: ProfileUpdateDto): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${this.baseUrl}/ProfileManagement`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized access');
        }
        if (response.status === 400) {
          // Try to get error details from response
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Invalid data provided');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return {
        success: true
      };
    } catch (error) {
      console.error('Error updating profile:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update profile'
      };
    }
  }

  /**
   * Upload profile image (if you plan to add this feature later)
   */
  async uploadProfileImage(file: File): Promise<ApiResponse<string>> {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${this.baseUrl}/ProfileManagement/image`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.imageUrl
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload image'
      };
    }
  }
}

// Export a singleton instance
export const profileApiService = new ProfileApiService();

// Helper function to handle API errors
export const handleApiError = (error: string) => {
  if (error.includes('Unauthorized')) {
    // Redirect to login or show authentication error
    window.location.href = '/login';
  }
  // You can add toast notifications here if you have a toast system
  console.error('API Error:', error);
};