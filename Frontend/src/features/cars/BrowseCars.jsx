import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/hooks/useTheme';
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
  RotateCcw,
  ChevronDown,
  ArrowRight
} from 'lucide-react';
import { carService } from '@/features/cars/carService';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import { getCarImageUrl, heroCarImg } from '@/features/cars/carImageMap';

const QUICK_CATEGORIES = ['All', 'Luxury', 'SUV', 'Sedan', 'Sports', 'Electric', 'Hatchback'];

const BrowseCars = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  
  const [displayCars, setDisplayCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [limit, setLimit] = useState(60);
  const [totalCount, setTotalCount] = useState(0);

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
    setLimit(60);
    const debounceTimer = setTimeout(() => {
      loadCars(60, false);
    }, 200);
    return () => clearTimeout(debounceTimer);
  }, [search, brand, category, transmission, fuelType, priceRange, sortBy]);

  const loadCars = async (targetLimit = limit, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const params = { limit: targetLimit };
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
        setTotalCount(response.total ?? response.data.length);
      } else {
        setError('Failed to load cars');
      }
    } catch (err) {
      console.error('Error loading cars:', err);
      setError('Failed to load cars. Please check if backend is running.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    const nextLimit = limit + 60;
    setLimit(nextLimit);
    loadCars(nextLimit, true);
  };

  const handleClearAll = () => {
    setSearch('');
    setBrand('All');
    setCategory('All');
    setTransmission('All');
    setPriceRange('All');
    setFuelType('All');
    setSortBy('featured');
    setLimit(60);
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

  const [groupByModel, setGroupByModel] = useState(true);

  // Group cars by model so variants of the same model share a single card with variant selectors
  const carGroups = useMemo(() => {
    if (!groupByModel) {
      return displayCars.map((c, i) => ({
        key: c._id || `car-${i}`,
        brand: c.brand,
        model: c.model,
        variants: [c],
        defaultVariant: c
      }));
    }

    const map = new Map();
    for (const car of displayCars) {
      const brandKey = (car.brand || '').trim().toLowerCase();
      const modelKey = (car.model || '').trim().toLowerCase();
      const groupKey = `${brandKey}___${modelKey}`;

      if (!map.has(groupKey)) {
        map.set(groupKey, {
          key: groupKey,
          brand: car.brand,
          model: car.model,
          variants: []
        });
      }
      map.get(groupKey).variants.push(car);
    }

    return Array.from(map.values()).map(group => {
      const sorted = [...group.variants].sort((a, b) => (a.pricePerDay || 0) - (b.pricePerDay || 0));
      return {
        ...group,
        defaultVariant: sorted.find(v => v.available) || sorted[0]
      };
    });
  }, [displayCars, groupByModel]);

  return (
    <>
      <DashboardNavbar />
      <div className="min-h-screen bg-bg transition-colors duration-300">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-soft border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-3">
                <Sparkles size={14} className="text-primary animate-pulse" /> Verified Indian Rental Fleet
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-text font-display">
                Browse <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-hover to-accent">Fleet</span>
              </h1>
              <p className="text-xs sm:text-sm text-text-muted mt-2">
                Choose from our verified fleet of <span className="font-bold text-primary font-mono">{carGroups.length}</span> {groupByModel ? 'distinct models' : 'vehicles'} (<span className="font-semibold text-text">{totalCount || displayCars.length}</span> trims available) with model-accurate photography.
              </p>
            </div>

            {/* Quick Sort & View Mode Controls */}
            <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
              {/* Grouping Toggle */}
              <div className="flex items-center gap-1 bg-surface p-1 rounded-2xl border border-border shadow-xs text-xs">
                <button
                  type="button"
                  onClick={() => setGroupByModel(true)}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                    groupByModel
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-text-muted hover:text-text'
                  }`}
                >
                  By Model
                </button>
                <button
                  type="button"
                  onClick={() => setGroupByModel(false)}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                    !groupByModel
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-text-muted hover:text-text'
                  }`}
                >
                  All Trims
                </button>
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2 bg-surface p-1.5 rounded-2xl border border-border shadow-xs">
                <span className="text-xs font-semibold px-2 text-text-muted">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  aria-label="Sort cars by"
                  className="bg-surface-sunken border border-border text-text text-xs font-semibold px-3 py-1.5 rounded-xl focus:ring-2 focus:ring-primary/20 cursor-pointer outline-none"
                >
                  <option value="featured">Featured First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                  <option value="trust">Highest Trust Score</option>
                </select>
              </div>
            </div>
          </div>

          {/* Category & Transmission Mode Quick Pills */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 mb-6 overflow-x-auto">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
              {QUICK_CATEGORIES.map(cat => {
                const active = category.toLowerCase() === cat.toLowerCase();
                return (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap border ${
                      active
                        ? 'bg-primary text-white border-primary shadow-sm shadow-primary/25 scale-[1.02]'
                        : 'bg-surface text-text-muted border-border hover:border-primary/30 hover:text-text'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Quick Transmission Mode Toggle */}
            <div className="flex items-center gap-1.5 self-start sm:self-auto bg-surface p-1 rounded-xl border border-border text-xs font-semibold shadow-xs">
              <span className="text-[10px] text-text-subtle uppercase tracking-wider px-2">Mode:</span>
              {['All', 'Automatic', 'Manual'].map(t => {
                const active = transmission.toLowerCase() === t.toLowerCase();
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTransmission(t)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      active
                        ? 'bg-primary text-white shadow-xs'
                        : 'text-text-muted hover:text-text'
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row gap-3 p-3 rounded-2xl shadow-sm border border-border bg-surface">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search 
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-subtle" 
                />
                <input
                  type="text"
                  placeholder="Search by brand (Toyota, Tata, Hyundai...), model, or city..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-surface-sunken border border-border/80 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors text-xs font-medium outline-none text-text placeholder-text-subtle"
                />
                {search && (
                  <button 
                    onClick={() => setSearch('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-subtle hover:text-text"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Filter Toggle Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white font-semibold text-xs rounded-xl transition-all shadow-sm shadow-primary/20 flex items-center justify-center gap-2"
              >
                <SlidersHorizontal size={14} />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="bg-white text-primary text-[10px] font-black rounded-full px-1.5 py-0.2">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {activeFiltersCount > 0 && (
                <button
                  onClick={handleClearAll}
                  className="px-4 py-2.5 border border-danger/30 text-danger hover:bg-danger-soft text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <RotateCcw size={12} />
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
                  className="p-5 rounded-2xl shadow-md border border-border bg-surface mt-3 overflow-hidden"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Brand Filter */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-text-subtle">
                        Brand
                      </label>
                      <select
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-border bg-surface-sunken text-text focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer text-xs font-medium outline-none"
                      >
                        {brands.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>

                    {/* Transmission Filter */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-text-subtle">
                        Transmission
                      </label>
                      <select
                        value={transmission}
                        onChange={(e) => setTransmission(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-border bg-surface-sunken text-text focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer text-xs font-medium capitalize outline-none"
                      >
                        {transmissions.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>

                    {/* Fuel Type Filter */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-text-subtle">
                        Fuel Type
                      </label>
                      <select
                        value={fuelType}
                        onChange={(e) => setFuelType(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-border bg-surface-sunken text-text focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer text-xs font-medium capitalize outline-none"
                      >
                        {fuelTypes.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>

                    {/* Price Range Filter */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-text-subtle">
                        Price Range
                      </label>
                      <select
                        value={priceRange}
                        onChange={(e) => setPriceRange(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-border bg-surface-sunken text-text focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer text-xs font-medium outline-none"
                      >
                        {priceRanges.map(pr => <option key={pr.value} value={pr.value}>{pr.label}</option>)}
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Cars List / Loading / Empty States */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-96 rounded-2xl bg-surface border border-border p-5 flex flex-col justify-between animate-pulse">
                  <div className="h-44 bg-surface-sunken rounded-xl" />
                  <div className="space-y-2 mt-4">
                    <div className="h-4 bg-surface-sunken rounded w-3/4" />
                    <div className="h-3 bg-surface-sunken rounded w-1/2" />
                  </div>
                  <div className="h-10 bg-surface-sunken rounded-xl mt-4" />
                </div>
              ))}
            </div>
          ) : carGroups.length === 0 ? (
            <div className="py-20 text-center bg-surface border border-border rounded-3xl p-8 max-w-xl mx-auto shadow-sm">
              <CarIcon className="w-12 h-12 mx-auto text-text-subtle mb-3" />
              <h3 className="text-base font-bold text-text font-display">No matching vehicles found</h3>
              <p className="text-xs text-text-muted mt-1 max-w-md mx-auto">
                Try widening your price range, clearing brand/category filters, or searching for other Indian hub locations.
              </p>
              <button
                onClick={handleClearAll}
                className="mt-5 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white font-semibold text-xs rounded-xl shadow-sm transition"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
                {carGroups.map((group, index) => (
                  <CarCard
                    key={group.key || index}
                    group={group}
                    index={index}
                    onBook={(car) => handleBookCar(car)}
                    onDetails={(carId) => handleViewDetails(carId)}
                  />
                ))}
              </div>

              {/* Load More Vehicles Button */}
              {displayCars.length < totalCount && (
                <div className="flex flex-col items-center justify-center pt-4 pb-16">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="px-8 py-3 bg-surface hover:bg-surface-sunken border border-border hover:border-primary text-text font-bold text-xs rounded-xl shadow-sm transition-all duration-200 flex items-center gap-3 disabled:opacity-50"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="w-4 h-4 text-primary animate-spin" />
                        <span>Loading more vehicles...</span>
                      </>
                    ) : (
                      <>
                        <span>Load More Vehicles</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-soft text-primary font-semibold">
                          Showing {displayCars.length} of {totalCount}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </>
  );
};

const CarCard = ({ group, index, onBook, onDetails }) => {
  const variants = group.variants || [group.defaultVariant];
  const [selectedVariantId, setSelectedVariantId] = useState(group.defaultVariant?._id || variants[0]?._id);

  // Active selected car
  const activeCar = variants.find(v => v._id === selectedVariantId) || variants[0] || group.defaultVariant;
  const imageSrc = getCarImageUrl(activeCar);

  // Calculate price range if multiple variants exist
  const prices = variants.map(v => v.pricePerDay || 0).filter(p => p > 0);
  const minPrice = prices.length ? Math.min(...prices) : (activeCar.pricePerDay || 0);
  const maxPrice = prices.length ? Math.max(...prices) : (activeCar.pricePerDay || 0);
  const hasPriceRange = minPrice !== maxPrice;

  // Available transmissions across all variants in this model group
  const allTransmissions = Array.from(new Set([
    ...variants.map(v => v.transmission?.toLowerCase()).filter(Boolean),
    ...(activeCar.availableTransmissions || []).map(t => t.toLowerCase())
  ]));

  const alternativeTransmissions = allTransmissions.filter(
    t => t !== activeCar.transmission?.toLowerCase()
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.25), duration: 0.3 }}
      className="group h-full flex flex-col"
      whileHover={{ y: -5 }}
    >
      <div className="relative h-full rounded-2xl flex flex-col justify-between p-5 bg-surface border border-border hover:border-primary/40 shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden">
        
        <div>
          {/* Image Showcase Stage with fixed 16:10 aspect ratio and sunken backdrop */}
          <div className="relative aspect-[16/10] w-full rounded-xl bg-surface-sunken/60 border border-border/50 p-3 flex items-center justify-center overflow-hidden mb-3.5">
            {/* Category Badge */}
            <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-surface/90 border border-border text-text-muted backdrop-blur-xs shadow-xs">
                {activeCar.category || 'Standard'}
              </span>

              {variants.length > 1 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent-soft text-accent border border-accent/20 backdrop-blur-xs shadow-xs">
                  {variants.length} Trims
                </span>
              )}
            </div>

            {/* Trust or Availability Badge */}
            <div className="absolute top-2.5 right-2.5 z-20">
              {activeCar.available ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-primary-soft text-primary border border-primary/20 backdrop-blur-xs flex items-center gap-1 shadow-xs">
                  <ShieldCheck size={12} className="text-primary" />
                  {activeCar.trustScore ? `${activeCar.trustScore}% Trust` : 'Verified'}
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-danger-soft text-danger border border-danger/20 backdrop-blur-xs flex items-center gap-1">
                  <AlertCircle size={12} /> Booked
                </span>
              )}
            </div>

            {/* Model-Accurate Vehicle Image */}
            <motion.img
              key={activeCar._id}
              src={imageSrc}
              alt={activeCar.name || `${activeCar.brand} ${activeCar.model}`}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = heroCarImg;
              }}
              className="max-h-full max-w-full object-contain filter drop-shadow-sm transition-transform duration-300 group-hover:scale-105 relative z-10"
            />
          </div>

          {/* Vehicle Identity */}
          <div className="space-y-1 mb-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-accent font-mono">
                {activeCar.brand}
              </span>
              {activeCar.city && (
                <span className="text-[11px] text-text-subtle flex items-center gap-1">
                  <MapPin size={11} className="text-primary" /> {activeCar.city}
                </span>
              )}
            </div>

            <h3 className="font-bold text-base text-text font-display group-hover:text-primary transition-colors line-clamp-1">
              {activeCar.brand} {activeCar.model}
              {activeCar.variant && activeCar.variant !== 'Base' ? (
                <span className="text-xs font-semibold text-text-muted ml-1.5 font-sans">
                  · {activeCar.variant}
                </span>
              ) : null}
            </h3>

            <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
              {activeCar.description || `Experience superior driving dynamics and verified safety with this ${activeCar.brand} ${activeCar.model}.`}
            </p>
          </div>

          {/* Multi-Variant Selection Chips (When model has multiple trims/transmissions) */}
          {variants.length > 1 && (
            <div className="mb-3">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-text-subtle block mb-1.5">
                Select Trim / Transmission:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {variants.map(v => {
                  const isSelected = v._id === activeCar._id;
                  const transTag = v.transmission?.toLowerCase() === 'automatic' ? 'AT' : 'MT';
                  const fuelTag = v.fuelType ? v.fuelType.toUpperCase() : '';
                  const trimLabel = v.variant && v.variant !== 'Base' ? v.variant : `${transTag} ${fuelTag}`;

                  return (
                    <button
                      key={v._id}
                      type="button"
                      onClick={() => setSelectedVariantId(v._id)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border ${
                        isSelected
                          ? 'bg-primary text-white border-primary shadow-xs scale-102'
                          : 'bg-surface-sunken text-text-muted border-border hover:border-primary/30 hover:text-text'
                      }`}
                    >
                      {trimLabel} · ₹{v.pricePerDay}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Specs Feature Strip */}
          <div className="grid grid-cols-3 gap-2 py-2 mb-2.5 border-y border-border">
            <div className="flex items-center justify-center gap-1.5 py-1 rounded-lg bg-surface-sunken text-[11px] text-text-muted font-medium">
              <Users size={12} className="text-primary" />
              <span>{activeCar.seats || 5} Seats</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 py-1 rounded-lg bg-surface-sunken text-[11px] text-text-muted font-medium capitalize">
              <Fuel size={12} className="text-primary" />
              <span className="truncate">{activeCar.fuelType || 'Petrol'}</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 py-1 rounded-lg bg-surface-sunken text-[11px] text-text-muted font-medium capitalize">
              <Gauge size={12} className="text-primary" />
              <span className="truncate">{activeCar.transmission || 'Manual'}</span>
            </div>
          </div>

          {/* Sibling Variant Mode Indicator (e.g. Also available in Automatic / Diesel) */}
          {alternativeTransmissions.length > 0 && (
            <div className="mb-2 px-2.5 py-1 rounded-lg bg-accent-soft border border-accent/20 flex items-center justify-between text-[10px]">
              <span className="text-text-muted font-semibold">Also available in:</span>
              <span className="text-accent font-bold uppercase tracking-wider capitalize">
                {alternativeTransmissions.join(' • ')}
              </span>
            </div>
          )}
        </div>

        {/* Pricing & Call-to-Action */}
        <div className="flex items-center justify-between pt-3 mt-1 gap-2 border-t border-border">
          <div>
            <span className="text-[10px] text-text-subtle uppercase tracking-wider block font-semibold">
              {hasPriceRange ? 'Current Trim Rate' : 'Daily Rate'}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-primary font-mono tabular-nums">
                ₹{activeCar.pricePerDay?.toLocaleString('en-IN') || 0}
              </span>
              <span className="text-[10px] text-text-subtle font-normal">/day</span>
            </div>
            {hasPriceRange && (
              <span className="text-[9px] text-text-subtle block font-mono">
                Range: ₹{minPrice} – ₹{maxPrice}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onDetails(activeCar._id)}
              className="px-3 py-1.5 text-xs font-semibold text-text-muted hover:text-text border border-border hover:border-border-strong rounded-xl transition-all duration-200 bg-surface-raised"
            >
              Details
            </button>

            <button
              onClick={activeCar.available ? () => onBook(activeCar) : null}
              disabled={!activeCar.available}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 shadow-xs ${
                activeCar.available
                  ? 'bg-primary hover:bg-primary-hover text-white shadow-primary/20'
                  : 'bg-surface-sunken text-text-subtle border border-border cursor-not-allowed'
              }`}
            >
              {activeCar.available ? 'Rent Now' : 'Booked'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BrowseCars;