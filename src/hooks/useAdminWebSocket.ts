// 'use client';

// import { useEffect, useState, useRef } from 'react';
// import { toast } from 'sonner';

// const WS_URL = 'ws://localhost:5000/ws/admin-notifications';

// interface WebSocketMessage {
//   type: string;
//   message?: string;
//   [key: string]: any;
// }

// interface UseAdminWebSocketProps {
//   adminId: string;
//   onMessage?: (data: WebSocketMessage) => void;
// }

// export function useAdminWebSocket({ adminId, onMessage }: UseAdminWebSocketProps) {
//   const [socketConnected, setSocketConnected] = useState(false);
//   const socketRef = useRef<WebSocket | null>(null);

//   useEffect(() => {
//     if (typeof window === 'undefined') return; // ✅ Client-only

//     const connectSocket = () => {
//       console.log('🔌 Connecting to WebSocket...');
//       try {
//         socketRef.current = new WebSocket(`${WS_URL}?adminId=${adminId}`);

//         socketRef.current.onopen = () => {
//           console.log('✅ WebSocket connected');
//           setSocketConnected(true);
//         };

//         socketRef.current.onmessage = (event) => {
//           try {
//             const data: WebSocketMessage = JSON.parse(event.data);
//             console.log('📩 WebSocket message:', data);

//             if (data.type === 'NEW_APPOINTMENT') {
//               toast.success(`📅 ${data.message || 'New appointment received'}`);
//             }

//             if (onMessage) onMessage(data);
//           } catch (err) {
//             console.error('WebSocket parse error:', err);
//           }
//         };

//         socketRef.current.onclose = () => {
//           console.log('🔌 WebSocket disconnected. Reconnecting in 3s...');
//           setSocketConnected(false);
//           setTimeout(connectSocket, 3000);
//         };

//         socketRef.current.onerror = (err) => {
//           console.error('❌ WebSocket error:', err);
//           socketRef.current?.close();
//         };
//       } catch (err) {
//         console.error('❌ WebSocket creation error:', err);
//       }
//     };

//     connectSocket();

//     return () => {
//       console.log('🔒 Closing WebSocket');
//       socketRef.current?.close();
//     };
//   }, [adminId, onMessage]);

//   return { socketConnected };
// }


//wed krn eka


// 'use client';

// import { useEffect, useState, useRef } from 'react';
// import { toast } from 'sonner';

// const WS_URL = 'ws://localhost:5000/ws/admin-notifications';

// interface WebSocketMessage {
//   type: string;
//   message?: string;
//   [key: string]: any;
// }

// interface UseAdminWebSocketProps {
//   adminId: string;
//   onMessage?: (data: WebSocketMessage) => void;
// }

// export function useAdminWebSocket({ adminId, onMessage }: UseAdminWebSocketProps) {
//   const [socketConnected, setSocketConnected] = useState(false);
//   const socketRef = useRef<WebSocket | null>(null);

//   useEffect(() => {
//     if (typeof window === 'undefined') return;

//     const connectSocket = () => {
//       console.log('🔌 Connecting to WebSocket...');
//       try {
//         socketRef.current = new WebSocket(`${WS_URL}?adminId=${adminId}`);

//         socketRef.current.onopen = () => {
//           console.log('✅ WebSocket connected');
//           setSocketConnected(true);
//         };

//         socketRef.current.onmessage = (event) => {
//           try {
//             const data: WebSocketMessage = JSON.parse(event.data);
//             console.log('📩 WebSocket message:', data);

//             // Show toast for NEW_APPOINTMENT only
//             if (data.type === 'NEW_APPOINTMENT') {
//               toast.success(`📅 ${data.message || 'New appointment received'}`);
//             }

//             // Always notify parent dashboard
//             onMessage?.(data);
//           } catch (err) {
//             console.error('WebSocket parse error:', err);
//           }
//         };

//         socketRef.current.onclose = () => {
//           console.log('🔌 WebSocket disconnected. Reconnecting in 3s...');
//           setSocketConnected(false);
//           setTimeout(connectSocket, 3000);
//         };

//         socketRef.current.onerror = (err) => {
//           console.error('❌ WebSocket error:', err);
//           socketRef.current?.close();
//         };
//       } catch (err) {
//         console.error('❌ WebSocket creation error:', err);
//       }
//     };

//     connectSocket();

//     return () => {
//       console.log('🔒 Closing WebSocket');
//       socketRef.current?.close();
//     };
//   }, [adminId, onMessage]);

//   return { socketConnected };
// }


//after add user manage
'use client';

import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';

const WS_URL = 'ws://localhost:5000/ws/admin-notifications';

interface WebSocketMessage {
  type: string;
  message?: string;
  [key: string]: any;
}

interface UseAdminWebSocketProps {
  adminId: string;
  onMessage?: (data: WebSocketMessage) => void;
}

export function useAdminWebSocket({ adminId, onMessage }: UseAdminWebSocketProps) {
  const [socketConnected, setSocketConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const connectSocket = () => {
      console.log('🔌 Connecting to WebSocket...');
      try {
        socketRef.current = new WebSocket(`${WS_URL}?adminId=${adminId}`);

        socketRef.current.onopen = () => {
          console.log('✅ WebSocket connected');
          setSocketConnected(true);
        };

        socketRef.current.onmessage = (event) => {
          try {
            const data: WebSocketMessage = JSON.parse(event.data);
            console.log('📩 WebSocket message:', data);

            // === Existing functionality ===
            if (data.type === 'NEW_APPOINTMENT') {
              toast.success(`📅 ${data.message || 'New appointment received'}`);
            }

            // === New: User management related notifications ===
            switch (data.type) {
              case 'USER_ADDED':
                toast.success(`👤 ${data.name || 'New user'} added`);
                break;

              case 'USER_UPDATED':
                toast.info(`✏️ ${data.name || 'A user'} updated`);
                break;

              case 'USER_ACTIVATED':
                toast.success(`✅ ${data.name || 'A user'} activated`);
                break;

              case 'USER_DEACTIVATED':
                toast.warning(`🚫 ${data.name || 'A user'} deactivated`);
                break;

              case 'USER_LOGIN':
                toast.info(`🔓 ${data.name || 'A user'} just logged in`);
                break;

              default:
                // keep quiet for unhandled types
                break;
            }

            // Always notify parent dashboard
            onMessage?.(data);
          } catch (err) {
            console.error('WebSocket parse error:', err);
          }
        };

        socketRef.current.onclose = () => {
          console.log('🔌 WebSocket disconnected. Reconnecting in 3s...');
          setSocketConnected(false);
          setTimeout(connectSocket, 3000);
        };

        socketRef.current.onerror = (err) => {
          console.error('❌ WebSocket error:', err);
          socketRef.current?.close();
        };
      } catch (err) {
        console.error('❌ WebSocket creation error:', err);
      }
    };

    connectSocket();

    return () => {
      console.log('🔒 Closing WebSocket');
      socketRef.current?.close();
    };
  }, [adminId, onMessage]);

  return { socketConnected };
}
