/**
 * TripMate Client-Side Application Engine
 * Orchestrates API Communications, RBAC State, UI Rendering, and Real-Time Feedback
 */

// Global Application State
const state = {
  token: localStorage.getItem('tripmate_token') || null,
  currentUser: null,
  trips: [],
  activeTripId: null,
  activeTrip: null,
  activeTab: 'overview',
  activeDayFilter: 'all',
  availableUsers: []
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', async () => {
  setupEventListeners();
  await checkSession();
});

// --- API Client Helpers ---
async function api(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(state.token && { 'Authorization': `Bearer ${state.token}` }),
    ...options.headers
  };

  try {
    const response = await fetch(endpoint, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401 && endpoint !== '/api/auth/login' && endpoint !== '/api/auth/register') {
        showToast('Session expired. Please sign in again.', '⚠️');
        handleLogout();
      }
      throw new Error(data.error || `HTTP ${response.status} Error`);
    }

    return data;
  } catch (err) {
    console.error(`API Error [${endpoint}]:`, err.message);
    throw err;
  }
}

// --- Session & Real-Time Auth Engine ---
async function checkSession() {
  if (!state.token) {
    showAuthPortal();
    return;
  }

  try {
    const res = await api('/api/auth/me');
    state.currentUser = res.user;
    showAppView();
    await loadTrips();
    await loadAvailableUsers();
  } catch (err) {
    console.warn('Session verification failed:', err.message);
    localStorage.removeItem('tripmate_token');
    state.token = null;
    state.currentUser = null;
    showAuthPortal();
  }
}

function showAuthPortal() {
  const portal = document.getElementById('authPortal');
  const app = document.getElementById('app');
  if (portal) portal.style.display = 'flex';
  if (app) app.style.display = 'none';
}

function showAppView() {
  const portal = document.getElementById('authPortal');
  const app = document.getElementById('app');
  if (portal) portal.style.display = 'none';
  if (app) app.style.display = 'block';

  if (state.currentUser) {
    const userNameEl = document.getElementById('userName');
    const userEmailEl = document.getElementById('userEmailText');
    const circleEl = document.getElementById('userAvatarCircle');

    if (userNameEl) userNameEl.textContent = state.currentUser.name;
    if (userEmailEl) userEmailEl.textContent = state.currentUser.email;
    if (circleEl) {
      const initials = (state.currentUser.name || 'TM')
        .split(' ')
        .map(n => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
      circleEl.textContent = initials;
    }
  }
}

async function handleLoginSubmit(e) {
  e.preventDefault();
  const alertEl = document.getElementById('loginAlert');
  alertEl.style.display = 'none';
  alertEl.className = 'auth-alert';

  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const submitBtn = document.getElementById('btnSubmitLogin');

  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span>Signing in...</span>';

  try {
    const res = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    state.token = res.token;
    state.currentUser = res.user;
    localStorage.setItem('tripmate_token', res.token);

    showToast(`Welcome back, ${res.user.name}!`, '✨');
    showAppView();
    await loadTrips();
    await loadAvailableUsers();
  } catch (err) {
    alertEl.textContent = err.message || 'Login failed. Please check your credentials.';
    alertEl.className = 'auth-alert error';
    alertEl.style.display = 'block';
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<span>Sign In to TripMate</span>';
  }
}

async function handleRegisterSubmit(e) {
  e.preventDefault();
  const alertEl = document.getElementById('regAlert');
  alertEl.style.display = 'none';
  alertEl.className = 'auth-alert';

  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const confirmPassword = document.getElementById('regConfirmPassword').value;
  const submitBtn = document.getElementById('btnSubmitRegister');

  if (password !== confirmPassword) {
    alertEl.textContent = 'Passwords do not match.';
    alertEl.className = 'auth-alert error';
    alertEl.style.display = 'block';
    return;
  }

  if (password.length < 8) {
    alertEl.textContent = 'Password must be at least 8 characters in length.';
    alertEl.className = 'auth-alert error';
    alertEl.style.display = 'block';
    return;
  }

  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span>Creating account...</span>';

  try {
    const res = await api('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });

    state.token = res.token;
    state.currentUser = res.user;
    localStorage.setItem('tripmate_token', res.token);

    showToast(`Welcome to TripMate, ${res.user.name}!`, '🎉');
    showAppView();
    await loadTrips();
    await loadAvailableUsers();
  } catch (err) {
    alertEl.textContent = err.message || 'Registration failed.';
    alertEl.className = 'auth-alert error';
    alertEl.style.display = 'block';
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<span>Create Account & Get Started</span>';
  }
}

function handleLogout() {
  localStorage.removeItem('tripmate_token');
  state.token = null;
  state.currentUser = null;
  state.trips = [];
  state.activeTrip = null;
  state.activeTripId = null;

  showToast('You have been signed out.', '👋');
  showAuthPortal();
}

async function loadAvailableUsers() {
  try {
    const res = await api('/api/auth/users');
    state.availableUsers = res.users || [];
    populateInviteUserDropdown();
  } catch (_) {}
}

function populateInviteUserDropdown() {
  const select = document.getElementById('inviteUserSelect');
  if (!select) return;
  select.innerHTML = '<option value="">Choose an existing user...</option>';
  state.availableUsers.forEach(u => {
    if (u.id !== state.currentUser?.id) {
      const opt = document.createElement('option');
      opt.value = u.id;
      opt.textContent = `${u.name} (${u.email})`;
      select.appendChild(opt);
    }
  });
}

// --- Trip Loading & Rendering ---
async function loadTrips() {
  try {
    const res = await api('/api/trips');
    state.trips = res.trips || [];

    const tripDropdown = document.getElementById('activeTripSelect');
    const noTripsView = document.getElementById('noTripsView');
    const activeTripView = document.getElementById('activeTripView');
    const userRoleBadge = document.getElementById('userRoleBadge');

    tripDropdown.innerHTML = '';

    if (state.trips.length === 0) {
      tripDropdown.innerHTML = '<option value="" disabled selected>No active trips</option>';
      if (noTripsView) noTripsView.style.display = 'block';
      if (activeTripView) activeTripView.style.display = 'none';
      if (userRoleBadge) userRoleBadge.style.display = 'none';

      if (state.currentUser) {
        const welcomeTitle = document.getElementById('emptyWelcomeTitle');
        const welcomeSubtitle = document.getElementById('emptyWelcomeSubtitle');
        if (welcomeTitle) welcomeTitle.textContent = `Welcome, ${state.currentUser.name}!`;
        if (welcomeSubtitle) welcomeSubtitle.textContent = `You don't have any trips yet. Create your first journey or ask a trip organizer to invite ${state.currentUser.email}.`;
      }
      return;
    }

    if (noTripsView) noTripsView.style.display = 'none';
    if (activeTripView) activeTripView.style.display = 'block';
    if (userRoleBadge) userRoleBadge.style.display = 'inline-block';

    state.trips.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t.id;
      opt.textContent = `${t.title} [${t.userRole.toUpperCase()}]`;
      tripDropdown.appendChild(opt);
    });

    // Preserve or default active trip
    if (!state.activeTripId || !state.trips.some(t => t.id === state.activeTripId)) {
      state.activeTripId = state.trips[0].id;
    }

    tripDropdown.value = state.activeTripId;
    await loadActiveTripDetails(state.activeTripId);

  } catch (err) {
    showToast(`Error loading trips: ${err.message}`, '❌');
  }
}

