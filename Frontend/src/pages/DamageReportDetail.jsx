import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import {
  ArrowLeft,
  AlertTriangle,
  Calendar,
  Car,
  User,
  FileText,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Sparkles
} from 'lucide-react';
import DashboardNavbar from '../components/layout/DashboardNavbar';
import damageService from '../services/damageService';

const DamageReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [report, setReport] = useState(null);
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
    fetchReport();
  }, [id]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await damageService.getDamageReportById(id);
      setReport(response.data);
    } catch (error) {
      console.error('Failed to fetch report:', error);
      alert('Failed to load damage report details');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-8 h-8 text-red-500" />;
      case 'under_review':
        return <Eye className="w-8 h-8 text-blue-500" />;
      default:
        return <Clock className="w-8 h-8 text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'text-green-500';
      case 'rejected':
        return 'text-red-500';
      case 'under_review':
        return 'text-blue-500';
      default:
        return 'text-yellow-500';
    }
  };

  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: theme.bg }}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!report) {
    return null;
  }

  return (
    <div 
      className="min-h-screen pb-12 transition-colors duration-300"
      style={{ backgroundColor: theme.bg }}
    >
      <DashboardNavbar />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 mb-6 transition font-medium hover:text-orange-500"
          style={{ color: theme.textSecondary }}
        >
          <ArrowLeft size={20} /> Back
        </button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black mb-2" style={{ color: theme.text }}>
                Damage Report Details
              </h1>
              <p style={{ color: theme.textSecondary }}>
                Report ID: {report._id}
              </p>
            </div>
            {getStatusIcon(report.status)}
          </div>
        </motion.div>

        {/* Status Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`rounded-2xl border p-6 mb-6 ${
            report.status === 'approved' ? 'bg-green-50 border-green-200' :
            report.status === 'rejected' ? 'bg-red-50 border-red-200' :
            report.status === 'under_review' ? 'bg-blue-50 border-blue-200' :
            'bg-yellow-50 border-yellow-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-bold uppercase tracking-wider ${getStatusColor(report.status)}`}>
                Status: {report.status.replace('_', ' ').toUpperCase()}
              </p>
              {report.status === 'approved' && report.actualCost && (
                <p className="text-2xl font-black text-green-600 mt-2">
                  Final Cost: ₹{report.actualCost.toLocaleString()}
                </p>
              )}
              {report.adminNotes && (
                <p className={`text-sm mt-2 ${
                  report.status === 'approved' ? 'text-green-700' : 'text-red-700'
                }`}>
                  Admin Note: {report.adminNotes}
                </p>
              )}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl border p-6"
              style={{
                backgroundColor: theme.cardBg,
                borderColor: theme.border
              }}
            >
              <h2 className="text-xl font-black mb-4 flex items-center gap-2" style={{ color: theme.text }}>
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Damage Photos
              </h2>
              {report.images && report.images.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {report.images.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={`Damage ${i + 1}`}
                      className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-80 transition"
                      onClick={() => window.open(img, '_blank')}
                    />
                  ))}
                </div>
              ) : (
                <p style={{ color: theme.textSecondary }}>No images uploaded</p>
              )}
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl border p-6"
              style={{
                backgroundColor: theme.cardBg,
                borderColor: theme.border
              }}
            >
              <h2 className="text-xl font-black mb-4 flex items-center gap-2" style={{ color: theme.text }}>
                <FileText className="w-5 h-5 text-orange-500" />
                Description
              </h2>
              <p className="leading-relaxed" style={{ color: theme.text }}>
                {report.description}
              </p>
            </motion.div>

            {/* AI Analysis */}
            {report.aiAnalysis && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="rounded-2xl border p-6 bg-blue-50"
                style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}
              >
                <h2 className="text-xl font-black mb-4 text-blue-700 flex items-center gap-2">
                  <Sparkles size={20} className="text-blue-600" />
                  <span>AI Automated Inspection Analysis</span>
                </h2>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs font-bold text-blue-600 mb-1">Damage Type</p>
                    <p className="font-bold text-blue-800">{report.aiAnalysis.damageType}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-blue-600 mb-1">Severity</p>
                    <p className="font-bold text-blue-800">{report.aiAnalysis.severity}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-blue-600 mb-1">Estimated Cost</p>
                    <p className="font-bold text-blue-800">
                      ₹{report.aiAnalysis.estimatedCost?.toLocaleString()}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-blue-700">
                  {report.aiAnalysis.description}
                </p>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl border p-6"
              style={{
                backgroundColor: theme.cardBg,
                borderColor: theme.border
              }}
            >
              <h3 className="text-lg font-black mb-4 flex items-center gap-2" style={{ color: theme.text }}>
                <Car className="w-5 h-5 text-orange-500" />
                Vehicle Details
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs font-bold" style={{ color: theme.textSecondary }}>Car</p>
                  <p className="font-bold" style={{ color: theme.text }}>
                    {report.car?.brand} {report.car?.model}
                  </p>
                </div>
                {report.car?.registrationNumber && (
                  <div>
                    <p className="text-xs font-bold" style={{ color: theme.textSecondary }}>Registration</p>
                    <p className="font-bold" style={{ color: theme.text }}>
                      {report.car.registrationNumber}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* User Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl border p-6"
              style={{
                backgroundColor: theme.cardBg,
                borderColor: theme.border
              }}
            >
              <h3 className="text-lg font-black mb-4 flex items-center gap-2" style={{ color: theme.text }}>
                <User className="w-5 h-5 text-orange-500" />
                Reported By
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs font-bold" style={{ color: theme.textSecondary }}>Name</p>
                  <p className="font-bold" style={{ color: theme.text }}>
                    {report.user?.name}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold" style={{ color: theme.textSecondary }}>Email</p>
                  <p className="font-bold" style={{ color: theme.text }}>
                    {report.user?.email}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Timeline */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-2xl border p-6"
              style={{
                backgroundColor: theme.cardBg,
                borderColor: theme.border
              }}
            >
              <h3 className="text-lg font-black mb-4 flex items-center gap-2" style={{ color: theme.text }}>
                <Calendar className="w-5 h-5 text-orange-500" />
                Timeline
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs font-bold" style={{ color: theme.textSecondary }}>Submitted</p>
                  <p className="font-bold" style={{ color: theme.text }}>
                    {new Date(report.createdAt).toLocaleString()}
                  </p>
                </div>
                {report.reviewedAt && (
                  <div>
                    <p className="text-xs font-bold" style={{ color: theme.textSecondary }}>Reviewed</p>
                    <p className="font-bold" style={{ color: theme.text }}>
                      {new Date(report.reviewedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Cost Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="rounded-2xl border p-6"
              style={{
                backgroundColor: theme.cardBg,
                borderColor: theme.border
              }}
            >
              <h3 className="text-lg font-black mb-4 flex items-center gap-2" style={{ color: theme.text }}>
                <DollarSign className="w-5 h-5 text-orange-500" />
                Cost Summary
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span style={{ color: theme.textSecondary }}>AI Estimate</span>
                  <span className="font-bold" style={{ color: theme.text }}>
                    ₹{report.estimatedCost?.toLocaleString()}
                  </span>
                </div>
                {report.actualCost && (
                  <>
                    <div className="border-t pt-3" style={{ borderColor: theme.border }}>
                      <div className="flex justify-between">
                        <span style={{ color: theme.textSecondary }}>Final Cost</span>
                        <span className="font-black text-lg text-green-500">
                          ₹{report.actualCost.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DamageReportDetail;
