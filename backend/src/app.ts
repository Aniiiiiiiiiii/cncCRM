import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { globalErrorHandler } from './middlewares/error.middleware';
import { AppError } from './utils/appError';
import { env } from './config/env';

const app = express();
app.set('trust proxy', 1); 

// 1) Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);

// 2) Body Parsers & Compressors
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());

// 3) Request Logging
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 4) Rate Limiting for API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again in 15 minutes.',
});
app.use('/api/', apiLimiter);

// 5) Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// 6) Load Modular Routes
import authRoutes from './routes/auth.routes';
import leadRoutes from './routes/lead.routes';
import projectRoutes from './routes/project.routes';
import clientRoutes from './routes/client.routes';
import hrmsRoutes from './routes/hrms.routes';
import ticketRoutes from './routes/ticket.routes';
import accountingRoutes from './routes/accounting.routes';
import documentRoutes from './routes/document.routes';
import dashboardRoutes from './routes/dashboard.routes';
import chatRoutes from './routes/chat.routes';
import meetingRoutes from './routes/meeting.routes';

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/leads', leadRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/clients', clientRoutes);
app.use('/api/v1/hrms', hrmsRoutes);
app.use('/api/v1/tickets', ticketRoutes);
app.use('/api/v1/accounting', accountingRoutes);
app.use('/api/v1/documents', documentRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/meetings', meetingRoutes);

// 7) Wildcard unhandled route
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server.`, 404));
});

// 8) Global Error Handler Middleware
app.use(globalErrorHandler);

export default app;
