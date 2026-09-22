import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
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
import DashboardNavbar from '../components/layout/DashboardNavbar';
import damageService from '../services/damageService';

const MyDamageReports = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const theme = {
    bg: isDarkMode ? '#0f172a' : '#f8f9fa',
    cardBg: isDarkMode ? '#1e293b' : '#ffffff',
    text: isDarkMode ? '#f1f5f9' : '#1F2937',
    textSecondary: isDarkMode ? '#cbd5e1' : '#6B7280',
    border: isDarkMode ? '#334155' : '#e5e7eb',
    inputBg: isDarkMode ? '#0f172a' : '#f8f9fa',
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await damageService.getUserDamageReports();
      setReports(response.data);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      alert('Failed to load damage reports');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'under_review':
        return <Eye className="w-5 h-5 text-blue-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold border border-yellow-200',
      under_review: 'px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200',
      approved: 'px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold border border-green-200',
      rejected: 'px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold border border-red-200',
      resolved: 'px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-bold border border-gray-200'
    };
    return badges[status] || badges.pending;
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
    <div 
      className="min-h-screen pb-12 transition-colors duration-300"
      style={{ backgroundColor: theme.bg }}
    >
      <DashboardNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center border"
              style={{
                backgroundColor: 'rgba(249, 115, 22, 0.1)',
                borderColor: 'rgba(249, 115, 22, 0.3)'
              }}
            >
              <AlertTriangle className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black" style={{ color: theme.text }}>
                My Damage Reports
              </h1>
              <p style={{ color: theme.textSecondary }}>
                Track your submitted damage reports and their status
              </p>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : reports.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl border p-12 text-center"
            style={{
              backgroundColor: theme.cardBg,
              borderColor: theme.border
            }}
          >
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" style={{ color: theme.textSecondary }} />
            <h3 className="text-xl font-bold mb-2" style={{ color: theme.text }}>
              No Damage Reports
            </h3>
            <p className="mb-6" style={{ color: theme.textSecondary }}>
              You haven't submitted any damage reports yet
            </p>
            <button
              onClick={() => navigate('/mybookings')}
              className="px-6 py-3 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600 transition"
            >
              View My Bookings
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {reports.map((report, idx) => (
              <motion.div
                key={report._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="rounded-2xl border p-6 hover:border-orange-500/30 transition-colors"
                style={{
                  backgroundColor: theme.cardBg,
                  borderColor: theme.border
                }}
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
                    <h3 className="text-lg font-bold" style={{ color: theme.text }}>
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
                        className="w-full h-24 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}

                {/* Description */}
                <p className="text-sm mb-4 line-clamp-2" style={{ color: theme.textSecondary }}>
                  {report.description}
                </p>

                {/* AI Analysis */}
                {report.aiAnalysis && (
                  <div 
                    className="mb-4 p-4 rounded-xl border"
                    style={{
                      backgroundColor: theme.inputBg,
                      borderColor: theme.border
                    }}
                  >
                    <p className="text-xs font-bold mb-1" style={{ color: theme.textSecondary }}>
                      AI Analysis
                    </p>
                    <p className="text-sm font-semibold mb-1" style={{ color: theme.text }}>
                      {report.aiAnalysis.damageType} • {report.aiAnalysis.severity}
                    </p>
                    <p className="text-xs text-green-500 font-bold">
                      Est. Cost: ₹{report.aiAnalysis.estimatedCost?.toLocaleString()}
                    </p>
                  </div>
                )}

                {/* Admin Decision */}
                {report.status === 'approved' && report.actualCost && (
                  <div 
                    className="mb-4 p-4 rounded-xl border border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800/40"
                  >
                    <p className="text-xs font-bold text-green-700 dark:text-green-400 mb-1 flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                      Approved by Admin
                    </p>
                    <p className="text-lg font-black text-green-600 dark:text-green-400">
                      Final Cost: ₹{report.actualCost.toLocaleString()}
                    </p>
                    {report.adminNotes && (
                      <p className="text-xs text-green-700 dark:text-green-300 mt-2">
                        Note: {report.adminNotes}
                      </p>
                    )}
                  </div>
                )}

                {report.status === 'rejected' && report.adminNotes && (
                  <div 
                    className="mb-4 p-4 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800/40"
                  >
                    <p className="text-xs font-bold text-red-700 dark:text-red-400 mb-1 flex items-center gap-1.5">
                      <XCircle className="w-3.5 h-3.5 text-red-600" />
                      Rejected
                    </p>
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {report.adminNotes}
                    </p>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: theme.border }}>
                  <div className="flex items-center gap-2 text-xs" style={{ color: theme.textSecondary }}>
                    <Calendar className="w-4 h-4" />
                    {new Date(report.createdAt).toLocaleDateString()}
                  </div>
                  
                  <button
                    onClick={() => navigate(`/damage-report/${report._id}`)}
                    className="px-4 py-2 rounded-xl border font-bold hover:bg-opacity-50 transition text-sm flex items-center gap-2"
                    style={{
                      backgroundColor: theme.cardBg,
                      borderColor: theme.border,
                      color: theme.text
                    }}
                  >
                    <Eye className="w-4 h-4" />
                    View Details
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
