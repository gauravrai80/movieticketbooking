import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Loader2, Lock, AlertCircle, CheckCircle } from 'lucide-react';

const PaymentForm = ({ bookingId, amount, movieTitle, onSuccess }) => {
    const stripe = useStripe();
    const elements = useElements();

    const [message, setMessage] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);
        setMessage(null);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Return URL is required even if redirect is set to if_required
                return_url: `${window.location.origin}/booking-success`,
            },
            redirect: "if_required",
        });

        if (error) {
            setMessage(error.message);
            setIsProcessing(false);
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            // Payment successful
            try {
                await onSuccess(paymentIntent);
                // Navigate will unmount, so no need to set processing false if successful
            } catch (err) {
                console.error("Payment succeeded but onSuccess failed:", err);
                setMessage("Payment succeeded, but we verified an error finalizing your booking. Please contact support.");
                setIsProcessing(false);
            }
        } else {
            setMessage("Unexpected payment status.");
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-primary-900/50 p-4 rounded-lg border border-primary-700/50 mb-6">
                <h3 className="text-white font-semibold mb-1">Payment Details</h3>
                <p className="text-sm text-gray-400 mb-4">Complete your secure booking for <span className="text-accent-400">{movieTitle}</span></p>

                <PaymentElement id="payment-element" />
            </div>

            {message && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg flex items-start gap-2 text-sm">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <span>{message}</span>
                </div>
            )}

            <button
                disabled={isProcessing || !stripe || !elements}
                id="submit"
                className="w-full bg-accent-600 hover:bg-accent-700 disabled:bg-primary-700 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-lg transition shadow-lg shadow-accent-600/20 flex items-center justify-center gap-2"
            >
                {isProcessing ? (
                    <>
                        <Loader2 size={20} className="animate-spin" />
                        Processing...
                    </>
                ) : (
                    <>
                        <Lock size={18} />
                        Pay ₹{amount}
                    </>
                )}
            </button>

            <div className="flex justify-center items-center gap-2 text-xs text-gray-500">
                <Lock size={12} />
                <span>Payments are secure and encrypted</span>
            </div>
        </form>
    );
};

export default PaymentForm;
