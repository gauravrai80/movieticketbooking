import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Movies from './pages/Movies'
import MovieDetails from './pages/MovieDetails'
import Discover from './pages/Discover'
import CinemasNearby from './pages/CinemasNearby'
import CinemaShowtimes from './pages/CinemaShowtimes'
import TMDBDetails from './pages/TMDBDetails'
import Booking from './pages/Booking'
import Login from './pages/Login'
import Register from './pages/Register'
import MyBookings from './pages/MyBookings'
import AdminDashboard from './pages/AdminDashboard'
import SyncDashboard from './components/admin/SyncDashboard'
import Profile from './pages/Profile'

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <div className="flex flex-col min-h-screen bg-primary-900">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/movies" element={<Movies />} />
              <Route path="/movie/:id" element={<MovieDetails />} />
              <Route path="/discover" element={<Discover />} />
              <Route path="/tmdb/:id" element={<TMDBDetails />} />
              <Route path="/cinemas" element={<CinemasNearby />} />
              <Route path="/cinema/:cinemaId" element={<CinemaShowtimes />} />
              <Route path="/booking/:showtimeId" element={<Booking />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/my-bookings" element={<MyBookings />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/sync" element={<div className="p-4"><h1 className="text-2xl font-bold mb-4 text-white">Cinema Sync</h1><SyncDashboard /></div>} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App
