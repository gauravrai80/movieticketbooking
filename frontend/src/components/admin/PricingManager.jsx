import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Calendar, Loader2, CheckCircle } from 'lucide-react';
import api from '../../utils/api';
import { format } from 'date-fns';

const PricingManager = () => {
    const [showtimes, setShowtimes] = useState([]);
    const [selectedShowtimeId, setSelectedShowtimeId] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Pricing State
    const [basePrice, setBasePrice] = useState(300);
    const [multiplier, setMultiplier] = useState(1.0);

    // Quick presets
    const multipliers = [
        { label: 'Weekday', val: 1.0 },
        { label: 'Weekend', val: 1.2 },
        { label: 'Holiday', val: 1.3 },
        { label: 'Blockbuster', val: 1.5 },
    ];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            // 1. Fetch Theaters first to get a valid ID
            const theaterRes = await api.get('/theaters');
            const theaters = theaterRes.data || theaterRes;

            if (theaters && theaters.length > 0) {
                const theaterId = theaters[0]._id;
                // 2. Fetch Showtimes for this theater
                const res = await api.get(`/admin/showtimes/admin/theater/${theaterId}`);
                setShowtimes(res.data || res);
            } else {
                console.warn("No theaters found to fetch showtimes for.");
            }
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleShowtimeSelect = (e) => {
        const id = e.target.value;
        setSelectedShowtimeId(id);
        const showtime = showtimes.find(s => s._id === id);
        if (showtime) {
            // Set base price to current price, reset multiplier
            setBasePrice(showtime.price);
            setMultiplier(1.0);
        }
    };

    const calculatePrice = (factor) => Math.round(basePrice * factor * multiplier);

    const handleUpdate = async () => {
        if (!selectedShowtimeId) return;

        try {
            setSaving(true);
            const finalPrice = calculatePrice(1.0); // Standard price

            await api.patch(`/admin/showtimes/${selectedShowtimeId}/pricing`, {
                price: finalPrice
            });

            // Update local state
            setShowtimes(prev => prev.map(s =>
                s._id === selectedShowtimeId ? { ...s, price: finalPrice } : s
            ));

            alert('Price updated successfully! This change is instantly reflected for users.');
        } catch (error) {
            console.error("Failed to update price", error);
            alert("Failed to update price");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Showtime Selector */}
            <div className="bg-primary-900/50 p-6 rounded-xl border border-primary-700/50">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Calendar className="text-accent-500" /> Select Showtime
                </h3>
                {loading ? (
                    <div className="text-gray-400">Loading showtimes...</div>
                ) : (
                    <select
                        value={selectedShowtimeId}
                        onChange={handleShowtimeSelect}
                        className="w-full bg-primary-800 border border-primary-700 rounded p-3 text-white focus:border-accent-500 outline-none"
                    >
                        <option value="">-- Choose a Show to Manage Pricing --</option>
                        {showtimes.map(s => (
                            <option key={s._id} value={s._id}>
                                {s.movie?.title} ({format(new Date(s.startTime), 'MMM do, h:mm a')}) - Currently ₹{s.price}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 transition-opacity duration-300 ${!selectedShowtimeId ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                {/* Configuration */}
                <div className="bg-primary-900/50 p-6 rounded-xl border border-primary-700/50">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <TrendingUp className="text-accent-500" /> Pricing Rules
                    </h3>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-gray-400 text-sm font-bold mb-2">Base Ticket Price (₹)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                <input
                                    type="number"
                                    value={basePrice}
                                    onChange={(e) => setBasePrice(Number(e.target.value))}
                                    className="w-full bg-primary-800 border border-primary-700 rounded-lg py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-accent-500 outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-400 text-sm font-bold mb-2">Demand Multiplier</label>
                            <div className="grid grid-cols-2 gap-2 mb-3">
                                {multipliers.map((m) => (
                                    <button
                                        key={m.label}
                                        onClick={() => setMultiplier(m.val)}
                                        className={`p-2 rounded-lg text-sm font-medium transition ${multiplier === m.val
                                            ? 'bg-accent-600 text-white'
                                            : 'bg-primary-800 text-gray-300 hover:bg-primary-700'
                                            }`}
                                    >
                                        {m.label} ({m.val}x)
                                    </button>
                                ))}
                            </div>
                            <input
                                type="range"
                                min="0.5"
                                max="2.0"
                                step="0.1"
                                value={multiplier}
                                onChange={(e) => setMultiplier(Number(e.target.value))}
                                className="w-full accent-accent-500"
                            />
                            <div className="text-right text-accent-400 font-bold mt-1">{Math.round(multiplier * 100)}%</div>
                        </div>
                    </div>
                </div>

                {/* Preview */}
                <div className="bg-gradient-to-br from-primary-800 to-primary-900 p-6 rounded-xl border border-primary-700 shadow-xl">
                    <h3 className="text-xl font-bold text-white mb-6">Price Preview</h3>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center bg-primary-950/30 p-4 rounded-lg">
                            <div>
                                <p className="text-white font-semibold">Standard Seat</p>
                                <p className="text-xs text-gray-500">Base × {multiplier}x</p>
                            </div>
                            <p className="text-2xl font-bold text-white">₹{calculatePrice(1.0)}</p>
                        </div>

                        <div className="flex justify-between items-center bg-primary-950/30 p-4 rounded-lg border border-purple-500/20">
                            <div>
                                <p className="text-purple-400 font-semibold">Premium Seat</p>
                                <p className="text-xs text-purple-500/60">Base × 1.3 × {multiplier}x</p>
                            </div>
                            <p className="text-2xl font-bold text-purple-400">₹{calculatePrice(1.3)}</p>
                        </div>

                        <div className="flex justify-between items-center bg-primary-950/30 p-4 rounded-lg border border-green-500/20">
                            <div>
                                <p className="text-green-400 font-semibold">Wheelchair</p>
                                <p className="text-xs text-green-500/60">Base × 0.5 × {multiplier}x</p>
                            </div>
                            <p className="text-2xl font-bold text-green-400">₹{calculatePrice(0.5)}</p>
                        </div>
                    </div>

                    <div className="mt-8">
                        <button
                            onClick={handleUpdate}
                            disabled={saving}
                            className="w-full bg-white text-primary-900 font-bold py-3 rounded-lg hover:bg-gray-200 transition flex justify-center items-center gap-2 disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="animate-spin" /> : <CheckCircle />}
                            {saving ? 'Updating...' : 'Update Showtime Price'}
                        </button>
                        <p className="text-center text-xs text-gray-500 mt-3">
                            Updates will apply to selected showtimes immediately.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PricingManager;
