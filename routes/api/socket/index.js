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
    console.log('SockerID: ', socket.id);
    if (socket.user_id) console.log("User connected ", socket.user_id);
    if (socket.driver_id) console.log("Driver connected ", socket.driver_id);

    socket.on("driver-live-location", async (data) => {
      socket["body"] = data;
      await socketModule.addDriverLiveLocation(socket);
    });

    socket.on("find-nearest-driver", async (data) => {
      socket["body"] = data;
      await socketModule.findDriverLiveLocation(socket);
    });

    socket.on("nearest-ride-response-from-driver", async (data) => {
      socket["body"] = data;
      await socketModule.nearestDriverResponse(socket);
    })
  });
}

module.exports = { initSocket };
