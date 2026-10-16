import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/hooks/useTheme';
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  Calendar,
  DollarSign,
  Car
} from 'lucide-react';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import damageService from '@/features/damage/damageService';

const MyDamageReports = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await damageService.getUserDamageReports();
      setReports(response.data || []);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-primary" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-rose-500" />;
      case 'under_review':
        return <Eye className="w-4 h-4 text-accent" />;
      default:
        return <Clock className="w-4 h-4 text-accent" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return 'px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-mono font-bold';
      case 'rejected':
        return 'px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 text-xs font-mono font-bold';
      case 'under_review':
        return 'px-2.5 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20 text-xs font-mono font-bold';
      default:
        return 'px-2.5 py-0.5 rounded-full bg-surface-sunken text-muted border border-border text-xs font-mono font-bold';
    }
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Pending Review',
      under_review: 'Under Review',
      approved: 'Approved',
      rejected: 'Rejected',
      resolved: 'Resolved'
    };
    return texts[status] || status;
  };

  return (
    <div className="min-h-screen bg-bg text-text pb-12 transition-colors duration-300 font-sans">
      <DashboardNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center border border-primary/25 bg-primary/10 shadow-sm shadow-primary/10">
              <AlertTriangle className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-black tracking-tight text-text">
                My Damage Reports
              </h1>
              <p className="text-xs md:text-sm text-muted">
                Track your submitted damage reports, AI diagnostic estimates, and resolution status
              </p>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
          </div>
        ) : reports.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-3xl border border-border bg-surface p-12 text-center shadow-xs"
          >
            <FileText className="w-16 h-16 mx-auto mb-4 text-muted/30" />
            <h3 className="text-xl font-display font-bold text-text mb-2">
              No Damage Reports
            </h3>
            <p className="text-sm text-muted mb-6">
              You haven't submitted any damage reports yet.
            </p>
            <button
              onClick={() => navigate('/mybookings')}
              className="px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-hover transition-colors shadow-md shadow-primary/20 text-xs"
            >
              View My Bookings
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {reports.map((report, idx) => (
              <motion.div
                key={report._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="rounded-3xl border border-border bg-surface p-6 hover:border-primary/40 transition-colors shadow-xs"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(report.status)}
                      <span className={getStatusBadge(report.status)}>
                        {getStatusText(report.status)}
                      </span>
                    </div>
                    <h3 className="text-lg font-display font-bold text-text">
                      {report.car?.brand} {report.car?.model}
                    </h3>
                  </div>
                </div>

                {/* Images */}
                {report.images && report.images.length > 0 && (
                  <div className="mb-4 grid grid-cols-3 gap-2">
                    {report.images.slice(0, 3).map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt="Damage"
                        className="w-full h-24 object-cover rounded-xl border border-border"
                      />
                    ))}
                  </div>
                )}

                {/* Description */}
                <p className="text-xs text-muted mb-4 line-clamp-2">
                  {report.description}
                </p>

                {/* AI Analysis */}
                {report.aiAnalysis && (
                  <div className="mb-4 p-4 rounded-2xl border border-border bg-surface-sunken">
                    <p className="text-[10px] font-mono uppercase font-bold text-muted mb-1">
                      AI Diagnostic Scan
                    </p>
                    <p className="text-xs font-semibold text-text mb-1">
                      {report.aiAnalysis.damageType} • {report.aiAnalysis.severity}
                    </p>
                    <p className="text-xs text-primary font-mono font-bold">
                      Est. Cost: ₹{report.aiAnalysis.estimatedCost?.toLocaleString()}
                    </p>
                  </div>
                )}

                {/* Admin Decision */}
                {report.status === 'approved' && report.actualCost && (
                  <div className="mb-4 p-4 rounded-2xl border border-primary/25 bg-primary/5">
                    <p className="text-xs font-bold text-primary mb-1 flex items-center gap-1.5 font-mono">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Approved by Admin
                    </p>
                    <p className="text-base font-mono font-bold text-primary">
                      Final Cost: ₹{report.actualCost.toLocaleString()}
                    </p>
                    {report.adminNotes && (
                      <p className="text-xs text-muted mt-2">
                        Note: {report.adminNotes}
                      </p>
                    )}
                  </div>
                )}

                {report.status === 'rejected' && report.adminNotes && (
                  <div className="mb-4 p-4 rounded-2xl border border-rose-500/20 bg-rose-500/5">
                    <p className="text-xs font-bold text-rose-500 mb-1 flex items-center gap-1.5 font-mono">
                      <XCircle className="w-3.5 h-3.5" />
                      Claim Dismissed
                    </p>
                    <p className="text-xs text-text">
                      {report.adminNotes}
                    </p>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-xs font-mono text-muted">
                    <Calendar className="w-4 h-4 text-subtle" />
                    {new Date(report.createdAt).toLocaleDateString()}
                  </div>
                  
                  <button
                    onClick={() => navigate(`/damage-report/${report._id}`)}
                    className="px-4 py-2 rounded-xl border border-border bg-surface hover:bg-surface-sunken text-text font-bold transition-colors text-xs flex items-center gap-2 shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5 text-primary" />
                    <span>View Details</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyDamageReports;
