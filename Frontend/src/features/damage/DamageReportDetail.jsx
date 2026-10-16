import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
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
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import damageService from '@/features/damage/damageService';

const DamageReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

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
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-8 h-8 text-primary" />;
      case 'rejected':
        return <XCircle className="w-8 h-8 text-rose-500" />;
      case 'under_review':
        return <Eye className="w-8 h-8 text-accent" />;
      default:
        return <Clock className="w-8 h-8 text-accent" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'text-primary';
      case 'rejected':
        return 'text-rose-500';
      case 'under_review':
        return 'text-accent';
      default:
        return 'text-muted';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center font-sans">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!report) {
    return null;
  }

  return (
    <div className="min-h-screen bg-bg text-text pb-12 transition-colors duration-300 font-sans">
      <DashboardNavbar />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 mb-6 transition font-medium text-muted hover:text-primary"
        >
          <ArrowLeft size={18} /> <span>Back</span>
        </button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-black tracking-tight text-text mb-2">
                Damage Report Details
              </h1>
              <p className="text-xs font-mono text-muted">
                Report ID: #{report._id}
              </p>
            </div>
            {getStatusIcon(report.status)}
          </div>
        </motion.div>

        {/* Status Banner */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`rounded-3xl border p-6 mb-6 ${
            report.status === 'approved' ? 'bg-primary/5 border-primary/25' :
            report.status === 'rejected' ? 'bg-rose-500/5 border-rose-500/25' :
            'bg-accent/5 border-accent/25'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-xs font-mono font-bold uppercase tracking-wider ${getStatusColor(report.status)}`}>
                Status: {report.status.replace('_', ' ').toUpperCase()}
              </p>
              {report.status === 'approved' && report.actualCost && (
                <p className="text-2xl font-mono font-bold text-primary mt-2">
                  Final Cost: ₹{report.actualCost.toLocaleString()}
                </p>
              )}
              {report.adminNotes && (
                <p className="text-xs text-muted mt-2">
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
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-3xl border border-border bg-surface p-6 shadow-xs"
            >
              <h2 className="text-lg font-display font-bold text-text mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-accent" />
                Damage Photos
              </h2>
              {report.images && report.images.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {report.images.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={`Damage ${i + 1}`}
                      className="w-full h-48 object-cover rounded-2xl cursor-pointer hover:opacity-85 transition border border-border"
                      onClick={() => window.open(img, '_blank')}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted">No images uploaded</p>
              )}
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-3xl border border-border bg-surface p-6 shadow-xs"
            >
              <h2 className="text-lg font-display font-bold text-text mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Description
              </h2>
              <p className="text-sm text-text leading-relaxed">
                {report.description}
              </p>
            </motion.div>

            {/* AI Analysis */}
            {report.aiAnalysis && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="rounded-3xl border border-primary/25 bg-primary/5 p-6"
              >
                <h2 className="text-lg font-display font-bold mb-4 text-text flex items-center gap-2">
                  <Sparkles size={18} className="text-primary" />
                  <span>AI Automated Inspection Analysis</span>
                </h2>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="p-3 rounded-2xl bg-surface border border-border">
                    <p className="text-[10px] font-mono font-bold uppercase text-muted mb-1">Damage Type</p>
                    <p className="font-bold text-xs text-text">{report.aiAnalysis.damageType}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-surface border border-border">
                    <p className="text-[10px] font-mono font-bold uppercase text-muted mb-1">Severity</p>
                    <p className="font-bold text-xs text-text">{report.aiAnalysis.severity}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-surface border border-border">
                    <p className="text-[10px] font-mono font-bold uppercase text-muted mb-1">Estimated Cost</p>
                    <p className="font-mono font-bold text-xs text-primary">
                      ₹{report.aiAnalysis.estimatedCost?.toLocaleString()}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  {report.aiAnalysis.description}
                </p>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Info */}
            <motion.div
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-3xl border border-border bg-surface p-6 shadow-xs"
            >
              <h3 className="text-base font-display font-bold text-text mb-4 flex items-center gap-2">
                <Car className="w-5 h-5 text-primary" />
                Vehicle Details
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <p className="font-mono font-bold text-muted">Car</p>
                  <p className="font-bold text-sm text-text">
                    {report.car?.brand} {report.car?.model}
                  </p>
                </div>
                {report.car?.registrationNumber && (
                  <div>
                    <p className="font-mono font-bold text-muted">Registration</p>
                    <p className="font-mono font-bold text-text">
                      {report.car.registrationNumber}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* User Info */}
            <motion.div
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-3xl border border-border bg-surface p-6 shadow-xs"
            >
              <h3 className="text-base font-display font-bold text-text mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-accent" />
                Reported By
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <p className="font-mono font-bold text-muted">Name</p>
                  <p className="font-bold text-text">
                    {report.user?.name}
                  </p>
                </div>
                <div>
                  <p className="font-mono font-bold text-muted">Email</p>
                  <p className="font-mono text-muted">
                    {report.user?.email}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Timeline */}
            <motion.div
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-3xl border border-border bg-surface p-6 shadow-xs"
            >
              <h3 className="text-base font-display font-bold text-text mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-subtle" />
                Timeline
              </h3>
              <div className="space-y-3 text-xs font-mono">
                <div>
                  <p className="font-bold text-muted">Submitted</p>
                  <p className="font-bold text-text">
                    {new Date(report.createdAt).toLocaleString()}
                  </p>
                </div>
                {report.reviewedAt && (
                  <div>
                    <p className="font-bold text-muted">Reviewed</p>
                    <p className="font-bold text-text">
                      {new Date(report.reviewedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Cost Summary */}
            <motion.div
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="rounded-3xl border border-border bg-surface p-6 shadow-xs"
            >
              <h3 className="text-base font-display font-bold text-text mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Cost Summary
              </h3>
              <div className="space-y-3 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-muted">AI Estimate</span>
                  <span className="font-bold text-text">
                    ₹{report.estimatedCost?.toLocaleString()}
                  </span>
                </div>
                {report.actualCost && (
                  <div className="border-t border-border pt-3">
                    <div className="flex justify-between">
                      <span className="text-muted">Final Cost</span>
                      <span className="font-bold text-base text-primary">
                        ₹{report.actualCost.toLocaleString()}
                      </span>
                    </div>
                  </div>
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
