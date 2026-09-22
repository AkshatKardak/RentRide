import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle2, XCircle, Eye, ShieldAlert, Image as ImageIcon, X } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

export default function DamageManagement() {
  const { isDarkMode } = useTheme();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    fetchDamageReports();
  }, []);

  const fetchDamageReports = async () => {
    try {
      setLoading(true);
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await axios.get(`${baseUrl}/admin/damage`, { headers });
      if (res.data?.success) {
        setReports(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching damage reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateClaim = async (reportId, status) => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      await axios.patch(`${baseUrl}/damages/${reportId}/status`, { status }, { headers });
      toast.success(`Claim status updated to ${status}`);
      setReports(prev => prev.map(r => r._id === reportId ? { ...r, status } : r));
      setSelectedReport(null);
    } catch (err) {
      toast.error('Failed to update claim');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-black tracking-tight">Damage Inspections & Claims</h1>
        <p className="text-xs md:text-sm text-slate-500 mt-1">
          Human verification of vehicle return inspections, dispute resolution, and security deposits
        </p>
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
                <th className="py-3.5 px-4">Claim ID</th>
                <th className="py-3.5 px-4">Vehicle</th>
                <th className="py-3.5 px-4">Renter</th>
                <th className="py-3.5 px-4">Severity</th>
                <th className="py-3.5 px-4">Estimated Repair</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-inherit">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading damage reports...
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No pending damage inspections on record
                  </td>
                </tr>
              ) : (
                reports.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-500/5 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-400">
                      #{r._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="py-3 px-4 font-bold">
                      {r.car?.brand} {r.car?.model || 'Vehicle'}
                    </td>
                    <td className="py-3 px-4">{r.user?.name || 'Customer'}</td>
                    <td className="py-3 px-4 uppercase">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.overallSeverity === 'critical' ? 'bg-rose-500/10 text-rose-500' :
                        r.overallSeverity === 'high' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'
                      }`}>
                        {r.overallSeverity || 'moderate'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-500">
                      ₹{(r.estimatedRepairCost || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 uppercase">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' :
                        r.status === 'rejected' ? 'bg-slate-500/10 text-slate-400' : 'bg-amber-500/10 text-amber-500'
                      }`}>
                        {r.status || 'pending'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedReport(r)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 font-bold hover:bg-emerald-500/20 transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-2xl p-6 rounded-3xl border shadow-2xl space-y-4 ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between border-b pb-3 border-inherit">
              <h3 className="font-bold text-lg">Damage Inspection Review</h3>
              <button onClick={() => setSelectedReport(null)} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-slate-400">Vehicle</p>
                <p className="font-bold text-sm">{selectedReport.car?.brand} {selectedReport.car?.model}</p>
              </div>
              <div>
                <p className="text-slate-400">Renter</p>
                <p className="font-bold text-sm">{selectedReport.user?.name} ({selectedReport.user?.email})</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-400 mb-1">Inspection Notes</p>
              <p className="text-xs p-3 rounded-xl bg-slate-500/5 font-medium">
                {selectedReport.description || 'Inspection submitted upon vehicle drop-off.'}
              </p>
            </div>

            {selectedReport.images && selectedReport.images.length > 0 && (
              <div>
                <p className="text-xs text-slate-400 mb-2">Inspection Photos</p>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {selectedReport.images.map((img, i) => (
                    <img key={i} src={img} alt="Damage" className="w-32 h-24 object-cover rounded-xl border" />
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-inherit">
              <span className="text-xs font-bold text-emerald-500">
                Repair Assessment: ₹{(selectedReport.estimatedRepairCost || 0).toLocaleString()}
              </span>

              <div className="flex gap-2">
                <button
                  onClick={() => handleUpdateClaim(selectedReport._id, 'rejected')}
                  className="px-4 py-2 rounded-xl border border-rose-500/30 text-rose-500 font-bold text-xs hover:bg-rose-500/10"
                >
                  Dismiss / Release Deposit
                </button>
                <button
                  onClick={() => handleUpdateClaim(selectedReport._id, 'approved')}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs"
                >
                  Approve Claim
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
