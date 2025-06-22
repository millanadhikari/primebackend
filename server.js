// server.js - Main entry point with server.js as the main file
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

// Import database configuration
import { connectDatabase, checkDatabaseHealth } from './src/config/database.js';

// Import routes
import authRoutes from './src/routes/authRoutes.js';
import clientRoutes from './src/routes/clientRoutes.js';


// Import middleware
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Current __dirname:', __dirname);
console.log('Files in root:', await import('fs/promises').then(fs => fs.readdir(__dirname)));
console.log('Files in src:', await import('fs/promises').then(fs => fs.readdir(path.join(__dirname, 'src'))));



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
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

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
app.use('/api/client', (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});
app.use('/api/auth', authRoutes);
app.use('/api/client', clientRoutes)

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

app.listen(port, () => console.log(`listening on localhost:${port}`))
// Error handling mid