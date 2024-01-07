const { Server } = require("socket.io");
const { checkSocketAccessToken } = require("../../middleware");
const { addDriverLiveLocation } = require("./socket.module");

function initSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: "*"
        }
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

    io.on('connection', (socket) => {
        console.log('User connected', socket.driver_id);

        socket.on("driver-live-location", async (data) => {
            socket['body'] = data;
            console.log('driver-live-location', socket.driver_id);
            await addDriverLiveLocation(socket);
        });
    });
}

module.exports = { initSocket };
