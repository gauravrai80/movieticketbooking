import schedule from 'node-schedule';
import { sendBookingReminder } from './emailService.js';
import Booking from '../models/Booking.js';

// Store jobs in memory to allow cancellation
const scheduledJobs = new Map();

export const scheduleBookingReminder = async (booking) => {
    try {
        // Ensure populated data is available, or re-fetch if needed
        const fullBooking = await Booking.findById(booking._id).populate(['user', 'movie', 'showtime', 'theater']);

        if (!fullBooking || !fullBooking.showtime) {
            console.error('Cannot schedule reminder: Invalid booking data');
            return;
        }

        const showtimeDate = new Date(fullBooking.showtime.startTime);
        const reminderDate = new Date(showtimeDate.getTime());

        // Schedule for X hours before showtime (default 24h)
        const hoursBefore = parseInt(process.env.REMINDER_HOURS_BEFORE) || 24;
        reminderDate.setHours(reminderDate.getHours() - hoursBefore);

        // If reminder time is in the past, don't schedule (or send immediately if very recent? Let's skip for now)
        if (reminderDate < new Date()) {
            // console.log('Reminder time already passed, skipping schedule.');
            return;
        }

        const jobId = `reminder-${booking._id}`;

        const job = schedule.scheduleJob(reminderDate, async () => {
            console.log(`Executing scheduled reminder for booking ${booking._id}`);
            try {
                // Check if booking is still confirmed
                const freshBooking = await Booking.findById(booking._id).populate(['user', 'movie', 'showtime', 'theater']);
                if (freshBooking && freshBooking.bookingStatus === 'confirmed') {
                    await sendBookingReminder(
                        freshBooking.user,
                        freshBooking,
                        freshBooking.movie,
                        freshBooking.showtime,
                        freshBooking.theater
                    );
                    console.log(`Reminder sent to ${freshBooking.user.email}`);
                }
            } catch (err) {
                console.error(`Failed to send reminder for ${booking._id}`, err);
            }
        });

        scheduledJobs.set(jobId, job);
        console.log(`Reminder scheduled for ${reminderDate.toLocaleString()} (Job ID: ${jobId})`);

    } catch (error) {
        console.error('Error scheduling reminder:', error);
    }
};

export const cancelBookingReminder = (bookingId) => {
    const jobId = `reminder-${bookingId}`;
    const job = scheduledJobs.get(jobId);
    if (job) {
        job.cancel();
        scheduledJobs.delete(jobId);
        console.log(`Reminder cancelled for booking ${bookingId}`);
    }
};

export const getScheduledJobsInfo = () => {
    return Array.from(scheduledJobs.entries()).map(([key, val]) => ({
        jobId: key,
        nextInvocation: val.nextInvocation()
    }));
};
