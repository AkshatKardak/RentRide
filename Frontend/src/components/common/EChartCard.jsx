import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { useTheme } from '../../context/ThemeContext';

export default function EChartCard({
  title,
  subtitle,
  options,
  height = '350px',
  loading = false,
  emptyMessage = 'No chart data available'
}) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    if (!chartRef.current) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(
        chartRef.current,
        isDarkMode ? 'dark' : undefined,
        { renderer: 'canvas' }
      );
    }

    const currentTheme = isDarkMode ? 'dark' : undefined;
    if (chartInstance.current) {
      // Re-init on theme change to apply proper default palette & background
      chartInstance.current.dispose();
      chartInstance.current = echarts.init(chartRef.current, currentTheme, { renderer: 'canvas' });
      
      const themeEnhancedOptions = {
        backgroundColor: 'transparent',
        textStyle: {
          fontFamily: 'Inter, system-ui, sans-serif',
          color: isDarkMode ? '#cbd5e1' : '#4b5563'
        },
        ...options
      };

      chartInstance.current.setOption(themeEnhancedOptions, true);
    }

    const handleResize = () => {
      if (chartInstance.current) {
        chartInstance.current.resize();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [options, isDarkMode]);

  useEffect(() => {
    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, []);

  const hasData = options && (
    (options.series && options.series.length > 0 && options.series.some(s => s.data && s.data.length > 0)) ||
    (options.xAxis && options.xAxis.data && options.xAxis.data.length > 0)
  );

  return (
    <div className={`p-5 rounded-2xl border transition-all duration-200 ${
      isDarkMode ? 'bg-slate-900 border-slate-800/90 shadow-lg shadow-black/20' : 'bg-white border-slate-200/90 shadow-sm'
    }`}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3 className={`font-bold text-base md:text-lg ${
              isDarkMode ? 'text-slate-100' : 'text-slate-800'
            }`}>
              {title}
            </h3>
          )}
          {subtitle && (
            <p className={`text-xs md:text-sm mt-0.5 ${
              isDarkMode ? 'text-slate-400' : 'text-slate-500'
            }`}>
              {subtitle}
            </p>
          )}
        </div>
      )}

      {loading ? (
        <div style={{ height }} className="flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !hasData ? (
        <div style={{ height }} className="flex flex-col items-center justify-center text-slate-400">
          <p className="text-sm font-medium">{emptyMessage}</p>
        </div>
      ) : (
        <div ref={chartRef} style={{ width: '100%', height }} />
      )}
    </div>
  );
}
