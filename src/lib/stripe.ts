import Stripe from 'stripe';
import { loadStripe } from '@stripe/stripe-js';

// Server-side Stripe (lazy initialization)
let _stripe: Stripe | null = null;

export function getStripeServer() {
  if (!_stripe) {
    const secretKey = process.env.STRIPE_SECRET_KEY || '';
    _stripe = new Stripe(secretKey, {
      apiVersion: '2023-10-16',
    });
  }
  return _stripe;
}

// For backwards compatibility
export const stripe = getStripeServer();

// Client-side Stripe
let stripePromise: Promise<any> | null = null;

export const getStripe = () => {
  if (!stripePromise) {
    const publicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || '';
    stripePromise = loadStripe(publicKey);
  }
  return stripePromise;
};
