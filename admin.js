// js/admin.js
// Admin Portal – Login + Incident Management Dashboard

const API_BASE = 'http://localhost:3000/api';

// ── Hardcoded Admin Credentials (simple auth for demo) ──────────────────────
// In production, use a real backend admin auth system
const ADMIN_EMAIL = 'admin@toursafe.com';
const ADMIN_PASSWORD = 'admin123';

// ── Section Elements ─────────────────────────────────────────────────────────
const loginSection = document.getElementById('admin-login-section');
const dashboardSection = document.getElementById('admin-dashboard-section');

// Check if admin was already logged in (session persistence)
if (sessionStorage.getItem('adminLoggedIn') === 'true') {
    showDashboard();
}

// ── Admin Login Form ─────────────────────────────────────────────────────────
const adminLoginForm = document.getElementById('adminLoginForm');

if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = document.getElementById('admin-email').value.trim();
        const password = document.getElementById('admin-password').value;
        const msgEl = document.getElementById('admin-login-msg');

        // Simple credential check
        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
            sessionStorage.setItem('adminLoggedIn', 'true');
            msgEl.textContent = '✅ Login successful!';
            msgEl.className = 'form-message success';
            msgEl.style.display = 'block';
            setTimeout(showDashboard, 800);
        } else {
            msgEl.textContent = '❌ Invalid email or password';
            msgEl.className = 'form-message error';
            msgEl.style.display = 'block';
        }
    });
}

/** Switch from login view to dashboard view */
function showDashboard() {
    if (loginSection) loginSection.style.display = 'none';
    if (dashboardSection) dashboardSection.style.display = 'block';
    loadIncidents();
}

// ── Admin Logout ─────────────────────────────────────────────────────────────
const adminLogoutBtn = document.getElementById('admin-logout-btn');
if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('adminLoggedIn');
        if (loginSection) loginSection.style.display = 'flex';
        if (dashboardSection) dashboardSection.style.display = 'none';
    });
}

// ── Load All Incidents ────────────────────────────────────────────────────────
let allIncidents = []; // Store globally for filtering

async function loadIncidents() {
    const loadingEl = document.getElementById('admin-loading');
    const emptyEl = document.getElementById('admin-empty');
    const wrapperEl = document.getElementById('admin-table-wrapper');
    const countEl = document.getElementById('admin-incident-count');

    if (loadingEl) loadingEl.style.display = 'block';
    if (emptyEl) emptyEl.style.display = 'none';
    if (wrapperEl) wrapperEl.style.display = 'none';

    try {
        const response = await fetch(`${API_BASE}/incidents`);
        allIncidents = await response.json();

        if (loadingEl) loadingEl.style.display = 'none';

        if (countEl) {
            countEl.textContent = `${allIncidents.length} Incident${allIncidents.length !== 1 ? 's' : ''}`;
        }

        renderIncidents(allIncidents);

    } catch (err) {
        if (loadingEl) loadingEl.textContent = '⚠️ Could not load incidents. Is the server running?';
    }
}

/**
 * Render incidents array into the admin table
 */
function renderIncidents(incidents) {
    const emptyEl = document.getElementById('admin-empty');
    const wrapperEl = document.getElementById('admin-table-wrapper');
    const tbodyEl = document.getElementById('admin-tbody');

    if (!incidents || incidents.length === 0) {
        if (emptyEl) emptyEl.style.display = 'block';
        if (wrapperEl) wrapperEl.style.display = 'none';
        return;
    }

    if (emptyEl) emptyEl.style.display = 'none';
    if (wrapperEl) wrapperEl.style.display = 'block';

    tbodyEl.innerHTML = '';

    incidents.forEach((inc, index) => {
        const dateStr = new Date(inc.date).toLocaleString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });

        const mapsUrl = `https://www.google.com/maps?q=${inc.latitude},${inc.longitude}`;
        const statusBadge = getStatusBadge(inc.status);

        const row = document.createElement('tr');
        row.innerHTML = `
      <td>${index + 1}</td>
      <td><strong>${inc.name}</strong></td>
      <td>${inc.phone}</td>
      <td>
        <span class="badge ${getTypeBadgeClass(inc.type)}">${inc.type}</span>
      </td>
      <td style="max-width:200px; white-space:normal; font-size:0.82rem;">
        ${inc.description}
      </td>
      <td style="white-space:nowrap; font-size:0.82rem;">${dateStr}</td>
      <td>
        <a class="maps-link" href="${mapsUrl}" target="_blank" rel="noopener noreferrer">
          📍 View Map
        </a>
        <div style="font-size:0.72rem; color:var(--text-muted); margin-top:2px;">
          ${inc.latitude?.toFixed(4)}, ${inc.longitude?.toFixed(4)}
        </div>
      </td>
      <td>${statusBadge}</td>
      <td>
        <select class="status-select" data-id="${inc._id}" id="select-${inc._id}">
          <option value="Pending"     ${inc.status === 'Pending' ? 'selected' : ''}>Pending</option>
          <option value="In Progress" ${inc.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
          <option value="Resolved"    ${inc.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
        </select>
        <button class="btn btn-primary btn-sm" style="margin-top:0.4rem; width:100%;"
          onclick="updateStatus('${inc._id}')">
          Update
        </button>
      </td>
    `;

        tbodyEl.appendChild(row);
    });
}

/**
 * Update the status of a specific incident via API
 */
async function updateStatus(id) {
    const selectEl = document.getElementById(`select-${id}`);
    if (!selectEl) return;

    const newStatus = selectEl.value;

    try {
        const response = await fetch(`${API_BASE}/incident/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus }),
        });

        const data = await response.json();

        if (response.ok) {
            alert(`✅ Status updated to "${newStatus}"`);
            loadIncidents(); // Refresh the table
        } else {
            alert('❌ Failed to update: ' + data.message);
        }
    } catch (err) {
        alert('❌ Cannot connect to server.');
    }
}

/**
 * Return HTML badge for incident status
 */
function getStatusBadge(status) {
    const map = {
        'Pending': '<span class="badge badge-pending">Pending</span>',
        'In Progress': '<span class="badge badge-inprogress">In Progress</span>',
        'Resolved': '<span class="badge badge-resolved">Resolved</span>',
    };
    return map[status] || `<span class="badge">${status}</span>`;
}

/**
 * Return badge style class for incident type
 */
function getTypeBadgeClass(type) {
    const map = {
        'Theft': 'badge-pending',
        'Medical Emergency': 'badge-inprogress',
        'Harassment': 'badge-pending',
        'Lost': '',
        'Other': '',
    };
    return map[type] || '';
}

// ── Status Filter ─────────────────────────────────────────────────────────────
const filterSelect = document.getElementById('filter-status');
if (filterSelect) {
    filterSelect.addEventListener('change', () => {
        const filterVal = filterSelect.value;
        if (!filterVal) {
            renderIncidents(allIncidents);
        } else {
            const filtered = allIncidents.filter(inc => inc.status === filterVal);
            renderIncidents(filtered);
        }
    });
}

// ── Refresh Button ────────────────────────────────────────────────────────────
const refreshBtn = document.getElementById('refresh-btn');
if (refreshBtn) {
    refreshBtn.addEventListener('click', loadIncidents);
}
