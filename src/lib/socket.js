import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export const createFightIdSocket = (userId) => {
  const socket = io(SOCKET_URL, {
    transports: ["websocket"],
  });

  socket.on("connect", () => {
    if (userId) socket.emit("fighter:join", userId);
  });

  return socket;
};
