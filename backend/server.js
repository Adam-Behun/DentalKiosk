// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Import routes
const appointmentsRoutes = require('./routes/appointments');
const checkoutRoutes = require('./routes/checkout');
const webhookRoutes = require('./routes/webhook');
const populateDatabase = require('./utils/populateDatabase');

dotenv.config(); // Load .env variables

const app = express();

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001', 
    'https://frontend-production-6e9f.up.railway.app',
    /\.up\.railway\.app$/
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

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
// Railway provides PORT automatically, fallback to 4000 for local dev
const PORT = parseInt(process.env.PORT) || 4000;

// Retry mechanism for MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to MongoDB');

    // Populate the database if needed
    await populateDatabase();

    app.listen(PORT, '0.0.0.0', () => console.log(`Backend running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

module.exports = app;