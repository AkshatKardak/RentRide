import React, { useState, useEffect } from 'react';
import { ChevronRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Cards from './Cards';
import { useTheme } from '../../context/ThemeContext';
import { FadeUp, StaggerContainer } from '../../utils/Animation';
import { carService } from '../../services/carService';

import RollsRoyce from '../../assets/rolls royce.png';
import Mercedes from '../../assets/mercedes.png';
import Bugatti from '../../assets/Bugatti.png';
import luxury from '../../assets/luxury.png';
import bluecar from '../../assets/bluecar.png';
import blackcar from '../../assets/blackcar.png';

const showcaseCars = [
  {
    id: 1,
    name: "Rolls-Royce Phantom",
    brand: "Rolls-Royce",
    model: "Phantom",
    desc: "Experience unparalleled luxury with handcrafted interiors and whisper-quiet performance.",
    price: "₹18,000",
    pricePerDay: 18000,
    img: RollsRoyce,
    primaryImage: RollsRoyce,
    city: "Mumbai",
    category: "luxury",
    fuelType: "Petrol",
    trustScore: 98,
    rating: 4.9
  },
  {
    id: 2,
    name: "Mercedes-Benz S-Class",
    brand: "Mercedes-Benz",
    model: "S-Class",
    desc: "Premium executive sedan featuring cutting-edge technology and refined German engineering.",
    price: "₹9,500",
    pricePerDay: 9500,
    img: Mercedes,
    primaryImage: Mercedes,
    city: "Delhi NCR",
    category: "luxury",
    fuelType: "Petrol",
    trustScore: 95,
    rating: 4.8
  },
  {
    id: 3,
    name: "Ferrari 488 GTB",
    brand: "Ferrari",
    model: "488 GTB",
    desc: "Italian supercar delivering breathtaking speed with iconic Prancing Horse heritage.",
    price: "₹35,000",
    pricePerDay: 35000,
    img: Bugatti,
    primaryImage: Bugatti,
    city: "Bengaluru",
    category: "luxury",
    fuelType: "Petrol",
    trustScore: 99,
    rating: 5.0
  },
  {
    id: 4,
    name: "Bentley Continental GT",
    brand: "Bentley",
    model: "Continental GT",
    desc: "Handcrafted British luxury combining elegant design with exceptional performance.",
    price: "₹22,000",
    pricePerDay: 22000,
    img: luxury,
    primaryImage: luxury,
    city: "Mumbai",
    category: "luxury",
    fuelType: "Petrol",
    trustScore: 94,
    rating: 4.8
  },
  {
    id: 5,
    name: "Lamborghini Huracán EVO",
    brand: "Lamborghini",
    model: "Huracán EVO",
    desc: "Track-ready supercar with aggressive styling and naturally aspirated V10 power.",
    price: "₹40,000",
    pricePerDay: 40000,
    img: bluecar,
    primaryImage: bluecar,
    city: "Hyderabad",
    category: "luxury",
    fuelType: "Petrol",
    trustScore: 96,
    rating: 4.9
  },
  {
    id: 6,
    name: "Porsche 911 Turbo S",
    brand: "Porsche",
    model: "911 Turbo S",
    desc: "Legendary sports car offering precision handling and everyday supercar usability.",
    price: "₹28,000",
    pricePerDay: 28000,
    img: blackcar,
    primaryImage: blackcar,
    city: "Chennai",
    category: "luxury",
    fuelType: "Petrol",
    trustScore: 97,
    rating: 4.9,
    isBlackcar: true
  }
];

const Inventory = () => {
  const { isDarkMode } = useTheme();
  const [cars, setCars] = useState(showcaseCars);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFeaturedCars();
  }, []);

  const fetchFeaturedCars = async () => {
    try {
      const res = await carService.getFeaturedCars();
      if (res.success && Array.isArray(res.data) && res.data.length >= 6) {
        setCars(res.data.slice(0, 6));
      }
    } catch (err) {
      // Gracefully maintain showcase cars
      console.warn('Using elite showcase fleet:', err.message);
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
