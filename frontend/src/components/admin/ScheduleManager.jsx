import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Film, Trash2 } from 'lucide-react';
import api from '../../utils/api';
import { format } from 'date-fns';

const ScheduleManager = () => {
    const [showtimes, setShowtimes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [movies, setMovies] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        movie: '',
        screen: '',
        theater: '',
        date: '',
        startTime: '',
        endTime: '',
        price: ''
    });

    const [screens, setScreens] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const moviesRes = await api.get('/tmdb/now_playing');
            setMovies(moviesRes.results || []);

            // 1. Fetch Theaters
            const theatersRes = await api.get('/theaters');
            const theaters = theatersRes.data || theatersRes;

            if (theaters && theaters.length > 0) {
                const theaterId = theaters[0]._id;

                // 2. Fetch Theater Details (to get screens) or just assume screens are populated or fetch screens separate
                // The 'theaters' endpoint populates screens, so we can use that.
                setScreens(theaters[0].screens || []);

                // Set default form data
                setFormData(prev => ({
                    ...prev,
                    theater: theaterId,
                    screen: theaters[0].screens?.[0]?._id || ''
                }));

                // 3. Fetch Showtimes
                const showtimesRes = await api.get(`/admin/showtimes/admin/theater/${theaterId}`);
                setShowtimes(showtimesRes.data || showtimesRes);
            }
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Combine date and time
            const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
            const endDateTime = new Date(`${formData.date}T${formData.endTime}`);

            // Find selected movie details to send to backend
            const selectedMovie = movies.find(m => m.id.toString() === formData.movie);

            if (!selectedMovie) {
                alert('Please select a valid movie');
                return;
            }

            await api.post('/admin/showtimes', {
                tmdbId: selectedMovie.id,
                movieDetails: selectedMovie, // Pass full details for auto-creation
                screen: formData.screen,
                theater: formData.theater,
                startTime: startDateTime,
                endTime: endDateTime,
                price: Number(formData.price)
            });

            setIsModalOpen(false);
            // Refetch showtimes to see the new addition
            // Small delay to ensure DB write
            setTimeout(fetchData, 500);
            alert('Showtime added successfully!');
        } catch (error) {
            console.error('Error adding showtime:', error);
            alert(error.response?.data?.message || 'Failed to add showtime');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this showtime?')) return;
        try {
            await api.delete(`/admin/showtimes/${id}`);
            fetchData();
        } catch (error) {
            console.error('Error deleting showtime:', error);
        }
    };

    return (
        <div className="bg-primary-900/50 rounded-xl p-6 border border-primary-700/50 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Showtime Schedule</h3>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-accent-600 hover:bg-accent-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                >
                    + Add Showtime
                </button>
            </div>

            <div className="flex-1 overflow-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-gray-400 border-b border-primary-700 text-sm sticky top-0 bg-primary-900/90 backdrop-blur z-10">
                            <th className="py-3 font-medium">Movie</th>
                            <th className="py-3 font-medium">Screen</th>
                            <th className="py-3 font-medium">Date & Time</th>
                            <th className="py-3 font-medium">Price</th>
                            <th className="py-3 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {loading ? (
                            <tr><td colSpan="5" className="py-8 text-center text-gray-500">Loading schedule...</td></tr>
                        ) : showtimes.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="py-8 text-center text-gray-500 italic">
                                    No showtimes scheduled. Click "Add Showtime" to create one.
                                </td>
                            </tr>
                        ) : (
                            showtimes.map(show => (
                                <tr key={show._id} className="border-b border-primary-800 hover:bg-white/5 transition group">
                                    <td className="py-4 text-white font-medium flex items-center gap-3">
                                        <div className="w-8 h-12 bg-gray-700 rounded overflow-hidden flex-shrink-0">
                                            {show.movie?.posterUrl ? (
                                                <img src={`https://image.tmdb.org/t/p/w92${show.movie.posterUrl}`} alt="" className="w-full h-full object-cover" />
                                            ) : show.movie?.poster_path ? (
                                                <img src={`https://image.tmdb.org/t/p/w92${show.movie.poster_path}`} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-gray-600" />
                                            )}
                                        </div>
                                        {show.movie?.title || 'Unknown Movie'}
                                    </td>
                                    <td className="py-4 text-gray-300">Screen {show.screen?.screenNumber || '1'}</td>
                                    <td className="py-4 text-gray-300">
                                        <div className="flex flex-col">
                                            <span>{format(new Date(show.startTime), 'MMM do, yyyy')}</span>
                                            <span className="text-xs text-gray-500">
                                                {format(new Date(show.startTime), 'h:mm a')} - {format(new Date(show.endTime), 'h:mm a')}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-4 text-accent-400 font-bold">₹{show.price}</td>
                                    <td className="py-4 text-right">
                                        <button
                                            onClick={() => handleDelete(show._id)}
                                            className="text-red-400 hover:text-red-300 transition p-2 hover:bg-red-400/10 rounded opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add Showtime Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-primary-900 rounded-xl border border-primary-700 shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold text-white mb-4">Add New Showtime</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Select Movie (TMDB Now Playing)</label>
                                <select
                                    name="movie"
                                    value={formData.movie}
                                    onChange={handleInputChange}
                                    className="w-full bg-primary-800 border border-primary-700 rounded p-2.5 text-white focus:border-accent-500 outline-none"
                                    required
                                >
                                    <option value="">-- Choose Movie --</option>
                                    {movies.map(m => (
                                        <option key={m.id} value={m.id}>{m.title}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Select Screen</label>
                                <select
                                    name="screen"
                                    value={formData.screen}
                                    onChange={handleInputChange}
                                    className="w-full bg-primary-800 border border-primary-700 rounded p-2.5 text-white focus:border-accent-500 outline-none"
                                    required
                                >
                                    <option value="">-- Choose Screen --</option>
                                    {screens.map(s => (
                                        <option key={s._id} value={s._id}>
                                            Screen {s.screenNumber} ({s.format})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Date</label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleInputChange}
                                        className="w-full bg-primary-800 border border-primary-700 rounded p-2.5 text-white focus:border-accent-500 outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Price (₹)</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        placeholder="300"
                                        className="w-full bg-primary-800 border border-primary-700 rounded p-2.5 text-white focus:border-accent-500 outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Start Time</label>
                                    <input
                                        type="time"
                                        name="startTime"
                                        value={formData.startTime}
                                        onChange={handleInputChange}
                                        className="w-full bg-primary-800 border border-primary-700 rounded p-2.5 text-white focus:border-accent-500 outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">End Time</label>
                                    <input
                                        type="time"
                                        name="endTime"
                                        value={formData.endTime}
                                        onChange={handleInputChange}
                                        className="w-full bg-primary-800 border border-primary-700 rounded p-2.5 text-white focus:border-accent-500 outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-primary-800 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-accent-600 hover:bg-accent-700 text-white px-6 py-2 rounded-lg font-bold transition shadow-lg shadow-accent-600/20"
                                >
                                    Create Showtime
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScheduleManager;
