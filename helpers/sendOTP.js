const sendOTP = () => {
    try {
        const otp = Math.floor(100000 + Math.random() * 900000);
        console.log("OTP send successfully", otp);
        return otp;
    } catch(error) {
        console.log('Error in sending OTP', error)
    }

}

module.exports = {
    sendOTP
}