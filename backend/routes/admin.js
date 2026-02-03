import express from 'express';
import { adminAuth } from '../middleware/auth.js';
import { getScheduledJobsInfo, scheduleBookingReminder } from '../services/notificationScheduler.js';
import { sendBookingReminder } from '../services/emailService.js';
import Booking from '../models/Booking.js';

const router = express.Router();

// Get scheduler stats
router.get('/scheduler/jobs', adminAuth, (req, res) => {
    try {
        const jobs = getScheduledJobsInfo();
        res.json({
            count: jobs.length,
            jobs: jobs.map(j => ({
                bookingId: j.jobId.replace('reminder-', ''),
                nextRun: j.nextInvocation
            }))
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Manual trigger for testing
router.post('/scheduler/trigger/:bookingId', adminAuth, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.bookingId)
            .populate(['user', 'movie', 'showtime', 'theater']);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Send immediately
        await sendBookingReminder(
            booking.user,
            booking,
            booking.movie,
            booking.showtime,
            booking.theater
        );

        res.json({ message: `Reminder manually triggered for ${booking.user.email}` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
