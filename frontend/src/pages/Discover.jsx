import { useEffect, useState } from 'react';
import api from '../utils/api';
import { Search, Film } from 'lucide-react';
import { Link } from 'react-router-dom';

const Discover = () => {
  const [trending, setTrending] = useState([]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrending();
  }, []);

  const fetchTrending = async () => {
    try {
      const data = await api.get('/tmdb/trending');
      setTrending(data.results || []);
    } catch (e) {
      console.error('Failed to load trending', e);
    } finally {
      setLoading(false);
    }
  };

  const search = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    try {
      const data = await api.get(`/tmdb/search?query=${encodeURIComponent(query)}`);
      setResults(data.results || []);
    } catch (e) {
      console.error('Search failed', e);
    }
  };

  const grid = (items) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {items.map((m) => (
        <div key={`${m.id}-${m.title}`} className="bg-primary-800 rounded-lg overflow-hidden hover:shadow-xl transition">
          <div className="bg-primary-700 h-64 flex items-center justify-center relative">
            {m.poster_path ? (
              <img
                alt={m.title}
                className="w-full h-full object-cover"
                src={`https://image.tmdb.org/t/p/w500${m.poster_path}`}
              />
            ) : (
              <Film className="text-gray-600" size={48} />
            )}
          </div>
          <div className="p-4">
            <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{m.title}</h3>
            <p className="text-gray-400 text-sm mb-3 line-clamp-3">{m.overview}</p>
            <Link
              to={`/tmdb/${m.id}`}
              className="w-full block bg-accent-600 text-white py-2 rounded hover:bg-accent-700 transition text-center font-semibold"
            >
              View Details
            </Link>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-primary-950 py-12 px-4">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Discover</h1>

        <form onSubmit={search} className="flex gap-2 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-500" size={20} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-primary-800 border border-primary-700 text-white rounded pl-10 pr-3 py-2"
              placeholder="Search movies..."
            />
          </div>
          <button className="bg-accent-600 text-white px-4 py-2 rounded hover:bg-accent-700">Search</button>
        </form>

        {results.length > 0 ? (
          <>
            <h2 className="text-2xl text-white font-semibold mb-4">Search Results</h2>
            {grid(results)}
          </>
        ) : (
          <>
            <h2 className="text-2xl text-white font-semibold mb-4">Trending Today</h2>
            {loading ? <div className="text-gray-400">Loading...</div> : grid(trending)}
          </>
        )}
      </div>
    </div>
  );
};

export default Discover;
