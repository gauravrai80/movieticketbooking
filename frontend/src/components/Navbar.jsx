'use client';

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Film, LogOut, User, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-primary-800 border-b border-primary-700 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-accent-500 font-bold text-xl hover:text-accent-400 transition">
            <Film size={28} />
            <span>MTB</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/movies" className="text-gray-100 hover:text-accent-400 transition">
              Movies
            </Link>
            <Link to="/discover" className="text-gray-100 hover:text-accent-400 transition">
              Discover
            </Link>
            <Link to="/cinemas" className="text-gray-100 hover:text-accent-400 transition">
              Cinemas
            </Link>

            {user ? (
              <>
                <Link to="/my-bookings" className="text-gray-100 hover:text-accent-400 transition">
                  My Bookings
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-gray-100 hover:text-accent-400 transition">
                    Admin
                  </Link>
                )}
                <div className="flex items-center gap-4">
                  <Link to="/profile" className="flex items-center gap-2 text-gray-100 hover:text-accent-400 transition">
                    <User size={20} />
                    <span>{user.name}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 bg-accent-600 text-white px-4 py-2 rounded hover:bg-accent-700 transition"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex gap-4">
                <Link to="/login" className="text-gray-100 hover:text-accent-400 transition">
                  Login
                </Link>
                <Link to="/register" className="bg-accent-600 text-white px-4 py-2 rounded hover:bg-accent-700 transition">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-100"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 flex flex-col gap-4 border-t border-primary-700 pt-4">
            <Link to="/movies" className="text-gray-100 hover:text-accent-400 transition">
              Movies
            </Link>
            <Link to="/discover" className="text-gray-100 hover:text-accent-400 transition">
              Discover
            </Link>
            <Link to="/cinemas" className="text-gray-100 hover:text-accent-400 transition">
              Cinemas
            </Link>

            {user ? (
              <>
                <Link to="/my-bookings" className="text-gray-100 hover:text-accent-400 transition">
                  My Bookings
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-gray-100 hover:text-accent-400 transition">
                    Admin
                  </Link>
                )}
                <Link to="/profile" className="flex items-center gap-2 text-gray-100 text-sm hover:text-accent-400 transition">
                  <User size={18} />
                  <span>{user.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-accent-600 text-white px-4 py-2 rounded hover:bg-accent-700 transition w-full justify-center"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <Link to="/login" className="text-gray-100 hover:text-accent-400 transition text-center">
                  Login
                </Link>
                <Link to="/register" className="bg-accent-600 text-white px-4 py-2 rounded hover:bg-accent-700 transition text-center">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
