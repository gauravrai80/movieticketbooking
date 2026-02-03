import Booking from '../models/Booking.js';
import Movie from '../models/Movie.js';
import Theater from '../models/Theater.js';
import Showtime from '../models/Showtime.js';
import User from '../models/User.js';

export const getBookingTrends = async (startDate, endDate) => {
    const bookings = await Booking.find({
        createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
        bookingStatus: 'confirmed'
    }).populate('movie showtime');

    // Group by date and calculate daily metrics
    const trends = {};
    bookings.forEach(booking => {
        const date = booking.createdAt.toISOString().split('T')[0];
        if (!trends[date]) {
            trends[date] = { bookings: 0, revenue: 0 };
        }
        trends[date].bookings += 1;
        trends[date].revenue += booking.totalAmount;
    });

    return Object.entries(trends).map(([date, data]) => ({
        date,
        bookings: data.bookings,
        revenue: data.revenue
    })).sort((a, b) => new Date(a.date) - new Date(b.date));
};

export const getPopularMovies = async (limit = 10) => {
    const results = await Booking.aggregate([
        { $match: { bookingStatus: 'confirmed' } },
        {
            $group: {
                _id: '$movie',
                bookingCount: { $sum: 1 },
                revenue: { $sum: '$totalAmount' }
            }
        },
        { $sort: { bookingCount: -1 } },
        { $limit: limit },
        {
            $lookup: {
                from: 'movies',
                localField: '_id',
                foreignField: '_id',
                as: 'movieData'
            }
        }
    ]);

    return results.map(r => ({
        movieId: r._id,
        title: r.movieData[0]?.title || 'Unknown Title',
        bookings: r.bookingCount,
        revenue: r.revenue
    }));
};

export const getTheaterOccupancy = async (theaterId, startDate, endDate) => {
    const showtimes = await Showtime.find({
        theater: theaterId,
        startTime: { $gte: new Date(startDate), $lte: new Date(endDate) }
    });

    let totalSeats = 0;
    let bookedSeats = 0;

    const bookings = await Booking.find({
        theater: theaterId,
        createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
        bookingStatus: 'confirmed'
    });

    showtimes.forEach(s => {
        totalSeats += s.totalSeats;
    });

    bookings.forEach(b => {
        // b.numberOfTickets might work, but let's be safe and check seats array length if numberOfTickets is missing
        bookedSeats += b.numberOfTickets || b.seats.length;
    });

    return {
        occupancyRate: totalSeats > 0 ? (bookedSeats / totalSeats * 100).toFixed(2) : 0,
        totalSeats,
        bookedSeats,
        availableSeats: totalSeats - bookedSeats
    };
};

export const getSalesPerformance = async (startDate, endDate) => {
    const bookings = await Booking.find({
        createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
        bookingStatus: 'confirmed'
    });

    return {
        totalRevenue: bookings.reduce((sum, b) => sum + b.totalAmount, 0),
        totalBookings: bookings.length,
        averageBookingValue: bookings.length > 0
            ? (bookings.reduce((sum, b) => sum + b.totalAmount, 0) / bookings.length).toFixed(2)
            : 0,
        cancelledBookings: await Booking.countDocuments({
            createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
            bookingStatus: 'cancelled'
        })
    };
};

export const getUserActivity = async (startDate, endDate) => {
    const newUsers = await User.countDocuments({
        createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
    });

    const activeUsers = await Booking.distinct('user', {
        createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
    });

    return {
        newUsers,
        activeUsers: activeUsers.length,
        totalBookings: await Booking.countDocuments({
            createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
        })
    };
};

export const getBookingPatterns = async (theaterId) => {
    const bookings = await Booking.find({
        theater: theaterId,
        bookingStatus: 'confirmed'
    }).populate('showtime');

    const patterns = {
        byDay: {},
        byHour: {},
        byMovieFormat: {}
    };

    bookings.forEach(b => {
        if (b.showtime && b.showtime.startTime) {
            const date = new Date(b.showtime.startTime);
            const day = date.toLocaleDateString('en-US', { weekday: 'long' });
            const hour = date.getHours();

            patterns.byDay[day] = (patterns.byDay[day] || 0) + 1;
            patterns.byHour[hour] = (patterns.byHour[hour] || 0) + 1;
        }
    });

    return patterns;
};
