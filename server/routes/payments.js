const express = require('express');
const { body, validationResult } = require('express-validator');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('../models/Booking');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/payments/create-payment-intent
// @desc    Create Stripe payment intent
// @access  Private
router.post('/create-payment-intent', [
  protect,
  body('bookingId').isMongoId().withMessage('Valid booking ID is required'),
  body('amount').isFloat({ min: 1 }).withMessage('Amount must be greater than 0')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { bookingId, amount } = req.body;

    // Verify booking exists and belongs to user
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    if (booking.tourist.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to pay for this booking'
      });
    }

    if (booking.payment.status !== 'pending') {
      return res.status(400).json({
        status: 'error',
        message: 'Booking payment already processed'
      });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'inr',
      metadata: {
        bookingId: bookingId,
        userId: req.user._id.toString()
      }
    });

    res.json({
      status: 'success',
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      }
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while creating payment intent'
    });
  }
});

// @route   POST /api/payments/confirm-payment
// @desc    Confirm payment and update booking
// @access  Private
router.post('/confirm-payment', [
  protect,
  body('paymentIntentId').isString().withMessage('Payment intent ID is required'),
  body('bookingId').isMongoId().withMessage('Valid booking ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { paymentIntentId, bookingId } = req.body;

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        status: 'error',
        message: 'Payment not completed'
      });
    }

    // Update booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    booking.payment.status = 'paid';
    booking.payment.transactionId = paymentIntent.id;
    booking.payment.paymentDate = new Date();
    booking.status = 'confirmed';

    await booking.save();

    res.json({
      status: 'success',
      message: 'Payment confirmed successfully',
      data: { booking }
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while confirming payment'
    });
  }
});

// @route   POST /api/payments/webhook
// @desc    Stripe webhook handler
// @access  Public
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('PaymentIntent succeeded:', paymentIntent.id);
      
      // Update booking status
      try {
        const booking = await Booking.findOne({
          'payment.transactionId': paymentIntent.id
        });
        
        if (booking) {
          booking.payment.status = 'paid';
          booking.payment.paymentDate = new Date();
          booking.status = 'confirmed';
          await booking.save();
        }
      } catch (error) {
        console.error('Error updating booking:', error);
      }
      break;
      
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('PaymentIntent failed:', failedPayment.id);
      
      // Update booking status
      try {
        const booking = await Booking.findOne({
          'payment.transactionId': failedPayment.id
        });
        
        if (booking) {
          booking.payment.status = 'failed';
          await booking.save();
        }
      } catch (error) {
        console.error('Error updating booking:', error);
      }
      break;
      
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

module.exports = router;
