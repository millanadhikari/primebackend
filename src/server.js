// server.js - Main entry point with server.js as the main file
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { Server } from 'socket.io';
import http from 'http';
// Import database configuration
import { checkDatabaseHealth } from './config/database.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import clientRoutes from './routes/clientRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import cloudinaryRoutes from './routes/cloudinaryRoutes.js'
import templateRoutes from './routes/templateRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import { setSocketInstance } from './models/notificationModel.js';
// Import middleware
import path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Current __dirname:', __dirname);
console.log('Files in root:', await import('fs/promises').then(fs => fs.readdir(__dirname)));
console.log('Files in src:', await import('fs/promises').then(fs => fs.readdir(__dirname,)));


const app = express();
const port = process.env.PORT || 3001;
const allowedOrigins = [
  'http://localhost:3001',
  'https://primechoicecare.com.au',
  'https://www.primechoicecare.com.au',
  'https://primecare-17puw3es7-millanadhikaris-projects.vercel.app'
];
// Create HTTP server with the Express app
const server = http.createServer(app);
// Initialize socket.io
const io = new Server(server, {
  cors: {
    origin:
      allowedOrigins,
    // "http://localhost:3001", 
    methods: ["GET", "POST", "PATCH", "UPDATE", "DELETE"]
  }
});

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
// app.use('/api/', lim iter);

// CORS configuration


app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile browsers or curl)
    if (!origin) return callback(null, true);

    // Normalize origin (e.g., remove trailing slash)
    const normalizedOrigin = origin.replace(/\/$/, '');

    if (allowedOrigins.includes(normalizedOrigin)) {
      callback(null, true);
    } else {
      console.error(`Blocked by CORS: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use((req, res, next) => {
  console.log('Mobile Browser Origin:', req.headers.origin);
  next();
});
// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// // Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const dbHealth = await checkDatabaseHealth();
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: dbHealth ? 'connected' : 'disconnected',
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message
    });
  }
});

// API routes
// app.use('/api/client', (req, res, next) => {
//   console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
//   next();
// });
app.use('/api/cloudinary', cloudinaryRoutes)

app.use('/api/auth', authRoutes);
app.use('/api/client', clientRoutes)
app.use('/api/blog', blogRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/upload', (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});
app.use('/api/message', messageRoutes)
app.use('/api/templates', templateRoutes)
app.use('/api/notifications', notificationRoutes);
// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});


// Setup socket.io connection logic
io.on("connection", (socket) => {
  // Auth/userId comes from handshake or custom logic
  console.log("Socket connected:")
  const userId = socket.handshake?.auth?.userId || null;
  console.log("Socket connected:", userId, socket.id);

  // Join default user room immediately if present
  if (userId) {
    socket.join(`user_${userId}`);
    console.log(`Joined room: user_${userId}`);
  }

  // Allow frontend to join/leave rooms for flexibility
  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room: ${roomId}`);
  });
  socket.on("leave_room", (roomId) => {
    socket.leave(roomId);
    console.log(`Socket ${socket.id} left room: ${roomId}`);
  });

  // Listen for client requesting to send notification (optional)
  socket.on("send_notification", (data) => {
    if (data.userId) {
      io.to(`user_${data.userId}`).emit("notification", data);
    }
  });

  // Listen to other event sending as needed
  socket.on("appointment_update", (data) => {
    if (data.userId) {
      io.to(`user_${data.userId}`).emit("appointment_update", data); // Frontend expects "appointment_update"
    }
  });
  socket.on("send_message", (data) => {
    if (data.recipientId) {
      io.to(`user_${data.recipientId}`).emit("message_received", data); // Frontend expects "message_received"
    }
  });
  socket.on("system_alert", (data) => {
    // You could broadcast to all or per user
    if (data.userId) {
      io.to(`user_${data.userId}`).emit("system_alert", data); // Frontend expects "system_alert"
    } else {
      io.emit("system_alert", data); // For all users
    }
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", socket.id, reason);
  });
});


// Pass the io instance to notificationService for emitting
setSocketInstance(io);
server.listen(port, () => console.log(`listening on localhost:${port}`))
// Error handling mid

export { io }