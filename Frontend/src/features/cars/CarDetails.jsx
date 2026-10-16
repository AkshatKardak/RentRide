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
  SlidersHorizontal,
  ShieldCheck,
  Zap,
  ArrowRight
} from 'lucide-react';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import { carService } from '@/services/carService';
import { useTheme } from '@/hooks/useTheme';
import { getCarImageUrl, heroCarImg as HeroCarImg } from '@/features/cars/carImageMap';

const CarDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const { isDarkMode } = useTheme();

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
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!car) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg text-text">
      <h2 className="text-xl font-bold mb-3 font-display">Vehicle Not Found</h2>
      <button 
        onClick={() => navigate('/browsecars')} 
        className="text-primary hover:underline font-semibold text-sm"
      >
        ← Back to Fleet Catalog
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg text-text pb-24 transition-colors duration-300">
      <DashboardNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/browsecars')} 
          className="flex items-center gap-2 text-text-muted hover:text-primary mb-6 transition font-medium text-xs uppercase tracking-wider"
        >
          <ArrowLeft size={16} /> Back to Fleet
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
          
          {/* Left: Image Card & Gallery */}
          <motion.div 
            initial={{ opacity: 0, x: -16 }} 
            animate={{ opacity: 1, x: 0 }} 
            className="space-y-5"
          >
            <div className="rounded-3xl p-8 border border-border bg-surface shadow-sm flex items-center justify-center min-h-[380px] lg:min-h-[440px] relative overflow-hidden group">
              <div className="absolute inset-0 bg-primary/5 rounded-3xl transform scale-0 group-hover:scale-100 transition-transform duration-500 rounded-full" />
              <img 
                src={selectedImage || getCarImageUrl(car)} 
                alt={car.name || `${car.brand} ${car.model}`} 
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = HeroCarImg;
                }}
                className="max-w-full max-h-[320px] lg:max-h-[360px] object-contain drop-shadow-md z-10 transform group-hover:scale-105 transition duration-500 ease-out" 
              />
            </div>

            {/* Gallery Thumbnails */}
            {car.images && car.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {car.images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(imgUrl)}
                    className={`w-20 h-14 rounded-xl border-2 p-1 overflow-hidden transition-all bg-surface-sunken ${
                      (selectedImage || car.primaryImage || car.images[0]) === imgUrl 
                        ? 'border-primary shadow-sm scale-105' 
                        : 'border-border opacity-70 hover:opacity-100'
                    }`}
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
            
            {/* Quick Badges */}
            <div className="flex flex-wrap gap-2.5 items-center">
              {car.imageMetadata?.verificationStatus === 'verified' ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold text-primary bg-primary-soft border-primary/20">
                  <CheckCircle2 size={13} className="text-primary" />
                  <span>Verified Model Photo</span>
                  {car.imageMetadata?.imageSource && (
                    <span className="text-[10px] text-text-subtle font-normal">({car.imageMetadata.imageSource})</span>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold text-text-subtle bg-surface border-border">
                  <Info size={13} />
                  <span>Catalog Representation</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-border bg-surface text-xs font-medium text-text-muted">
                <CheckCircle2 size={14} className="text-primary"/> Comprehensive Insurance
              </div>
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-border bg-surface text-xs font-medium text-text-muted">
                <CheckCircle2 size={14} className="text-primary"/> Deep Cleaned
              </div>
            </div>
          </motion.div>

          {/* Right: Details Panel */}
          <motion.div 
            initial={{ opacity: 0, x: 16 }} 
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2.5 mb-2.5">
                <span className="px-2.5 py-0.5 bg-primary-soft text-primary border border-primary/20 rounded-lg text-[11px] font-bold uppercase tracking-wider font-mono">
                  {car.brand}
                </span>
                <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-surface-sunken text-text-muted border border-border font-mono">
                  {car.year || '2023'}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-text font-display leading-tight">
                {car.name || `${car.brand} ${car.model}`}
              </h1>
              
              <div className="flex items-center gap-5 mt-3 text-xs text-text-muted border-b border-border pb-5">
                <span className="flex items-center gap-1"><MapPin size={14} className="text-primary"/> {car.city || 'Central Hub'}</span>
                <span className="flex items-center gap-1"><Star size={14} className="text-accent fill-accent"/> {car.rating ? `${car.rating} (${car.totalReviews || 0} reviews)` : 'Verified Fleet'}</span>
              </div>
            </div>

            {/* Vehicle Trust Score Card */}
            <div className="p-4 rounded-2xl border border-border bg-surface shadow-xs mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-primary-soft text-primary rounded-xl">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-text font-display">Vehicle Trust Score</h3>
                    <p className="text-[11px] text-text-muted">Automated fleet health diagnostics</p>
                  </div>
                </div>
                <span className="text-xl font-black text-primary font-mono tabular-nums">
                  {car.trustScore ? `${car.trustScore}` : '92'}<span className="text-xs text-text-subtle font-normal">/100</span>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2.5 border-t border-border text-[11px]">
                <div className="p-2 rounded-xl bg-surface-sunken">
                  <p className="text-text-subtle text-[10px]">Mechanical</p>
                  <p className="font-bold text-primary font-mono mt-0.5">
                    {car.maintenance?.healthScore ? `${car.maintenance.healthScore}%` : '96% Healthy'}
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-surface-sunken">
                  <p className="text-text-subtle text-[10px]">Accidents</p>
                  <p className={`font-bold mt-0.5 ${car.previousAccidents > 0 ? 'text-warning' : 'text-success'}`}>
                    {car.previousAccidents > 0 ? `${car.previousAccidents} Claimed` : '0 Structural'}
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-surface-sunken">
                  <p className="text-text-subtle text-[10px]">Odometer</p>
                  <p className="font-bold text-text font-mono mt-0.5">
                    {car.mileage ? `${car.mileage.toLocaleString('en-IN')} km` : 'GPS Tracked'}
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-surface-sunken">
                  <p className="text-text-subtle text-[10px]">Tier</p>
                  <p className="font-bold text-accent mt-0.5 uppercase tracking-wide">
                    {car.trustBreakdown?.ratingBadge || (car.trustScore >= 90 ? 'PREMIUM' : 'VERIFIED')}
                  </p>
                </div>
              </div>
            </div>

            {/* Specs Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <SpecBox icon={<Gauge size={16} />} label="Transmission" value={car.transmission || 'Manual'} />
              <SpecBox icon={<Fuel size={16} />} label="Fuel Type" value={car.fuelType || 'Petrol'} />
              <SpecBox icon={<Users size={16} />} label="Capacity" value={`${car.seats || 5} Seats`} />
              <SpecBox icon={<Zap size={16} />} label="Mileage" value={`${car.mileage?.toLocaleString('en-IN') || '18,500'} km`} />
            </div>

            {/* Powertrain & Transmission Variant Switcher */}
            <div className="p-4 rounded-2xl border border-border bg-surface shadow-xs mb-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={15} className="text-primary" />
                  <h3 className="font-bold text-xs text-text">Fleet Powertrain Variants</h3>
                </div>
                <span className="text-[10px] font-semibold text-accent bg-accent-soft px-2 py-0.5 rounded-full">
                  {car.allVariants?.length > 1 ? `${car.allVariants.length} Setups` : 'Standard Setup'}
                </span>
              </div>

              {/* Transmission Mode Switcher */}
              <div>
                <p className="text-[11px] font-semibold text-text-muted mb-1.5">
                  Transmission Mode: <span className="text-primary font-bold capitalize">{car.transmission}</span>
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
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                          isSelected
                            ? 'bg-primary text-white border-primary shadow-xs'
                            : 'bg-surface-sunken hover:bg-surface border-border text-text-muted hover:text-text cursor-pointer'
                        }`}
                      >
                        <span className="capitalize">{trans}</span>
                        {isSelected ? (
                          <span className="text-[9px] bg-white/20 px-1 py-0.2 rounded font-bold">Selected</span>
                        ) : (
                          <span className="text-[10px] text-primary">Switch ↗</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="font-bold text-sm text-text font-display mb-1.5">Vehicle Profile</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                {car.description || `Verified ${car.brand} ${car.model} in immaculate mechanical condition. GPS-tracked, full-tank delivered, and ready for immediate self-drive dispatch in ${car.city || 'India'}.`}
              </p>
            </div>

            {/* Price & Book CTA Card */}
            <div className="mt-auto bg-surface-raised rounded-2xl p-5 border border-border flex items-center justify-between shadow-sm">
              <div>
                <p className="text-[10px] font-semibold text-text-subtle uppercase tracking-wider mb-0.5">Daily Rate</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-primary font-mono tabular-nums">
                    ₹{car.pricePerDay?.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-text-subtle font-medium">/day</span>
                </div>
              </div>

              <button 
                onClick={handleBookNow} 
                className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-md shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
              >
                <span>Book Vehicle</span>
                <Calendar size={16} />
              </button>
            </div>

          </motion.div>
        </div>
      </main>
    </div>
  );
};

const SpecBox = ({ icon, label, value }) => (
  <div className="p-3.5 rounded-2xl border border-border bg-surface shadow-xs flex items-center gap-3">
    <div className="p-2 bg-primary-soft text-primary rounded-xl shrink-0">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-wider text-text-subtle">{label}</p>
      <p className="font-bold capitalize text-xs text-text truncate mt-0.5">{value}</p>
    </div>
  </div>
);

export default CarDetails;
