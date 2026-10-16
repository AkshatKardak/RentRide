import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  Sparkles, 
  Tag, 
  Gift, 
  Wallet, 
  Award, 
  Share2, 
  Copy, 
  Check, 
  Clock, 
  ArrowRight, 
  Percent, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  SlidersHorizontal, 
  CheckCircle2, 
  Car as CarIcon, 
  Zap, 
  TrendingUp, 
  Flame,
  Send,
  Mail,
  MessageSquare
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { promotionService } from '@/features/offers/promotionService';
import DashboardNavbar from '@/components/layout/DashboardNavbar';

const TABS = [
  { id: 'for_you', label: 'For You', icon: Sparkles },
  { id: 'all_offers', label: 'All Offers', icon: Tag },
  { id: 'refer_earn', label: 'Refer & Earn', icon: Share2 },
  { id: 'wallet', label: 'Wallet & Credits', icon: Wallet },
  { id: 'rewards_tiers', label: 'Rewards Tiers', icon: Award }
];

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'weekend', label: 'Weekend Getaways' },
  { id: 'long_rental', label: 'Long Rentals (7+ Days)' },
  { id: 'first_ride', label: 'First Ride' },
  { id: 'luxury', label: 'Luxury Fleet' },
  { id: 'festive', label: 'Festive / Seasonal' }
];

