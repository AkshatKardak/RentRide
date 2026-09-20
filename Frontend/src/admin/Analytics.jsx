import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import EChartCard from '../components/common/EChartCard';

export default function Analytics() {
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);

  // Chart options state
  const [revenueTimeChart, setRevenueTimeChart] = useState(null);
  const [categoryChart, setCategoryChart] = useState(null);
  const [cityChart, setCityChart] = useState(null);
  const [fuelChart, setFuelChart] = useState(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, [isDarkMode]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [revRes, vehRes, locRes] = await Promise.allSettled([
        axios.get(`${baseUrl}/admin/stats/revenue-analytics`, { headers }),
        axios.get(`${baseUrl}/admin/stats/vehicle-analytics`, { headers }),
        axios.get(`${baseUrl}/analytics/locations`, { headers })
      ]);

      // 1. Revenue Over Time
      if (revRes.status === 'fulfilled' && revRes.value.data?.success) {
        const revData = revRes.value.data.data || [];
        const xLabels = revData.map(d => d.date || d._id || 'Period');
        const yValues = revData.map(d => d.revenue || d.amount || 0);

        setRevenueTimeChart({
          tooltip: { trigger: 'axis', formatter: '{b}: ₹{c}' },
          grid: { top: 25, right: 20, bottom: 30, left: 55 },
          xAxis: {
            type: 'category',
            data: xLabels.length > 0 ? xLabels : ['Jan', 'Feb', 'Mar', 'Apr'],
            axisLine: { lineStyle: { color: isDarkMode ? '#475569' : '#cbd5e1' } }
          },
          yAxis: {
            type: 'value',
            axisLabel: { formatter: '₹{value}' },
            splitLine: { lineStyle: { color: isDarkMode ? '#334155' : '#f1f5f9' } }
          },
          series: [{
            data: yValues.length > 0 ? yValues : [15000, 32000, 48000, 72000],
            type: 'bar',
            itemStyle: {
              color: '#10b981',
              borderRadius: [6, 6, 0, 0]
            }
          }]
        });
      }

      // 2. Vehicle Category Distribution
      if (vehRes.status === 'fulfilled' && vehRes.value.data?.success) {
        const catStats = vehRes.value.data.data?.categoryStats || [];
        const pieData = catStats.map(c => ({
          name: (c._id || 'Other').toUpperCase(),
          value: c.count || 0
        }));

        setCategoryChart({
          tooltip: { trigger: 'item' },
          legend: { bottom: '0', textStyle: { color: isDarkMode ? '#94a3b8' : '#64748b' } },
          series: [{
            type: 'pie',
            radius: ['40%', '70%'],
            itemStyle: { borderRadius: 6, borderColor: isDarkMode ? '#0f172a' : '#fff', borderWidth: 2 },
            data: pieData.length > 0 ? pieData : [
              { name: 'SUV', value: 8 },
              { name: 'SEDAN', value: 6 },
              { name: 'HATCHBACK', value: 4 },
              { name: 'LUXURY', value: 2 }
            ]
          }]
        });

        // 3. Fuel Distribution
        const fuelStats = vehRes.value.data.data?.fuelStats || [];
        const fuelPieData = fuelStats.map(f => ({
          name: (f._id || 'Petrol').toUpperCase(),
          value: f.count || 0
        }));

        setFuelChart({
          tooltip: { trigger: 'item' },
          legend: { bottom: '0', textStyle: { color: isDarkMode ? '#94a3b8' : '#64748b' } },
          series: [{
            type: 'pie',
            radius: '65%',
            data: fuelPieData.length > 0 ? fuelPieData : [
              { name: 'PETROL', value: 12 },
              { name: 'DIESEL', value: 6 },
              { name: 'CNG', value: 3 },
              { name: 'ELECTRIC', value: 2 }
            ]
          }]
        });
      }

      // 4. Bookings by City
      if (locRes.status === 'fulfilled' && locRes.value.data?.success) {
        const locData = locRes.value.data.data || [];
        const cities = locData.map(l => l.city || l._id || 'City');
        const counts = locData.map(l => l.count || l.total || 0);

        setCityChart({
          tooltip: { trigger: 'axis' },
          grid: { top: 25, right: 20, bottom: 30, left: 45 },
          xAxis: {
            type: 'category',
            data: cities.length > 0 ? cities : ['Mumbai', 'Delhi NCR', 'Bengaluru', 'Goa', 'Pune'],
            axisLine: { lineStyle: { color: isDarkMode ? '#475569' : '#cbd5e1' } }
          },
          yAxis: {
            type: 'value',
            splitLine: { lineStyle: { color: isDarkMode ? '#334155' : '#f1f5f9' } }
          },
          series: [{
            data: counts.length > 0 ? counts : [24, 18, 15, 12, 9],
            type: 'bar',
            itemStyle: {
              color: '#3b82f6',
              borderRadius: [6, 6, 0, 0]
            }
          }]
        });
      }

    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl lg:text-3xl font-black tracking-tight">Fleet Intelligence & Analytics</h1>
        <p className="text-xs md:text-sm text-slate-500 mt-1">
          Apache ECharts operational insights: revenue distributions, regional demand, and category telemetry
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EChartCard
          title="Revenue Generated"
          subtitle="Cumulative booking revenue over time"
          options={revenueTimeChart}
          loading={loading}
        />
        <EChartCard
          title="Vehicle Category Distribution"
          subtitle="Fleet share by body category"
          options={categoryChart}
          loading={loading}
        />
        <EChartCard
          title="Regional Rental Demand"
          subtitle="Top booking volume by metropolitan hub"
          options={cityChart}
          loading={loading}
        />
        <EChartCard
          title="Powertrain & Fuel Mix"
          subtitle="Petrol, Diesel, CNG, and Electric vehicle distribution"
          options={fuelChart}
          loading={loading}
        />
      </div>
    </div>
  );
}
