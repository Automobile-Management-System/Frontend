const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface DashboardStats {
  totalUsers: number;
  activeBookings: number;
  monthlyRevenue: number;
  growthRate: number;
  totalUsersChange: number;
  activeBookingsChange: number;
  monthlyRevenueChange: number;
  growthRateChange: number;
}

export interface ChartData {
  weeklyRevenue: WeeklyData[];
  weeklyAppointments: WeeklyData[];
}

export interface WeeklyData {
  day: string;
  value: number;
}

export interface RecentUser {
  id: string;
  name: string;
  email: string;
  role: string;
  registeredAt: string;
}

export interface SystemAlert {
  id: string;
  type: 'Warning' | 'Info' | 'Success';
  message: string;
  isRead: boolean;
  createdAt: string;
  actionType?: string;
}

export interface DashboardData {
  stats: DashboardStats;
  charts: ChartData;
  recentUsers: RecentUser[];
  systemAlerts: SystemAlert[];
}

class AdminDashboardAPI {
  private async fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        credentials: 'include', // This sends the HttpOnly cookie automatically
      });

      if (!response.ok) {
        // Try to get error details from the response body
        let errorMessage = `API Error: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.text();
          console.error('Server error response:', errorData);
          if (errorData) {
            errorMessage += ` - ${errorData}`;
          }
        } catch (parseError) {
          console.error('Could not parse error response:', parseError);
        }
        throw new Error(errorMessage);
      }

      return response.json();
    } catch (error) {
      console.error('Fetch error for endpoint:', endpoint, error);
      throw error;
    }
  }

  async getDashboardData(): Promise<DashboardData> {
    return this.fetchWithAuth('/AdminDashboard');
  }

  async getStats(): Promise<DashboardStats> {
    return this.fetchWithAuth('/AdminDashboard/stats');
  }

  async getChartData(): Promise<ChartData> {
    return this.fetchWithAuth('/AdminDashboard/charts');
  }

  async getRecentUsers(): Promise<RecentUser[]> {
    return this.fetchWithAuth('/AdminDashboard/recent-users');
  }

  async getSystemAlerts(): Promise<SystemAlert[]> {
    return this.fetchWithAuth('/AdminDashboard/alerts');
  }

  async markAlertAsRead(alertId: string): Promise<void> {
    await this.fetchWithAuth(`/AdminDashboard/alerts/${alertId}/mark-read`, {
      method: 'PUT',
    });
  }
}

export const adminDashboardAPI = new AdminDashboardAPI();