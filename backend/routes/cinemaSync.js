import express from 'express';
import { adminAuth } from '../middleware/auth.js';
import ScheduledSyncJobs from '../services/scheduledSyncJobs.js';

const router = express.Router();

// Get Sync Status
router.get('/status', adminAuth, (req, res) => {
    try {
        const jobs = ScheduledSyncJobs.getJobsInfo();
        res.json({
            active: true,
            jobs,
            config: {
                autoSync: process.env.ENABLE_AUTO_SYNC === 'true'
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Trigger Movie Sync
router.post('/movies', adminAuth, async (req, res) => {
    try {
        const result = await ScheduledSyncJobs.triggerMovieSync();
        res.json({ message: 'Movie sync completed', result });
    } catch (error) {
        res.status(500).json({ message: 'Sync failed', error: error.message });
    }
});

// Trigger Showtime Sync
router.post('/showtimes', adminAuth, async (req, res) => {
    try {
        const { days } = req.body;
        const result = await ScheduledSyncJobs.triggerShowtimeSync(null, days || 7);
        res.json({ message: 'Showtime sync completed', result });
    } catch (error) {
        res.status(500).json({ message: 'Sync failed', error: error.message });
    }
});

export default router;
