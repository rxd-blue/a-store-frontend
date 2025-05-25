// Cart state management
const CartState = {
  isOpen: false,
  items: [],
  isLoading: false,
  error: null
};

// Constants
const API_BASE_URL = 'https://excellent-frill-smash.glitch.me';
const POLLING_INTERVAL = 2000; // ms

function filterProducts(category, brand) {
  const products = document.querySelectorAll('.product');
  products.forEach(p => {
    const cat = p.dataset.category;
    const br = p.dataset.brand;
    
    // Show all products if both filters are empty
    if (!category && !brand) {
      p.style.display = 'flex';
      return;
    }
    
    // Handle individual filters
    const categoryMatch = !category || cat === category;
    const brandMatch = !brand || br === brand;
    
    p.style.display = (categoryMatch && brandMatch) ? 'flex' : 'none';
  });
}

// Function to open cart overlay
function openCart() {
  const cartOverlay = document.getElementById('cart-overlay');
  cartOverlay.style.display = 'block';
  CartState.isOpen = true;
  renderCartOverlay();
}

// Function to close cart overlay
function closeCart() {
  const cartOverlay = document.getElementById('cart-overlay');
  cartOverlay.style.display = 'none';
  CartState.isOpen = false;
}

// Optimized cart rendering with error handling
async function renderCartOverlay() {
  if (!CartState.isOpen) return;

  try {
    const res = await fetch(`${API_BASE_URL}/api/cart`);
    const cart = await res.json();
    
    CartState.items = cart;
    const container = document.getElementById('cart-overlay-items');
    
    container.innerHTML = '';

    if (cart.length === 0) {
      container.innerHTML = '<div class="cart-empty">🛒 العربة فاضية</div>';
    } else {
      cart.forEach(item => {
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
          <div class="cart-item-content">
            <h3>${item.name}</h3>
            <p>${item.category || ''}</p>
          </div>
          <button onclick="removeFromCart('${item.name}')" class="remove-btn">✕</button>
        `;
        container.appendChild(div);
      });
    }
    
  } catch (error) {
    console.error('Error fetching cart:', error);
    const container = document.getElementById('cart-overlay-items');
    container.innerHTML = '<div class="cart-error">❌ حدث خطأ في تحميل العربة</div>';
  }
}

// Enhanced add to cart with proper error handling
async function addToCart(name, category) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/cart/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, category })
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    // Only open cart after successful addition
    openCart();
    await renderCartOverlay();
    
  } catch (error) {
    console.error('Error adding to cart:', error);
    alert('❌ حدث خطأ في إضافة المنتج');
  }
}

// Remove from cart function
async function removeFromCart(name) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/cart/remove`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name })
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    await renderCartOverlay();
  } catch (error) {
    console.error('Error removing from cart:', error);
    alert('❌ حدث خطأ في حذف المنتج');
  }
}

// Start polling for cart updates
function startCartUpdates() {
  setInterval(async () => {
    if (CartState.isOpen) {
      await renderCartOverlay();
    }
  }, POLLING_INTERVAL);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  startCartUpdates();
});

// Export functions for global use
window.openCart = openCart;
window.closeCart = closeCart;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.filterProducts = filterProducts; 