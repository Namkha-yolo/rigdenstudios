// Checkout functionality for Rigden Store
import { cart, clearCart } from './cart.js';
import { isAuthenticated, currentUser } from './auth.js';
import { createOrder } from './supabase.js';

// Stripe public key
const stripePublicKey = 'your_stripe_public_key';

// Initialize Stripe
let stripe;

// Function to initialize the checkout process
async function initCheckout() {
  try {
    // Initialize Stripe
    stripe = Stripe(stripePublicKey);
    
    // Set up event listener for checkout button
    const checkoutButton = document.getElementById('checkout-button');
    if (checkoutButton) {
      checkoutButton.addEventListener('click', handleCheckoutClick);
    }
    
    // Check if we're on the order success page
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const orderId = urlParams.get('order_id');
    
    if (sessionId && orderId) {
      // Handle successful order completion
      await handleOrderCompletion(sessionId, orderId);
    }
  } catch (error) {
    console.error('Error initializing checkout:', error);
  }
}

// Function to handle the checkout button click
async function handleCheckoutClick() {
  // Check if user is authenticated
  if (!isAuthenticated) {
    // Show auth modal or redirect to sign in page
    const authModal = document.getElementById('auth-modal');
    if (authModal) {
      authModal.classList.add('active');
    } else {
      alert('Please sign in to continue with checkout');
      // Optionally redirect to sign in page
      // window.location.href = '/signin.html';
    }
    return;
  }
  
  // Check if cart is empty
  if (cart.items.length === 0) {
    alert('Your cart is empty');
    return;
  }
  
  try {
    // Show loading state
    const checkoutButton = document.getElementById('checkout-button');
    const originalButtonText = checkoutButton.textContent;
    checkoutButton.disabled = true;
    checkoutButton.textContent = 'Preparing checkout...';
    
    // Prepare line items for the server
    const lineItems = cart.items.map(item => ({
      id: item.id,
      quantity: item.quantity,
      price: item.price
    }));
    
    // Create a new order in Supabase
    const orderData = {
      userId: currentUser.id,
      items: cart.items,
      totalAmount: cart.total,
      shippingAddress: '', // Will be collected by Stripe Checkout
      paymentIntentId: '', // Will be updated after Stripe Checkout
    };
    
    // Create fetch request to your backend endpoint
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: lineItems,
        order: orderData,
        customer_email: currentUser.email
      }),
    });
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const session = await response.json();
    
    // Redirect to Stripe Checkout
    const result = await stripe.redirectToCheckout({
      sessionId: session.id,
    });
    
    if (result.error) {
      throw new Error(result.error.message);
    }
    
  } catch (error) {
    console.error('Error during checkout:', error);
    alert('Something went wrong. Please try again later.');
    
    // Reset button state
    const checkoutButton = document.getElementById('checkout-button');
    if (checkoutButton) {
      checkoutButton.disabled = false;
      checkoutButton.textContent = 'Checkout';
    }
  }
}

// Function to handle successful order completion
async function handleOrderCompletion(sessionId, orderId) {
  try {
    // Verify the payment status
    const response = await fetch(`/api/check-payment-status?session_id=${sessionId}`);
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const paymentStatus = await response.json();
    
    // If payment was successful, update the UI
    if (paymentStatus.status === 'paid') {
      // Clear the cart
      clearCart();
      
      // Update order success page
      const orderDetails = document.getElementById('order-details');
      const orderTotal = document.getElementById('order-total');
      
      if (orderDetails) {
        orderDetails.innerHTML = `
          <h3>Order #${orderId}</h3>
          <p>Thank you for your purchase!</p>
          <p>Your payment has been processed successfully.</p>
          <p>An email confirmation has been sent to ${paymentStatus.customer_email}.</p>
        `;
      }
      
      if (orderTotal) {
        orderTotal.textContent = `$${(paymentStatus.amount_total / 100).toFixed(2)}`;
      }
    }
  } catch (error) {
    console.error('Error handling order completion:', error);
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initCheckout);

// Export checkout functions
export {
  handleCheckoutClick
};
