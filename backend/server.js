import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import movieRoutes from './routes/movies.js';
import theaterRoutes from './routes/theaters.js';
import showtimeRoutes from './routes/showtimes.js';
import bookingRoutes from './routes/bookings.js';
import tmdbRoutes from './routes/tmdb.js';
import moviegluRoutes from './routes/movieglu.js';
import paymentRoutes from './routes/payments.js';
import showtimeAdminRoutes from './routes/showtimes_admin.js';
import theaterAdminRoutes from './routes/theater_admin.js';
import adminRoutes from './routes/admin.js';
import cinemaSyncRoutes from './routes/cinemaSync.js';
import ScheduledSyncJobs from './services/scheduledSyncJobs.js';
import profileRoutes from './routes/profile.js';
import analyticsRoutes from './routes/analytics.js';

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/theaters', theaterRoutes);
app.use('/api/showtimes', showtimeRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/tmdb', tmdbRoutes);
app.use('/api/movieglu', moviegluRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin/showtimes', showtimeAdminRoutes);
app.use('/api/admin/theater', theaterAdminRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cinema-sync', cinemaSyncRoutes);
app.use('/api/cinema-sync', cinemaSyncRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/analytics', analyticsRoutes);

// Initialize Scheduled Jobs
ScheduledSyncJobs.init();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
