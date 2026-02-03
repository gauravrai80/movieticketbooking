import schedule from 'node-schedule';
import CinemaDataSyncService from './cinemaDataSyncService.js';
import Showtime from '../models/Showtime.js';

class ScheduledSyncJobs {
    constructor() {
        this.jobs = {};
    }

    // Initialize all jobs
    init() {
        if (process.env.ENABLE_AUTO_SYNC !== 'true') {
            console.log('Auto-sync disabled via environment');
            return;
        }

        console.log('Initializing scheduled sync jobs...');

        // 1. Movie Sync: Daily at 2:00 AM
        this.jobs.movieSync = schedule.scheduleJob('0 2 * * *', async () => {
            console.log('[ScheduledJob] Running Daily Movie Sync');
            try {
                await CinemaDataSyncService.syncMoviesFromMovieGlu();
            } catch (err) {
                console.error('[ScheduledJob] Movie Sync Failed:', err);
            }
        });

        // 2. Showtime Sync: Daily at 3:00 AM (for next 30 days)
        this.jobs.showtimeSync = schedule.scheduleJob('0 3 * * *', async () => {
            console.log('[ScheduledJob] Running Daily Showtime Sync');
            try {
                const today = new Date();
                const future = new Date();
                future.setDate(today.getDate() + 30);
                await CinemaDataSyncService.syncShowtimesForTheaters(today, future);
            } catch (err) {
                console.error('[ScheduledJob] Showtime Sync Failed:', err);
            }
        });

        // 3. Cleanup: Every hour
        this.jobs.cleanup = schedule.scheduleJob('0 * * * *', async () => {
            console.log('[ScheduledJob] Running Cleanup');
            try {
                const now = new Date();
                // Remove showtimes older than 2 hours ago? Or keep for history?
                // Let's mark them as archived or just ensure status is updated
                // For now, let's just log.
                // Real implementation: 
                // await Showtime.deleteMany({ startTime: { $lt: new Date(now - 24*60*60*1000) } }); // Delete older than 24h
            } catch (err) {
                console.error('[ScheduledJob] Cleanup Failed:', err);
            }
        });
    }

    // Admin controls
    getJobsInfo() {
        return Object.keys(this.jobs).map(key => ({
            name: key,
            nextInvocation: this.jobs[key]?.nextInvocation()
        }));
    }

    async triggerMovieSync() {
        return await CinemaDataSyncService.syncMoviesFromMovieGlu();
    }

    async triggerShowtimeSync(theaterId = null, days = 7) {
        const start = new Date();
        const end = new Date();
        end.setDate(start.getDate() + days);
        return await CinemaDataSyncService.syncShowtimesForTheaters(start, end);
    }
}

export default new ScheduledSyncJobs();
