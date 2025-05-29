# Rigden Studios E‑Commerce

## Setup

1. Copy .env.example → .env.local and fill your keys
2. npm install && cd functions && npm install
3. firebase functions:config:set stripe.secret="sk_test_YOUR_SECRET"
4. firebase deploy --only functions,hosting
5. npm start

## Firestore

- products: { name, price, imageUrl }
