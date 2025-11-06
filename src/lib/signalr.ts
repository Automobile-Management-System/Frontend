// src/lib/signalr.ts
import * as signalR from '@microsoft/signalr';

let connection: signalR.HubConnection | null = null;

export const getSignalRConnection = (): signalR.HubConnection => {
  if (!connection) {
    connection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5001/hubs/admin-notify', {
        withCredentials: true,
      })
      .withAutomaticReconnect()
      .build();

    connection.start().catch(err => console.error('SignalR failed:', err));
  }
  return connection;
};

export const stopSignalR = () => {
  connection?.stop();
  connection = null;
};

