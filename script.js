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
  cartOverlay.style.display = 'block';
  renderCartOverlay();
}

// Function to close cart overlay
function closeCart() {
  const cartOverlay = document.getElementById('cart-overlay');
  cartOverlay.style.display = 'none';
}

async function renderCartOverlay() {
  try {
    const res = await fetch('https://excellent-frill-smash.glitch.me/api/cart');
    const cart = await res.json();
    const container = document.getElementById('cart-overlay-items');
    
    container.innerHTML = '';

    if (cart.length === 0) {
      container.innerHTML = '<p>العربة فاضية</p>';
      return;
    }

    cart.forEach(item => {
      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = `
        <h3>${item.name}</h3>
        <p>${item.category || ''}</p>
      `;
      container.appendChild(div);
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    container.innerHTML = '<p>❌ حدث خطأ في تحميل العربة</p>';
  }
}

// Function to add product to cart
async function addToCart(name, category) {
  try {
    // First open the cart
    openCart();
    
    // Then add the product
    await fetch('https://excellent-frill-smash.glitch.me/api/cart/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, category })
    });

    // After successful addition, update the cart display
    await renderCartOverlay();
  } catch (error) {
    console.error('Error adding to cart:', error);
    alert('❌ حدث خطأ');
  }
}

// Start polling for cart updates when overlay is visible
let cartUpdateInterval = null;

function startCartUpdates() {
  if (!cartUpdateInterval) {
    cartUpdateInterval = setInterval(async () => {
      const cartOverlay = document.getElementById('cart-overlay');
      if (cartOverlay && cartOverlay.style.display === 'block') {
        await renderCartOverlay();
      }
    }, 2000);
  }
}

// Initialize cart updates
startCartUpdates();

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
window.addToCart = addToCart;
window.handleCartOpen = handleCartOpen; 