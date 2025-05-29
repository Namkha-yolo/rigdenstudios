import React, { useContext } from 'react';
import { CartContext } from './CartContext';
import { functions } from '../firebase';
import { httpsCallable } from 'firebase/functions';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

export default function Checkout() {
  const { cart } = useContext(CartContext);
  const createSession = httpsCallable(functions, 'createCheckoutSession');

  const handleCheckout = async () => {
    const { data } = await createSession({
      items: cart.map(i => ({ name: i.name, price: i.price, quantity: i.quantity })),
      successUrl: window.location.origin + '/success',
      cancelUrl: window.location.origin + '/'
    });
    const stripe = await stripePromise;
    await stripe.redirectToCheckout({ sessionId: data.sessionId });
  };

  return (
    <div>
      <h2>Your Cart</h2>
      {cart.map((i,idx)=><div key={idx}>{i.name} x{i.quantity} - ${i.price}</div>)}
      <button onClick={handleCheckout}>Pay with Stripe</button>
    </div>
  );
}
