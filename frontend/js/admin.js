/* ============================================
   ADMIN PAGE — Shops, Products, Orders CRUD
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initCommon('admin');
  initTabs();
  loadShopsList();
  loadProductsList();
  loadOrdersList();
});

/* ── Tab Navigation ──────────────────────── */
function initTabs() {
  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.admin-panel').forEach(p => p.classList.add('hidden'));
      tab.classList.add('active');
      document.getElementById(`panel-${tab.dataset.tab}`).classList.remove('hidden');
    });
  });
}

/* ── Shops ────────────────────────────────── */
async function loadShopsList() {
  const list = document.getElementById('shopsList');
  list.innerHTML = '<div class="skeleton skeleton--card" style="height:80px;"></div>'.repeat(3);

  const res = await API.get('/shops');
  const shops = res.success && res.data ? res.data : [];

  if (shops.length === 0) {
    list.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:var(--space-8);">No shops found. Add one above or seed the database.</p>';
    return;
  }

  list.innerHTML = shops.map(shop => `
    <div class="admin-item">
      <div class="admin-item__icon" style="background:${getCategoryColor(shop.category)}20;color:${getCategoryColor(shop.category)};">
        ${getCategoryIcon(shop.category)}
      </div>
      <div class="admin-item__info">
        <div class="admin-item__name">${shop.name}</div>
        <div class="admin-item__meta">${shop.category} · ${shop.distance} · ${shop.deliveryTime}</div>
      </div>
      <button class="admin-item__delete" onclick="deleteShop('${shop._id}')" title="Delete">🗑️</button>
    </div>
  `).join('');

  // Populate product shop dropdown
  const prodShop = document.getElementById('prodShop');
  if (prodShop) {
    prodShop.innerHTML = '<option value="">Select shop...</option>' +
      shops.map(s => `<option value="${s._id}">${s.name}</option>`).join('');
  }
}

async function addShop() {
  const name = document.getElementById('shopName').value.trim();
  const category = document.getElementById('shopCategory').value;
  const distance = document.getElementById('shopDistance').value.trim() || '200m';
  const deliveryTime = document.getElementById('shopDelivery').value.trim() || '15 mins';
  const image = document.getElementById('shopImage').value.trim();
  const description = document.getElementById('shopDesc').value.trim();

  if (!name) { Toast.show('Please enter shop name', 'error'); return; }

  const res = await API.post('/shops', { name, category, distance, deliveryTime, image, description });

  if (res.success) {
    Toast.show('Shop added successfully!', 'success');
    document.getElementById('shopName').value = '';
    document.getElementById('shopImage').value = '';
    document.getElementById('shopDesc').value = '';
    loadShopsList();
  } else {
    Toast.show(res.message || 'Failed to add shop', 'error');
  }
}

async function deleteShop(id) {
  if (!confirm('Delete this shop?')) return;
  const res = await API.delete(`/shops/${id}`);
  if (res.success) {
    Toast.show('Shop deleted', 'info');
    loadShopsList();
  } else {
    Toast.show('Failed to delete shop', 'error');
  }
}

/* ── Products ────────────────────────────── */
async function loadProductsList() {
  const list = document.getElementById('productsList');
  list.innerHTML = '<div class="skeleton skeleton--card" style="height:80px;"></div>'.repeat(3);

  const res = await API.get('/products');
  const products = res.success && res.data ? res.data : [];

  if (products.length === 0) {
    list.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:var(--space-8);">No products found.</p>';
    return;
  }

  list.innerHTML = products.map(p => `
    <div class="admin-item">
      <div class="admin-item__icon" style="background:var(--primary-subtle);color:var(--primary);">📦</div>
      <div class="admin-item__info">
        <div class="admin-item__name">${p.name}</div>
        <div class="admin-item__meta">₹${p.price} · ${p.shopId?.name || 'Unknown shop'}</div>
      </div>
      <button class="admin-item__delete" onclick="deleteProduct('${p._id}')" title="Delete">🗑️</button>
    </div>
  `).join('');
}

async function addProduct() {
  const name = document.getElementById('prodName').value.trim();
  const price = parseFloat(document.getElementById('prodPrice').value);
  const shopId = document.getElementById('prodShop').value;
  const image = document.getElementById('prodImage').value.trim();

  if (!name) { Toast.show('Please enter product name', 'error'); return; }
  if (!price || price <= 0) { Toast.show('Please enter a valid price', 'error'); return; }
  if (!shopId) { Toast.show('Please select a shop', 'error'); return; }

  const res = await API.post('/products', { name, price, shopId, image });

  if (res.success) {
    Toast.show('Product added!', 'success');
    document.getElementById('prodName').value = '';
    document.getElementById('prodPrice').value = '';
    document.getElementById('prodImage').value = '';
    loadProductsList();
  } else {
    Toast.show(res.message || 'Failed to add product', 'error');
  }
}

async function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;
  const res = await API.delete(`/products/${id}`);
  if (res.success) {
    Toast.show('Product deleted', 'info');
    loadProductsList();
  } else {
    Toast.show('Failed to delete product', 'error');
  }
}

/* ── Orders ──────────────────────────────── */
async function loadOrdersList() {
  const list = document.getElementById('ordersList');
  list.innerHTML = '<div class="skeleton skeleton--card" style="height:80px;"></div>'.repeat(3);

  const res = await API.get('/orders');
  const orders = res.success && res.data ? res.data : [];

  if (orders.length === 0) {
    list.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:var(--space-8);">No orders yet.</p>';
    return;
  }

  list.innerHTML = orders.map(order => {
    const date = new Date(order.createdAt).toLocaleString();
    const statusClass = order.status === 'pending' ? 'pending' : order.status === 'confirmed' ? 'confirmed' : 'delivered';
    return `
      <div class="admin-item">
        <div class="admin-item__icon" style="background:var(--primary-subtle);color:var(--primary);">📋</div>
        <div class="admin-item__info">
          <div class="admin-item__name">${order.customerName} — ₹${order.totalAmount}</div>
          <div class="admin-item__meta">📱 ${order.customerPhone} · ${date}</div>
          <div class="order-items-list">${order.items.map(i => `${i.name} ×${i.quantity}`).join(', ')}</div>
        </div>
        <span class="admin-item__badge admin-item__badge--${statusClass}">${order.status}</span>
      </div>
    `;
  }).join('');
}

/* ── Seed Database ───────────────────────── */
async function seedDatabase() {
  if (!confirm('This will reset and seed the database with sample data. Continue?')) return;

  Toast.show('Seeding database...', 'info');
  const res = await API.post('/seed', {});

  if (res.success) {
    Toast.show(`Seeded! ${res.shops} shops, ${res.products} products`, 'success');
    loadShopsList();
    loadProductsList();
  } else {
    Toast.show('Seed failed. Is the server running?', 'error');
  }
}
