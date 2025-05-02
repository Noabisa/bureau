const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const consumerRoutes = require('./routes/consumer');
const lenderRoutes = require('./routes/lender');
const paymentRoutes = require('./routes/payment'); // ✅ Import payment route

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/consumer', consumerRoutes);
app.use('/api/lender', lenderRoutes);
app.use('/api/payment', paymentRoutes); // ✅ Mount payment route

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
