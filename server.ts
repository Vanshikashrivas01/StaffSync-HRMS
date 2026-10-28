import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { connectDB, disconnectDB } from './server/config/db.ts';
import { initializeSeedData } from './server/services/dataService.ts';
import { errorHandler } from './server/middleware/errorHandler.ts';

// Route imports
import authRoutes from './server/routes/authRoutes.ts';
import employeeRoutes from './server/routes/employeeRoutes.ts';
import leaveRoutes from './server/routes/leaveRoutes.ts';
import attendanceRoutes from './server/routes/attendanceRoutes.ts';
import announcementRoutes from './server/routes/announcementRoutes.ts';
import trainingRoutes from './server/routes/trainingRoutes.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect In-Memory MongoDB & Seed default records
await connectDB();
await initializeSeedData();

// Graceful process termination
process.on('SIGINT', async () => {
  await disconnectDB();
  process.exit(0);
});
process.on('SIGTERM', async () => {
  await disconnectDB();
  process.exit(0);
});

// API Health Check & Info
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'online',
    appName: 'StaffSync - Modern Human Resource Management Solution',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: 'mongodb-memory-server (In-Memory MongoDB Connected)',
    environment: process.env.NODE_ENV || 'development',
    availableModules: [
      'Authentication & RBAC (JWT)',
      'Employee Management (CRUD)',
      'Leave Management & Balances',
      'Attendance Tracking (Check In/Out)',
      'Company Announcements',
      'Training & Development',
    ],
  });
});

// Download/inspect Postman Collection
app.get('/api/postman-collection', (_req: Request, res: Response) => {
  const collectionPath = path.join(__dirname, 'server', 'postman', 'StaffSync_HRMS.postman_collection.json');
  if (fs.existsSync(collectionPath)) {
    const raw = fs.readFileSync(collectionPath, 'utf-8');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="StaffSync_HRMS.postman_collection.json"');
    res.send(raw);
  } else {
    res.status(404).json({ success: false, message: 'Collection file not found.' });
  }
});

// Mount modular API routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/trainings', trainingRoutes);

// Global Error Handler
app.use(errorHandler);

// Vite Frontend Dev / Production Integration
async function setupFrontend() {
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 StaffSync Server running on http://0.0.0.0:${PORT}`);
    console.log(`📡 Backend REST APIs active at http://0.0.0.0:${PORT}/api`);
  });
}

setupFrontend().catch((err) => {
  console.error('Failed to start server:', err);
});
