// 'use client';

// import { useEffect, useState } from 'react';
// import {
//   Home,
//   Settings,
//   LogOut,
//   Menu,
//   X,
//   ServerIcon,
//   ChartBar,
// } from 'lucide-react';
// import { useRouter, usePathname } from 'next/navigation';

// interface SidebarProps {
//   isOpen: boolean;
//   onToggle: () => void;
// }

// export default function AdminSidebar({ isOpen, onToggle }: SidebarProps) {
//   const router = useRouter();
//   const pathname = usePathname();

//   // ✅ Ensure client-only hydration-safe render
//   const [mounted, setMounted] = useState(false);
//   useEffect(() => setMounted(true), []);
//   if (!mounted) {
//     // Prevent SSR mismatch by not rendering until client-side mount
//     return null;
//   }

//   const menuItems = [
//     { icon: Home, label: 'Dashboard', path: '/admin/dashboard', badge: null },
//     { icon: ChartBar, label: 'Analytics', path: '/admin/analytics', badge: null },
//     { icon: ServerIcon, label: 'Service Management', path: '/admin/service_management', badge: null },
//   ];

//   const handleNavigation = (path: string) => {
//     router.push(path);
//   };

//   const handleLogout = () => {
//     sessionStorage.removeItem('userEmail');
//     sessionStorage.removeItem('isAuthenticated');
//     router.push('/login');
//   };

//   const isActive = (path: string) =>
//     pathname === path || pathname.startsWith(path + '/');

//   return (
//     <aside
//       className={`${
//         isOpen ? 'w-64' : 'w-20'
//       } bg-blue-900 text-white transition-all duration-300 flex flex-col`}
//     >
//       {/* Logo with Toggle */}
//       <div className="p-4 flex items-center justify-between border-b border-blue-800">
//         {isOpen ? (
//           <>
//             <div className="flex items-center">
//               <div className="ml-3">
//                 <h1 className="text-lg font-bold">AutoServe</h1>
//               </div>
//             </div>
//             <button
//               onClick={onToggle}
//               className="p-1.5 hover:bg-blue-800 rounded-lg transition"
//             >
//               <X className="w-5 h-5" />
//             </button>
//           </>
//         ) : (
//           <div className="flex flex-col items-center space-y-2">
//             <div className="w-10 h-10 bg-gradient-to-br bg-white rounded-lg flex items-center justify-center">
//               <span className="text-xl text-blue-900 font-bold">A</span>
//             </div>
//             <button
//               onClick={onToggle}
//               className="p-1.5 hover:bg-blue-800 rounded-lg transition"
//             >
//               <Menu className="w-5 h-5" />
//             </button>
//           </div>
//         )}
//       </div>

//       {/* ✅ Always render <nav> to keep HTML consistent */}
//       <nav className="flex-1 py-4 overflow-y-auto border-t border-blue-800">
//         {menuItems.map((item) => (
//           <button
//             key={item.label}
//             onClick={() => handleNavigation(item.path)}
//             className={`w-full flex items-center ${
//               isOpen ? 'px-4' : 'px-6'
//             } py-3 hover:bg-blue-800 transition ${
//               isActive(item.path)
//                 ? 'bg-blue-950 border-l-4 border-white'
//                 : ''
//             }`}
//           >
//             <item.icon className="w-5 h-5 flex-shrink-0" />
//             {isOpen && (
//               <>
//                 <span className="ml-3 flex-1 text-left">{item.label}</span>
//                 {item.badge && (
//                   <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
//                     {item.badge}
//                   </span>
//                 )}
//               </>
//             )}
//           </button>
//         ))}
//       </nav>

//       {/* Bottom Menu (consistent structure too) */}
//       <div className="border-t border-blue-800">
//         <button
//           onClick={() => handleNavigation('/settings')}
//           className={`w-full flex items-center ${
//             isOpen ? 'px-4' : 'px-6'
//           } py-3 hover:bg-blue-800 transition`}
//         >
//           <Settings className="w-5 h-5 flex-shrink-0" />
//           {isOpen && <span className="ml-3">Settings</span>}
//         </button>
//         <button
//           onClick={handleLogout}
//           className={`w-full flex items-center ${
//             isOpen ? 'px-4' : 'px-6'
//           } py-3 hover:bg-blue-800 transition text-white`}
//         >
//           <LogOut className="w-5 h-5 flex-shrink-0" />
//           {isOpen && <span className="ml-3">Logout</span>}
//         </button>
//       </div>
//     </aside>
//   );
// }

'use client';

import { useEffect, useState } from 'react';
import {
  Home,
  Settings,
  LogOut,
  Menu,
  X,
  ChartBar,
  Wrench,
  User2,
  FileInput,
  CalendarDays,
  UserCircle,
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../src/app/context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function AdminSidebar({ isOpen, onToggle }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();

  // ✅ Ensure client-only hydration-safe render
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    // Prevent SSR mismatch by not rendering until client-side mount
    return null;
  }

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/admin/dashboard', badge: null },
    { icon: UserCircle, label: 'Profile', path: '/admin/profile', badge: null },
     { icon: User2, label: 'User Management', path: '/admin/user_management', badge: null },
     { icon: Wrench, label: 'Service Management', path: '/admin/service_management', badge: null },
          { icon: CalendarDays, label: 'Appointments', path: '/admin/appointment_Management', badge: null },
      { icon: FileInput, label: 'Modification Requests', path: '/admin/modification_requests', badge: null },

    { icon: ChartBar, label: 'Analytics', path: '/admin/analytics', badge: null },

  ];

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const handleLogout = () => {
    logout();
  };

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + '/');

  return (
    <aside
      className={`${isOpen ? 'w-64' : 'w-20'
        } bg-blue-900 text-white transition-all duration-300 flex flex-col`}
    >
      {/* Logo with Toggle */}
      <div className="p-4 flex items-center justify-between border-b border-blue-800">
        {isOpen ? (
          <>
            <div className="flex items-center">
              <div className="ml-3">
                <h1 className="text-lg font-bold">AutoServe</h1>
              </div>
            </div>
            <button
              onClick={onToggle}
              className="p-1.5 hover:bg-blue-800 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <div className="w-10 h-10 bg-gradient-to-br bg-white rounded-lg flex items-center justify-center">
              <span className="text-xl text-blue-900 font-bold">A</span>
            </div>
            <button
              onClick={onToggle}
              className="p-1.5 hover:bg-blue-800 rounded-lg transition"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* ✅ Always render <nav> to keep HTML consistent */}
      <nav className="flex-1 py-4 overflow-y-auto border-t border-blue-800">
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={() => handleNavigation(item.path)}
            className={`w-full flex items-center ${isOpen ? 'px-4' : 'px-6'
              } py-3 hover:bg-blue-800 transition ${isActive(item.path)
                ? 'bg-blue-950 border-l-4 border-white'
                : ''
              }`}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {isOpen && (
              <>
                <span className="ml-3 flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </button>
        ))}
      </nav>

      {/* Bottom Menu (consistent structure too) */}
      <div className="border-t border-blue-800">
        <button
          onClick={() => handleNavigation('/settings')}
          className={`w-full flex items-center ${isOpen ? 'px-4' : 'px-6'
            } py-3 hover:bg-blue-800 transition`}
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {isOpen && <span className="ml-3">Settings</span>}
        </button>
        <button
          onClick={handleLogout}
          className={`w-full flex items-center ${isOpen ? 'px-4' : 'px-6'
            } py-3 hover:bg-blue-800 transition text-white`}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {isOpen && <span className="ml-3">Logout</span>}
        </button>
      </div>
    </aside>
  );
}

