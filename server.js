// server.js
// Main entry point for the TourSafe backend server

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ── Middleware ──────────────────────────────────────────────────────────────

// Allow cross-origin requests from frontend (important for local dev)
app.use(cors());

// Parse incoming JSON bodies
app.use(express.json());

// Serve static frontend files from the /frontend folder
const path = require('path');
app.use(express.static(path.join(__dirname, '../frontend')));

// ── Routes ──────────────────────────────────────────────────────────────────

// Authentication routes: /api/register and /api/login
app.use('/api', require('./routes/auth'));

// Incident routes: /api/incident and /api/incidents
app.use('/api', require('./routes/incidents'));

// ── Root Route (serves landing page) ────────────────────────────────────────
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ── 404 handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// ── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error' });
});

// ── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 TourSafe server running on http://localhost:${PORT}`);
});
