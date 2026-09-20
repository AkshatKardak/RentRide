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
  Info 
} from 'lucide-react';
import DashboardNavbar from '../components/layout/DashboardNavbar';
import { carService } from '../services/carService';
import { useTheme } from '../context/ThemeContext';

// Import all car images
import PorscheImg from '../assets/porsche.png';
import LamboImg from '../assets/lambo.png';
import BugattiImg from '../assets/Bugatti.png';
import MercedesImg from '../assets/mercedes.png';
import G63Img from '../assets/mercedesg63amg.png';
import KiaImg from '../assets/Kia.png';
import SkodaImg from '../assets/skoda.png';
import SupraImg from '../assets/supra.png';
import RollsImg from '../assets/rolls royce.png';
import AudiImg from '../assets/AudiElectric.png';
import HeroCarImg from '../assets/herocar.png';
import MustangImg from '../assets/blackcar.png';
import NanoImg from '../assets/Nano.png';
import HondaImg from '../assets/Honda.png';

const carImageAssets = {
  'porsche': PorscheImg,
  'lamborghini': LamboImg,
  'bugatti': BugattiImg,
  'mercedes': MercedesImg,
  'mercedes-benz': MercedesImg,
  'g63': G63Img,
  'kia': KiaImg,
  'skoda': SkodaImg,
  'toyota': SupraImg,
  'ford': MustangImg,
  'rolls-royce': RollsImg,
  'audi': AudiImg,
  'tata': NanoImg,
  'nano': NanoImg,
  'honda': HondaImg,
};

const getCarImage = (car) => {
  // Priority 1: Use car's own image URL if available
  if (car.images?.[0] && car.images[0].startsWith('http')) {
    return car.images[0];
  }
  
  const brand = (car.brand || '').toLowerCase();
  const model = (car.model || '').toLowerCase();
  const name = (car.name || '').toLowerCase();
  
  // Priority 2: Match specific models
  if (name.includes('elevate') || model.includes('elevate')) return HondaImg;
  if (name.includes('nano') || model.includes('nano')) return NanoImg;
  if (name.includes('g63') || model.includes('g63')) return G63Img;
  if (name.includes('supra') || model.includes('supra')) return SupraImg;
  
  // Priority 3: Match brand
  if (carImageAssets[brand]) {
    return carImageAssets[brand];
  }
  
  // Priority 4: Default fallback
  return HeroCarImg;
};

const CarDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  
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
          pickupLocation: car.location || 'Mumbai Hub',
          dropoffLocation: car.location || 'Mumbai Hub',
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
                src={getCarImage(car)} 
                alt={car.name} 
                className="max-w-full max-h-[350px] object-contain drop-shadow-2xl z-10 transform group-hover:scale-110 transition duration-700 ease-out" 
              />
            </div>
            
            {/* Quick Badges */}
            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
               <div 
                 className="flex items-center gap-2 px-4 py-2 rounded-full border shadow-sm text-sm whitespace-nowrap"
                 style={{ backgroundColor: theme.card, borderColor: theme.border }}
               >
                  <CheckCircle2 size={16} className="text-green-500"/> Verified
               </div>
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
                  <CheckCircle2 size={16} className="text-green-500"/> Cleaned
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
                <span className="flex items-center gap-1.5"><MapPin size={18} className="text-green-500"/> {car.city || car.location || 'Mumbai'}</span>
                <span className="flex items-center gap-1.5"><Star size={18} className="text-yellow-400 fill-yellow-400"/> {car.rating || '4.8'} ({car.totalReviews || 12} verified trips)</span>
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
                  {car.trustScore || 88}<span className="text-xs text-slate-400 font-normal">/100</span>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t text-[11px]" style={{ borderColor: theme.border }}>
                <div className="p-2 rounded-xl bg-slate-500/5">
                  <p className="text-slate-400">Maintenance</p>
                  <p className="font-bold text-emerald-500">{car.maintenance?.healthScore || 90}% Health</p>
                </div>
                <div className="p-2 rounded-xl bg-slate-500/5">
                  <p className="text-slate-400">Accident History</p>
                  <p className="font-bold text-emerald-500">0 Structural</p>
                </div>
                <div className="p-2 rounded-xl bg-slate-500/5">
                  <p className="text-slate-400">Odometer</p>
                  <p className="font-bold text-emerald-500">GPS Verified</p>
                </div>
                <div className="p-2 rounded-xl bg-slate-500/5">
                  <p className="text-slate-400">Passport</p>
                  <p className="font-bold text-emerald-500">Digital Record</p>
                </div>
              </div>
            </div>

            {/* Specs Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
               <SpecBox icon={<Gauge size={20} />} label="Transmission" value={car.transmission} theme={theme} />
               <SpecBox icon={<Fuel size={20} />} label="Fuel Type" value={car.fuelType} theme={theme} />
               <SpecBox icon={<Users size={20} />} label="Capacity" value={`${car.seats || 5} Persons`} theme={theme} />
               <SpecBox icon={<Info size={20} />} label="Mileage" value={`${car.mileage || '25,000'} km`} theme={theme} />
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="font-bold text-lg mb-3" style={{ color: theme.text }}>About this vehicle</h3>
              <p className="leading-relaxed text-base" style={{ color: theme.textSecondary }}>
                {car.description || "Reliable mid-size SUV with Honda's legendary engineering and comfort. Perfect for city drives and weekend getaways. Regularly serviced and sanitized for your safety."}
              </p>
            </div>

            {/* Features */}
            <div className="mb-8">
              <h3 className="font-bold text-lg mb-3" style={{ color: theme.text }}>Key Features</h3>
              <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                {(car.features && car.features.length > 0 ? car.features : ['Honda Sensing', 'Walk-Away Auto Lock', 'Lane Watch Camera', 'Remote Engine Start', 'Bluetooth', 'GPS Navigation']).map((feature, i) => (
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
