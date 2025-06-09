let cart = [];

function addToCart(product) {
  const found = cart.find(item => item.id === product.id);
  if (found) {
    found.count++;
  } else {
    cart.push({ ...product, count: 1 });
  }
  updateCart();
}

function updateCart() {
  const cartDiv = document.getElementById('cart');
  cartDiv.innerHTML = '';
  cart.forEach((p, i) => {
    const item = document.createElement('div');
    item.textContent = `${p.name} - $${p.price} × ${p.count} `;

    // Minus button
    const minusBtn = document.createElement('button');
    minusBtn.textContent = '−';
    minusBtn.style.marginLeft = '10px';
    minusBtn.onclick = () => {
      if (p.count > 1) {
        p.count--;
      } else {
        cart.splice(i, 1);
      }
      updateCart();
    };
    item.appendChild(minusBtn);

    // Plus button
    const plusBtn = document.createElement('button');
    plusBtn.textContent = '+';
    plusBtn.onclick = () => {
      p.count++;
      updateCart();
    };
    item.appendChild(plusBtn);

    // Remove button
    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove';
    removeBtn.style.background = '#e53935';
    removeBtn.style.marginLeft = '10px';
    removeBtn.onclick = () => {
      cart.splice(i, 1);
      updateCart();
    };
    item.appendChild(removeBtn);

    cartDiv.appendChild(item);
  });
}

// Uprav submitOrder, aby posílal správně počty kusů
async function submitOrder() {
  const address = document.getElementById('address').value;
  // Rozbal produkty podle počtu kusů
  const items = cart.flatMap(p => Array.from({ length: p.count }, () => ({ id: p.id, name: p.name, price: p.price })));
  const res = await fetch('/api/order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address, items })
  });
  const data = await res.json();
  if (data.success) alert('Order placed!');
}

async function loadProducts() {
  const res = await fetch('/api/products');
  const products = await res.json();
  const container = document.getElementById('products');
  container.innerHTML = '';
  products.forEach(p => {
    const item = document.createElement('div');
    item.innerHTML = `<button onclick='addToCart(${JSON.stringify(p)})'>${p.name} - $${p.price}</button>`;
    container.appendChild(item);
  });
}

function checkout() {
  document.getElementById('addressForm').style.display = 'block';
}

loadProducts();
