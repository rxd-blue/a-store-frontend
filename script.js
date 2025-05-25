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
async function openCart() {
  try {
    // Send API request to open cart
    await fetch('https://excellent-frill-smash.glitch.me/api/filter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ openCart: true })
    });

    const cartOverlay = document.getElementById('cart-overlay');
    cartOverlay.style.display = 'block';
    await renderCartOverlay();
  } catch (error) {
    console.error('Error opening cart:', error);
  }
}

// Function to close cart overlay
function closeCart() {
  const cartOverlay = document.getElementById('cart-overlay');
  cartOverlay.style.display = 'none';
}

// Function to add product to cart
async function addToCart(name, category) {
  try {
    // Send API request to add product
    await fetch('https://excellent-frill-smash.glitch.me/api/cart/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, category })
    });

    // Update cart display
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
      const cartOverlay = document.getElementById('cart-overlay');
      if (cartOverlay && cartOverlay.style.display === 'block') {
        await renderCartOverlay();
      }
    }, 2000);
  }
}

// Initialize cart updates
startCartUpdates();

// Listen for filter updates that might include cart open command
async function checkFilterUpdate() {
  try {
    const res = await fetch('https://excellent-frill-smash.glitch.me/api/filter');
    const data = await res.json();

    if (data.openCart) {
      openCart();
    }

    if (JSON.stringify(data) !== JSON.stringify(lastFilter)) {
      lastFilter = data;
      filterProducts(data.category, data.brand);
    }
  } catch (error) {
    console.error('Error fetching filter:', error);
  }
} 