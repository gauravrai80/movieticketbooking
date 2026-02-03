'use client';

import { Link } from 'react-router-dom';
import { ArrowRight, Film, Calendar, MapPin, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../utils/api';

const Home = () => {
  const [nowShowingMovies, setNowShowingMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const [nowPlayingData, upcomingData] = await Promise.all([
        api.get('/tmdb/now_playing'),
        api.get('/tmdb/upcoming')
      ]);
      setNowShowingMovies(nowPlayingData.results.slice(0, 12));
      setUpcomingMovies(upcomingData.results.slice(0, 12));
    } catch (error) {
      console.error('Failed to fetch movies:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-900 to-primary-950">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 text-pretty">
            Book Your Favorite <span className="text-accent-500">Movies</span> Online
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto text-balance">
            Experience the magic of cinema. Find the best movies, select your seats, and book tickets in seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/movies"
              className="bg-accent-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-accent-700 transition flex items-center justify-center gap-2"
            >
              Browse Movies <ArrowRight size={20} />
            </Link>
            <Link
              to="/register"
              className="border-2 border-accent-500 text-accent-400 px-8 py-3 rounded-lg font-semibold hover:bg-accent-500 hover:text-white transition"
            >
              Sign Up Free
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-primary-800 bg-opacity-50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Why Choose MTB?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-primary-700 p-6 rounded-lg hover:bg-primary-600 transition">
              <Zap className="text-accent-500 mb-4" size={32} />
              <h3 className="text-xl font-bold text-white mb-2">Instant Booking</h3>
              <p className="text-gray-300">Quick and hassle-free booking process. Get your tickets in seconds.</p>
            </div>
            <div className="bg-primary-700 p-6 rounded-lg hover:bg-primary-600 transition">
              <MapPin className="text-accent-500 mb-4" size={32} />
              <h3 className="text-xl font-bold text-white mb-2">Multiple Theaters</h3>
              <p className="text-gray-300">Choose from hundreds of theaters across different cities.</p>
            </div>
            <div className="bg-primary-700 p-6 rounded-lg hover:bg-primary-600 transition">
              <Calendar className="text-accent-500 mb-4" size={32} />
              <h3 className="text-xl font-bold text-white mb-2">Schedule Management</h3>
              <p className="text-gray-300">View and manage all your bookings in one place.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Now Showing Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-white">Now Showing (Real-time)</h2>
            <Link to="/movies" className="text-accent-400 hover:text-accent-500 flex items-center gap-2 transition">
              View All <ArrowRight size={20} />
            </Link>
          </div>

          {loading ? (
            <div className="text-center text-gray-400">Loading movies...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {nowShowingMovies.map((movie) => (
                <div key={movie.id} className="bg-primary-700 rounded-lg overflow-hidden hover:shadow-lg transition hover:scale-105 transform duration-300">
                  <div className="bg-primary-600 h-96 flex items-center justify-center overflow-hidden">
                    {movie.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        alt={movie.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Film className="text-gray-500" size={48} />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{movie.title}</h3>
                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">{movie.overview}</p>
                    <div className="flex gap-2 mb-4 flex-wrap">
                      <span className="bg-accent-600 text-white text-xs px-2 py-1 rounded">
                        Rating: {movie.vote_average?.toFixed(1)}
                      </span>
                      <span className="bg-primary-600 text-gray-300 text-xs px-2 py-1 rounded">
                        {movie.release_date}
                      </span>
                    </div>
                    <Link
                      to={`/tmdb/${movie.id}`}
                      className="w-full bg-accent-600 text-white py-2 rounded hover:bg-accent-700 transition text-center block"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Upcoming Section */}
      <section className="py-16 px-4 bg-primary-800 bg-opacity-30">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-white">Coming Soon</h2>
          </div>

          {loading ? (
            <div className="text-center text-gray-400">Loading movies...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {upcomingMovies.map((movie) => (
                <div key={movie.id} className="bg-primary-700 rounded-lg overflow-hidden hover:shadow-lg transition hover:scale-105 transform duration-300 opacity-90 hover:opacity-100">
                  <div className="bg-primary-600 h-96 flex items-center justify-center overflow-hidden">
                    {movie.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        alt={movie.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Film className="text-gray-500" size={48} />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{movie.title}</h3>
                    <div className="flex gap-2 mb-4 flex-wrap">
                      <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded">
                        Coming: {movie.release_date}
                      </span>
                    </div>
                    <Link
                      to={`/tmdb/${movie.id}`}
                      className="w-full bg-primary-600 text-white py-2 rounded hover:bg-primary-500 transition text-center block"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
