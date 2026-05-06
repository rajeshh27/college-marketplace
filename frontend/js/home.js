/* ============================================
   HOMEPAGE — Three.js Hero + Dynamic Content
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initCommon('home');
  initHeroScene();
  loadNearbyShops();
  initHeroSearch();
});

/* ── Three.js Hero Scene ─────────────────── */
function initHeroScene() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 30;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Floating shapes
  const shapes = [];
  const colors = [0xFF5A3C, 0xFF7A59, 0xFF9A3C, 0x6C63FF, 0x00BFA6, 0xFFD93D];

  // Create various geometries
  const geometries = [
    new THREE.IcosahedronGeometry(1, 0),
    new THREE.TorusGeometry(0.7, 0.3, 8, 12),
    new THREE.BoxGeometry(1, 1, 1),
  ];

  const count = window.innerWidth < 768 ? 15 : 25; // Adaptive count
  for (let i = 0; i < count; i++) {
    const geo = geometries[Math.floor(Math.random() * geometries.length)];
    const mat = new THREE.MeshPhongMaterial({
      color: colors[Math.floor(Math.random() * colors.length)],
      transparent: true,
      opacity: 0.2,
      wireframe: Math.random() > 0.7,
      shininess: 40
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(
      (Math.random() - 0.5) * 40,
      (Math.random() - 0.5) * 30,
      (Math.random() - 0.5) * 20
    );
    const s = 0.5 + Math.random() * 1.5;
    mesh.scale.set(s, s, s);
    mesh.userData = {
      rotSpeed: { x: (Math.random() - 0.5) * 0.015, y: (Math.random() - 0.5) * 0.015 },
      floatSpeed: 0.2 + Math.random() * 0.5,
      floatOffset: Math.random() * Math.PI * 2,
      baseY: mesh.position.y
    };
    shapes.push(mesh);
    scene.add(mesh);
  }

  // Particle field
  const pGeo = new THREE.BufferGeometry();
  const pCount = window.innerWidth < 768 ? 80 : 150; // Optimized count
  const positions = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 50;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const pMat = new THREE.PointsMaterial({ color: 0xFF5A3C, size: 0.06, transparent: true, opacity: 0.4 });
  const particles = new THREE.Points(pGeo, pMat);
  scene.add(particles);

  // Lights
  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);
  const point1 = new THREE.PointLight(0xFF5A3C, 1.5, 50);
  point1.position.set(10, 10, 15);
  scene.add(point1);
  const point2 = new THREE.PointLight(0x6C63FF, 1, 50);
  point2.position.set(-10, -10, 10);
  scene.add(point2);

  // Mouse parallax
  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', e => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // Optimization: Only animate when in view
  let isVisible = true;
  const observer = new IntersectionObserver((entries) => {
    isVisible = entries[0].isIntersecting;
  }, { threshold: 0.1 });
  const heroEl = document.querySelector('.hero');
  if (heroEl) observer.observe(heroEl);

  function animate() {
    requestAnimationFrame(animate);
    if (!isVisible) return; // Pause rendering if not visible
    
    const time = Date.now() * 0.001;

    shapes.forEach(mesh => {
      mesh.rotation.x += mesh.userData.rotSpeed.x;
      mesh.rotation.y += mesh.userData.rotSpeed.y;
      mesh.position.y = mesh.userData.baseY + Math.sin(time * mesh.userData.floatSpeed + mesh.userData.floatOffset) * 1.5;
    });

    particles.rotation.y += 0.0003;
    particles.rotation.x += 0.0001;

    camera.position.x += (mouseX * 3 - camera.position.x) * 0.03;
    camera.position.y += (-mouseY * 2 - camera.position.y) * 0.03;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }
  animate();

  // Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

/* ── Load Nearby Shops ───────────────────── */
async function loadNearbyShops() {
  const container = document.getElementById('nearbyShops');
  if (!container) return;

  // Show skeleton
  for (let i = 0; i < 4; i++) {
    const skel = document.createElement('div');
    skel.className = 'skeleton';
    skel.style.cssText = 'flex:0 0 300px;height:300px;border-radius:var(--radius-lg);';
    container.appendChild(skel);
  }

  const res = await API.get('/shops');
  container.innerHTML = '';

  const shops = res.success && res.data ? res.data : getFallbackShops();

  shops.forEach(shop => {
    const card = document.createElement('div');
    card.className = 'shop-card';
    card.setAttribute('data-tilt', '');
    card.onclick = () => navigateTo(`shop-detail.html?id=${shop._id || shop.id}`);
    card.innerHTML = `
      <div class="shop-card__img-wrap">
        <img class="shop-card__img" src="${shop.image || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop'}" alt="${shop.name}" loading="lazy">
        <span class="shop-card__category" style="background:${getCategoryColor(shop.category)}">${getCategoryIcon(shop.category)} ${shop.category}</span>
      </div>
      <div class="shop-card__body">
        <div class="shop-card__name">${shop.name}</div>
        <div class="shop-card__meta">
          <span class="badge badge--delivery">⚡ ${shop.deliveryTime}</span>
          <span class="badge badge--distance">📍 ${shop.distance}</span>
        </div>
        ${shop.offer ? `<div style="margin-top:var(--space-3)"><span class="badge badge--offer">🎁 ${shop.offer}</span></div>` : ''}
      </div>
    `;
    container.appendChild(card);
  });

  // Load offers
  loadOffers(shops.filter(s => s.offer));
  initTiltCards();
}

/* ── Load Offers ─────────────────────────── */
function loadOffers(shopsWithOffers) {
  const grid = document.getElementById('offersGrid');
  if (!grid) return;

  const iconMap = { food: '🍔', xerox: '📄', cafe: '☕', stationery: '✏️' };

  if (shopsWithOffers.length === 0) shopsWithOffers = getFallbackShops().filter(s => s.offer);

  shopsWithOffers.slice(0, 6).forEach(shop => {
    const card = document.createElement('div');
    card.className = 'offer-card';
    card.setAttribute('data-animate', '');
    card.innerHTML = `
      <div class="offer-card__icon">${iconMap[shop.category] || '🎁'}</div>
      <div class="offer-card__shop">${shop.name}</div>
      <div class="offer-card__deal">${shop.offer}</div>
      <div class="offer-card__desc">${shop.description || ''}</div>
    `;
    grid.appendChild(card);
  });
  initScrollAnimations();
}

/* ── Hero Search ─────────────────────────── */
function initHeroSearch() {
  const input = document.getElementById('heroSearch');
  if (!input) return;
  let debounce;
  input.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      const q = input.value.trim();
      if (q.length >= 2) {
        navigateTo(`shops.html?search=${encodeURIComponent(q)}`);
      }
    }, 500);
  });
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const q = input.value.trim();
      if (q) navigateTo(`shops.html?search=${encodeURIComponent(q)}`);
    }
  });
}

