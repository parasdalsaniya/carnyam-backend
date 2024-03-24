const { error } = require("console");
var path = require("path");
const Razorpay = require("razorpay");
const crypto = require('crypto')

const { RAZORPAY_SECRET_KEY_FOR_SIGNATURE } = process.env;

const orderModule = async (req, res) => {
  const data = req.body;
  console.log("data", data)

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  const options = {
    amount: req.body.amount,
    currency: req.body.currency,
    receipt: req.body.ride_id,
    payment_capture: 1
  };

  try {
    const response = await razorpay.orders.create(options)
    console.log('response', response);
    const data = {
      order_id: response.id,
      currency: "response.currency",
      amount: response.amount * 100,
    }
    res.json({
      status: true,
      message: "Success",
      data,
    })
  } catch (err) {
    console.log('Error in orderModule: ', err)
    res.status(400).send('Not able to create order. Please try again!');
  }
};

const paymentCaptureModule = (req, res) => {
  try {
    const data = crypto.createHmac('sha256', RAZORPAY_SECRET_KEY_FOR_SIGNATURE)
    data.update(JSON.stringify(req.body))
    const digest = data.digest('hex')
    console.log("paymentCaptureModule wbhook", { 'x-razorpay-signature': req.headers['x-razorpay-signature'], digest })
    if (digest === req.headers['x-razorpay-signature']) {
      console.log('request is legit')
      res.json({
        status: 'ok'
      })

    } else {
      res.status(400).send('Invalid signature');
    }
  } catch (error) {
    console.log('paymentCapture', error);
  }
}

module.exports = {
  orderModule,
  paymentCaptureModule,
};
