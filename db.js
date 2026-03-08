// config/db.js
// This file handles the connection to MongoDB using Mongoose

const mongoose = require('mongoose');

// Function to connect to MongoDB
const connectDB = async () => {
  try {
    // Connect using the URI from .env or a default local URI
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/toursafe', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1); // Stop the app if DB connection fails
  }
};

module.exports = connectDB;
