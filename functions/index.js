const functions = require('firebase-functions');
const admin     = require('firebase-admin');
const Stripe    = require('stripe');
admin.initializeApp();
const stripe = Stripe(functions.config().stripe.secret);

exports.createCheckoutSession = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated','Login required');
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: data.items.map(i => ({
      price_data: {
        currency: 'usd',
        unit_amount: i.price * 100,
        product_data: { name: i.name }
      },
      quantity: i.quantity
    })),
    mode: 'payment',
    success_url: data.successUrl,
    cancel_url: data.cancelUrl
  });
  return { sessionId: session.id };
});
