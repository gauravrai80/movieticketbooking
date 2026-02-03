import { useMemo, useState } from 'react';
import classNames from 'classnames';
import { Sofa, Info } from 'lucide-react';

const SeatSelector = ({
    showtime,
    selectedSeats,
    onSeatClick,
    disabled
}) => {
    const { rows, columns, layout } = showtime?.screen?.seating || { rows: 8, columns: 10, layout: [] };
    const premiumSeats = showtime?.screen?.premiumSeats || [];

    // Calculate stats
    const stats = useMemo(() => {
        let total = 0;
        let booked = 0;
        let available = 0;
        let unavailable = 0;

        // Count based on layout or fallback dimensions
        if (layout && layout.length > 0) {
            layout.flat().forEach(seatId => {
                total++;
                if (showtime.bookedSeats?.includes(seatId)) booked++;
                else if (showtime.availableSeats?.includes(seatId)) available++;
                else unavailable++; // If not in available or booked, assume unavailable/blocked
            });
        } else {
            // Fallback calculation
            total = rows * columns;
            booked = showtime.bookedSeats?.length || 0;
            available = total - booked; // Simplification for fallback
        }

        return { total, booked, available, unavailable };
    }, [showtime, layout, rows, columns]);

    const getSeatStatus = (seatId) => {
        if (showtime.bookedSeats?.includes(seatId)) return 'booked';
        if (selectedSeats.includes(seatId)) return 'selected';

        // Robust check for availability
        if (!showtime.availableSeats || showtime.availableSeats.length === 0) {
            // Fallback: If no explicit available list, check if NOT booked
            return showtime.bookedSeats?.includes(seatId) ? 'booked' : 'available';
        }

        if (showtime.availableSeats.includes(seatId)) return 'available';
        return 'unavailable';
    };

    const gridLayout = useMemo(() => {
        if (layout && layout.length > 0) return layout;

        const generated = [];
        const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (let r = 0; r < rows; r++) {
            const rowArr = [];
            for (let c = 1; c <= columns; c++) {
                rowArr.push(`${alpha[r]}${c}`);
            }
            generated.push(rowArr);
        }
        return generated;
    }, [layout, rows, columns]);

    return (
        <div className="w-full flex flex-col gap-6" aria-label="Seat Selection Map">

            {/* Capacity Stats */}
            <div className="flex justify-center gap-4 md:gap-8 text-xs md:text-sm bg-primary-900/50 p-3 rounded-lg border border-primary-800 mx-auto w-fit">
                <div className="flex flex-col items-center">
                    <span className="text-gray-400 font-medium">Available</span>
                    <span className="text-white font-bold text-lg">{stats.available}</span>
                </div>
                <div className="w-px bg-primary-700" />
                <div className="flex flex-col items-center">
                    <span className="text-gray-400 font-medium">Booked</span>
                    <span className="text-white font-bold text-lg">{stats.booked}</span>
                </div>
                <div className="w-px bg-primary-700" />
                <div className="flex flex-col items-center">
                    <span className="text-gray-400 font-medium">Selected</span>
                    <span className="text-accent-400 font-bold text-lg">{selectedSeats.length}</span>
                </div>
            </div>

            <div className="w-full overflow-x-auto pb-8 pt-4 custom-scrollbar">
                {/* Screen Visual */}
                <div className="flex flex-col items-center mb-12 w-[min(100%,_600px)] mx-auto px-4 perspective-[500px]">
                    <div className="w-full h-12 bg-gradient-to-b from-accent-500/20 to-transparent transform rotate-x-[60deg] origin-bottom rounded-t-3xl border-t border-accent-500/50 box-shadow-[0_-10px_40px_rgba(236,72,153,0.3)] backdrop-blur-sm" />
                    <span className="text-accent-500 text-xs tracking-[0.3em] font-bold mt-2 opacity-80">SCREEN</span>
                </div>

                {/* Grid */}
                <div className="flex flex-col items-center gap-3 min-w-max mx-auto px-6">
                    {gridLayout.map((row, rIndex) => (
                        <div key={rIndex} className="flex items-center gap-4">
                            {/* Row Label */}
                            <span className="w-6 text-right text-gray-500 text-xs font-bold font-mono">
                                {row[0].charAt(0)}
                            </span>

                            <div className="flex gap-2.5">
                                {row.map((seatId) => {
                                    const status = getSeatStatus(seatId);
                                    const isPremium = premiumSeats.includes(seatId);
                                    const isDisabled = disabled || status === 'booked' || status === 'unavailable';

                                    let label = `Seat ${seatId}`;
                                    if (status === 'booked') label += ' (Booked)';
                                    else if (status === 'unavailable') label += ' (Unavailable)';
                                    else if (status === 'selected') label += ' (Selected)';
                                    else label += ' (Available)';

                                    if (isPremium) label += ', Premium Seat';

                                    return (
                                        <button
                                            key={seatId}
                                            disabled={isDisabled}
                                            onClick={() => onSeatClick(seatId)}
                                            aria-label={label}
                                            aria-disabled={isDisabled}
                                            aria-pressed={status === 'selected'}
                                            className={classNames(
                                                'group relative flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-t-xl rounded-b-md transition-all duration-300 ease-out',
                                                {
                                                    // Available - Standard
                                                    'bg-primary-700 hover:bg-primary-600 hover:-translate-y-1 text-gray-400 hover:text-white shadow-sm ring-1 ring-white/5': status === 'available' && !isPremium,

                                                    // Available - Premium
                                                    'bg-purple-900/40 hover:bg-purple-800/60 hover:-translate-y-1 text-purple-300 hover:text-purple-100 border border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.1)]': status === 'available' && isPremium,

                                                    // Selected
                                                    'bg-gradient-to-br from-accent-500 to-pink-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.6)] scale-110 -translate-y-1 ring-2 ring-white/20 z-10': status === 'selected',

                                                    // Booked
                                                    'bg-primary-800/80 text-gray-700 cursor-not-allowed border border-transparent opacity-60': status === 'booked',

                                                    // Unavailable
                                                    'bg-primary-900 opacity-0 pointer-events-none': status === 'unavailable'
                                                }
                                            )}
                                        >
                                            <span className="text-[10px] md:text-xs font-semibold z-10 font-mono tracking-tighter">{seatId.substring(1)}</span>

                                            {/* Glow for selected */}
                                            {status === 'selected' && (
                                                <div className="absolute inset-0 rounded-t-xl rounded-b-md bg-accent-400 blur-md opacity-40 -z-10" />
                                            )}

                                            {/* Armrest / Depth effect */}
                                            <div className={classNames(
                                                "absolute -bottom-1 w-[80%] h-1 rounded-b-full transition-colors",
                                                status === 'selected' ? 'bg-pink-900/80' : 'bg-black/40'
                                            )} />

                                            {/* Premium Indicator Dot */}
                                            {isPremium && status !== 'selected' && status !== 'booked' && (
                                                <div className="absolute top-1 right-1 w-1 h-1 rounded-full bg-purple-400 opacity-70" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-xs text-gray-400 border-t border-primary-800/50 pt-6">
                <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-t-lg rounded-b-md bg-primary-700 ring-1 ring-white/5" />
                    <span>Available</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-t-lg rounded-b-md bg-gradient-to-br from-accent-500 to-pink-600 shadow-[0_0_8px_rgba(236,72,153,0.5)]" />
                    <span>Selected</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-t-lg rounded-b-md bg-primary-800/80 opacity-60 border border-primary-700" />
                    <span>Booked</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-t-lg rounded-b-md bg-purple-900/40 border border-purple-500/30" />
                    <span>Premium (+₹50)</span>
                </div>
            </div>
        </div>
    );
};

export default SeatSelector;
