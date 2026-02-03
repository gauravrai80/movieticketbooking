import express from 'express';
import Stripe from 'stripe';
import { auth } from '../middleware/auth.js';
import Booking from '../models/Booking.js';
import Showtime from '../models/Showtime.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create Payment Intent
router.post('/create-payment-intent', auth, async (req, res) => {
    try {
        const { amount, currency = 'inr', movieTitle, bookingId } = req.body;

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to smallest currency unit (paise)
            currency,
            metadata: {
                movieTitle,
                bookingId,
                userId: req.user.id
            },
            automatic_payment_methods: {
                enabled: true,
            },
            description: `Ticket booking for ${movieTitle}`
        });

        res.json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        });
    } catch (error) {
        console.error('Stripe Error:', error);
        res.status(500).json({ message: error.message });
    }
});

export default router;
