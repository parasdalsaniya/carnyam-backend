const rideFare = require("../../../helpers/rideFare");
const libFunction = require("../../../helpers/libFunction");
const { getUserDetailbyUserId } = require("../users/users.db");

const { NEAREST_DRIVER_RADIUS_IN_KM } = process.env
const addDriverLiveLocation = async (req) => {
  try {
    req.body["driver_id"] = req.driver_id;
    req.body["timestamp"] = await libFunction.formatDateTimeLib(new Date());
    req.body["socket_id"] = req.id
    await rideFare.updateDriverLiveLocation(req.body);
  } catch (error) {
    console.log("Error in addDriverLiveLocation:", error);
  }
};

const findDriverLiveLocation = async (req) => {
  try {
    console.log('req.body', req.body)
    console.log('socket.user_id', req.user_id);
    const { ride_point } = req.body

    const drivers = await rideFare.getNearestDriver(
      ride_point[0].latitude,
      ride_point[0].longitude,
      NEAREST_DRIVER_RADIUS_IN_KM
    );

    // send empty array to user that not drivers availables in pickup area locations
    if (drivers.data.length == 0) {
      req.to(req.id).emit('nearest-driver-found', drivers.data);
      return '';
    }

    // get rider details
    const rider = await getUserDetailbyUserId(req.user_id);
    console.log('rider', rider);

    // send list of nearest rides to drives
    drivers.data.forEach((element) => {
      console.log('element', element)
      const data = {
        ...req.body,
        rider_name: rider.data[0].user_name,
        rider_gender: rider.data[0].gender,
        rider_image: rider.data[0].storage_id,
      }
      req.to(element.socket_id).emit('get-nearest-rides', data);
    });

  } catch (error) {
    console.log("Error in addDriverLiveLocation:", error);
  }
};

const nearestDriverResponse = async (req) => {
  try {
    console.log('nearestDriverResponse', req.body)
  } catch (error) {
    console.log("Error in nearestDriverResponse:", error);
  }
};

module.exports = {
  addDriverLiveLocation,
  findDriverLiveLocation,
  nearestDriverResponse,
};
