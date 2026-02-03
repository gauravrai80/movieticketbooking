import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';

const formatDate = (d) => d.toISOString().slice(0,10);

const CinemaShowtimes = () => {
  const { cinemaId } = useParams();
  const [date, setDate] = useState(formatDate(new Date()));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShowtimes();
  }, [cinemaId, date]);

  const fetchShowtimes = async () => {
    try {
      const res = await api.get(`/movieglu/cinema-showtimes?cinema_id=${cinemaId}&date=${date}`);
      setData(res);
    } catch (e) {
      console.error('Failed to load showtimes', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-950 py-12 px-4">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Showtimes</h1>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-primary-800 text-white border border-primary-700 rounded px-3 py-2"
          />
        </div>

        {loading ? (
          <div className="text-gray-400">Loading...</div>
        ) : !data ? (
          <div className="text-gray-400">No data</div>
        ) : (
          <div className="space-y-6">
            <div className="bg-primary-800 p-4 rounded">
              <p className="text-white font-semibold">{data.cinema?.cinema_name}</p>
              <p className="text-gray-400 text-sm">ID: {data.cinema?.cinema_id}</p>
            </div>

            {Array.isArray(data.films) && data.films.length > 0 ? (
              data.films.map((film) => (
                <div key={`${film.film_id}-${film.film_name}`} className="bg-primary-800 p-4 rounded">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white font-semibold">{film.film_name}</p>
                      <p className="text-gray-400 text-sm">Film ID: {film.film_id}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    {film.showings && Object.keys(film.showings).map((formatKey) => (
                      <div key={formatKey} className="mb-3">
                        <p className="text-accent-400 font-semibold">{formatKey}</p>
                        <div className="flex gap-2 flex-wrap">
                          {film.showings[formatKey].times.map((t) => (
                            <span key={`${film.film_id}-${formatKey}-${t.start_time}`} className="bg-primary-700 text-white px-3 py-1 rounded text-sm">
                              {t.start_time}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-400">No films with showtimes on this date.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CinemaShowtimes;
