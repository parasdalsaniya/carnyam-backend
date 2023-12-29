const calculateRideFare = (distanceInKM, perKMCost, timeInMin) => {
    return parseFloat(distanceInKM) * parseFloat(perKMCost);
}

module.exports = {
    calculateRideFare
}