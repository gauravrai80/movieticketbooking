'use client';

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import {
  Ticket, Calendar, MapPin, AlertCircle, Download, Eye,
  X, Printer, Filter, ArrowDownUp, CheckCircle, Clock, XCircle
} from 'lucide-react';
import TicketView from '../components/Ticket';
import jsPDF from 'jspdf';

const MyBookings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  // UI State
  const [filterStatus, setFilterStatus] = useState('all'); // all, confirmed, pending, cancelled
  const [sortOrder, setSortOrder] = useState('newest'); // newest, oldest, showtime
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchBookings();
  }, [user, navigate]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await api.get('/bookings/user/my-bookings');
      setBookings(data);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) return;

    setCancellingId(bookingId);
    try {
      await api.put(`/bookings/${bookingId}/cancel`, {
        cancellationReason: 'User requested cancellation via Dashboard'
      });
      alert('Booking cancelled successfully. A refund will be processed shortly.');
      fetchBookings(); // Refresh list
    } catch (error) {
      alert(error.message || 'Failed to cancel booking');
    } finally {
      setCancellingId(null);
    }
  };

  // Note: html2canvas is needed for more complex rendering if we were capturing DOM,
  // but for clean PDFs we'll draw directly or use a simplified approach.
  // However, drawing directly is tedious. Let's use a simple text-based approach for reliability first.

  const downloadTicketHtml = (booking, e) => {
    e.stopPropagation();

    // Create new PDF document
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a5' // Ticket size
    });

    // Background color (simulated with a rectangle)
    doc.setFillColor(30, 41, 59); // primary-900 equivalent
    doc.rect(0, 0, 148, 210, 'F');

    // Branding
    doc.setTextColor(225, 29, 72); // accent-600
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('MTB', 74, 20, { align: 'center' });

    // Separator
    doc.setLineWidth(0.5);
    doc.setDrawColor(225, 29, 72);
    doc.line(20, 25, 128, 25);

    // Movie Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    // Handle long titles
    const splitTitle = doc.splitTextToSize(booking.movie?.title, 100);
    doc.text(splitTitle, 74, 40, { align: 'center' });

    // Details Box
    doc.setFillColor(15, 23, 42); // primary-950
    doc.roundedRect(15, 55, 118, 100, 5, 5, 'F');

    // Info Function
    const addInfo = (label, value, y) => {
      doc.setFontSize(10);
      doc.setTextColor(148, 163, 184); // gray-400
      doc.text(label.toUpperCase(), 25, y);

      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255);
      doc.text(value, 25, y + 6);
    };

    let yPos = 70;
    addInfo('Theater', booking.theater?.name || 'Unknown', yPos);

    yPos += 20;
    const dateStr = new Date(booking.showtime?.startTime).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    addInfo('Date', dateStr, yPos);

    yPos += 20;
    const timeStr = new Date(booking.showtime?.startTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    addInfo('Time', timeStr, yPos);

    yPos += 20;
    addInfo('Seats', booking.seats.join(', '), yPos);

    yPos += 20;
    addInfo('Total Amount', `INR ${booking.totalAmount}`, yPos);

    // Booking Reference (Highly Visible)
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(25, 170, 98, 20, 2, 2, 'F');

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('BOOKING REFERENCE', 74, 176, { align: 'center' });

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(booking.bookingReference, 74, 185, { align: 'center' });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.text('Please show this ticket at the cinema entrance.', 74, 200, { align: 'center' });
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 74, 204, { align: 'center' });

    doc.save(`Ticket-${booking.bookingReference}.pdf`);
  };

  // Processing: Filter & Sort
  const processedBookings = useMemo(() => {
    let result = [...bookings];

    // Filter
    if (filterStatus !== 'all') {
      result = result.filter(b => b.bookingStatus === filterStatus);
    }

    // Sort
    if (sortOrder === 'newest') {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortOrder === 'oldest') {
      result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortOrder === 'upcoming') {
      result.sort((a, b) => new Date(a.showtime?.startTime) - new Date(b.showtime?.startTime));
    }

    return result;
  }, [bookings, filterStatus, sortOrder]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed': return <span className="bg-green-900/50 text-green-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-green-800"><CheckCircle size={12} /> Confirmed</span>;
      case 'cancelled': return <span className="bg-red-900/50 text-red-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-red-800"><XCircle size={12} /> Cancelled</span>;
      default: return <span className="bg-yellow-900/50 text-yellow-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-yellow-800"><Clock size={12} /> Pending</span>;
    }
  };

  if (loading) return <div className="min-h-screen bg-primary-950 flex items-center justify-center text-gray-400 flex-col gap-4"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-500"></div>Loading your bookings...</div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-primary-950 flex items-center justify-center p-4">
        <div className="text-center max-w-md bg-primary-900 p-8 rounded-xl shadow-2xl border border-primary-800">
          <AlertCircle className="mx-auto mb-4 text-accent-500" size={64} />
          <h2 className="text-2xl font-bold text-white mb-2">Access Restricted</h2>
          <p className="text-gray-400 mb-6">Please log in to view and manage your bookings.</p>
          <button onClick={() => navigate('/login')} className="bg-accent-600 hover:bg-accent-700 text-white px-8 py-3 rounded-lg font-bold transition w-full">Log In</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-950 text-white pb-20">
      {/* Header */}
      <div className="bg-primary-900 border-b border-primary-800 sticky top-0 z-30 shadow-xl">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Ticket className="text-accent-500" /> My Bookings
          </h1>

          <div className="flex gap-4 w-full md:w-auto">
            {/* Filter */}
            <div className="relative group">
              <div className="flex items-center gap-2 bg-primary-800 px-4 py-2 rounded-lg border border-primary-700 text-sm md:text-base">
                <Filter size={16} className="text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 outline-none text-white cursor-pointer appearance-none pr-8"
                >
                  <option value="all">All Status</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Sort */}
            <div className="relative group">
              <div className="flex items-center gap-2 bg-primary-800 px-4 py-2 rounded-lg border border-primary-700 text-sm md:text-base">
                <ArrowDownUp size={16} className="text-gray-400" />
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 outline-none text-white cursor-pointer appearance-none pr-8"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="upcoming">Showtime Date</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {processedBookings.length === 0 ? (
          <div className="bg-primary-900/50 rounded-2xl p-12 text-center border-2 border-dashed border-primary-800 mt-8">
            <Ticket className="mx-auto mb-6 text-primary-700" size={80} />
            <h3 className="text-2xl font-bold text-white mb-2">No Bookings Found</h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              {filterStatus !== 'all'
                ? `You don't have any ${filterStatus} bookings matching your criteria.`
                : "You haven't booked any movie tickets yet. Explore our collection and book your first experience!"}
            </p>
            <button
              onClick={() => navigate('/movies')}
              className="bg-accent-600 hover:bg-accent-700 text-white px-8 py-3 rounded-lg font-bold transition shadow-lg shadow-accent-600/20"
            >
              Browse Movies
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            <div className="text-sm text-gray-400 mb-2">Showing {processedBookings.length} bookings</div>

            {processedBookings.map((booking) => (
              <div
                key={booking._id}
                onClick={() => setSelectedTicket(booking)}
                className="bg-primary-900 hover:bg-primary-800/80 rounded-xl overflow-hidden border border-primary-800 transition-all hover:shadow-xl hover:border-accent-500/30 cursor-pointer group"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Poster Strip (Mobile hidden or small) */}
                  <div className="hidden md:block w-32 bg-primary-950 relative overflow-hidden">
                    {booking.movie?.poster_path ? (
                      <img src={`https://image.tmdb.org/t/p/w200${booking.movie.poster_path}`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition" alt="" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Ticket className="text-gray-700" /></div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          {getStatusBadge(booking.bookingStatus)}
                          <span className="text-xs text-gray-500 font-mono">#{booking.bookingReference}</span>
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold text-white group-hover:text-accent-400 transition">{booking.movie?.title}</h3>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">₹{booking.totalAmount}</div>
                        <div className="text-xs text-gray-500">{booking.seats.length} tickets</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-primary-950/50 p-3 rounded-lg border border-primary-800">
                        <div className="text-xs text-gray-500 uppercase mb-1">Date & Time</div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-200">
                          <Calendar size={14} className="text-accent-500" />
                          {new Date(booking.showtime?.startTime).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                        </div>
                      </div>
                      <div className="bg-primary-950/50 p-3 rounded-lg border border-primary-800">
                        <div className="text-xs text-gray-500 uppercase mb-1">Location</div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-200">
                          <MapPin size={14} className="text-accent-500" />
                          <span className="truncate">{booking.theater?.name}</span>
                        </div>
                      </div>
                      <div className="bg-primary-950/50 p-3 rounded-lg border border-primary-800">
                        <div className="text-xs text-gray-500 uppercase mb-1">Seats</div>
                        <div className="text-sm font-semibold text-gray-200 break-words">{booking.seats.join(', ')}</div>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t border-primary-800">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedTicket(booking); }}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-800 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition"
                      >
                        <Eye size={16} /> View Details
                      </button>

                      {booking.bookingStatus === 'confirmed' && (
                        <>
                          <button
                            onClick={(e) => downloadTicketHtml(booking, e)}
                            className="flex items-center gap-2 px-4 py-2 bg-primary-800 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition"
                          >
                            <Download size={16} /> Download Ticket
                          </button>

                          <button
                            onClick={(e) => handleCancel(booking._id, e)}
                            disabled={cancellingId === booking._id}
                            className="ml-auto flex items-center gap-2 px-4 py-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 rounded-lg text-sm font-medium transition disabled:opacity-50"
                          >
                            {cancellingId === booking._id ? 'Cancelling...' : 'Cancel Booking'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ticket Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setSelectedTicket(null)}>
          <div onClick={e => e.stopPropagation()} className="bg-primary-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-primary-700 flex flex-col md:flex-row relative">
            <button onClick={() => setSelectedTicket(null)} className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white transition">
              <X size={20} />
            </button>

            {/* Modal Content - Left: Poster & Basic Info */}
            <div className="w-full md:w-1/3 bg-primary-950 p-8 flex flex-col items-center text-center border-r border-primary-800">
              <div className="w-48 rounded-lg overflow-hidden shadow-2xl mb-6 border-4 border-primary-800">
                <img src={`https://image.tmdb.org/t/p/w500${selectedTicket.movie?.poster_path}`} className="w-full h-auto" alt="" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">{selectedTicket.movie?.title}</h2>
              <div className="mt-4">{getStatusBadge(selectedTicket.bookingStatus)}</div>

              <div className="mt-8 w-full">
                <p className="text-gray-500 text-xs mb-1 uppercase tracking-widest">Booking Ref</p>
                <div className="bg-white text-black font-mono text-lg font-bold py-2 px-4 rounded tracking-widest">{selectedTicket.bookingReference}</div>
              </div>
            </div>

            {/* Modal Content - Right: Details & Actions */}
            <div className="w-full md:w-2/3 p-8 flex flex-col">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 pb-4 border-b border-primary-800">
                <Ticket className="text-accent-500" /> Booking Details
              </h3>

              <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-8">
                <div>
                  <p className="text-gray-500 text-xs uppercase mb-1">Theater</p>
                  <p className="text-white font-semibold">{selectedTicket.theater?.name}</p>
                  <p className="text-gray-400 text-sm">Screen {selectedTicket.screen?.screenNumber || '1'}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase mb-1">Date & Time</p>
                  <p className="text-white font-semibold">{new Date(selectedTicket.showtime?.startTime).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                  <p className="text-gray-400 text-sm">{new Date(selectedTicket.showtime?.startTime).toLocaleTimeString()}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase mb-1">Seats ({selectedTicket.seats.length})</p>
                  <p className="text-white font-semibold text-lg">{selectedTicket.seats.join(', ')}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase mb-1">Total Amount</p>
                  <p className="text-accent-400 font-bold text-2xl">₹{selectedTicket.totalAmount}</p>
                </div>
              </div>

              {selectedTicket.bookingStatus === 'confirmed' || selectedTicket.bookingStatus === 'pending' ? (
                <div className="mt-auto bg-primary-800/50 p-6 rounded-xl border border-primary-800">
                  <h4 className="font-bold text-white mb-4">Manage this booking</h4>

                  {selectedTicket.bookingStatus === 'confirmed' && (
                    <div className="flex gap-4">
                      <button
                        onClick={(e) => downloadTicketHtml(selectedTicket, e)}
                        className="flex-1 bg-accent-600 hover:bg-accent-700 text-white py-3 rounded-lg font-bold transition flex items-center justify-center gap-2"
                      >
                        <Download size={18} /> Download Ticket
                      </button>
                      <button
                        onClick={() => window.print()}
                        className="flex-1 bg-primary-700 hover:bg-primary-600 text-white py-3 rounded-lg font-bold transition flex items-center justify-center gap-2"
                      >
                        <Printer size={18} /> Print
                      </button>
                    </div>
                  )}

                  {selectedTicket.bookingStatus === 'pending' && (
                    <div className="bg-yellow-900/30 text-yellow-200 p-3 rounded-lg mb-4 border border-yellow-800/50 text-sm">
                      This booking is currently pending. You can wait for confirmation or cancel it below.
                    </div>
                  )}

                  <button
                    onClick={(e) => { setSelectedTicket(null); handleCancel(selectedTicket._id, e); }}
                    className="w-full mt-4 text-red-400 hover:text-red-300 text-sm font-medium hover:underline text-center"
                  >
                    Cancel this booking
                  </button>
                </div>
              ) : (
                <div className="mt-auto bg-red-900/20 p-6 rounded-xl border border-red-900/50 text-center">
                  <p className="text-red-200">This booking is cancelled.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
