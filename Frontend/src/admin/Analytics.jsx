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
        if (revData.length > 0) {
          const xLabels = revData.map(d => d.date || d._id || 'Period');
          const yValues = revData.map(d => d.revenue || d.amount || 0);

          setRevenueTimeChart({
            tooltip: {
              trigger: 'axis',
              backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.96)' : 'rgba(255, 255, 255, 0.96)',
              borderColor: isDarkMode ? '#334155' : '#e2e8f0',
              borderWidth: 1,
              textStyle: { color: isDarkMode ? '#f8fafc' : '#0f172a', fontSize: 12 },
              formatter: '{b}: <b style="color:#10b981">₹{c}</b>'
            },
            grid: { top: 25, right: 20, bottom: 35, left: 60 },
            xAxis: {
              type: 'category',
              data: xLabels,
              axisLabel: {
                color: isDarkMode ? '#94a3b8' : '#64748b',
                fontSize: 11
              },
              axisLine: { lineStyle: { color: isDarkMode ? '#334155' : '#e2e8f0' } }
            },
            yAxis: {
              type: 'value',
              axisLabel: {
                color: isDarkMode ? '#94a3b8' : '#64748b',
                formatter: '₹{value}',
                fontSize: 11
              },
              splitLine: { lineStyle: { color: isDarkMode ? 'rgba(51, 65, 85, 0.4)' : 'rgba(226, 232, 240, 0.8)' } }
            },
            series: [{
              data: yValues,
              type: 'bar',
              barWidth: '40%',
              itemStyle: {
                color: '#10b981',
                borderRadius: [6, 6, 0, 0]
              }
            }]
          });
        } else {
          setRevenueTimeChart(null);
        }
      } else {
        setRevenueTimeChart(null);
      }

      // 2. Vehicle Category Distribution
      if (vehRes.status === 'fulfilled' && vehRes.value.data?.success) {
        const catStats = vehRes.value.data.data?.categoryStats || [];
        const pieData = catStats.map(c => ({
          name: (c._id || 'Other').toUpperCase(),
          value: c.count || 0
        })).filter(p => p.value > 0);

        if (pieData.length > 0) {
          setCategoryChart({
            color: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#f97316', '#14b8a6'],
            tooltip: {
              trigger: 'item',
              backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.96)' : 'rgba(255, 255, 255, 0.96)',
              borderColor: isDarkMode ? '#334155' : '#e2e8f0',
              borderWidth: 1,
              padding: [8, 12],
              textStyle: { color: isDarkMode ? '#f8fafc' : '#0f172a', fontSize: 12, fontWeight: 600 },
              formatter: '{b}: <b style="color:#10b981">{c}</b> ({d}%)'
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
              textStyle: {
                color: isDarkMode ? '#94a3b8' : '#475569',
                fontSize: 11,
                fontWeight: 600
              },
              pageIconColor: '#10b981',
              pageIconInactiveColor: isDarkMode ? '#475569' : '#cbd5e1',
              pageTextStyle: { color: isDarkMode ? '#94a3b8' : '#475569' }
            },
            series: [{
              name: 'Category',
              type: 'pie',
              center: ['50%', '42%'],
              radius: ['40%', '64%'],
              avoidLabelOverlap: true,
              itemStyle: {
                borderRadius: 8,
                borderColor: isDarkMode ? '#0f172a' : '#ffffff',
                borderWidth: 2
              },
              label: {
                show: false
              },
              labelLine: {
                show: false
              },
              emphasis: {
                scale: true,
                scaleSize: 6,
                label: {
                  show: true,
                  formatter: '{b}\n{c} ({d}%)',
                  fontSize: 13,
                  fontWeight: 'bold',
                  color: isDarkMode ? '#f8fafc' : '#0f172a'
                }
              },
              data: pieData
            }]
          });
        } else {
          setCategoryChart(null);
        }

        // 3. Fuel Distribution
        const fuelStats = vehRes.value.data.data?.fuelStats || [];
        const fuelPieData = fuelStats.map(f => ({
          name: (f._id || 'Petrol').toUpperCase(),
          value: f.count || 0
        })).filter(f => f.value > 0);

        if (fuelPieData.length > 0) {
          setFuelChart({
            color: ['#10b981', '#3b82f6', '#f59e0b', '#06b6d4', '#8b5cf6'],
            tooltip: {
              trigger: 'item',
              backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.96)' : 'rgba(255, 255, 255, 0.96)',
              borderColor: isDarkMode ? '#334155' : '#e2e8f0',
              borderWidth: 1,
              padding: [8, 12],
              textStyle: { color: isDarkMode ? '#f8fafc' : '#0f172a', fontSize: 12, fontWeight: 600 },
              formatter: '{b}: <b style="color:#10b981">{c}</b> ({d}%)'
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
              textStyle: {
                color: isDarkMode ? '#94a3b8' : '#475569',
                fontSize: 11,
                fontWeight: 600
              },
              pageIconColor: '#10b981',
              pageIconInactiveColor: isDarkMode ? '#475569' : '#cbd5e1',
              pageTextStyle: { color: isDarkMode ? '#94a3b8' : '#475569' }
            },
            series: [{
              name: 'Fuel Type',
              type: 'pie',
              center: ['50%', '42%'],
              radius: ['40%', '64%'],
              avoidLabelOverlap: true,
              itemStyle: {
                borderRadius: 8,
                borderColor: isDarkMode ? '#0f172a' : '#ffffff',
                borderWidth: 2
              },
              label: {
                show: false
              },
              labelLine: {
                show: false
              },
              emphasis: {
                scale: true,
                scaleSize: 6,
                label: {
                  show: true,
                  formatter: '{b}\n{c} ({d}%)',
                  fontSize: 13,
                  fontWeight: 'bold',
                  color: isDarkMode ? '#f8fafc' : '#0f172a'
                }
              },
              data: fuelPieData
            }]
          });
        } else {
          setFuelChart(null);
        }
      } else {
        setCategoryChart(null);
        setFuelChart(null);
      }

      // 4. Bookings by City
      if (locRes.status === 'fulfilled' && locRes.value.data?.success) {
        const locData = locRes.value.data.data || [];
        if (locData.length > 0) {
          const cities = locData.map(l => l.city || l._id || 'City');
          const counts = locData.map(l => l.count || l.total || 0);

          setCityChart({
            tooltip: {
              trigger: 'axis',
              backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.96)' : 'rgba(255, 255, 255, 0.96)',
              borderColor: isDarkMode ? '#334155' : '#e2e8f0',
              borderWidth: 1,
              textStyle: { color: isDarkMode ? '#f8fafc' : '#0f172a', fontSize: 12 }
            },
            grid: { top: 25, right: 20, bottom: 35, left: 50 },
            xAxis: {
              type: 'category',
              data: cities,
              axisLabel: {
                color: isDarkMode ? '#94a3b8' : '#64748b',
                fontSize: 11
              },
              axisLine: { lineStyle: { color: isDarkMode ? '#334155' : '#e2e8f0' } }
            },
            yAxis: {
              type: 'value',
              axisLabel: {
                color: isDarkMode ? '#94a3b8' : '#64748b',
                fontSize: 11
              },
              splitLine: { lineStyle: { color: isDarkMode ? 'rgba(51, 65, 85, 0.4)' : 'rgba(226, 232, 240, 0.8)' } }
            },
            series: [{
              data: counts,
              type: 'bar',
              barWidth: '40%',
              itemStyle: {
                color: '#3b82f6',
                borderRadius: [6, 6, 0, 0]
              }
            }]
          });
        } else {
          setCityChart(null);
        }
      } else {
        setCityChart(null);
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
