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
    loadSalesStats();
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


    // Edit button
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.className = 'btn btn-secondary btn-sm rounded';
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

    // Delete button
    const delBtn = document.createElement('button');
    delBtn.textContent = 'Delete';
    delBtn.className = 'btn btn-danger btn-sm rounded';
    delBtn.onclick = async () => {
      if (confirm('Delete this product?')) {
        await fetch('/api/admin/delete-product', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: p.id })
        });
        loadProducts();
      }
    };

    div.appendChild(editBtn);
    div.appendChild(delBtn);
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

    // Delete button
    const delBtn = document.createElement('button');
    delBtn.textContent = 'Delete';
    delBtn.className = 'btn btn-danger btn-sm rounded';
    delBtn.onclick = async () => {
      if (confirm('Delete this order?')) {
        await fetch('/api/admin/delete-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: order.id })
        });
        loadOrders();
        loadSalesStats && loadSalesStats();
      }
    };
    div.appendChild(delBtn);

    container.appendChild(div);
  });
  loadSalesStats && loadSalesStats();
}

async function loadSalesStats() {
  const res = await fetch('/api/admin/orders');
  const orders = await res.json();

  // count products sold
  const productCounts = {};
  orders.forEach(order => {
    order.items.forEach(item => {
      if (!productCounts[item.name]) productCounts[item.name] = 0;
      productCounts[item.name]++;
    });
  });

  // show statistics
  const statsDiv = document.getElementById('salesStats');
  statsDiv.innerHTML = '<b>Sold products:</b><br>' +
    Object.entries(productCounts).map(([name, count]) => `${name}: ${count}x`).join('<br>');

  // show graph
  const ctx = document.getElementById('salesChart').getContext('2d');
  if (window.salesChartInstance) window.salesChartInstance.destroy();
  window.salesChartInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: Object.keys(productCounts),
      datasets: [{
        label: 'Sold products',
        data: Object.values(productCounts),
        backgroundColor: [
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 99, 132, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
          'rgba(255, 159, 64, 0.5)'
        ]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        },
        datalabels: {
          color: '#222',
          font: { weight: 'bold' },
          formatter: (value, context) => context.chart.data.labels[context.dataIndex]
        }
      }
    },
    plugins: [ChartDataLabels]

  });
}
