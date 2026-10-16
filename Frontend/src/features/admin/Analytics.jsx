import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '@/hooks/useTheme';
import EChartCard from '@/components/ui/EChartCard';

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

      const primaryColor = isDarkMode ? '#B85D3B' : '#A34F32';
      const copperColor = isDarkMode ? '#C68A5A' : '#B8794A';
      const tooltipBg = isDarkMode ? '#171714' : '#FFFFFF';
      const tooltipBorder = isDarkMode ? '#383632' : '#E8E0D3';
      const tooltipText = isDarkMode ? '#F3EEE5' : '#20201E';
      const axisText = isDarkMode ? '#8E8679' : '#6B6459';
      const gridSplit = isDarkMode ? '#242320' : '#F3EEE5';

      // 1. Revenue Over Time
      if (revRes.status === 'fulfilled' && revRes.value.data?.success) {
        const revData = revRes.value.data.data || [];
        if (revData.length > 0) {
          const xLabels = revData.map(d => d.date || d._id || 'Period');
          const yValues = revData.map(d => d.revenue || d.amount || 0);

          setRevenueTimeChart({
            tooltip: {
              trigger: 'axis',
              backgroundColor: tooltipBg,
              borderColor: tooltipBorder,
              borderWidth: 1,
              textStyle: { color: tooltipText, fontSize: 12 },
              formatter: '{b}: <b style="color:' + primaryColor + '">₹{c}</b>'
            },
            grid: { top: 25, right: 20, bottom: 35, left: 60 },
            xAxis: {
              type: 'category',
              data: xLabels,
              axisLabel: { color: axisText, fontSize: 11 },
              axisLine: { lineStyle: { color: tooltipBorder } }
            },
            yAxis: {
              type: 'value',
              axisLabel: { color: axisText, formatter: '₹{value}', fontSize: 11 },
              splitLine: { lineStyle: { color: gridSplit } }
            },
            series: [{
              data: yValues,
              type: 'bar',
              barWidth: '40%',
              itemStyle: {
                color: primaryColor,
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
            color: ['#A34F32', '#B8794A', '#D9822B', '#8C8275', '#B9623E', '#C68A5A', '#6B6459', '#3D3833'],
            tooltip: {
              trigger: 'item',
              backgroundColor: tooltipBg,
              borderColor: tooltipBorder,
              borderWidth: 1,
              padding: [8, 12],
              textStyle: { color: tooltipText, fontSize: 12, fontWeight: 600 },
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
              textStyle: { color: axisText, fontSize: 11, fontWeight: 600 }
            },
            series: [{
              name: 'Category',
              type: 'pie',
              center: ['50%', '42%'],
              radius: ['40%', '64%'],
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
                  color: tooltipText
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
            color: ['#A34F32', '#B8794A', '#5A534A', '#D9822B', '#8E8679'],
            tooltip: {
              trigger: 'item',
              backgroundColor: tooltipBg,
              borderColor: tooltipBorder,
              borderWidth: 1,
              padding: [8, 12],
              textStyle: { color: tooltipText, fontSize: 12, fontWeight: 600 },
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
              textStyle: { color: axisText, fontSize: 11, fontWeight: 600 }
            },
            series: [{
              name: 'Fuel Type',
              type: 'pie',
              center: ['50%', '42%'],
              radius: ['40%', '64%'],
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
                  color: tooltipText
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
              backgroundColor: tooltipBg,
              borderColor: tooltipBorder,
              borderWidth: 1,
              textStyle: { color: tooltipText, fontSize: 12 }
            },
            grid: { top: 25, right: 20, bottom: 35, left: 50 },
            xAxis: {
              type: 'category',
              data: cities,
              axisLabel: { color: axisText, fontSize: 11 },
              axisLine: { lineStyle: { color: tooltipBorder } }
            },
            yAxis: {
              type: 'value',
              axisLabel: { color: axisText, fontSize: 11 },
              splitLine: { lineStyle: { color: gridSplit } }
            },
            series: [{
              data: counts,
              type: 'bar',
              barWidth: '40%',
              itemStyle: {
                color: copperColor,
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
    <div className="space-y-8 font-sans">
      <div>
        <h1 className="text-2xl lg:text-3xl font-display font-black tracking-tight text-text">
          Fleet Intelligence & Analytics
        </h1>
        <p className="text-xs md:text-sm text-muted mt-1">
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
