#!/usr/bin/env bash
set -e

# WARNING: overwrites old code but preserves index.html, img/ → public/
read -p "Continue? (y/N) " OK
if [[ $OK != "y" ]]; then
  echo "Aborted."
  exit 1
fi

# 1) move design assets
rm -rf public
mkdir -p public
[ -f index.html ] && mv index.html public/index.html
[ -d img ]        && mv img        public/

# 2) remove old code
rm -rf js .github functions src package.json firebase.json README.md

# 3) create new structure
mkdir -p src/components functions

# 4) .env.example
cat > .env.example << 'EOF'
REACT_APP_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
REACT_APP_FIREBASE_AUTH_DOMAIN=YOUR_FIREBASE_AUTH_DOMAIN
REACT_APP_FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID
REACT_APP_FIREBASE_STORAGE_BUCKET=YOUR_FIREBASE_STORAGE_BUCKET
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=YOUR_FIREBASE_MESSAGING_SENDER_ID
REACT_APP_FIREBASE_APP_ID=YOUR_FIREBASE_APP_ID

REACT_APP_STRIPE_PUBLIC_KEY=pk_test_YOUR_STRIPE_PK
EOF

# 5) firebase.json
cat > firebase.json << 'EOF'
{
  "hosting": {
    "public": "public",
    "ignore": ["functions/**","node_modules/**"]
  },
  "functions": { "source": "functions" }
}
EOF

# 6) root package.json
cat > package.json << 'EOF'
{
  "name": "rigdenstudios",
  "private": true,
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build"
  },
  "dependencies": {
    "firebase": "^10.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "react-router-dom": "^6.0.0",
    "@stripe/stripe-js": "^2.0.0"
  }
}
EOF

# 7) README.md
cat > README.md << 'EOF'
# Rigden Studios E‑Commerce

## Setup

1. Copy .env.example → .env.local and fill your keys
2. npm install && cd functions && npm install
3. firebase functions:config:set stripe.secret="sk_test_YOUR_SECRET"
4. firebase deploy --only functions,hosting
5. npm start

## Firestore

- products: { name, price, imageUrl }
EOF

# 8) functions/package.json
cat > functions/package.json << 'EOF'
{
  "name": "functions",
  "scripts": { "deploy": "firebase deploy --only functions" },
  "dependencies": {
    "firebase-admin": "^11.0.0",
    "firebase-functions": "^4.0.0",
    "stripe": "^12.0.0"
  }
}
EOF

# 9) functions/index.js
cat > functions/index.js << 'EOF'
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
EOF

# 10) src/firebase.js
cat > src/firebase.js << 'EOF'
import { initializeApp } from 'firebase/app';
import { getAuth }       from 'firebase/auth';
import { getFirestore }  from 'firebase/firestore';
import { getFunctions }  from 'firebase/functions';

const cfg = {
  apiKey:    process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain:process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId:     process.env.REACT_APP_FIREBASE_APP_ID
};
const app = initializeApp(cfg);
export const auth = getAuth(app);
export const db   = getFirestore(app);
export const functions = getFunctions(app);
EOF

# 11) src/index.js
cat > src/index.js << 'EOF'
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
EOF

# 12) src/App.js
cat > src/App.js << 'EOF'
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ProductList from './components/ProductList';
import CartContextProvider from './components/CartContext';
import Checkout from './components/Checkout';

export default function App() {
  return (
    <CartContextProvider>
      <Router>
        <header><nav><Link to="/">Home</Link> | <Link to="/checkout">Checkout</Link></nav></header>
        <main>
          <Routes>
            <Route path="/" element={<ProductList />} />
            <Route path="/checkout" element={<Checkout />} />
          </Routes>
        </main>
      </Router>
    </CartContextProvider>
  );
}
EOF

# 13) src/components/CartContext.js
mkdir -p src/components
cat > src/components/CartContext.js << 'EOF'
import React, { createContext, useState } from 'react';
export const CartContext = createContext();

export default function CartContextProvider({ children }) {
  const [cart, setCart] = useState([]);
  const addToCart = product => setCart([...cart, { ...product, quantity: 1 }]);
  return <CartContext.Provider value={{ cart, addToCart }}>{children}</CartContext.Provider>;
}
EOF

# 14) src/components/ProductList.js
cat > src/components/ProductList.js << 'EOF'
import React, { useEffect, useState, useContext } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { CartContext } from './CartContext';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    (async () => {
      const snap = await getDocs(collection(db, 'products'));
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    })();
  }, []);

  return (
    <div className="products">
      {products.map(p => (
        <div key={p.id} className="product">
          <img src={p.imageUrl} alt={p.name}/>
          <h3>{p.name}</h3>
          <p>${p.price}</p>
          <button onClick={()=>addToCart(p)}>Add to Cart</button>
        </div>
      ))}
    </div>
  );
}
EOF

# 15) src/components/Checkout.js
cat > src/components/Checkout.js << 'EOF'
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
EOF

# 16) src/styles.css
cat > src/styles.css << 'EOF'
body { font-family: sans-serif; margin: 0; padding: 0; }
header { background: #222; color: #fff; padding: 1rem; }
nav a { color: #fff; margin-right: 1rem; text-decoration: none; }
.products { display: grid; grid-template-columns: repeat(auto-fit,minmax(200px,1fr)); gap:1rem; padding:1rem; }
.product { border:1px solid #ccc; padding:1rem; text-align:center; }
.product img { max-width:100%; height:auto; }
button { cursor:pointer; padding:0.5rem 1rem; }
EOF

# 17) commit & push
git add .
git commit -m "Rescaffold project with React+Firebase+Stripe Starter"
git push origin main

echo "✅ Done! Updated and pushed to main."
