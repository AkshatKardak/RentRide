import React, { useState, useEffect } from 'react';
import { Users, Search, Shield, Ban, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useTheme } from '@/hooks/useTheme';

export default function UserManagement() {
  const { isDarkMode } = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await axios.get(`${baseUrl}/admin/users`, { headers });
      if (res.data?.success) {
        setUsers(res.data.data?.users || res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      await axios.patch(`${baseUrl}/admin/users/${userId}/status`, { status: newStatus }, { headers });
      toast.success(`User status changed to ${newStatus}`);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, status: newStatus } : u));
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const filteredUsers = users.filter(u =>
    (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-black tracking-tight text-text">Customer Management</h1>
          <p className="text-xs md:text-sm text-muted mt-1">
            Registered renters, verification tiers, and access control
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle" size={16} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs border border-border bg-surface-sunken text-text rounded-xl focus:outline-none focus:border-primary transition-colors placeholder:text-muted"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-surface-sunken/60 text-muted uppercase font-mono font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Trips Booked</th>
                <th className="py-3.5 px-4">Total Spend</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Access Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading user records...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-surface-sunken/40 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-bold text-text">{u.name || 'User'}</p>
                      <p className="text-[10px] text-muted font-mono">{u.email}</p>
                    </td>
                    <td className="py-3 px-4 uppercase font-mono font-bold text-[10px]">
                      <span className={`px-2 py-0.5 rounded ${
                        u.role === 'admin' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-surface-sunken text-muted border border-border'
                      }`}>
                        {u.role || 'user'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-text">{u.totalBookings || 0}</td>
                    <td className="py-3 px-4 font-mono font-bold text-primary">
                      ₹{(u.totalSpent || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 uppercase font-mono">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.status === 'active' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                      }`}>
                        {u.status || 'active'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleStatus(u._id, u.status || 'active')}
                          className={`px-3 py-1 rounded-lg font-bold text-[10px] transition-colors ${
                            u.status === 'suspended'
                              ? 'bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20'
                              : 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border border-rose-500/20'
                          }`}
                        >
                          {u.status === 'suspended' ? 'Activate' : 'Suspend'}
                        </button>
                      )}
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
