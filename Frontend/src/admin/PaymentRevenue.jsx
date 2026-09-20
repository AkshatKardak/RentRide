import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';

export default function PaymentRevenue() {
  const { isDarkMode } = useTheme();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await axios.get(`${baseUrl}/admin/payments`, { headers });
      if (res.data?.success) {
        setPayments(res.data.data?.payments || res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-black tracking-tight">Payments & Revenue Ledger</h1>
        <p className="text-xs md:text-sm text-slate-500 mt-1">
          Direct gateway transactions, security deposit escrows, and trip settlements
        </p>
      </div>

      <div className={`rounded-2xl border overflow-hidden ${
        isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className={`border-b text-slate-400 uppercase font-bold text-[10px] tracking-wider ${
              isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <tr>
                <th className="py-3.5 px-4">Transaction ID</th>
                <th className="py-3.5 px-4">Renter</th>
                <th className="py-3.5 px-4">Vehicle</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Method</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-inherit">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading payment records...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No transactions recorded in ledger
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-500/5 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-400">
                      {p.paymentIntent || p.razorpayPaymentId || `#TXN-${p._id.slice(-6).toUpperCase()}`}
                    </td>
                    <td className="py-3 px-4 font-bold">{p.user?.name || 'Customer'}</td>
                    <td className="py-3 px-4">{p.car?.name || p.car?.model || 'Vehicle'}</td>
                    <td className="py-3 px-4 font-bold text-emerald-500">
                      ₹{(p.totalPrice || p.amount || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 uppercase text-[10px] font-bold text-slate-400">
                      {p.paymentMethod || 'Razorpay'}
                    </td>
                    <td className="py-3 px-4 uppercase">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        (p.paymentStatus || p.status) === 'paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                      }`}>
                        {p.paymentStatus || p.status || 'completed'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400">
                      {new Date(p.createdAt || Date.now()).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
