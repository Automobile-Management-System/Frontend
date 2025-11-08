"use client";

import {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from "react";
import { useRouter } from "next/navigation";

// Define the User type
interface User {
  id?: number; // User ID from the database
  employeeId?: number; // Employee ID (only for Employee role)
  customerId?: number; // Customer ID (only for Customer role)
  email: string;
  firstName: string;
  lastName: string;
  role: "Admin" | "Employee" | "Customer";
  profileImage?: string; // Profile image URL
}

// Define the Context shape
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  logout: () => Promise<void>;
  // We'll let the login page handle the login API call
  // But the context will provide a way to set the user after login
  setUser: (user: User | null) => void;
  // Function to refresh user profile data
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Flag to prevent repeated backend integration warnings
let backendWarningShown = false;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUserSession = async () => {
      try {
        // The browser automatically sends the HttpOnly cookie
        const response = await fetch("http://localhost:5001/api/Auth/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // IMPORTANT: This sends the cookie
        });

        if (response.ok) {
          const userData = await response.json();
          console.log("Profile data:", userData);

          // Fetch additional profile data including profile image
          try {
            const profileResponse = await fetch("http://localhost:5001/api/ProfileManagement", {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
            });

            if (profileResponse.ok) {
              const profileData = await profileResponse.json();
              // Merge profile data with auth data
              userData.profileImage = profileData.profilePicture;
            }
          } catch (profileError) {
            console.error("Failed to fetch profile data:", profileError);
          }

          // If user is an Employee, try to get employee ID from database
          if (userData.role === "Employee") {
            // Check if the profile response already includes employeeId
            if (userData.employeeId) {
              setUser(userData);
            } else {
              // Try to fetch employee ID from dashboard API as a workaround
              try {
                console.log(
                  "Attempting to fetch employee ID from dashboard API..."
                );
                const dashboardResponse = await fetch(
                  "http://localhost:5001/api/EmployeeDashboard/appointments/today/upcoming-count",
                  {
                    method: "GET",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    credentials: "include",
                  }
                );

                if (dashboardResponse.ok) {
                  const dashboardData = await dashboardResponse.json();
                  if (dashboardData.employeeId) {
                    console.log(
                      "✅ Successfully retrieved employee ID from dashboard API:",
                      dashboardData.employeeId
                    );
                    setUser({
                      ...userData,
                      employeeId: dashboardData.employeeId,
                    });
                  } else {
                    throw new Error("Dashboard API did not return employeeId");
                  }
                } else {
                  throw new Error(
                    `Dashboard API returned ${dashboardResponse.status}`
                  );
                }
              } catch (dashboardError) {
                console.error(
                  "Failed to fetch employee ID from dashboard API:",
                  dashboardError
                );

                // Only show backend integration warning once per session
                if (!backendWarningShown) {
                  console.log("Employee ID not provided by profile endpoint.");
                  console.warn("🚨 BACKEND INTEGRATION REQUIRED:");
                  console.warn(
                    "📋 Your backend team needs to implement ONE of these solutions:"
                  );
                  console.warn(
                    "   1. Add 'employeeId' field to /api/Auth/profile response (RECOMMENDED)"
                  );
                  console.warn(
                    "   2. Create GET /api/Employee/GetByEmail/{email} endpoint"
                  );
                  console.warn(
                    "   3. Create GET /api/Employee/profile endpoint"
                  );
                  console.warn(
                    "💡 See BACKEND_INTEGRATION_NEEDED.md for implementation details"
                  );
                  backendWarningShown = true;
                }

                // Set user without employee ID - will show appropriate error message
                setUser(userData);
              }
            }
          } else {
            setUser(userData);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Session check failed:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserSession();
  }, []); // Empty array means this runs once on mount

  const logout = async () => {
    try {
      await fetch("http://localhost:5001/api/Auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      // Clear user state regardless of API call success
      setUser(null);
      // Redirect to login page
      router.push("/login");
    }
  };

  const refreshUserProfile = async () => {
    try {
      // Fetch auth data
      const response = await fetch("http://localhost:5001/api/Auth/profile", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const userData = await response.json();
        
        // Fetch additional profile data including profile image
        try {
          const profileResponse = await fetch("http://localhost:5001/api/ProfileManagement", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          });

          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            // Merge profile data with auth data
            userData.profileImage = profileData.profilePicture;
          }
        } catch (profileError) {
          console.error("Failed to fetch profile data:", profileError);
        }

        setUser(userData);
      }
    } catch (error) {
      console.error("Failed to refresh user profile:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, logout, setUser, refreshUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
