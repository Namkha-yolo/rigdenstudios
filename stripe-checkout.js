// This is a Node.js/Express backend example for Stripe integration
// You'll need to set up a backend server to handle Stripe payments securely

const express = require('express');
const stripe = require('stripe')(); // Replace with your secret key
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Create checkout session endpoint
app.post('/create-checkout-session', async (req, res) => {
    try {
        const { items, customerInfo, orderId } = req.body;

        // Calculate total
        const lineItems = items.map(item => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.name,
                    description: `Size: ${item.size}`,
                },
                unit_amount: Math.round(item.price * 100), // Stripe expects cents
            },
            quantity: item.quantity || 1,
        }));

        // Add shipping as a line item
        lineItems.push({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: 'Shipping',
                },
                unit_amount: 1000, // $10 shipping
            },
            quantity: 1,
        });

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${YOUR_DOMAIN}/success.html?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${YOUR_DOMAIN}/checkout.html`,
            customer_email: customerInfo.email,
            shipping_address_collection: {
                allowed_countries: ['US', 'CA', 'UK', 'AU'],
            },
            metadata: {
                orderId: orderId,
            },
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ error: 'Failed to create checkout session' });
    }
});

// Webhook endpoint to handle successful payments
app.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = 'YOUR_WEBHOOK_SECRET'; // Replace with your webhook secret

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            
            // Update order status in Firebase
            // You'll need to initialize Firebase Admin SDK here
            // and update the order status to 'paid'
            
            console.log('Payment successful for order:', session.metadata.orderId);
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({received: true});
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});

require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Update these URLs with your GitHub Pages URL
const YOUR_DOMAIN = 'https://namkha-yolo.github.io/rigdenstudios';

app.post('/create-checkout-session', async (req, res) => {
    // ... rest of your stripe-checkout.js code ...
    // Update success_url and cancel_url to use YOUR_DOMAIN
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// To use this:
// 1. Install dependencies: npm install express stripe cors
// 2. Replace YOUR_STRIPE_SECRET_KEY with your Stripe secret key
// 3. Replace YOUR_DOMAIN with your actual domain
// 4. Set up webhook in Stripe dashboard
// 5. Deploy this to a server (Heroku, Vercel, etc.)
