import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import {
  Sparkles, Send, Trash2, Bot, User, Car,
  Camera, Upload, Shield, AlertTriangle, Image as ImageIcon, X
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { aiService } from "../services/aiService";

const AIAssistant = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { isDarkMode } = useTheme();

  const theme = {
    bg: isDarkMode ? '#0f172a' : '#f8f9fa',
    cardBg: isDarkMode ? '#1e293b' : '#ffffff',
    text: isDarkMode ? '#f1f5f9' : '#1F2937',
    textSecondary: isDarkMode ? '#cbd5e1' : '#6B7280',
    border: isDarkMode ? '#334155' : '#e5e7eb',
    inputBg: isDarkMode ? '#0f172a' : '#f8f9fa',
  };

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hello! I am your RentRide Fleet Assistant. I can assist you with:\n\n• Finding the perfect vehicle for your travel needs\n• Providing insurance and liability guidance\n• Identifying car models and specifications\n• Assisting with damage inspections and return reports\n\nWhat can I assist you with today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeFeature, setActiveFeature] = useState(null);

  const [uploadedImage, setUploadedImage] = useState(null);
  const [insuranceDetails, setInsuranceDetails] = useState({
    tripType: '',
    days: 1,
    carType: '',
    driverExperience: '',
    destination: ''
  });

  const features = [
    { id: 'search', icon: Car, label: 'Find Car', color: 'primary' },
    { id: 'insurance', icon: Shield, label: 'Insurance Help', color: 'blue' },
    { id: 'recognize', icon: Camera, label: 'Image Search', color: 'green' },
    { id: 'damage', icon: AlertTriangle, label: 'Report Damage', color: 'orange' },
  ];

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMessage = {
      role: "user",
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      if (activeFeature === 'search') {
        const response = await aiService.searchCars(text);

        const aiMessage = {
          role: "assistant",
          text: response.data.message,
          recommendations: response.data.recommendations,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages(prev => [...prev, aiMessage]);
      }
      else {
        const response = await aiService.sendMessage(text, messages.slice(1));

        const aiMessage = {
          role: "assistant",
          text: response.data.message,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages(prev => [...prev, aiMessage]);
      }

    } catch (error) {
      const errorMessage = {
        role: "assistant",
        text: "Sorry, I'm having trouble processing that. Please try again or browse cars manually.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setActiveFeature(null);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadedImage(URL.createObjectURL(file));
    setLoading(true);

    const userMessage = {
      role: "user",
      text: "[Uploaded car image]",
      image: URL.createObjectURL(file),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await aiService.recognizeCar(file, 'find_similar');

      const aiMessage = {
        role: "assistant",
        text: response.data.message,
        similarCars: response.data.similarCars,
        analysis: response.data.analysis,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        role: "assistant",
        text: "Couldn't analyze the image. Please upload a clear car photo.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setUploadedImage(null);
    }
  };

  const getInsuranceAdvice = async () => {
    if (!insuranceDetails.tripType || !insuranceDetails.days) {
      alert('Please fill in trip type and duration');
      return;
    }

    setLoading(true);

    const userMessage = {
      role: "user",
      text: `Need insurance advice for ${insuranceDetails.days}-day ${insuranceDetails.tripType} trip`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await aiService.getInsuranceAdvice(insuranceDetails);

      const aiMessage = {
        role: "assistant",
        text: response.data.summary,
        insuranceAdvice: response.data,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        role: "assistant",
        text: "Couldn't generate insurance advice. Please contact support.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setActiveFeature(null);
      setInsuranceDetails({ tripType: '', days: 1, carType: '', driverExperience: '', destination: '' });
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        text: "Chat cleared! How can I assist you now?",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setActiveFeature(null);
  };

  return (
    <div 
      className="min-h-screen pt-20 transition-colors duration-300"
      style={{ backgroundColor: theme.bg }}
    >
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-end justify-between gap-4 mb-8"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center shadow-sm">
              <Sparkles className="w-7 h-7 text-green-500" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight" style={{ color: theme.text }}>
                AI Assistant
              </h1>
              <p className="text-sm mt-1" style={{ color: theme.textSecondary }}>
                Smart car recommendations & instant help
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={clearChat}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border font-bold hover:bg-opacity-50 transition shadow-sm"
              style={{
                backgroundColor: theme.cardBg,
                borderColor: theme.border,
                color: theme.text
              }}
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </button>
          </div>
        </motion.div>

        {/* Chat Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl border shadow-xl overflow-hidden flex flex-col h-[750px]"
          style={{
            backgroundColor: theme.cardBg,
            borderColor: theme.border
          }}
        >
          {/* Feature Tabs */}
          <div 
            className="px-6 py-4 border-b flex flex-wrap gap-2"
            style={{
              backgroundColor: theme.inputBg,
              borderColor: theme.border
            }}
          >
            {features.map((feature) => (
              <button
                key={feature.id}
                onClick={() => {
                  setActiveFeature(feature.id);
                  if (feature.id === 'recognize') {
                    fileInputRef.current?.click();
                  }
                }}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all border shadow-sm ${
                  activeFeature === feature.id
                    ? 'bg-green-500 text-white border-green-500 shadow-green-500/20'
                    : 'hover:border-green-500/30'
                }`}
                style={
                  activeFeature !== feature.id
                    ? {
                        backgroundColor: theme.cardBg,
                        borderColor: theme.border,
                        color: theme.textSecondary,
                      }
                    : {}
                }
              >
                <feature.icon className="w-4 h-4" />
                {feature.label}
              </button>
            ))}
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-8 py-8 space-y-6">
            {messages.map((m, idx) => {
              const isUser = m.role === "user";
              return (
                <div
                  key={idx}
                  className={`flex items-start gap-4 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-md ${
                      isUser ? "bg-green-500 text-white" : "border text-green-500"
                    }`}
                    style={!isUser ? { backgroundColor: theme.cardBg, borderColor: theme.border } : {}}
                  >
                    {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                  </div>

                  <div className={`max-w-[80%] ${isUser ? "text-right" : "text-left"}`}>
                    <p className="text-[11px] mb-1.5 font-bold uppercase tracking-wider" style={{ color: theme.textSecondary }}>
                      {m.role} • {m.time}
                    </p>

                    <div
                      className={`px-5 py-4 rounded-2xl shadow-sm border ${
                        isUser
                          ? "rounded-tr-none bg-green-500 text-white border-green-500"
                          : "rounded-tl-none"
                      }`}
                      style={!isUser ? { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border } : {}}
                    >
                      {m.image && (
                        <div className="rounded-xl overflow-hidden mb-3 border border-white/20 shadow-lg max-w-sm">
                          <img src={m.image} alt="Uploaded" className="w-full h-auto" />
                        </div>
                      )}
                      <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>

                      {/* AI Enhanced Content */}
                      {m.recommendations && m.recommendations.length > 0 && (
                        <div className="mt-5 space-y-3">
                          {m.recommendations.slice(0, 3).map((rec, i) => (
                            <div 
                              key={i} 
                              className="rounded-xl p-4 border shadow-sm hover:border-green-500/50 transition-colors"
                              style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <p className="font-black text-green-500 text-lg">{rec.carName}</p>
                                <p className="font-black bg-green-500/10 px-2 py-1 rounded text-sm" style={{ color: theme.text }}>
                                  {rec.price}
                                </p>
                              </div>
                              <p className="text-sm mb-3" style={{ color: theme.textSecondary }}>{rec.reason}</p>
                              <div className="flex flex-wrap gap-1.5">
                                {rec.highlights?.slice(0, 3).map((h, j) => (
                                  <span 
                                    key={j} 
                                    className="text-[10px] px-2 py-1 rounded-lg border font-bold"
                                    style={{
                                      backgroundColor: theme.inputBg,
                                      borderColor: theme.border,
                                      color: theme.textSecondary
                                    }}
                                  >
                                    {h}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Insurance Logic */}
                      {m.insuranceAdvice && (
                        <div className="mt-5 space-y-3">
                          <p className="font-black text-sm uppercase tracking-widest mb-2 flex items-center gap-2" style={{ color: theme.text }}>
                            <Shield className="w-4 h-4 text-green-500" />
                            Recommended Coverage
                          </p>
                          {m.insuranceAdvice.recommended?.slice(0, 3).map((item, i) => (
                            <div 
                              key={i} 
                              className="rounded-xl p-4 border shadow-sm"
                              style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <p className="font-bold" style={{ color: theme.text }}>{item.item}</p>
                                  <p className="text-xs mt-1" style={{ color: theme.textSecondary }}>{item.reason}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-black text-green-500">{item.price}</p>
                                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase ${
                                    item.priority === 'Must Have' ? 'bg-red-50 text-red-600 border border-red-100' :
                                    item.priority === 'Good to Have' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                    'bg-green-50 text-green-600 border border-green-100'
                                  }`}>
                                    {item.priority}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                          <div className="bg-green-500 rounded-xl p-4 text-white shadow-lg shadow-green-500/20 mt-4 flex justify-between items-center">
                            <p className="font-bold">Total Annual Estimate</p>
                            <p className="text-xl font-black">{m.insuranceAdvice.totalEstimate}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-4 justify-start">
                <div 
                  className="w-10 h-10 rounded-full border flex items-center justify-center shadow-md"
                  style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
                >
                  <Bot className="w-5 h-5 text-green-500 animate-pulse" />
                </div>
                <div 
                  className="px-5 py-3 rounded-2xl rounded-tl-none border"
                  style={{ backgroundColor: theme.inputBg, borderColor: theme.border }}
                >
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-green-500/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-green-500/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Form Overlay */}
          <AnimatePresence>
            {activeFeature === 'insurance' && (
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="px-8 pb-6 border-t pt-6"
                style={{
                  backgroundColor: theme.cardBg,
                  borderColor: theme.border
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-black uppercase tracking-widest flex items-center gap-2" style={{ color: theme.text }}>
                    <Shield className="w-5 h-5 text-green-500" />
                    Insurance Advisor Form
                  </p>
                  <button 
                    onClick={() => setActiveFeature(null)} 
                    className="hover:opacity-70 transition-colors"
                    style={{ color: theme.textSecondary }}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <select
                    value={insuranceDetails.tripType}
                    onChange={(e) => setInsuranceDetails({ ...insuranceDetails, tripType: e.target.value })}
                    className="border rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-green-500/20 outline-none transition-all"
                    style={{
                      backgroundColor: theme.inputBg,
                      borderColor: theme.border,
                      color: theme.text
                    }}
                  >
                    <option value="">Trip Type</option>
                    <option value="City driving">City Driving</option>
                    <option value="Highway">Highway</option>
                    <option value="Hills/Mountains">Hills/Mountains</option>
                    <option value="Off-road">Off-road</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Duration (Days)"
                    value={insuranceDetails.days}
                    onChange={(e) => setInsuranceDetails({ ...insuranceDetails, days: parseInt(e.target.value) || 1 })}
                    className="border rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-green-500/20 outline-none transition-all"
                    style={{
                      backgroundColor: theme.inputBg,
                      borderColor: theme.border,
                      color: theme.text
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Car Model (optional)"
                    value={insuranceDetails.carType}
                    onChange={(e) => setInsuranceDetails({ ...insuranceDetails, carType: e.target.value })}
                    className="border rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-green-500/20 outline-none transition-all"
                    style={{
                      backgroundColor: theme.inputBg,
                      borderColor: theme.border,
                      color: theme.text
                    }}
                  />
                  <button
                    onClick={getInsuranceAdvice}
                    disabled={loading}
                    className="bg-green-500 text-white font-black py-3 rounded-xl hover:bg-green-600 shadow-lg shadow-green-500/20 transition-all disabled:opacity-50"
                  >
                    Get Advice
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input Area */}
          <div 
            className="px-8 py-6 border-t"
            style={{
              backgroundColor: theme.cardBg,
              borderColor: theme.border
            }}
          >
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !loading) sendMessage();
                  }}
                  placeholder={
                    activeFeature === 'search' ? "Describe your perfect car (e.g. SUV for family trip to hills)..." :
                    activeFeature === 'damage' ? "Describe the car damage..." :
                    "Ask me anything about RentRide..."
                  }
                  disabled={loading}
                  className="w-full border rounded-2xl px-6 py-4 focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/5 transition-all disabled:opacity-50 font-medium"
                  style={{
                    backgroundColor: theme.inputBg,
                    borderColor: theme.border,
                    color: theme.text
                  }}
                />
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              <motion.button
                whileHover={{ scale: loading ? 1 : 1.05 }}
                whileTap={{ scale: loading ? 1 : 0.95 }}
                onClick={sendMessage}
                disabled={loading}
                className="h-14 w-14 rounded-2xl bg-green-500 text-white flex items-center justify-center shadow-lg shadow-green-500/20 hover:bg-green-600 transition-all disabled:opacity-50"
              >
                <Send className="w-6 h-6" />
              </motion.button>
            </div>

            <div className="mt-3 flex items-center gap-4 text-[11px] font-bold uppercase tracking-widest pl-2" style={{ color: theme.textSecondary }}>
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-green-500" />
                Secure Chat
              </span>
              <span className="w-1 h-1 rounded-full" style={{ backgroundColor: theme.border }}></span>
              <span>
                {activeFeature === 'search' ? 'Recommendation Mode' :
                 activeFeature === 'recognize' ? 'Visual Identification Mode' :
                 'AI Powered Assistant'}
              </span>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default AIAssistant;
