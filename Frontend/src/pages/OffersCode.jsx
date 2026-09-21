import { useState, useEffect } from 'react';
import { FiCopy, FiCheck, FiTag, FiPercent, FiDollarSign } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { promotionService } from '../services/promotionService';
import { useTheme } from '../context/ThemeContext';
import DashboardNavbar from '../components/layout/DashboardNavbar';

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
    toast.success(`Code "${code}" copied to clipboard!`);

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

    toast.success(`Promo "${promo.code}" applied! Redirecting to booking...`, {
      duration: 2000,
    });

    setTimeout(() => {
      window.location.href = '/browsecars';
    }, 2000);
  };

  const theme = {
    bg: isDarkMode ? '#0f172a' : '#f8f9fa',
    cardBg: isDarkMode ? '#1e293b' : '#ffffff',
    text: isDarkMode ? '#f1f5f9' : '#1F2937',
    textSecondary: isDarkMode ? '#cbd5e1' : '#6B7280',
    border: isDarkMode ? '#334155' : '#e5e7eb',
    inputBg: isDarkMode ? '#0f172a' : '#f3f4f6',
  };

  if (loading) {
    return (
      <>
        <DashboardNavbar />
        <div
          className="min-h-screen flex items-center justify-center transition-colors duration-300"
          style={{ backgroundColor: theme.bg }}
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <DashboardNavbar />
      <div
        className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 pt-24 transition-colors duration-300"
        style={{ backgroundColor: theme.bg }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1
              className="text-4xl font-bold mb-4"
              style={{ color: theme.text }}
            >
              🎉 Exclusive Offers & Promo Codes
            </h1>
            <p
              className="text-lg"
              style={{ color: theme.textSecondary }}
            >
              Save big on your next car rental! Apply these codes at checkout.
            </p>
          </div>

          {/* Promotions Content */}
          {promotions.length === 0 ? (
            <div 
              className="text-center py-16 px-6 rounded-2xl border max-w-lg mx-auto"
              style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-4">
                <FiTag className="text-2xl" />
              </div>
              <h3 className="text-lg font-bold mb-1" style={{ color: theme.text }}>
                No Active Offers Currently
              </h3>
              <p className="text-sm" style={{ color: theme.textSecondary }}>
                All seasonal discounts and promo codes will be listed here as soon as they become active.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {promotions.map((promo) => (
                <div
                  key={promo.code || promo._id}
                  className="rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 hover:border-emerald-500"
                  style={{
                    backgroundColor: theme.cardBg,
                    borderColor: theme.border
                  }}
                >
                {/* Card Header - GREEN GRADIENT */}
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {promo.type === 'percentage' ? (
                        <FiPercent className="text-2xl" />
                      ) : (
                        <FiDollarSign className="text-2xl" />
                      )}
                      <h3 className="text-2xl font-bold">{promo.code || 'PROMO'}</h3>
                    </div>
                    <FiTag className="text-3xl opacity-50" />
                  </div>
                  <p className="text-green-100 text-sm font-semibold">
                    {promo.name || 'Special Offer'}
                  </p>
                  <p className="text-green-50 text-xs mt-1">
                    {promo.type === 'percentage'
                      ? `${promo.value || 0}% OFF`
                      : `₹${(promo.value || 0).toLocaleString()} OFF`}
                  </p>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  <p
                    className="mb-4 min-h-[60px]"
                    style={{ color: theme.text }}
                  >
                    {promo.description || 'Limited time offer - save on your booking!'}
                  </p>

                  {/* Details */}
                  <div
                    className="space-y-2 mb-6 text-sm"
                    style={{ color: theme.textSecondary }}
                  >
                    <div className="flex justify-between">
                      <span>Max Discount:</span>
                      <span className="font-semibold text-green-600">
                        ₹{(promo.maxDiscount || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Min Booking:</span>
                      <span className="font-semibold" style={{ color: theme.text }}>
                        ₹{(promo.minBookingAmount || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleCopyCode(promo.code)}
                      className="flex-1 flex items-center justify-center space-x-2 font-semibold py-3 px-4 rounded-lg transition-colors"
                      style={{
                        backgroundColor: theme.inputBg,
                        color: theme.text
                      }}
                    >
                      {copiedCode === promo.code ? (
                        <>
                          <FiCheck className="text-green-600" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <FiCopy />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleApplyCode(promo)}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-lg"
                    >
                      Apply Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default OffersCode;