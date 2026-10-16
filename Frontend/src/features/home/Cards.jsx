import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapPin, ShieldCheck, Fuel, Star, Sparkles, ArrowRight } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { getCarImageUrl } from '@/features/cars/carImageMap';
import heroCarImg from '@/assets/herocar.png';

const Cards = ({ item }) => {
  const { isDarkMode } = useTheme();

  const carName = item.name || `${item.brand || ''} ${item.model || 'Vehicle'}`.trim();
  const price = item.pricePerDay || 2200;
  const imageUrl = getCarImageUrl(item);
  const trustScore = item.trustScore;
  const rating = item.rating;
  const city = item.city;

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className="group h-full"
    >
      <div className="relative rounded-2xl flex flex-col justify-between p-5 bg-surface border border-border hover:border-primary/40 shadow-sm hover:shadow-md transition-all duration-300 h-full overflow-hidden">
        
        {/* Top Badges */}
        <div className="flex items-center justify-between z-10 w-full mb-3">
          {trustScore ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary-soft text-primary border border-primary/20">
              <ShieldCheck size={12} /> {trustScore}/100 Trust
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-surface-sunken text-text-subtle border border-border">
              <ShieldCheck size={12} /> Verified
            </span>
          )}

          {rating ? (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-accent">
              <Star size={12} className="fill-accent text-accent" /> {rating}
            </span>
          ) : (
            <span className="text-[11px] text-text-subtle font-medium">New Fleet</span>
          )}
        </div>

        {/* Image Presentation with 16:10 fixed aspect ratio and sunken backdrop */}
        <div className="relative aspect-[16/10] w-full rounded-xl bg-surface-sunken/60 border border-border/50 flex items-center justify-center p-3 overflow-hidden my-2">
          <motion.img
            src={imageUrl}
            alt={carName}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = heroCarImg;
            }}
            className="max-h-full max-w-full object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>

        {/* Details */}
        <div className="text-left space-y-2 w-full pt-3">
          <div>
            <h3 className="font-bold text-base leading-snug text-text font-display group-hover:text-primary transition-colors">
              {carName}
            </h3>
            
            <p className="text-xs flex items-center gap-1.5 text-text-muted mt-1 flex-wrap">
              <MapPin size={12} className="text-primary shrink-0" />
              {city && <span>{city} • </span>}
              <span className="capitalize">{item.category || 'Vehicle'}</span>
              <span>•</span>
              <span className="capitalize font-medium text-text">{item.transmission || 'Manual'}</span>
              {item.availableTransmissions?.length > 1 && (
                <span className="text-[10px] px-1.5 py-0.5 bg-accent-soft text-accent border border-accent/20 rounded font-semibold">
                  Also {item.availableTransmissions.filter(t => t.toLowerCase() !== item.transmission?.toLowerCase()).map(t => t.toUpperCase()).join('/')}
                </span>
              )}
            </p>

            {item.desc && (
              <p className="text-xs text-text-muted line-clamp-2 mt-1.5 leading-relaxed">
                {item.desc}
              </p>
            )}
          </div>

          {/* Pricing & CTA */}
          <div className="flex justify-between items-center pt-3 border-t border-border mt-2">
            <div>
              <span className="font-black text-lg text-primary font-mono tabular-nums">
                ₹{typeof price === 'number' ? price.toLocaleString('en-IN') : price}
              </span>
              <span className="text-[10px] text-text-subtle block -mt-1">per day</span>
            </div>

            <Link
              to={typeof item._id === 'string' && item._id.length === 24 ? `/car/${item._id}` : '/browsecars'}
              className="px-3.5 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-semibold shadow-sm shadow-primary/20 transition-all duration-200 hover:scale-105 active:scale-95 inline-flex items-center gap-1"
            >
              <span>Book</span>
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Cards;
