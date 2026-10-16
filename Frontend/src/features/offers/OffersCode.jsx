import { useState, useEffect } from 'react';
import { FiCopy, FiCheck, FiTag, FiPercent, FiDollarSign } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { promotionService } from '@/services/promotionService';
import { useTheme } from '@/hooks/useTheme';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import { Reveal, HoverLift } from '@/components/fx';

const OffersCode = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = async () => {
    try {
      setLoading(true);
      const response = await promotionService.getAllPromotions();

      if (response.success && Array.isArray(response.data)) {
        setPromotions(response.data);
      } else {
        setPromotions([]);
      }
    } catch (error) {
      console.error('Error loading promotions from database:', error);
      setPromotions([]);
      toast.error('Unable to load promotions from server.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon "${code}" copied to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleApplyCode = (promo) => {
    localStorage.setItem('appliedPromoCode', JSON.stringify({
      code: promo.code,
      name: promo.name || promo.code,
      type: promo.type,
      value: promo.value,
      maxDiscount: promo.maxDiscount,
      minBookingAmount: promo.minBookingAmount,
      description: promo.description
    }));

    toast.success(`Promo "${promo.code}" applied! Directing to fleet...`, {
      duration: 2000,
    });

    setTimeout(() => {
      window.location.href = '/browsecars';
    }, 1500);
  };

  if (loading) {
    return (
      <>
        <DashboardNavbar />
        <div className="min-h-screen flex items-center justify-center bg-bg">
          <div className="w-10 h-10 rounded-full border-3 border-primary border-t-transparent animate-spin" />
        </div>
      </>
    );
  }

  return (
    <>
      <DashboardNavbar />
      <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-bg transition-colors duration-300">
        <div className="max-w-7xl mx-auto space-y-10">
          
          {/* Header */}
          <Reveal direction="down" delay={0.1} className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-bold uppercase tracking-wider mb-2 font-mono">
              <FiTag size={12} /> Seasonal Rewards
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-text font-display">
              Exclusive Offers & Vouchers
            </h1>
            <p className="text-xs sm:text-sm text-text-muted mt-1.5">
              Maximize your savings on long-range rentals and executive weekend getaways across India.
            </p>
          </Reveal>

          {/* Promotions Content */}
          {promotions.length === 0 ? (
            <div className="text-center py-16 px-6 rounded-3xl border border-border bg-surface max-w-md mx-auto shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-primary-soft text-primary flex items-center justify-center mx-auto mb-3">
                <FiTag className="text-xl" />
              </div>
              <h3 className="text-base font-bold text-text font-display">
                No Active Offers Currently
              </h3>
              <p className="text-xs text-text-muted mt-1">
                All seasonal discounts and festive codes will appear here in real time.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {promotions.map((promo) => (
                <HoverLift key={promo.code || promo._id} className="h-full">
                  <div className="rounded-2xl shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden border border-border bg-surface hover:border-primary/40 flex flex-col justify-between h-full">
                    
                    {/* Card Header in Terracotta + Copper gradient */}
                    <div className="bg-gradient-to-r from-primary via-primary-hover to-accent p-5 text-white">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center space-x-2">
                          {promo.type === 'percentage' ? (
                            <FiPercent className="text-xl text-primary-fg" />
                          ) : (
                            <FiDollarSign className="text-xl text-primary-fg" />
                          )}
                          <h3 className="text-xl font-black tracking-wide font-mono">{promo.code || 'PROMO'}</h3>
                        </div>
                        <FiTag className="text-2xl opacity-40" />
                      </div>
                      <p className="text-white/90 text-xs font-semibold">
                        {promo.name || 'Special Promotional Offer'}
                      </p>
                      <p className="text-white font-mono text-sm font-bold mt-1">
                        {promo.type === 'percentage'
                          ? `${promo.value || 0}% DISCOUNT`
                          : `₹${(promo.value || 0).toLocaleString('en-IN')} OFF`}
                      </p>
                    </div>

                    {/* Card Body */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <p className="text-xs text-text-muted leading-relaxed min-h-[48px]">
                        {promo.description || 'Verified promo code applicable on eligible vehicles across major Indian rental hubs.'}
                      </p>

                      <div className="space-y-1.5 text-xs border-y border-border py-2.5">
                        <div className="flex justify-between">
                          <span className="text-text-muted">Max Value:</span>
                          <span className="font-bold font-mono text-primary">
                            ₹{(promo.maxDiscount || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-muted">Min Booking:</span>
                          <span className="font-bold font-mono text-text">
                            ₹{(promo.minBookingAmount || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => handleCopyCode(promo.code)}
                          className="flex-1 flex items-center justify-center gap-1.5 font-semibold py-2.5 px-3 rounded-xl border border-border bg-surface-sunken hover:bg-surface text-text text-xs transition-colors"
                        >
                          {copiedCode === promo.code ? (
                            <>
                              <FiCheck className="text-success" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <FiCopy size={13} />
                              <span>Copy</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleApplyCode(promo)}
                          className="flex-1 bg-primary hover:bg-primary-hover text-white font-bold py-2.5 px-3 rounded-xl text-xs uppercase tracking-wider shadow-xs shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                          Apply Now
                        </button>
                      </div>
                    </div>
                  </div>
                </HoverLift>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default OffersCode;