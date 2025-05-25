// Global state
let isCartOpen = false;
let lastCartItems = [];

function filterProducts(category, brand) {
  const products = document.querySelectorAll('.product');
  products.forEach(p => {
    const cat = p.dataset.category;
    const br = p.dataset.brand;
    if ((category && cat !== category) || (brand && br !== brand)) {
      p.style.display = 'none';
    } else {
      p.style.display = 'inline-block';
    }
  });
}

// Function to open cart overlay
function openCart() {
  const cartOverlay = document.getElementById('cart-overlay');
  if (!isCartOpen) {
    cartOverlay.style.display = 'block';
    isCartOpen = true;
    renderCartOverlay();
  }
}

// Function to close cart overlay
function closeCart() {
  const cartOverlay = document.getElementById('cart-overlay');
  cartOverlay.style.display = 'none';
  isCartOpen = false;
}

async function renderCartOverlay() {
  if (!isCartOpen) return;

  try {
    const res = await fetch('https://excellent-frill-smash.glitch.me/api/cart');
    const cart = await res.json();
    
    // Check if cart contents have changed
    if (JSON.stringify(cart) === JSON.stringify(lastCartItems)) {
      return; // No changes, don't re-render
    }
    
    lastCartItems = cart; // Update last known state
    const container = document.getElementById('cart-overlay-items');
    
    // Clear existing items with fade-out
    container.style.opacity = '0';
    
    setTimeout(() => {
      container.innerHTML = '';

      if (cart.length === 0) {
        container.innerHTML = '<p>العربة فاضية</p>';
      } else {
        cart.forEach(item => {
          const div = document.createElement('div');
          div.className = 'cart-item';
          div.innerHTML = `
            <h3>${item.name}</h3>
            <p>${item.category || ''}</p>
          `;
          container.appendChild(div);
        });
      }
      
      // Fade in new content
      container.style.opacity = '1';
    }, 300);
    
  } catch (error) {
    console.error('Error fetching cart:', error);
    const container = document.getElementById('cart-overlay-items');
    container.innerHTML = '<p>❌ حدث خطأ في تحميل العربة</p>';
  }
}

// Function to add product to cart
async function addToCart(name, category) {
  try {
    // First ensure cart is open and visible
    openCart();
    
    // Show loading state
    const container = document.getElementById('cart-overlay-items');
    container.innerHTML += '<div class="cart-item loading">جاري الإضافة...</div>';
    
    // Add the product
    await fetch('https://excellent-frill-smash.glitch.me/api/cart/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, category })
    });

    // Remove loading state and update cart
    const loadingItems = container.querySelectorAll('.loading');
    loadingItems.forEach(item => item.remove());
    await renderCartOverlay();
    
  } catch (error) {
    console.error('Error adding to cart:', error);
    alert('❌ حدث خطأ');
  }
}

// Continuous polling for cart updates
function startCartUpdates() {
  // Check every 500ms for cart updates when cart is open
  setInterval(async () => {
    if (isCartOpen) {
      await renderCartOverlay();
    }
  }, 500);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  startCartUpdates();
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