import MovieGluService from './movieGluService.js';
import Movie from '../models/Movie.js';
import Theater from '../models/Theater.js';
import Showtime from '../models/Showtime.js';
import Screen from '../models/Screen.js';
import { logEmailError } from '../utils/emailLogger.js';
import syncRetry from '../utils/syncRetry.js';
import syncMetrics from '../utils/syncMetrics.js';

class CinemaDataSyncService {

    // SYNC MOVIES
    async syncMoviesFromMovieGlu() {
        console.log('[CinemaSync] Starting movie sync...');
        const result = { synced: 0, updated: 0, errors: [] };
        const startTime = Date.now();

        try {
            await syncRetry.executeWithRetry(async () => {
                const data = await MovieGluService.getMoviesNowShowing(50);
                const films = data.films || [];

                for (const filmData of films) {
                    try {
                        let movie = await Movie.findOne({ title: filmData.film_name });

                        if (!movie) {
                            movie = new Movie({
                                title: filmData.film_name,
                                description: filmData.synopsis_long || 'No synopsis available',
                                genre: filmData.genres ? filmData.genres.map(g => g.genre_name) : ['Unknown'],
                                duration: filmData.duration_mins || 120,
                                releaseDate: filmData.release_dates ? new Date(filmData.release_dates[0].release_date) : new Date(),
                                posterUrl: filmData.images?.poster?.['1']?.medium?.film_image || '',
                                backdropUrl: filmData.images?.still?.['1']?.medium?.film_image || '',
                                rating: 0,
                                language: ['English'],
                                format: ['2D'],
                                releaseStatus: 'now-showing'
                            });
                            await movie.save();
                            result.synced++;
                        } else {
                            result.updated++;
                        }
                    } catch (err) {
                        console.error(`Error syncing film ${filmData.film_name}:`, err.message);
                        result.errors.push({ film: filmData.film_name, error: err.message });
                    }
                }
            });

            console.log(`[CinemaSync] Movies synced: ${result.synced}, Updated: ${result.updated}`);
            syncMetrics.recordSync(true, Date.now() - startTime);

        } catch (error) {
            console.error('[CinemaSync] Movie sync failed:', error.message);
            syncMetrics.recordSync(false, Date.now() - startTime, error);
            throw error;
        }
        return result;
    }

    // SYNC SHOWTIMES
    async syncShowtimesForTheaters(startDate, endDate) {
        console.log('[CinemaSync] Starting showtime sync...');
        const result = { synced: 0, errors: [] };
        const startTime = Date.now();

        try {
            const theaters = await Theater.find({ syncEnabled: true, movieGluCinemaId: { $exists: true, $ne: null } });

            for (const theater of theaters) {
                console.log(`[CinemaSync] Syncing theater: ${theater.name}`);

                const start = new Date(startDate || new Date());
                const end = new Date(endDate || new Date(start.getTime() + 24 * 60 * 60 * 1000));

                for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                    const dateStr = d.toISOString().split('T')[0];

                    try {
                        await syncRetry.executeWithRetry(async () => {
                            const data = await MovieGluService.getCinemaShowtimes(theater.movieGluCinemaId, dateStr);
                            const films = data.films || [];

                            for (const film of films) {
                                const movie = await Movie.findOne({ title: film.film_name });
                                if (!movie) continue;

                                const screens = await Screen.find({ theater: theater._id });
                                if (screens.length === 0) continue;

                                const showings = film.showings?.Standard?.times || [];

                                for (const time of showings) {
                                    const [hours, mins] = time.start_time.split(':');
                                    const startTime = new Date(dateStr);
                                    startTime.setHours(parseInt(hours), parseInt(mins), 0);

                                    const endTime = new Date(startTime.getTime() + movie.duration * 60000);

                                    const exists = await Showtime.exists({
                                        theater: theater._id,
                                        movie: movie._id,
                                        startTime: startTime
                                    });

                                    if (!exists) {
                                        const screen = screens[Math.floor(Math.random() * screens.length)];
                                        await Showtime.create({
                                            movie: movie._id,
                                            theater: theater._id,
                                            screen: screen._id,
                                            startTime,
                                            endTime,
                                            price: 250,
                                            totalSeats: screen.totalSeats,
                                            availableSeats: Array.from({ length: screen.totalSeats }, (_, i) => `seat_${i + 1}`),
                                            bookedSeats: [],
                                            status: 'available'
                                        });
                                        result.synced++;
                                    }
                                }
                            }
                        });
                    } catch (err) {
                        console.error(`Error syncing theater ${theater.name} date ${dateStr}:`, err.message);
                        result.errors.push({ theater: theater.name, date: dateStr, error: err.message });
                    }
                }
            }

            console.log(`[CinemaSync] Showtimes generated: ${result.synced}`);
            syncMetrics.recordSync(true, Date.now() - startTime);

        } catch (error) {
            console.error('[CinemaSync] Showtime sync failed:', error.message);
            syncMetrics.recordSync(false, Date.now() - startTime, error);
            throw error;
        }
        return result;
    }
}

export default new CinemaDataSyncService();
