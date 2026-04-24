import { io } from "socket.io-client";

/* Lazy singleton. getSocket() called from any component returns the same
   connection. Disconnects and rebuilds when the JWT changes (login/logout). */

let socket = null;
let lastToken = null;

function backendOrigin() {
  const base = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  // Strip trailing /api so socket.io handshake hits the root host.
  return base.replace(/\/api\/?$/, "");
}

export function getSocket() {
  const token = localStorage.getItem("token");

  if (!token) {
    if (socket) {
      socket.disconnect();
      socket = null;
      lastToken = null;
    }
    return null;
  }

  if (socket && token === lastToken) return socket;

  if (socket) socket.disconnect();

  socket = io(backendOrigin(), {
    auth: { token },
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
  });
  lastToken = token;
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
    lastToken = null;
  }
}
