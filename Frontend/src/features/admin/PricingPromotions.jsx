import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, CheckCircle2, XCircle, X } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useTheme } from '@/hooks/useTheme';

export default function PricingPromotions() {
  const { isDarkMode } = useTheme();
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPromo, setNewPromo] = useState({
    code: '',
    name: '',
    description: '',
    category: 'general',
    type: 'percentage',
    value: 15,
    minBookingAmount: 3000,
    maxDiscount: 1500,
    tier: 'all',
    firstBookingOnly: false,
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await axios.get(`${baseUrl}/admin/promotions`, { headers });
      if (res.data?.success) {
        setPromotions(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching promotions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePromo = async (e) => {
    e.preventDefault();
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const payload = {
        code: newPromo.code.toUpperCase(),
        name: newPromo.name || newPromo.code.toUpperCase(),
        description: newPromo.description || `Special promotion ${newPromo.code}`,
        category: newPromo.category,
        type: newPromo.type,
        value: Number(newPromo.value),
        minBookingAmount: Number(newPromo.minBookingAmount) || 0,
        maxDiscount: newPromo.maxDiscount ? Number(newPromo.maxDiscount) : null,
        tier: newPromo.tier,
        firstBookingOnly: Boolean(newPromo.firstBookingOnly),
        validFrom: new Date(),
        validTo: new Date(newPromo.validUntil),
        usageLimit: 1000
      };

      const res = await axios.post(`${baseUrl}/admin/promotions`, payload, { headers });
      if (res.data?.success) {
        toast.success('Promotion code created successfully');
        setShowAddModal(false);
        fetchPromotions();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create promo');
    }
  };

  const handleDeletePromo = async (id) => {
    if (!window.confirm('Delete this promotion coupon?')) return;
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      await axios.delete(`${baseUrl}/admin/promotions/${id}`, { headers });
      toast.success('Promotion removed');
      setPromotions(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      toast.error('Failed to delete promotion');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-black tracking-tight text-text">Promotions & Coupons</h1>
          <p className="text-xs md:text-sm text-text-muted mt-1">
            Manage customer discount campaigns, category vouchers, and loyalty tier rewards
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-xl shadow-md shadow-primary/20 flex items-center gap-2 self-start md:self-auto transition-all"
        >
          <Plus size={16} />
          <span>Create Coupon</span>
        </button>
      </div>

      <div className="rounded-2xl border border-border bg-surface shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-surface-sunken/60 text-text-subtle uppercase font-mono font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Coupon Code</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Discount</th>
                <th className="py-3.5 px-4">Min. Booking</th>
                <th className="py-3.5 px-4">Tier</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-text-muted">Loading coupons...</td>
                </tr>
              ) : promotions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-text-muted">No active promotions found</td>
                </tr>
              ) : (
                promotions.map((p) => {
                  const val = p.value ?? p.discount ?? 0;
                  const discountType = p.type ?? p.discountType ?? 'percentage';
                  return (
                    <tr key={p._id} className="hover:bg-surface-sunken/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-primary">{p.code}</td>
                      <td className="py-3 px-4 capitalize font-semibold text-text-muted">{p.category || 'general'}</td>
                      <td className="py-3 px-4 font-mono font-bold text-text">
                        {val}{discountType === 'percentage' ? '%' : ' INR'} OFF
                      </td>
                      <td className="py-3 px-4 font-mono text-text-muted">₹{(p.minBookingAmount || 0).toLocaleString()}</td>
                      <td className="py-3 px-4 uppercase font-mono text-accent text-[11px] font-bold">{p.tier || 'all'}</td>
                      <td className="py-3 px-4 uppercase font-mono">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary-soft text-primary border border-primary/20">
                          {p.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeletePromo(p._id)}
                          className="p-1.5 text-danger hover:bg-danger-soft rounded-lg transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg p-6 rounded-3xl border border-border bg-surface shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-text">New Promotion Voucher</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 rounded-lg text-text-subtle hover:text-text hover:bg-surface-sunken">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreatePromo} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1 text-text">Coupon Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MONSOON20"
                    value={newPromo.code}
                    onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-surface-sunken uppercase font-mono font-bold text-text focus:outline-none focus:border-primary placeholder:text-text-subtle"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1 text-text">Campaign Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Weekend Monsoon Special"
                    value={newPromo.name}
                    onChange={(e) => setNewPromo({ ...newPromo, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-surface-sunken font-medium text-text focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1 text-text">Category</label>
                  <select
                    value={newPromo.category}
                    onChange={(e) => setNewPromo({ ...newPromo, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-surface-sunken text-text focus:outline-none focus:border-primary capitalize cursor-pointer"
                  >
                    <option value="general">General</option>
                    <option value="weekend">Weekend Getaways</option>
                    <option value="long_rental">Long Rentals</option>
                    <option value="first_ride">First Ride</option>
                    <option value="luxury">Luxury Fleet</option>
                    <option value="festive">Festive / Seasonal</option>
                    <option value="flash">Flash Deal</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold block mb-1 text-text">Target Tier</label>
                  <select
                    value={newPromo.tier}
                    onChange={(e) => setNewPromo({ ...newPromo, tier: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-surface-sunken text-text focus:outline-none focus:border-primary capitalize cursor-pointer"
                  >
                    <option value="all">All Members</option>
                    <option value="bronze">Bronze Only</option>
                    <option value="silver">Silver & Above</option>
                    <option value="gold">Gold & Above</option>
                    <option value="platinum">Platinum VIP Only</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold block mb-1 text-text">Type</label>
                  <select
                    value={newPromo.type}
                    onChange={(e) => setNewPromo({ ...newPromo, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-surface-sunken text-text focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold block mb-1 text-text">Value</label>
                  <input
                    type="number"
                    required
                    value={newPromo.value}
                    onChange={(e) => setNewPromo({ ...newPromo, value: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-surface-sunken text-text focus:outline-none focus:border-primary font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1 text-text">Max Cap (₹)</label>
                  <input
                    type="number"
                    placeholder="Optional"
                    value={newPromo.maxDiscount || ''}
                    onChange={(e) => setNewPromo({ ...newPromo, maxDiscount: e.target.value ? Number(e.target.value) : null })}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-surface-sunken text-text focus:outline-none focus:border-primary font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1 text-text">Min Booking (₹)</label>
                  <input
                    type="number"
                    value={newPromo.minBookingAmount}
                    onChange={(e) => setNewPromo({ ...newPromo, minBookingAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-surface-sunken text-text focus:outline-none focus:border-primary font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1 text-text">Valid Until</label>
                  <input
                    type="date"
                    value={newPromo.validUntil}
                    onChange={(e) => setNewPromo({ ...newPromo, validUntil: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-surface-sunken text-text focus:outline-none focus:border-primary font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="firstBookingOnly"
                  checked={newPromo.firstBookingOnly}
                  onChange={(e) => setNewPromo({ ...newPromo, firstBookingOnly: e.target.checked })}
                  className="w-4 h-4 accent-primary rounded cursor-pointer"
                />
                <label htmlFor="firstBookingOnly" className="text-text font-semibold cursor-pointer">
                  First-time booking only
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-border text-text font-bold text-xs hover:bg-surface-sunken transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs shadow-md shadow-primary/20 transition-all"
                >
                  Publish Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
