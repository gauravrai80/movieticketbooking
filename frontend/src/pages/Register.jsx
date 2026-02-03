'use client';

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Film, User, Mail, Phone, Lock, AlertCircle } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/auth/register', formData);
      login(response.user, response.token);
      navigate('/');
    } catch (error) {
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-900 to-primary-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-primary-800 rounded-lg shadow-2xl p-8">
        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Film className="text-accent-500" size={28} />
          <h1 className="text-2xl font-bold text-white">MTB</h1>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2 text-center">Create Account</h2>
        <p className="text-gray-400 text-center mb-8">Join us to book your favorite movies</p>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900 bg-opacity-30 border border-red-500 text-red-300 px-4 py-3 rounded mb-6 flex items-center gap-2 text-sm">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-white text-sm font-semibold mb-1">Full Name</label>
            <div className="flex items-center bg-primary-700 border border-primary-600 rounded px-4 py-3">
              <User size={20} className="text-gray-400 mr-3" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
                required
                className="flex-1 bg-transparent text-white outline-none placeholder-gray-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-white text-sm font-semibold mb-1">Email Address</label>
            <div className="flex items-center bg-primary-700 border border-primary-600 rounded px-4 py-3">
              <Mail size={20} className="text-gray-400 mr-3" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                required
                className="flex-1 bg-transparent text-white outline-none placeholder-gray-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-white text-sm font-semibold mb-1">Phone Number</label>
            <div className="flex items-center bg-primary-700 border border-primary-600 rounded px-4 py-3">
              <Phone size={20} className="text-gray-400 mr-3" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 123-4567"
                required
                className="flex-1 bg-transparent text-white outline-none placeholder-gray-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-white text-sm font-semibold mb-1">Password</label>
            <div className="flex items-center bg-primary-700 border border-primary-600 rounded px-4 py-3">
              <Lock size={20} className="text-gray-400 mr-3" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a strong password"
                required
                minLength="6"
                className="flex-1 bg-transparent text-white outline-none placeholder-gray-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-white text-sm font-semibold mb-1">Confirm Password</label>
            <div className="flex items-center bg-primary-700 border border-primary-600 rounded px-4 py-3">
              <Lock size={20} className="text-gray-400 mr-3" />
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
                minLength="6"
                className="flex-1 bg-transparent text-white outline-none placeholder-gray-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent-600 text-white font-bold py-3 rounded hover:bg-accent-700 transition disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="border-t border-primary-700"></div>
          <div className="absolute inset-x-0 -inset-y-3 text-center text-gray-500 text-sm bg-primary-800 px-2">
            Already have an account?
          </div>
        </div>

        {/* Sign In Link */}
        <Link
          to="/login"
          className="block w-full border-2 border-accent-500 text-accent-400 text-center font-bold py-3 rounded hover:bg-accent-500 hover:text-white transition"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
};

export default Register;
