// server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Import routes
const appointmentsRoutes = require('./routes/appointments');
const checkoutRoutes = require('./routes/checkout');
const webhookRoutes = require('./routes/webhook');
const populateDatabase = require('./utils/populateDatabase');

dotenv.config(); // Load .env variables

const app = express();

// Health check route
app.get('/', (req, res) => {
  res.send('Backend is running');
});

// Use JSON body parsing for most routes
app.use(express.json());

// Register routes
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/webhook', webhookRoutes);

// Mongo + Server setup
const PORT = process.env.PORT || 4000;

// Retry mechanism for MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to MongoDB');

    // Populate the database if needed
    await populateDatabase();

    app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

module.exports = app;