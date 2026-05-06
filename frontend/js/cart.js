/* ============================================
   CART PAGE — Render cart, quantity, checkout
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initCommon('cart');
  renderCart();
});

function renderCart() {
  const items = CartManager.getCart();
  const container = document.getElementById('cartItems');
  const summary = document.getElementById('cartSummary');

  if (items.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty__icon">🛒</div>
        <div class="cart-empty__title">Your cart is empty</div>
        <div class="cart-empty__desc">Browse shops and add some items!</div>
        <a href="shops.html" class="btn btn--primary btn--lg">Browse Shops</a>
      </div>
    `;
    summary.innerHTML = '';
    document.getElementById('cartSubtitle').textContent = 'No items in your cart';
    return;
  }

  document.getElementById('cartSubtitle').textContent = `${CartManager.getCount()} items in your cart`;

  // Render items
  container.innerHTML = items.map(item => `
    <div class="cart-item" data-id="${item._id}">
      <img class="cart-item__img" src="${item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop'}" alt="${item.name}">
      <div class="cart-item__info">
        <div class="cart-item__name">${item.name}</div>
        <div class="cart-item__price">₹${item.price}</div>
      </div>
      <div class="cart-item__qty">
        <button class="cart-item__qty-btn" onclick="changeQty('${item._id}', -1)">−</button>
        <span class="cart-item__qty-num">${item.quantity}</span>
        <button class="cart-item__qty-btn" onclick="changeQty('${item._id}', 1)">+</button>
      </div>
      <button class="cart-item__remove" onclick="removeItem('${item._id}')" aria-label="Remove">🗑️</button>
    </div>
  `).join('');

  // Render summary
  const subtotal = CartManager.getTotal();
  const deliveryFee = subtotal > 200 ? 0 : 20;
  const total = subtotal + deliveryFee;

  summary.innerHTML = `
    <div class="cart-summary__title">Order Summary</div>
    <div class="cart-summary__row">
      <span>Subtotal (${CartManager.getCount()} items)</span>
      <span>₹${subtotal}</span>
    </div>
    <div class="cart-summary__row">
      <span>Delivery Fee</span>
      <span>${deliveryFee === 0 ? '<span style="color:#00BFA6;font-weight:600;">FREE</span>' : '₹' + deliveryFee}</span>
    </div>
    ${deliveryFee === 0 ? '<div class="cart-summary__row" style="color:#00BFA6;font-size:var(--fs-xs);">🎉 Free delivery on orders above ₹200!</div>' : ''}
    <div class="cart-summary__row cart-summary__row--total">
      <span>Total</span>
      <span>₹${total}</span>
    </div>
    <div class="cart-summary__checkout">
      <a href="checkout.html" class="btn btn--primary btn--lg btn--full">Proceed to Checkout →</a>
    </div>
  `;
}

function changeQty(id, delta) {
  const cart = CartManager.getCart();
  const item = cart.find(i => i._id === id);
  if (item) {
    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      removeItem(id);
      return;
    }
    CartManager.updateQuantity(id, newQty);
    renderCart();
  }
}

function removeItem(id) {
  CartManager.removeItem(id);
  renderCart();
  Toast.show('Item removed from cart', 'info');
}