async function loadActiveTripDetails(tripId) {
  try {
    const res = await api(`/api/trips/${tripId}`);
    state.activeTrip = res.trip;
    renderApp();
  } catch (err) {
    showToast(`Error loading trip: ${err.message}`, '❌');
  }
}

// --- Main App Renderer ---
function renderApp() {
  if (!state.activeTrip) return;
  const trip = state.activeTrip;
  const userRole = trip.userRole || 'viewer';

  // 1. Update Hero Card
  document.getElementById('heroTitle').textContent = trip.title;
  document.getElementById('heroDescription').textContent = trip.description || 'Collaborative itinerary for this journey.';
  document.getElementById('heroDates').textContent = trip.startDate && trip.endDate
    ? `${formatDate(trip.startDate)} - ${formatDate(trip.endDate)}`
    : 'Flexible Dates';

  document.getElementById('heroPrivacyPill').textContent = trip.isPrivate ? '🔒 Private (Members Only)' : '🌍 Shared Collaborative';
  document.getElementById('heroRolePill').textContent = `${getRoleIcon(userRole)} ${userRole.toUpperCase()} ACCESS`;
  document.getElementById('heroRolePill').className = `hero-pill role-pill ${userRole}-badge`;

  document.getElementById('userRoleBadge').textContent = userRole.toUpperCase();

  // Render hero destination tags
  const heroDestWrap = document.getElementById('heroDestinations');
  heroDestWrap.innerHTML = '';
  if (trip.destinations && trip.destinations.length > 0) {
    trip.destinations.forEach(d => {
      const tag = document.createElement('span');
      tag.className = 'dest-pill';
      tag.innerHTML = `📍 ${escapeHtml(d.city || d.name)}`;
      heroDestWrap.appendChild(tag);
    });
  }

  // 2. Access Control (RBAC) Notice & Button Locking
  const rbacNotice = document.getElementById('rbacNotice');
  const isViewer = userRole === 'viewer';

  rbacNotice.style.display = isViewer ? 'flex' : 'none';

  // Apply access control disabled states to buttons
  applyRbacButtonLocking(userRole);

  // 3. Tab Badge Counts
  document.getElementById('destCountBadge').textContent = trip.destinations?.length || 0;
  document.getElementById('itinCountBadge').textContent = trip.itinerary?.length || 0;
  document.getElementById('expCountBadge').textContent = trip.expenses?.length || 0;
  document.getElementById('collabCountBadge').textContent = trip.collaborators?.length || 0;

  // 4. Render Active Tab Content
  renderOverviewTab();
  renderDestinationsTab();
  renderItineraryTab();
  renderExpensesTab();
  renderCollaboratorsTab();
  if (state.activeTab === 'audit') {
    renderAuditTab();
  }
}

