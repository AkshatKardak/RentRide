import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { 
  Search, 
  Loader2, 
  Users, 
  Fuel, 
  Gauge, 
  AlertCircle, 
  SlidersHorizontal, 
  X, 
  ShieldCheck, 
  Sparkles, 
  MapPin, 
  CheckCircle2,
  Car as CarIcon,
  RotateCcw
} from 'lucide-react';
import { carService } from '../services/carService';
import DashboardNavbar from '../components/layout/DashboardNavbar';
import { getCarImageUrl, heroCarImg } from '../utils/carImageMap';

const QUICK_CATEGORIES = ['All', 'Luxury', 'SUV', 'Sedan', 'Sports', 'Electric', 'Hatchback'];

const BrowseCars = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  
  const [displayCars, setDisplayCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [search, setSearch] = useState('');
  const [brand, setBrand] = useState('All');
  const [category, setCategory] = useState('All');
  const [transmission, setTransmission] = useState('All');
  const [priceRange, setPriceRange] = useState('All');
  const [fuelType, setFuelType] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  
  const [showFilters, setShowFilters] = useState(false);

  // Dynamic filter options
  const [brands, setBrands] = useState(['All']);
  const [categories, setCategories] = useState(['All']);
  const [transmissions, setTransmissions] = useState(['All']);
  const [fuelTypes, setFuelTypes] = useState(['All']);

  const theme = {
    bg: isDarkMode ? '#0b1324' : '#f8fafc',
    cardBg: isDarkMode ? '#111e38' : '#ffffff',
    cardBorder: isDarkMode ? '#1e293b' : '#e2e8f0',
    text: isDarkMode ? '#f8fafc' : '#0f172a',
    textSecondary: isDarkMode ? '#94a3b8' : '#64748b',
    border: isDarkMode ? '#1e293b' : '#e2e8f0',
    inputBg: isDarkMode ? '#0a1020' : '#f1f5f9',
  };

  const priceRanges = [
    { label: 'All', value: 'All' },
    { label: 'Under ₹1,500', value: '0-1500' },
    { label: '₹1,500 - ₹3,500', value: '1500-3500' },
    { label: '₹3,500 - ₹7,000', value: '3500-7000' },
    { label: '₹7,000 - ₹15,000', value: '7000-15000' },
    { label: 'Above ₹15,000', value: '15000-999999' }
  ];

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const optRes = await carService.getFilterOptions();
        if (optRes.success && optRes.data) {
          if (optRes.data.brands?.length) setBrands(optRes.data.brands);
          if (optRes.data.categories?.length) setCategories(optRes.data.categories);
          if (optRes.data.transmissions?.length) setTransmissions(optRes.data.transmissions);
          if (optRes.data.fuelTypes?.length) setFuelTypes(optRes.data.fuelTypes);
        }
      } catch (e) {
        console.warn('Could not fetch filter options:', e.message);
      }
    };
    fetchOptions();
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      loadCars();
    }, 200);
    return () => clearTimeout(debounceTimer);
  }, [search, brand, category, transmission, fuelType, priceRange, sortBy]);

  const loadCars = async () => {
    try {
      setLoading(true);
      const params = { limit: 50 };
      if (search.trim()) params.search = search.trim();
      if (brand !== 'All') params.brand = brand;
      if (category !== 'All') params.category = category.toLowerCase();
      if (transmission !== 'All') params.transmission = transmission.toLowerCase();
      if (fuelType !== 'All') params.fuelType = fuelType.toLowerCase();
      if (priceRange !== 'All') {
        const [min, max] = priceRange.split('-').map(Number);
        params.minPrice = min;
        params.maxPrice = max;
      }

      if (sortBy === 'price-asc') {
        params.sortBy = 'price';
        params.order = 'asc';
      } else if (sortBy === 'price-desc') {
        params.sortBy = 'price';
        params.order = 'desc';
      } else if (sortBy === 'rating') {
        params.sortBy = 'rating';
        params.order = 'desc';
      } else if (sortBy === 'trust') {
        params.sortBy = 'trust';
        params.order = 'desc';
      }

      const response = await carService.getAllCars(params);

      if (response.success && Array.isArray(response.data)) {
        setDisplayCars(response.data);
      } else {
        setError('Failed to load cars');
      }
    } catch (err) {
      console.error('Error loading cars:', err);
      setError('Failed to load cars. Please check if backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = () => {
    setSearch('');
    setBrand('All');
    setCategory('All');
    setTransmission('All');
    setPriceRange('All');
    setFuelType('All');
    setSortBy('featured');
  };

  const activeFiltersCount = [brand, category, transmission, priceRange, fuelType].filter(f => f !== 'All').length;

  const handleBookCar = (car) => {
    const days = 2;
    const baseFare = car.pricePerDay * days;
    
    navigate('/booking-confirmation', {
      state: {
        car: car,
        bookingDetails: {
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString(),
          days: days,
          pickupLocation: car.location || car.city || 'Hub Location',
          dropoffLocation: car.location || car.city || 'Hub Location',
          totalPrice: baseFare
        }
      }
    });
  };

  const handleViewDetails = (carId) => {
    navigate(`/car/${carId}`);
  };

  return (
    <>
      <DashboardNavbar />
      <div 
        className="min-h-screen pt-20 transition-colors duration-300"
        style={{ backgroundColor: theme.bg }}
      >
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
                <Sparkles size={14} className="text-emerald-400 animate-pulse" /> Verified Indian Rental Fleet
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight" style={{ color: theme.text }}>
                Browse <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-500">Cars</span>
              </h1>
              <p className="text-sm md:text-base mt-2" style={{ color: theme.textSecondary }}>
                Choose from our verified fleet of <span className="font-bold text-emerald-400">{displayCars.length}</span> vehicles with transparent pricing and model-accurate photography.
              </p>
            </div>

            {/* Quick Sort Dropdown */}
            <div className="flex items-center gap-2 self-start md:self-auto bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800">
              <span className="text-xs font-semibold px-2 text-slate-400">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort cars by"
                className="bg-slate-900 border border-slate-700 text-slate-200 text-xs font-bold px-3 py-2 rounded-xl focus:ring-2 focus:ring-emerald-500/30 cursor-pointer outline-none"
              >
                <option value="featured">Featured First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="trust">Highest Trust Score</option>
              </select>
            </div>
          </div>

          {/* Category Quick Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
            {QUICK_CATEGORIES.map(cat => {
              const active = category.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 whitespace-nowrap border ${
                    active
                      ? 'bg-gradient-to-r from-emerald-400 to-green-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20 scale-105'
                      : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Search & Filter Bar */}
          <div className="mb-8">
            <div 
              className="flex flex-col md:flex-row gap-3 p-3 rounded-2xl shadow-lg border backdrop-blur-md"
              style={{
                backgroundColor: theme.cardBg,
                borderColor: theme.border
              }}
            >
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search 
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" 
                />
                <input
                  type="text"
                  placeholder="Search by brand (Toyota, Tata, Porsche...), model, or city..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-emerald-500/30 transition-colors text-sm font-medium outline-none"
                  style={{
                    backgroundColor: theme.inputBg,
                    color: theme.text
                  }}
                />
                {search && (
                  <button 
                    onClick={() => setSearch('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Filter Toggle Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-slate-950 font-bold text-sm rounded-xl hover:from-emerald-400 hover:to-green-500 transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 relative"
              >
                <SlidersHorizontal size={18} />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="bg-slate-950 text-emerald-400 text-xs font-black rounded-full px-1.5 py-0.5 ml-1 border border-emerald-400/40">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {activeFiltersCount > 0 && (
                <button
                  onClick={handleClearAll}
                  className="px-4 py-3 border border-rose-500/40 text-rose-400 hover:bg-rose-500/10 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <RotateCcw size={14} />
                  Reset
                </button>
              )}
            </div>

            {/* Expandable Advanced Filters Drawer */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-6 rounded-2xl shadow-xl border mt-4 overflow-hidden"
                  style={{
                    backgroundColor: theme.cardBg,
                    borderColor: theme.border
                  }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Brand Filter */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-400">
                        Brand
                      </label>
                      <select
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-emerald-500/20 cursor-pointer text-xs font-medium"
                        style={{
                          backgroundColor: theme.inputBg,
                          borderColor: theme.border,
                          color: theme.text
                        }}
                      >
                        {brands.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>

                    {/* Transmission Filter */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-400">
                        Transmission
                      </label>
                      <select
                        value={transmission}
                        onChange={(e) => setTransmission(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-emerald-500/20 cursor-pointer text-xs font-medium capitalize"
                        style={{
                          backgroundColor: theme.inputBg,
                          borderColor: theme.border,
                          color: theme.text
                        }}
                      >
                        {transmissions.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>

                    {/* Fuel Type Filter */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-400">
                        Fuel Type
                      </label>
                      <select
                        value={fuelType}
                        onChange={(e) => setFuelType(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-emerald-500/20 cursor-pointer text-xs font-medium capitalize"
                        style={{
                          backgroundColor: theme.inputBg,
                          borderColor: theme.border,
                          color: theme.text
                        }}
                      >
                        {fuelTypes.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>

                    {/* Price Range Filter */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-400">
                        Budget Per Day
                      </label>
                      <select
                        value={priceRange}
                        onChange={(e) => setPriceRange(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-emerald-500/20 cursor-pointer text-xs font-medium"
                        style={{
                          backgroundColor: theme.inputBg,
                          borderColor: theme.border,
                          color: theme.text
                        }}
                      >
                        {priceRanges.map(pr => <option key={pr.value} value={pr.value}>{pr.label}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-slate-800">
                    <button
                      onClick={handleClearAll}
                      className="px-5 py-2 text-xs font-bold text-slate-400 hover:text-slate-200 transition"
                    >
                      Clear Filters
                    </button>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="px-6 py-2 bg-emerald-500 text-slate-950 text-xs font-bold rounded-xl hover:bg-emerald-400 transition"
                    >
                      Done
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Active Filter Tags */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-4">
                <span className="text-xs text-slate-400 font-semibold mr-1">Active:</span>
                {brand !== 'All' && (
                  <FilterTag label={`Brand: ${brand}`} onRemove={() => setBrand('All')} />
                )}
                {category !== 'All' && (
                  <FilterTag label={`Category: ${category}`} onRemove={() => setCategory('All')} />
                )}
                {transmission !== 'All' && (
                  <FilterTag label={`Transmission: ${transmission}`} onRemove={() => setTransmission('All')} />
                )}
                {fuelType !== 'All' && (
                  <FilterTag label={`Fuel: ${fuelType}`} onRemove={() => setFuelType('All')} />
                )}
                {priceRange !== 'All' && (
                  <FilterTag 
                    label={`Price: ${priceRanges.find(pr => pr.value === priceRange)?.label}`} 
                    onRemove={() => setPriceRange('All')} 
                  />
                )}
              </div>
            )}
          </div>

          {/* Cars Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="w-12 h-12 text-emerald-400 animate-spin mb-4" />
              <p className="text-sm text-slate-400 font-medium">Loading fleet catalog...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-slate-800 p-8">
              <AlertCircle size={40} className="mx-auto text-rose-400 mb-3" />
              <p className="text-lg font-bold mb-4 text-rose-400">{error}</p>
              <button
                onClick={loadCars}
                className="px-6 py-2.5 bg-emerald-500 text-slate-950 font-bold text-sm rounded-xl hover:bg-emerald-400 transition"
              >
                Retry
              </button>
            </div>
          ) : displayCars.length === 0 ? (
            <div className="text-center py-24 bg-slate-900/40 rounded-3xl border border-slate-800 p-8">
              <CarIcon size={48} className="mx-auto text-slate-500 mb-4 opacity-60" />
              <h3 className="text-xl font-bold mb-2" style={{ color: theme.text }}>
                No vehicles match your criteria
              </h3>
              <p className="text-sm mb-6" style={{ color: theme.textSecondary }}>
                Try clearing filters or search by a different brand or model.
              </p>
              <button
                onClick={handleClearAll}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-400 to-green-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 hover:from-emerald-300 hover:to-green-400 transition"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
              {displayCars.map((car, index) => (
                <CarCard
                  key={car._id || index}
                  car={car}
                  index={index}
                  theme={theme}
                  onBook={() => handleBookCar(car)}
                  onDetails={() => handleViewDetails(car._id)}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
};

// Filter Tag Component
const FilterTag = ({ label, onRemove }) => (
  <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-semibold">
    <span>{label}</span>
    <button
      onClick={onRemove}
      className="hover:bg-emerald-500/20 rounded-full p-0.5 transition"
    >
      <X size={12} />
    </button>
  </div>
);

const CarCard = ({ car, index, theme, onBook, onDetails }) => {
  // Resolve image through multi-tier accurate resolver
  const imageSrc = getCarImageUrl(car);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.4), duration: 0.35 }}
      className="group h-full flex flex-col"
      whileHover={{ y: -6 }}
    >
      <div 
        className="relative h-full rounded-2xl flex flex-col justify-between p-5 border transition-all duration-300 hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/10 overflow-hidden"
        style={{
          backgroundColor: theme.cardBg,
          borderColor: theme.cardBorder
        }}
      >
        {/* Neon Accent Corner Brackets on Hover */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-tl-2xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-br-2xl pointer-events-none" />

        <div>
          {/* Image Showcase Stage */}
          <div className="relative w-full h-48 rounded-xl bg-gradient-to-b from-slate-800/40 via-slate-900/30 to-slate-950/70 border border-slate-800/80 p-3 flex items-center justify-center overflow-hidden mb-4 group-hover:border-emerald-500/30 transition-all">
            {/* Ambient Radial Hover Glow */}
            <div className="absolute inset-0 bg-radial from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {/* Category Badge */}
            <div className="absolute top-3 left-3 z-20">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-950/85 border border-slate-700/80 text-emerald-400 backdrop-blur-md shadow-sm">
                {car.category || 'Standard'}
              </span>
            </div>

            {/* Trust or Availability Badge */}
            <div className="absolute top-3 right-3 z-20">
              {car.available ? (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 backdrop-blur-md flex items-center gap-1 shadow-sm">
                  <ShieldCheck size={12} className="text-emerald-400" />
                  {car.trustScore ? `${car.trustScore}% Trust` : 'Verified'}
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/15 border border-rose-500/30 text-rose-400 backdrop-blur-md flex items-center gap-1">
                  <AlertCircle size={12} /> Booked
                </span>
              )}
            </div>

            {/* Model-Accurate Vehicle Image */}
            <motion.img
              src={imageSrc}
              alt={car.name || `${car.brand} ${car.model}`}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = heroCarImg;
              }}
              className="w-full h-full object-contain filter drop-shadow-[0_10px_16px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:scale-105 relative z-10"
            />
          </div>

          {/* Vehicle Identity */}
          <div className="space-y-1.5 mb-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-400">
                {car.brand}
              </span>
              {car.city && (
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <MapPin size={11} className="text-emerald-400/80" /> {car.city}
                </span>
              )}
            </div>

            <h3 className="font-extrabold text-lg text-slate-100 group-hover:text-emerald-300 transition-colors line-clamp-1">
              {car.name || `${car.brand} ${car.model}`}
            </h3>

            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
              {car.description || `Experience superior driving dynamics and verified safety with this ${car.brand} ${car.model}.`}
            </p>
          </div>

          {/* Specs Feature Strip */}
          <div className="grid grid-cols-3 gap-2 py-2.5 mb-3 border-y border-slate-800/80">
            <div className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-slate-800/40 text-[11px] text-slate-300 font-medium">
              <Users size={13} className="text-emerald-400" />
              <span>{car.seats || 5} Seats</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-slate-800/40 text-[11px] text-slate-300 font-medium capitalize">
              <Fuel size={13} className="text-emerald-400" />
              <span className="truncate">{car.fuelType || 'Petrol'}</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-slate-800/40 text-[11px] text-slate-300 font-medium capitalize">
              <Gauge size={13} className="text-emerald-400" />
              <span className="truncate">{car.transmission || 'Manual'}</span>
            </div>
          </div>
        </div>

        {/* Pricing & Call-to-Action */}
        <div className="flex items-center justify-between pt-2 mt-2 gap-2 border-t border-slate-800/40">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Daily Rate</span>
            <div className="flex items-baseline gap-0.5">
              <span className="text-xl font-black text-emerald-400">
                ₹{car.pricePerDay?.toLocaleString() || 0}
              </span>
              <span className="text-xs text-slate-400 font-normal">/day</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onDetails}
              className="px-3 py-2 text-xs font-bold text-slate-300 hover:text-white border border-slate-700 hover:border-emerald-500/60 rounded-xl transition-all duration-200 bg-slate-800/60 hover:bg-slate-800"
            >
              Details
            </button>

            <button
              onClick={car.available ? onBook : null}
              disabled={!car.available}
              className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all duration-200 shadow-md ${
                car.available
                  ? 'bg-gradient-to-r from-emerald-400 to-green-500 text-slate-950 hover:from-emerald-300 hover:to-green-400 shadow-emerald-500/20 hover:shadow-emerald-500/40'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              }`}
            >
              {car.available ? 'Rent Now' : 'Booked'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BrowseCars;