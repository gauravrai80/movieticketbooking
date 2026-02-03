import express from 'express';
import { adminAuth } from '../middleware/auth.js';
import * as analyticsService from '../services/analyticsService.js';

const router = express.Router();

router.get('/booking-trends', adminAuth, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'Start date and end date are required' });
        }
        const trends = await analyticsService.getBookingTrends(startDate, endDate);
        res.json(trends);
    } catch (error) {
        console.error('Error fetching trends:', error);
        res.status(500).json({ message: 'Error fetching booking trends', error: error.message });
    }
});

router.get('/popular-movies', adminAuth, async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const movies = await analyticsService.getPopularMovies(parseInt(limit));
        res.json(movies);
    } catch (error) {
        console.error('Error fetching popular movies:', error);
        res.status(500).json({ message: 'Error fetching popular movies', error: error.message });
    }
});

router.get('/theater-occupancy/:theaterId', adminAuth, async (req, res) => {
    try {
        const { theaterId } = req.params;
        const { startDate, endDate } = req.query;
        const occupancy = await analyticsService.getTheaterOccupancy(theaterId, startDate, endDate);
        res.json(occupancy);
    } catch (error) {
        console.error('Error fetching occupancy:', error);
        res.status(500).json({ message: 'Error fetching occupancy', error: error.message });
    }
});

router.get('/sales-performance', adminAuth, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const performance = await analyticsService.getSalesPerformance(startDate, endDate);
        res.json(performance);
    } catch (error) {
        console.error('Error fetching sales:', error);
        res.status(500).json({ message: 'Error fetching sales performance', error: error.message });
    }
});

router.get('/user-activity', adminAuth, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const activity = await analyticsService.getUserActivity(startDate, endDate);
        res.json(activity);
    } catch (error) {
        console.error('Error fetching user activity:', error);
        res.status(500).json({ message: 'Error fetching user activity', error: error.message });
    }
});

router.get('/booking-patterns/:theaterId', adminAuth, async (req, res) => {
    try {
        const { theaterId } = req.params;
        const patterns = await analyticsService.getBookingPatterns(theaterId);
        res.json(patterns);
    } catch (error) {
        console.error('Error fetching patterns:', error);
        res.status(500).json({ message: 'Error fetching booking patterns', error: error.message });
    }
});

export default router;
