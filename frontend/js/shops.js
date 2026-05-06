/* ============================================
   SHOPS PAGE — Filter, Search, Sort Logic
   ============================================ */

let allShops = [];
let activeCategory = 'all';

document.addEventListener('DOMContentLoaded', () => {
  initCommon('shops');

  // Check URL params
  const params = new URLSearchParams(window.location.search);
  const catParam = params.get('cat');
  const searchParam = params.get('search');

  if (catParam) {
    activeCategory = catParam;
    document.querySelectorAll('.filter-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.category === catParam);
    });
  }

  loadShops(searchParam);
  initFilters();
  initSearch();
  initSort();
});

async function loadShops(searchQuery) {
  const grid = document.getElementById('shopGrid');
  grid.innerHTML = '';
  createSkeletonCards(6, grid);

  const res = await API.get('/shops');
  clearSkeletons(grid);

  allShops = res.success && res.data ? res.data : getFallbackShopsData();

  if (searchQuery) {
    document.getElementById('shopSearch').value = searchQuery;
  }

  renderShops(searchQuery);
}

function renderShops(searchQuery) {
  const grid = document.getElementById('shopGrid');
  grid.innerHTML = '';

  let filtered = [...allShops];

  // Category filter
  if (activeCategory !== 'all') {
    filtered = filtered.filter(s => s.category === activeCategory);
  }

  // Search filter
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q) ||
      (s.description && s.description.toLowerCase().includes(q))
    );
  }

  // Sort
  const sort = document.getElementById('sortSelect').value;
  if (sort === 'distance') {
    filtered.sort((a, b) => parseInt(a.distance) - parseInt(b.distance));
  } else if (sort === 'delivery') {
    filtered.sort((a, b) => parseInt(a.deliveryTime) - parseInt(b.deliveryTime));
  } else if (sort === 'rating') {
    filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  // Update count
  document.getElementById('shopCount').textContent = `${filtered.length} shop${filtered.length !== 1 ? 's' : ''} found`;

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="no-results">
        <div class="no-results__icon">🔍</div>
        <div class="no-results__title">No shops found</div>
        <div class="no-results__desc">Try adjusting your filters or search term</div>
      </div>
    `;
    return;
  }

  filtered.forEach((shop, i) => {
    const card = document.createElement('div');
    card.className = 'shop-grid-card';
    card.setAttribute('data-tilt', '');
    card.style.animationDelay = `${i * 0.08}s`;
    card.onclick = () => navigateTo(`shop-detail.html?id=${shop._id || shop.id}`);
    card.innerHTML = `
      <div class="shop-grid-card__img-wrap">
        <img class="shop-grid-card__img" src="${shop.image || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop'}" alt="${shop.name}" loading="lazy">
        <span class="shop-grid-card__cat" style="background:${getCategoryColor(shop.category)}">${getCategoryIcon(shop.category)} ${shop.category}</span>
        <span class="shop-grid-card__rating">⭐ ${shop.rating || '4.0'}</span>
      </div>
      <div class="shop-grid-card__body">
        <div class="shop-grid-card__name">${shop.name}</div>
        <div class="shop-grid-card__desc">${shop.description || ''}</div>
        <div class="shop-grid-card__meta">
          <span class="badge badge--delivery">⚡ ${shop.deliveryTime}</span>
          <span class="badge badge--distance">📍 ${shop.distance}</span>
        </div>
        ${shop.offer ? `<div class="shop-grid-card__offer">🎁 ${shop.offer}</div>` : ''}
      </div>
    `;
    grid.appendChild(card);
  });

  initTiltCards();
}

function initFilters() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.dataset.category;
      renderShops(document.getElementById('shopSearch').value.trim());
    });
  });
}

function initSearch() {
  const input = document.getElementById('shopSearch');
  let debounce;
  input.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      renderShops(input.value.trim());
    }, 300);
  });
}

function initSort() {
  document.getElementById('sortSelect').addEventListener('change', () => {
    renderShops(document.getElementById('shopSearch').value.trim());
  });
}

function getFallbackShopsData() {
  return [
    { id: '1', name: 'Campus Bites', category: 'food', distance: '150m', deliveryTime: '12 mins', rating: 4.5, offer: '20% off first order', description: 'Best burgers and wraps near Gate 1.', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=75' },
    { id: '2', name: 'Quick Print Hub', category: 'xerox', distance: '80m', deliveryTime: '5 mins', rating: 4.2, offer: 'Free binding on 100+ pages', description: 'Fast printing, scanning & binding.', image: 'https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?w=400&q=75' },
    { id: '3', name: 'Chai Point Cafe', category: 'cafe', distance: '200m', deliveryTime: '8 mins', rating: 4.7, offer: 'Buy 2 Get 1 Free', description: 'Premium coffee & chai with WiFi.', image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&q=75' },
    { id: '4', name: 'Notebook Nook', category: 'stationery', distance: '120m', deliveryTime: '10 mins', rating: 4.3, offer: '15% off lab equipment', description: 'Complete stationery supplies.', image: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=400&q=75' },
    { id: '5', name: 'South Express', category: 'food', distance: '300m', deliveryTime: '18 mins', rating: 4.6, offer: 'Free dessert with thali', description: 'Authentic South Indian meals.', image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=75' },
    { id: '6', name: 'Brew & Code', category: 'cafe', distance: '250m', deliveryTime: '10 mins', rating: 4.8, offer: 'Student card = 10% off', description: 'Coworking cafe with outlets.', image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=75' },
    { id: '7', name: 'Copy Corner', category: 'xerox', distance: '350m', deliveryTime: '7 mins', rating: 4.0, offer: 'Bulk copy @ ₹0.30/page', description: 'Color printing specialists.', image: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=400&q=75' },
    { id: '8', name: 'The Art Store', category: 'stationery', distance: '180m', deliveryTime: '12 mins', rating: 4.4, offer: '25% on Faber-Castell', description: 'Art supplies & drafting tools.', image: 'https://images.unsplash.com/photo-1452860606245-08b6e28ea329?w=400&q=75' },
  ];
}