function applyRbacButtonLocking(role) {
  const isViewer = role === 'viewer';

  // Elements requiring at least Editor
  const editorReqSelectors = [
    '#quickAddDestBtn', '#btnAddDestinationModal',
    '#btnAddItineraryModal', '#btnAddExpenseModal'
  ];

  editorReqSelectors.forEach(sel => {
    const el = document.querySelector(sel);
    if (el) {
      el.disabled = isViewer;
      el.title = isViewer ? 'Read-only access (Viewer Role)' : '';
      el.classList.toggle('disabled-locked', isViewer);
    }
  });

  // Elements strictly requiring Owner
  const ownerReqSelectors = [
    '#quickInviteBtn', '#btnShareTrip', '#btnInviteMemberModal', '#btnEditTripModal'
  ];

  ownerReqSelectors.forEach(sel => {
    const el = document.querySelector(sel);
    if (el) {
      el.disabled = !isOwner;
      el.title = !isOwner ? 'Owner access required' : '';
      el.classList.toggle('disabled-locked', !isOwner);
    }
  });
}

// --- Tab 1: Overview Renderer ---
function renderOverviewTab() {
  const trip = state.activeTrip;
  const stats = trip.stats || {};
  const totalSpent = stats.totalSpent || 0;
  const budget = trip.budget || 0;
  const remaining = Math.max(0, budget - totalSpent);
  const currency = trip.currency || 'USD';

  document.getElementById('overviewBudget').textContent = `${currency} ${formatCurrency(budget)}`;
  document.getElementById('overviewSpent').textContent = `${currency} ${formatCurrency(totalSpent)}`;
  document.getElementById('overviewRemaining').textContent = `${currency} ${formatCurrency(remaining)}`;

  const doneActivities = stats.completedActivities || 0;
  const totalActivities = stats.itineraryItemCount || 0;
  document.getElementById('overviewTasksProgress').textContent = `${doneActivities} / ${totalActivities} Done`;

  // Budget progress bar
  const pct = budget > 0 ? Math.min(100, Math.round((totalSpent / budget) * 100)) : 0;
  document.getElementById('budgetPercentLabel').textContent = `${pct}% used`;
  const fill = document.getElementById('budgetProgressFill');
  fill.style.width = `${pct}%`;
  fill.style.background = pct > 90
    ? 'linear-gradient(135deg, #f43f5e 0%, #f59e0b 100%)'
    : 'var(--gradient-brand)';

  // Destinations Timeline List
  const timelineList = document.getElementById('overviewTimelineList');
  timelineList.innerHTML = '';
  if (!trip.destinations || trip.destinations.length === 0) {
    timelineList.innerHTML = '<p class="text-muted">No destination stops added yet.</p>';
  } else {
    trip.destinations.forEach(d => {
      const item = document.createElement('div');
      item.className = 'timeline-item';
      item.innerHTML = `
        <div class="timeline-dot"></div>
        <div class="timeline-title">${escapeHtml(d.name)}</div>
        <div class="timeline-dates">${escapeHtml(d.city || '')}${d.country ? ', ' + escapeHtml(d.country) : ''} · ${d.arrivalDate ? formatDate(d.arrivalDate) : 'TBD'}</div>
      `;
      timelineList.appendChild(item);
    });
  }

  // Collaborators List
  const collabList = document.getElementById('overviewCollabList');
  collabList.innerHTML = '';
  if (trip.collaborators) {
    trip.collaborators.forEach(c => {
      const u = c.user;
      if (!u) return;
      const row = document.createElement('div');
      row.className = 'collab-row-item';
      row.innerHTML = `
        <div class="collab-user-wrap">
          <img src="${u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}" class="collab-avatar" alt="${escapeHtml(u.name)}">
          <div>
            <div style="font-weight: 600; font-size: 0.9rem;">${escapeHtml(u.name)}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">${escapeHtml(u.email)}</div>
          </div>
        </div>
        <span class="role-badge ${c.role}-badge">${getRoleIcon(c.role)} ${c.role.toUpperCase()}</span>
      `;
      collabList.appendChild(row);
    });
  }
}

// --- Tab 2: Destinations Renderer ---
function renderDestinationsTab() {
  const trip = state.activeTrip;
  const grid = document.getElementById('destinationsGrid');
  grid.innerHTML = '';

  const canEdit = trip.userRole === 'owner' || trip.userRole === 'editor';

  if (!trip.destinations || trip.destinations.length === 0) {
    grid.innerHTML = '<div class="empty-state"><h3>No Destinations Added</h3><p>Click "Add Destination" to map out your itinerary stops.</p></div>';
    return;
  }

  trip.destinations.forEach((dest, idx) => {
    const card = document.createElement('div');
    card.className = 'destination-card';
    card.innerHTML = `
      <div>
        <div class="dest-card-header">
          <span class="dest-order-num">Stop #${idx + 1}</span>
          ${canEdit ? `
            <div style="display: flex; gap: 4px;">
              <button class="btn-icon btn-delete-dest" data-id="${dest.id}" title="Remove Destination">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          ` : ''}
        </div>
        <h3 class="dest-title">${escapeHtml(dest.name)}</h3>
        <div class="dest-location">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          ${escapeHtml(dest.city || '')}${dest.country ? ', ' + escapeHtml(dest.country) : ''}
        </div>
        ${dest.notes ? `<div class="dest-notes">${escapeHtml(dest.notes)}</div>` : ''}
      </div>
      <div class="dest-card-footer">
        <span>📅 ${dest.arrivalDate ? formatDate(dest.arrivalDate) : 'Date TBD'} ${dest.departureDate ? '→ ' + formatDate(dest.departureDate) : ''}</span>
      </div>
    `;
    grid.appendChild(card);
  });

  // Attach delete handlers
  grid.querySelectorAll('.btn-delete-dest').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (confirm('Are you sure you want to remove this destination stop?')) {
        try {
          await api(`/api/trips/${trip.id}/destinations/${btn.dataset.id}`, { method: 'DELETE' });
          showToast('Destination removed', '🗑️');
          await loadActiveTripDetails(trip.id);
        } catch (err) {
          showToast(err.message, '❌');
        }
      }
    });
  });
}

