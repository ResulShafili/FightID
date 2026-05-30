import { io } from "socket.io-client";

const apiUrl = import.meta.env.VITE_API_URL || "https://fightid-production.up.railway.app/api";
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || apiUrl.replace(/\/api\/?$/, "");

export const createFightIdSocket = (userId) => {
  const socket = io(SOCKET_URL, {
    transports: ["websocket"],
  });

  socket.on("connect", () => {
    if (userId) socket.emit("fighter:join", userId);
  });

  return socket;
};
