
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Movie from '../models/Movie.js';
import Showtime from '../models/Showtime.js';
import Theater from '../models/Theater.js';
import Screen from '../models/Screen.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/movie_booking_db';

const seedShowtime = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB Connected');

        // 1. Get or Create Theater
        let theater = await Theater.findOne({ name: "Cineplex Downtown" });
        if (!theater) {
            theater = await Theater.create({
                name: "Cineplex Downtown",
                address: "123 Main St, Cityville",
                city: "Mumbai",
                facilities: ["parking", "food-court"],
                phoneNumber: "1234567890"
            });
            console.log("Created Theater:", theater.name);
        }

        // 2. Get or Create Screen
        let screen = await Screen.findOne({ theater: theater._id, screenNumber: 1 });
        if (!screen) {
            screen = await Screen.create({
                theater: theater._id,
                screenNumber: 1,
                format: "2D",
                totalSeats: 100,
                seating: {
                    rows: 10,
                    columns: 10,
                    layout: []
                }
            });
            console.log("Created Screen 1");
        }

        // 3. Get or Create Movie (Target ID from user screenshot: 840464 - Greenland 2)
        const targetTmdbId = 840464;

        let movie = await Movie.findOne({ tmdbId: targetTmdbId });
        if (!movie) {
            movie = await Movie.create({
                title: "Greenland: Migration",
                description: "The Garrity family must leave the safety of their Greenland bunker.",
                genre: ["Action", "Thriller"],
                duration: 120,
                releaseDate: new Date(),
                posterUrl: "/r2J02Z2OpLYct2PCqizArPP8BfQ.jpg",
                tmdbId: targetTmdbId,
                rating: 7.5,
                language: ["English"],
                format: ["2D"],
                releaseStatus: "now-showing"
            });
            console.log("Created Movie:", movie.title);
        }

        // 4. Create Showtime for TODAY
        const startTime = new Date();
        startTime.setHours(18, 0, 0, 0); // 6:00 PM Today

        const endTime = new Date(startTime);
        endTime.setHours(20, 0, 0, 0); // 8:00 PM

        // Generate seats
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

        const availableSeats = generateSeats();

        const showtime = await Showtime.create({
            movie: movie._id,
            screen: screen._id,
            theater: theater._id,
            startTime: startTime,
            endTime: endTime,
            price: 350,
            availableSeats: availableSeats,
            totalSeats: 100,
            seatsPerRow: 10
        });

        console.log("Created REAL Showtime:", showtime._id);
        console.log("Use this booking ID to test!");

        mongoose.disconnect();
    } catch (error) {
        console.error("Seed Error:", error);
        mongoose.disconnect();
    }
};

seedShowtime();