// --- Tab 3: Itinerary & Tasks Renderer ---
function renderItineraryTab() {
  const trip = state.activeTrip;
  const list = document.getElementById('itineraryList');
  const dayFilterBar = document.getElementById('itineraryDayFilterBar');
  const canEdit = trip.userRole === 'owner' || trip.userRole === 'editor';

  // Build unique days filter
  const items = trip.itinerary || [];
  const uniqueDays = [...new Set(items.map(i => i.dayNumber))].sort((a, b) => a - b);

  dayFilterBar.innerHTML = `<button class="day-chip ${state.activeDayFilter === 'all' ? 'active' : ''}" data-day="all">All Days</button>`;
  uniqueDays.forEach(day => {
    const chip = document.createElement('button');
    chip.className = `day-chip ${state.activeDayFilter === String(day) ? 'active' : ''}`;
    chip.dataset.day = day;
    chip.textContent = `Day ${day}`;
    dayFilterBar.appendChild(chip);
  });

  // Filter items
  const filtered = state.activeDayFilter === 'all'
    ? items
    : items.filter(i => String(i.dayNumber) === state.activeDayFilter);

  list.innerHTML = '';
  if (filtered.length === 0) {
    list.innerHTML = '<div class="empty-state"><h3>No Activities Scheduled</h3><p>Click "Add Activity" to plan events and assign tasks to members.</p></div>';
    return;
  }

  filtered.forEach(item => {
    const card = document.createElement('div');
    card.className = `itinerary-card ${item.isCompleted ? 'completed' : ''}`;

    const assignedUser = item.assignedToUserId && trip.collaborators
      ? trip.collaborators.find(c => c.userId === item.assignedToUserId)?.user
      : null;

    card.innerHTML = `
      <div class="itinerary-left">
        <input type="checkbox" class="itinerary-checkbox" ${item.isCompleted ? 'checked' : ''} ${!canEdit ? 'disabled' : ''} data-id="${item.id}" title="Toggle Completed">
        <div class="itinerary-time-badge">${item.time || `Day ${item.dayNumber}`}</div>
        <div class="itinerary-details">
          <div class="itinerary-title">${escapeHtml(item.title)}</div>
          <div class="itinerary-sub">
            <span>📍 ${escapeHtml(item.location || 'Location TBD')}</span>
            ${item.estimatedCost ? `<span>💵 ~$${item.estimatedCost}</span>` : ''}
            <span>Day ${item.dayNumber}</span>
          </div>
          ${item.notes ? `<div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">📝 ${escapeHtml(item.notes)}</div>` : ''}
        </div>
      </div>
      <div class="itinerary-right">
        ${assignedUser ? `
          <div class="assignee-pill" title="Assigned task assignee">
            <img src="${assignedUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}" class="assignee-avatar-sm" alt="${escapeHtml(assignedUser.name)}">
            <span>${escapeHtml(assignedUser.name)}</span>
          </div>
        ` : '<span style="font-size: 0.78rem; color: var(--text-muted);">Unassigned</span>'}

        ${canEdit ? `
          <button class="btn-icon btn-delete-itin" data-id="${item.id}" title="Delete Activity">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        ` : ''}
      </div>
    `;
    list.appendChild(card);
  });

  // Attach completion toggle handlers
  list.querySelectorAll('.itinerary-checkbox').forEach(cb => {
    cb.addEventListener('change', async () => {
      try {
        await api(`/api/trips/${trip.id}/itinerary/${cb.dataset.id}/status`, { method: 'PATCH' });
        await loadActiveTripDetails(trip.id);
      } catch (err) {
        showToast(err.message, '❌');
      }
    });
  });

  // Attach delete handlers
  list.querySelectorAll('.btn-delete-itin').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (confirm('Delete this scheduled activity?')) {
        try {
          await api(`/api/trips/${trip.id}/itinerary/${btn.dataset.id}`, { method: 'DELETE' });
          showToast('Activity removed', '🗑️');
          await loadActiveTripDetails(trip.id);
        } catch (err) {
          showToast(err.message, '❌');
        }
      }
    });
  });
}

// --- Tab 4: Expenses & Settlements Renderer ---
async function renderExpensesTab() {
  const trip = state.activeTrip;
  const canEdit = trip.userRole === 'owner' || trip.userRole === 'editor';

  // Load calculated settlements
  try {
    const res = await api(`/api/trips/${trip.id}/expenses/settlement-summary`);
    const summary = res.summary || {};

    // 1. Settlement Cards ("Who Owes Whom")
    const settleContainer = document.getElementById('settlementCardsGrid');
    settleContainer.innerHTML = '';
    const settlements = summary.settlements || [];

    if (settlements.length === 0) {
      settleContainer.innerHTML = '<div style="color: var(--accent-emerald); font-size: 0.9rem; padding: 10px;">✨ All group expenses are completely balanced! No pending balances.</div>';
    } else {
      settlements.forEach(s => {
        const card = document.createElement('div');
        card.className = 'settle-card';
        card.innerHTML = `
          <div class="settle-flow">
            <strong>${escapeHtml(s.fromUser?.name || 'User')}</strong>
            <span class="settle-arrow">owes →</span>
            <strong>${escapeHtml(s.toUser?.name || 'User')}</strong>
          </div>
          <div class="settle-amount">${s.currency} $${formatCurrency(s.amount)}</div>
        `;
        settleContainer.appendChild(card);
      });
    }

    // 2. Category Breakdown Pills
    const catContainer = document.getElementById('categoryPills');
    catContainer.innerHTML = '';
    const breakdown = summary.categoryBreakdown || {};
    const categories = Object.keys(breakdown);

    if (categories.length === 0) {
      catContainer.innerHTML = '<span class="text-muted">No expenses recorded yet.</span>';
    } else {
      categories.forEach(cat => {
        const pill = document.createElement('div');
        pill.className = 'category-pill';
        pill.innerHTML = `<span>${getCategoryIcon(cat)} ${escapeHtml(cat)}:</span> <strong>$${formatCurrency(breakdown[cat])}</strong>`;
        catContainer.appendChild(pill);
      });
    }

  } catch (err) {
    console.warn('Could not load settlement summary:', err.message);
  }

  // 3. Render Expenses Table
  const tbody = document.getElementById('expensesTableBody');
  tbody.innerHTML = '';

  const expenses = trip.expenses || [];
  if (expenses.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 24px;">No expenses recorded. Click "Add Expense" to track group costs.</td></tr>';
    return;
  }

  expenses.forEach(exp => {
    const payer = trip.collaborators?.find(c => c.userId === exp.paidByUserId)?.user;
    const splitCount = (exp.splitWithUserIds || []).length;
    const shareAmt = splitCount > 0 ? (Number(exp.amount) / splitCount) : Number(exp.amount);

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${escapeHtml(exp.title)}</strong></td>
      <td><span class="dest-pill">${getCategoryIcon(exp.category)} ${escapeHtml(exp.category)}</span></td>
      <td class="exp-amount-cell">${exp.currency} $${formatCurrency(exp.amount)}</td>
      <td>${escapeHtml(payer?.name || 'Unknown')}</td>
      <td>Split across ${splitCount} member${splitCount !== 1 ? 's' : ''} ($${formatCurrency(shareAmt)} each)</td>
      <td><small style="color: var(--text-muted);">${escapeHtml(exp.receiptNote || '—')}</small></td>
      <td>
        ${canEdit ? `
          <button class="btn-icon btn-delete-exp" data-id="${exp.id}" title="Remove Expense">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        ` : '<span style="color: var(--text-muted); font-size: 0.75rem;">Locked</span>'}
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Attach delete expense handlers
  tbody.querySelectorAll('.btn-delete-exp').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (confirm('Delete this expense entry?')) {
        try {
          await api(`/api/trips/${trip.id}/expenses/${btn.dataset.id}`, { method: 'DELETE' });
          showToast('Expense removed', '🗑️');
          await loadActiveTripDetails(trip.id);
        } catch (err) {
          showToast(err.message, '❌');
        }
      }
    });
  });
}

// --- Tab 5: Collaborators & Role Delegation Renderer ---
function renderCollaboratorsTab() {
  const trip = state.activeTrip;
  const grid = document.getElementById('collaboratorsGrid');
  grid.innerHTML = '';

  const isOwner = trip.userRole === 'owner';

  (trip.collaborators || []).forEach(collab => {
    const u = collab.user;
    if (!u) return;

    const card = document.createElement('div');
    card.className = 'collaborator-card';
    card.innerHTML = `
      <div class="collab-header">
        <img src="${u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}" class="collab-avatar-lg" alt="${escapeHtml(u.name)}">
        <div class="collab-details">
          <span class="collab-name">${escapeHtml(u.name)}</span>
          <span class="collab-email">${escapeHtml(u.email)}</span>
          <span class="role-badge ${collab.role}-badge" style="margin-top: 6px; width: fit-content;">${getRoleIcon(collab.role)} ${collab.role.toUpperCase()}</span>
        </div>
      </div>
      <div class="collab-controls">
        ${isOwner && collab.role !== 'owner' ? `
          <div style="display: flex; align-items: center; gap: 8px;">
            <select class="role-select-box role-change-select" data-userid="${u.id}">
              <option value="editor" ${collab.role === 'editor' ? 'selected' : ''}>Editor</option>
              <option value="viewer" ${collab.role === 'viewer' ? 'selected' : ''}>Viewer</option>
            </select>
          </div>
          <button class="btn btn-danger btn-xs btn-remove-collab" data-userid="${u.id}" title="Remove member">Remove</button>
        ` : `
          <span style="font-size: 0.75rem; color: var(--text-muted);">
            ${collab.role === 'owner' ? 'Trip Creator & Sole Owner' : 'Permission Managed by Owner'}
          </span>
        `}
      </div>
    `;
    grid.appendChild(card);
  });

  // Attach role change listeners
  grid.querySelectorAll('.role-change-select').forEach(sel => {
    sel.addEventListener('change', async () => {
      try {
        await api(`/api/trips/${trip.id}/collaborators/${sel.dataset.userid}`, {
          method: 'PUT',
          body: JSON.stringify({ role: sel.value })
        });
        showToast('Collaborator role updated', '🛡️');
        await loadActiveTripDetails(trip.id);
      } catch (err) {
        showToast(err.message, '❌');
      }
    });
  });

  // Attach remove collaborator listeners
  grid.querySelectorAll('.btn-remove-collab').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (confirm('Are you sure you want to remove this member from the trip?')) {
        try {
          await api(`/api/trips/${trip.id}/collaborators/${btn.dataset.userid}`, { method: 'DELETE' });
          showToast('Member removed from trip', '👋');
          await loadActiveTripDetails(trip.id);
        } catch (err) {
          showToast(err.message, '❌');
        }
      }
    });
  });
}

// --- Tab 6: Security Audit Log Renderer ---
async function renderAuditTab() {
  const trip = state.activeTrip;
  const tbody = document.getElementById('auditTableBody');
  tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Loading security audit logs...</td></tr>';

  try {
    const res = await api(`/api/audit/trips/${trip.id}`);
    const filter = document.getElementById('auditStatusFilter').value;
    let logs = res.logs || [];

    if (filter !== 'ALL') {
      logs = logs.filter(l => l.status === filter);
    }

    tbody.innerHTML = '';
    if (logs.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 20px;">No audit events found for selected filter.</td></tr>';
      return;
    }

    logs.forEach(log => {
      const isBlocked = log.status === 'BLOCKED_403';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><small>${formatDateTime(log.timestamp)}</small></td>
        <td><code>${escapeHtml(log.action)}</code></td>
        <td>${escapeHtml(log.actorEmail || log.actorId)}</td>
        <td>${escapeHtml(log.resourceType || '')}</td>
        <td>
          <span class="audit-status-badge ${isBlocked ? 'status-blocked' : 'status-success'}">
            ${isBlocked ? '🚫 BLOCKED' : '✅ SUCCESS'}
          </span>
        </td>
        <td><code>${escapeHtml(log.ipAddress || '127.0.0.1')}</code></td>
        <td>${escapeHtml(log.details || '')}</td>
      `;
      tbody.appendChild(tr);
    });

  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--accent-rose); padding: 20px;">${escapeHtml(err.message)}</td></tr>`;
  }
}

