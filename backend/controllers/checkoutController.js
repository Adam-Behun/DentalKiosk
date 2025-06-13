// controllers/checkoutController.js
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const Appointment = require('../models/Appointment');

exports.createCheckoutSession = async (req, res) => {
  try {
    // 1. Get appointmentId from request body
    const { appointmentId } = req.body;

    // 2. Lookup appointment in MongoDB to get patientBalance
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // 3. Convert balance to cents (Stripe expects integer amounts)
    // If patientBalance is a string, parseFloat it first:
    const balance = parseFloat(appointment.patientBalance) || 0;
    const amountInCents = Math.round(balance * 100);

    // If balance is 0, you could handle that gracefully:
    if (amountInCents === 0) {
      return res.status(400).json({ error: 'No balance to pay' });
    }

    // 4. Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Dental Payment',
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      success_url: `http://localhost:3000/appointments?step=success&paid=true`,
      cancel_url: 'http://localhost:3000/appointments?step=pay',
    });

    // 5. Return the session URL
    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Unable to create checkout session' });
  }
};
