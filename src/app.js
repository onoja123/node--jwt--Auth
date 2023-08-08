const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const globalHandler = require('./controllers/error.controller');
const userRoute = require('../src/routes/user.route');
const authRoute = require('../src/routes/auth.route');
const AppError = require('./utils/appError');

const app = express();

// Middleware
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH'],
  origin: '*',
  credentials: true,
}));
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Custom middleware to log request time
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.headers);
  next();
});

// Routes
app.use('/api/user', userRoute);
app.use('/api/auth', authRoute);

// Global error handler middleware
app.use(globalHandler);

// Default route
app.get('/', (req, res) => {
  res.send('Server live ⚡️');
});

// 404 route
app.all('*', (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `${req.originalUrl} not found`,
  });
});

module.exports = app;
