"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, LogOut, Menu, Car, Home, Info, Mail, LayoutDashboard, Wrench, Settings, CreditCard, User } from "lucide-react";
import { useState } from "react";
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

interface NavbarProps {
  isLoggedIn?: boolean;
  onLogout?: () => void;
}

export function Navbar({ isLoggedIn = false, onLogout }: NavbarProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Public navigation items (shown to all users)
  const publicNavItems = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  // Private navigation items (shown only when logged in)
  const privateNavItems = [
    { name: "Dashboard", href: "/customer/dashboard" },
    { name: "Services", href: "/customer/services" },
    { name: "Modifications", href: "/customer/modifications" },
    { name: "Payments", href: "/customer/payments" },
  ];

  // Combine navigation based on login status
  const navigationItems = isLoggedIn 
    ? [...publicNavItems, ...privateNavItems] 
    : publicNavItems;

  const user = {
    name: "John Doe",
    email: "john.doe@example.com",
    role: "Customer",
    avatar: "",
    initials: "JD",
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    console.log("Logging out...");
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
              <span className="text-xl font-bold text-pink-300"> 360</span>
            </div>
            <div className="text-[10px] text-gray-300 tracking-widest -mt-1">
              AUTOMOBILE MANAGEMENT
            </div>
          </div>
        </Link>

        {/* Desktop Navigation Items - Centered */}
        <div className="hidden lg:flex items-center justify-center gap-1 flex-1">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-md font-medium transition-all duration-300 ${
                  isActive
                    ? "text-white"
                    : "text-gray-200 hover:text-white hover:bg-white/10"
                }`}
              >
                <span>{item.name}</span>
              </Link>
            );
          })}
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
          {isLoggedIn ? (
            <>
              {/* Notifications */}
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
                  <DropdownMenuLabel className="text-white">Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem className="focus:bg-slate-700 focus:text-white">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium">Service Reminder</p>
                      <p className="text-xs text-gray-400">
                        Your vehicle service is due in 3 days
                      </p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="focus:bg-slate-700 focus:text-white">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium">Payment Confirmed</p>
                      <p className="text-xs text-gray-400">
                        Your payment of $250 has been processed
                      </p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="focus:bg-slate-700 focus:text-white">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium">Modification Complete</p>
                      <p className="text-xs text-gray-400">
                        Your vehicle modifications are ready for pickup
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
                    className="flex items-center gap-3 h-auto py-2 px-3 hover:bg-white/10 text-white"
                  >
                    <Avatar className="h-9 w-9 border-2 border-cyan-400">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-blue-500 text-white text-sm font-bold">
                        {user.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">{user.name}</span>
                      <span className="text-xs text-gray-300">{user.role}</span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-slate-800 border-purple-500/30 text-white">
                  <DropdownMenuLabel className="text-white">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem className="focus:bg-slate-700 focus:text-white">
                    <User className="mr-2 h-4 w-4" />
                    <Link href="/customer/profile" className="w-full">
                      Profile Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="focus:bg-slate-700 focus:text-white">
                    <Car className="mr-2 h-4 w-4" />
                    <Link href="/customer/vehicles" className="w-full">
                      My Vehicles
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="focus:bg-slate-700 focus:text-white">
                    <Settings className="mr-2 h-4 w-4" />
                    <Link href="/customer/settings" className="w-full">
                      Settings
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
      
      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-purple-500/30 bg-blue-900">
          <div className="px-4 py-2 space-y-1">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-white text-blue-900 border border-purple-500/30"
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              );
            })}
            
            {/* Mobile User Section */}
            {isLoggedIn ? (
              <div className="pt-4 border-t border-purple-500/30 mt-4">
                <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-lg border border-purple-500/30 mb-3">
                  <Avatar className="h-10 w-10 border-2 border-cyan-400">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-blue-500 text-white text-sm font-bold">
                      {user.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-white">{user.name}</span>
                    <span className="text-xs text-gray-400">{user.email}</span>
                  </div>
                </div>
                <Link
                  href="/customer/profile"
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
