const { Server } = require("socket.io");
const { checkSocketAccessToken } = require("../../middleware");
const socketModule = require("./socket.module");

function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.use(async (socket, next) => {
    try {
      const authenticated = await checkSocketAccessToken(socket, next);
      if (authenticated) {
        return next();
      }
    } catch (error) {
      return next(new Error(error.message));
    }
  });

  io.on("connection", (socket) => {
    console.log("User connected", socket.driver_id);

    socket.on("driver-live-location", async (data) => {
      socket["body"] = data;
      await socketModule.addDriverLiveLocation(socket);
    });
  });
}

module.exports = { initSocket };
