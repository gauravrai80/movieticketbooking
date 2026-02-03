import express from 'express';
import Booking from '../models/Booking.js';
import Showtime from '../models/Showtime.js';
import { auth, adminAuth } from '../middleware/auth.js';
import { sendBookingConfirmation, sendCancellationConfirmation } from '../services/emailService.js';
import { scheduleBookingReminder, cancelBookingReminder } from '../services/notificationScheduler.js';

const router = express.Router();

// Get user bookings
router.get('/user/my-bookings', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('movie')
      .populate('showtime')
      .populate('theater')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch bookings', error: error.message });
  }
});

// Get all bookings (admin only)
router.get('/', adminAuth, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user')
      .populate('movie')
      .populate('showtime')
      .populate('theater')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch bookings', error: error.message });
  }
});

// Get single booking
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user')
      .populate('movie')
      .populate('showtime')
      .populate('theater');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns this booking or is admin
    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch booking', error: error.message });
  }
});

// Create booking
router.post('/', auth, async (req, res) => {
  try {
    const { showtimeId, seats, paymentMethod } = req.body;

    if (!showtimeId || !seats || !paymentMethod) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const showtime = await Showtime.findById(showtimeId)
      .populate('movie')
      .populate('theater');

    if (!showtime) {
      return res.status(404).json({ message: 'Showtime not found' });
    }

    // Check for missing references (data integrity issue)
    if (!showtime.movie || !showtime.theater) {
      return res.status(404).json({ message: 'Showtime data is invalid (missing movie or theater reference)' });
    }

    // Check seat availability
    // Robust check: if availableSeats is empty but bookedSeats is also empty (and total > 0), 
    // it implies legacy data or initialization issue. We should arguably allow it if not in bookedSeats.
    // However, to be safe, let's treat "empty availableSeats" as "sold out" UNLESS we fix it.
    // Better fix: if availableSeats is empty, we assume they must be populated relative to bookedSeats.

    // Fix: If availableSeats is empty, initialize it implicitly? 
    // No, better to stick to strict check but ensure showtimes are valid.
    // Current issue: showtime.availableSeats is [] for old showtimes.

    if (showtime.availableSeats.length === 0 && showtime.bookedSeats.length === 0 && showtime.totalSeats > 0) {
      // Auto-fix for legacy/broken showtimes: Populate standard seats
      const rows = 10;
      const cols = 10;
      const allSeats = [];
      for (let r = 0; r < rows; r++) {
        const rowLabel = String.fromCharCode(65 + r);
        for (let c = 1; c <= cols; c++) {
          allSeats.push(`${rowLabel}${c}`);
        }
      }
      showtime.availableSeats = allSeats;
      await showtime.save(); // Save the fix
    }

    const unavailableSeats = seats.filter(seat => !showtime.availableSeats.includes(seat));
    if (unavailableSeats.length > 0) {
      return res.status(400).json({ message: `Seats ${unavailableSeats.join(', ')} are not available` });
    }

    // Update showtime seats
    const updatedAvailableSeats = showtime.availableSeats.filter(seat => !seats.includes(seat));
    const updatedBookedSeats = [...showtime.bookedSeats, ...seats];

    // Calculate total amount
    const numberOfTickets = seats.length;
    let totalAmount = 0;

    for (const seat of seats) {
      // Check if seat is premium
      // Note: We need to ensure showtime.premiumSeats is valid
      const isPremium = showtime.premiumSeats && showtime.premiumSeats.includes(seat);
      const seatPrice = isPremium ? Math.round(showtime.price * 1.3) : showtime.price;
      totalAmount += seatPrice;
    }

    // Create booking
    const booking = new Booking({
      user: req.user.id,
      showtime: showtimeId,
      movie: showtime.movie._id,
      theater: showtime.theater._id,
      seats,
      numberOfTickets,
      totalAmount,
      paymentMethod,
      paymentIntentId: req.body.paymentIntentId, // Save stripe ID
      paymentStatus: req.body.paymentIntentId ? 'completed' : 'pending',
      bookingStatus: req.body.paymentIntentId ? 'confirmed' : 'pending'
    });

    await booking.save();

    // Update showtime with new seat availability
    await Showtime.findByIdAndUpdate(showtimeId, {
      availableSeats: updatedAvailableSeats,
      bookedSeats: updatedBookedSeats,
      status: updatedAvailableSeats.length === 0 ? 'full' : 'available'
    });

    await booking.populate(['user', 'movie', 'showtime', 'theater']);

    // Send confirmation email
    try {
      if (booking.bookingStatus === 'confirmed') {
        await sendBookingConfirmation(
          booking.user,
          booking,
          booking.movie,
          booking.showtime,
          booking.theater
        );
        console.log('Confirmation email sent to', booking.user.email);

        // Schedule reminder
        await scheduleBookingReminder(booking);
      }
    } catch (emailError) {
      console.error('Email notification failed (non-blocking):', emailError.message);
    }

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create booking', error: error.message });
  }
});

// Cancel booking
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const { cancellationReason } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns this booking
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (booking.bookingStatus === 'cancelled') {
      return res.status(400).json({ message: 'Booking already cancelled' });
    }

    // Update booking
    booking.bookingStatus = 'cancelled';
    booking.cancellationReason = cancellationReason || 'User requested cancellation';
    booking.cancellationDate = new Date();

    await booking.save();

    // Cancel scheduled reminder
    cancelBookingReminder(booking._id);

    // Send cancellation email
    try {
      await booking.populate(['user', 'movie']); // ensure populated
      await sendCancellationConfirmation(
        booking.user,
        booking,
        booking.movie,
        booking.totalAmount
      );
      console.log('Cancellation email sent to', booking.user.email);
    } catch (emailError) {
      console.error('Email notification failed:', emailError.message);
    }

    // Return seats to available
    const showtime = await Showtime.findById(booking.showtime);
    const updatedAvailableSeats = [...showtime.availableSeats, ...booking.seats];
    const updatedBookedSeats = showtime.bookedSeats.filter(seat => !booking.seats.includes(seat));

    await Showtime.findByIdAndUpdate(booking.showtime, {
      availableSeats: updatedAvailableSeats,
      bookedSeats: updatedBookedSeats,
      status: updatedAvailableSeats.length === showtime.totalSeats ? 'available' : 'available'
    });

    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (error) {
    res.status(500).json({ message: 'Failed to cancel booking', error: error.message });
  }
});

export default router;
