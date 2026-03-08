// js/auth.js
// Handles tourist Registration and Login forms

// ── Constants ──────────────────────────────────────────────────────────────
const API_BASE = 'http://localhost:3000/api';

// ── Utility Functions ───────────────────────────────────────────────────────

/**
 * Display a message (success or error) in the form message area
 * @param {string} elementId - ID of the message div
 * @param {string} text      - Message text
 * @param {'success'|'error'} type - Style class
 */
function showMessage(elementId, text, type) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.textContent = text;
    el.className = `form-message ${type}`;
    el.style.display = 'block';
}

/**
 * Display an inline field error
 */
function setFieldError(id, msg) {
    const el = document.getElementById(id);
    if (el) el.textContent = msg;
}

/**
 * Clear all field errors
 */
function clearErrors(ids) {
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '';
    });
}

// ── Registration Form ───────────────────────────────────────────────────────
const registerForm = document.getElementById('registerForm');

if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get input values
        const name = document.getElementById('reg-name').value.trim();
        const phone = document.getElementById('reg-phone').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const password = document.getElementById('reg-password').value;

        // Clear previous errors
        clearErrors(['err-name', 'err-phone', 'err-email', 'err-password']);
        showMessage('reg-message', '', '');

        // Client-side validation
        let hasError = false;

        if (!name) {
            setFieldError('err-name', 'Name is required');
            hasError = true;
        }
        if (!phone) {
            setFieldError('err-phone', 'Phone number is required');
            hasError = true;
        }
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setFieldError('err-email', 'Please enter a valid email address');
            hasError = true;
        }
        if (!password || password.length < 6) {
            setFieldError('err-password', 'Password must be at least 6 characters');
            hasError = true;
        }

        if (hasError) return;

        // Disable button while loading
        const btn = document.getElementById('reg-submit-btn');
        btn.disabled = true;
        btn.textContent = 'Creating Account...';

        try {
            // Send POST request to backend
            const response = await fetch(`${API_BASE}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, phone, email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Show error from backend
                showMessage('reg-message', data.message || 'Registration failed', 'error');
            } else {
                // Save token and user info in localStorage
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                showMessage('reg-message', '✅ Account created! Redirecting...', 'success');

                // Redirect to dashboard after short delay
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1200);
            }
        } catch (err) {
            showMessage('reg-message', '❌ Cannot connect to server. Is the backend running?', 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = 'Create Account';
        }
    });
}

// ── Login Form ──────────────────────────────────────────────────────────────
const loginForm = document.getElementById('loginForm');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        // Clear previous errors
        clearErrors(['err-login-email', 'err-login-password']);
        showMessage('login-message', '', '');

        // Client-side validation
        let hasError = false;

        if (!email) {
            setFieldError('err-login-email', 'Email is required');
            hasError = true;
        }
        if (!password) {
            setFieldError('err-login-password', 'Password is required');
            hasError = true;
        }

        if (hasError) return;

        const btn = document.getElementById('login-submit-btn');
        btn.disabled = true;
        btn.textContent = 'Signing In...';

        try {
            const response = await fetch(`${API_BASE}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                showMessage('login-message', data.message || 'Login failed', 'error');
            } else {
                // Store auth data
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                showMessage('login-message', '✅ Login successful! Redirecting...', 'success');

                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            }
        } catch (err) {
            showMessage('login-message', '❌ Cannot connect to server. Is the backend running?', 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = 'Sign In';
        }
    });
}