// --- Event Listeners & Modals Setup ---
function setupEventListeners() {
  // Auth Portal Tabs
  const tabSignIn = document.getElementById('tabBtnSignIn');
  const tabRegister = document.getElementById('tabBtnRegister');
  const formSignIn = document.getElementById('formSignIn');
  const formRegister = document.getElementById('formRegister');

  if (tabSignIn && tabRegister) {
    tabSignIn.addEventListener('click', () => {
      tabSignIn.classList.add('active');
      tabRegister.classList.remove('active');
      formSignIn.style.display = 'flex';
      formRegister.style.display = 'none';
    });

    tabRegister.addEventListener('click', () => {
      tabRegister.classList.add('active');
      tabSignIn.classList.remove('active');
      formRegister.style.display = 'flex';
      formSignIn.style.display = 'none';
    });
  }

  const linkReg = document.getElementById('linkSwitchToRegister');
  if (linkReg) {
    linkReg.addEventListener('click', (e) => {
      e.preventDefault();
      if (tabRegister) tabRegister.click();
    });
  }

  const linkSignIn = document.getElementById('linkSwitchToSignIn');
  if (linkSignIn) {
    linkSignIn.addEventListener('click', (e) => {
      e.preventDefault();
      if (tabSignIn) tabSignIn.click();
    });
  }

  // Toggle Password Visibility
  document.querySelectorAll('.toggle-pw-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetInput = document.getElementById(btn.dataset.target);
      if (targetInput) {
        targetInput.type = targetInput.type === 'password' ? 'text' : 'password';
      }
    });
  });

  // Registration Password Strength Meter
  const regPasswordInput = document.getElementById('regPassword');
  if (regPasswordInput) {
    regPasswordInput.addEventListener('input', () => {
      const val = regPasswordInput.value;
      const bar = document.getElementById('pwStrengthBar');
      let score = 0;
      if (val.length >= 8) score += 35;
      if (/[0-9]/.test(val)) score += 35;
      if (/[A-Z]/.test(val)) score += 30;

      if (bar) {
        bar.style.width = `${score}%`;
        bar.style.backgroundColor = score < 50 ? 'var(--accent-rose)' : (score < 80 ? 'var(--accent-amber)' : 'var(--accent-emerald)');
      }
    });
  }

  // Auth Form Submissions
  if (formSignIn) formSignIn.addEventListener('submit', handleLoginSubmit);
  if (formRegister) formRegister.addEventListener('submit', handleRegisterSubmit);

  // Sign Out Button
  const logoutBtn = document.getElementById('btnLogout');
  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

  // Empty State "+ Create Your First Trip" Button
  const btnEmptyCreate = document.getElementById('btnEmptyCreateTrip');
  if (btnEmptyCreate) {
    btnEmptyCreate.addEventListener('click', () => openModal('tripModalOverlay'));
  }

  // Active Trip Selector Dropdown
  document.getElementById('activeTripSelect').addEventListener('change', async (e) => {
    state.activeTripId = e.target.value;
    await loadActiveTripDetails(state.activeTripId);
  });

  // Tab Switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      state.activeTab = tab;

      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      const targetPanel = document.getElementById(`panel${capitalize(tab)}`);
      if (targetPanel) targetPanel.classList.add('active');

      if (tab === 'audit') {
        renderAuditTab();
      }
    });
  });

  // Day Filter in Itinerary
  document.getElementById('itineraryDayFilterBar').addEventListener('click', (e) => {
    if (e.target.classList.contains('day-chip')) {
      state.activeDayFilter = e.target.dataset.day;
      document.querySelectorAll('.day-chip').forEach(c => c.classList.remove('active'));
      e.target.classList.add('active');
      renderItineraryTab();
    }
  });

  // Audit Filter
  document.getElementById('auditStatusFilter').addEventListener('change', renderAuditTab);
  document.getElementById('btnRefreshAudit').addEventListener('click', renderAuditTab);

  // Modal Open Buttons
  document.getElementById('btnNewTrip').addEventListener('click', () => openModal('tripModalOverlay'));
  document.getElementById('btnAddDestinationModal').addEventListener('click', () => openModal('destModalOverlay'));
  document.getElementById('quickAddDestBtn').addEventListener('click', () => openModal('destModalOverlay'));
  document.getElementById('btnAddItineraryModal').addEventListener('click', openItineraryModal);
  document.getElementById('btnAddExpenseModal').addEventListener('click', openExpenseModal);
  document.getElementById('btnInviteMemberModal').addEventListener('click', () => openModal('inviteModalOverlay'));
  document.getElementById('quickInviteBtn').addEventListener('click', () => openModal('inviteModalOverlay'));
  document.getElementById('btnShareTrip').addEventListener('click', () => openModal('inviteModalOverlay'));

  // Modal Close Buttons
  setupModalClose('tripModalOverlay', 'closeTripModalBtn', 'cancelTripModalBtn');
  setupModalClose('destModalOverlay', 'closeDestModalBtn', 'cancelDestModalBtn');
  setupModalClose('itinModalOverlay', 'closeItinModalBtn', 'cancelItinModalBtn');
  setupModalClose('expModalOverlay', 'closeExpModalBtn', 'cancelExpModalBtn');
  setupModalClose('inviteModalOverlay', 'closeInviteModalBtn', 'cancelInviteModalBtn');

  // Form Submissions
  document.getElementById('tripForm').addEventListener('submit', handleTripSubmit);
  document.getElementById('destForm').addEventListener('submit', handleDestSubmit);
  document.getElementById('itinForm').addEventListener('submit', handleItinSubmit);
  document.getElementById('expForm').addEventListener('submit', handleExpSubmit);
  document.getElementById('inviteForm').addEventListener('submit', handleInviteSubmit);
}

