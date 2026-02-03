import { useState, useEffect } from 'react';
import api from '../utils/api';
import { MapPin, Clock, Film } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const MovieGluShowtimes = ({ filmId, date, onTimeSelect }) => {
    const [showtimes, setShowtimes] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (filmId && date) {
            fetchRealTimeShowtimes();
        }
    }, [filmId, date]);

    const fetchRealTimeShowtimes = async () => {
        try {
            setLoading(true);
            setError(null);
            // Fetch film showtimes from MovieGlu via our backend proxy
            // The backend route is /api/movieglu/film-showtimes?film_id=X&date=Y
            const response = await api.get(`/movieglu/film-showtimes`, {
                params: {
                    film_id: filmId,
                    date: date
                }
            });
            setShowtimes(response.data);
        } catch (err) {
            console.error('Failed to fetch MovieGlu showtimes:', err);
            setError('Could not load real-time showtimes or no showtimes available nearby.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="bg-primary-800 p-8 rounded-lg text-center text-gray-400">
            <div className="animate-pulse flex flex-col items-center">
                <Film className="mb-2 opacity-50" size={32} />
                <p>Searching nearby cinemas for real-time showtimes...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="bg-primary-900 border border-red-900/50 p-6 rounded-lg text-center">
            <p className="text-red-400 mb-2">{error}</p>
            <button
                onClick={fetchRealTimeShowtimes}
                className="text-sm text-accent-400 hover:underline"
            >
                Try Again
            </button>
        </div>
    );

    if (!showtimes || !showtimes.cinemas || showtimes.cinemas.length === 0) {
        return (
            <div className="bg-primary-800 p-8 rounded-lg text-center text-gray-400">
                <p>No nearby cinemas found showing this movie on {date}.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center text-sm text-gray-400 px-2">
                <span>Found {showtimes.cinemas.length} cinemas nearby</span>
                <span>Source: MovieGlu</span>
            </div>

            <div className="bg-yellow-900/30 border border-yellow-700/50 p-3 rounded-lg text-yellow-200 text-sm flex items-center gap-2">
                <Film size={16} />
                <span>
                    <strong>Sandbox Mode:</strong> Displaying test data. You may see showtimes for test films (e.g., "The Martian") instead of the selected movie.
                </span>
            </div>

            {showtimes.cinemas.map((cinema) => (
                <div key={cinema.cinema_id} className="bg-primary-800 rounded-lg overflow-hidden border border-primary-700">
                    <div className="p-4 bg-primary-700/50 flex justify-between items-start">
                        <div>
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <MapPin size={18} className="text-accent-500" />
                                {cinema.cinema_name}
                            </h3>
                            {cinema.distance && (
                                <p className="text-sm text-gray-400 ml-6">
                                    {cinema.distance.toFixed(1)} miles away
                                </p>
                            )}
                        </div>
                        <a
                            href={`https://maps.google.com/?q=${cinema.lat},${cinema.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-accent-400 hover:text-accent-300 border border-accent-500/30 px-2 py-1 rounded"
                        >
                            Map
                        </a>
                    </div>

                    <div className="p-4">
                        {Object.entries(cinema.showings || {}).map(([formatKey, showingType]) => (
                            <div key={formatKey} className="mb-4 last:mb-0">
                                <p className="text-sm text-gray-400 font-semibold mb-2 uppercase tracking-wide">
                                    {formatKey.replace(/_/g, ' ')}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {showingType.times.map((timeData) => (
                                        <button
                                            key={`${cinema.cinema_id}-${timeData.start_time}`}
                                            onClick={() => onTimeSelect && onTimeSelect(timeData, cinema)}
                                            className="bg-primary-900 hover:bg-accent-600 text-white px-4 py-2 rounded-md transition border border-primary-600 hover:border-accent-500 flex flex-col items-center min-w-[80px] cursor-pointer active:scale-95"
                                            title={`Ends at ${timeData.end_time}`}
                                        >
                                            <span className="font-bold text-lg">{timeData.start_time}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MovieGluShowtimes;
