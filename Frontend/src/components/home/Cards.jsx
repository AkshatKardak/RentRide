import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapPin, ShieldCheck, Fuel, Star } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { ZoomIn } from '../../utils/Animation';
import heroCarImg from '../../assets/herocar.png';

const Cards = ({ item }) => {
  const { isDarkMode } = useTheme();

  const theme = {
    cardBg: isDarkMode ? '#1e293b' : '#ffffff',
    cardBgHover: isDarkMode ? '#334155' : 'rgba(16, 185, 129, 0.05)',
    text: isDarkMode ? '#f1f5f9' : '#1F2937',
    textSecondary: isDarkMode ? '#cbd5e1' : '#6B7280',
    border: isDarkMode ? '#334155' : 'rgba(16, 185, 129, 0.2)',
    borderHover: '#10b981',
  };

  const carName = item.name || `${item.brand || ''} ${item.model || 'Vehicle'}`.trim();
  const price = item.pricePerDay || 2200;
  const imageUrl = item.primaryImage || item.images?.[0] || item.img || heroCarImg;
  const trustScore = item.trustScore;
  const rating = item.rating;
  const city = item.city;

  return (
    <motion.div
      variants={ZoomIn()}
      className='group'
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className='relative rounded-2xl flex flex-col justify-between p-6 backdrop-blur-sm transition-all duration-300 shadow-lg overflow-hidden h-full border'
        style={{
          backgroundColor: theme.cardBg,
          borderColor: theme.border,
        }}
      >
        {/* Top Badges */}
        <div className="flex items-center justify-between z-10 w-full mb-3">
          {trustScore ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <ShieldCheck size={12} /> {trustScore}/100 Trust
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20">
              <ShieldCheck size={12} /> Verified
            </span>
          )}
          {rating ? (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400">
              <Star size={12} className="fill-amber-400" /> {rating}
            </span>
          ) : (
            <span className="text-xs text-slate-400 font-medium">New Fleet</span>
          )}
        </div>

        {/* Image */}
        <div className='relative h-44 flex items-center justify-center my-2'>
          <img
            src={imageUrl}
            alt={carName}
            className='max-h-full max-w-full object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300'
          />
        </div>

        {/* Details */}
        <div className="text-left space-y-2 w-full pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className='font-bold text-lg leading-snug' style={{ color: theme.text }}>
                {carName}
              </h3>
              <p className="text-xs flex items-center gap-1 text-slate-400 mt-0.5">
                <MapPin size={12} className="text-emerald-500" />
                {city && <span>{city} • </span>}
                <span className="capitalize">{item.category || 'Sedan'}</span>
                <span>•</span>
                <span className="capitalize">{item.fuelType || 'Petrol'}</span>
              </p>
            </div>
          </div>

          <div className='flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800'>
            <div>
              <span className='font-black text-xl text-emerald-500'>
                ₹{price.toLocaleString()}
              </span>
              <span className='text-[10px] text-slate-400 block -mt-1'>per day</span>
            </div>

            <Link
              to={`/car/${item._id || item.id}`}
              className='px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all'
            >
              Rent Now
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Cards;
