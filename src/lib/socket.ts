import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = () => {
  if (!socket) {
    socket = io("https://socketserver-8s6v.onrender.com", {
      autoConnect: false,
      transports: ["websocket"],
      secure: true,
      reconnection: true,
      reconnectionAttempts: Infinity, // ✅ keep trying forever
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,    // ✅ max 5s between attempts
    });
  }
  return socket;
};

export const resetSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};