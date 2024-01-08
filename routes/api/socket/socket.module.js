const rideFare = require("../../../helpers/rideFare");
const libFunction = require("../../../helpers/libFunction");

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

module.exports = {
  addDriverLiveLocation: addDriverLiveLocation,
};
