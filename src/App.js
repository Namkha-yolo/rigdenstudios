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
