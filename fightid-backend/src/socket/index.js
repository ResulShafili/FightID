let ioInstance;

export const initSocket = (io) => {
  ioInstance = io;

  io.on("connection", (socket) => {
    socket.on("fighter:join", (userId) => {
      if (userId) socket.join(`user:${userId}`);
    });

    socket.on("disconnect", () => {});
  });
};

export const emitToUser = (userId, event, payload) => {
  if (!ioInstance || !userId) return;
  ioInstance.to(`user:${userId}`).emit(event, payload);
};
