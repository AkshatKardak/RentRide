import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useTheme } from '@/hooks/useTheme';

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
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-2xl lg:text-3xl font-display font-black tracking-tight text-text">Payments & Revenue Ledger</h1>
        <p className="text-xs md:text-sm text-muted mt-1">
          Direct gateway transactions, security deposit escrows, and trip settlements
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-surface shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-surface-sunken/60 text-muted uppercase font-mono font-bold text-[10px] tracking-wider">
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
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading payment records...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted">
                    No transactions recorded in ledger
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p._id} className="hover:bg-surface-sunken/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-muted">
                      {p.paymentIntent || p.razorpayPaymentId || `#TXN-${p._id.slice(-6).toUpperCase()}`}
                    </td>
                    <td className="py-3 px-4 font-bold text-text">{p.user?.name || 'Customer'}</td>
                    <td className="py-3 px-4 text-muted">{p.car?.name || p.car?.model || 'Vehicle'}</td>
                    <td className="py-3 px-4 font-mono font-bold text-primary">
                      ₹{(p.totalPrice || p.amount || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 uppercase text-[10px] font-mono font-bold text-muted">
                      {p.paymentMethod || 'Razorpay'}
                    </td>
                    <td className="py-3 px-4 uppercase font-mono">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        (p.paymentStatus || p.status) === 'paid' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-accent/10 text-accent border border-accent/20'
                      }`}>
                        {p.paymentStatus || p.status || 'completed'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-muted">
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
