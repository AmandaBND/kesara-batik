const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const cron = require('node-cron');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// Security
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: [process.env.FRONTEND_URL, 'http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
}));

// Rate Limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use('/api/', limiter);

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Static
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/currency', require('./routes/currencyRoutes'));

// Health Check
app.get('/api/health', (req, res) => res.json({ status: 'OK', name: 'Kesara Batik API', version: '1.0.0' }));

// 404
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error', ...(process.env.NODE_ENV === 'development' && { stack: err.stack }) });
});

// CRON: Monthly Statement on 20th at 9am
cron.schedule('0 9 20 * *', async () => {
  const { generateMonthlyStatement } = require('./utils/reportGenerator');
  await generateMonthlyStatement();
  console.log('Monthly statement generated and emailed.');
});

// CRON: Update exchange rates every hour
const { updateExchangeRates } = require('./services/exchangeRateService');
updateExchangeRates();
cron.schedule('0 * * * *', async () => {
  await updateExchangeRates();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🦁 Kesara Batik Server running on port ${PORT}`));

module.exports = app;
