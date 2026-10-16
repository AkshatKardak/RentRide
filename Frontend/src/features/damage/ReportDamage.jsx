import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';
import {
  Camera,
  Upload,
  X,
  AlertCircle,
  CheckCircle,
  Loader,
  ArrowLeft,
  Image as ImageIcon
} from 'lucide-react';
import axios from 'axios';
import DashboardNavbar from '@/components/layout/DashboardNavbar';

const ReportDamage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const [images, setImages] = useState([]);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (images.length + files.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }

    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36)
    }));

    setImages(prev => [...prev, ...newImages]);
    setError('');
  };

  const removeImage = (id) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const analyzeWithAI = async () => {
    if (images.length === 0) {
      setError('Please upload at least one image');
      return;
    }

    try {
      setAnalyzing(true);
      setError('');

      const formData = new FormData();
      images.forEach(img => {
        formData.append('images', img.file);
      });

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/damages/analyze-ai`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          },
          withCredentials: true
        }
      );

      if (response.data.success) {
        setAiAnalysis(response.data.data);
      }
    } catch (err) {
      console.error('AI Analysis error:', err);
      setError('Failed to analyze images. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (images.length === 0) {
      setError('Please upload at least one image');
      return;
    }

    if (!description.trim()) {
      setError('Please provide a description');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const formData = new FormData();
      formData.append('bookingId', bookingId);
      formData.append('description', description);
      
      if (aiAnalysis) {
        formData.append('aiAnalysis', JSON.stringify(aiAnalysis));
      }

      images.forEach(img => {
        formData.append('images', img.file);
      });

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/damages`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          },
          withCredentials: true
        }
      );

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/mybookings');
        }, 2000);
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.response?.data?.message || 'Failed to submit damage report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DashboardNavbar />
      <div className="min-h-screen bg-bg text-text pb-12 transition-colors duration-300 font-sans">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
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
            <h1 className="text-3xl md:text-4xl font-display font-black tracking-tight text-text mb-2">
              Report Vehicle Damage
            </h1>
            <p className="text-muted text-sm">
              Upload photos and describe the incident. Our AI diagnostic system will inspect and generate an immediate assessment.
            </p>
          </motion.div>

          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-3xl border border-border bg-surface p-8 text-center shadow-lg"
            >
              <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-display font-bold text-text mb-2">
                Report Submitted Successfully!
              </h2>
              <p className="text-muted text-sm">
                Our fleet operations team will review your report and update the deposit escrow status.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Image Upload Section */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-3xl border border-border bg-surface p-6 mb-6 shadow-xs"
              >
                <h2 className="text-lg font-display font-bold text-text mb-4 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-primary" />
                  Upload Damage Photos
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  {images.map(img => (
                    <div key={img.id} className="relative group rounded-2xl overflow-hidden border border-border bg-surface-sunken">
                      <img 
                        src={img.preview}
                        alt="Damage"
                        className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-105"
                      />

                      {/* Laser AI Scanning Overlay */}
                      {analyzing && (
                        <div className="absolute inset-0 bg-overlay/80 backdrop-blur-xs z-10 flex flex-col justify-between p-2">
                          <div className="flex items-center justify-between text-[9px] font-mono text-accent font-bold uppercase tracking-wider">
                            <span className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                              Scanning
                            </span>
                            <span className="text-primary font-bold">AI Active</span>
                          </div>

                          <motion.div
                            animate={{ y: [-40, 80, -40] }}
                            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                            className="w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_12px_rgba(163,79,50,0.8)]"
                          />

                          <div className="text-[8px] font-mono text-muted text-center tracking-widest uppercase">
                            Analyzing Matrix
                          </div>
                        </div>
                      )}

                      {!analyzing && (
                        <button
                          type="button"
                          onClick={() => removeImage(img.id)}
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-rose-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-rose-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}

                  {images.length < 5 && (
                    <label 
                      className="h-32 rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-all hover:bg-primary/5 group"
                    >
                      <Upload className="w-6 h-6 mb-2 text-muted group-hover:text-primary group-hover:scale-110 transition-all" />
                      <span className="text-xs font-bold text-muted group-hover:text-text">
                        Upload Photo
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <p className="text-xs text-muted font-mono">
                  Upload up to 5 photos. Formats: JPG, PNG. Max: 5MB per image.
                </p>

                {images.length > 0 && !aiAnalysis && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={analyzeWithAI}
                    disabled={analyzing}
                    className="mt-4 px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold transition-all disabled:opacity-50 flex items-center gap-2 shadow-md shadow-primary/25 text-xs"
                  >
                    {analyzing ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        <span>AI Diagnostic Scan in Progress...</span>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-4 h-4" />
                        <span>Analyze with AI Diagnostic</span>
                      </>
                    )}
                  </motion.button>
                )}
              </motion.div>

              {/* AI Analysis Results */}
              {aiAnalysis && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-3xl border border-primary/30 bg-primary/5 p-6 mb-6 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-4 border-b border-primary/20 pb-3">
                    <h3 className="text-base font-display font-black flex items-center gap-2 text-text">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      AI Inspection Assessment
                    </h3>
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold uppercase">
                      Automated Report
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div className="p-3.5 rounded-2xl border border-border bg-surface">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider block mb-1 text-muted">
                        Damage Classification
                      </span>
                      <p className="font-bold text-sm text-text">
                        {aiAnalysis.damageType || 'Surface Damage'}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl border border-border bg-surface">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider block mb-1 text-muted">
                        Estimated Severity
                      </span>
                      <p className={`font-bold text-sm capitalize ${
                        String(aiAnalysis.severity).toLowerCase() === 'high' ? 'text-rose-500' :
                        String(aiAnalysis.severity).toLowerCase() === 'medium' ? 'text-accent' : 'text-primary'
                      }`}>
                        {aiAnalysis.severity || 'Minor'}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl border border-border bg-surface">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider block mb-1 text-muted">
                        Estimated Cost
                      </span>
                      <p className="font-mono font-bold text-base text-primary">
                        ₹{Number(aiAnalysis.estimatedCost || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {aiAnalysis.description && (
                    <div className="p-3.5 rounded-2xl border border-border bg-surface/70">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider block mb-1 text-muted">
                        Detailed AI Findings
                      </span>
                      <p className="text-xs text-text leading-relaxed">
                        {aiAnalysis.description}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Description */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-3xl border border-border bg-surface p-6 mb-6 shadow-xs"
              >
                <h2 className="text-lg font-display font-bold text-text mb-4">
                  Describe the Damage
                </h2>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please provide details about what happened, when it occurred, and any other relevant incident notes..."
                  rows={5}
                  className="w-full rounded-2xl border border-border bg-surface-sunken p-4 text-sm text-text focus:outline-none focus:border-primary transition-colors resize-none placeholder:text-muted"
                />
              </motion.div>

              {/* Error Message */}
              {error && (
                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 mb-6 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                  <p className="text-xs text-rose-500 font-semibold">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading || images.length === 0}
                whileHover={{ scale: loading ? 1 : 1.01 }}
                whileTap={{ scale: loading ? 1 : 0.99 }}
                className="w-full py-4 rounded-2xl bg-primary text-white font-bold hover:bg-primary-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary/25 text-sm"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Submitting Report...</span>
                  </>
                ) : (
                  'Submit Damage Report'
                )}
              </motion.button>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default ReportDamage;