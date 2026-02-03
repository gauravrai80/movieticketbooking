import express from 'express';
import bcryptjs from 'bcryptjs';
import User from '../models/User.js';
import Booking from '../models/Booking.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get Current User Profile
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate('bookingHistory')
            .populate('favoriteTheaters');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
    }
});

// Update Profile Information
router.put('/me', auth, async (req, res) => {
    try {
        const { name, phone, dateOfBirth, gender, address, profileImage } = req.body;

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.name = name || user.name;
        user.phone = phone || user.phone;
        user.dateOfBirth = dateOfBirth || user.dateOfBirth;
        user.gender = gender || user.gender;
        if (address) user.address = { ...user.address, ...address };
        if (profileImage) user.profileImage = profileImage;
        user.updatedAt = Date.now();

        await user.save();
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Update failed', error: error.message });
    }
});

// Update User Preferences
router.put('/preferences', auth, async (req, res) => {
    try {
        const { favoriteGenres, favoriteLanguages, notifications, theme } = req.body;

        const user = await User.findById(req.user.id);

        if (favoriteGenres) user.preferences.favoriteGenres = favoriteGenres;
        if (favoriteLanguages) user.preferences.favoriteLanguages = favoriteLanguages;
        if (notifications) user.preferences.notifications = { ...user.preferences.notifications, ...notifications };
        if (theme) user.preferences.theme = theme;

        await user.save();
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Preferences update failed', error: error.message });
    }
});

// Get User Bookings
router.get('/bookings', auth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const bookings = await Booking.find({ user: req.user.id })
            .populate('movie')
            .populate('theater')
            .populate('showtime')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Booking.countDocuments({ user: req.user.id });

        res.json({
            bookings,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalBookings: total
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch bookings', error: error.message });
    }
});

// Add Favorite Theater
router.post('/favorite-theaters/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user.favoriteTheaters.includes(req.params.id)) {
            user.favoriteTheaters.push(req.params.id);
            await user.save();
        }
        res.json(user.favoriteTheaters);
    } catch (error) {
        res.status(500).json({ message: 'Failed to add favorite', error: error.message });
    }
});

// Remove Favorite Theater
router.delete('/favorite-theaters/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        user.favoriteTheaters = user.favoriteTheaters.filter(
            id => id.toString() !== req.params.id
        );
        await user.save();
        res.json(user.favoriteTheaters);
    } catch (error) {
        res.status(500).json({ message: 'Failed to remove favorite', error: error.message });
    }
});

// Change Password
router.post('/change-password', auth, async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'New passwords do not match' });
        }

        const user = await User.findById(req.user.id).select('+password');
        const isMatch = await user.matchPassword(currentPassword);

        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect current password' });
        }

        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Password change failed', error: error.message });
    }
});

export default router;
