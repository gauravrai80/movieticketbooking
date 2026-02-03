import React, { useState, useEffect } from 'react';
import { Grid, Save, Loader2 } from 'lucide-react';
import api from '../../utils/api';
import { format } from 'date-fns';

const SeatLayoutEditor = () => {
    const [showtimes, setShowtimes] = useState([]);
    const [selectedShowtimeId, setSelectedShowtimeId] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Grid Config (Fixed 10x10 for now as per schema default)
    const rows = 10;
    const cols = 10;

    const [selectedType, setSelectedType] = useState('premium'); // Default tool

    // Layout State: 2D Array of types
    const [layout, setLayout] = useState([]);

    useEffect(() => {
        fetchShowtimes();
    }, []);

    useEffect(() => {
        if (selectedShowtimeId) {
            loadShowtimeLayout(selectedShowtimeId);
        } else {
            // Reset layout if no showtime selected
            setLayout(Array(rows).fill().map(() => Array(cols).fill('standard')));
        }
    }, [selectedShowtimeId]);

    const fetchShowtimes = async () => {
        try {
            // 1. Fetch Theaters
            const theaterRes = await api.get('/theaters');
            const theaters = theaterRes.data || theaterRes;

            if (theaters && theaters.length > 0) {
                const theaterId = theaters[0]._id;
                // 2. Fetch Showtimes
                const res = await api.get(`/admin/showtimes/admin/theater/${theaterId}`);
                setShowtimes(res.data || res);
            }
        } catch (error) {
            console.error("Failed to fetch showtimes", error);
        }
    };

    const loadShowtimeLayout = (id) => {
        const showtime = showtimes.find(s => s._id === id);
        if (!showtime) return;

        // Reconstruct grid from showtime data
        // We know: standard is default.
        // premiumSeats = ["A1", "A2"...]

        const newLayout = Array(rows).fill().map(() => Array(cols).fill('standard'));

        // Apply Premium Seats
        if (showtime.premiumSeats) {
            showtime.premiumSeats.forEach(seatId => {
                const r = seatId.charCodeAt(0) - 65; // 'A' -> 0
                const c = parseInt(seatId.substring(1)) - 1; // '1' -> 0
                if (r >= 0 && r < rows && c >= 0 && c < cols) {
                    newLayout[r][c] = 'premium';
                }
            });
        }

        setLayout(newLayout);
    };

    const handleCellClick = (r, c) => {
        if (!selectedShowtimeId) return;
        const newLayout = [...layout.map(row => [...row])]; // Deep copy

        // Toggle logic: If clicking with same tool, revert to standard. Else apply tool.
        if (newLayout[r][c] === selectedType) {
            newLayout[r][c] = 'standard';
        } else {
            newLayout[r][c] = selectedType;
        }

        setLayout(newLayout);
    };

    const handleSave = async () => {
        if (!selectedShowtimeId) return;
        setSaving(true);
        try {
            // Convert grid back to arrays
            const premiumSeats = [];

            layout.forEach((row, r) => {
                row.forEach((type, c) => {
                    if (type === 'premium') {
                        const seatId = `${String.fromCharCode(65 + r)}${c + 1}`;
                        premiumSeats.push(seatId);
                    }
                });
            });

            // Patch the showtime
            await api.patch(`/admin/showtimes/${selectedShowtimeId}/pricing`, {
                premiumSeats
            });

            // Update local showtimes list to reflect change without re-fetch
            setShowtimes(prev => prev.map(s => {
                if (s._id === selectedShowtimeId) {
                    return { ...s, premiumSeats };
                }
                return s;
            }));

            alert('Layout updated successfully! Changes are live immediately.');
        } catch (error) {
            console.error('Failed to save layout', error);
            alert('Error saving layout.');
        } finally {
            setSaving(false);
        }
    };

    const getCellColor = (type) => {
        switch (type) {
            case 'standard': return 'bg-gray-700 hover:bg-gray-600';
            case 'premium': return 'bg-purple-600 hover:bg-purple-500 shadow-[0_0_10px_0_rgba(147,51,234,0.5)]';
            default: return 'bg-gray-800';
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-full">
            {/* Controls Side */}
            <div className="lg:col-span-1 space-y-6 flex flex-col h-full bg-primary-900/30 p-4 rounded-xl border border-primary-800">
                <div>
                    <h3 className="text-lg font-bold text-white mb-4">1. Select Showtime</h3>
                    <select
                        value={selectedShowtimeId}
                        onChange={(e) => setSelectedShowtimeId(e.target.value)}
                        className="w-full bg-primary-800 border border-primary-700 rounded p-3 text-white focus:border-accent-500 outline-none"
                    >
                        <option value="">-- Choose a Show --</option>
                        {showtimes.map(s => (
                            <option key={s._id} value={s._id}>
                                {s.movie?.title} ({format(new Date(s.startTime), 'MMM do, h:mm a')})
                            </option>
                        ))}
                    </select>
                </div>

                {selectedShowtimeId && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-300 space-y-6">
                        <div className="bg-primary-800/50 p-4 rounded-lg border border-primary-700/50">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">2. Choose Seat Type</h3>
                            <div className="space-y-2">
                                <button
                                    onClick={() => setSelectedType('premium')}
                                    className={`w-full p-3 rounded-lg text-left transition flex items-center justify-between group ${selectedType === 'premium' ? 'bg-purple-600 text-white shadow-lg' : 'bg-primary-900 text-gray-400 hover:bg-primary-700'
                                        }`}
                                >
                                    <span className="font-medium">Premium Seat</span>
                                    <div className={`w-3 h-3 rounded-full bg-purple-400 group-hover:scale-110 transition`} />
                                </button>
                                <button
                                    onClick={() => setSelectedType('standard')}
                                    className={`w-full p-3 rounded-lg text-left transition flex items-center justify-between group ${selectedType === 'standard' ? 'bg-gray-600 text-white shadow-lg' : 'bg-primary-900 text-gray-400 hover:bg-primary-700'
                                        }`}
                                >
                                    <span className="font-medium">Standard Seat</span>
                                    <div className={`w-3 h-3 rounded-full bg-gray-400 group-hover:scale-110 transition`} />
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full bg-accent-600 hover:bg-accent-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-accent-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            Save Configuration
                        </button>

                        <p className="text-xs text-center text-gray-500">
                            Updates are processed immediately and will reflect for all new user sessions.
                        </p>
                    </div>
                )}
            </div>

            {/* Visual Editor Side */}
            <div className="lg:col-span-3 bg-primary-950/50 rounded-xl p-8 border border-primary-800 flex flex-col items-center justify-center relative overflow-hidden">
                {!selectedShowtimeId ? (
                    <div className="text-center text-gray-500">
                        <Grid size={48} className="mx-auto mb-4 opacity-20" />
                        <p>Select a showtime from the left to edit its seating layout.</p>
                    </div>
                ) : (
                    <div className="animate-in zoom-in-95 duration-300">
                        <div className="w-full max-w-lg mb-12 text-center">
                            <div className="text-gray-500 text-xs font-bold tracking-[0.2em] uppercase mb-2">Screen</div>
                            <div className="h-1 bg-gradient-to-r from-transparent via-accent-500/50 to-transparent w-full shadow-[0_0_15px_rgba(225,29,72,0.5)]" />
                            <div className="w-full h-8 bg-gradient-to-b from-accent-500/10 to-transparent transform perspective-origin-center" />
                        </div>

                        <div
                            className="grid gap-3"
                            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
                        >
                            {layout.map((rowArr, r) => (
                                rowArr.map((type, c) => (
                                    <div
                                        key={`${r}-${c}`}
                                        onClick={() => handleCellClick(r, c)}
                                        className={`w-10 h-10 rounded-t-lg cursor-pointer transition-all duration-200 transform hover:scale-110 active:scale-95 flex items-center justify-center text-[10px] font-medium text-white/20 select-none ${getCellColor(type)}`}
                                        title={`Row ${String.fromCharCode(65 + r)} Seat ${c + 1}: ${type}`}
                                    >
                                        {String.fromCharCode(65 + r)}{c + 1}
                                    </div>
                                ))
                            ))}
                        </div>

                        <div className="mt-8 flex justify-center gap-6">
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <span className="w-3 h-3 rounded bg-gray-700" /> Standard
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <span className="w-3 h-3 rounded bg-purple-600 shadow-[0_0_10px_0_rgba(147,51,234,0.5)]" /> Premium
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SeatLayoutEditor;
