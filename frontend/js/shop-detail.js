/* ============================================
   SHOP DETAIL PAGE — Load shop & products
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initCommon('shops');
  const params = new URLSearchParams(window.location.search);
  const shopId = params.get('id');
  if (shopId) {
    loadShopDetail(shopId);
  } else {
    loadFallbackShop('1');
  }
});

async function loadShopDetail(shopId) {
  // Load shop info
  const shopRes = await API.get(`/shops/${shopId}`);
  const shop = shopRes.success ? shopRes.data : null;

  if (!shop) {
    loadFallbackShop(shopId);
    return;
  }

  renderShopBanner(shop);

  // Load products
  const grid = document.getElementById('productGrid');
  createSkeletonCards(4, grid);

  const prodRes = await API.get(`/products/shop/${shopId}`);
  clearSkeletons(grid);

  const products = prodRes.success && prodRes.data ? prodRes.data : [];

  document.getElementById('productsTitle').textContent = `Products from ${shop.name}`;
  document.getElementById('productsSubtitle').textContent = `${products.length} items available`;

  if (products.length === 0) {
    grid.innerHTML = `<div class="no-results" style="grid-column:1/-1;padding:var(--space-12) 0;">
      <div class="no-results__icon">📦</div>
      <div class="no-results__title">No products yet</div>
      <div class="no-results__desc">This shop hasn't added any products. Check back soon!</div>
    </div>`;
    return;
  }

  renderProducts(products);
}

function renderShopBanner(shop) {
  const banner = document.getElementById('shopBanner');
  if (!banner) return;
  banner.style.backgroundImage = `url('${shop.image || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=400&fit=crop'}')`;

  const info = document.getElementById('shopInfo');
  if (!info) return;
  info.innerHTML = `
    <h1 class="shop-info__name">${shop.name}</h1>
    <div class="shop-info__meta">
      <span class="shop-info__badge">⚡ ${shop.deliveryTime}</span>
      <span class="shop-info__badge">📍 ${shop.distance}</span>
      <span class="shop-info__badge">⭐ ${shop.rating || '4.0'}</span>
      <span class="shop-info__badge">${getCategoryIcon(shop.category)} ${shop.category}</span>
    </div>
    <p class="shop-info__desc">${shop.description || ''}</p>
    ${shop.offer ? `<div style="margin-top:var(--space-3)"><span class="badge badge--offer" style="font-size:var(--fs-sm)">🎁 ${shop.offer}</span></div>` : ''}
  `;

  document.title = `${shop.name} — CampusMart`;
}

function renderProducts(products) {
  const grid = document.getElementById('productGrid');
  if (!grid) return;
  grid.innerHTML = '';

  products.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.setAttribute('data-tilt', '');
    card.innerHTML = `
      <div class="product-card__img-wrap">
        <img class="product-card__img" src="${product.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=200&fit=crop'}" alt="${product.name}" loading="lazy">
      </div>
      <div class="product-card__body">
        <div class="product-card__name">${product.name}</div>
        <div class="product-card__desc">${product.description || ''}</div>
        <div class="product-card__footer">
          <span class="product-card__price">₹${product.price}</span>
          <button class="product-card__add" onclick="addToCart(event, ${JSON.stringify(product).replace(/"/g, '&quot;')})" aria-label="Add to cart">+</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  initTiltCards();
}

function addToCart(e, product) {
  e.stopPropagation();
  const btn = e.currentTarget;
  CartManager.addItem(product);
  btn.classList.add('added');
  btn.innerHTML = '✓';
  setTimeout(() => {
    btn.classList.remove('added');
    btn.innerHTML = '+';
  }, 1200);
}

function loadFallbackShop(shopId) {
  const allMockShops = {
    '1': {
      name: 'Campus Bites',
      category: 'food',
      distance: '150m',
      deliveryTime: '12 mins',
      rating: 4.5,
      description: 'Best burgers and wraps near Gate 1. Student favorite since 2019.',
      offer: '20% off on first order',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=75',
      products: [
        { _id: 'fb1-1', name: 'Classic Burger', price: 89, description: 'Juicy chicken patty with cheese', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=75', shopId: '1' },
        { _id: 'fb1-2', name: 'Paneer Wrap', price: 69, description: 'Grilled paneer with mint chutney', image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&q=75', shopId: '1' },
        { _id: 'fb1-3', name: 'French Fries', price: 49, description: 'Crispy golden fries with dip', image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&q=75', shopId: '1' }
      ]
    },
    '2': {
      name: 'Quick Print Hub',
      category: 'xerox',
      distance: '80m',
      deliveryTime: '5 mins',
      rating: 4.2,
      description: 'Fast printing, scanning & binding. Open till midnight during exams.',
      offer: 'Free binding on 100+ pages',
      image: 'https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?w=400&q=75',
      products: [
        { _id: 'fb2-1', name: 'B&W Print', price: 1, description: 'Per page black and white', image: 'https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?w=400&q=75', shopId: '2' },
        { _id: 'fb2-2', name: 'Color Print', price: 5, description: 'High quality color laser print', image: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=400&q=75', shopId: '2' },
        { _id: 'fb2-3', name: 'Spiral Binding', price: 30, description: 'Up to 200 pages', image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&q=75', shopId: '2' }
      ]
    },
    '3': {
      name: 'Chai Point Cafe',
      category: 'cafe',
      distance: '200m',
      deliveryTime: '8 mins',
      rating: 4.7,
      description: 'Premium coffee & chai. Study-friendly atmosphere with WiFi.',
      offer: 'Buy 2 Get 1 Free',
      image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&q=75',
      products: [
        { _id: 'fb3-1', name: 'Masala Chai', price: 20, description: 'Authentic spice tea', image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400&q=75', shopId: '3' },
        { _id: 'fb3-2', name: 'Cappuccino', price: 79, description: 'Classic Italian coffee', image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&q=75', shopId: '3' },
        { _id: 'fb3-3', name: 'Veg Sandwich', price: 45, description: 'Grilled with cheese', image: 'https://images.unsplash.com/photo-1528736235302-52922df5c122?w=400&q=75', shopId: '3' }
      ]
    },
    '4': {
      name: 'Notebook Nook',
      category: 'stationery',
      distance: '120m',
      deliveryTime: '10 mins',
      rating: 4.3,
      description: 'Complete stationery supplies. Lab coats, drawing sheets & engineering tools.',
      offer: '15% off on lab equipment',
      image: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=400&q=75',
      products: [
        { _id: 'fb4-1', name: 'A4 Notebook', price: 45, description: '200 pages ruled', image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400&q=75', shopId: '4' },
        { _id: 'fb4-2', name: 'Pen Set', price: 25, description: '5 Blue ball pens', image: 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=400&q=75', shopId: '4' },
        { _id: 'fb4-3', name: 'Lab Coat', price: 250, description: 'Cotton, all sizes', image: 'https://images.unsplash.com/photo-1581056771107-24ca5f033842?w=400&q=75', shopId: '4' }
      ]
    },
    '5': {
      name: 'South Express',
      category: 'food',
      distance: '300m',
      deliveryTime: '18 mins',
      rating: 4.6,
      description: 'Authentic South Indian meals. Unlimited thali for just ₹80.',
      offer: 'Free dessert with thali',
      image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=75',
      products: [
        { _id: 'fb5-1', name: 'Masala Dosa', price: 40, description: 'Crispy with sambar', image: 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=400&q=75', shopId: '5' },
        { _id: 'fb5-2', name: 'Unlimited Thali', price: 80, description: 'Full meal', image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=75', shopId: '5' }
      ]
    },
    '6': {
      name: 'Brew & Code',
      category: 'cafe',
      distance: '250m',
      deliveryTime: '10 mins',
      rating: 4.8,
      description: 'Coworking cafe with power outlets. Best cold brew in campus.',
      offer: 'Student card = 10% off',
      image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=75',
      products: [
        { _id: 'fb6-1', name: 'Cold Brew', price: 99, description: '16hr slow-brewed', image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=75', shopId: '6' },
        { _id: 'fb6-2', name: 'Avocado Toast', price: 89, description: 'Fresh sourdough', image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400&q=75', shopId: '6' }
      ]
    },
    '7': {
      name: 'Copy Corner',
      category: 'xerox',
      distance: '350m',
      deliveryTime: '7 mins',
      rating: 4.0,
      description: 'Color printing specialists. Poster printing & spiral binding.',
      offer: 'Bulk copy @ ₹0.30/page',
      image: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=400&q=75',
      products: [
        { _id: 'fb7-1', name: 'Poster Print', price: 50, description: 'A3 Size gloss', image: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=400&q=75', shopId: '7' }
      ]
    },
    '8': {
      name: 'The Art Store',
      category: 'stationery',
      distance: '180m',
      deliveryTime: '12 mins',
      rating: 4.4,
      description: 'Art supplies, drafting tools, and premium pens.',
      offer: 'Flat 25% on Faber-Castell',
      image: 'https://images.unsplash.com/photo-1452860606245-08b6e28ea329?w=400&q=75',
      products: [
        { _id: 'fb8-1', name: 'Sketchbook', price: 120, description: 'A4 150GSM paper', image: 'https://images.unsplash.com/photo-1452860606245-08b6e28ea329?w=400&q=75', shopId: '8' },
        { _id: 'fb8-2', name: 'Premium Art Book', price: 499, description: 'History of Renaissance Art (Hardcover)', image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=75', shopId: '8' }
      ]
    }
  };

  const shop = allMockShops[shopId] || allMockShops['1'];
  renderShopBanner(shop);

  document.getElementById('productsTitle').textContent = `Products from ${shop.name}`;
  document.getElementById('productsSubtitle').textContent = `${shop.products.length} items available`;
  renderProducts(shop.products);
}
