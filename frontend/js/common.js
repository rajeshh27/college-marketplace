/* ============================================
   CAMPUS MARKETPLACE — COMMON JS
   Theme, Cart, Navigation, Utilities
   ============================================ */

const API_BASE = window.location.origin + '/api';

/* ── Theme Manager ───────────────────────── */
const ThemeManager = {
  init() {
    const saved = localStorage.getItem('cm-theme') || 'light';
    this.set(saved);
    const btn = document.getElementById('themeToggle');
    if (btn) btn.addEventListener('click', () => this.toggle());
  },
  set(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('cm-theme', theme);
    const btn = document.getElementById('themeToggle');
    if (btn) btn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
  },
  toggle() {
    const current = document.documentElement.getAttribute('data-theme');
    this.set(current === 'dark' ? 'light' : 'dark');
  },
  get() {
    return document.documentElement.getAttribute('data-theme') || 'light';
  }
};

/* ── Cart Manager ────────────────────────── */
const CartManager = {
  getCart() {
    return JSON.parse(localStorage.getItem('cm-cart') || '[]');
  },
  saveCart(cart) {
    localStorage.setItem('cm-cart', JSON.stringify(cart));
    this.updateBadge();
  },
  addItem(product) {
    const cart = this.getCart();
    const existing = cart.find(i => i._id === product._id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    this.saveCart(cart);
    Toast.show('Added to cart!', 'success');
    this.animateCartIcon();
  },
  removeItem(productId) {
    let cart = this.getCart();
    cart = cart.filter(i => i._id !== productId);
    this.saveCart(cart);
  },
  updateQuantity(productId, qty) {
    const cart = this.getCart();
    const item = cart.find(i => i._id === productId);
    if (item) {
      item.quantity = Math.max(1, qty);
      if (item.quantity <= 0) {
        this.removeItem(productId);
        return;
      }
    }
    this.saveCart(cart);
  },
  getTotal() {
    return this.getCart().reduce((sum, i) => sum + i.price * i.quantity, 0);
  },
  getCount() {
    return this.getCart().reduce((sum, i) => sum + i.quantity, 0);
  },
  clear() {
    localStorage.removeItem('cm-cart');
    this.updateBadge();
  },
  updateBadge() {
    const badges = document.querySelectorAll('.cart-badge');
    const count = this.getCount();
    badges.forEach(b => {
      b.textContent = count;
      b.classList.toggle('show', count > 0);
    });
  },
  animateCartIcon() {
    const btn = document.querySelector('.cart-btn');
    if (btn) {
      btn.style.transform = 'scale(1.3)';
      setTimeout(() => btn.style.transform = 'scale(1)', 200);
    }
  }
};

/* ── Toast Notifications ─────────────────── */
const Toast = {
  show(message, type = 'info', duration = 3000) {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const icons = { success: '✅', error: '❌', info: 'ℹ️' };
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.innerHTML = `<span>${icons[type] || ''}</span><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(120%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
};

/* ── API Helpers ──────────────────────────── */
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes cache
const API = {
  async get(endpoint, forceRefresh = false) {
    const cacheKey = `api_cache_${endpoint}`;
    if (!forceRefresh) {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { timestamp, data } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TTL) {
          return data;
        }
      }
    }

    try {
      const res = await fetch(`${API_BASE}${endpoint}`);
      const data = await res.json();
      if (data.success) {
        localStorage.setItem(cacheKey, JSON.stringify({
          timestamp: Date.now(),
          data: data
        }));
      }
      return data;
    } catch (err) {
      console.error('API GET Error:', err);
      return { success: false, data: [] };
    }
  },
  async post(endpoint, body) {
    this.clearCache();
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      return await res.json();
    } catch (err) {
      console.error('API POST Error:', err);
      return { success: false };
    }
  },
  async put(endpoint, body) {
    this.clearCache();
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      return await res.json();
    } catch (err) {
      console.error('API PUT Error:', err);
      return { success: false };
    }
  },
  async delete(endpoint) {
    this.clearCache();
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, { method: 'DELETE' });
      return await res.json();
    } catch (err) {
      console.error('API DELETE Error:', err);
      return { success: false };
    }
  },
  clearCache() {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('api_cache_')) localStorage.removeItem(key);
    });
  }
};

/* ── Page Navigation ─────────────────────── */
function navigateTo(url) {
  const overlay = document.querySelector('.page-transition');
  if (overlay) {
    overlay.classList.add('active');
    setTimeout(() => { window.location.href = url; }, 300);
  } else {
    window.location.href = url;
  }
}

/* ── Card Tilt Effect ────────────────────── */
function initTiltCards() {
  document.querySelectorAll('[data-tilt]').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
      card.style.transition = 'transform 0.5s ease';
    });
    card.addEventListener('mouseenter', () => {
      card.style.transition = 'none';
    });
  });
}

/* ── Scroll-to-Top ───────────────────────── */
function initScrollTop() {
  const btn = document.querySelector('.scroll-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 400);
  });
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ── Mobile Nav ──────────────────────────── */
function initMobileNav() {
  const menuBtn = document.querySelector('.navbar__menu-btn');
  const mobileNav = document.querySelector('.mobile-nav');
  const closeBtn = document.querySelector('.mobile-nav__close');
  if (!menuBtn || !mobileNav) return;
  menuBtn.addEventListener('click', () => mobileNav.classList.add('open'));
  if (closeBtn) closeBtn.addEventListener('click', () => mobileNav.classList.remove('open'));
  mobileNav.querySelectorAll('.mobile-nav__link').forEach(l => {
    l.addEventListener('click', () => mobileNav.classList.remove('open'));
  });
}

/* ── Intersection Observer for Animations ── */
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
}

/* ── Skeleton Loader ─────────────────────── */
function createSkeletonCards(count, container) {
  for (let i = 0; i < count; i++) {
    const skel = document.createElement('div');
    skel.className = 'skeleton skeleton--card';
    container.appendChild(skel);
  }
}
function clearSkeletons(container) {
  container.querySelectorAll('.skeleton').forEach(s => s.remove());
}

/* ── Category Helpers ────────────────────── */
function getCategoryIcon(cat) {
  const icons = { food: '🍔', xerox: '📄', cafe: '☕', stationery: '✏️' };
  return icons[cat] || '🏪';
}
function getCategoryColor(cat) {
  const colors = {
    food: 'var(--cat-food)',
    xerox: 'var(--cat-xerox)',
    cafe: 'var(--cat-cafe)',
    stationery: 'var(--cat-stationery)'
  };
  return colors[cat] || 'var(--primary)';
}

/* ── Render Navbar ───────────────────────── */
function renderNavbar(activePage) {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  nav.innerHTML = `
    <div class="navbar__inner">
      <a href="index.html" class="navbar__brand" onclick="navigateTo('index.html'); return false;">
        <div class="navbar__brand-icon">🏪</div>
        <span>CampusMart</span>
      </a>
      
      <div class="navbar__search search-bar">
        <span class="search-bar__icon">🔍</span>
        <input type="text" class="search-bar__input" id="navSearch" placeholder="Search shops..." autocomplete="off">
      </div>

      <nav class="navbar__links">
        <a href="index.html" class="navbar__link ${activePage === 'home' ? 'active' : ''}">Home</a>
        <a href="shops.html" class="navbar__link ${activePage === 'shops' ? 'active' : ''}">Shops</a>
        <a href="admin.html" class="navbar__link ${activePage === 'admin' ? 'active' : ''}">Admin</a>
      </nav>
      <div class="navbar__actions">
        <button class="theme-toggle" id="themeToggle" aria-label="Toggle theme">🌙</button>
        <a href="profile.html" class="profile-btn ${activePage === 'profile' ? 'active' : ''}" aria-label="Profile">👤</a>
        <a href="cart.html" class="cart-btn" aria-label="Cart">
          🛒
          <span class="cart-badge">0</span>
        </a>
        <button class="navbar__menu-btn" aria-label="Menu">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
  `;

  // Init nav search
  const input = document.getElementById('navSearch');
  if (input) {
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const q = input.value.trim();
        if (q) navigateTo(`shops.html?search=${encodeURIComponent(q)}`);
      }
    });
  }
}

/* ── Render Footer ───────────────────────── */
function renderFooter() {
  const footer = document.getElementById('footer');
  if (!footer) return;
  footer.innerHTML = `
    <div class="container">
      <div class="footer__grid">
        <div>
          <div class="footer__brand">🏪 CampusMart</div>
          <p class="footer__desc">Your hyperlocal campus marketplace. Discover nearby shops, browse products, and order with lightning-fast delivery.</p>
        </div>
        <div>
          <div class="footer__title">Quick Links</div>
          <a href="index.html" class="footer__link">Home</a>
          <a href="shops.html" class="footer__link">Browse Shops</a>
          <a href="about.html" class="footer__link">About Us</a>
          <a href="contact.html" class="footer__link">Contact</a>
        </div>
        <div>
          <div class="footer__title">Categories</div>
          <a href="shops.html?cat=food" class="footer__link">🍔 Food</a>
          <a href="shops.html?cat=xerox" class="footer__link">📄 Xerox</a>
          <a href="shops.html?cat=cafe" class="footer__link">☕ Cafes</a>
          <a href="shops.html?cat=stationery" class="footer__link">✏️ Stationery</a>
        </div>
        <div>
          <div class="footer__title">Contact</div>
          <p class="footer__link">📧 support@campusmart.in</p>
          <p class="footer__link">📱 +91 98765 43210</p>
          <p class="footer__link">🏫 ACET Campus</p>
        </div>
      </div>
      <div class="footer__bottom">
        <span>© 2026 CampusMart. Built for students, by students.</span>
        <span>Made with ❤️ on campus</span>
      </div>
    </div>
  `;
}

/* ── Render Mobile Nav ───────────────────── */
function renderMobileNav() {
  const existing = document.querySelector('.mobile-nav');
  if (existing) return;
  const nav = document.createElement('div');
  nav.className = 'mobile-nav';
  nav.innerHTML = `
    <button class="mobile-nav__close">&times;</button>
    <a href="index.html" class="mobile-nav__link">Home</a>
    <a href="shops.html" class="mobile-nav__link">Shops</a>
    <a href="profile.html" class="mobile-nav__link">My Orders</a>
    <a href="cart.html" class="mobile-nav__link">Cart</a>
    <a href="admin.html" class="mobile-nav__link">Admin</a>
  `;
  document.body.appendChild(nav);
}

/* ── Init Mobile Nav Toggle ─────────────── */
function initMobileNav() {
  const menuBtn = document.querySelector('.navbar__menu-btn');
  const mobileNav = document.querySelector('.mobile-nav');
  const closeBtn = document.querySelector('.mobile-nav__close');
  if (!menuBtn || !mobileNav) return;

  menuBtn.addEventListener('click', () => {
    mobileNav.classList.add('open');
  });
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      mobileNav.classList.remove('open');
    });
  }
  // Close on link click
  mobileNav.querySelectorAll('.mobile-nav__link').forEach(link => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('open');
    });
  });
}

/* ── Global Init ─────────────────────────── */
function initCommon(activePage) {
  renderNavbar(activePage);
  renderFooter();
  renderMobileNav();
  ThemeManager.init();
  CartManager.updateBadge();
  initScrollTop();
  initMobileNav();
  initTiltCards();
  initScrollAnimations();

  // Add page transition overlay
  if (!document.querySelector('.page-transition')) {
    const overlay = document.createElement('div');
    overlay.className = 'page-transition';
    document.body.appendChild(overlay);
  }
  // Add scroll-top button
  if (!document.querySelector('.scroll-top')) {
    const btn = document.createElement('button');
    btn.className = 'scroll-top';
    btn.innerHTML = '↑';
    btn.setAttribute('aria-label', 'Scroll to top');
    document.body.appendChild(btn);
    initScrollTop();
  }
}
