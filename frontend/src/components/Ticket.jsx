import React from 'react';
import { QrCode, MapPin, Calendar, Clock, Ticket as TicketIcon } from 'lucide-react';
import { format } from 'date-fns';

const Ticket = ({ booking, onClose }) => {
    const { movie, showtime, theater, seats, bookingReference, totalAmount } = booking;

    return (
        <div className="bg-primary-900 text-white w-full max-w-md mx-auto rounded-3xl overflow-hidden shadow-2xl border border-primary-800 relative ticket-container">
            {/* Visual cutout circles for ticket effect */}
            <div className="absolute top-1/2 -left-4 w-8 h-8 bg-primary-950 rounded-full z-10"></div>
            <div className="absolute top-1/2 -right-4 w-8 h-8 bg-primary-950 rounded-full z-10"></div>

            {/* Header/Poster Section */}
            <div className="relative h-48 bg-gray-800">
                <div className="absolute inset-0">
                    {movie.backdropUrl || movie.posterUrl || movie.poster_path ? (
                        <img
                            src={movie.backdropUrl || movie.posterUrl ? (movie.backdropUrl || movie.posterUrl) : `https://image.tmdb.org/t/p/w780${movie.backdrop_path || movie.poster_path}`}
                            alt={movie.title}
                            className="w-full h-full object-cover opacity-60 mix-blend-overlay"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-accent-900">
                            <TicketIcon size={48} className="text-white/20" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary-900 via-transparent to-transparent" />
                </div>

                <div className="absolute bottom-4 left-6 right-6">
                    <h2 className="text-2xl font-bold leading-tight shadow-black drop-shadow-lg">{movie.title}</h2>
                    <p className="text-gray-300 text-sm mt-1 opacity-90">{movie.genre?.join(', ')}</p>
                </div>
            </div>

            {/* Ticket Body */}
            <div className="p-6 pt-2 space-y-6">

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Date</p>
                        <div className="flex items-center gap-2 text-sm font-semibold">
                            <Calendar size={14} className="text-accent-500" />
                            {showtime ? format(new Date(showtime.startTime), 'MMM do, yyyy') : 'N/A'}
                        </div>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Time</p>
                        <div className="flex items-center gap-2 text-sm font-semibold">
                            <Clock size={14} className="text-accent-500" />
                            {showtime ? format(new Date(showtime.startTime), 'h:mm a') : 'N/A'}
                        </div>
                    </div>
                    <div className="col-span-2">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Cinema</p>
                        <div className="flex items-center gap-2 text-sm font-semibold">
                            <MapPin size={14} className="text-accent-500" />
                            {theater.name}
                        </div>
                        <p className="text-xs text-gray-400 mt-1 ml-6">{theater.location || 'Downtown'}</p>
                    </div>
                </div>

                {/* Divider with dashed line */}
                <div className="relative flex items-center justify-center">
                    <div className="w-full border-t-2 border-dashed border-primary-700"></div>
                </div>

                {/* Seats & Screen */}
                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Screen</p>
                        <p className="text-xl font-bold">{showtime.screen ? showtime.screen.screenNumber : '1'}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Seats</p>
                        <p className="text-xl font-bold text-accent-400">{seats.join(', ')}</p>
                        <p className="text-xs text-gray-600">{seats.length} Tickets</p>
                    </div>
                </div>

                {/* QR Code Section */}
                <div className="bg-white p-4 rounded-xl flex items-center justify-between">
                    <div className="text-black">
                        <p className="text-xs font-bold uppercase tracking-wider mb-1 text-gray-500">Booking ID</p>
                        <p className="font-mono font-bold text-lg tracking-widest">{bookingReference}</p>
                    </div>
                    {/* Mock QR Code */}
                    <div className="bg-black p-1 rounded">
                        <QrCode size={48} className="text-white" />
                    </div>
                </div>

                {/* Buttons (Hidden when printing) */}
                {!onClose ? null : ( // If no onClose prop, assume we are in a print-only or embedded context where buttons might be handled externally, but here we keep them inside the modal context
                    <div className="print:hidden space-y-3 pt-2">
                        <button
                            onClick={() => window.print()}
                            className="w-full bg-accent-600 hover:bg-accent-700 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-accent-600/20"
                        >
                            Download / Print Ticket
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full bg-primary-800 hover:bg-primary-700 text-gray-300 font-medium py-3 rounded-xl transition"
                        >
                            Close
                        </button>
                    </div>
                )}
            </div>

            {/* Print Styles */}
            <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .ticket-container, .ticket-container * {
            visibility: visible;
          }
          .ticket-container {
            position: absolute;
            left: 50%;
            top: 20px;
            transform: translateX(-50%);
            width: 100%;
            max-width: 400px;
            border: 1px solid #ddd;
            box-shadow: none;
            color: black;
            background: white !important;
          }
          .bg-primary-900 { background: white !important; color: black !important; }
          .bg-primary-950 { display: none; } /* Hide cutouts which might look weird */
          .text-white { color: black !important; }
          .text-gray-300, .text-gray-400, .text-gray-500 { color: #555 !important; }
          .bg-gray-800 { background: #f0f0f0 !important; }
          .text-accent-400, .text-accent-500 { color: black !important; }
          .bg-accent-900 { background: #ddd !important; }
        }
      `}</style>
        </div>
    );
};

export default Ticket;
