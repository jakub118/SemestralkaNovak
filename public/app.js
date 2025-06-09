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
    minusBtn.className = 'btn btn-primary btn-sm rounded';
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
    plusBtn.className = 'btn btn-primary btn-sm rounded';
    plusBtn.onclick = () => {
      p.count++;
      updateCart();
    };
    item.appendChild(plusBtn);

    // Remove button
    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove';
    removeBtn.className = 'btn btn-danger btn-sm rounded';
    removeBtn.style.marginLeft = '10px';
    removeBtn.onclick = () => {
      cart.splice(i, 1);
      updateCart();
    };
    item.appendChild(removeBtn);

    cartDiv.appendChild(item);
  });
}

async function submitOrder() {
  const address = document.getElementById('address').value;
  const items = cart.flatMap(p => Array.from({ length: p.count }, () => ({ id: p.id, name: p.name, price: p.price })));
  const res = await fetch('/api/order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address, items })
  });
  const data = await res.json();
  if (data.success) {
    alert('Order placed!');
    cart = [];           //delete cart
    updateCart();        //refresh
    document.getElementById('addressForm').style.display = 'none'; // hide address form
  }
}

async function loadProducts() {
  const res = await fetch('/api/products');
  const products = await res.json();
  const container = document.getElementById('products');
  container.innerHTML = '';
  products.forEach(p => {
    const col = document.createElement('div');
    col.className = 'col-12 col-sm-6 col-md-4 col-lg-3';
    const item = document.createElement('div');
    item.className = 'd-flex flex-column align-items-center';
    item.innerHTML = `<button class="btn btn-outline-primary w-100 mb-2" onclick='addToCart(${JSON.stringify(p)})'>${p.name} - $${p.price}</button>`;
    col.appendChild(item);
    container.appendChild(col);
  });
}

function checkout() {
  document.getElementById('addressForm').style.display = 'block';
}

loadProducts();
