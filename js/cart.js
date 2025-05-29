// Cart functionality for Rigden Store
import { supabase, getCurrentUser, getProductById } from './supabase.js';

// Initialize the cart
let cart = {
  items: [],
  total: 0
};

// Load cart from localStorage on page load
function initCart() {
  const savedCart = localStorage.getItem('rigdenCart');
  if (savedCart) {
    try {
      cart = JSON.parse(savedCart);
      updateCartDisplay();
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      // If there's an error, start with a new cart
      cart = { items: [], total: 0 };
      saveCart();
    }
  }
}

// Save cart to localStorage
function saveCart() {
  localStorage.setItem('rigdenCart', JSON.stringify(cart));
}

// Add a product to the cart
async function addToCart(product, quantity = 1) {
  try {
    // If product is just an ID, fetch the full product details
    if (typeof product === 'string' || typeof product === 'number') {
      const response = await getProductById(product);
      if (!response.success) {
        throw new Error(`Failed to fetch product: ${response.error}`);
      }
      product = response.product;
    }

    // Check if the product is already in the cart
    const existingItemIndex = cart.items.findIndex(item => item.id === product.id);

    if (existingItemIndex !== -1) {
      // Update quantity if product already exists in cart
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      cart.items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        quantity: quantity
      });
    }

    // Recalculate cart total
    calculateTotal();

    // Save to localStorage
    saveCart();

    // Update the UI
    updateCartDisplay();

    return { success: true };
  } catch (error) {
    console.error('Error adding to cart:', error);
    return { success: false, error: error.message };
  }
}

// Remove an item from the cart
function removeFromCart(productId) {
  cart.items = cart.items.filter(item => item.id !== productId);
  calculateTotal();
  saveCart();
  updateCartDisplay();
}

// Update item quantity in cart
function updateCartItemQuantity(productId, quantity) {
  const itemIndex = cart.items.findIndex(item => item.id === productId);
  
  if (itemIndex !== -1) {
    if (quantity <= 0) {
      // Remove item if quantity is zero or negative
      removeFromCart(productId);
    } else {
      // Update quantity
      cart.items[itemIndex].quantity = quantity;
      calculateTotal();
      saveCart();
      updateCartDisplay();
    }
  }
}

// Calculate the cart total
function calculateTotal() {
  cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

// Clear the entire cart
function clearCart() {
  cart = { items: [], total: 0 };
  saveCart();
  updateCartDisplay();
}

// Update the cart display in the UI
function updateCartDisplay() {
  const cartCountElement = document.getElementById('cart-count');
  const cartItemsContainer = document.getElementById('cart-items');
  const cartTotalElement = document.getElementById('cart-total');
  
  if (!cartCountElement || !cartItemsContainer || !cartTotalElement) {
    console.error('Cart display elements not found in the DOM');
    return;
  }
  
  // Update cart count
  const itemCount = cart.items.reduce((count, item) => count + item.quantity, 0);
  cartCountElement.textContent = itemCount;
  
  // Toggle visibility of cart count
  cartCountElement.style.display = itemCount > 0 ? 'flex' : 'none';
  
  // Update cart items display
  cartItemsContainer.innerHTML = '';
  
  if (cart.items.length === 0) {
    cartItemsContainer.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
  } else {
    cart.items.forEach(item => {
      const cartItemElement = document.createElement('div');
      cartItemElement.className = 'cart-item';
      cartItemElement.innerHTML = `
        <div class="cart-item-image">
          <img src="${item.image_url}" alt="${item.name}">
        </div>
        <div class="cart-item-details">
          <h4>${item.name}</h4>
          <div class="cart-item-price">$${item.price.toFixed(2)}</div>
          <div class="cart-item-quantity">
            <button class="quantity-btn quantity-decrease" data-id="${item.id}">-</button>
            <span>${item.quantity}</span>
            <button class="quantity-btn quantity-increase" data-id="${item.id}">+</button>
          </div>
        </div>
        <button class="remove-item" data-id="${item.id}">&times;</button>
      `;
      
      cartItemsContainer.appendChild(cartItemElement);
    });
    
    // Add event listeners to the new elements
    const decreaseButtons = cartItemsContainer.querySelectorAll('.quantity-decrease');
    const increaseButtons = cartItemsContainer.querySelectorAll('.quantity-increase');
    const removeButtons = cartItemsContainer.querySelectorAll('.remove-item');
    
    decreaseButtons.forEach(button => {
      button.addEventListener('click', () => {
        const productId = button.getAttribute('data-id');
        const item = cart.items.find(item => item.id === productId);
        if (item && item.quantity > 1) {
          updateCartItemQuantity(productId, item.quantity - 1);
        } else {
          removeFromCart(productId);
        }
      });
    });
    
    increaseButtons.forEach(button => {
      button.addEventListener('click', () => {
        const productId = button.getAttribute('data-id');
        const item = cart.items.find(item => item.id === productId);
        if (item) {
          updateCartItemQuantity(productId, item.quantity + 1);
        }
      });
    });
    
    removeButtons.forEach(button => {
      button.addEventListener('click', () => {
        const productId = button.getAttribute('data-id');
        removeFromCart(productId);
      });
    });
  }
  
  // Update cart total
  cartTotalElement.textContent = `$${cart.total.toFixed(2)}`;
}

// Initialize cart on page load
document.addEventListener('DOMContentLoaded', () => {
  initCart();
  
  // Enable "Add to Cart" buttons
  const addToCartButtons = document.querySelectorAll('.add-to-cart');
  addToCartButtons.forEach(button => {
    button.addEventListener('click', async (e) => {
      e.preventDefault();
      const productId = button.getAttribute('data-id');
      const productEl = button.closest('.product');
      const productName = productEl.querySelector('.product-title').textContent;
      const productPrice = parseFloat(productEl.querySelector('.product-price').textContent.replace('$', ''));
      const productImage = productEl.querySelector('img').getAttribute('src');
      
      // Add product to cart
      await addToCart({
        id: productId,
        name: productName,
        price: productPrice,
        image_url: productImage
      });
      
      // Show confirmation message
      const confirmationMessage = document.createElement('div');
      confirmationMessage.className = 'add-confirmation';
      confirmationMessage.textContent = 'Added to cart';
      button.parentNode.appendChild(confirmationMessage);
      
      setTimeout(() => {
        confirmationMessage.remove();
      }, 2000);
    });
  });
});

// Export cart functions
export {
  cart,
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
  clearCart,
  calculateTotal
};
