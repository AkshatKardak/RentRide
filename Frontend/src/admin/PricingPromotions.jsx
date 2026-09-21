import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

export default function PricingPromotions() {
  const { isDarkMode } = useTheme();
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPromo, setNewPromo] = useState({
    code: '',
    discount: 15,
    discountType: 'percentage',
    minBookingAmount: 3000,
    maxDiscount: 1500,
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

      const res = await axios.post(`${baseUrl}/admin/promotions`, newPromo, { headers });
      if (res.data?.success) {
        toast.success('Promotion code created');
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black tracking-tight">Promotions & Coupons</h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Manage customer discount campaigns and referral vouchers
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 flex items-center gap-2 self-start md:self-auto"
        >
          <Plus size={16} />
          <span>Create Coupon</span>
        </button>
      </div>

      <div className={`rounded-2xl border overflow-hidden ${
        isDarkMode ? 'bg-slate-900 border-slate-800/80 shadow-md shadow-black/20' : 'bg-white border-slate-200/90 shadow-sm'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className={`border-b text-slate-400 uppercase font-bold text-[10px] tracking-wider ${
              isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <tr>
                <th className="py-3.5 px-4">Coupon Code</th>
                <th className="py-3.5 px-4">Discount</th>
                <th className="py-3.5 px-4">Min. Booking</th>
                <th className="py-3.5 px-4">Max. Discount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-inherit">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">Loading coupons...</td>
                </tr>
              ) : promotions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">No active promotions</td>
                </tr>
              ) : (
                promotions.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-500/5 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-emerald-500">{p.code}</td>
                    <td className="py-3 px-4 font-bold">
                      {p.discount}{p.discountType === 'percentage' ? '%' : ' INR'} OFF
                    </td>
                    <td className="py-3 px-4">₹{(p.minBookingAmount || 0).toLocaleString()}</td>
                    <td className="py-3 px-4">₹{(p.maxDiscount || 0).toLocaleString()}</td>
                    <td className="py-3 px-4 uppercase">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500">
                        Active
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeletePromo(p._id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl space-y-4 ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <h3 className="font-bold text-lg">New Promotion Code</h3>
            <form onSubmit={handleCreatePromo} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MONSOON20, FESTIVE15"
                  value={newPromo.code}
                  onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 rounded-xl border bg-transparent uppercase font-mono font-bold border-inherit focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Discount (%)</label>
                  <input
                    type="number"
                    value={newPromo.discount}
                    onChange={(e) => setNewPromo({ ...newPromo, discount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border bg-transparent border-inherit focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Max Cap (₹)</label>
                  <input
                    type="number"
                    value={newPromo.maxDiscount}
                    onChange={(e) => setNewPromo({ ...newPromo, maxDiscount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border bg-transparent border-inherit focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs"
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
