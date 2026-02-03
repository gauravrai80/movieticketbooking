import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, AlertCircle, CreditCard, Smartphone, Wallet, Check, Ticket, ChevronRight } from 'lucide-react';
import SeatSelector from '../components/SeatSelector';
import StripePayment from '../components/StripePayment';

const STEPS = [
  { id: 1, label: 'Select Seats' },
  { id: 2, label: 'Review' },
  { id: 3, label: 'Payment' },
  { id: 4, label: 'Confirm' } // Confirmation usually happens after separate success page, but we show flow here
];

const Booking = () => {
  const { showtimeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [showtime, setShowtime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Booking State
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingBooking, setPendingBooking] = useState(null);

  useEffect(() => {
    fetchShowtime();
  }, [showtimeId]);

  const fetchShowtime = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/showtimes/${showtimeId}`);
      setShowtime(response);
    } catch (error) {
      setError('Failed to load showtime details');
    } finally {
      setLoading(false);
    }
  };

  const toggleSeat = (seatId) => {
    setSelectedSeats(prev =>
      prev.includes(seatId) ? prev.filter(s => s !== seatId) : [...prev, seatId]
    );
  };

  const calculateTotal = () => {
    if (!showtime) return 0;
    return selectedSeats.reduce((total, seatId) => {
      // Check showtime.premiumSeats first (Admin overrides), then fallback to screen? No, admin writes to showtime.
      const isPremium = showtime.premiumSeats?.includes(seatId);
      // Matching Admin PricingManager preview (Base * 1.3 approx). 
      // Or use fixed +50 if we want simplicity. Let's use 1.3x rounded.
      const seatPrice = isPremium ? Math.round(showtime.price * 1.3) : showtime.price;
      return total + seatPrice;
    }, 0);
  };

  const handleNextStep = async () => {
    if (currentStep === 1) {
      if (selectedSeats.length === 0) {
        setError('Please select at least one seat');
        return;
      }
      setError('');
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      handleBookingInitiation();
    }
  };

  const handleBookingInitiation = async () => {
    setIsProcessing(true);
    try {
      const totalPrice = calculateTotal();
      const bookingResponse = await api.post('/bookings', {
        showtimeId,
        seats: selectedSeats,
        paymentMethod,
        totalAmount: totalPrice
      });

      if (paymentMethod === 'credit-card' || paymentMethod === 'debit-card') {
        // Fetch Client Secret for Stripe
        const paymentRes = await api.post('/payments/create-payment-intent', {
          amount: totalPrice,
          bookingId: bookingResponse._id,
          movieTitle: showtime.movie?.title
        });

        setPendingBooking({
          ...bookingResponse,
          clientSecret: paymentRes.clientSecret
        });
      } else {
        navigate('/my-bookings');
      }
    } catch (error) {
      setError(error.message || 'Booking failed');
      setIsProcessing(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-primary-950 flex flex-col items-center justify-center text-gray-400">
      <div className="w-12 h-12 border-4 border-accent-600 border-t-transparent rounded-full animate-spin mb-4" />
      <p>Loading Showtime...</p>
    </div>
  );

  if (!showtime) return (
    <div className="min-h-screen bg-primary-950 flex items-center justify-center text-red-400">
      <AlertCircle className="mr-2" /> Showtime not found
    </div>
  );

  const totalPrice = calculateTotal();

  return (
    <div className="min-h-screen bg-primary-950 text-white pb-20">
      {/* Header / Progress */}
      <div className="sticky top-[72px] z-40 bg-primary-950/95 backdrop-blur border-b border-primary-800 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-400 hover:text-white transition group"
            >
              <ArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" size={20} />
              <div className="flex flex-col items-start">
                <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Back to Movie</span>
                <span className="font-bold text-lg leading-none">{showtime.movie?.title}</span>
              </div>
            </button>

            {/* Steps Indicator */}
            <div className="flex items-center gap-2 md:gap-4">
              {STEPS.slice(0, 3).map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors ${currentStep === step.id
                    ? 'bg-accent-600 text-white font-bold shadow-lg shadow-accent-600/30'
                    : currentStep > step.id
                      ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                      : 'bg-primary-800 text-gray-500'
                    }`}>
                    {currentStep > step.id ? <Check size={14} strokeWidth={3} /> : <span className="text-xs">{step.id}</span>}
                    <span className="text-xs md:text-sm">{step.label}</span>
                  </div>
                  {index < 2 && <div className="w-4 h-0.5 bg-primary-800 ml-2 md:ml-4" />}
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-8 flex items-center gap-3 animate-pulse">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {/* STEP 1: SELECT SEATS */}
        {currentStep === 1 && (
          <div className="animate-fade-in">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold mb-2">Choose Your Seats</h2>
              <p className="text-gray-400">
                {showtime.theater?.name} • Screen {showtime.screen?.screenNumber} • {new Date(showtime.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            <div className="bg-primary-900/30 p-4 md:p-8 rounded-2xl border border-primary-800 shadow-2xl">
              <SeatSelector
                showtime={showtime}
                selectedSeats={selectedSeats}
                onSeatClick={toggleSeat}
                disabled={false}
              />
            </div>
          </div>
        )}

        {/* STEP 2: REVIEW */}
        {currentStep === 2 && (
          <div className="max-w-2xl mx-auto animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 text-center">Review Booking</h2>
            <div className="bg-primary-800/50 rounded-2xl border border-primary-700 overflow-hidden shadow-xl">

              {/* Movie Header in Card */}
              <div className="p-6 border-b border-primary-700 flex gap-6">
                <img
                  src={showtime.movie?.posterUrl || `https://image.tmdb.org/t/p/w200${showtime.movie?.poster_path}`}
                  alt="Poster"
                  className="w-24 h-36 object-cover rounded-lg shadow-md"
                />
                <div>
                  <h3 className="text-xl font-bold mb-2">{showtime.movie?.title}</h3>
                  <p className="text-gray-400 text-sm mb-1">{showtime.theater?.name}, {showtime.theater?.city}</p>
                  <p className="text-accent-400 text-sm font-semibold mb-3">
                    {new Date(showtime.startTime).toLocaleString([], { weekday: 'long', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <div className="flex gap-2">
                    <span className="bg-primary-700 px-2 py-1 rounded text-xs text-gray-300">Screen {showtime.screen?.screenNumber}</span>
                    <span className="bg-primary-700 px-2 py-1 rounded text-xs text-gray-300">{showtime.movie?.language}</span>
                  </div>
                </div>
              </div>

              {/* Seats Breakdown */}
              <div className="p-6">
                <h4 className="font-semibold text-gray-300 mb-4 flex items-center gap-2">
                  <Ticket size={18} /> Selected Seats
                </h4>
                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedSeats.map(seat => (
                    <span key={seat} className="bg-accent-600/20 text-accent-300 border border-accent-500/30 px-3 py-1 rounded-md text-sm font-mono">
                      {seat}
                    </span>
                  ))}
                </div>

                <div className="space-y-3 border-t border-primary-700 pt-4">
                  <div className="flex justify-between text-gray-400 text-sm">
                    <span>Ticket Price x {selectedSeats.length}</span>
                    <span>₹{showtime.price * selectedSeats.length}</span>
                  </div>
                  <div className="flex justify-between text-gray-400 text-sm">
                    <span>Convenience Fee</span>
                    <span>₹{30 * selectedSeats.length}</span>
                  </div>
                  <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-primary-700 border-dashed">
                    <span>Total Payable</span>
                    <span>₹{totalPrice + (30 * selectedSeats.length)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: PAYMENT */}
        {currentStep === 3 && (
          <div className="max-w-2xl mx-auto animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 text-center">Select Payment Method</h2>

            {pendingBooking ? (
              // Show Stripe Logic Component
              <StripePayment
                clientSecret={pendingBooking.clientSecret}
                bookingId={pendingBooking._id}
                amount={pendingBooking.totalAmount}
                movieTitle={showtime.movie?.title}
                onSuccess={() => {
                  alert('Booking Confirmed!');
                  navigate('/my-bookings');
                }}
              />
            ) : (
              <div className="grid gap-4">
                {[
                  { id: 'credit-card', label: 'Credit/Debit Card', icon: CreditCard },
                  { id: 'upi', label: 'UPI / GPay', icon: Smartphone },
                  { id: 'wallet', label: 'Wallets', icon: Wallet }
                ].map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`flex items-center p-5 rounded-xl border transition-all duration-200 text-left ${paymentMethod === method.id
                      ? 'bg-accent-600/10 border-accent-500 ring-1 ring-accent-500'
                      : 'bg-primary-800 border-primary-700 hover:border-accent-500/50 hover:bg-primary-700'
                      }`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${paymentMethod === method.id ? 'bg-accent-600 text-white' : 'bg-primary-900 text-gray-400'
                      }`}>
                      <method.icon size={24} />
                    </div>
                    <div>
                      <h4 className={`font-bold ${paymentMethod === method.id ? 'text-white' : 'text-gray-300'}`}>
                        {method.label}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        Secure payment via {method.label}
                      </p>
                    </div>
                    <div className={`ml-auto w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === method.id ? 'border-accent-500' : 'border-gray-600'
                      }`}>
                      {paymentMethod === method.id && <div className="w-3 h-3 bg-accent-500 rounded-full" />}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Bottom Bar (Mobile/Desktop) */}
      {!pendingBooking && (
        <div className="fixed bottom-0 left-0 right-0 bg-primary-900 border-t border-primary-700 p-4 shadow-2xl z-50">
          <div className="container mx-auto flex items-center justify-between max-w-5xl">
            <div>
              <p className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">Total Amount</p>
              <p className="text-2xl font-bold text-white">₹{totalPrice + (currentStep >= 2 ? (30 * selectedSeats.length) : 0)}</p>
            </div>

            {currentStep > 1 && (
              <button
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="mr-4 text-gray-400 hover:text-white underline text-sm"
              >
                Back
              </button>
            )}

            <button
              onClick={handleNextStep}
              disabled={selectedSeats.length === 0 || isProcessing}
              className={`flex items-center gap-2 bg-accent-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-accent-700 transition shadow-lg shadow-accent-600/25 ${(selectedSeats.length === 0 || isProcessing) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            >
              {isProcessing ? 'Processing...' : (
                <>
                  {currentStep === 3 ? 'Pay Now' : 'Continue'}
                  <ChevronRight size={20} />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Booking;
