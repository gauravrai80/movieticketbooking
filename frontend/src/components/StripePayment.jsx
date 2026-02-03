import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import PaymentForm from './PaymentForm';

// Initialize Stripe
// Initialize Stripe
const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || import.meta.env.VITE_STRIPE_PUBLIC_KEY;
let stripePromise = null;

if (!stripeKey) {
    console.error("CRITICAL ERROR: Stripe Key is missing from Environment Variables!");
} else {
    console.log("Stripe Key Loaded successfully.");
    stripePromise = loadStripe(stripeKey);
}

const StripePayment = ({ clientSecret, bookingId, amount, movieTitle, onSuccess }) => {
    if (!clientSecret) return null;

    if (!stripePromise) {
        return (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg">
                <p className="font-bold">Configuration Error</p>
                <p className="text-sm">Stripe Public Key is missing from environment variables. Please check Netlify settings.</p>
            </div>
        );
    }

    const options = {
        clientSecret,
        appearance: {
            theme: 'night',
            variables: {
                colorPrimary: '#ec4899', // accent-500
                colorBackground: '#1e293b', // primary-800
                colorText: '#ffffff',
                colorDanger: '#ef4444',
                fontFamily: 'Outfit, system-ui, sans-serif',
            },
        },
    };

    return (
        <div className="w-full">
            <Elements stripe={stripePromise} options={options}>
                <PaymentForm
                    bookingId={bookingId}
                    amount={amount}
                    movieTitle={movieTitle}
                    onSuccess={onSuccess}
                />
            </Elements>
        </div>
    );
};

export default StripePayment;
