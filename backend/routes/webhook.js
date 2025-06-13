// File: routes/webhook.js
const express = require('express');
const Stripe = require('stripe');
const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post('/', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      console.log('Payment successful!', event.data.object);
      // You can update the appointment’s balance to 0, or log a payment record, etc.
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.status(200).send('Received');
});

module.exports = router;
