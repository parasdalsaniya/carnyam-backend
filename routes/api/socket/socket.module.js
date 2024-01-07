const addDriverLiveLocation = async (socket) => {
    try {
        console.log('data from addDriverLiveLocation: ', socket.body);
    } catch (error) {
        console.log('Error in addDriverLiveLocation: ', error);
    }
};


module.exports = {
    addDriverLiveLocation
}