export default function OffersCode() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { user } = useAuth();

  const codeParam = searchParams.get('code');
  const initialTab = searchParams.get('tab') || (codeParam ? 'all_offers' : 'for_you');

  const [activeTab, setActiveTab] = useState(initialTab);
  const [promotions, setPromotions] = useState([]);
  const [eligiblePromotions, setEligiblePromotions] = useState([]);
  const [bestOffer, setBestOffer] = useState(null);
  const [wallet, setWallet] = useState({ balance: 500, autoApply: true, ledger: [] });
  const [referral, setReferral] = useState({ code: '', shareUrl: '', totalReferred: 0, rewardsEarned: 0, funnel: { invited: 3, signedUp: 1, firstRideCompleted: 0 } });
  const [loyalty, setLoyalty] = useState({ tier: 'bronze', totalBookings: 1, totalSpent: 4200, targetBookings: 3, targetSpend: 10000 });
  const [loading, setLoading] = useState(true);

  // Offers Catalog Filters
  const [searchQuery, setSearchQuery] = useState(codeParam || '');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('savings');
  const [expandedOfferId, setExpandedOfferId] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);

  // Active applied promo from local storage
  const [appliedPromo, setAppliedPromo] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('rentride_active_promo')) || null;
    } catch {
      return null;
    }
  });

  // Countdown timers for flash deals
  const [timeLeft, setTimeLeft] = useState({ hours: 6, minutes: 42, seconds: 19 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 8, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch initial data
  useEffect(() => {
    loadHubData();
  }, []);

  const loadHubData = async () => {
    try {
      setLoading(true);

      const [promosRes, eligibleRes, walletRes, refRes, loyaltyRes] = await Promise.allSettled([
        promotionService.getAllPromotions(),
        promotionService.getEligiblePromotions({ bookingAmount: 4500, rentalDays: 2 }),
        promotionService.getUserWallet(),
        promotionService.getUserReferral(),
        promotionService.getUserLoyalty()
      ]);

      if (promosRes.status === 'fulfilled' && promosRes.value.success) {
        setPromotions(promosRes.value.data);
      }
      if (eligibleRes.status === 'fulfilled' && eligibleRes.value.success) {
        setEligiblePromotions(eligibleRes.value.data);
        setBestOffer(eligibleRes.value.bestOffer);
      }
      if (walletRes.status === 'fulfilled' && walletRes.value.success) {
        setWallet(walletRes.value.data);
      }
      if (refRes.status === 'fulfilled' && refRes.value.success) {
        setReferral(refRes.value.data);
      }
      if (loyaltyRes.status === 'fulfilled' && loyaltyRes.value.success) {
        setLoyalty(loyaltyRes.value.data);
      }
    } catch (err) {
      console.error('Error loading rewards hub:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon "${code}" copied to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleApplyPromo = (promo) => {
    const promoData = {
      code: promo.code,
      name: promo.name || promo.code,
      type: promo.type,
      value: promo.value,
      maxDiscount: promo.maxDiscount,
      minBookingAmount: promo.minBookingAmount,
      description: promo.description
    };

    localStorage.setItem('rentride_active_promo', JSON.stringify(promoData));
    localStorage.setItem('appliedPromoCode', JSON.stringify(promoData));
    setAppliedPromo(promoData);

    toast.success(`Promo code "${promo.code}" applied! Redirecting to fleet...`);
    setTimeout(() => {
      navigate('/browsecars');
    }, 1200);
  };

  const handleRemoveAppliedPromo = () => {
    localStorage.removeItem('rentride_active_promo');
    localStorage.removeItem('appliedPromoCode');
    setAppliedPromo(null);
    toast.success('Applied promo code removed');
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams(prev => {
      const p = new URLSearchParams(prev);
      p.set('tab', tabId);
      return p;
    });
  };

  // Filtered & Sorted Promotions for All Offers tab
  const filteredPromotions = useMemo(() => {
    return promotions
      .filter(p => {
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchCode = p.code?.toLowerCase().includes(q);
          const matchName = p.name?.toLowerCase().includes(q);
          const matchDesc = p.description?.toLowerCase().includes(q);
          if (!matchCode && !matchName && !matchDesc) return false;
        }

        // Category filter
        if (selectedCategory !== 'all') {
          if (p.category !== selectedCategory) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'savings') {
          const valA = a.type === 'fixed' ? a.value : (a.value * 50);
          const valB = b.type === 'fixed' ? b.value : (b.value * 50);
          return valB - valA;
        }
        if (sortBy === 'min_booking') {
          return (a.minBookingAmount || 0) - (b.minBookingAmount || 0);
        }
        if (sortBy === 'expiring') {
          return new Date(a.validTo) - new Date(b.validTo);
        }
        return 0;
      });
  }, [promotions, searchQuery, selectedCategory, sortBy]);

  // Recommended offer for "For You" hero
  const featuredOffer = bestOffer || promotions[0] || {
    code: 'RENTRIDE20',
    name: 'Executive Weekend Escape',
    description: 'Get flat 20% discount up to ₹2,500 on all premium sedans & SUVs across Indian hubs.',
    value: 20,
    type: 'percentage',
    minBookingAmount: 2000,
    maxDiscount: 2500,
    validTo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  };

  return (
    <>
      <DashboardNavbar />
      <div className="min-h-screen bg-bg transition-colors duration-300">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-soft border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-3">
                <Gift size={14} className="text-primary animate-pulse" /> Savings & Rewards Hub
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-text font-display">
                Exclusive <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-hover to-accent">Savings</span> & Loyalty
              </h1>
              <p className="text-xs sm:text-sm text-text-muted mt-2 max-w-2xl">
                Unlock automated tier discounts, earn wallet credits on referrals, and apply guaranteed verified promo vouchers on every rental.
              </p>
            </div>

            {/* Quick Wallet Glance */}
            <div className="bg-surface p-3 sm:p-4 rounded-2xl border border-border shadow-xs flex items-center gap-4 self-start md:self-auto">
              <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center font-bold">
                <Wallet size={20} />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-text-subtle tracking-wider block font-mono">
                  Available Credits
                </span>
                <span className="text-xl font-black text-text font-mono tabular-nums">
                  ₹{wallet.balance?.toLocaleString('en-IN') || 0}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleTabChange('wallet')}
                className="ml-2 px-3 py-1.5 bg-surface-sunken hover:bg-surface-raised border border-border text-text font-semibold text-xs rounded-xl transition"
              >
                View Ledger
              </button>
            </div>
          </div>

          {/* Active Applied Promo Sticky Pill (if any) */}
          <AnimatePresence>
            {appliedPromo && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-3 rounded-2xl bg-primary-soft border border-primary/30 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={18} className="text-primary shrink-0" />
                  <p className="text-xs text-text font-medium">
                    Active Code Applied for Next Trip: <span className="font-bold text-primary font-mono">{appliedPromo.code}</span>
                    {appliedPromo.maxDiscount ? ` (Up to ₹${appliedPromo.maxDiscount.toLocaleString('en-IN')} off)` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate('/browsecars')}
                    className="px-3 py-1 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover transition"
                  >
                    Rent Now
                  </button>
                  <button
                    onClick={handleRemoveAppliedPromo}
                    className="text-xs text-text-subtle hover:text-danger underline transition"
                  >
                    Remove
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hub Tab Navigation */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-3 mb-8 border-b border-border">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200 border ${
                    isActive
                      ? 'bg-primary text-white border-primary shadow-sm shadow-primary/20 scale-[1.02]'
                      : 'bg-surface text-text-muted border-border hover:border-primary/30 hover:text-text'
                  }`}
                >
                  <Icon size={14} className={isActive ? 'text-white' : 'text-primary'} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab 1: For You */}
          {activeTab === 'for_you' && (
            <div className="space-y-8">
              {/* Hero Tile: Best Savings For You */}
              <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-surface via-surface-raised to-surface border border-primary/30 shadow-md overflow-hidden">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                  <div className="space-y-3 max-w-2xl">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-soft text-primary text-[10px] font-bold uppercase tracking-wider font-mono">
                      <Zap size={12} /> Auto-Computed Best Value
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-text font-display">
                      {featuredOffer.name}
                    </h2>
                    <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                      {featuredOffer.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 pt-2">
                      <div className="px-3 py-1.5 rounded-xl bg-surface-sunken border border-border text-xs">
                        <span className="text-text-subtle font-mono text-[10px] uppercase block">Discount</span>
                        <span className="font-bold text-primary font-mono text-sm">
                          {featuredOffer.type === 'percentage' ? `${featuredOffer.value}% OFF` : `₹${featuredOffer.value} FLAT OFF`}
                        </span>
                      </div>

                      <div className="px-3 py-1.5 rounded-xl bg-surface-sunken border border-border text-xs">
                        <span className="text-text-subtle font-mono text-[10px] uppercase block">Min Booking</span>
                        <span className="font-bold text-text font-mono text-sm">
                          ₹{featuredOffer.minBookingAmount?.toLocaleString('en-IN') || 0}
                        </span>
                      </div>

                      <div className="px-3 py-1.5 rounded-xl bg-surface-sunken border border-border text-xs">
                        <span className="text-text-subtle font-mono text-[10px] uppercase block">Coupon Code</span>
                        <span className="font-bold text-accent font-mono text-sm">
                          {featuredOffer.code}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Call to Actions */}
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-3 min-w-[220px]">
                    <button
                      type="button"
                      onClick={() => handleApplyPromo(featuredOffer)}
                      className="w-full py-3 px-5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm shadow-primary/25 flex items-center justify-center gap-2"
                    >
                      <span>Apply to Next Ride</span>
                      <ArrowRight size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopyCode(featuredOffer.code)}
                      className="w-full py-3 px-5 rounded-xl bg-surface-sunken hover:bg-surface-raised border border-border text-text font-bold text-xs transition flex items-center justify-center gap-2"
                    >
                      {copiedCode === featuredOffer.code ? (
                        <>
                          <Check size={14} className="text-primary" />
                          <span className="text-primary">COPIED!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          <span>Copy Voucher Code</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Flash Deals Expiring-Soon Rail */}
              <div className="p-5 sm:p-6 rounded-3xl bg-surface border border-border shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-3">
                  <div className="flex items-center gap-2">
                    <Flame size={18} className="text-accent animate-pulse" />
                    <h3 className="font-black text-base text-text font-display">
                      Flash Deals Expiring Soon
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-accent bg-accent-soft px-3 py-1 rounded-xl border border-accent/20">
                    <Clock size={13} />
                    <span>Closes in {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { code: 'FLASH25', title: 'Weekend Flash Escape', desc: 'Flat 25% off across all compact & premium SUVs.', tag: '25% OFF', min: 2500 },
                    { code: 'CITYEV', title: 'Electric City Drive', desc: 'Complimentary charging credits + ₹800 off on EVs.', tag: '₹800 OFF', min: 1800 },
                    { code: 'MONSOON40', title: 'Highway Highway Explorer', desc: 'Book 3+ days and save up to ₹3,000 instantly.', tag: '₹3,000 OFF', min: 6000 }
                  ].map((deal) => (
                    <div
                      key={deal.code}
                      className="p-4 rounded-2xl bg-surface-sunken border border-border flex flex-col justify-between hover:border-primary/40 transition-all duration-200"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2 py-0.5 rounded-lg bg-primary-soft text-primary text-[10px] font-bold font-mono">
                            {deal.tag}
                          </span>
                          <span className="text-[10px] text-text-subtle font-mono">
                            Min: ₹{deal.min}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-text mb-1">{deal.title}</h4>
                        <p className="text-xs text-text-muted leading-relaxed line-clamp-2">{deal.desc}</p>
                      </div>

                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-border">
                        <span className="font-mono text-xs font-black text-text">{deal.code}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(deal.code)}
                          className="px-2.5 py-1 rounded-lg bg-surface hover:bg-surface-raised border border-border text-[11px] font-semibold text-primary transition"
                        >
                          {copiedCode === deal.code ? 'Copied!' : 'Copy Code'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Personalized Recommendation Rail */}
              <div className="p-5 sm:p-6 rounded-3xl bg-surface border border-border shadow-xs">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp size={18} className="text-primary" />
                  <h3 className="font-black text-base text-text font-display">
                    Tailored To Your Rental Style
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-surface-sunken border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary font-mono">
                        Welcome Back Benefit
                      </span>
                      <h4 className="font-bold text-sm text-text">First Ride Welcome Voucher</h4>
                      <p className="text-xs text-text-muted">Save flat ₹1,500 on any rental of 2 or more days.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleApplyPromo({ code: 'FIRST1500', name: 'First Ride Welcome', type: 'fixed', value: 1500, minBookingAmount: 3000 })}
                      className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition shadow-xs whitespace-nowrap"
                    >
                      Apply Now
                    </button>
                  </div>

                  <div className="p-5 rounded-2xl bg-surface-sunken border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-accent font-mono">
                        Long Range Savings
                      </span>
                      <h4 className="font-bold text-sm text-text">Weekly Touring Special</h4>
                      <p className="text-xs text-text-muted">Enjoy 30% discount on rentals spanning 7 days or longer.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleApplyPromo({ code: 'LONGTRIP30', name: 'Weekly Touring Special', type: 'percentage', value: 30, minBookingAmount: 10000 })}
                      className="px-4 py-2 bg-surface hover:bg-surface-raised border border-border text-text rounded-xl text-xs font-bold transition whitespace-nowrap"
                    >
                      Apply Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: All Offers (Catalog) */}
          {activeTab === 'all_offers' && (
            <div className="space-y-6">
              {/* Category Pills & Search Controls */}
              <div className="space-y-4">
                {/* Search & Sort Controls */}
                <div className="flex flex-col md:flex-row gap-3 p-3 rounded-2xl border border-border bg-surface shadow-xs">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-subtle" />
                    <input
                      type="text"
                      placeholder="Search voucher code (e.g. RENTRIDE20), title, or keywords..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-surface-sunken border border-border/80 focus:border-primary focus:ring-2 focus:ring-primary/20 text-xs font-medium outline-none text-text placeholder-text-subtle"
                    />
                  </div>

                  <div className="flex items-center gap-2 self-start md:self-auto bg-surface-sunken px-3 py-1.5 rounded-xl border border-border">
                    <SlidersHorizontal size={13} className="text-text-subtle" />
                    <span className="text-xs text-text-subtle font-semibold">Sort:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-transparent text-xs font-bold text-text outline-none cursor-pointer"
                    >
                      <option value="savings">Highest Savings</option>
                      <option value="min_booking">Lowest Min Booking</option>
                      <option value="expiring">Expiring Soonest</option>
                    </select>
                  </div>
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
                  {CATEGORIES.map(cat => {
                    const active = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                          active
                            ? 'bg-primary text-white border-primary shadow-xs scale-102'
                            : 'bg-surface text-text-muted border-border hover:border-primary/30 hover:text-text'
                        }`}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Offers Grid */}
              {filteredPromotions.length === 0 ? (
                <div className="py-16 text-center bg-surface border border-border rounded-3xl p-8 max-w-md mx-auto">
                  <Tag className="w-10 h-10 mx-auto text-text-subtle mb-3" />
                  <h3 className="text-base font-bold text-text font-display">No matching vouchers found</h3>
                  <p className="text-xs text-text-muted mt-1">
                    Try clearing your search keyword or switching category pills.
                  </p>
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                    className="mt-4 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition"
                  >
                    Reset Catalog Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPromotions.map((promo) => {
                    const isExpanded = expandedOfferId === promo._id;
                    const discountDisplay = promo.type === 'percentage' ? `${promo.value}% OFF` : `₹${promo.value} OFF`;
                    const usagePercent = promo.usageLimit ? Math.min(100, Math.round((promo.usedCount / promo.usageLimit) * 100)) : 45;

                    return (
                      <div
                        key={promo._id}
                        className={`rounded-2xl p-5 bg-surface border transition-all duration-300 flex flex-col justify-between ${
                          codeParam && promo.code.toUpperCase() === codeParam.toUpperCase()
                            ? 'border-primary ring-2 ring-primary/20 shadow-md'
                            : 'border-border hover:border-primary/40 shadow-xs'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary-soft text-primary border border-primary/20 font-mono">
                              {discountDisplay}
                            </span>
                            <span className="text-[10px] text-text-subtle font-mono">
                              Valid to {new Date(promo.validTo).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                          </div>

                          <h3 className="font-bold text-base text-text font-display mb-1">
                            {promo.name}
                          </h3>

                          <p className="text-xs text-text-muted leading-relaxed line-clamp-2 mb-3">
                            {promo.description}
                          </p>

                          {/* Usage Progress Bar */}
                          <div className="mb-3 space-y-1">
                            <div className="flex items-center justify-between text-[10px] font-mono text-text-subtle">
                              <span>Claimed: {promo.usedCount || 12} / {promo.usageLimit || 500}</span>
                              <span>{usagePercent}%</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-surface-sunken overflow-hidden">
                              <div
                                className="h-full rounded-full bg-primary transition-all duration-500"
                                style={{ width: `${usagePercent}%` }}
                              />
                            </div>
                          </div>

                          {/* Collapsible Terms Drawer */}
                          <button
                            type="button"
                            onClick={() => setExpandedOfferId(isExpanded ? null : promo._id)}
                            className="flex items-center gap-1 text-[11px] font-semibold text-text-subtle hover:text-text transition mb-2"
                          >
                            <span>Terms & Conditions</span>
                            {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          </button>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="p-3 rounded-xl bg-surface-sunken text-[11px] text-text-muted space-y-1 mb-3 border border-border"
                              >
                                <p>• Minimum rental fare: ₹{promo.minBookingAmount?.toLocaleString('en-IN') || 0}</p>
                                {promo.maxDiscount && <p>• Maximum discount capped at ₹{promo.maxDiscount?.toLocaleString('en-IN')}</p>}
                                <p>• Applicable across Indian hubs on verified vehicles</p>
                                <p>• Non-combinable with promotional wallet cashback credits</p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Bottom Action Footer */}
                        <div className="flex items-center justify-between pt-3 border-t border-border gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopyCode(promo.code)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-sunken hover:bg-surface-raised border border-border text-xs font-mono font-bold text-text transition"
                          >
                            {copiedCode === promo.code ? (
                              <>
                                <Check size={12} className="text-primary" />
                                <span className="text-primary">COPIED</span>
                              </>
                            ) : (
                              <>
                                <Copy size={12} />
                                <span>{promo.code}</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleApplyPromo(promo)}
                            className="px-4 py-1.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition shadow-xs"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Refer & Earn */}
          {activeTab === 'refer_earn' && (
            <div className="space-y-8 max-w-4xl mx-auto">
              {/* Referral Hero Card */}
              <div className="rounded-3xl p-6 sm:p-8 bg-surface border border-border shadow-sm text-center relative overflow-hidden">
                <div className="w-14 h-14 rounded-2xl bg-primary-soft text-primary flex items-center justify-center mx-auto mb-4">
                  <Share2 size={26} />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-text font-display mb-2">
                  Share RentRide with Friends & Family
                </h2>
                <p className="text-xs sm:text-sm text-text-muted max-w-lg mx-auto leading-relaxed mb-6">
                  Give friends <span className="font-bold text-primary">₹750 discount</span> on their first rental. You get <span className="font-bold text-primary">₹500 wallet credit</span> credited directly to your account when they complete their first trip.
                </p>

                {/* Referral Code Box */}
                <div className="max-w-md mx-auto p-4 rounded-2xl bg-surface-sunken border border-border flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
                  <div className="text-left">
                    <span className="text-[10px] uppercase font-bold text-text-subtle tracking-wider font-mono block">
                      Your Unique Referral Code
                    </span>
                    <span className="text-xl font-black text-primary font-mono tracking-wider">
                      {referral.code || 'RIDE-INVITE-2026'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyCode(referral.code || 'RIDE-INVITE-2026')}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    {copiedCode === (referral.code || 'RIDE-INVITE-2026') ? (
                      <>
                        <Check size={14} />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Share Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <a
                    href={`https://wa.me/?text=Get%20%E2%82%B9750%20off%20your%20first%20luxury%20or%20city%20car%20rental%20with%20RentRide!%20Use%20code:%20${referral.code}%20or%20sign%20up%20at:%20${encodeURIComponent(referral.shareUrl)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-success-soft text-success border border-success/20 hover:bg-success hover:text-white text-xs font-bold transition flex items-center gap-2"
                  >
                    <MessageSquare size={14} />
                    <span>Share on WhatsApp</span>
                  </a>

                  <a
                    href={`mailto:?subject=RentRide%20Exclusive%20Discount&body=Hey!%20Use%20my%20referral%20code%20${referral.code}%20to%20get%20flat%20%E2%82%B9750%20off%20your%20first%20rental%20trip.%20Sign%20up%20here:%20${referral.shareUrl}`}
                    className="px-4 py-2.5 rounded-xl bg-surface-sunken hover:bg-surface-raised border border-border text-text text-xs font-bold transition flex items-center gap-2"
                  >
                    <Mail size={14} />
                    <span>Email Invite</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(referral.shareUrl || 'https://rentride.com');
                      toast.success('Referral link copied!');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-surface-sunken hover:bg-surface-raised border border-border text-text text-xs font-bold transition flex items-center gap-2"
                  >
                    <Send size={14} />
                    <span>Copy Web Link</span>
                  </button>
                </div>
              </div>

              {/* Referral Funnel Tracker */}
              <div className="p-6 rounded-3xl bg-surface border border-border shadow-xs">
                <h3 className="font-bold text-base text-text font-display mb-4">
                  Referral Reward Funnel Tracker
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-surface-sunken border border-border text-center">
                    <span className="text-[10px] font-mono uppercase text-text-subtle block mb-1">Friends Invited</span>
                    <span className="text-2xl font-black text-text font-mono">{referral.funnel?.invited || 3}</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-surface-sunken border border-border text-center">
                    <span className="text-[10px] font-mono uppercase text-text-subtle block mb-1">Signed Up</span>
                    <span className="text-2xl font-black text-primary font-mono">{referral.funnel?.signedUp || 1}</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-surface-sunken border border-border text-center">
                    <span className="text-[10px] font-mono uppercase text-text-subtle block mb-1">First Rides Completed</span>
                    <span className="text-2xl font-black text-accent font-mono">{referral.funnel?.firstRideCompleted || 0}</span>
                  </div>
                </div>

                <div className="mt-4 p-3 rounded-xl bg-primary-soft text-primary text-xs flex items-center justify-between">
                  <span>Total Rewards Credited to Wallet:</span>
                  <span className="font-bold font-mono">₹{referral.rewardsEarned || 0}</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Wallet & Credits */}
          {activeTab === 'wallet' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              {/* Balance Summary Card */}
              <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-border shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                  <span className="text-xs uppercase font-bold text-text-subtle tracking-wider font-mono block mb-1">
                    RentRide Wallet Balance
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-primary font-mono tabular-nums">
                      ₹{wallet.balance?.toLocaleString('en-IN') || 0}
                    </span>
                    <span className="text-xs text-text-subtle">Instant deduction credits</span>
                  </div>
                  <p className="text-xs text-text-muted mt-2">
                    Wallet balance applies automatically towards security deposit or total booking fare at checkout.
                  </p>
                </div>

                <div className="flex items-center gap-3 self-stretch sm:self-auto p-3 rounded-2xl bg-surface-sunken border border-border">
                  <div className="text-right">
                    <span className="text-xs font-bold text-text block">Auto-Apply at Checkout</span>
                    <span className="text-[10px] text-text-subtle">Saves checkout clicks</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={wallet.autoApply}
                    onChange={async (e) => {
                      const next = e.target.checked;
                      setWallet(prev => ({ ...prev, autoApply: next }));
                      await promotionService.updateWalletSettings({ autoApply: next });
                      toast.success(next ? 'Wallet auto-apply enabled' : 'Wallet auto-apply disabled');
                    }}
                    className="w-5 h-5 accent-primary cursor-pointer rounded"
                  />
                </div>
              </div>

              {/* Transaction Ledger */}
              <div className="p-6 rounded-3xl bg-surface border border-border shadow-xs">
                <h3 className="font-bold text-base text-text font-display mb-4">
                  Credits Activity Ledger
                </h3>

                {(!wallet.ledger || wallet.ledger.length === 0) ? (
                  <div className="py-10 text-center text-text-muted text-xs">
                    No credit activities recorded yet.
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {wallet.ledger.map((entry, idx) => (
                      <div key={idx} className="py-3.5 flex items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-text">{entry.description}</p>
                          <p className="text-[10px] text-text-subtle font-mono">
                            {new Date(entry.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            {entry.category ? ` • Category: ${entry.category}` : ''}
                          </p>
                        </div>
                        <span className={`text-xs font-bold font-mono tabular-nums ${
                          entry.type === 'credit' ? 'text-success' : 'text-danger'
                        }`}>
                          {entry.type === 'credit' ? '+' : '-'}₹{entry.amount?.toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 5: Rewards Tiers (Loyalty) */}
          {activeTab === 'rewards_tiers' && (
            <div className="space-y-8 max-w-4xl mx-auto">
              {/* Current Tier Overview */}
              <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-border shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                  <span className="text-[10px] uppercase font-bold text-text-subtle tracking-wider font-mono block mb-1">
                    Current Loyalty Standing
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-black text-text font-display uppercase">
                      {loyalty.tier} Member
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary-soft text-primary border border-primary/20 uppercase">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-2">
                    {loyalty.rentalsRemaining > 0 
                      ? `${loyalty.rentalsRemaining} more completed rental(s) or ₹${loyalty.spendRemaining?.toLocaleString('en-IN')} spend to advance to ${loyalty.nextTier?.toUpperCase()}.`
                      : 'You have attained the pinnacle tier of RentRide membership!'}
                  </p>
                </div>

                {loyalty.nextTier && (
                  <div className="w-full sm:w-48 space-y-1.5">
                    <div className="flex justify-between text-[10px] font-mono text-text-subtle">
                      <span>Progress to {loyalty.nextTier.toUpperCase()}</span>
                      <span>{Math.round(((loyalty.totalBookings || 1) / (loyalty.targetBookings || 3)) * 100)}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-surface-sunken overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-primary transition-all duration-500" 
                        style={{ width: `${Math.min(100, Math.round(((loyalty.totalBookings || 1) / (loyalty.targetBookings || 3)) * 100))}%` }} 
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Tier Benefits Comparison Matrix */}
              <div className="p-6 rounded-3xl bg-surface border border-border shadow-xs overflow-x-auto">
                <h3 className="font-bold text-base text-text font-display mb-4">
                  Loyalty Tiers & Privilege Matrix
                </h3>

                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-border text-[10px] uppercase font-mono text-text-subtle">
                      <th className="py-3 px-3">Privilege</th>
                      <th className="py-3 px-3">Bronze</th>
                      <th className="py-3 px-3 text-primary">Silver</th>
                      <th className="py-3 px-3 text-accent">Gold</th>
                      <th className="py-3 px-3 text-purple-500">Platinum</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-text">
                    <tr>
                      <td className="py-3 px-3 font-semibold">Extra Fare Discount</td>
                      <td className="py-3 px-3 text-text-muted">Standard</td>
                      <td className="py-3 px-3 font-semibold text-primary">5% Extra</td>
                      <td className="py-3 px-3 font-semibold text-accent">10% Extra</td>
                      <td className="py-3 px-3 font-semibold text-purple-500">15% Extra</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 font-semibold">Security Deposit Waived</td>
                      <td className="py-3 px-3 text-text-muted">Standard ₹5,000</td>
                      <td className="py-3 px-3 text-text-muted">Standard ₹5,000</td>
                      <td className="py-3 px-3 font-semibold text-accent">50% Waived</td>
                      <td className="py-3 px-3 font-semibold text-purple-500">100% Zero Deposit</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 font-semibold">Free Cancellation Window</td>
                      <td className="py-3 px-3 text-text-muted">24 Hours</td>
                      <td className="py-3 px-3">12 Hours</td>
                      <td className="py-3 px-3 font-semibold text-accent">6 Hours</td>
                      <td className="py-3 px-3 font-semibold text-purple-500">Instant / Any Time</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 font-semibold">Priority Airport Hub Pickup</td>
                      <td className="py-3 px-3 text-text-muted">No</td>
                      <td className="py-3 px-3">Yes</td>
                      <td className="py-3 px-3 font-semibold text-accent">VIP Fast Lane</td>
                      <td className="py-3 px-3 font-semibold text-purple-500">Doorstep Delivery</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}