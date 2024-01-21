const rideFare = require("../../../helpers/rideFare");
const libFunction = require("../../../helpers/libFunction");
const { getUserDetailbyUserId } = require("../users/users.db");
const socketDb = require("./socket.db");
const rideModule = require("../ride/ride.module");

const { NEAREST_DRIVER_RADIUS_IN_KM } = process.env;
const addDriverLiveLocation = async (req) => {
  try {
    req.body["driver_id"] = req.driver_id;
    req.body["timestamp"] = await libFunction.formatDateTimeLib(new Date());
    req.body["socket_id"] = req.id;
    await rideFare.updateDriverLiveLocation(req.body);
  } catch (error) {
    console.log("Error in addDriverLiveLocation:", error);
  }
};

const findDriverLiveLocation = async (req) => {
  try {
    console.log("req.body", req.body);
    console.log("socket.user_id", req.user_id);
    const { ride_point } = req.body;
    
    const rideStartPoint = ride_point.filter(x => x.flag_start_point == true)

    if(rideStartPoint.length == 0){
      // SEND ERROR MESSAGE
      return ''
    }

    const drivers = await rideFare.getNearestDriver(
      rideStartPoint[0].latitude,
      rideStartPoint[0].longitude,
      NEAREST_DRIVER_RADIUS_IN_KM
    );
    var userLiveLocationObj = {
      "ride_point_name": rideStartPoint.ride_point_name,
      "latitude": rideStartPoint.latitude,
      "longitude": rideStartPoint.longitude,
      "timestamp": await libFunction.formatDateTimeLib(new Date()),
      "socket_id": req.socket_id,
      "user_id": req.user_id,
    };

    await rideFare.updateUserLiveLocation(userLiveLocationObj);
    // send empty array to user that not drivers availables in pickup area locations
    if (drivers.data.length == 0) {
      req.to(req.id).emit("nearest-driver-found", drivers.data);
      return "";
    }

    // get rider details
    const rider = await getUserDetailbyUserId(req.user_id);
    console.log("rider", rider);

    // send list of nearest rides to drives
    drivers.data.forEach((element) => {
      console.log("element", element);
      const data = {
        ...req.body,
        rider_name: rider.data[0].user_name,
        rider_gender: rider.data[0].gender,
        rider_image: rider.data[0].storage_id,
      };
      req.to(element.socket_id).emit("get-nearest-rides", data);
    });
  } catch (error) {
    console.log("Error in addDriverLiveLocation:", error);
  }
};

const nearestDriverResponse = async (req) => {
  try {
    console.log("nearestDriverResponse", req.body);
    var driverId = req.driver_id;
    var flagRideOn = req.body.flag_ride_on;
    var rideId = req.body.ride_id;
    if (
      driverId == undefined ||
      driverId == null ||
      driverId == "" ||
      rideId == undefined ||
      rideId == null ||
      rideId == ""
    ) {
      return "";
    }

    if (flagRideOn == true) {
      await rideFare.updateDriverRideFlag(driverId, flagRideOn);

      const changeLogId = await libFunction.changeLogDetailsLib({
        ipAddress: req.ip,
        userId: driverId,
      });

      await libFunction.InsertQuery("ride", "ride_id", rideId);

      var updateRideObj = [
        { field: "driver_id", value: driverId },
        { field: "ride_id", value: rideId },
        { field: "change_log_id", value: changeLogId },
        { field: "flag_change_by", value: true },
        { field: "flag_ride_accept_driver", value: true },
      ];
      var updateRideWherCon = `ride_id = ${rideId} and history_id is null and flag_deleted = false `;
      var updateRide = await socketDb.updateRideDetail(
        updateRideObj,
        updateRideWherCon
      );

      if (updateRide.status == false) {
        await rideFare.updateDriverRideFlag(driverId, false);
        return "";
      }

      var rideDetailObj = {
        query: {
          ride_id: req.rideId,
        },
      };
      var rideDetail = await rideModule.getRideModule(rideDetailObj);

      if(rideDetail.status == false){
        await rideFare.updateDriverRideFlag(driverId, false);
        return ''
      }

      var userId = rideDetail.data[0].user_id
      var riderDetail = await rideFare.getRiderLiveLocation(userId)
      console.log('Rider Socket Id',riderDetail.data[0].socket_id);
      req.to(riderDetail.data[0].socket_id).emit('nearest-driver-found', rideDetail);
    }
  } catch (error) {
    console.log("Error in nearest Driver Response:", error);
  }
};

module.exports = {
  addDriverLiveLocation,
  findDriverLiveLocation,
  nearestDriverResponse,
};
