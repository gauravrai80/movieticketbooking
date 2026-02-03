import { useEffect, useState } from 'react';
import api from '../utils/api';
import { MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const CinemasNearby = () => {
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    fetchCinemas();
  }, [limit]);

  const fetchCinemas = async () => {
    try {
      const data = await api.get(`/movieglu/cinemas-nearby?n=${limit}`);
      setCinemas(data.cinemas || []);
    } catch (e) {
      console.error('Failed to load cinemas nearby', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-950 py-12 px-4">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Cinemas Nearby</h1>
        <div className="mb-6">
          <label className="text-white mr-3">Limit</label>
          <select
            className="bg-primary-800 text-white border border-primary-700 rounded px-3 py-2"
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
          >
            {[5,10,15,20,25].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        {loading ? (
          <div className="text-gray-400">Loading...</div>
        ) : cinemas.length === 0 ? (
          <div className="text-gray-400">No cinemas found for the configured location.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cinemas.map((c) => (
              <div key={c.cinema_id} className="bg-primary-800 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <MapPin className="text-accent-500" />
                  <h3 className="text-white font-semibold">{c.cinema_name}</h3>
                </div>
                <p className="text-gray-300 text-sm">{c.address}{c.address2 ? `, ${c.address2}` : ''}</p>
                <p className="text-gray-400 text-sm">{c.city}</p>
                <div className="mt-3 flex gap-2">
                  <Link
                    to={`/cinema/${c.cinema_id}`}
                    className="bg-accent-600 text-white px-4 py-2 rounded hover:bg-accent-700 transition"
                  >
                    View Showtimes
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CinemasNearby;
