let loggedIn = false;

async function login() {
  const username = document.getElementById('user').value;
  const password = document.getElementById('pass').value;

  const res = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();
  if (data.success) {
    loggedIn = true;
    document.getElementById('adminPanel').style.display = 'block';
    loadOrders();
    loadProducts();
  } else {
    alert('Login failed');
  }
}

async function addProduct() {
  const name = document.getElementById('pname').value;
  const price = parseFloat(document.getElementById('pprice').value);

  const res = await fetch('/api/admin/add-product', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, price })
  });

  const data = await res.json();
  alert(data.success ? 'Product added' : 'Failed to add');
  if (data.success) loadProducts();
}

async function loadProducts() {
  const res = await fetch('/api/products');
  const products = await res.json();
  const container = document.getElementById('adminProducts');
  container.innerHTML = '';
  products.forEach(p => {
    const div = document.createElement('div');
    div.textContent = `${p.name} - $${p.price} `;

    // Delete button
    const btn = document.createElement('button');
    btn.textContent = 'Delete';
    btn.onclick = async () => {
      if (confirm('Delete this product?')) {
        await fetch('/api/admin/delete-product', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: p.id })
        });
        loadProducts();
      }
    };
    div.appendChild(btn);

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.onclick = () => {
      // Replace text with input fields
      div.innerHTML = '';
      const nameInput = document.createElement('input');
      nameInput.value = p.name;
      const priceInput = document.createElement('input');
      priceInput.type = 'number';
      priceInput.value = p.price;
      const saveBtn = document.createElement('button');
      saveBtn.textContent = 'Save';
      saveBtn.onclick = async () => {
        await fetch('/api/admin/edit-product', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: p.id, name: nameInput.value, price: parseFloat(priceInput.value) })
        });
        loadProducts();
      };
      const cancelBtn = document.createElement('button');
      cancelBtn.textContent = 'Cancel';
      cancelBtn.onclick = loadProducts;
      div.appendChild(nameInput);
      div.appendChild(priceInput);
      div.appendChild(saveBtn);
      div.appendChild(cancelBtn);
    };
    div.appendChild(editBtn);

    container.appendChild(div);
  });
}

async function loadOrders() {
  const res = await fetch('/api/admin/orders');
  const orders = await res.json();
  const container = document.getElementById('orders');
  container.innerHTML = '';
  orders.forEach(order => {
    const div = document.createElement('div');
    div.textContent = `Address: ${order.address} | Items: ${order.items.map(i => i.name).join(', ')}`;
    container.appendChild(div);
  });
}
