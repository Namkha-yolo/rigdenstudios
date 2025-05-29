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
