// js/report.js
// Handles the Incident Report form submission

const API_BASE = 'http://localhost:3000/api';

// ── Auth Guard ──────────────────────────────────────────────────────────────
const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
if (!storedUser) {
    window.location.href = 'login.html';
}

// ── Auto-fill fields from stored user data ───────────────────────────────────
if (storedUser) {
    const nameField = document.getElementById('rep-name');
    const phoneField = document.getElementById('rep-phone');
    if (nameField && storedUser.name) nameField.value = storedUser.name;
    if (phoneField && storedUser.phone) phoneField.value = storedUser.phone;
}

// ── Auto-fill Date & Time ────────────────────────────────────────────────────
const dateTimeField = document.getElementById('rep-datetime');
if (dateTimeField) {
    const now = new Date();
    dateTimeField.value = now.toLocaleString('en-IN', {
        day: '2-digit', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
}

// ── GPS Auto-detect ──────────────────────────────────────────────────────────
const latField = document.getElementById('rep-lat');
const lngField = document.getElementById('rep-lng');
const gpsStatus = document.getElementById('gps-status');

if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
        (position) => {
            if (latField) latField.value = position.coords.latitude.toFixed(6);
            if (lngField) lngField.value = position.coords.longitude.toFixed(6);
            if (gpsStatus) {
                gpsStatus.textContent = '✅ Location detected successfully';
                gpsStatus.style.color = 'var(--success)';
            }
        },
        (error) => {
            // Location denied or unavailable
            if (latField) latField.placeholder = 'Enter manually';
            if (lngField) lngField.placeholder = 'Enter manually';
            if (latField) latField.removeAttribute('readonly');
            if (lngField) lngField.removeAttribute('readonly');
            if (gpsStatus) {
                gpsStatus.textContent = '⚠️ Location not available — please enter coordinates manually';
                gpsStatus.style.color = 'var(--warning)';
            }
        },
        { timeout: 8000, enableHighAccuracy: true }
    );
} else {
    if (gpsStatus) {
        gpsStatus.textContent = '⚠️ Geolocation not supported by your browser';
        gpsStatus.style.color = 'var(--warning)';
    }
}

// ── Utility: Show field error ────────────────────────────────────────────────
function setFieldError(id, msg) {
    const el = document.getElementById(id);
    if (el) el.textContent = msg;
}

function clearErrors(ids) {
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '';
    });
}

function showMessage(elementId, text, type) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.textContent = text;
    el.className = `form-message ${type}`;
    el.style.display = 'block';
}

// ── Form Submission ──────────────────────────────────────────────────────────
const reportForm = document.getElementById('reportForm');

if (reportForm) {
    reportForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Collect form values
        const name = document.getElementById('rep-name').value.trim();
        const phone = document.getElementById('rep-phone').value.trim();
        const type = document.getElementById('rep-type').value;
        const description = document.getElementById('rep-description').value.trim();
        const latitude = parseFloat(document.getElementById('rep-lat').value);
        const longitude = parseFloat(document.getElementById('rep-lng').value);

        // Clear previous errors
        clearErrors(['err-rep-name', 'err-rep-phone', 'err-rep-type', 'err-rep-desc']);
        showMessage('report-message', '', '');

        // Client-side validation
        let hasError = false;

        if (!name) {
            setFieldError('err-rep-name', 'Name is required');
            hasError = true;
        }
        if (!phone) {
            setFieldError('err-rep-phone', 'Phone number is required');
            hasError = true;
        }
        if (!type) {
            setFieldError('err-rep-type', 'Please select an incident type');
            hasError = true;
        }
        if (!description) {
            setFieldError('err-rep-desc', 'Description is required');
            hasError = true;
        }
        if (isNaN(latitude) || isNaN(longitude)) {
            showMessage('report-message', '❌ Location coordinates are missing. Please allow GPS access or enter manually.', 'error');
            hasError = true;
        }

        if (hasError) return;

        // Disable submit while sending
        const btn = document.getElementById('report-submit-btn');
        btn.disabled = true;
        btn.textContent = 'Submitting...';

        try {
            const response = await fetch(`${API_BASE}/incident`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, phone, type, description, latitude, longitude }),
            });

            const data = await response.json();

            if (!response.ok) {
                showMessage('report-message', data.message || 'Failed to submit report', 'error');
            } else {
                showMessage('report-message', '✅ Incident reported successfully! Redirecting to dashboard...', 'success');

                // Redirect to dashboard after delay
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1800);
            }
        } catch (err) {
            showMessage('report-message', '❌ Cannot connect to server. Make sure the backend is running.', 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = 'Submit Report';
        }
    });
}
