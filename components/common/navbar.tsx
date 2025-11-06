"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, LogOut, Menu, Car, User } from "lucide-react";
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

// Props are no longer needed for auth state
export function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Get auth state from the context
  const { user, isLoading, logout } = useAuth();
  const isLoggedIn = !!user;

  // Helper to redirect to correct dashboard
  function getDashboardByRole(role: string) {
    switch (role) {
      case 'Admin': return '/admin/dashboard';
      case 'Employee': return '/employee/dashboard';
      default: return '/customer/dashboard';
    }
  }

  // --- NAVIGATION ARRAYS ---

  // Public (logged-out) navigation items
  const publicNavItems = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Services", href: "/services" }
  ];

  // Logged-in navigation items (for mobile menu)
  // This matches your requested order
  const loggedInMobileNavItems = [
    { name: "Dashboard", href: isLoggedIn ? getDashboardByRole(user.role) : "/" },
    { name: "Services", href: "/customer/services" },
    { name: "Modifications", href: "/customer/modifications" },
    { name: "Payments", href: "/customer/payments" },
    { name: "About", href: "/about" }
  ];

  // --- DYNAMIC USER DETAILS ---
  const displayName = user ? `${user.firstName} ${user.lastName}` : "Guest";
  const displayEmail = user ? user.email : "guest@example.com";
  const displayRole = user ? user.role : "Guest";
  const displayInitials = user
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : "G";
  const userAvatar = ""; // You can add this to your User interface later if needed

  // --- HANDLERS ---
  const handleLogout = () => {
    logout();
  };

  // Helper for link classNames
  const getLinkClassName = (href: string, isDesktop: boolean = true) => {
    // Use startsWith for dashboard/appointments/mods, but exact match for Home/About
    const isActive = (href === '/') ? pathname === href : pathname.startsWith(href);
    
    if (isDesktop) {
      return `group relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-md font-medium transition-all duration-300 ${
        isActive
          ? "text-white"
          : "text-gray-200 hover:text-white hover:bg-white/10"
      }`;
    } else {
      // Mobile class
      return `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
        isActive
          ? "bg-white text-blue-900 border border-purple-500/30"
          : "text-gray-300 hover:text-white hover:bg-white/10"
      }`;
    }
  };


  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-blue-900">
      <div className="flex h-20 items-center px-4 lg:px-6">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 mr-4 lg:mr-8 group"
        >
          <div className="relative">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-xl">
              <Car className="h-7 w-7 text-white" />
            </div>
          </div>
          <div className="hidden sm:block">
            <div className="flex items-baseline">
              <span className="text-xl font-bold text-white">AutoServe</span>
              <span className="text-xl font-bold text-orange-400"> 360</span>
            </div>
            <div className="text-[10px] text-gray-300 tracking-widest -mt-1">
              AUTOMOBILE MANAGEMENT
            </div>
          </div>
        </Link>

        {/* --- MODIFIED: Desktop Navigation Items --- */}
        <div className="hidden lg:flex items-center justify-center gap-1 flex-1">
          {isLoggedIn ? (
            <>
              {/* Order: Dashboard, Appointments, Modifications, About */}
              <Link href={getDashboardByRole(user.role)} className={getLinkClassName(getDashboardByRole(user.role), true)}>
                <span>Dashboard</span>
              </Link>
              <Link href="/customer/services" className={getLinkClassName("/customer/services", true)}>
                <span>Services</span>
              </Link>
              <Link href="/customer/modifications" className={getLinkClassName("/customer/modifications", true)}>
                <span>Modifications</span>
              </Link>
              <Link href="/customer/payments" className={getLinkClassName("/customer/payments", true)}>
                <span>Payments</span>
              </Link>
              <Link href="/about" className={getLinkClassName("/about", true)}>
                <span>About</span>
              </Link>
            </>
          ) : (
            // Logged-out users see public items
            publicNavItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={getLinkClassName(item.href, true)}
              >
                <span>{item.name}</span>
              </Link>
            ))
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden ml-auto mr-4 text-white hover:bg-white/10"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Right Section */}
        <div className="hidden lg:flex items-center gap-4">
          {/* Show a loader while checking session */}
          {isLoading ? (
            <div className="h-9 w-24 rounded-lg bg-white/10 animate-pulse"></div>
          ) : isLoggedIn ? (
            <>
              {/* ... (Notifications Dropdown - Unchanged) ... */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative text-white hover:bg-white/10">
                    <Bell className="h-5 w-5" />
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500"
                    >
                      3
                    </Badge>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 bg-slate-800 border-purple-500/30 text-white">
                    {/* ... (notification items) ... */}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-3 h-auto py-2 px-3 hover:bg-white/10 text-white"
                  >
                    <Avatar className="h-9 w-9 border-2 border-cyan-400">
                      <AvatarImage src={userAvatar} alt={displayName} />
                      <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-blue-500 text-white text-sm font-bold">
                        {displayInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">{displayName}</span>
                      <span className="text-xs text-gray-300">{displayRole}</span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-slate-800 border-purple-500/30 text-white">
                  <DropdownMenuLabel className="text-white">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{displayName}</p>
                      <p className="text-xs text-gray-400">{displayEmail}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem className="focus:bg-slate-700 focus:text-white">
                    <User className="mr-2 h-4 w-4" />
                    <Link href={`/${user.role.toLowerCase()}/profile`} className="w-full">
                      Profile Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="focus:bg-slate-700 focus:text-white">
                    <Car className="mr-2 h-4 w-4" />
                    <Link href="/customer/vehicles" className="w-full">
                      My Vehicles
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem
                    className="text-red-400 focus:bg-slate-700 focus:text-red-400 cursor-pointer"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              {/* Sign In / Sign Up Buttons */}
              <Link href="/login">
                <Button className="bg-white hover:bg-blue-500 hover:text-white text-blue-900 font-semibold shadow-lg transition-all duration-300">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-white hover:bg-blue-500 hover:text-white text-blue-900 font-semibold shadow-lg transition-all duration-300">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* --- MODIFIED: Mobile Navigation Menu --- */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-purple-500/30 bg-blue-900">
          <div className="px-4 py-2 space-y-1">
            {/* Use the correct array based on login state */}
            {(isLoggedIn ? loggedInMobileNavItems : publicNavItems).map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={getLinkClassName(item.href, false)}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              )
            )}

            {/* Mobile User Section */}
            {isLoading ? (
               <div className="pt-4 border-t border-purple-500/30 mt-4">
                 <div className="h-12 w-full rounded-lg bg-white/10 animate-pulse"></div>
               </div>
            ) : isLoggedIn ? (
              <div className="pt-4 border-t border-purple-500/30 mt-4">
                <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-lg border border-purple-500/30 mb-3">
                  <Avatar className="h-10 w-10 border-2 border-cyan-400">
                    <AvatarImage src={userAvatar} alt={displayName} />
                    <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-blue-500 text-white text-sm font-bold">
                      {displayInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-white">{displayName}</span>
                    <span className="text-xs text-gray-400">{displayEmail}</span>
                  </div>
                </div>
                <Link
                  href={`/${user.role.toLowerCase()}/profile`}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-white/10 rounded-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User className="h-4 w-4" />
                  Profile Settings
                </Link>
                <Link
                  href="/customer/vehicles"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-white/10 rounded-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Car className="h-4 w-4" />
                  My Vehicles
                </Link>
                <button
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-white/10 rounded-lg"
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </div>
            ) : (
              <div className="pt-4 border-t border-purple-500/30 mt-4 flex flex-col gap-2">
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full bg-white text-blue-900 hover:bg-blue-500 hover:text-white font-semibold shadow-lg">
                    Login
                  </Button>
                </Link>
                <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full bg-white text-blue-900 hover:bg-blue-500 hover:text-white font-semibold shadow-lg">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}