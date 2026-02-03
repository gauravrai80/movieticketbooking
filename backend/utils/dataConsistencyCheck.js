import Showtime from '../models/Showtime.js';

class DataConsistencyCheck {
    async verify() {
        const issues = [];

        try {
            // Check 1: Movies exist for showtimes
            const orphanedShowtimesMovie = await Showtime.find({
                movie: { $exists: true }
            }).populate('movie', '_id');

            // Filter in memory to find missing populated docs if mongoose didn't filter them naturally
            // actually if the ref doesn't exist, populate returns null

            for (const showtime of orphanedShowtimesMovie) {
                if (!showtime.movie) {
                    issues.push(`Showtime ${showtime._id} references non-existent movie`);
                }
            }

            // Check 2: Theaters exist for showtimes
            const orphanedShowtimesTheater = await Showtime.find({
                theater: { $exists: true }
            }).populate('theater', '_id');

            for (const showtime of orphanedShowtimesTheater) {
                if (!showtime.theater) {
                    issues.push(`Showtime ${showtime._id} references non-existent theater`);
                }
            }

            // Check 3: No duplicate showtimes (same movie, theater, screen, startTime)
            const duplicates = await Showtime.aggregate([
                {
                    $group: {
                        _id: {
                            movie: '$movie',
                            theater: '$theater',
                            screen: '$screen',
                            startTime: '$startTime'
                        },
                        count: { $sum: 1 },
                        ids: { $push: '$_id' }
                    }
                },
                { $match: { count: { $gt: 1 } } }
            ]);

            if (duplicates.length > 0) {
                issues.push(`Found ${duplicates.length} sets of duplicate showtimes`);
            }

            return {
                isConsistent: issues.length === 0,
                issues,
                checkedAt: new Date()
            };
        } catch (err) {
            return {
                isConsistent: false,
                issues: ['Error running consistency check: ' + err.message],
                checkedAt: new Date()
            };
        }
    }
}

export default new DataConsistencyCheck();
