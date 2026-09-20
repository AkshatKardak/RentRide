import React, { useState, useEffect } from 'react';
import { ChevronRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Cards from './Cards';
import { useTheme } from '../../context/ThemeContext';
import { FadeUp, StaggerContainer } from '../../utils/Animation';
import { carService } from '../../services/carService';

const Inventory = () => {
  const { isDarkMode } = useTheme();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFeaturedCars();
  }, []);

  const fetchFeaturedCars = async () => {
    try {
      setLoading(true);
      const res = await carService.getFeaturedCars();
      if (res.success && Array.isArray(res.data)) {
        setCars(res.data.slice(0, 6));
      }
    } catch (err) {
      console.error('Error fetching featured fleet:', err);
      setError('Unable to load featured vehicles.');
    } finally {
      setLoading(false);
    }
  };

  const theme = {
    bg: isDarkMode ? 'linear-gradient(to bottom, #1e293b, #0f172a)' : 'linear-gradient(to bottom, #f8f9fa, #ffffff)',
    text: isDarkMode ? '#f1f5f9' : '#1F2937',
    textSecondary: isDarkMode ? '#cbd5e1' : '#6B7280',
  };

  return (
    <div
      id="inventory"
      className='py-20 px-4 relative overflow-hidden transition-all duration-300'
      style={{ background: theme.bg }}
    >
      {/* Background Glow */}
      <div className='absolute top-20 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none' />
      <div className='absolute bottom-20 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none' />

      <div className='max-w-7xl mx-auto relative z-10'>
        <div className='flex flex-col space-y-3 text-center'>
          <motion.div
            variants={FadeUp(0.1)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold uppercase tracking-wider"
          >
            <Sparkles size={14} /> Live Fleet Catalog
          </motion.div>

          <motion.h2
            variants={FadeUp(0.2)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className='text-3xl lg:text-5xl font-black text-emerald-500 tracking-tight'
          >
            Our Elite Fleet
          </motion.h2>

          <motion.p
            variants={FadeUp(0.4)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className='text-sm max-w-lg mx-auto font-medium'
            style={{ color: theme.textSecondary }}
          >
            Real database-driven pricing, transparent vehicle trust scores, and verified availability.
          </motion.p>

          {/* Cars Grid */}
          {loading ? (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 pt-10">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className={`h-80 rounded-2xl border animate-pulse p-6 flex flex-col justify-between ${
                    isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-100 border-slate-200'
                  }`}
                >
                  <div className="h-40 bg-slate-300 dark:bg-slate-700 rounded-xl" />
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-3/4" />
                    <div className="h-3 bg-slate-300 dark:bg-slate-700 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : cars.length === 0 ? (
            <div className="pt-16 pb-12 text-center">
              <p className="text-sm font-semibold" style={{ color: theme.textSecondary }}>
                No featured vehicles currently available in the fleet.
              </p>
              <Link
                to="/browsecars"
                className="mt-4 inline-block px-5 py-2.5 bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md"
              >
                Browse All Cars
              </Link>
            </div>
          ) : (
            <motion.div
              variants={StaggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className='grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 pt-10'
            >
              {cars.map((car) => (
                <Cards key={car._id} item={car} />
              ))}
            </motion.div>
          )}
        </div>

        <motion.div
          variants={FadeUp(0.6)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className='pt-12 text-center'
        >
          <Link
            to="/browsecars"
            className='inline-flex items-center gap-2 px-8 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/25 hover:scale-105 active:scale-95 transition-all'
          >
            <span>Explore Entire Fleet</span>
            <ChevronRight size={18} />
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default Inventory;
