// Cart state management
const CartState = {
  isOpen: false,
  items: [],
  isLoading: false,
  error: null
};

// Constants
const API_BASE_URL = 'https://excellent-frill-smash.glitch.me';
const POLLING_INTERVAL = 500; // ms

function filterProducts(category, brand) {
  const products = document.querySelectorAll('.product');
  products.forEach(p => {
    const cat = p.dataset.category;
    const br = p.dataset.brand;
    if ((category && cat !== category) || (brand && br !== brand)) {
      p.style.display = 'none';
    } else {
      p.style.display = 'flex';
    }
  });
}

// Function to open cart overlay
function openCart() {
  if (CartState.isOpen) return;
  
  const cartOverlay = document.getElementById('cart-overlay');
  cartOverlay.style.display = 'block';
  CartState.isOpen = true;
  
  // Show initial loading state
  const container = document.getElementById('cart-overlay-items');
  container.innerHTML = '<div class="cart-item loading">جاري التحميل...</div>';
  
  // Add class to body to prevent scrolling
  document.body.classList.add('cart-open');
  
  renderCartOverlay();
}

// Function to close cart overlay
function closeCart() {
  const cartOverlay = document.getElementById('cart-overlay');
  cartOverlay.style.display = 'none';
  CartState.isOpen = false;
  CartState.error = null;
  
  // Remove class from body to enable scrolling
  document.body.classList.remove('cart-open');
}

// Optimized cart rendering with error handling
async function renderCartOverlay() {
  if (!CartState.isOpen) return;

  try {
    CartState.isLoading = true;
    const res = await fetch(`${API_BASE_URL}/api/cart`);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const cart = await res.json();
    
    // Check if cart contents have changed
    if (JSON.stringify(cart) === JSON.stringify(CartState.items)) {
      CartState.isLoading = false;
      return;
    }
    
    CartState.items = cart;
    const container = document.getElementById('cart-overlay-items');
    
    // Smooth transition for content update
    container.style.opacity = '0';
    
    setTimeout(() => {
      container.innerHTML = '';

      if (cart.length === 0) {
        container.innerHTML = '<div class="cart-empty">🛒 العربة فاضية</div>';
      } else {
        cart.forEach((item, index) => {
          const div = document.createElement('div');
          div.className = 'cart-item';
          div.style.animationDelay = `${index * 100}ms`;
          div.innerHTML = `
            <div class="cart-item-content">
              <h3>${item.name}</h3>
              <p>${item.category || ''}</p>
            </div>
            <button onclick="removeFromCart('${item.name}')" class="remove-item">✕</button>
          `;
          container.appendChild(div);
        });
      }
      
      container.style.opacity = '1';
    }, 300);
    
  } catch (error) {
    console.error('Error fetching cart:', error);
    CartState.error = error;
    const container = document.getElementById('cart-overlay-items');
    container.innerHTML = `
      <div class="cart-error">
        <p>❌ عذراً، حدث خطأ في تحميل العربة</p>
        <button onclick="retryCartLoad()">إعادة المحاولة</button>
      </div>
    `;
  } finally {
    CartState.isLoading = false;
  }
}

// Enhanced add to cart with proper error handling
async function addToCart(name, category) {
  try {
    const loadingToast = document.createElement('div');
    loadingToast.className = 'toast loading';
    loadingToast.textContent = 'جاري إضافة المنتج...';
    document.body.appendChild(loadingToast);
    
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

    loadingToast.remove();
    
    // Show success toast
    const successToast = document.createElement('div');
    successToast.className = 'toast success';
    successToast.textContent = '✅ تمت الإضافة بنجاح';
    document.body.appendChild(successToast);
    
    // Remove success toast after animation
    setTimeout(() => successToast.remove(), 2000);
    
    // Only open cart after successful addition
    openCart();
    await renderCartOverlay();
    
  } catch (error) {
    console.error('Error adding to cart:', error);
    const errorToast = document.createElement('div');
    errorToast.className = 'toast error';
    errorToast.textContent = '❌ حدث خطأ في إضافة المنتج';
    document.body.appendChild(errorToast);
    setTimeout(() => errorToast.remove(), 3000);
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
  }
}

// Retry mechanism for cart loading
async function retryCartLoad() {
  CartState.error = null;
  await renderCartOverlay();
}

// Optimized polling with error backoff
let pollAttempts = 0;
const MAX_POLL_ATTEMPTS = 3;

function startCartUpdates() {
  setInterval(async () => {
    if (CartState.isOpen && !CartState.isLoading) {
      try {
        await renderCartOverlay();
        pollAttempts = 0; // Reset attempts on success
      } catch (error) {
        pollAttempts++;
        if (pollAttempts >= MAX_POLL_ATTEMPTS) {
          console.error('Polling stopped due to consecutive errors');
          return;
        }
      }
    }
  }, POLLING_INTERVAL);
}

// Close cart when clicking outside
document.addEventListener('click', (e) => {
  if (CartState.isOpen && e.target.classList.contains('cart-overlay')) {
    closeCart();
  }
});

// Initialize with error handling
document.addEventListener('DOMContentLoaded', () => {
  try {
    startCartUpdates();
    
    // Add keyboard support for closing cart
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && CartState.isOpen) {
        closeCart();
      }
    });
  } catch (error) {
    console.error('Failed to initialize cart updates:', error);
  }
});

// Listen for filter updates
async function checkFilterUpdate() {
  try {
    const res = await fetch('https://excellent-frill-smash.glitch.me/api/filter');
    const data = await res.json();

    // If openCart is true in the filter data, open the cart
    if (data.openCart) {
      openCart();
    }

    // Handle regular filter updates
    if (data.category || data.brand) {
      filterProducts(data.category, data.brand);
    }
  } catch (error) {
    console.error('Error checking filter:', error);
  }
}

// Start checking for filter updates
setInterval(checkFilterUpdate, 2000);

// Function to handle API-triggered cart open
async function handleCartOpen() {
  openCart();
  await renderCartOverlay();
}

// Export functions for API use
window.openCart = openCart;
window.closeCart = closeCart;
window.addToCart = addToCart;
window.handleCartOpen = handleCartOpen;
window.retryCartLoad = retryCartLoad;
window.removeFromCart = removeFromCart; 