// Modal Helpers
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('open');
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('open');
}

function setupModalClose(overlayId, closeBtnId, cancelBtnId) {
  const closeBtn = document.getElementById(closeBtnId);
  const cancelBtn = document.getElementById(cancelBtnId);
  const overlay = document.getElementById(overlayId);

  if (closeBtn) closeBtn.addEventListener('click', () => closeModal(overlayId));
  if (cancelBtn) cancelBtn.addEventListener('click', () => closeModal(overlayId));
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal(overlayId);
    });
  }
}

// Specialized Modal Openers
function openItineraryModal() {
  const select = document.getElementById('itinFormAssignee');
  select.innerHTML = '<option value="">Unassigned (Open for all)</option>';
  if (state.activeTrip?.collaborators) {
    state.activeTrip.collaborators.forEach(c => {
      if (c.user) {
        const opt = document.createElement('option');
        opt.value = c.user.id;
        opt.textContent = `${c.user.name} (${c.role})`;
        select.appendChild(opt);
      }
    });
  }
  openModal('itinModalOverlay');
}

function openExpenseModal() {
  const trip = state.activeTrip;
  const payerSelect = document.getElementById('expFormPayer');
  const splitWrap = document.getElementById('expSplitCheckboxes');

  payerSelect.innerHTML = '';
  splitWrap.innerHTML = '';

  (trip?.collaborators || []).forEach(c => {
    if (!c.user) return;
    // Payer option
    const opt = document.createElement('option');
    opt.value = c.user.id;
    opt.textContent = c.user.name;
    if (c.user.id === state.currentUser?.id) opt.selected = true;
    payerSelect.appendChild(opt);

    // Split checkboxes
    const row = document.createElement('div');
    row.className = 'split-user-row';
    row.innerHTML = `
      <label>
        <input type="checkbox" name="splitUsers" value="${c.user.id}" checked>
        <span>${escapeHtml(c.user.name)}</span>
      </label>
    `;
    splitWrap.appendChild(row);
  });

  openModal('expModalOverlay');
}

