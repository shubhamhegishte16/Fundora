import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import creatorAuthRoutes from './routes/creatorAuthRoutes.js';
import adminUserRoutes from './routes/adminUserRoutes.js';
import adminAuthRoutes from './routes/adminAuthRoutes.js';
import donorProfileRoute from "./routes/donorProfileRoute.js";
// ...

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded KYC files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/creator/auth', creatorAuthRoutes);
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin', adminUserRoutes);

app.use("/api/donor", donorProfileRoute);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
  });
});

export default app;