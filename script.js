const CART_KEY = 'indoorStoreCart';
let toastTimeout; // Fixes the rapid-click notification bug

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch (error) { // Fixed older browser compatibility
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const cart = getCart();
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  document.querySelectorAll('.cart-count').forEach(badge => {
    badge.textContent = totalQty;
    badge.style.display = totalQty > 0 ? 'flex' : 'none';
  });
}

function addToCart(product) {
  const cart = getCart();
  const existing = cart.find(item => item.id === product.id);
  
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  
  saveCart(cart);
  showToast(`${product.name} added to cart`);
}

function changeQty(id, delta) {
  let cart = getCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;
  
  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter(i => i.id !== id);
  }
  
  saveCart(cart);
  renderCart(); // Instantly update the cart page UI
}

// Moved from cart.html into the main script
function renderCart() {
  const container = document.getElementById('cart-container');
  if (!container) return; // Only run if we are actually on the cart page

  const cart = getCart();
  
  if (!cart.length) {
    container.innerHTML = `
      <div class="cart-empty">
        <p>Your cart is empty.</p>
        <a href="index.html#products" class="cta-btn">Browse Products</a>
      </div>`;
    return;
  }

  let total = 0;
  let html = '';
  
  cart.forEach(item => {
    const sub = item.price * item.qty;
    total += sub;
    html += `
      <div class="cart-item" data-id="${item.id}">
        <img src="${item.image}" alt="${item.name}">
        <div class="cart-item-info">
          <h3>${item.name}</h3>
          <p class="price">$${item.price.toFixed(2)}</p>
        </div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="changeQty('${item.id}', -1)">−</button>
          <span>${item.qty}</span>
          <button class="qty-btn" onclick="changeQty('${item.id}', 1)">+</button>
        </div>
        <div style="min-width:80px;text-align:right;font-weight:600;">$${sub.toFixed(2)}</div>
      </div>`;
  });
  
  html += `
    <div class="cart-total">
      <h3>Total: $${total.toFixed(2)}</h3>
      <button class="cta-btn" onclick="checkout()">Proceed to Checkout</button>
    </div>`;
    
  container.innerHTML = html;
}

// Moved from cart.html into the main script
function checkout() {
  showToast('Thank you! Checkout is a demo — no payment processed.');
  localStorage.removeItem(CART_KEY);
  updateCartCount();
  renderCart();
}

function showToast(msg) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  
  // Clear the previous timer so it doesn't close prematurely on multiple clicks
  clearTimeout(toastTimeout); 
  toastTimeout = setTimeout(() => toast.classList.remove('show'), 2500);
}

function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');
  
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      nav.classList.toggle('open');
      toggle.classList.toggle('open');
      document.body.classList.toggle('nav-open');
    });
    
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        toggle.classList.remove('open');
        document.body.classList.remove('nav-open');
      });
    });
  }
}

function setActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  setActiveNav();
  updateCartCount();
  renderCart(); // Will fire safely on the cart page, ignored elsewhere

  // Bind Add to Cart Buttons
  document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', (e) => {
      const productEl = e.target.closest('[data-product]');
      if (productEl) {
        const product = {
          id: productEl.dataset.id,
          name: productEl.dataset.name,
          price: parseFloat(productEl.dataset.price),
          image: productEl.dataset.image
        };
        addToCart(product);
      }
    });
  });

  // Prevent button clicks from triggering full card navigation
  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('button') || e.target.closest('a')) return;
      const link = card.dataset.link;
      if (link) window.location.href = link;
    });
  });
});