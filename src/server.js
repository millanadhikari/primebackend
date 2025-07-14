// server.js - Main entry point with server.js as the main file
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
// Import database configuration
import { checkDatabaseHealth } from './config/database.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
// import clientRoutes from './routes/clientRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import cloudinaryRoutes from './routes/cloudinaryRoutes.js'
// Import middleware
import path from 'path';
import { fileURLToPath } from 'url';
import { getCloudinaryUsage } from './config/cloudinary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Current __dirname:', __dirname);
console.log('Files in root:', await import('fs/promises').then(fs => fs.readdir(__dirname)));
console.log('Files in src:', await import('fs/promises').then(fs => fs.readdir(__dirname,)));


const app = express();
const port = process.env.PORT || 3001;

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
const allowedOrigins = [
  'http://localhost:3001',
  'https://primechoicecare.com.au',
];

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
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
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
// app.use('/api/client', clientRoutes)
app.use('/api/blog', blogRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/upload', (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});
app.use('/api/message', messageRoutes)
// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});


console.log({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


app.listen(port, () => console.log(`listening on localhost:${port}`))
// Error handling mid