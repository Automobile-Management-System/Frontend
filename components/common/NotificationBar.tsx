// // src/components/admin/NotificationBar.tsx
// 'use client';

// import React, { useEffect, useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { Bell, X, Trash2, Users } from 'lucide-react';
// import { toast } from 'sonner';
// import { getSignalRConnection } from '@/lib/signalr';

// interface RecentUserDto {
//   userId: number;
//   fullName: string;
//   email: string;
//   role: string;
// }

// interface Notification {
//   id: string;
//   userId: number;
//   fullName: string;
//   email: string;
//   role: string;
//   timestamp: string;
// }

// const STORAGE_KEY = 'admin-notifications';

// const getRoleColor = (role: string) => {
//   switch (role.toLowerCase()) {
//     case 'admin':    return 'bg-red-100 text-red-700';
//     case 'employee': return 'bg-blue-100 text-blue-700';
//     case 'customer': return 'bg-green-100 text-green-700';
//     default:         return 'bg-gray-100 text-gray-700';
//   }
// };

// export default function NotificationBar() {
//   const [notifications, setNotifications] = useState<Notification[]>([]);
//   const [showBar, setShowBar] = useState(false);

//   // Load from storage
//   useEffect(() => {
//     const saved = localStorage.getItem(STORAGE_KEY);
//     if (saved) {
//       try { setNotifications(JSON.parse(saved)); } catch {}
//     }
//   }, []);

//   // Save to storage
//   useEffect(() => {
//     localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
//   }, [notifications]);

//   // Single listener
//   useEffect(() => {
//     const conn = getSignalRConnection();

//     const handler = (user: RecentUserDto) => {
//       const notif: Notification = {
//         id: `${user.userId}-${Date.now()}`, // Unique ID
//         userId: user.userId,
//         fullName: user.fullName,
//         email: user.email,
//         role: user.role,
//         timestamp: new Date().toISOString(),
//       };

//       toast.success(
//         <div className="flex items-center gap-3">
//           <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center">
//             <Users className="h-5 w-5 text-blue-600" />
//           </div>
//           <div>
//             <p className="font-medium">{user.fullName}</p>
//             <p className="text-xs text-gray-600">New {user.role.toLowerCase()} registered</p>
//           </div>
//         </div>,
//         { duration: 4000 }
//       );

//       setNotifications(prev => [notif, ...prev].slice(0, 50));
//     };

//     conn.on('NewUserRegistered', handler);

//     return () => {
//       conn.off('NewUserRegistered', handler);
//     };
//   }, []);

//   const clearAll = () => {
//     setNotifications([]);
//     toast.success('Cleared');
//   };

//   const remove = (id: string) => {
//     setNotifications(prev => prev.filter(n => n.id !== id));
//   };

//   return (
//     <>
//       <Button variant="ghost" size="icon" className="relative" onClick={() => setShowBar(true)}>
//         <Bell className="h-5 w-5" />
//         {notifications.length > 0 && (
//           <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse" />
//         )}
//       </Button>

//       <div className={`fixed inset-y-0 right-0 w-80 bg-white shadow-2xl transition-transform z-50 ${showBar ? 'translate-x-0' : 'translate-x-full'}`}>
//         <div className="flex items-center justify-between p-4 border-b">
//           <h3 className="font-bold flex items-center gap-2">
//             <Bell className="h-5 w-5" />
//             Notifications ({notifications.length})
//           </h3>
//           <div className="flex gap-2">
//             {notifications.length > 0 && (
//               <Button size="sm" variant="ghost" onClick={clearAll}>
//                 <Trash2 className="h-4 w-4" />
//               </Button>
//             )}
//             <Button size="sm" variant="ghost" onClick={() => setShowBar(false)}>
//               <X className="h-4 w-4" />
//             </Button>
//           </div>
//         </div>

