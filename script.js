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

async function renderCart() {
  const res = await fetch('https://YOUR-RENDER-URL.onrender.com/api/cart');
  const cart = await res.json();
  const container = document.getElementById('cart-items');

  if (cart.length === 0) {
    container.innerHTML = '<p>العربة فاضية</p>';
    return;
  }

  cart.forEach(item => {
    const div = document.createElement('div');
    div.innerHTML = `<h3>${item.name}</h3><p>${item.details || ''}</p>`;
    container.appendChild(div);
  });
} 