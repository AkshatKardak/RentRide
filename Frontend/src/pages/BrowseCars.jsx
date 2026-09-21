import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Search, Loader2, Users, Fuel, Gauge, AlertCircle, SlidersHorizontal, X } from 'lucide-react';
import { carService } from '../services/carService';
import DashboardNavbar from '../components/layout/DashboardNavbar';

// Safe fallback image
import heroCarImg from '../assets/herocar.png';

const BrowseCars = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  
  const [allCars, setAllCars] = useState([]);
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
  
  const [showFilters, setShowFilters] = useState(false);

  // Dynamic filter options
  const [brands, setBrands] = useState(['All']);
  const [categories, setCategories] = useState(['All']);
  const [transmissions, setTransmissions] = useState(['All']);
  const [fuelTypes, setFuelTypes] = useState(['All']);

  const theme = {
    bg: isDarkMode ? '#0f172a' : '#f8f9fa',
    cardBg: isDarkMode ? '#1e293b' : '#ffffff',
    text: isDarkMode ? '#f1f5f9' : '#1F2937',
    textSecondary: isDarkMode ? '#cbd5e1' : '#6B7280',
    border: isDarkMode ? '#334155' : '#e5e7eb',
    inputBg: isDarkMode ? '#0f172a' : '#f8f9fa',
  };

  const priceRanges = [
    { label: 'All', value: 'All' },
    { label: 'Under ₹1000', value: '0-1000' },
    { label: '₹1000 - ₹3000', value: '1000-3000' },
    { label: '₹3000 - ₹5000', value: '3000-5000' },
    { label: '₹5000 - ₹10000', value: '5000-10000' },
    { label: 'Above ₹10000', value: '10000-999999' }
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
    }, 250);
    return () => clearTimeout(debounceTimer);
  }, [search, brand, category, transmission, fuelType, priceRange]);

  const loadCars = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (brand !== 'All') params.brand = brand;
      if (category !== 'All') params.category = category;
      if (transmission !== 'All') params.transmission = transmission;
      if (fuelType !== 'All') params.fuelType = fuelType;
      if (priceRange !== 'All') {
        const [min, max] = priceRange.split('-').map(Number);
        params.minPrice = min;
        params.maxPrice = max;
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

  const handleApplyFilters = (e) => {
    if (e) e.preventDefault();
    setDisplayCars(filteredCars);
    setShowFilters(false);
  };

  const handleClearAll = () => {
    setSearch('');
    setBrand('All');
    setCategory('All');
    setTransmission('All');
    setPriceRange('All');
    setFuelType('All');
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
          pickupLocation: car.address || car.city || 'Hub Location',
          dropoffLocation: car.address || car.city || 'Hub Location',
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
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-green-500 mb-2">
              Browse Cars
            </h1>
            <p className="text-lg" style={{ color: theme.textSecondary }}>
              Choose from our exclusive collection of {displayCars.length} vehicles
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="mb-8">
            <div 
              className="flex flex-col md:flex-row gap-4 p-4 rounded-2xl shadow-sm border"
              style={{
                backgroundColor: theme.cardBg,
                borderColor: theme.border
              }}
            >
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search 
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" 
                  style={{ color: theme.textSecondary, opacity: 0.5 }}
                />
                <input
                  type="text"
                  placeholder="Search by name, brand, or category..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-green-500/20 transition-colors"
                  style={{
                    backgroundColor: theme.inputBg,
                    color: theme.text
                  }}
                />
              </div>

              {/* Filter Toggle Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-6 py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-all shadow-lg hover:shadow-green-500/30 flex items-center gap-2 relative"
              >
                <SlidersHorizontal size={20} />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {activeFiltersCount > 0 && (
                <button
                  onClick={handleClearAll}
                  className="px-6 py-3 border-2 border-red-500 text-red-500 font-bold rounded-xl hover:bg-red-50 transition flex items-center gap-2"
                >
                  <X size={20} />
                  Clear All
                </button>
              )}
            </div>

            {/* Expandable Filters Panel */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-6 rounded-2xl shadow-sm border mt-4"
                style={{
                  backgroundColor: theme.cardBg,
                  borderColor: theme.border
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                  {/* Brand Filter */}
                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ color: theme.text }}>
                      Brand
                    </label>
                    <select
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-green-500/20 cursor-pointer transition-colors"
                      style={{
                        backgroundColor: theme.inputBg,
                        borderColor: theme.border,
                        color: theme.text
                      }}
                    >
                      {brands.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>

                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ color: theme.text }}>
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-green-500/20 cursor-pointer transition-colors"
                      style={{
                        backgroundColor: theme.inputBg,
                        borderColor: theme.border,
                        color: theme.text
                      }}
                    >
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  {/* Transmission Filter */}
                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ color: theme.text }}>
                      Transmission
                    </label>
                    <select
                      value={transmission}
                      onChange={(e) => setTransmission(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-green-500/20 cursor-pointer transition-colors"
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
                    <label className="block text-sm font-bold mb-2" style={{ color: theme.text }}>
                      Fuel Type
                    </label>
                    <select
                      value={fuelType}
                      onChange={(e) => setFuelType(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-green-500/20 cursor-pointer transition-colors"
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
                    <label className="block text-sm font-bold mb-2" style={{ color: theme.text }}>
                      Price Range
                    </label>
                    <select
                      value={priceRange}
                      onChange={(e) => setPriceRange(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-green-500/20 cursor-pointer transition-colors"
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

                <div className="flex gap-4 mt-6">
                  <button
                    onClick={handleApplyFilters}
                    className="flex-1 px-8 py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-all shadow-lg hover:shadow-green-500/30"
                  >
                    Apply Filters
                  </button>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="px-8 py-3 border font-bold rounded-xl hover:bg-opacity-50 transition"
                    style={{
                      backgroundColor: theme.cardBg,
                      borderColor: theme.border,
                      color: theme.text
                    }}
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            )}

            {/* Active Filters Tags */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
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

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-12 h-12 text-green-500 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-xl font-bold mb-4 text-red-500">{error}</p>
              <button
                onClick={loadCars}
                className="px-6 py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition"
              >
                Retry
              </button>
            </div>
          ) : displayCars.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl font-bold mb-2" style={{ color: theme.text }}>
                No cars found
              </p>
              <p className="mb-4" style={{ color: theme.textSecondary }}>
                Try adjusting your filters
              </p>
              <button
                onClick={handleClearAll}
                className="px-6 py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
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
  <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-500 rounded-full text-sm font-medium">
    <span>{label}</span>
    <button
      onClick={onRemove}
      className="hover:bg-green-500/20 rounded-full p-0.5 transition"
    >
      <X size={14} />
    </button>
  </div>
);

const CarCard = ({ car, index, theme, onBook, onDetails }) => {
  const imageSrc = car.primaryImage || car.images?.[0] || heroCarImg;
  const isVerifiedImage = car.imageMetadata?.verificationStatus === 'verified';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      className="group h-full"
      whileHover={{ y: -10 }}
    >
      <div 
        className="relative h-full border-2 rounded-xl flex flex-col gap-3 items-center justify-between py-10 px-6 backdrop-blur-sm group-hover:border-green-500 transition-all duration-500 shadow-xl group-hover:shadow-green-500/50 overflow-hidden"
        style={{
          backgroundColor: theme.cardBg,
          borderColor: theme.border
        }}
      >
        {!car.available && (
          <div className="absolute top-4 right-4 bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 z-20">
            <AlertCircle size={12} /> Booked
          </div>
        )}

        <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        <div className="relative w-full flex justify-center mb-4">
          <motion.img
            src={imageSrc}
            alt={car.name || `${car.brand} ${car.model}`}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = heroCarImg;
            }}
            className="w-64 h-40 object-contain relative z-10"
            whileHover={{ scale: 1.1, rotate: 2 }}
            transition={{ duration: 0.4 }}
          />
          <div className="absolute inset-0 bg-green-500 rounded-full blur-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-300 animate-pulse" />
        </div>

        {isVerifiedImage && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 -mt-2">
            Verified Model Photo
          </span>
        )}

        <div className="text-center space-y-2 w-full">
          <h3 className="font-bold text-xl text-green-500 transition-colors duration-300">
            {car.brand} {car.model}
          </h3>

          <p className="text-sm px-2 line-clamp-2" style={{ color: theme.textSecondary }}>
            {car.description || 'Experience premium comfort and performance.'}
          </p>

          <div className="flex justify-center gap-4 text-xs pt-2" style={{ color: theme.textSecondary }}>
            <span className="flex items-center gap-1"><Users size={12} /> {car.seats}</span>
            <span className="flex items-center gap-1"><Fuel size={12} /> {car.fuelType}</span>
            <span className="flex items-center gap-1"><Gauge size={12} /> {car.transmission}</span>
          </div>
        </div>

        <div 
          className="w-full h-1 rounded-full overflow-hidden my-2"
          style={{ backgroundColor: theme.inputBg }}
        >
          <motion.div
            className="h-full bg-green-500"
            initial={{ width: 0 }}
            whileInView={{ width: '80%' }}
            transition={{ duration: 1, delay: 0.2 }}
          />
        </div>

        <div className="flex justify-between items-center gap-4 pt-2 w-full mt-auto">
          <p className="font-bold text-green-500 text-lg transition-colors">
            ₹{car.pricePerDay?.toLocaleString() || 0}/day
          </p>

          <div className="flex gap-2">
            <button
              onClick={onDetails}
              className="px-3 py-2 text-sm border border-green-500 text-green-500 rounded-lg font-bold hover:bg-green-500 hover:text-white transition-all duration-300"
            >
              Details
            </button>

            <button
              onClick={car.available ? onBook : null}
              disabled={!car.available}
              className={`px-4 py-2 rounded-lg font-bold shadow-lg transition-all duration-300 text-sm ${
                car.available
                  ? 'bg-green-500 hover:bg-green-600 text-white hover:shadow-green-500/50'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
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