// --- Form Submit Handlers ---
async function handleTripSubmit(e) {
  e.preventDefault();
  const title = document.getElementById('tripFormTitle').value;
  const destinationSummary = document.getElementById('tripFormDestSummary').value;
  const startDate = document.getElementById('tripFormStartDate').value;
  const endDate = document.getElementById('tripFormEndDate').value;
  const budget = document.getElementById('tripFormBudget').value;
  const currency = document.getElementById('tripFormCurrency').value;
  const description = document.getElementById('tripFormDescription').value;
  const isPrivate = document.getElementById('tripFormPrivate').checked;

  try {
    const res = await api('/api/trips', {
      method: 'POST',
      body: JSON.stringify({
        title, destinationSummary, startDate, endDate, budget, currency, description, isPrivate
      })
    });

    showToast('Trip created successfully!', '🎉');
    closeModal('tripModalOverlay');
    document.getElementById('tripForm').reset();
    state.activeTripId = res.trip.id;
    await loadTrips();
  } catch (err) {
    showToast(err.message, '❌');
  }
}

async function handleDestSubmit(e) {
  e.preventDefault();
  const tripId = state.activeTrip.id;
  const name = document.getElementById('destFormName').value;
  const city = document.getElementById('destFormCity').value;
  const country = document.getElementById('destFormCountry').value;
  const arrivalDate = document.getElementById('destFormArrival').value;
  const departureDate = document.getElementById('destFormDeparture').value;
  const notes = document.getElementById('destFormNotes').value;

  try {
    await api(`/api/trips/${tripId}/destinations`, {
      method: 'POST',
      body: JSON.stringify({ name, city, country, arrivalDate, departureDate, notes })
    });

    showToast('Destination stop added', '📍');
    closeModal('destModalOverlay');
    document.getElementById('destForm').reset();
    await loadActiveTripDetails(tripId);
  } catch (err) {
    showToast(err.message, '❌');
  }
}

