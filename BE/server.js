// Load environment variables FIRST
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./src/config/database');
const socketConfig = require('./src/config/socket');
const gmailPushService = require('./src/services/gmailPushService');

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Register Socket.IO globally using singleton
socketConfig.setIO(io);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });

  // Allow clients to join specific RFP rooms
  socket.on('join-rfp', (rfpId) => {
    socket.join(`rfp-${rfpId}`);
    console.log(`Client ${socket.id} joined room: rfp-${rfpId}`);
  });

  socket.on('leave-rfp', (rfpId) => {
    socket.leave(`rfp-${rfpId}`);
    console.log(`Client ${socket.id} left room: rfp-${rfpId}`);
  });
});

// Initialize Gmail Push Service for real-time email notifications
gmailPushService.initialize().catch((error) => {
  console.error('Failed to initialize Gmail Push Service:', error.message);
});

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
try {
  const rfpRoutes = require('./src/routes/rfpRoutes');
  const vendorRoutes = require('./src/routes/vendorRoutes');
  const proposalRoutes = require('./src/routes/proposalRoutes');

  console.log('rfpRoutes loaded:', typeof rfpRoutes);
  console.log('vendorRoutes loaded:', typeof vendorRoutes);
  console.log('proposalRoutes loaded:', typeof proposalRoutes);

  app.use('/api/rfps', rfpRoutes);
  app.use('/api/vendors', vendorRoutes);
  app.use('/api/proposals', proposalRoutes);
} catch (error) {
  console.error('Error loading routes:', error);
}

// Basic health check route
app.get('/', (req, res) => {
  res.json({ message: 'Backend server is running!' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`RFP routes: /api/rfps`);
  console.log(`Vendor routes: /api/vendors`);
  console.log(`WebSocket server ready for real-time updates`);
});
