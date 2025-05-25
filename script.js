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

// Function to add product to cart
async function addToCart(name, category) {
  try {
    // First open the cart to show loading state
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

// Original renderCart function for the cart.html page
async function renderCart() {
  const res = await fetch('https://excellent-frill-smash.glitch.me/api/cart');
  const cart = await res.json();
  const container = document.getElementById('cart-items');
  
  container.innerHTML = '';

  if (cart.length === 0) {
    container.innerHTML = '<p>العربة فاضية</p>';
    return;
  }

  cart.forEach(item => {
    const div = document.createElement('div');
    div.innerHTML = `
      <h3>${item.name}</h3>
      <p>${item.category || ''}</p>
    `;
    container.appendChild(div);
  });
}

// Start polling for cart updates when overlay is visible
let cartUpdateInterval = null;

function startCartUpdates() {
  if (!cartUpdateInterval) {
    cartUpdateInterval = setInterval(async () => {
      if (document.getElementById('cart-overlay').style.display === 'block') {
        await renderCartOverlay();
      }
    }, 2000);
  }
}

// Initialize cart updates
startCartUpdates(); 