'use client';

import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Film, Calendar, Clock, MapPin, ArrowLeft, List, Globe } from 'lucide-react';
import ShowtimeCalendar from '../components/ShowtimeCalendar';
import ShowtimeList from '../components/ShowtimeList';
import MovieGluShowtimes from '../components/MovieGluShowtimes';
import { useAuth } from '../context/AuthContext';

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [selectedTheater, setSelectedTheater] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [viewSource, setViewSource] = useState('local'); // local | movieglu
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMovieDetails();
    fetchShowtimes();
  }, [id]);

  useEffect(() => {
    if (!loading && showtimes.length === 0) {
      setViewSource('movieglu');
    }
  }, [loading, showtimes]);

  const fetchMovieDetails = async () => {
    try {
      const data = await api.get(`/movies/${id}`);
      setMovie(data);
    } catch (error) {
      console.error('Failed to fetch movie:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchShowtimes = async () => {
    try {
      const data = await api.get(`/showtimes?movieId=${id}`);
      setShowtimes(data);
    } catch (error) {
      console.error('Failed to fetch showtimes:', error);
    }
  };

  if (loading) return <div className="min-h-screen bg-primary-950 flex items-center justify-center text-gray-400">Loading...</div>;
  if (!movie) return <div className="min-h-screen bg-primary-950 flex items-center justify-center text-gray-400">Movie not found</div>;

  return (
    <div className="min-h-screen bg-primary-950 py-12 px-4">
      <div className="container mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-accent-400 hover:text-accent-500 transition mb-8"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="bg-primary-800 rounded-lg overflow-hidden">
          <div className="grid md:grid-cols-3 gap-8 p-8">
            {/* Movie Poster */}
            <div className="md:col-span-1">
              <div className="bg-primary-700 h-96 rounded-lg flex items-center justify-center mb-4">
                <Film className="text-gray-500" size={64} />
              </div>
              {movie.rating && (
                <div className="bg-accent-600 text-white rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-200">Rating</p>
                  <p className="text-3xl font-bold">{movie.rating.toFixed(1)}/10</p>
                </div>
              )}
            </div>

            {/* Movie Details */}
            <div className="md:col-span-2">
              <h1 className="text-4xl font-bold text-white mb-4">{movie.title}</h1>

              <div className="space-y-3 mb-6 text-gray-300">
                <div className="flex items-center gap-3">
                  <Clock size={20} className="text-accent-500" />
                  <span>{movie.duration} minutes</span>
                </div>
                <div className="flex items-start gap-3">
                  <Film size={20} className="text-accent-500 mt-1" />
                  <div className="flex gap-2 flex-wrap">
                    {movie.genre.map(g => (
                      <span key={g} className="bg-primary-700 px-3 py-1 rounded">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin size={20} className="text-accent-500" />
                  <div className="flex gap-2 flex-wrap">
                    {movie.language.map(l => (
                      <span key={l} className="bg-primary-700 px-3 py-1 rounded">
                        {l}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-gray-300 mb-8 leading-relaxed">{movie.description}</p>

              {movie.format && (
                <div className="mb-8">
                  <p className="text-white font-semibold mb-3">Available Formats:</p>
                  <div className="flex gap-2 flex-wrap">
                    {movie.format.map(f => (
                      <span key={f} className="bg-accent-600 text-white px-3 py-1 rounded">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {!user && (
                <div className="bg-yellow-900 bg-opacity-30 border border-yellow-700 text-yellow-300 p-4 rounded mb-8">
                  Please <a href="/login" className="underline">log in</a> to book tickets.
                </div>
              )}
            </div>
          </div>

          {/* Showtimes Section */}
          <div className="p-8 border-t border-primary-700">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4">
              <h2 className="text-2xl font-bold text-white">Select Showtime</h2>

              <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
                {/* Source Toggles */}
                <div className="bg-primary-900 p-1 rounded-lg flex border border-primary-700 self-start">
                  <button
                    onClick={() => setViewSource('local')}
                    className={`px-4 py-2 rounded-md flex items-center gap-2 transition text-sm font-medium ${viewSource === 'local' ? 'bg-primary-700 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                  >
                    <List size={16} />
                    Booked (Local)
                  </button>
                  <button
                    onClick={() => setViewSource('movieglu')}
                    className={`px-4 py-2 rounded-md flex items-center gap-2 transition text-sm font-medium ${viewSource === 'movieglu' ? 'bg-accent-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                  >
                    <Globe size={16} />
                    Real-Time (MovieGlu)
                  </button>
                </div>

                {/* View Toggles (Only for Local) */}
                {viewSource === 'local' && (
                  <div className="bg-primary-900 p-1 rounded-lg flex border border-primary-700 self-start">
                    <button
                      onClick={() => setViewMode('list')}
                      className={`px-4 py-2 rounded-md flex items-center gap-2 transition text-sm font-medium ${viewMode === 'list' ? 'bg-primary-700 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                    >
                      <List size={16} />
                      List
                    </button>
                    <button
                      onClick={() => setViewMode('calendar')}
                      className={`px-4 py-2 rounded-md flex items-center gap-2 transition text-sm font-medium ${viewMode === 'calendar' ? 'bg-primary-700 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                    >
                      <Calendar size={16} />
                      Calendar
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="animate-in fade-in duration-500 min-h-[300px]">
              {viewSource === 'movieglu' ? (
                <MovieGluShowtimes
                  filmId={movie.movieGluFilmId || 184126} // Fallback to 'The Martian' (ID: 184126) for Sandbox
                  date={new Date().toISOString().split('T')[0]}
                />
              ) : (
                <>
                  {showtimes.length === 0 ? (
                    <div className="text-center py-12 bg-primary-800/30 rounded-lg border border-primary-700 border-dashed">
                      <p className="text-gray-400 mb-2">No local showtimes available for this movie.</p>
                      <button
                        onClick={() => setViewSource('movieglu')}
                        className="text-accent-400 hover:underline font-medium"
                      >
                        Check Real-Time Listings →
                      </button>
                    </div>
                  ) : (
                    viewMode === 'calendar' ? (
                      <ShowtimeCalendar
                        showtimes={showtimes}
                        onSelectShowtime={(showtime) => navigate(`/booking/${showtime._id}`)}
                      />
                    ) : (
                      <ShowtimeList
                        showtimes={showtimes}
                        onSelectShowtime={(showtime) => navigate(`/booking/${showtime._id}`)}
                      />
                    )
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;
