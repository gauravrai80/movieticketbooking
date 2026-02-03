import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Film, Search, X, Calendar, Star, Clock } from 'lucide-react';
import api from '../utils/api';

const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [filters, setFilters] = useState({
    status: 'now-showing',
    genre: '',
    language: ''
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); // Debounced

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchMovies();
  }, [filters, searchTerm]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      let data = [];
      let params = new URLSearchParams();

      // Basic MovieGlu/Local filtering logic
      if (filters.status === 'now-showing') {
        const response = await api.get('/tmdb/now_playing');
        data = response.results;
      } else if (filters.status === 'upcoming') {
        const response = await api.get('/tmdb/upcoming');
        data = response.results;
      } else {
        // Fallback or custom local logic
        if (filters.status) params.append('status', filters.status);
        if (filters.genre) params.append('genre', filters.genre);
        if (filters.language) params.append('language', filters.language);
        if (searchTerm) params.append('search', searchTerm);

        // Note: TMDB endpoints don't support direct mixed filtering this accurately without discovery
        // For this demo, we'll assume the status endpoints trigger the main data fetch, 
        // and client-side filtering might be needed for the mixed demo if the API doesn't support it fully yet.
        // However, based on previous logic, we primarily fetch by status.

        // If we are searching, we might use TMDB search
        if (searchTerm) {
          const searchRes = await api.get(`/tmdb/search?query=${encodeURIComponent(searchTerm)}`);
          data = searchRes.results;
        } else {
          // Default fallback if no status matched (unlikely with UI defaults)
          const response = await api.get('/tmdb/now_playing');
          data = response.results;
        }
      }

      // Apply client-side filtering if API doesn't support it for the mock data/TMDB hybrid
      // (Simplified for this UI overhaul task to ensure visual feedback works)
      if (searchTerm && filters.status !== 'custom') {
        // If we fetched "now-showing" but also have a search term, 
        // simplistic client filter or separate search API usage. 
        // For now, let's trust the data fetch logic above or refine it.
        // Actually, let's do a client side filter on the returned data for robust demo feel
        const lowerSearch = searchTerm.toLowerCase();
        data = data.filter(m => m.title.toLowerCase().includes(lowerSearch));
      }

      setMovies(data);
    } catch (error) {
      console.error('Failed to fetch movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterToggle = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key] === value ? '' : value
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      status: 'now-showing',
      genre: '',
      language: ''
    });
    setSearchQuery('');
  };

  const genres = ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Romance', 'Thriller', 'Animation'];
  const languages = ['English', 'Hindi', 'Tamil', 'Telugu', 'Marathi'];

  return (
    <div className="min-h-screen bg-primary-950 py-12 px-4 transition-colors duration-300">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 bg-gradient-to-r from-accent-400 to-accent-600 bg-clip-text text-transparent inline-block">
          Discover Movies
        </h1>

        {/* Search Bar */}
        <div className="mb-8 relative max-w-2xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search for movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-primary-800 text-white pl-12 pr-12 py-4 rounded-xl border border-primary-700 focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none transition shadow-lg placeholder-gray-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Filters Section */}
        <div className="mb-12 space-y-6">
          {/* Status Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <span className="text-gray-400 font-medium mr-2">Status:</span>
            {[
              { id: 'now-showing', label: 'Now Showing' },
              { id: 'upcoming', label: 'Coming Soon' }
            ].map(status => (
              <button
                key={status.id}
                onClick={() => setFilters(prev => ({ ...prev, status: status.id }))}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 transform hover:scale-105 ${filters.status === status.id
                    ? 'bg-accent-600 text-white shadow-lg shadow-accent-600/30'
                    : 'bg-primary-800 text-gray-300 hover:bg-primary-700 hover:text-white border border-primary-700'
                  }`}
              >
                {status.label}
              </button>
            ))}
          </div>

          {/* Genre Filters (Mock/Local for visual demo) */}
          <div className="flex flex-wrap gap-3 items-center">
            <span className="text-gray-400 font-medium mr-2">Genres:</span>
            {genres.map(genre => (
              <button
                key={genre}
                onClick={() => handleFilterToggle('genre', genre)}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${filters.genre === genre
                    ? 'bg-accent-600/20 text-accent-400 border border-accent-500/50'
                    : 'bg-primary-800 text-gray-400 border border-primary-700 hover:border-gray-500'
                  }`}
              >
                {genre}
              </button>
            ))}
          </div>

          {/* Active Filters Summary & Clear */}
          {(filters.genre || filters.language || searchQuery) && (
            <div className="flex items-center gap-4 pt-2">
              <button
                onClick={clearAllFilters}
                className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1 font-medium"
              >
                <X size={16} /> Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Movies Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin text-accent-500 mb-4">
              <Film size={48} />
            </div>
            <p className="text-gray-400 animate-pulse">Finding the perfect movies...</p>
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-20 bg-primary-800/30 rounded-2xl border border-primary-800 mx-auto max-w-md">
            <Film size={64} className="mx-auto mb-6 text-gray-600" />
            <h3 className="text-xl font-bold text-white mb-2">No Movies Found</h3>
            <p className="text-gray-400 mb-6">We couldn't find any movies matching your filters.</p>
            <button
              onClick={clearAllFilters}
              className="bg-primary-700 text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {movies.map((movie) => {
              const isTmdb = !!movie.poster_path;
              const poster = isTmdb
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : movie.posterUrl;
              const rating = isTmdb ? movie.vote_average : movie.rating;
              const link = isTmdb ? `/tmdb/${movie.id}` : `/movie/${movie._id}`; // Updated routing
              const releaseDate = isTmdb ? movie.release_date : null;

              return (
                <div
                  key={movie.id || movie._id}
                  className="group bg-primary-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-accent-900/10 transition-all duration-300 hover:-translate-y-2 border border-primary-700/50"
                >
                  {/* Poster Container */}
                  <div className="relative aspect-[2/3] overflow-hidden bg-primary-900">
                    {poster ? (
                      <img
                        src={poster}
                        alt={movie.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600">
                        <Film size={64} />
                      </div>
                    )}

                    {/* Overlay Gradient on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary-950 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Rating Badge */}
                    {rating && (
                      <div className="absolute top-3 right-3 bg-primary-950/80 backdrop-blur-md text-yellow-400 px-2 py-1 rounded-lg flex items-center gap-1 font-bold text-sm shadow-lg border border-white/10">
                        <Star size={14} fill="currentColor" />
                        <span>{typeof rating === 'number' ? rating.toFixed(1) : rating}</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-accent-400 transition-colors">
                      {movie.title}
                    </h3>

                    <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                      {releaseDate && (
                        <div className="flex items-center gap-1.5">
                          <Calendar size={14} />
                          <span>{new Date(releaseDate).getFullYear()}</span>
                        </div>
                      )}
                      {!isTmdb && movie.duration && (
                        <div className="flex items-center gap-1.5">
                          <Clock size={14} />
                          <span>{movie.duration} min</span>
                        </div>
                      )}
                    </div>

                    <Link
                      to={link}
                      className="block w-full py-3 rounded-xl bg-primary-700 text-white font-semibold text-center group-hover:bg-accent-600 transition-all duration-300 shadow-md group-hover:shadow-accent-600/25"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Movies;
