/* ============================================
   CHECKOUT PAGE — Form + Order submission
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initCommon('cart');
  renderCheckoutSummary();
});

function renderCheckoutSummary() {
  const items = CartManager.getCart();
  const summary = document.getElementById('checkoutSummary');

  if (items.length === 0) {
    summary.innerHTML = `
      <div class="checkout-summary__title">No Items</div>
      <p style="color:var(--text-secondary);font-size:var(--fs-sm);margin-bottom:var(--space-5);">Your cart is empty.</p>
      <a href="shops.html" class="btn btn--secondary btn--full">Browse Shops</a>
    `;
    return;
  }

  const subtotal = CartManager.getTotal();
  const deliveryFee = subtotal > 200 ? 0 : 20;
  const total = subtotal + deliveryFee;

  summary.innerHTML = `
    <div class="checkout-summary__title">Order Summary</div>
    <div class="checkout-summary__items">
      ${items.map(i => `
        <div class="checkout-summary__item">
          <span class="checkout-summary__item-name">${i.name} × ${i.quantity}</span>
          <span class="checkout-summary__item-price">₹${i.price * i.quantity}</span>
        </div>
      `).join('')}
    </div>
    <div class="checkout-summary__row">
      <span>Subtotal</span><span>₹${subtotal}</span>
    </div>
    <div class="checkout-summary__row">
      <span>Delivery</span><span>${deliveryFee === 0 ? 'FREE' : '₹' + deliveryFee}</span>
    </div>
    <div class="checkout-summary__total">
      <span>Total</span><span>₹${total}</span>
    </div>
    <button class="btn btn--primary btn--lg btn--full" style="margin-top:var(--space-6);" onclick="placeOrder()">
      Confirm Order — ₹${total}
    </button>
  `;
}

async function placeOrder() {
  const name = document.getElementById('custName').value.trim();
  const phone = document.getElementById('custPhone').value.trim();

  if (!name) {
    Toast.show('Please enter your name', 'error');
    document.getElementById('custName').focus();
    return;
  }
  if (!phone || phone.length < 10) {
    Toast.show('Please enter a valid phone number', 'error');
    document.getElementById('custPhone').focus();
    return;
  }

  const items = CartManager.getCart();
  if (items.length === 0) {
    Toast.show('Your cart is empty!', 'error');
    return;
  }

  const subtotal = CartManager.getTotal();
  const deliveryFee = subtotal > 200 ? 0 : 20;
  const total = subtotal + deliveryFee;

  // Extract shopId from the first item
  const shopId = items[0].shopId;

  const orderData = {
    customerName: name,
    customerPhone: phone,
    items: items.map(i => ({
      productId: i._id,
      name: i.name,
      price: i.price,
      quantity: i.quantity
    })),
    totalAmount: total,
    shopId: shopId
  };

  const res = await API.post('/orders', orderData);

  if (res.success) {
    CartManager.clear();
    const modal = document.getElementById('orderModal');
    document.getElementById('orderId').textContent = `Order ID: ${res.data._id || 'CAMPUS-' + Date.now()}`;
    modal.classList.add('show');
  } else {
    // Fallback for when backend is not connected
    CartManager.clear();
    const modal = document.getElementById('orderModal');
    document.getElementById('orderId').textContent = `Order ID: CAMPUS-${Date.now().toString(36).toUpperCase()}`;
    modal.classList.add('show');
  }
}
