/* ============================================
   PROFESSIONAL PROFILE — Order History & Tracking
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initCommon('profile');
  
  const savedPhone = localStorage.getItem('user_phone');
  if (savedPhone) {
    loadMyOrders(savedPhone);
  }
});

async function loadMyOrders(phone) {
  const phoneInput = phone || document.getElementById('trackPhone').value.trim();
  if (!phoneInput || phoneInput.length < 10) {
    Toast.show('Please enter a valid phone number', 'error');
    return;
  }

  // UI state
  document.getElementById('loginGate').classList.add('hidden');
  const profileContent = document.getElementById('profileContent');
  profileContent.classList.remove('hidden');
  document.getElementById('userPhoneDisplay').textContent = phoneInput;
  document.getElementById('userInitial').textContent = phoneInput.substring(0, 1);

  const ongoingList = document.getElementById('ongoingOrders');
  const historyList = document.getElementById('historyOrders');
  
  ongoingList.innerHTML = '<div class="skeleton" style="height:200px;"></div>';
  historyList.innerHTML = '<div class="skeleton" style="height:150px;"></div>';

  const res = await API.get(`/orders/user/${phoneInput}`, true);
  
  if (res.success) {
    localStorage.setItem('user_phone', phoneInput);
    
    const ongoing = res.data.filter(o => o.status !== 'delivered');
    const history = res.data.filter(o => o.status === 'delivered');

    renderGroupedOrders(ongoing, ongoingList, true);
    renderGroupedOrders(history, historyList, false);
  }
}

function renderGroupedOrders(orders, container, isOngoing) {
  if (orders.length === 0) {
    container.innerHTML = `<div class="no-results__desc" style="padding:var(--space-6);">No ${isOngoing ? 'active' : 'past'} orders found.</div>`;
    return;
  }

  container.innerHTML = orders.map(order => {
    const date = new Date(order.createdAt).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
    
    // Timeline Logic
    const steps = ['pending', 'confirmed', 'delivered'];
    const currentStepIdx = steps.indexOf(order.status);
    
    const timelineHtml = steps.map((step, idx) => {
      const activeClass = idx <= currentStepIdx ? 'step--active' : '';
      return `
        <div class="timeline-step ${activeClass}">
          <div class="timeline-dot"></div>
          <div class="timeline-label" style="text-transform:capitalize;">${step}</div>
        </div>
      `;
    }).join('');

    return `
      <div class="order-item-pro" data-animate>
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:var(--space-4);">
          <div>
            <div style="font-size:var(--fs-xs); color:var(--text-muted); text-transform:uppercase; letter-spacing:1px;">Order #${order._id.slice(-8).toUpperCase()}</div>
            <div style="font-weight:var(--fw-bold); margin-top:2px;">${order.shopId?.name || 'Campus Mart Store'}</div>
          </div>
          <div style="text-align:right;">
            <div style="font-weight:var(--fw-bold); color:var(--primary);">₹${order.totalAmount}</div>
            <div style="font-size:var(--fs-xs); color:var(--text-muted);">${date}</div>
          </div>
        </div>

        <div style="font-size:var(--fs-sm); color:var(--text-secondary); margin-bottom:var(--space-6);">
          ${order.items.map(item => `${item.name} (x${item.quantity})`).join(', ')}
        </div>

        ${isOngoing ? `<div class="order-timeline">${timelineHtml}</div>` : 
          `<div style="display:flex; align-items:center; gap:var(--space-2); color:#008B72; font-size:var(--fs-sm); font-weight:var(--fw-bold);">
            <span>✓</span> Successfully Delivered on ${date}
          </div>`
        }
      </div>
    `;
  }).join('');
  
  initScrollAnimations();
}

function logoutUser() {
  localStorage.removeItem('user_phone');
  location.reload();
}
