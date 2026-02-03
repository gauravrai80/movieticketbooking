import { useState, useEffect } from 'react';
import api from '../../utils/api';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Download, Calendar, Users, IndianRupee, Ticket } from 'lucide-react';

const AnalyticsDashboard = () => {
    const [bookingTrends, setBookingTrends] = useState([]);
    const [popularMovies, setPopularMovies] = useState([]);
    const [salesData, setSalesData] = useState(null);
    const [userActivity, setUserActivity] = useState(null);
    const [dateRange, setDateRange] = useState('week'); // week, month, year
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, [dateRange]);

    const getDateRange = () => {
        const end = new Date();
        const start = new Date();

        switch (dateRange) {
            case 'week':
                start.setDate(end.getDate() - 7);
                break;
            case 'month':
                start.setMonth(end.getMonth() - 1);
                break;
            case 'year':
                start.setFullYear(end.getFullYear() - 1);
                break;
            default:
                start.setDate(end.getDate() - 7);
        }

        return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
    };

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const { start, end } = getDateRange();
            const params = `?startDate=${start}&endDate=${end}`;

            const [trends, movies, sales, activity] = await Promise.all([
                api.get(`/analytics/booking-trends${params}`),
                api.get('/analytics/popular-movies?limit=10'),
                api.get(`/analytics/sales-performance${params}`),
                api.get(`/analytics/user-activity${params}`)
            ]);

            setBookingTrends(trends || []);
            setPopularMovies(movies || []);
            setSalesData(sales || {});
            setUserActivity(activity || {});
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const exportToCSV = () => {
        if (!bookingTrends.length) return;
        const csv = [
            ['Date', 'Bookings', 'Revenue'].join(','),
            ...bookingTrends.map(row => `${row.date},${row.bookings},${row.revenue}`)
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics_export_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const colors = ['#ec4899', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1'];

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-500"></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            {/* Header Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-primary-800/50 p-4 rounded-xl border border-primary-700">
                <div className="flex bg-primary-900 rounded-lg p-1 border border-primary-700">
                    {['week', 'month', 'year'].map(range => (
                        <button
                            key={range}
                            onClick={() => setDateRange(range)}
                            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${dateRange === range
                                    ? 'bg-accent-600 text-white shadow-lg shadow-accent-600/20'
                                    : 'text-gray-400 hover:text-white hover:bg-primary-800'
                                } capitalize`}
                        >
                            {range}
                        </button>
                    ))}
                </div>

                <button
                    onClick={exportToCSV}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-700 hover:bg-primary-600 text-white rounded-lg transition border border-primary-600"
                >
                    <Download size={18} /> Export CSV
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-primary-800 p-6 rounded-2xl border border-primary-700 shadow-xl relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <IndianRupee size={64} className="text-accent-500" />
                    </div>
                    <p className="text-gray-400 text-sm font-medium mb-1 flex items-center gap-2">
                        <IndianRupee size={16} /> Total Revenue
                    </p>
                    <p className="text-3xl font-bold text-white">₹{(salesData?.totalRevenue || 0).toLocaleString()}</p>
                    <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
                        <span className="bg-green-500/10 px-1.5 py-0.5 rounded">All Time</span> for selected period
                    </p>
                </div>

                <div className="bg-primary-800 p-6 rounded-2xl border border-primary-700 shadow-xl relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Ticket size={64} className="text-blue-500" />
                    </div>
                    <p className="text-gray-400 text-sm font-medium mb-1 flex items-center gap-2">
                        <Ticket size={16} /> Total Bookings
                    </p>
                    <p className="text-3xl font-bold text-white">{salesData?.totalBookings || 0}</p>
                    <p className="text-xs text-gray-400 mt-2">
                        Avg Value: <span className="text-yellow-400 font-bold">₹{salesData?.averageBookingValue || 0}</span>
                    </p>
                </div>

                <div className="bg-primary-800 p-6 rounded-2xl border border-primary-700 shadow-xl relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Users size={64} className="text-green-500" />
                    </div>
                    <p className="text-gray-400 text-sm font-medium mb-1 flex items-center gap-2">
                        <Users size={16} /> Active Users
                    </p>
                    <p className="text-3xl font-bold text-white">{userActivity?.activeUsers || 0}</p>
                    <p className="text-xs text-purple-400 mt-2">
                        {userActivity?.newUsers || 0} new signups
                    </p>
                </div>

                <div className="bg-primary-800 p-6 rounded-2xl border border-primary-700 shadow-xl relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Calendar size={64} className="text-yellow-500" />
                    </div>
                    <p className="text-gray-400 text-sm font-medium mb-1 flex items-center gap-2">
                        <Calendar size={16} /> Cancelled
                    </p>
                    <p className="text-3xl font-bold text-white">{salesData?.cancelledBookings || 0}</p>
                    <p className="text-xs text-red-400 mt-2">
                        Bookings cancelled
                    </p>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Booking Trends Chart */}
                <div className="bg-primary-800 p-6 rounded-2xl border border-primary-700 shadow-xl">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <span className="w-1 h-6 bg-accent-500 rounded-full"></span>  Booking & Revenue Trends
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={bookingTrends} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                                <XAxis
                                    dataKey="date"
                                    stroke="#94a3b8"
                                    fontSize={12}
                                    tickFormatter={(date) => new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                />
                                <YAxis yAxisId="left" stroke="#cbd5e1" fontSize={12} domain={['auto', 'auto']} />
                                <YAxis yAxisId="right" orientation="right" stroke="#ec4899" fontSize={12} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend iconType="circle" />
                                <Line yAxisId="left" type="monotone" dataKey="bookings" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} name="Bookings" />
                                <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#ec4899" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} name="Revenue (₹)" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Popular Movies Chart */}
                <div className="bg-primary-800 p-6 rounded-2xl border border-primary-700 shadow-xl">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <span className="w-1 h-6 bg-blue-500 rounded-full"></span> Top Movies by Bookings
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={popularMovies} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} opacity={0.5} />
                                <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                                <YAxis dataKey="title" type="category" width={100} stroke="#cbd5e1" fontSize={11} tickFormatter={(val) => val.length > 15 ? val.slice(0, 15) + '...' : val} />
                                <Tooltip
                                    cursor={{ fill: '#1e293b' }}
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                                />
                                <Bar dataKey="bookings" radius={[0, 4, 4, 0]} name="Bookings" barSize={20}>
                                    {popularMovies.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Revenue Distribution Chart */}
            <div className="bg-primary-800 p-6 rounded-2xl border border-primary-700 shadow-xl">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <span className="w-1 h-6 bg-green-500 rounded-full"></span> Revenue Distribution
                </h3>
                <div className="h-[300px] w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={popularMovies}
                                dataKey="revenue"
                                nameKey="title"
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                                labelLine={false}
                            >
                                {popularMovies.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} stroke="#1e293b" strokeWidth={2} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                                formatter={(value) => `₹${value.toLocaleString()}`}
                            />
                            <Legend iconType="circle" layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ fontSize: '12px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
