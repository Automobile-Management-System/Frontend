"use client";
import { useEffect, useState, useRef } from "react";

export interface Notification {
  type: string;
  message: string;
  name?: string;
  email?: string;
  timestamp: string;
}

export function useAdminNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let socket: WebSocket;

    const connect = () => {
      socket = new WebSocket("ws://localhost:5000/ws/admin-notifications");
      wsRef.current = socket;

      socket.onopen = () => console.log("WebSocket connected");

      socket.onmessage = (event) => {
        try {
          const data: Notification = JSON.parse(event.data);
          setNotifications((prev) => [data, ...prev].slice(0, 50)); // keep last 50
        } catch (err) {
          console.error("Invalid WebSocket message:", event.data);
        }
      };

      socket.onclose = () => {
        console.log("WebSocket disconnected, retrying in 3s...");
        setTimeout(connect, 3000); // auto-reconnect
      };

      socket.onerror = (err) => {
        console.error("WebSocket error:", err);
        socket.close();
      };
    };

    connect();

    return () => {
      wsRef.current?.close();
    };
  }, []);

  const markAsRead = (index: number) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  };

  return { notifications, markAsRead };
}
