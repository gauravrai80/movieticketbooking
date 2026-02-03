import { useState, useEffect } from 'react';
import api from '../../utils/api';
import './SyncDashboard.css';

export default function SyncDashboard() {
    const [status, setStatus] = useState(null);
    const [syncing, setSyncing] = useState(false);
    const [selectedTheater, setSelectedTheater] = useState('');
    const [theaters, setTheaters] = useState([]);

    useEffect(() => {
        checkSyncStatus();
        fetchTheaters();
        // Poll status every 30 seconds
        const interval = setInterval(checkSyncStatus, 30000);
        return () => clearInterval(interval);
    }, []);

    const checkSyncStatus = async () => {
        try {
            const response = await api.get('/cinema-sync/status');
            setStatus(response);
        } catch (error) {
            console.error('Error fetching sync status:', error);
        }
    };

    const fetchTheaters = async () => {
        try {
            const response = await api.get('/theaters');
            setTheaters(response);
        } catch (error) {
            console.error('Error fetching theaters:', error);
        }
    }

    const handleMovieSync = async () => {
        try {
            setSyncing(true);
            const response = await api.post('/cinema-sync/movies');
            alert(`Movie sync completed. Synced: ${response.result.synced}, Updated: ${response.result.updated}`);
            await checkSyncStatus();
        } catch (error) {
            alert('Error syncing movies: ' + error.message);
        } finally {
            setSyncing(false);
        }
    };

    const handleShowtimeSync = async () => {
        try {
            setSyncing(true);
            const startDate = new Date().toISOString().split('T')[0];
            const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Default 7 days
                .toISOString()
                .split('T')[0];

            const response = await api.post('/cinema-sync/showtimes', {
                theaterId: selectedTheater || null, // If null, syncs all
                startDate,
                endDate
            });
            alert(`Showtime sync completed. Synced: ${response.result.synced}`);
            await checkSyncStatus();
        } catch (error) {
            alert('Error syncing showtimes: ' + error.message);
        } finally {
            setSyncing(false);
        }
    };

    return (
        <div className="sync-dashboard-container">
            <h2>Cinema Database Sync Control</h2>

            {status && (
                <div className="status-grid">
                    <div className="status-card">
                        <h3>Status</h3>
                        <p>Active: {status.active ? '✅ Yes' : '❌ No'}</p>
                        <p>Auto-Sync: {status.config?.autoSync ? 'Enabled' : 'Disabled'}</p>
                    </div>

                    <div className="status-card">
                        <h3>Scheduled Jobs</h3>
                        <ul>
                            {status.jobs?.map(job => (
                                <li key={job.name}>
                                    <strong>{job.name}:</strong> {job.nextInvocation ? new Date(job.nextInvocation).toLocaleString() : 'Not Scheduled'}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            <div className="controls-section">
                <h3>Manual Controls</h3>
                <div className="control-group">
                    <button onClick={handleMovieSync} disabled={syncing} className="btn-primary">
                        {syncing ? 'Syncing...' : 'Sync All Movies'}
                    </button>
                </div>

                <div className="control-group">
                    <select value={selectedTheater} onChange={(e) => setSelectedTheater(e.target.value)}>
                        <option value="">Sync All Theaters</option>
                        {Array.isArray(theaters) && theaters.map(t => (
                            <option key={t._id} value={t._id}>{t.name}</option>
                        ))}
                    </select>
                    <button onClick={handleShowtimeSync} disabled={syncing} className="btn-secondary">
                        {syncing ? 'Syncing...' : 'Sync Showtimes (7 Days)'}
                    </button>
                </div>
            </div>
        </div>
    );
}
