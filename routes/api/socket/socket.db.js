const crud = require("../../crud")


const updateRideDetail = async(updateRideObj,updateRideWherCon) => {
    const result = await crud.executeQuery(crud.makeUpdateQueryString("ride",updateRideObj,updateRideWherCon))
    return result
}

module.exports = {
    updateRideDetail:updateRideDetail
}