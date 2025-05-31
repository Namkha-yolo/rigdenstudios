// Global cart state
let cart = JSON.parse(localStorage.getItem('rigden-cart')) || [];

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Update cart count on page load
    updateCartCount();
    
    // Initialize cart items on checkout page
    if (window.location.pathname.includes('checkout.html')) {
        initializeCheckout();
    }
    
    // Initialize product page functionality
    if (window.location.pathname.includes('products.html')) {
        initializeProducts();
    }
    
    // Initialize navigation
    initializeNavigation();
    
    // Initialize forms
    initializeForms();
    
    // Initialize smooth scrolling
    initializeSmoothScrolling();
}

// Navigation Functions
function initializeNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }
}

// Cart Functions
function updateCartCount() {
    const cartCountElements = document.querySelectorAll('.cart-count');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    cartCountElements.forEach(element => {
        element.textContent = totalItems;
    });
}

function addToCart(productId, productName, productPrice) {
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            name: productName,
            price: parseFloat(productPrice),
            quantity: 1,
            image: `img/hoodie-${productId}.jpg`
        });
    }
    
    // Save to localStorage
    localStorage.setItem('rigden-cart', JSON.stringify(cart));
    
    // Update cart count
    updateCartCount();
    
    // Show notification
    showCartNotification();
}

function showCartNotification() {
    const notification = document.getElementById('cart-notification');
    if (notification) {
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
}

// Product Page Functions
function initializeProducts() {
    // Add to cart button handlers
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product');
            const productName = this.getAttribute('data-name');
            const productPrice = this.getAttribute('data-price');
            
            addToCart(productId, productName, productPrice);
        });
    });
    
    // Filter functionality
    initializeFilters();
    
    // Wishlist functionality
    document.querySelectorAll('.add-to-wishlist').forEach(button => {
        button.addEventListener('click', function() {
            this.innerHTML = '<i class="fas fa-heart"></i>';
            this.style.color = '#dc3545';
        });
    });
}

function initializeFilters() {
    const sortSelect = document.getElementById('sort');
    const colorSelect = document.getElementById('color');
    const sizeSelect = document.getElementById('size');
    
    if (sortSelect) {
        sortSelect.addEventListener('change', filterProducts);
    }
    if (colorSelect) {
        colorSelect.addEventListener('change', filterProducts);
    }
    if (sizeSelect) {
        sizeSelect.addEventListener('change', filterProducts);
    }
}

function filterProducts() {
    // Basic filter implementation
    const products = document.querySelectorAll('.product-card');
    const sortValue = document.getElementById('sort')?.value;
    
    if (sortValue === 'price-low') {
        // Sort by price low to high
        console.log('Sorting by price: low to high');
    } else if (sortValue === 'price-high') {
        // Sort by price high to low
        console.log('Sorting by price: high to low');
    }
}

// Checkout Functions
function initializeCheckout() {
    displayCartItems();
    calculateTotals();
    initializePaymentMethods();
    initializeShippingMethods();
    initializeFormValidation();
}

function displayCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    if (!cartItemsContainer) return;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <p>Your cart is empty</p>
                <a href="products.html" class="btn btn-primary">Shop Now</a>
            </div>
        `;
        return;
    }
    
    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}" onerror="this.src='img/hoodie-1.jpg'">
            </div>
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-details">Size: L, Color: Black</div>
                <div class="cart-item-quantity">Qty: ${item.quantity}</div>
            </div>
            <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
        </div>
    `).join('');
}

function calculateTotals() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = getShippingCost();
    const tax = subtotal * 0.09; // 9% tax
    const discount = getDiscountAmount();
    const total = subtotal + shipping + tax - discount;
    
    // Update DOM elements
    updateElement('subtotal', `$${subtotal.toFixed(2)}`);
    updateElement('shipping-cost', `$${shipping.toFixed(2)}`);
    updateElement('tax', `$${tax.toFixed(2)}`);
    updateElement('total', `$${total.toFixed(2)}`);
    
    if (discount > 0) {
        updateElement('discount', `-$${discount.toFixed(2)}`);
        document.getElementById('discount-row').style.display = 'flex';
    }
}

function getShippingCost() {
    const selectedShipping = document.querySelector('input[name="shipping"]:checked');
    if (selectedShipping) {
        switch (selectedShipping.value) {
            case 'standard': return 9.99;
            case 'express': return 19.99;
            case 'overnight': return 29.99;
            default: return 9.99;
        }
    }
    return 9.99;
}

function getDiscountAmount() {
    // Placeholder for discount logic
    return 0;
}

function updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

function initializePaymentMethods() {
    const paymentOptions = document.querySelectorAll('input[name="payment"]');
    const creditCardForm = document.getElementById('credit-card-form');
    
    paymentOptions.forEach(option => {
        option.addEventListener('change', function() {
            if (this.value === 'credit-card') {
                creditCardForm.style.display = 'block';
            } else {
                creditCardForm.style.display = 'none';
            }
        });
    });
}

function initializeShippingMethods() {
    const shippingOptions = document.querySelectorAll('input[name="shipping"]');
    
    shippingOptions.forEach(option => {
        option.addEventListener('change', function() {
            calculateTotals();
        });
    });
}

function initializeFormValidation() {
    // Card number formatting
    const cardNumberInput = document.getElementById('card-number');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function() {
            let value = this.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            this.value = formattedValue;
        });
    }
    
    // Expiry date formatting
    const expiryInput = document.getElementById('expiry');
    if (expiryInput) {
        expiryInput.addEventListener('input', function() {
            let value = this.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            this.value = value;
        });
    }
    
    // CVV validation
    const cvvInput = document.getElementById('cvv');
    if (cvvInput) {
        cvvInput.addEventListener('input', function() {
            this.value = this.value.replace(/[^0-9]/g, '');
        });
    }
}

// Form Functions
function initializeForms() {
    // Newsletter form
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            if (email) {
                alert('Thank you for subscribing!');
                this.reset();
            }
        });
    }
}

// Utility Functions
function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Checkout specific functions
function applyPromo() {
    const promoInput = document.getElementById('promo');
    const promoCode = promoInput.value.trim().toLowerCase();
    
    const validCodes = {
        'welcome10': 0.10,
        'save20': 0.20,
        'student15': 0.15
    };
    
    if (validCodes[promoCode]) {
        const discount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) * validCodes[promoCode];
        updateElement('discount', `-$${discount.toFixed(2)}`);
        document.getElementById('discount-row').style.display = 'flex';
        calculateTotals();
        
        // Show success message
        showNotification('Promo code applied successfully!', 'success');
        promoInput.value = '';
    } else {
        showNotification('Invalid promo code', 'error');
    }
}

function placeOrder() {
    // Validate required fields
    if (!validateCheckoutForm()) {
        return;
    }
    
    // Simulate order processing
    const orderNumber = 'RS-' + new Date().getFullYear() + '-' + Math.floor(Math.random() * 900000 + 100000);
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 7);
    
    // Update modal with order details
    document.getElementById('order-number').textContent = orderNumber;
    document.getElementById('delivery-date').textContent = deliveryDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Clear cart
    cart = [];
