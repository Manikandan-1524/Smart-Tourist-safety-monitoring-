// js/dashboard.js
// Controls the Tourist Dashboard: displays user info, handles SOS, shows incidents

const API_BASE = 'http://localhost:3000/api';

// ── Auth Guard ──────────────────────────────────────────────────────────────
// If no user is logged in, redirect to login page immediately
const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
if (!storedUser) {
    window.location.href = 'login.html';
}

// ── Display User Name ───────────────────────────────────────────────────────
const nameEl = document.getElementById('dash-user-name');
if (nameEl && storedUser) {
    nameEl.textContent = `Welcome, ${storedUser.name} 👋`;
}

// ── Logout ──────────────────────────────────────────────────────────────────
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    });
}

// ── Fetch and Display My Incidents ──────────────────────────────────────────
async function loadMyIncidents() {
    const loadingEl = document.getElementById('incidents-loading');
    const emptyEl = document.getElementById('incidents-empty');
    const wrapperEl = document.getElementById('incidents-table-wrapper');
    const tbodyEl = document.getElementById('incidents-tbody');

    try {
        // Filter incidents by the logged-in user's phone number
        const phone = storedUser ? storedUser.phone : '';
        const response = await fetch(`${API_BASE}/incidents?phone=${encodeURIComponent(phone)}`);
        const incidents = await response.json();

        loadingEl.style.display = 'none';

        if (!Array.isArray(incidents) || incidents.length === 0) {
            emptyEl.style.display = 'block';
            return;
        }

        // Populate the table
        wrapperEl.style.display = 'block';
        tbodyEl.innerHTML = '';

        incidents.forEach((inc, index) => {
            const statusBadge = getStatusBadge(inc.status);
            const dateStr = new Date(inc.date).toLocaleString('en-IN', {
                day: '2-digit', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
            });

            const row = document.createElement('tr');
            row.innerHTML = `
        <td>${index + 1}</td>
        <td><strong>${inc.type}</strong></td>
        <td style="max-width:200px; white-space:normal;">${inc.description}</td>
        <td style="white-space:nowrap;">${dateStr}</td>
        <td>${statusBadge}</td>
      `;
            tbodyEl.appendChild(row);
        });

    } catch (err) {
        if (loadingEl) loadingEl.textContent = '⚠️ Could not load incidents. Is the server running?';
    }
}

/**
 * Return an HTML badge based on status string
 */
function getStatusBadge(status) {
    const map = {
        'Pending': '<span class="badge badge-pending">Pending</span>',
        'In Progress': '<span class="badge badge-inprogress">In Progress</span>',
        'Resolved': '<span class="badge badge-resolved">Resolved</span>',
    };
    return map[status] || `<span class="badge">${status}</span>`;
}

// ── SOS Emergency Button ─────────────────────────────────────────────────────
const sosBtn = document.getElementById('sos-btn');
const sosOverlay = document.getElementById('sos-overlay');

if (sosBtn) {
    sosBtn.addEventListener('click', async () => {
        // Confirm before sending SOS
        const confirmed = confirm(
            '🚨 EMERGENCY SOS\n\nThis will send your current GPS location to authorities immediately.\n\nContinue?'
        );
        if (!confirmed) return;

        sosBtn.disabled = true;
        if (sosOverlay) sosOverlay.style.display = 'flex';

        try {
            // Get GPS with browser Geolocation API
            const position = await getCurrentPosition();
            const { latitude, longitude } = position.coords;

            // Build SOS incident payload (uses logged-in user's info)
            const payload = {
                name: storedUser ? storedUser.name : 'Unknown Tourist',
                phone: storedUser ? storedUser.phone : 'Unknown',
                type: 'Medical Emergency', // SOS defaults to Medical Emergency
                description: '🚨 SOS EMERGENCY — Tourist needs immediate assistance!',
                latitude,
                longitude,
            };

            // POST to backend
            const response = await fetch(`${API_BASE}/incident`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (sosOverlay) sosOverlay.style.display = 'none';

            if (response.ok) {
                alert(`✅ SOS Alert Sent Successfully!\n\nYour location has been shared with authorities.\nLatitude:  ${latitude.toFixed(5)}\nLongitude: ${longitude.toFixed(5)}\n\nHelp is on the way. Stay calm.`);
                loadMyIncidents(); // Refresh incident list
            } else {
                alert('⚠️ SOS sent but server returned an error:\n' + data.message);
            }

        } catch (err) {
            if (sosOverlay) sosOverlay.style.display = 'none';

            if (err.code === 1) {
                // User denied location
                alert('❌ Location access denied.\n\nPlease allow location access in your browser settings to send SOS.');
            } else {
                alert('❌ Error sending SOS: ' + err.message);
            }
        } finally {
            sosBtn.disabled = false;
        }
    });
}

/**
 * Wrap browser geolocation in a Promise for async/await use
 */
function getCurrentPosition(options = {}) {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by this browser'));
            return;
        }
        navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 10000,
            enableHighAccuracy: true,
            ...options,
        });
    });
}

// ── Initialise on page load ──────────────────────────────────────────────────
loadMyIncidents();
