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
