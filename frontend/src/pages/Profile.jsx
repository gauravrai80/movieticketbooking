import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { User, Ticket, Settings, Heart, Save, LogOut } from 'lucide-react';
import './Profile.css';

export default function Profile() {
    const { user, login, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('info');
    const [loading, setLoading] = useState(true);
    const [profileData, setProfileData] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [favorites, setFavorites] = useState([]);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        dateOfBirth: '',
        gender: 'prefer-not-to-say',
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: ''
    });

    const [preferences, setPreferences] = useState({
        theme: 'dark',
        notifications: {
            bookingConfirmation: true,
            showReminder: true,
            newReleases: true,
            specialOffers: true
        }
    });

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchProfileData();
    }, [user, navigate]);

    const fetchProfileData = async () => {
        try {
            setLoading(true);
            const [profileRes, bookingsRes] = await Promise.all([
                api.get('/profile/me'),
                api.get('/profile/bookings')
            ]);

            const data = profileRes;
            setProfileData(data);
            setFavorites(data.favoriteTheaters || []);

            setFormData({
                name: data.name || '',
                phone: data.phone || '',
                dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '',
                gender: data.gender || 'prefer-not-to-say',
                street: data.address?.street || '',
                city: data.address?.city || '',
                state: data.address?.state || '',
                postalCode: data.address?.postalCode || '',
                country: data.address?.country || ''
            });

            if (data.preferences) {
                setPreferences({
                    theme: data.preferences.theme || 'dark',
                    notifications: {
                        bookingConfirmation: data.preferences.notifications?.bookingConfirmation ?? true,
                        showReminder: data.preferences.notifications?.showReminder ?? true,
                        newReleases: data.preferences.notifications?.newReleases ?? true,
                        specialOffers: data.preferences.notifications?.specialOffers ?? true
                    }
                });
            }

            setBookings(bookingsRes.bookings || []);
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const updateData = {
                name: formData.name,
                phone: formData.phone,
                dateOfBirth: formData.dateOfBirth,
                gender: formData.gender,
                address: {
                    street: formData.street,
                    city: formData.city,
                    state: formData.state,
                    postalCode: formData.postalCode,
                    country: formData.country
                }
            };

            const res = await api.put('/profile/me', updateData);
            // Update local user context if name changed
            if (res.name !== user.name) {
                // We might need a way to partially update user context without full login
                // For now, we rely on the next fetch or refresh
            }
            alert('Profile updated successfully!');
            fetchProfileData();
        } catch (error) {
            alert('Failed to update profile: ' + error.message);
        }
    };

    const handleUpdatePreferences = async () => {
        try {
            await api.put('/profile/preferences', preferences);
            alert('Preferences saved!');
        } catch (error) {
            alert('Failed to save preferences');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) return <div className="profile-loading">Loading profile...</div>;

    return (
        <div className="profile-container">
            <div className="profile-header">
                <div className="profile-avatar">
                    {profileData?.profileImage ? (
                        <img src={profileData.profileImage} alt="Profile" />
                    ) : (
                        <div className="avatar-placeholder">{profileData?.name?.charAt(0)}</div>
                    )}
                </div>
                <div className="profile-info-header">
                    <h1>{profileData?.name}</h1>
                    <p>{profileData?.email}</p>
                    <p className="joined-date">Member since {new Date(profileData?.createdAt).toLocaleDateString()}</p>
                </div>
                <button onClick={handleLogout} className="logout-btn">
                    <LogOut size={18} /> Logout
                </button>
            </div>

            <div className="profile-content">
                <div className="sidebar-nav">
                    <button
                        className={activeTab === 'info' ? 'active' : ''}
                        onClick={() => setActiveTab('info')}
                    >
                        <User size={20} /> Personal Info
                    </button>
                    <button
                        className={activeTab === 'bookings' ? 'active' : ''}
                        onClick={() => setActiveTab('bookings')}
                    >
                        <Ticket size={20} /> My Bookings
                    </button>
                    <button
                        className={activeTab === 'preferences' ? 'active' : ''}
                        onClick={() => setActiveTab('preferences')}
                    >
                        <Settings size={20} /> Preferences
                    </button>
                    <button
                        className={activeTab === 'favorites' ? 'active' : ''}
                        onClick={() => setActiveTab('favorites')}
                    >
                        <Heart size={20} /> Favorites
                    </button>
                </div>

                <div className="tab-content">
                    {activeTab === 'info' && (
                        <form onSubmit={handleUpdateProfile} className="profile-form">
                            <h2>Personal Information</h2>

                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Phone</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Date of Birth</label>
                                    <input
                                        type="date"
                                        value={formData.dateOfBirth}
                                        onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Gender</label>
                                <select
                                    value={formData.gender}
                                    onChange={e => setFormData({ ...formData, gender: e.target.value })}
                                >
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                    <option value="prefer-not-to-say">Prefer not to say</option>
                                </select>
                            </div>

                            <h3>Address</h3>
                            <div className="form-group">
                                <label>Street Address</label>
                                <input
                                    type="text"
                                    value={formData.street}
                                    onChange={e => setFormData({ ...formData, street: e.target.value })}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>City</label>
                                    <input
                                        type="text"
                                        value={formData.city}
                                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>State</label>
                                    <input
                                        type="text"
                                        value={formData.state}
                                        onChange={e => setFormData({ ...formData, state: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Postal Code</label>
                                    <input
                                        type="text"
                                        value={formData.postalCode}
                                        onChange={e => setFormData({ ...formData, postalCode: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Country</label>
                                    <input
                                        type="text"
                                        value={formData.country}
                                        onChange={e => setFormData({ ...formData, country: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button type="submit" className="save-btn">
                                <Save size={18} /> Save Changes
                            </button>
                        </form>
                    )}

                    {activeTab === 'bookings' && (
                        <div className="bookings-list">
                            <h2>My Booking History</h2>
                            {bookings.length === 0 ? (
                                <p className="empty-state">No bookings found.</p>
                            ) : (
                                bookings.map(booking => (
                                    <div key={booking._id} className="booking-card-profile">
                                        <img
                                            src={booking.movie?.posterUrl}
                                            alt={booking.movie?.title}
                                            className="booking-poster"
                                        />
                                        <div className="booking-details">
                                            <h3>{booking.movie?.title}</h3>
                                            <p className="booking-meta">
                                                {new Date(booking.showtime?.startTime).toLocaleString()}
                                            </p>
                                            <p className="booking-meta">{booking.theater?.name}</p>
                                            <div className="booking-status">
                                                <span className={`status-badge ${booking.status.toLowerCase()}`}>
                                                    {booking.status}
                                                </span>
                                                <span>{booking.seats.length} Tickets</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'preferences' && (
                        <div className="preferences-form">
                            <h2>Preferences</h2>

                            <div className="pref-section">
                                <h3>Notifications</h3>
                                <label className="toggle-row">
                                    <span>Booking Confirmations</span>
                                    <input
                                        type="checkbox"
                                        checked={preferences.notifications.bookingConfirmation}
                                        onChange={e => setPreferences({
                                            ...preferences,
                                            notifications: { ...preferences.notifications, bookingConfirmation: e.target.checked }
                                        })}
                                    />
                                </label>
                                <label className="toggle-row">
                                    <span>Show Reminders</span>
                                    <input
                                        type="checkbox"
                                        checked={preferences.notifications.showReminder}
                                        onChange={e => setPreferences({
                                            ...preferences,
                                            notifications: { ...preferences.notifications, showReminder: e.target.checked }
                                        })}
                                    />
                                </label>
                                <label className="toggle-row">
                                    <span>New Movie Releases</span>
                                    <input
                                        type="checkbox"
                                        checked={preferences.notifications.newReleases}
                                        onChange={e => setPreferences({
                                            ...preferences,
                                            notifications: { ...preferences.notifications, newReleases: e.target.checked }
                                        })}
                                    />
                                </label>
                            </div>

                            <div className="pref-section">
                                <h3>App Settings</h3>
                                <label className="toggle-row">
                                    <span>Dark Mode</span>
                                    <select
                                        value={preferences.theme}
                                        onChange={e => setPreferences({ ...preferences, theme: e.target.value })}
                                    >
                                        <option value="dark">Dark</option>
                                        <option value="light">Light</option>
                                    </select>
                                </label>
                            </div>

                            <button onClick={handleUpdatePreferences} className="save-btn">
                                <Save size={18} /> Save Preferences
                            </button>
                        </div>
                    )}

                    {activeTab === 'favorites' && (
                        <div className="favorites-list">
                            <h2>Favorite Theaters</h2>
                            {favorites.length === 0 ? (
                                <p className="empty-state">No favorite theaters added yet.</p>
                            ) : (
                                favorites.map(theater => (
                                    <div key={theater._id} className="favorite-card">
                                        <h3>{theater.name}</h3>
                                        <p>{theater.city}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
