var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var nodemailer = require("nodemailer");
const http = require('http');
const { Server } = require("socket.io");

var indexRouter = require("./routes/index");
const { seedData } = require("./seed/seed");
const { addDriverLiveLocation } = require("./routes/api/socket/socket.module");
const { checkSocketAccessToken } = require("./routes/middleware");
var app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

io.use(async (socket, next) => {
  try {
    const authenticated = await checkSocketAccessToken(socket, next)
    if (authenticated) {
      return next();
    }
  } catch (error) {
    return next(new Error(error.message));
  }
});

io.on('connection', (socket) => {
  console.log('User connected', socket.driver_id);

  socket.on("driver-live-location", (data) => {
    console.log('driver-live-location', socket.driver_id)
    addDriverLiveLocation(data)
  });
});

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

const PORT = process.env.PORT || 4001
seedData().then(() => {
  server.listen(PORT);
  console.log("Server Running on", PORT);
})
module.exports = app;
