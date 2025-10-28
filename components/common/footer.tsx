import Link from "next/link";
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Car } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-blue-900 text-gray-300 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500 rounded-full blur-3xl"></div>
      </div>

      <div className="relative container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4 group">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg">
                  <Car className="h-7 w-7 text-white" />
                </div>
              </div>
              <div>
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold text-white">AutoServe</span>
                  <span className="text-2xl font-bold text-pink-300"> 360</span>
                </div>
                <div className="text-[10px] text-gray-300 tracking-widest -mt-1">
                  AUTOMOBILE MANAGEMENT
                </div>
              </div>
            </Link>
            <p className="text-gray-300 mb-4 max-w-md leading-relaxed">
              Your complete automobile management solution. From service tracking to payment management, 
              we've got you covered with cutting-edge technology and unparalleled service.
            </p>
            
            {/* Social Media Links */}
            <div className="flex gap-4 mt-4">
              <Link 
                href="#" 
                className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center hover:scale-110 transition-transform"
              >
                <Facebook className="h-5 w-5 text-white" />
              </Link>
              <Link 
                href="#" 
                className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center hover:scale-110 transition-transform"
              >
                <Twitter className="h-5 w-5 text-white" />
              </Link>
              <Link 
                href="#" 
                className="w-10 h-10 bg-gradient-to-br from-pink-600 to-red-600 rounded-lg flex items-center justify-center hover:scale-110 transition-transform"
              >
                <Instagram className="h-5 w-5 text-white" />
              </Link>
              <Link 
                href="#" 
                className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center hover:scale-110 transition-transform"
              >
                <Linkedin className="h-5 w-5 text-white" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-4 text-lg flex items-center">
              <div className="w-1 h-6 mr-2 rounded-full"></div>
              Quick Links
            </h3>
            <div className="space-y-3">
              <Link 
                href="/" 
              >
                Home
              </Link>
              <Link 
                href="/about" 
                className="flex items-center text-sm text-gray-300 hover:text-cyan-400 transition-colors group"
              >
                <span className="w-0 group-hover:w-2 h-0.5 bg-cyan-400 mr-0 group-hover:mr-2 transition-all duration-300 rounded-full"></span>
                About Us
              </Link>
              <Link 
                href="/customer/dashboard" 
                className="flex items-center text-sm text-gray-300 hover:text-cyan-400 transition-colors group"
              >
                <span className="w-0 group-hover:w-2 h-0.5 bg-cyan-400 mr-0 group-hover:mr-2 transition-all duration-300 rounded-full"></span>
                Dashboard
              </Link>
              <Link 
                href="/customer/services" 
                className="flex items-center text-sm text-gray-300 hover:text-cyan-400 transition-colors group"
              >
                <span className="w-0 group-hover:w-2 h-0.5 bg-cyan-400 mr-0 group-hover:mr-2 transition-all duration-300 rounded-full"></span>
                Services
              </Link>
              <Link 
                href="/privacy" 
                className="flex items-center text-sm text-gray-300 hover:text-cyan-400 transition-colors group"
              >
                <span className="w-0 group-hover:w-2 h-0.5 bg-cyan-400 mr-0 group-hover:mr-2 transition-all duration-300 rounded-full"></span>
                Privacy Policy
              </Link>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-white font-bold mb-4 text-lg flex items-center">
              <div className="w-1 h-6 bg-gradient-to-b from-purple-400 to-pink-500 mr-2 rounded-full"></div>
              Contact Us
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2 text-gray-400 group">
                <Phone className="h-4 w-4 text-cyan-400 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="text-sm">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-start gap-2 text-gray-400 group">
                <Mail className="h-4 w-4 text-cyan-400 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="text-sm">info@autoserve360.com</span>
              </div>
              <div className="flex items-start gap-2 text-gray-400 group">
                <MapPin className="h-4 w-4 text-cyan-400 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="text-sm">123 Auto Street<br/>City, State 12345</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-purple-500/30 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © 2024 AutoServe 360. All rights reserved.
            </p>
            
            <div className="flex space-x-6 text-sm">
              <Link href="/privacy" className="text-gray-400 hover:text-cyan-400 transition-colors">
                Privacy Policy
              </Link>
              <span className="text-gray-600">|</span>
              <Link href="/terms" className="text-gray-400 hover:text-cyan-400 transition-colors">
                Terms of Service
              </Link>
              <span className="text-gray-600">|</span>
              <Link href="/cookies" className="text-gray-400 hover:text-cyan-400 transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}