/* ── Fallback Data ───────────────────────── */
function getFallbackShops() {
  return [
    { id: '1', name: 'Campus Bites', category: 'food', distance: '150m', deliveryTime: '12 mins', rating: 4.5, offer: '20% off first order', description: 'Best burgers near Gate 1', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=75' },
    { id: '2', name: 'Quick Print Hub', category: 'xerox', distance: '80m', deliveryTime: '5 mins', rating: 4.2, offer: 'Free binding 100+ pages', description: 'Fast printing & scanning', image: 'https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?w=400&q=75' },
    { id: '3', name: 'Chai Point Cafe', category: 'cafe', distance: '200m', deliveryTime: '8 mins', rating: 4.7, offer: 'Buy 2 Get 1 Free', description: 'Premium coffee & chai', image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&q=75' },
    { id: '4', name: 'Notebook Nook', category: 'stationery', distance: '120m', deliveryTime: '10 mins', rating: 4.3, offer: '15% off lab equipment', description: 'Complete stationery supplies', image: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=400&q=75' },
    { id: '5', name: 'South Express', category: 'food', distance: '300m', deliveryTime: '18 mins', rating: 4.6, offer: 'Free dessert with thali', description: 'Authentic South Indian meals', image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=75' },
    { id: '6', name: 'Brew & Code', category: 'cafe', distance: '250m', deliveryTime: '10 mins', rating: 4.8, offer: 'Student card = 10% off', description: 'Coworking cafe', image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=75' },
  ];
}
