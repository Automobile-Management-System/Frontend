
export interface ProfileData {
  userId: number;        // Maps to UserId in backend
  firstName: string;     // Maps to FirstName in backend
  lastName: string;      // Maps to LastName in backend
  email: string;         // Maps to Email in backend
  phoneNumber?: string;  // Maps to PhoneNumber in backend
  address?: string;      // Maps to Address in backend
  profilePicture?: string; // Maps to ProfilePicture in backend
  status: string;        // Maps to Status in backend
  // Add computed fields for compatibility
  id?: number;           // Alias for userId
  dateJoined?: string;   // May not be available from ProfileManagement API
  role?: 'Admin' | 'Employee' | 'Customer'; // May need to get from Auth context
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
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  /**
   * Get current user's profile from the backend
   */
  async getCurrentUserProfile(): Promise<ApiResponse<ProfileData>> {
    try {
      console.log('Fetching profile from:', `${this.baseUrl}/api/ProfileManagement`);
      
      const response = await fetch(`${this.baseUrl}/api/ProfileManagement`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
      });

      console.log('Profile API Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Profile API Error Response:', errorText);
        
        if (response.status === 401) {
          throw new Error('Unauthorized access - Please log in again');
        }
        if (response.status === 404) {
          throw new Error('Profile not found - User may not exist in ProfileManagement system');
        }
        if (response.status === 500) {
          throw new Error('Server error - Please try again later');
        }
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('Profile data received:', data);
      
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
      console.log('Updating profile with data:', updateData);
      
      const response = await fetch(`${this.baseUrl}/api/ProfileManagement`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify(updateData),
      });

      console.log('Update Profile API Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Update Profile API Error Response:', errorText);
        
        if (response.status === 401) {
          throw new Error('Unauthorized access - Please log in again');
        }
        if (response.status === 400) {
          // Try to parse error details from response
          try {
            const errorData = JSON.parse(errorText);
            throw new Error(errorData.error || 'Invalid data provided');
          } catch {
            throw new Error(errorText || 'Invalid data provided');
          }
        }
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      console.log('Profile updated successfully');
      
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
  console.error('API Error:', error);
  
  if (error.includes('Unauthorized') || error.includes('Please log in again')) {
    // Clear any cached user data and redirect to login
    console.warn('Authentication failed, redirecting to login...');
    // Don't immediately redirect, let the component handle it
    return;
  }
  
  if (error.includes('Profile not found')) {
    console.warn('Profile not found - this might be a new user or the ProfileManagement system is not properly set up');
  }
  
  if (error.includes('Server error')) {
    console.error('Backend server error occurred');
  }
};