//         <div className="overflow-y-auto h-full pb-20">
//           {notifications.length === 0 ? (
//             <p className="p-8 text-center text-gray-500">No notifications</p>
//           ) : (
//             notifications.map(n => (
//               <div key={n.id} className="p-4 border-b hover:bg-gray-50 flex justify-between items-start">
//                 <div className="flex-1">
//                   <p className="font-medium text-sm">{n.fullName}</p>
//                   <p className="text-xs text-gray-600">{n.email}</p>
//                   <p className="text-xs text-gray-500 mt-1">
//                     {new Date(n.timestamp).toLocaleTimeString()}
//                   </p>
//                   <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${getRoleColor(n.role)}`}>
//                     {n.role}
//                   </span>
//                 </div>
//                 <Button size="sm" variant="ghost" onClick={() => remove(n.id)} className="h-6 w-6 p-0">
//                   <X className="h-3 w-3" />
//                 </Button>
//               </div>
//             ))
//           )}
//         </div>
//       </div>
//     </>
//   );
// }

// src/components/admin/NotificationBar.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, X, Trash2, Users, FileText, Calendar, Car } from 'lucide-react';
import { toast } from 'sonner';
import { getSignalRConnection } from '@/lib/signalr';
import { Badge } from '@/components/ui/badge';

interface RecentUserDto {
  userId: number;
  fullName: string;
  email: string;
  role: string;
}

interface ModificationRequestDto {
  modificationId: number;
  modificationName: string;
  description: string;
  userName: string;
  vehicleNumber: string;
  status: string;
  dateTime: string;
  amount: number;
  assignee: string;
  appointmentId: number;
}

type NotificationType = 'user' | 'modification';

interface BaseNotification {
  id: string;
  type: NotificationType;
  timestamp: string;
}

interface UserNotification extends BaseNotification {
  type: 'user';
  userId: number;
  fullName: string;
  email: string;
  role: string;
}

interface ModificationNotification extends BaseNotification {
  type: 'modification';
  modificationId: number;
  modificationName: string;
  description: string;
  userName: string;
  vehicleNumber: string;
  status: string;
  dateTime: string;
  amount: number;
}

type Notification = UserNotification | ModificationNotification;

const STORAGE_KEY = 'admin-notifications';

const getRoleColor = (role: string) => {
  switch (role.toLowerCase()) {
    case 'admin':    return 'bg-red-100 text-red-700';
    case 'employee': return 'bg-blue-100 text-blue-700';
    case 'customer': return 'bg-green-100 text-green-700';
    default:         return 'bg-gray-100 text-gray-700';
  }
};

