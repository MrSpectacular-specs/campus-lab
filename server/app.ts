import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { sessionMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';

import authRoutes from './routes/auth';
import institutionsRoutes from './routes/institutions';
import projectsRoutes from './routes/projects';
import milestonesRoutes from './routes/milestones';
import submissionsRoutes from './routes/submissions';
import mentoringRoutes from './routes/mentoring';
import evaluationRoutes from './routes/evaluation';
import reportsRoutes from './routes/reports';
import adminRoutes from './routes/admin';
import facultyRoutes from './routes/faculty';
import mentorRoutes from './routes/mentor';
import studentRoutes from './routes/student';

export const app = express();

// Middleware
app.use(cors({
  origin: true, // Echo origin to permit localhost & custom ports with credentials
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json());
app.use(sessionMiddleware);

// API Healthcheck
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'campuslab-backend', time: new Date().toISOString() });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/institutions', institutionsRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api', milestonesRoutes);
app.use('/api', submissionsRoutes);
app.use('/api', mentoringRoutes);
app.use('/api', evaluationRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/mentor', mentorRoutes);
app.use('/api/student', studentRoutes);

// Error Handler
app.use(errorHandler);

export default app;
