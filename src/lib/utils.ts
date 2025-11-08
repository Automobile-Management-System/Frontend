import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// app/lib/utils.ts

export const getDashboardByRole = (role: string): string => {
  switch (role) {
    case 'Admin':
      return '/admin/dashboard';
    case 'Employee':
      return '/employee/dashboard';
    case 'Customer':
    default:
      return '/customer/dashboard';
  }
};

/**
 * Converts decimal hours to hours and minutes format
 * @param decimalHours - Hours in decimal format (e.g., 0.03, 1.5, 2.75)
 * @returns Formatted string like "0h 2m", "1h 30m", or "2h 45m"
 */
export const formatHoursAndMinutes = (decimalHours: number): string => {
  if (decimalHours === 0) return "0h 0m";
  
  const hours = Math.floor(decimalHours);
  const minutes = Math.round((decimalHours - hours) * 60);
  
  if (hours === 0) {
    return `${minutes}m`;
  } else if (minutes === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${minutes}m`;
  }
};
