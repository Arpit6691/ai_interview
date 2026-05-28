const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const connectDB = require('./src/config/db');
const logger = require('./src/middleware/logging');
const registerSocketHandlers = require('./src/sockets/socketHandler');

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const interviewRoutes = require('./src/routes/interviewRoutes');
const sessionRoutes = require('./src/routes/sessionRoutes');

// Initialize app
const app = express();
const server = http.createServer(app);

// Connect to MongoDB
connectDB();

// CORS options
const corsOptions = {
  origin: process.env.CLIENT_URL || true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(logger);

// Serve uploads folder statically so frontend can play video responses
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/sessions', sessionRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running perfectly' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Error Middleware]', err.stack);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// Setup Socket.io
const io = socketio(server, {
  cors: {
    origin: process.env.CLIENT_URL || true,
    methods: ['GET', 'POST']
  }
});

// Register Sockets
registerSocketHandlers(io);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`[Server] running on port ${PORT}`);
});