export default function NotificationBar() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showBar, setShowBar] = useState(false);

  // Load from storage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { setNotifications(JSON.parse(saved)); } catch {}
    }
  }, []);

  // Save to storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  }, [notifications]);

  // SignalR listeners
  useEffect(() => {
    const conn = getSignalRConnection();

    // User registration handler
    const userHandler = (user: RecentUserDto) => {
      const notif: UserNotification = {
        id: `user-${user.userId}-${Date.now()}`,
        type: 'user',
        userId: user.userId,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        timestamp: new Date().toISOString(),
      };

      toast.success(
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="font-medium">{user.fullName}</p>
            <p className="text-xs text-gray-600">New {user.role.toLowerCase()} registered</p>
          </div>
        </div>,
        { duration: 4000 }
      );

      setNotifications(prev => [notif, ...prev].slice(0, 50));
    };

    // Modification request handler
    const modificationHandler = (request: ModificationRequestDto) => {
      const notif: ModificationNotification = {
        id: `mod-${request.modificationId}-${Date.now()}`,
        type: 'modification',
        modificationId: request.modificationId,
        modificationName: request.modificationName,
        description: request.description,
        userName: request.userName,
        vehicleNumber: request.vehicleNumber,
        status: request.status,
        dateTime: request.dateTime,
        amount: request.amount,
        timestamp: new Date().toISOString(),
      };

      toast.success(
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center">
            <FileText className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="font-medium">{request.modificationName}</p>
            <p className="text-xs text-gray-600">From {request.userName}</p>
          </div>
        </div>,
        { duration: 5000 }
      );

      setNotifications(prev => [notif, ...prev].slice(0, 50));
    };

    conn.on('NewUserRegistered', userHandler);
    conn.on('NewModificationRequest', modificationHandler);

    return () => {
      conn.off('NewUserRegistered', userHandler);
      conn.off('NewModificationRequest', modificationHandler);
    };
  }, []);

  const clearAll = () => {
    setNotifications([]);
    toast.success('All notifications cleared');
  };

  const remove = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const unreadCount = notifications.length;

  return (
    <>
      <Button 
        variant="ghost" 
        size="icon" 
        className="relative" 
        onClick={() => setShowBar(true)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {/* Overlay */}
      {showBar && (
        <div 
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setShowBar(false)}
        />
      )}

      {/* Notification Panel */}
      <div 
        className={`fixed inset-y-0 right-0 w-96 bg-white shadow-2xl transition-transform z-50 flex flex-col ${
          showBar ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-[#0B2E66] text-white">
          <h3 className="font-bold flex items-center gap-2 text-lg">
            <Bell className="h-5 w-5" />
            Notifications
            {unreadCount > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-white text-[#0B2E66] text-xs rounded-full font-semibold">
                {unreadCount}
              </span>
            )}
          </h3>
          <div className="flex gap-2">
            {notifications.length > 0 && (
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={clearAll}
                className="text-white hover:bg-white/20"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => setShowBar(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto flex-1">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Bell className="h-16 w-16 mb-4 opacity-20" />
              <p className="text-center">No new notifications</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map(n => (
                <div key={n.id}>
                  {n.type === 'user' ? (
                    <UserNotificationItem notification={n} onRemove={remove} />
                  ) : (
                    <ModificationNotificationItem notification={n} onRemove={remove} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// User Notification Component
function UserNotificationItem({ 
  notification, 
  onRemove 
}: { 
  notification: UserNotification; 
  onRemove: (id: string) => void;
}) {
  return (
    <div className="p-4 hover:bg-gray-50 flex gap-3 group">
      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
        <Users className="h-5 w-5 text-blue-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="font-semibold text-sm text-gray-900">{notification.fullName}</p>
            <p className="text-xs text-gray-600 truncate">{notification.email}</p>
          </div>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => onRemove(notification.id)} 
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Badge className={`text-xs ${getRoleColor(notification.role)}`}>
            {notification.role}
          </Badge>
          <span className="text-xs text-gray-500">
            {formatTimestamp(notification.timestamp)}
          </span>
        </div>
      </div>
    </div>
  );
}

// Modification Notification Component
function ModificationNotificationItem({ 
  notification, 
  onRemove 
}: { 
  notification: ModificationNotification; 
  onRemove: (id: string) => void;
}) {
  return (
    <div className="p-4 hover:bg-gray-50 flex gap-3 group">
      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
        <FileText className="h-5 w-5 text-green-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="font-semibold text-sm text-gray-900">{notification.modificationName}</p>
            <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">{notification.description}</p>
          </div>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => onRemove(notification.id)} 
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
        <div className="mt-2 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <Users className="h-3 w-3" />
            <span>{notification.userName}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <Car className="h-3 w-3" />
            <span>{notification.vehicleNumber}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <Calendar className="h-3 w-3" />
            <span>{new Date(notification.dateTime).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <Badge className="bg-yellow-100 text-yellow-800 text-xs">
            {notification.status}
          </Badge>
          <span className="text-xs text-gray-500">
            {formatTimestamp(notification.timestamp)}
          </span>
        </div>
      </div>
    </div>
  );
}

// Helper function to format timestamps
function formatTimestamp(timestamp: string): string {
  const now = new Date();
  const time = new Date(timestamp);
  const diffMs = now.getTime() - time.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return time.toLocaleDateString();
}