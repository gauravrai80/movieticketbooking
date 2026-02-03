import express from 'express';
import mongoose from 'mongoose';
import { adminAuth } from '../middleware/auth.js';
import Showtime from '../models/Showtime.js';

const router = express.Router();

// Get all showtimes for a specific theater (Admin view)
router.get('/admin/theater/:theaterId', adminAuth, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const query = { theater: req.params.theaterId };

        if (startDate || endDate) {
            query.startTime = {};
            if (startDate) query.startTime.$gte = new Date(startDate);
            if (endDate) query.startTime.$lte = new Date(endDate);
        }

        const showtimes = await Showtime.find(query)
            .populate('movie', 'title poster_path')
            .populate('screen', 'screenNumber format')
            .sort({ startTime: 1 });

        res.json(showtimes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new showtime (with auto-sync for TMDB movies)
router.post('/', adminAuth, async (req, res) => {
    try {
        let { movie, tmdbId, movieDetails, screen, theater, startTime, endTime, price } = req.body;

        // If tmdbId is provided but no local movie ID, find or create the movie
        if (tmdbId && !movie) {
            let localMovie = await mongoose.model('Movie').findOne({ tmdbId });

            if (!localMovie && movieDetails) {
                // Create new movie from TMDB details
                localMovie = new (mongoose.model('Movie'))({
                    title: movieDetails.title,
                    description: movieDetails.overview || 'No description',
                    genre: ['Drama'], // Default or map ids
                    duration: 120, // Default or fetch details
                    releaseDate: movieDetails.release_date || new Date(),
                    posterUrl: movieDetails.poster_path,
                    backdropUrl: movieDetails.backdrop_path,
                    tmdbId: tmdbId,
                    rating: movieDetails.vote_average || 0,
                    language: ['English'],
                    format: ['2D'],
                    releaseStatus: 'now-showing'
                });
                await localMovie.save();
            }

            if (localMovie) {
                movie = localMovie._id;
            } else {
                return res.status(400).json({ message: 'Could not resolve movie ID from TMDB data' });
            }
        }

        // Basic validation
        if (new Date(startTime) >= new Date(endTime)) {
            return res.status(400).json({ message: 'End time must be after start time' });
        }

        // Check for overlap
        const overlap = await Showtime.findOne({
            screen,
            _id: { $ne: req.body._id }, // Exclude self if updating (though this is create)
            $or: [
                { startTime: { $lt: endTime, $gte: startTime } },
                { endTime: { $gt: startTime, $lte: endTime } }
            ]
        });

        if (overlap) {
            return res.status(409).json({ message: 'Showtime overlaps with an existing screening' });
        }

        // Generate default seats (100 seats: A1-J10)
        // Ideally this should come from the Screen layout, but defaulting for now
        const generateSeats = (rows = 10, cols = 10) => {
            const seats = [];
            for (let r = 0; r < rows; r++) {
                const rowLabel = String.fromCharCode(65 + r);
                for (let c = 1; c <= cols; c++) {
                    seats.push(`${rowLabel}${c}`);
                }
            }
            return seats;
        };

        const showtime = new Showtime({
            movie,
            screen,
            theater,
            startTime,
            endTime,
            price,
            totalSeats: 100,
            availableSeats: generateSeats(10, 10), // Initialize with 100 seats
            seatsPerRow: 10
        });

        await showtime.save();
        res.status(201).json(showtime);
    } catch (error) {
        console.error("Create Showtime Error:", error);
        res.status(400).json({ message: error.message });
    }
});

// Update showtime
router.put('/:id', adminAuth, async (req, res) => {
    try {
        const { movie, screen, startTime, endTime, price } = req.body;

        const showtime = await Showtime.findByIdAndUpdate(
            req.params.id,
            { movie, screen, startTime, endTime, price },
            { new: true }
        );

        if (!showtime) return res.status(404).json({ message: 'Showtime not found' });
        res.json(showtime);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete showtime
router.delete('/:id', adminAuth, async (req, res) => {
    try {
        const showtime = await Showtime.findByIdAndDelete(req.params.id);
        if (!showtime) return res.status(404).json({ message: 'Showtime not found' });
        res.json({ message: 'Showtime deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update Pricing/Pricing Rules
router.patch('/:id/pricing', adminAuth, async (req, res) => {
    try {
        const { price, premiumSeats } = req.body;
        const updates = {};
        if (price) updates.price = price;
        if (premiumSeats) updates.premiumSeats = premiumSeats;

        const showtime = await Showtime.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true }
        );

        if (!showtime) return res.status(404).json({ message: 'Showtime not found' });
        res.json(showtime);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

export default router;

// Reschedule showtime and notify users
router.patch('/:id/reschedule', adminAuth, async (req, res) => {
    try {
        const { newStartTime, newEndTime } = req.body;

        // Fetch old showtime first
        const oldShowtime = await Showtime.findById(req.params.id);
        if (!oldShowtime) {
            return res.status(404).json({ message: 'Showtime not found' });
        }

        // Create a copy of old showtime data for email
        const oldShowtimeData = { ...oldShowtime.toObject() };

        // Update showtime
        const updates = {};
        if (newStartTime) updates.startTime = new Date(newStartTime);
        if (newEndTime) updates.endTime = new Date(newEndTime); // Optional: usually auto-calculated?

        // If only start time given, we might want to shift end time to keep duration?
        // For now, assuming caller provides valid times or we just update start.

        const newShowtime = await Showtime.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true }
        ).populate(['movie', 'theater', 'screen']);

        // NOTE: Dynamic import to avoid circular dependency if emailService imports models (it doesn't, but good practice)
        // Actually emailService doesn't import models, but let's just import at top if possible. 
        // We will stick to top-level import to be consistent.

        // Find all confirmed bookings
        // We need to import Booking model here as it wasn't imported in showtimes_admin.js
        const Booking = mongoose.model('Booking');

        const bookings = await Booking.find({
            showtime: req.params.id,
            bookingStatus: 'confirmed'
        }).populate(['user', 'movie', 'theater']);

        // Send notifications asynchronously
        // We do not await this loop to return response quickly, or we can await if we want to report count.
        // Let's await to be safe and report.

        const { sendShowtimeChangeNotification } = await import('../services/emailService.js');

        let notifiedCount = 0;
        for (const booking of bookings) {
            try {
                await sendShowtimeChangeNotification(
                    booking.user,
                    booking,
                    booking.movie,
                    oldShowtimeData,
                    newShowtime,
                    booking.theater
                );
                notifiedCount++;
            } catch (err) {
                console.error(`Failed to notify ${booking.user.email}`, err);
            }
        }

        res.json({
            message: `Showtime rescheduled successfully. ${notifiedCount} users notified.`,
            showtime: newShowtime
        });

    } catch (error) {
        console.error("Reschedule Error:", error);
        res.status(500).json({ message: error.message });
    }
});
