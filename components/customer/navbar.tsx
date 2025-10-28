"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, LogOut, Menu } from "lucide-react";
import { useState } from "react";
import { useAuth } from '../../src/app/context/AuthContext'; // Import the useAuth hook
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function CustomerNavbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth(); // Get user and logout from context

  const navigationItems = [
    { name: "Dashboard", href: "/customer/dashboard" },
    { name: "Appointments", href: "/customer/appointments" },
    { name: "Modifications", href: "/customer/modifications" },
    { name: "Payments", href: "/customer/payments" },
  ];

  // Create dynamic user details with fallbacks
  const displayName = user ? `${user.firstName} ${user.lastName}` : "Guest";
  const displayRole = user ? user.role : "...";
  const displayInitials = user
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : "G";
  const userAvatar = ""; // You can add this to your User interface later if needed

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="flex h-16 items-center px-4 lg:px-6">
        {/* Logo */}
        <Link
          href="/customer/dashboard"
          className="flex items-center gap-2 mr-4 lg:mr-8"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1e3a5f] text-white font-bold">
            HI
          </div>
          <span className="text-xl font-semibold text-gray-900">
            ServiceHub
          </span>
        </Link>

        {/* Desktop Navigation Items - Centered */}
        <div className="hidden lg:flex items-center justify-center gap-1 flex-1">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === item.href
                  ? "bg-[#1e3a5f] text-white"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden ml-auto mr-4"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Right Section */}
        <div className="hidden lg:flex items-center gap-4">
          {/* Notifications (No changes) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  4
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">Appointment Confirmed</p>
                  <p className="text-xs text-gray-500">
                    Your house cleaning appointment is confirmed
                  </p>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-3 h-auto py-2 px-3"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userAvatar} alt={displayName} />
                  <AvatarFallback className="bg-[#1e3a5f] text-white text-sm">
                    {displayInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">{displayName}</span>
                  <span className="text-xs text-gray-500">{displayRole}</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href="/customer/profile" className="w-full">
                  Profile Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/customer/billing" className="w-full">
                  Billing
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 cursor-pointer"
                onClick={() => logout()}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t bg-white">
          <div className="px-4 py-2 space-y-1">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`block px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? "bg-[#1e3a5f] text-white"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}

            {/* Mobile User Actions */}
            <div className="pt-4 border-t mt-4">
              <div className="flex items-center gap-3 px-4 py-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userAvatar} alt={displayName} />
                  <AvatarFallback className="bg-[#1e3a5f] text-white text-sm">
                    {displayInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{displayName}</span>
                  <span className="text-xs text-gray-500">{displayRole}</span>
                </div>
              </div>
              <Link
                href="/customer/profile"
                className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Profile Settings
              </Link>
              <button
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 rounded-md"
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
              >
                <LogOut className="inline mr-2 h-4 w-4" />
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}