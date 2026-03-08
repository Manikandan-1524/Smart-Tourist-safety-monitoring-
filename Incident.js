// models/Incident.js
// Mongoose schema for incident reports

const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
    },
    type: {
        type: String,
        required: [true, 'Incident type is required'],
        // Only allow predefined incident types
        enum: ['Theft', 'Medical Emergency', 'Harassment', 'Lost', 'Other'],
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
    },
    latitude: {
        type: Number,
        required: [true, 'Latitude is required'],
    },
    longitude: {
        type: Number,
        required: [true, 'Longitude is required'],
    },
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Resolved'],
        default: 'Pending', // All new incidents start as Pending
    },
    date: {
        type: Date,
        default: Date.now, // Auto-generated timestamp
    },
});

module.exports = mongoose.model('Incident', incidentSchema);
