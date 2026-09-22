import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Fuel, 
  Gauge, 
  Users, 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  ArrowLeft, 
  Star,
  Info,
  SlidersHorizontal 
} from 'lucide-react';
import DashboardNavbar from '../components/layout/DashboardNavbar';
import { carService } from '../services/carService';
import { useTheme } from '../context/ThemeContext';

// Safe fallback & multi-tier image resolver
import { getCarImageUrl, heroCarImg as HeroCarImg } from '../utils/carImageMap';

const CarDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  
  const themeContext = useTheme();
  const { theme = {
    background: '#f9fafb',
    card: '#ffffff',
    text: '#111827',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
    hover: '#f3f4f6'
  } } = themeContext || {};

  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        const response = await carService.getCarById(id);
        if (response.success) {
          setCar(response.data);
        }
      } catch (error) {
        console.error("Error fetching car:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCarDetails();
  }, [id]);

  const handleBookNow = () => {
    if (!car) return;

    navigate('/booking-confirmation', {
      state: {
        car: car,
        bookingDetails: {
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          days: 2,
          pickupLocation: car.address || car.city || 'Central Hub',
          dropoffLocation: car.address || car.city || 'Central Hub',
          totalPrice: car.pricePerDay * 2
        }
      }
    });
  };

  if (loading) return (
    <div 
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: theme.background }}
    >
      <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!car) return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ backgroundColor: theme.background }}
    >
      <h2 className="text-2xl font-bold mb-4" style={{ color: theme.text }}>Car not found</h2>
      <button onClick={() => navigate('/browsecars')} className="text-green-600 underline">Browse Fleet</button>
    </div>
  );

  return (
    <div 
      className="min-h-screen pb-20"
      style={{ backgroundColor: theme.background, color: theme.text }}
    >
      <DashboardNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/browsecars')} 
          className="flex items-center gap-2 hover:text-green-600 mb-6 transition font-medium"
          style={{ color: theme.textSecondary }}
        >
          <ArrowLeft size={20} /> Back to Fleet
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left: Image Card */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }} 
            className="space-y-6"
          >
            <div 
              className="rounded-[32px] p-8 border shadow-xl flex items-center justify-center min-h-[400px] relative overflow-hidden group"
              style={{ backgroundColor: theme.card, borderColor: theme.border }}
            >
              <div className="absolute inset-0 bg-green-500/5 rounded-[32px] transform scale-0 group-hover:scale-100 transition-transform duration-500 rounded-full" />
              <img 
                src={selectedImage || getCarImageUrl(car)} 
                alt={car.name || `${car.brand} ${car.model}`} 
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = HeroCarImg;
                }}
                className="max-w-full max-h-[350px] object-contain drop-shadow-2xl z-10 transform group-hover:scale-105 transition duration-500 ease-out" 
              />
            </div>

            {/* Gallery Thumbnails if multiple images exist */}
            {car.images && car.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {car.images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(imgUrl)}
                    className={`w-20 h-14 rounded-xl border-2 p-1 overflow-hidden transition-all ${
                      (selectedImage || car.primaryImage || car.images[0]) === imgUrl 
                        ? 'border-green-500 shadow-md scale-105' 
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: theme.card }}
                  >
                    <img
                      src={imgUrl}
                      alt={`Angle ${idx + 1}`}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = HeroCarImg;
                      }}
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
            
            {/* Quick Badges & Provenance */}
            <div className="flex flex-wrap gap-3 items-center">
              {car.imageMetadata?.verificationStatus === 'verified' ? (
                <div 
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border shadow-sm text-xs font-semibold text-emerald-600 bg-emerald-500/10 border-emerald-500/20"
                >
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  <span>Verified Model Photo</span>
                  {car.imageMetadata?.imageSource && (
                    <span className="text-[10px] text-slate-400 font-normal">({car.imageMetadata.imageSource})</span>
                  )}
                </div>
              ) : (
                <div 
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border shadow-sm text-xs font-semibold text-slate-400 bg-slate-500/10 border-slate-500/20"
                >
                  <Info size={14} className="text-slate-400" />
                  <span>Catalog Asset</span>
                </div>
              )}
              <div 
                className="flex items-center gap-2 px-4 py-2 rounded-full border shadow-sm text-sm whitespace-nowrap"
                style={{ backgroundColor: theme.card, borderColor: theme.border }}
              >
                <CheckCircle2 size={16} className="text-green-500"/> Insured
              </div>
              <div 
                className="flex items-center gap-2 px-4 py-2 rounded-full border shadow-sm text-sm whitespace-nowrap"
                style={{ backgroundColor: theme.card, borderColor: theme.border }}
              >
                <CheckCircle2 size={16} className="text-green-500"/> Sanitized
              </div>
            </div>
          </motion.div>

          {/* Right: Details Panel */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                 <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold uppercase tracking-widest">{car.brand}</span>
                 <span 
                   className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-widest"
                   style={{ backgroundColor: theme.hover, color: theme.textSecondary }}
                 >
                   {car.year}
                 </span>
              </div>
              <h1 
                className="text-4xl md:text-5xl font-black leading-tight mb-2"
                style={{ color: theme.text }}
              >
                {car.name}
              </h1>
              <p 
                className="text-2xl font-medium"
                style={{ color: theme.textSecondary }}
              >
                {car.model}
              </p>
              
              <div 
                className="flex items-center gap-6 mt-4 text-sm font-medium border-b pb-6"
                style={{ color: theme.textSecondary, borderColor: theme.border }}
              >
                <span className="flex items-center gap-1.5"><MapPin size={18} className="text-green-500"/> {car.city || 'Central Hub'}</span>
                <span className="flex items-center gap-1.5"><Star size={18} className="text-yellow-400 fill-yellow-400"/> {car.rating ? `${car.rating} (${car.totalReviews || 0} verified trips)` : 'Verified Fleet'}</span>
              </div>
            </div>

            {/* Vehicle Trust Score Card */}
            <div 
              className="p-5 rounded-3xl border mb-6 transition-all shadow-sm"
              style={{ backgroundColor: theme.card, borderColor: theme.border }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm" style={{ color: theme.text }}>Vehicle Trust Score</h3>
                    <p className="text-xs text-slate-400">Explainable confidence rating</p>
                  </div>
                </div>
                <span className="text-2xl font-black text-emerald-500">
                  {car.trustScore ? `${car.trustScore}` : 'N/A'}<span className="text-xs text-slate-400 font-normal">{car.trustScore ? '/100' : ''}</span>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t text-[11px]" style={{ borderColor: theme.border }}>
                <div className="p-2 rounded-xl bg-slate-500/5">
                  <p className="text-slate-400">Maintenance Health</p>
                  <p className="font-bold text-emerald-500">
                    {car.maintenance?.healthScore 
                      ? `${car.maintenance.healthScore}% Verified` 
                      : (car.trustBreakdown?.breakdown?.maintenanceHealth?.score 
                          ? `${car.trustBreakdown.breakdown.maintenanceHealth.score}% Verified` 
                          : '95% Verified')}
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-slate-500/5">
                  <p className="text-slate-400">Accident History</p>
                  <p className={`font-bold ${car.previousAccidents > 0 ? 'text-amber-400' : 'text-emerald-500'}`}>
                    {car.previousAccidents > 0 ? `${car.previousAccidents} Minor Claim` : '0 Structural'}
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-slate-500/5">
                  <p className="text-slate-400">Odometer</p>
                  <p className="font-bold text-emerald-500">
                    {car.mileage ? `${car.mileage.toLocaleString()} km (GPS)` : 'GPS Verified'}
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-slate-500/5">
                  <p className="text-slate-400">Trust Rating</p>
                  <p className="font-bold text-emerald-500">
                    {car.trustBreakdown?.ratingBadge || (car.trustScore >= 90 ? 'ELITE TRUST' : car.trustScore >= 80 ? 'HIGH TRUST' : 'VERIFIED')}
                  </p>
                </div>
              </div>
            </div>

            {/* Specs Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
               <SpecBox icon={<Gauge size={20} />} label="Transmission" value={car.transmission} theme={theme} />
               <SpecBox icon={<Fuel size={20} />} label="Fuel Type" value={car.fuelType} theme={theme} />
               <SpecBox icon={<Users size={20} />} label="Capacity" value={`${car.seats || 5} Persons`} theme={theme} />
               <SpecBox icon={<Info size={20} />} label="Mileage" value={`${car.mileage?.toLocaleString() || '25,000'} km`} theme={theme} />
            </div>

            {/* Available Powertrain & Transmission Modes */}
            <div 
              className="p-5 rounded-3xl border mb-8 transition-all shadow-sm space-y-4"
              style={{ backgroundColor: theme.card, borderColor: theme.border }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                    <SlidersHorizontal size={16} />
                  </div>
                  <h3 className="font-bold text-sm" style={{ color: theme.text }}>
                    Powertrain & Transmission Modes
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  {car.allVariants?.length > 1 ? `${car.allVariants.length} Fleet Variants` : 'Standard Setup'}
                </span>
              </div>

              {/* Transmission Mode Switcher */}
              <div>
                <p className="text-xs font-semibold text-slate-400 mb-2">
                  Transmission Mode:
                  <span className="text-emerald-500 font-bold capitalize ml-1.5">{car.transmission}</span>
                  {car.availableTransmissions?.length > 1 && (
                    <span className="text-[11px] text-slate-400 font-normal ml-2">
                      (Also available in {car.availableTransmissions.filter(t => t.toLowerCase() !== car.transmission?.toLowerCase()).map(t => t.toUpperCase()).join(', ')})
                    </span>
                  )}
                </p>
                <div className="flex flex-wrap gap-2">
                  {(car.availableTransmissions || [car.transmission]).map((trans) => {
                    const isSelected = trans.toLowerCase() === car.transmission?.toLowerCase();
                    const matchingSibling = car.allVariants?.find(v => v.transmission?.toLowerCase() === trans.toLowerCase());
                    return (
                      <button
                        key={trans}
                        type="button"
                        onClick={() => {
                          if (!isSelected && matchingSibling) {
                            navigate(`/car/${matchingSibling._id}`);
                          }
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                          isSelected
                            ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20'
                            : 'hover:bg-emerald-500/10 border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:text-emerald-500 hover:border-emerald-500/30 cursor-pointer'
                        }`}
                      >
                        <Gauge size={14} />
                        <span className="capitalize">{trans}</span>
                        {isSelected ? (
                          <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded ml-1">Current</span>
                        ) : (
                          <span className="text-[10px] text-emerald-500 font-normal ml-1">Switch ↗</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Fuel Type Switcher */}
              {car.availableFuelTypes?.length > 0 && (
                <div className="pt-3 border-t" style={{ borderColor: theme.border }}>
                  <p className="text-xs font-semibold text-slate-400 mb-2">
                    Fuel & Powertrain:
                    <span className="text-emerald-500 font-bold capitalize ml-1.5">{car.fuelType}</span>
                    {car.availableFuelTypes?.length > 1 && (
                      <span className="text-[11px] text-slate-400 font-normal ml-2">
                        (Also in {car.availableFuelTypes.filter(f => f.toLowerCase() !== car.fuelType?.toLowerCase()).map(f => f.toUpperCase()).join(', ')})
                      </span>
                    )}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {car.availableFuelTypes.map((fuel) => {
                      const isSelected = fuel.toLowerCase() === car.fuelType?.toLowerCase();
                      const matchingSibling = car.allVariants?.find(v => v.fuelType?.toLowerCase() === fuel.toLowerCase());
                      return (
                        <button
                          key={fuel}
                          type="button"
                          onClick={() => {
                            if (!isSelected && matchingSibling) {
                              navigate(`/car/${matchingSibling._id}`);
                            }
                          }}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                            isSelected
                              ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20'
                              : 'hover:bg-emerald-500/10 border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:text-emerald-500 hover:border-emerald-500/30 cursor-pointer'
                          }`}
                        >
                          <Fuel size={14} />
                          <span className="capitalize">{fuel}</span>
                          {isSelected ? (
                            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded ml-1">Current</span>
                          ) : (
                            <span className="text-[10px] text-emerald-500 font-normal ml-1">Switch ↗</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="font-bold text-lg mb-3" style={{ color: theme.text }}>About this vehicle</h3>
              <p className="leading-relaxed text-base" style={{ color: theme.textSecondary }}>
                {car.description || `Verified ${car.brand} ${car.model} in pristine mechanical and cosmetic condition. Fully sanitized, GPS-equipped, and insured for smooth self-drive travel across ${car.city || 'India'}.`}
              </p>
            </div>

            {/* Features */}
            <div className="mb-8">
              <h3 className="font-bold text-lg mb-3" style={{ color: theme.text }}>Key Features</h3>
              <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                {(car.features && car.features.length > 0 ? car.features : ['Air Conditioning', 'Power Steering', 'Bluetooth Audio', 'Dual Airbags', 'ABS with EBD', 'Reverse Parking Sensors']).map((feature, i) => (
                  <div 
                    key={i} 
                    className="flex items-center gap-2 text-sm font-medium"
                    style={{ color: theme.textSecondary }}
                  >
                    <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            {/* Price Footer */}
            <div className="mt-auto bg-gray-900 rounded-[24px] p-6 text-white flex items-center justify-between shadow-2xl shadow-green-900/20">
              <div>
                <p className="text-gray-400 text-sm font-medium mb-1">Rental Price</p>
                <div className="flex items-baseline gap-1">
                   <span className="text-3xl font-black text-white">₹{car.pricePerDay?.toLocaleString()}</span>
                   <span className="text-gray-500 font-medium">/day</span>
                </div>
              </div>
              <button 
                onClick={handleBookNow} 
                className="bg-green-500 hover:bg-green-400 text-gray-900 px-8 py-4 rounded-xl font-black text-lg transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                Book Now <Calendar size={20} />
              </button>
            </div>

          </motion.div>
        </div>
      </main>
    </div>
  );
};

// Reusable Spec Component
const SpecBox = ({ icon, label, value, theme }) => (
  <div 
    className="p-4 rounded-2xl border shadow-sm flex items-start gap-4 hover:border-green-200 transition-colors"
    style={{ backgroundColor: theme.card, borderColor: theme.border }}
  >
    <div className="p-2.5 bg-green-50 rounded-xl text-green-600">
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-black uppercase tracking-wider mb-0.5" style={{ color: theme.textSecondary }}>{label}</p>
      <p className="font-bold capitalize text-base" style={{ color: theme.text }}>{value}</p>
    </div>
  </div>
);

export default CarDetails;
