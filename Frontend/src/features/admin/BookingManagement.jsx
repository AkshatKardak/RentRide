import React, { useState, useEffect } from 'react';
import { CalendarCheck, Search, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useTheme } from '@/context/ThemeContext';

export default function BookingManagement() {
  const { isDarkMode } = useTheme();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await axios.get(`${baseUrl}/bookings`, {
        params: { status: statusFilter !== 'All' ? statusFilter : undefined },
        headers
      });

      if (res.data?.success) {
        setBookings(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await axios.patch(
        `${baseUrl}/bookings/${bookingId}/status`,
        { status: newStatus },
        { headers }
      );

      if (res.data?.success) {
        toast.success(`Booking status changed to ${newStatus}`);
        setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: newStatus } : b));
      }
    } catch (err) {
      toast.error('Failed to update booking status');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-black tracking-tight text-text">Rental Bookings</h1>
          <p className="text-xs md:text-sm text-muted mt-1">
            Review customer reservations, approvals, and trip completions
          </p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-border bg-surface text-text focus:outline-none focus:border-primary self-start md:self-auto transition-colors shadow-2xs"
        >
          <option value="All">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="rounded-2xl border border-border bg-surface shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-surface-sunken/60 text-muted uppercase font-mono font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Booking ID</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Vehicle</th>
                <th className="py-3.5 px-4">Dates</th>
                <th className="py-3.5 px-4">Total</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading bookings...
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted">
                    No bookings found
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-surface-sunken/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-muted">
                      #{b._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-text">{b.user?.name || 'Customer'}</p>
                      <p className="text-[10px] text-muted font-mono">{b.user?.email || 'N/A'}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-text">{b.car?.name || b.car?.model || 'Vehicle'}</p>
                      <p className="text-[10px] text-muted">{b.car?.city || 'Hub'}</p>
                    </td>
                    <td className="py-3 px-4 font-mono text-muted">
                      {new Date(b.startDate).toLocaleDateString()} → {new Date(b.endDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-primary">
                      ₹{(b.totalPrice || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 capitalize">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        b.paymentStatus === 'paid' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-accent/10 text-accent border border-accent/20'
                      }`}>
                        {b.paymentStatus || 'pending'}
                      </span>
                    </td>
                    <td className="py-3 px-4 uppercase">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        b.status === 'confirmed' ? 'bg-primary/10 text-primary border border-primary/20' :
                        b.status === 'cancelled' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
                        'bg-accent/10 text-accent border border-accent/20'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <select
                        value={b.status}
                        onChange={(e) => handleUpdateStatus(b._id, e.target.value)}
                        className="px-2 py-1 rounded-lg text-[10px] font-bold border border-border bg-surface text-text focus:outline-none focus:border-primary transition-colors shadow-2xs"
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
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
