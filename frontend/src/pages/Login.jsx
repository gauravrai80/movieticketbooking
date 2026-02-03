'use client';

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Film, Mail, Lock, AlertCircle } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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
      const response = await api.post('/auth/login', formData);
      login(response.user, response.token);
      navigate('/');
    } catch (error) {
      setError(error.message || 'Login failed. Please try again.');
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

        <h2 className="text-2xl font-bold text-white mb-2 text-center">Welcome Back</h2>
        <p className="text-gray-400 text-center mb-8">Sign in to your account to continue</p>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900 bg-opacity-30 border border-red-500 text-red-300 px-4 py-3 rounded mb-6 flex items-center gap-2">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white text-sm font-semibold mb-2">Email Address</label>
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
            <label className="block text-white text-sm font-semibold mb-2">Password</label>
            <div className="flex items-center bg-primary-700 border border-primary-600 rounded px-4 py-3">
              <Lock size={20} className="text-gray-400 mr-3" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                className="flex-1 bg-transparent text-white outline-none placeholder-gray-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent-600 text-white font-bold py-3 rounded hover:bg-accent-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="border-t border-primary-700"></div>
          <div className="absolute inset-x-0 -inset-y-3 text-center text-gray-500 text-sm bg-primary-800 px-2">
            Don't have an account?
          </div>
        </div>

        {/* Sign Up Link */}
        <Link
          to="/register"
          className="block w-full border-2 border-accent-500 text-accent-400 text-center font-bold py-3 rounded hover:bg-accent-500 hover:text-white transition"
        >
          Create New Account
        </Link>
      </div>
    </div>
  );
};

export default Login;
