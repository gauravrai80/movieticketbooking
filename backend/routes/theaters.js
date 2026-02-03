import express from 'express';
import Theater from '../models/Theater.js';
import Screen from '../models/Screen.js';
import { adminAuth } from '../middleware/auth.js';

const router = express.Router();

// Get all theaters
router.get('/', async (req, res) => {
  try {
    const { city } = req.query;
    const filter = {};
    if (city) filter.city = city;

    const theaters = await Theater.find(filter).populate('screens');
    res.json(theaters);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch theaters', error: error.message });
  }
});

// Get single theater
router.get('/:id', async (req, res) => {
  try {
    const theater = await Theater.findById(req.params.id).populate('screens');
    if (!theater) {
      return res.status(404).json({ message: 'Theater not found' });
    }
    res.json(theater);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch theater', error: error.message });
  }
});

// Create theater (admin only)
router.post('/', adminAuth, async (req, res) => {
  try {
    const { name, city, address, phoneNumber, facilities } = req.body;

    if (!name || !city || !address) {
      return res.status(400).json({ message: 'Name, city, and address are required' });
    }

    const theater = new Theater({
      name,
      city,
      address,
      phoneNumber,
      facilities
    });

    await theater.save();
    res.status(201).json(theater);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create theater', error: error.message });
  }
});

// Create screen for theater (admin only)
router.post('/:theaterId/screens', adminAuth, async (req, res) => {
  try {
    const { screenNumber, format, rows, columns } = req.body;

    if (!screenNumber || !format || !rows || !columns) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const totalSeats = rows * columns;
    const layout = Array(rows).fill(null).map(() => Array(columns).fill('available'));

    const screen = new Screen({
      theater: req.params.theaterId,
      screenNumber,
      format,
      seating: { rows, columns, layout },
      totalSeats
    });

    await screen.save();

    // Add screen to theater
    await Theater.findByIdAndUpdate(req.params.theaterId, { $push: { screens: screen._id } });

    res.status(201).json(screen);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create screen', error: error.message });
  }
});

// Update theater (admin only)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const theater = await Theater.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!theater) {
      return res.status(404).json({ message: 'Theater not found' });
    }
    res.json(theater);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update theater', error: error.message });
  }
});

// Delete theater (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const theater = await Theater.findByIdAndDelete(req.params.id);
    if (!theater) {
      return res.status(404).json({ message: 'Theater not found' });
    }
    res.json({ message: 'Theater deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete theater', error: error.message });
  }
});

export default router;
