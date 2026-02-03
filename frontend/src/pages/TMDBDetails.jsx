import { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Film, Clock, Calendar, Star, Play, Users, ArrowLeft, Heart, Share2, Ticket, X, ChevronRight } from 'lucide-react';
import ShowtimeCalendar from '../components/ShowtimeCalendar';
import SeatSelector from '../components/SeatSelector';
import StripePayment from '../components/StripePayment';
import { format, addDays, setHours, setMinutes } from 'date-fns';

const TMDBDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trailer, setTrailer] = useState(null);

  // Simulation State
  const [mockShowtimes, setMockShowtimes] = useState([]);
  const [bookingShowtime, setBookingShowtime] = useState(null);
  const [bookingStep, setBookingStep] = useState(1); // 1: Seats, 2: Payment
  const [selectedSeats, setSelectedSeats] = useState([]); // Track selected seats
  const [clientSecret, setClientSecret] = useState(null);

  const showtimesRef = useRef(null);

  useEffect(() => {
    fetchMovie();
    window.scrollTo(0, 0);
  }, [id]);

  const fetchMovie = async () => {
    try {
      setLoading(true);
      const data = await api.get(`/tmdb/movie/${id}`);
      setMovie(data);

      // Fetch Real Showtimes from our Backend
      // We pass the TMDB ID to find associated local showtimes
      try {
        const showtimesRes = await api.get(`/showtimes?tmdbId=${id}`);
        setMockShowtimes(showtimesRes.data || showtimesRes); // Using 'mockShowtimes' state var for now to avoid refactor, but it holds real data
      } catch (err) {
        console.error("Failed to fetch real showtimes", err);
        setMockShowtimes([]);
      }

      // Find official trailer
      if (data.videos && data.videos.results) {
        const officialTrailer = data.videos.results.find(
          vid => vid.site === 'YouTube' && vid.type === 'Trailer'
        );
        setTrailer(officialTrailer || data.videos.results[0]);
      }
    } catch (e) {
      console.error('Failed to load TMDB movie', e);
    } finally {
      setLoading(false);
    }
  };

  // Helper removed: We now fetch real showtimes from backend

  const getDirector = () => {
    if (!movie?.credits?.crew) return 'Unknown';
    const director = movie.credits.crew.find(person => person.job === 'Director');
    return director ? director.name : 'Unknown';
  };

  const scrollToShowtimes = () => {
    showtimesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleShowtimeSelect = (showtime) => {
    setBookingShowtime(showtime);
    setBookingStep(1); // Reset to seat selection
    setSelectedSeats([]);
  };

  const handleSeatClick = (seatId) => {
    setSelectedSeats(prev =>
      prev.includes(seatId)
        ? prev.filter(s => s !== seatId)
        : [...prev, seatId]
    );
  };

  const initiatePayment = async () => {
    // PROTECT: Don't allow payment for demo showtimes (which have IDs starting with 's' or are not proper ObjectIds)
    if (bookingShowtime._id.startsWith('s') && bookingShowtime._id.length < 5) {
      alert("This is a demo showtime and cannot be booked. Please refresh the page to load real showtimes.");
      return;
    }

    try {
      const totalAmount = calculateTotal() + 40; // Including convenience fee
      const res = await api.post('/payments/create-payment-intent', {
        amount: totalAmount,
        movieTitle: movie.title,
        bookingId: `mock_booking_${Date.now()}` // Mock ID for simulation
      });
      setClientSecret(res.clientSecret);
      setBookingStep(2);
    } catch (err) {
      console.error("Error initiating payment", err);
      alert("Failed to initiate payment. Please try again.");
    }
  };

  const handlePaymentSuccess = async (paymentIntent) => {
    try {
      // Save booking to backend
      await api.post('/bookings', {
        showtimeId: bookingShowtime._id,
        seats: selectedSeats,
        paymentMethod: 'credit-card',
        paymentIntentId: paymentIntent.id
      });

      alert(`Payment Successful! Booking Confirmed!\n\nBooking ID: ${paymentIntent.id}\nMovie: ${movie.title}\nTheater: ${bookingShowtime.theater?.name || 'Unknown Theater'}\nTime: ${format(new Date(bookingShowtime.startTime), 'PPpp')}\nSeats: ${selectedSeats.join(', ')}`);

      setBookingShowtime(null);
      setBookingStep(1);
      setSelectedSeats([]);
      setClientSecret(null);
      // Navigate to my-bookings to view the ticket
      navigate('/my-bookings');
    } catch (error) {
      console.error("Failed to save booking:", error);
      const serverMsg = error.response?.data?.message || error.message;
      const debugInfo = error.response?.data?.error || '';
      alert(`Payment was successful, but the booking could not be saved to the system.\n\nError: ${serverMsg}\n${debugInfo}\n\nPlease take a screenshot of this and contact support.`);
    }
  };

  const calculateTotal = () => {
    return selectedSeats.reduce((total, seat) => {
      const isPremium = bookingShowtime.screen?.premiumSeats?.includes(seat);
      return total + bookingShowtime.price + (isPremium ? 50 : 0);
    }, 0);
  };

  if (loading) return <div className="min-h-screen bg-primary-950 flex items-center justify-center text-gray-400">Loading movie details...</div>;
  if (!movie) return <div className="min-h-screen bg-primary-950 flex items-center justify-center text-gray-400">Movie not found</div>;

  return (
    <div className="min-h-screen bg-primary-950 text-white pb-12 relative">
      {/* Hero Section with Backdrop */}
      <div className="relative h-[70vh] w-full overflow-hidden">
        {/* Backdrop Image */}
        <div className="absolute inset-0">
          {movie.backdrop_path ? (
            <img
              src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-primary-900 flex items-center justify-center">
              <Film size={100} className="text-primary-800" />
            </div>
          )}
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary-950 via-primary-950/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary-950/90 via-primary-950/40 to-transparent" />
        </div>

        {/* Content Container */}
        <div className="container mx-auto px-4 h-full relative z-10 flex flex-col justify-end pb-12">
          <button onClick={() => navigate(-1)} className="absolute top-8 left-4 flex items-center gap-2 text-gray-300 hover:text-white transition">
            <ArrowLeft size={20} /> Back
          </button>

          <div className="flex flex-col md:flex-row gap-8 items-end">
            {/* Poster Card */}
            <div className="hidden md:block w-64 flex-shrink-0 rounded-xl overflow-hidden shadow-2xl border-4 border-primary-800/50 transform translate-y-16">
              {movie.poster_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                  className="w-full h-auto"
                />
              ) : (
                <div className="w-full h-96 bg-primary-800 flex items-center justify-center">
                  <Film size={48} className="text-gray-600" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 mb-4">
              <h1 className="text-4xl md:text-6xl font-bold mb-2 text-white leading-tight">
                {movie.title}
                <span className="text-2xl text-gray-400 font-normal ml-3">
                  ({new Date(movie.release_date).getFullYear()})
                </span>
              </h1>

              {movie.tagline && (
                <p className="text-xl text-accent-400 italic mb-4 font-light">"{movie.tagline}"</p>
              )}

              <div className="flex flex-wrap gap-4 text-sm md:text-base text-gray-300 mb-6 items-center">
                <span className="flex items-center gap-1 border border-gray-600 px-2 py-0.5 rounded">
                  {movie.adult ? 'R' : 'PG-13'}
                </span>
                <span>{movie.release_date}</span>
                <span className="flex items-center gap-1">
                  <Clock size={16} className="text-accent-500" /> {movie.runtime}m
                </span>
                <div className="flex gap-2">
                  {movie.genres?.map(g => (
                    <span key={g.id} className="text-gray-300 hover:text-white cursor-pointer px-2 py-0.5 bg-primary-800/50 rounded-full text-sm">
                      {g.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-6 mb-8">
                {/* Rating */}
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 rounded-full border-2 border-accent-500 flex items-center justify-center bg-primary-900/80 font-bold text-accent-400">
                    {Math.round(movie.vote_average * 10)}<span className="text-[10px]">%</span>
                  </div>
                  <div className="text-sm">
                    <p className="font-bold">User<br />Score</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={scrollToShowtimes}
                    className="flex items-center gap-2 bg-accent-600 hover:bg-accent-700 text-white px-8 py-3 rounded-full font-bold transition transform hover:scale-105 shadow-lg shadow-accent-600/30"
                  >
                    <Ticket size={20} fill="currentColor" /> GET TICKETS
                  </button>

                  {trailer && (
                    <a
                      href={`https://www.youtube.com/watch?v=${trailer.key}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-3 rounded-full font-bold transition backdrop-blur-sm"
                    >
                      <Play size={20} fill="currentColor" /> Watch Trailer
                    </a>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-200">Overview</h3>
                <p className="text-gray-300 leading-relaxed max-w-4xl">{movie.overview}</p>
              </div>

              <div className="mt-6">
                <p className="text-gray-400 text-sm">Director: <span className="text-white font-semibold">{getDirector()}</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Body */}
      <div className="container mx-auto px-4 mt-8 md:mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">

          {/* Main Column */}
          <div className="lg:col-span-3 space-y-12">

            {/* Top Cast */}
            <section>
              <h2 className="text-2xl font-bold mb-6 border-l-4 border-accent-500 pl-4">Top Cast</h2>
              <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-thin scrollbar-thumb-primary-700 scrollbar-track-primary-900">
                {movie.credits?.cast?.slice(0, 10).map(actor => (
                  <div key={actor.id} className="min-w-[140px] w-[140px] bg-primary-800 rounded-lg overflow-hidden shadow-lg group">
                    <div className="h-40 overflow-hidden">
                      {actor.profile_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                          alt={actor.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-primary-700 flex items-center justify-center">
                          <Users size={32} className="text-gray-500" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="font-bold text-sm text-white line-clamp-1">{actor.name}</p>
                      <p className="text-xs text-gray-400 line-clamp-2">{actor.character}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Videos/Trailers */}
            {movie.videos?.results?.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-6 border-l-4 border-accent-500 pl-4">Videos</h2>
                <div className="flex overflow-x-auto gap-4 pb-4">
                  {movie.videos.results.slice(0, 4).map(video => (
                    <div key={video.id} className="min-w-[300px] flex-shrink-0">
                      <iframe
                        title={video.name}
                        width="100%"
                        height="200"
                        src={`https://www.youtube.com/embed/${video.key}`}
                        frameBorder="0"
                        allowFullScreen
                        className="rounded-lg shadow-lg border border-primary-800"
                      ></iframe>
                      <p className="mt-2 text-sm font-semibold text-gray-300 line-clamp-1">{video.name}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Showtimes Section - Simulated Local Showtimes */}
            <section ref={showtimesRef} className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-6 border-l-4 border-accent-500 pl-4 flex items-center gap-2">
                <Calendar className="text-accent-500" /> Showtimes & Tickets
              </h2>

              {/* Use existing component for rendering generated showtimes */}
              <ShowtimeCalendar
                showtimes={mockShowtimes}
                onSelectShowtime={handleShowtimeSelect}
              />

              <p className="text-xs text-gray-500 mt-4 italic text-center">
                * These are simulated showtimes for demonstration purposes as this movie relies on TMDB data.
              </p>
            </section>

            {/* Recommendations */}
            {movie.recommendations?.results?.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-6 border-l-4 border-accent-500 pl-4">Recommended Movies</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {movie.recommendations.results.slice(0, 10).map(rec => (
                    <Link to={`/tmdb/${rec.id}`} key={rec.id} className="group">
                      <div className="bg-primary-800 rounded-lg overflow-hidden relative aspect-[2/3] mb-2">
                        {rec.poster_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w342${rec.poster_path}`}
                            alt={rec.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary-800">
                            <Film className="text-gray-600" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2 bg-primary-900/90 text-white text-xs font-bold px-1.5 py-1 rounded">
                          {rec.vote_average?.toFixed(1)}
                        </div>
                      </div>
                      <h3 className="font-semibold text-sm text-gray-200 group-hover:text-white line-clamp-1">{rec.title}</h3>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-primary-800 p-6 rounded-xl">
              <h3 className="text-lg font-bold mb-4 text-white">Movie Info</h3>
              {/* Same movie info structure */}
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm">Status</p>
                  <p className="font-medium text-white">{movie.status}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Language</p>
                  <p className="font-medium text-white">{movie.original_language?.toUpperCase()}</p>
                </div>
                {movie.budget > 0 && (
                  <div>
                    <p className="text-gray-400 text-sm">Budget</p>
                    <p className="font-medium text-white">${(movie.budget / 1000000).toFixed(1)}M</p>
                  </div>
                )}
                {movie.revenue > 0 && (
                  <div>
                    <p className="text-gray-400 text-sm">Revenue</p>
                    <p className="font-medium text-white">${(movie.revenue / 1000000).toFixed(1)}M</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Booking Modal Simulation */}
      {bookingShowtime && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-primary-900 rounded-2xl shadow-2xl max-w-4xl w-full border border-primary-700 overflow-hidden flex flex-col max-h-[90vh]">

            {/* Header */}
            <div className="bg-primary-800 p-4 flex justify-between items-center border-b border-primary-700 shrink-0">
              <div>
                <h3 className="text-xl font-bold text-white">{movie.title}</h3>
                <p className="text-gray-400 text-sm">
                  {bookingShowtime.theater?.name || 'Unknown Theater'} • {format(new Date(bookingShowtime.startTime), 'MMM do, h:mm a')}
                </p>
              </div>
              <button onClick={() => setBookingShowtime(null)} className="text-gray-400 hover:text-white p-2 hover:bg-white/10 rounded-full transition">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              {bookingStep === 1 ? (
                /* Step 1: Seat Selection */
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">Select Seats</h2>
                    <p className="text-gray-400">Tap on seats to select them</p>
                  </div>

                  <SeatSelector
                    showtime={bookingShowtime}
                    selectedSeats={selectedSeats}
                    onSeatClick={handleSeatClick}
                  />

                  {selectedSeats.length > 0 && (
                    <div className="flex justify-center mt-6">
                      <div className="bg-primary-800 rounded-lg p-4 flex items-center gap-8 border border-primary-700 shadow-lg">
                        <div>
                          <p className="text-gray-400 text-sm">Selected</p>
                          <p className="text-white font-bold text-lg">{selectedSeats.length} Seats</p>
                        </div>
                        <div className="w-px h-10 bg-primary-700" />
                        <div>
                          <p className="text-gray-400 text-sm">Total</p>
                          <p className="text-accent-400 font-bold text-2xl">₹{calculateTotal()}</p>
                        </div>
                        <button
                          onClick={initiatePayment}
                          className="ml-4 bg-accent-600 hover:bg-accent-700 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition hover:scale-105"
                        >
                          Next <ChevronRight size={18} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Step 2: Stripe Payment */
                <div className="max-w-md mx-auto space-y-6 animate-in slide-in-from-right duration-300">
                  <div className="flex gap-4 mb-6">
                    <div className="w-20 h-28 bg-gray-800 rounded overflow-hidden flex-shrink-0 shadow-lg">
                      <img src={`https://image.tmdb.org/t/p/w185${movie.poster_path}`} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-white mb-1">{movie.title}</h4>
                      <p className="text-accent-400 text-sm font-medium">{bookingShowtime.theater?.name || 'Unknown Theater'}</p>
                      <p className="text-gray-400 text-sm mt-1">{format(new Date(bookingShowtime.startTime), 'PP p')}</p>
                      <div className="mt-1 flex gap-2">
                        <span className="text-xs bg-primary-800 px-2 py-0.5 rounded text-gray-300">
                          {selectedSeats.join(', ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {clientSecret ? (
                    <StripePayment
                      clientSecret={clientSecret}
                      amount={calculateTotal() + 40}
                      bookingId={`mock_booking_${Date.now()}`}
                      movieTitle={movie.title}
                      onSuccess={handlePaymentSuccess}
                    />
                  ) : (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-500"></div>
                    </div>
                  )}

                  <button
                    onClick={() => setBookingStep(1)}
                    className="w-full text-center text-gray-400 hover:text-white text-sm mt-4 hover:underline"
                  >
                    Cancel Payment & Go Back
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TMDBDetails;
