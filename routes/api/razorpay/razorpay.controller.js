const { orderModule, paymentCaptureModule } = require("./razorpay.module");

const orderController = async (req, res) => {
  const result = await orderModule(req, res);
  return res.send(result);
};

const paymentCaptureController = async (req, res) => {
  const result = await paymentCaptureModule(req, res);
  return res.send(result);
}

module.exports = {
  orderController,
  paymentCaptureController,
};
