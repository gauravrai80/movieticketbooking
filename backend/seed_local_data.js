import mongoose from 'mongoose';
import Movie from './models/Movie.js';
import Theater from './models/Theater.js';
import Screen from './models/Screen.js';
import Showtime from './models/Showtime.js';

const seedData = async () => {
    try {
        const uri = "mongodb+srv://ticket_booking_db:Gaurav%40224042@ticketbooking.u8uoqua.mongodb.net/?retryWrites=true&w=majority&appName=ticketBooking";
        console.log('Connecting to MongoDB...');

        await mongoose.connect(uri);
        console.log('MongoDB Connected successfully.');

        // 1. Create Local Theater
        let theater = await Theater.findOne({ name: 'Grand Cineplex' });
        if (!theater) {
            console.log('Creating Theater...');
            theater = await Theater.create({
                name: 'Grand Cineplex',
                city: 'Metropolis',
                address: '123 Cinema Blvd',
                facilities: ['parking', 'food-court', 'wheelchair-accessible', 'premium-seats']
            });
        }

        // Helper to generate seat map
        const generateSeats = (rows, cols) => {
            const seats = [];
            const layout = [];
            const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

            for (let r = 0; r < rows; r++) {
                const rowLabel = alphabet[r];
                const rowArr = [];
                for (let c = 1; c <= cols; c++) {
                    const seatId = `${rowLabel}${c}`;
                    seats.push(seatId);
                    rowArr.push(seatId);
                }
                layout.push(rowArr);
            }
            return { seats, layout };
        };

        // 2. Create Screens with Real Layouts
        console.log('Update Screens...');

        // Screen 1: Standard (10 rows x 12 cols)
        let screen1 = await Screen.findOne({ theater: theater._id, screenNumber: 1 });
        const s1Data = generateSeats(10, 12);
        // Mark last 2 rows as premium
        const s1Premium = s1Data.seats.filter(s => s.startsWith('I') || s.startsWith('J'));

        if (!screen1) {
            screen1 = await Screen.create({
                theater: theater._id,
                screenNumber: 1,
                format: '2D',
                totalSeats: s1Data.seats.length,
                seating: {
                    rows: 10,
                    columns: 12,
                    layout: s1Data.layout
                },
                premiumSeats: s1Premium
            });
            console.log('Created Screen 1 (Standard)');
        } else {
            // Update existing screen layout
            screen1.seating = { rows: 10, columns: 12, layout: s1Data.layout };
            screen1.totalSeats = s1Data.seats.length;
            screen1.premiumSeats = s1Premium;
            await screen1.save();
            console.log('Updated Screen 1');
        }

        // Screen 2: IMAX (8 rows x 15 cols)
        let screen2 = await Screen.findOne({ theater: theater._id, screenNumber: 2 });
        const s2Data = generateSeats(8, 15);
        const s2Premium = s2Data.seats.filter(s => s.startsWith('G') || s.startsWith('H'));

        if (!screen2) {
            screen2 = await Screen.create({
                theater: theater._id,
                screenNumber: 2,
                format: 'IMAX',
                totalSeats: s2Data.seats.length,
                seating: {
                    rows: 8,
                    columns: 15,
                    layout: s2Data.layout
                },
                premiumSeats: s2Premium
            });
            console.log('Created Screen 2 (IMAX)');
        } else {
            screen2.seating = { rows: 8, columns: 15, layout: s2Data.layout };
            screen2.totalSeats = s2Data.seats.length;
            screen2.premiumSeats = s2Premium;
            await screen2.save();
            console.log('Updated Screen 2');
        }

        theater.screens = [screen1._id, screen2._id];
        await theater.save();

        // 3. Ensure Movies
        const movies = await Movie.find({});
        if (movies.length === 0) {
            console.log('Creating dummy movie...');
            await Movie.create({
                title: "The Wrecking Crew",
                description: "Action comedy.",
                genre: ["Action"],
                duration: 120,
                releaseDate: new Date(),
                language: ["English"],
                format: ["2D"],
                posterUrl: "https://via.placeholder.com/300x450"
            });
        }

        // 4. Generate Showtimes
        console.log('Regenerating Showtimes...');
        // Delete existing future showtimes to reset data structure
        await Showtime.deleteMany({ startTime: { $gt: new Date() } });

        const showtimes = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < 7; i++) {
            const currentDate = new Date(today);
            currentDate.setDate(today.getDate() + i);
            const timeSlots = [10, 13, 16, 19, 22];

            for (const movie of movies) {
                const screen = Math.random() > 0.5 ? screen1 : screen2;
                const screenSeats = screen.screenNumber === 1 ? s1Data.seats : s2Data.seats;

                for (const hour of timeSlots) {
                    if (Math.random() > 0.6) continue;

                    const startTime = new Date(currentDate);
                    startTime.setHours(hour, 0, 0, 0);

                    const endTime = new Date(startTime);
                    endTime.setMinutes(startTime.getMinutes() + (movie.duration || 120));

                    // Randomly book some seats (20-30%)
                    const bookedSeats = screenSeats.filter(() => Math.random() < 0.2);

                    showtimes.push({
                        movie: movie._id,
                        theater: theater._id,
                        screen: screen._id,
                        startTime,
                        endTime,
                        price: 150.00,
                        totalSeats: screen.totalSeats,
                        availableSeats: screenSeats,
                        bookedSeats: bookedSeats,
                        status: 'available'
                    });
                }
            }
        }

        if (showtimes.length > 0) {
            await Showtime.insertMany(showtimes);
            console.log(`Successfully created ${showtimes.length} new showtimes with updated seat maps.`);
        }

        console.log('Seeding Complete!');
        process.exit(0);

    } catch (error) {
        console.error('Seeding Failed:', error);
        process.exit(1);
    }
};

seedData();