async function handleItinSubmit(e) {
  e.preventDefault();
  const tripId = state.activeTrip.id;
  const title = document.getElementById('itinFormTitle').value;
  const dayNumber = document.getElementById('itinFormDay').value;
  const time = document.getElementById('itinFormTime').value;
  const location = document.getElementById('itinFormLocation').value;
  const estimatedCost = document.getElementById('itinFormCost').value;
  const assignedToUserId = document.getElementById('itinFormAssignee').value || null;
  const notes = document.getElementById('itinFormNotes').value;

  try {
    await api(`/api/trips/${tripId}/itinerary`, {
      method: 'POST',
      body: JSON.stringify({ title, dayNumber, time, location, estimatedCost, assignedToUserId, notes })
    });

    showToast('Activity added to itinerary', '📅');
    closeModal('itinModalOverlay');
    document.getElementById('itinForm').reset();
    await loadActiveTripDetails(tripId);
  } catch (err) {
    showToast(err.message, '❌');
  }
}

async function handleExpSubmit(e) {
  e.preventDefault();
  const tripId = state.activeTrip.id;
  const title = document.getElementById('expFormTitle').value;
  const amount = document.getElementById('expFormAmount').value;
  const category = document.getElementById('expFormCategory').value;
  const paidByUserId = document.getElementById('expFormPayer').value;
  const receiptNote = document.getElementById('expFormNote').value;

  const splitWithUserIds = Array.from(document.querySelectorAll('input[name="splitUsers"]:checked'))
    .map(cb => cb.value);

  try {
    await api(`/api/trips/${tripId}/expenses`, {
      method: 'POST',
      body: JSON.stringify({ title, amount, category, paidByUserId, splitWithUserIds, receiptNote })
    });

    showToast('Expense recorded & split calculated', '💰');
    closeModal('expModalOverlay');
    document.getElementById('expForm').reset();
    await loadActiveTripDetails(tripId);
  } catch (err) {
    showToast(err.message, '❌');
  }
}

async function handleInviteSubmit(e) {
  e.preventDefault();
  const tripId = state.activeTrip.id;
  const userId = document.getElementById('inviteUserSelect').value;
  const email = document.getElementById('inviteEmailInput').value;
  const role = document.getElementById('inviteRoleSelect').value;

  if (!userId && !email) {
    showToast('Please select a user or enter an email address.', '⚠️');
    return;
  }

  try {
    await api(`/api/trips/${tripId}/collaborators`, {
      method: 'POST',
      body: JSON.stringify({ userId: userId || undefined, email: email || undefined, role })
    });

    showToast(`Member invited with ${role.toUpperCase()} role`, '💌');
    closeModal('inviteModalOverlay');
    document.getElementById('inviteForm').reset();
    await loadActiveTripDetails(tripId);
  } catch (err) {
    showToast(err.message, '❌');
  }
}

// --- Utilities ---
function showToast(message, icon = '✨') {
  const toast = document.getElementById('toastNotification');
  const iconSpan = document.getElementById('toastIcon');
  const msgSpan = document.getElementById('toastMessage');

  iconSpan.textContent = icon;
  msgSpan.textContent = message;
  toast.style.display = 'flex';

  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.style.display = 'none';
  }, 3200);
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateTime(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function formatCurrency(num) {
  return (Number(num) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function getRoleIcon(role) {
  switch (role) {
    case 'owner': return '👑';
    case 'editor': return '✏️';
    case 'viewer': return '👁️';
    default: return '👤';
  }
}

function getCategoryIcon(cat) {
  switch (cat) {
    case 'Accommodation': return '🏨';
    case 'Flights': return '✈️';
    case 'Food': return '🍽️';
    case 'Transport': return '🚆';
    case 'Activities': return '🎟️';
    default: return '🏷️';
  }
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderEmptyState() {
  document.getElementById('heroTitle').textContent = 'No Trips Available';
  document.getElementById('heroDescription').textContent = 'Create your first collaborative travel plan using the "+ New Trip" button.';
}
