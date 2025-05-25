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

// Add cart display functionality
function toggleCart() {
  const cartOverlay = document.getElementById('cart-overlay');
  cartOverlay.style.display = cartOverlay.style.display === 'none' ? 'block' : 'none';
  if (cartOverlay.style.display === 'block') {
    renderCartOverlay();
  }
}

async function renderCartOverlay() {
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
}

async function addToCart(name, category) {
  try {
    await fetch('https://excellent-frill-smash.glitch.me/api/cart/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, category })
    });
    // Show cart overlay after adding item
    const cartOverlay = document.getElementById('cart-overlay');
    cartOverlay.style.display = 'block';
    await renderCartOverlay();
  } catch (error) {
    console.error('Error adding to cart:', error);
    alert('❌ حدث خطأ');
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