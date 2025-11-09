// // "use client";
// // import { useEffect, useState, useRef } from "react";

// // export interface Notification {
// //   type: string;
// //   message: string;
// //   name?: string;
// //   email?: string;
// //   timestamp: string;
// // }

// // export function useAdminNotifications(p0: { adminId: string; }) {
// //   const [notifications, setNotifications] = useState<Notification[]>([]);
// //   const wsRef = useRef<WebSocket | null>(null);

// //   useEffect(() => {
// //     let socket: WebSocket;

// //     const connect = () => {
// //       socket = new WebSocket("ws://localhost:5000/ws/admin-notifications");
// //       wsRef.current = socket;

// //       socket.onopen = () => console.log("WebSocket connected");

// //       socket.onmessage = (event) => {
// //         try {
// //           const data: Notification = JSON.parse(event.data);
// //           setNotifications((prev) => [data, ...prev].slice(0, 50)); // keep last 50
// //         } catch (err) {
// //           console.error("Invalid WebSocket message:", event.data);
// //         }
// //       };

// //       socket.onclose = () => {
// //         console.log("WebSocket disconnected, retrying in 3s...");
// //         setTimeout(connect, 3000); // auto-reconnect
// //       };

// //       socket.onerror = (err) => {
// //         console.error("WebSocket error:", err);
// //         socket.close();
// //       };
// //     };

// //     connect();

// //     return () => {
// //       wsRef.current?.close();
// //     };
// //   }, []);

// //   const markAsRead = (index: number) => {
// //     setNotifications((prev) => prev.filter((_, i) => i !== index));
// //   };

// //   return { notifications, markAsRead };
// // }

// "use client";
// import { useEffect, useState, useRef } from "react";

// export interface Notification {
//   type: string;
//   message: string;
//   name?: string;
//   email?: string;
//   timestamp: string;
// }

// interface User {
//   userId: number;
//   firstName: string;
//   lastName: string;
//   email: string;
//   role: "customer" | "employee" | "admin";
//   status: "Active" | "Inactive";
// }

// interface UseAdminNotificationsProps {
//   adminId: string;
//   onUserUpdate?: (user: User) => void; // callback for user changes
// }

// export function useAdminNotifications({ adminId, onUserUpdate }: UseAdminNotificationsProps) {
//   const [notifications, setNotifications] = useState<Notification[]>([]);
//   const wsRef = useRef<WebSocket | null>(null);
//   const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);

//   useEffect(() => {
//     let isMounted = true;

//     const connect = () => {
//       if (!isMounted) return;

//       const url = `ws://localhost:5000/ws/admin-notifications?adminId=${adminId}`;
//       const socket = new WebSocket(url);
//       wsRef.current = socket;

//       socket.onopen = () => console.log("WebSocket connected");

//       socket.onmessage = (event) => {
//         try {
//           const parsed = JSON.parse(event.data);
//           const { type, message, timestamp, user } = parsed;

//           if (type && message && timestamp) {
//             // Add notification
//             setNotifications((prev) => [parsed, ...prev].slice(0, 50));

//             // Update user if applicable
//             if (user && onUserUpdate && ["USER_LOGIN", "USER_LOGOUT", "USER_STATUS_CHANGE"].includes(type)) {
//               onUserUpdate(user);
//             }
//           } else {
//             console.warn("Invalid notification format:", parsed);
//           }
//         } catch (err) {
//           console.error("Failed to parse WebSocket message:", event.data);
//         }
//       };

//       socket.onclose = () => {
//         if (!isMounted) return;
//         console.log("WebSocket disconnected, retrying in 3s...");
//         reconnectTimeout.current = setTimeout(connect, 3000);
//       };

//       socket.onerror = (err) => {
//         console.error("WebSocket error:", err);
//         socket.close();
//       };
//     };

//     connect();

//     return () => {
//       isMounted = false;
//       wsRef.current?.close();
//       if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
//     };
//   }, [adminId, onUserUpdate]);

//   const markAsRead = (index: number) => {
//     setNotifications((prev) => prev.filter((_, i) => i !== index));
//   };

//   return { notifications, markAsRead };
// }
