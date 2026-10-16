import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Car,
  CalendarCheck,
  Coins,
  AlertTriangle,
  Activity,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import axios from 'axios';
import * as echarts from 'echarts';
import { useTheme } from '@/context/ThemeContext';
import EChartCard from '@/components/ui/EChartCard';

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
  }, [isDarkMode]);

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

      let fetchedStats = stats;
      if (statsRes.status === 'fulfilled' && statsRes.value.data?.success) {
        fetchedStats = statsRes.value.data.data;
        setStats(fetchedStats);
      }

      if (activityRes.status === 'fulfilled' && activityRes.value.data?.success) {
        setRecentBookings(activityRes.value.data.data?.bookings || []);
      }

      if (maintenanceRes.status === 'fulfilled' && maintenanceRes.value.data?.success) {
        setMaintenanceAlerts(maintenanceRes.value.data.data || []);
      }

      const primaryColor = isDarkMode ? '#B85D3B' : '#A34F32';
      const copperColor = isDarkMode ? '#C68A5A' : '#B8794A';

      // Configure Revenue Chart
      if (revenueRes.status === 'fulfilled' && revenueRes.value.data?.success) {
        const revData = revenueRes.value.data.data || [];
        if (revData.length > 0) {
          const dates = revData.map(d => d.date || d._id || 'Day');
          const amounts = revData.map(d => d.revenue || d.amount || 0);

          setRevenueChartData({
            tooltip: {
              trigger: 'axis',
              backgroundColor: isDarkMode ? '#171714' : '#FFFFFF',
              borderColor: isDarkMode ? '#383632' : '#E8E0D3',
              borderWidth: 1,
              textStyle: { color: isDarkMode ? '#F3EEE5' : '#20201E', fontSize: 12 },
              formatter: '{b}: <b style="color:' + primaryColor + '">₹{c}</b>'
            },
            grid: { top: 25, right: 20, bottom: 30, left: 50 },
            xAxis: {
              type: 'category',
              data: dates,
              axisLine: { lineStyle: { color: isDarkMode ? '#383632' : '#E8E0D3' } },
              axisLabel: { color: isDarkMode ? '#8E8679' : '#6B6459', fontSize: 11 }
            },
            yAxis: {
              type: 'value',
              axisLabel: { formatter: '₹{value}', color: isDarkMode ? '#8E8679' : '#6B6459', fontSize: 11 },
              splitLine: { lineStyle: { color: isDarkMode ? '#242320' : '#F3EEE5' } }
            },
            series: [{
              data: amounts,
              type: 'line',
              smooth: true,
              showSymbol: false,
              lineStyle: { width: 3, color: primaryColor },
              areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: 'rgba(163, 79, 50, 0.35)' },
                  { offset: 1, color: 'rgba(163, 79, 50, 0.02)' }
                ])
              },
              itemStyle: { color: primaryColor }
            }]
          });
        } else {
          setRevenueChartData(null);
        }
      } else {
        setRevenueChartData(null);
      }

      // Configure Fleet Utilization Donut Chart
      if (fetchedStats.totalCars > 0) {
        const rentedCount = Math.max(0, fetchedStats.totalCars - fetchedStats.availableCars);
        setUtilizationChartData({
          tooltip: {
            trigger: 'item',
            backgroundColor: isDarkMode ? '#171714' : '#FFFFFF',
            borderColor: isDarkMode ? '#383632' : '#E8E0D3',
            borderWidth: 1,
            padding: [8, 12],
            textStyle: { color: isDarkMode ? '#F3EEE5' : '#20201E', fontSize: 12, fontWeight: 600 },
            formatter: '{b}: <b style="color:' + primaryColor + '">{c}</b> ({d}%)'
          },
          legend: {
            type: 'scroll',
            orient: 'horizontal',
            bottom: 6,
            left: 'center',
            itemWidth: 10,
            itemHeight: 10,
            itemGap: 16,
            icon: 'circle',
            textStyle: { color: isDarkMode ? '#8E8679' : '#6B6459', fontSize: 11, fontWeight: 600 }
          },
          series: [{
            name: 'Status',
            type: 'pie',
            center: ['50%', '42%'],
            radius: ['42%', '66%'],
            avoidLabelOverlap: true,
            itemStyle: {
              borderRadius: 8,
              borderColor: isDarkMode ? '#11110F' : '#FFFFFF',
              borderWidth: 2
            },
            label: { show: false },
            emphasis: {
              scale: true,
              scaleSize: 6,
              label: {
                show: true,
                formatter: '{b}\n{c} ({d}%)',
                fontSize: 12,
                fontWeight: 'bold',
                color: isDarkMode ? '#F3EEE5' : '#20201E'
              }
            },
            data: [
              { value: fetchedStats.availableCars, name: 'Available', itemStyle: { color: primaryColor } },
              { value: rentedCount, name: 'Rented', itemStyle: { color: copperColor } },
              {
                value: Math.max(0, fetchedStats.totalCars - fetchedStats.availableCars - rentedCount),
                name: 'Maintenance',
                itemStyle: { color: isDarkMode ? '#5E574B' : '#948C7E' }
              }
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
      color: 'text-primary',
      bg: 'bg-primary/10 border-primary/20'
    },
    {
      title: 'Total Vehicles',
      value: stats.totalCars || 0,
      subtext: `${stats.availableCars || 0} currently available`,
      icon: Car,
      color: 'text-accent',
      bg: 'bg-accent/10 border-accent/20'
    },
    {
      title: 'Active Bookings',
      value: stats.activeBookings || 0,
      subtext: `${stats.pendingBookings || 0} pending review`,
      icon: CalendarCheck,
      color: 'text-text',
      bg: 'bg-surface-sunken border-border'
    },
    {
      title: 'Fleet Utilization',
      value: `${stats.fleetUtilization || (stats.totalCars > 0 ? Math.round(((stats.totalCars - stats.availableCars) / stats.totalCars) * 100) : 0)}%`,
      subtext: 'Real-time live deployment',
      icon: Activity,
      color: 'text-primary',
      bg: 'bg-primary/10 border-primary/20'
    }
  ];

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-black tracking-tight text-text">
            Executive Dashboard
          </h1>
          <p className="text-xs md:text-sm text-muted mt-1">
            Real-time fleet operations, financial performance, and health status
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/vehicles"
            className="px-4 py-2.5 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-xl shadow-md shadow-primary/20 transition-all flex items-center gap-1.5"
          >
            <span>+ Manage Fleet</span>
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
              className="p-5 rounded-2xl border border-border bg-surface shadow-xs hover:border-primary/30 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted">
                  {card.title}
                </span>
                <div className={`p-2 rounded-xl border ${card.bg}`}>
                  <Icon className={card.color} size={18} />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-2xl lg:text-3xl font-display font-black tracking-tight text-text font-mono">
                  {loading ? '...' : card.value}
                </span>
                <p className="text-xs text-muted mt-1 font-medium">{card.subtext}</p>
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
            subtitle="Real-time rental income trend from database"
            options={revenueChartData}
            loading={loading}
            emptyMessage="No revenue transactions logged yet"
          />
        </div>
        <div>
          <EChartCard
            title="Fleet Availability"
            subtitle="Current active vehicle status distribution"
            options={utilizationChartData}
            loading={loading}
            emptyMessage="No fleet vehicles registered"
          />
        </div>
      </div>

      {/* Tables: Recent Bookings & Maintenance Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="p-5 rounded-2xl border border-border bg-surface shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-base text-text">Recent Rentals</h3>
            <Link to="/admin/bookings" className="text-xs font-bold text-primary hover:underline">
              View All ↗
            </Link>
          </div>
          {recentBookings.length === 0 ? (
            <div className="py-8 text-center text-muted text-xs">
              No recent bookings found in database
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentBookings.map((b) => (
                <div key={b._id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-text">{b.car?.name || b.car?.model || 'Rental Vehicle'}</p>
                    <p className="text-muted mt-0.5">{b.user?.name || 'Customer'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-primary">₹{(b.totalPrice || 0).toLocaleString()}</p>
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase mt-0.5 ${
                      b.status === 'confirmed' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-accent/10 text-accent border border-accent/20'
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
        <div className="p-5 rounded-2xl border border-border bg-surface shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-base text-text flex items-center gap-2">
              <AlertTriangle size={16} className="text-accent" />
              <span>Fleet Health Watchlist</span>
            </h3>
            <Link to="/admin/vehicles" className="text-xs font-bold text-primary hover:underline">
              Inspect ↗
            </Link>
          </div>
          {maintenanceAlerts.length === 0 ? (
            <div className="py-8 text-center text-muted text-xs">
              All vehicles operating above 80% health threshold
            </div>
          ) : (
            <div className="divide-y divide-border">
              {maintenanceAlerts.slice(0, 5).map((car) => (
                <div key={car._id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-text">{car.brand} {car.model} ({car.year})</p>
                    <p className="text-muted mt-0.5">{car.city} • Trust: {car.trustScore}/100</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-accent/10 text-accent border border-accent/20">
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
