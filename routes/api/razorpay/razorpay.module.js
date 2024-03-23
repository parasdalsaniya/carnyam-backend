const { error } = require("console");
var path = require("path");
const Razorpay = require("razorpay");
const crypto = require('crypto')

const orderModule = async (req, res) => {
  const data = req.body;
  console.log("data", data)

  // initializing razorpay
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  // setting up options for razorpay order.
  const options = {
    amount: req.body.amount,
    currency: req.body.currency,
    receipt: "any unique id for every order",
    payment_capture: 1
  };
  try {
    const response = await razorpay.orders.create(options)
    console.log('response', response);
    res.json({
      order_id: response.id,
      currency: response.currency,
      amount: response.amount,
    })
  } catch (err) {
    console.log('err======> ', err)
    res.status(400).send('Not able to create order. Please try again!');
  }
};


const secret_key = '1234567890'

const paymentCaptureModule = (req, res) => {
  try {

    console.log("req.body", req.body)
    console.log("req.query", req.query)
    console.log("req.body", req.params)

    // do a validation
    const data = crypto.createHmac('sha256', secret_key)
    data.update(JSON.stringify(req.body))
    const digest = data.digest('hex')
    console.log("req.headers", req.headers)
    console.log("digest", digest)
    if (digest === req.headers['x-razorpay-signature']) {
      console.log('request is legit')
      //We can send the response and store information in a database.
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
