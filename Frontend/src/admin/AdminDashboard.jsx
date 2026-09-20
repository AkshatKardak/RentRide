import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Car,
  CalendarCheck,
  Coins,
  AlertTriangle,
  Users,
  ShieldCheck,
  TrendingUp,
  Activity,
  ArrowUpRight,
  Clock,
  Sparkles
} from 'lucide-react';
import axios from 'axios';
import * as echarts from 'echarts';
import { useTheme } from '../context/ThemeContext';
import EChartCard from '../components/common/EChartCard';

export default function AdminDashboard() {
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCars: 0,
    availableCars: 0,
    activeBookings: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    pendingBookings: 0,
    totalUsers: 0,
    fleetUtilization: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [maintenanceAlerts, setMaintenanceAlerts] = useState([]);

  // Chart state
  const [revenueChartData, setRevenueChartData] = useState(null);
  const [utilizationChartData, setUtilizationChartData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [statsRes, activityRes, revenueRes, maintenanceRes] = await Promise.allSettled([
        axios.get(`${baseUrl}/admin/stats/dashboard`, { headers }),
        axios.get(`${baseUrl}/admin/stats/recent-activity?limit=5`, { headers }),
        axios.get(`${baseUrl}/admin/stats/revenue-analytics`, { headers }),
        axios.get(`${baseUrl}/admin/maintenance`, { headers })
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value.data?.success) {
        setStats(statsRes.value.data.data);
      }

      if (activityRes.status === 'fulfilled' && activityRes.value.data?.success) {
        setRecentBookings(activityRes.value.data.data?.bookings || []);
      }

      if (maintenanceRes.status === 'fulfilled' && maintenanceRes.value.data?.success) {
        setMaintenanceAlerts(maintenanceRes.value.data.data || []);
      }

      // Configure Revenue Chart
      if (revenueRes.status === 'fulfilled' && revenueRes.value.data?.success) {
        const revData = revenueRes.value.data.data || [];
        if (revData.length > 0) {
          const dates = revData.map(d => d.date || d._id || 'Day');
          const amounts = revData.map(d => d.revenue || d.amount || 0);

          setRevenueChartData({
            tooltip: {
              trigger: 'axis',
              formatter: '{b}: ₹{c}'
            },
            grid: { top: 30, right: 20, bottom: 30, left: 50 },
            xAxis: {
              type: 'category',
              data: dates,
              axisLine: { lineStyle: { color: isDarkMode ? '#475569' : '#cbd5e1' } }
            },
            yAxis: {
              type: 'value',
              axisLabel: { formatter: '₹{value}' },
              splitLine: { lineStyle: { color: isDarkMode ? '#334155' : '#f1f5f9' } }
            },
            series: [{
              data: amounts,
              type: 'line',
              smooth: true,
              areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: 'rgba(16, 185, 129, 0.4)' },
                  { offset: 1, color: 'rgba(16, 185, 129, 0.02)' }
                ])
              },
              itemStyle: { color: '#10b981' }
            }]
          });
        } else {
          setRevenueChartData(null);
        }
      } else {
        setRevenueChartData(null);
      }

      // Configure Fleet Utilization Donut Chart
      if (stats.totalCars > 0) {
        const rentedCount = Math.max(0, stats.totalCars - stats.availableCars);
        setUtilizationChartData({
          tooltip: { trigger: 'item' },
          legend: { bottom: '0', textStyle: { color: isDarkMode ? '#94a3b8' : '#64748b' } },
          series: [{
            type: 'pie',
            radius: ['45%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: { borderRadius: 8, borderColor: isDarkMode ? '#0f172a' : '#fff', borderWidth: 2 },
            label: { show: false },
            data: [
              { value: stats.availableCars, name: 'Available', itemStyle: { color: '#10b981' } },
              { value: rentedCount, name: 'Rented', itemStyle: { color: '#3b82f6' } },
              { value: Math.max(0, stats.totalCars - stats.availableCars - rentedCount), name: 'Maintenance', itemStyle: { color: '#f59e0b' } }
            ].filter(d => d.value > 0)
          }]
        });
      } else {
        setUtilizationChartData(null);
      }

    } catch (err) {
      console.error('Error fetching admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const metricCards = [
    {
      title: 'Total Revenue',
      value: `₹${(stats.totalRevenue || 0).toLocaleString()}`,
      subtext: `₹${(stats.monthlyRevenue || 0).toLocaleString()} this month`,
      icon: Coins,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10 border-emerald-500/20'
    },
    {
      title: 'Total Vehicles',
      value: stats.totalCars || 0,
      subtext: `${stats.availableCars || 0} currently available`,
      icon: Car,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10 border-blue-500/20'
    },
    {
      title: 'Active Bookings',
      value: stats.activeBookings || 0,
      subtext: `${stats.pendingBookings || 0} pending review`,
      icon: CalendarCheck,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10 border-purple-500/20'
    },
    {
      title: 'Fleet Utilization',
      value: `${stats.fleetUtilization || (stats.totalCars > 0 ? Math.round(((stats.totalCars - stats.availableCars) / stats.totalCars) * 100) : 0)}%`,
      subtext: 'Real-time live deployment',
      icon: Activity,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10 border-amber-500/20'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black tracking-tight">Executive Dashboard</h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Real-time fleet operations, financial performance, and health status
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/vehicles"
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition-all"
          >
            + Manage Fleet
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`p-5 rounded-2xl border transition-all ${
                isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {card.title}
                </span>
                <div className={`p-2 rounded-xl border ${card.bg}`}>
                  <Icon className={card.color} size={18} />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-2xl lg:text-3xl font-black tracking-tight">
                  {loading ? '...' : card.value}
                </span>
                <p className="text-xs text-slate-500 mt-1 font-medium">{card.subtext}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Apache ECharts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <EChartCard
            title="Revenue Performance"
            subtitle="30-day cumulative rental income trend"
            options={revenueChartData || {
              xAxis: { type: 'category', data: ['W1', 'W2', 'W3', 'W4'] },
              yAxis: { type: 'value' },
              series: [{ data: [12000, 28000, 45000, 68000], type: 'line', smooth: true, itemStyle: { color: '#10b981' } }]
            }}
            loading={loading}
          />
        </div>
        <div>
          <EChartCard
            title="Fleet Availability"
            subtitle="Current status distribution"
            options={utilizationChartData || {
              series: [{
                type: 'pie',
                radius: ['45%', '70%'],
                data: [
                  { value: stats.availableCars || 10, name: 'Available', itemStyle: { color: '#10b981' } },
                  { value: 5, name: 'Rented', itemStyle: { color: '#3b82f6' } }
                ]
              }]
            }}
            loading={loading}
          />
        </div>
      </div>

      {/* Tables: Recent Bookings & Maintenance Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className={`p-5 rounded-2xl border ${
          isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base">Recent Rentals</h3>
            <Link to="/admin/bookings" className="text-xs font-bold text-emerald-500 hover:underline">
              View All ↗
            </Link>
          </div>
          {recentBookings.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No recent bookings found in database
            </div>
          ) : (
            <div className="divide-y divide-inherit">
              {recentBookings.map((b) => (
                <div key={b._id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold">{b.car?.name || b.car?.model || 'Rental Vehicle'}</p>
                    <p className="text-slate-400 mt-0.5">{b.user?.name || 'Customer'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-500">₹{(b.totalPrice || 0).toLocaleString()}</p>
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase mt-0.5 ${
                      b.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                    }`}>
                      {b.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Maintenance Warnings */}
        <div className={`p-5 rounded-2xl border ${
          isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-500" />
              <span>Fleet Health Watchlist</span>
            </h3>
            <Link to="/admin/vehicles" className="text-xs font-bold text-emerald-500 hover:underline">
              Inspect ↗
            </Link>
          </div>
          {maintenanceAlerts.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              All vehicles operating above 80% health threshold
            </div>
          ) : (
            <div className="divide-y divide-inherit">
              {maintenanceAlerts.slice(0, 5).map((car) => (
                <div key={car._id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold">{car.brand} {car.model} ({car.year})</p>
                    <p className="text-slate-400 mt-0.5">{car.city} • Trust: {car.trustScore}/100</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500">
                      Health: {car.maintenance?.healthScore || 75}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
