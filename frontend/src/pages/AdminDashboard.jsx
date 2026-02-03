'use client';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { AlertCircle, Film, Users, Ticket, Building2, Calendar, Grid, TrendingUp, BarChart3 } from 'lucide-react';
import ScheduleManager from '../components/admin/ScheduleManager';
import SeatLayoutEditor from '../components/admin/SeatLayoutEditor';
import PricingManager from '../components/admin/PricingManager';
import SyncDashboard from '../components/admin/SyncDashboard';
import AnalyticsDashboard from '../components/admin/AnalyticsDashboard';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('schedule');
  const [loading, setLoading] = useState(true);

  // Stats State
  const [stats, setStats] = useState({ movies: 0, bookings: 0 });

  useEffect(() => {
    // Only redirect if explicitly not admin, waits for auth check
    if (user && user.role !== 'admin') {
      navigate('/');
    } else if (user) {
      setLoading(false);
    }
  }, [user, navigate]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-primary-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-500"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'seating', label: 'Seating Layout', icon: Grid },
    { id: 'pricing', label: 'Pricing', icon: TrendingUp },
    { id: 'sync', label: 'Cinema Sync', icon: Film },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-primary-950 py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-primary-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-gray-400">Manage your theater operations efficiently</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-primary-900 rounded-lg px-4 py-2 border border-primary-800">
              <span className="text-gray-400 text-xs uppercase">Logged in as</span>
              <p className="text-accent-400 font-bold">{user.name}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0 space-y-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl transition font-medium ${activeTab === tab.id
                  ? 'bg-accent-600 text-white shadow-lg shadow-accent-600/20'
                  : 'text-gray-400 hover:bg-primary-900 hover:text-white'
                  }`}
              >
                <tab.icon size={20} />
                {tab.label}
              </button>
            ))}

            <div className="pt-8 mt-8 border-t border-primary-800">
              <p className="px-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Quick Stats</p>
              <div className="px-4 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total Bookings</span>
                  <span className="text-white font-bold">124</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Active Screens</span>
                  <span className="text-white font-bold">5</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 bg-primary-900/30 rounded-2xl border border-primary-800/50 p-1 min-h-[600px]">
            <div className="bg-primary-950 rounded-xl h-full p-6">
              {activeTab === 'schedule' && <ScheduleManager />}
              {activeTab === 'seating' && <SeatLayoutEditor />}
              {activeTab === 'pricing' && <PricingManager />}
              {activeTab === 'sync' && <SyncDashboard />}
              {activeTab === 'analytics' && <AnalyticsDashboard />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
