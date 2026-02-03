import { useState, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { enIN } from 'date-fns/locale';
import { Filter, Clock, MapPin, Tag } from 'lucide-react';

const ShowtimeList = ({ showtimes, onSelectShowtime }) => {
    const [selectedTheater, setSelectedTheater] = useState('all');
    const [selectedTime, setSelectedTime] = useState('all');
    const [sortBy, setSortBy] = useState('time');

    // Extract unique theaters
    const theaters = useMemo(() => {
        const unique = new Set(showtimes.map(s => s.theater?.name).filter(Boolean));
        return Array.from(unique).sort();
    }, [showtimes]);

    // Filter and Sort
    const filteredShowtimes = useMemo(() => {
        let result = [...showtimes];

        // Filter by Theater
        if (selectedTheater !== 'all') {
            result = result.filter(s => s.theater?.name === selectedTheater);
        }

        // Filter by Time
        if (selectedTime !== 'all') {
            result = result.filter(s => {
                const hour = parseISO(s.startTime).getHours();
                if (selectedTime === 'morning') return hour < 12;
                if (selectedTime === 'afternoon') return hour >= 12 && hour < 17;
                if (selectedTime === 'evening') return hour >= 17 && hour < 21;
                if (selectedTime === 'night') return hour >= 21;
                return true;
            });
        }

        // Sort
        result.sort((a, b) => {
            if (sortBy === 'price-low') return a.price - b.price;
            if (sortBy === 'price-high') return b.price - a.price;
            // Default: time
            return new Date(a.startTime) - new Date(b.startTime);
        });

        return result;
    }, [showtimes, selectedTheater, selectedTime, sortBy]);

    // Group by date for display
    const groupedShowtimes = useMemo(() => {
        const grouped = {};
        filteredShowtimes.forEach(showtime => {
            const dateKey = format(parseISO(showtime.startTime), 'dd/MM/yyyy', { locale: enIN });
            if (!grouped[dateKey]) {
                grouped[dateKey] = [];
            }
            grouped[dateKey].push(showtime);
        });
        return grouped;
    }, [filteredShowtimes]);

    return (
        <div className="bg-primary-900 rounded-lg border border-primary-800 p-6">
            {/* Filters & Controls */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                {/* Theater Filter */}
                <div className="flex-1">
                    <label htmlFor="theater-filter" className="block text-sm font-medium text-gray-400 mb-1">
                        Filter by Theater
                    </label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} aria-hidden="true" />
                        <select
                            id="theater-filter"
                            value={selectedTheater}
                            onChange={(e) => setSelectedTheater(e.target.value)}
                            className="w-full bg-primary-800 border border-primary-700 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 appearance-none"
                        >
                            <option value="all">All Theaters</option>
                            {theaters.map(theater => (
                                <option key={theater} value={theater}>{theater}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Time Filter */}
                <div className="flex-1">
                    <label htmlFor="time-filter" className="block text-sm font-medium text-gray-400 mb-1">
                        Filter by Time
                    </label>
                    <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} aria-hidden="true" />
                        <select
                            id="time-filter"
                            value={selectedTime}
                            onChange={(e) => setSelectedTime(e.target.value)}
                            className="w-full bg-primary-800 border border-primary-700 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 appearance-none"
                        >
                            <option value="all">All Times</option>
                            <option value="morning">Morning (Before 12 PM)</option>
                            <option value="afternoon">Afternoon (12 PM - 5 PM)</option>
                            <option value="evening">Evening (5 PM - 9 PM)</option>
                            <option value="night">Night (After 9 PM)</option>
                        </select>
                    </div>
                </div>

                {/* Sort */}
                <div className="w-full md:w-48">
                    <label htmlFor="sort-options" className="block text-sm font-medium text-gray-400 mb-1">
                        Sort By
                    </label>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} aria-hidden="true" />
                        <select
                            id="sort-options"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full bg-primary-800 border border-primary-700 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 appearance-none"
                        >
                            <option value="time">Show Time</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Showtimes List */}
            {Object.keys(groupedShowtimes).length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <p className="text-lg">No showtimes found matching your filters.</p>
                    <button
                        onClick={() => { setSelectedTheater('all'); setSelectedTime('all'); }}
                        className="mt-2 text-accent-400 hover:text-accent-300 underline"
                    >
                        Clear Filters
                    </button>
                </div>
            ) : (
                <div className="space-y-8">
                    {Object.entries(groupedShowtimes).map(([date, shows]) => (
                        <div key={date}>
                            <h3 className="text-accent-400 font-bold mb-4 border-b border-primary-800 pb-2">{date}</h3>
                            <div className="grid gap-3">
                                {shows.map(showtime => (
                                    <div
                                        key={showtime._id}
                                        className="bg-primary-800 rounded-lg p-4 flex flex-col md:flex-row justify-between items-center hover:bg-primary-700 transition group border border-transparent hover:border-accent-500/30"
                                    >
                                        <div className="flex items-center gap-6 mb-4 md:mb-0 w-full md:w-auto">
                                            <div className="min-w-[100px] text-center md:text-left">
                                                <p className="text-xl font-bold text-white">
                                                    {format(parseISO(showtime.startTime), 'h:mm a')}
                                                </p>
                                                <p className="text-xs text-gray-400 uppercase tracking-wider">{showtime.format?.join(', ') || 'Standard'}</p>
                                            </div>

                                            <div className="flex-1">
                                                <p className="text-white font-medium flex items-center gap-2">
                                                    <MapPin size={14} className="text-accent-500" />
                                                    {showtime.theater?.name}
                                                </p>
                                                <div className="flex gap-4 text-sm text-gray-400 mt-1">
                                                    <span className="flex items-center gap-1">
                                                        <Tag size={12} /> ₹{showtime.price}
                                                    </span>
                                                    <span className="text-green-400 bg-green-400/10 px-2 rounded-full text-xs py-0.5">
                                                        {showtime.availableSeats?.length || 0} seats left
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => onSelectShowtime(showtime)}
                                            className="w-full md:w-auto bg-accent-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-accent-700 transition shadow-lg shadow-accent-600/20"
                                        >
                                            Select
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ShowtimeList;
