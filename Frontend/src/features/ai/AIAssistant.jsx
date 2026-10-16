import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/hooks/useTheme";
import {
  Sparkles, Send, Trash2, Bot, User, Car,
  Camera, Upload, Shield, AlertTriangle, Image as ImageIcon, X
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { aiService } from '@/features/ai/aiService';
import DashboardNavbar from '@/components/layout/DashboardNavbar';

const AIAssistant = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { isDarkMode } = useTheme();

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hello! I am your RentRide AI Concierge. I can assist you with:\n\n• Finding the perfect vehicle for your travel itinerary\n• Providing insurance and liability policy advice\n• Visual car model recognition from photos\n• Damage inspection analysis and return support\n\nHow can I help you today?",
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
    { id: 'search', icon: Car, label: 'Find Car' },
    { id: 'insurance', icon: Shield, label: 'Insurance Advice' },
    { id: 'recognize', icon: Camera, label: 'Photo Search' },
    { id: 'damage', icon: AlertTriangle, label: 'Damage Guide' },
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
      } else {
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
        text: "I am having temporary trouble connecting to the inference engine. You can browse our verified fleet in the catalog.",
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
      text: "[Uploaded vehicle photo for recognition]",
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
        text: "Could not process this image. Please upload a clear photo of the car exterior.",
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
      alert('Please select trip terrain and duration');
      return;
    }

    setLoading(true);
    const userMessage = {
      role: "user",
      text: `Advise on insurance for a ${insuranceDetails.days}-day ${insuranceDetails.tripType} trip`,
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
        text: "Could not generate insurance advice. Please check the Help & Support center.",
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
        text: "Chat cleared! How can I assist you with your rental journey?",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setActiveFeature(null);
  };

  return (
    <>
      <DashboardNavbar />
      <div className="min-h-screen bg-bg transition-colors duration-300">
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          
          {/* Header */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-primary-soft border border-primary/20 flex items-center justify-center shadow-xs text-primary">
                <Sparkles size={22} />
              </div>
              <div>
                <h1 className="text-2xl font-black text-text font-display">
                  Fleet AI Assistant
                </h1>
                <p className="text-xs text-text-muted">
                  Intelligent recommendations, visual search, and policy advisory.
                </p>
              </div>
            </div>

            <button
              onClick={clearChat}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-surface hover:bg-surface-sunken text-xs font-semibold text-text-muted hover:text-text transition shadow-xs"
            >
              <Trash2 size={13} />
              <span>Clear</span>
            </button>
          </div>

          {/* Chat Container */}
          <div className="rounded-3xl border border-border bg-surface shadow-sm overflow-hidden flex flex-col h-[680px]">
            
            {/* Feature Mode Tabs */}
            <div className="px-5 py-3 border-b border-border bg-surface-subtle flex flex-wrap gap-2">
              {features.map((feat) => {
                const isSelected = activeFeature === feat.id;
                const Icon = feat.icon;
                return (
                  <button
                    key={feat.id}
                    onClick={() => {
                      if (feat.id === 'recognize') {
                        fileInputRef.current?.click();
                      } else {
                        setActiveFeature(isSelected ? null : feat.id);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-primary text-white shadow-xs'
                        : 'bg-surface border border-border text-text-muted hover:border-primary/30 hover:text-text'
                    }`}
                  >
                    <Icon size={14} className={isSelected ? 'text-white' : 'text-primary'} />
                    <span>{feat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Insurance Advice Drawer */}
            <AnimatePresence>
              {activeFeature === 'insurance' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="p-4 border-b border-border bg-surface-sunken overflow-hidden space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary font-mono">Trip Parameters</span>
                    <button onClick={() => setActiveFeature(null)} className="text-text-subtle hover:text-text">
                      <X size={15} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <select
                      value={insuranceDetails.tripType}
                      onChange={(e) => setInsuranceDetails({ ...insuranceDetails, tripType: e.target.value })}
                      className="border border-border rounded-xl px-3 py-2 text-xs font-medium bg-surface text-text outline-none"
                    >
                      <option value="">Trip Terrain</option>
                      <option value="City driving">City Commute</option>
                      <option value="Highway">Interstate Highway</option>
                      <option value="Hills/Mountains">Ghats & Mountains</option>
                    </select>
                    <input
                      type="number"
                      placeholder="Duration (Days)"
                      value={insuranceDetails.days}
                      onChange={(e) => setInsuranceDetails({ ...insuranceDetails, days: parseInt(e.target.value) || 1 })}
                      className="border border-border rounded-xl px-3 py-2 text-xs font-medium bg-surface text-text outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Vehicle category (optional)"
                      value={insuranceDetails.carType}
                      onChange={(e) => setInsuranceDetails({ ...insuranceDetails, carType: e.target.value })}
                      className="border border-border rounded-xl px-3 py-2 text-xs font-medium bg-surface text-text outline-none"
                    />
                    <button
                      onClick={getInsuranceAdvice}
                      disabled={loading}
                      className="bg-primary hover:bg-primary-hover text-white font-bold text-xs py-2 rounded-xl shadow-xs transition disabled:opacity-50"
                    >
                      Analyze Policy
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.map((msg, i) => {
                const isUser = msg.role === "user";
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <div className="w-8 h-8 rounded-full bg-primary-soft text-primary flex items-center justify-center shrink-0 border border-primary/20">
                        <Bot size={16} />
                      </div>
                    )}
                    <div className={`max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed ${
                      isUser
                        ? 'bg-primary text-white rounded-br-xs shadow-xs'
                        : 'bg-surface-sunken border border-border text-text rounded-bl-xs'
                    }`}>
                      {msg.image && (
                        <img src={msg.image} alt="Uploaded" className="rounded-xl max-h-48 mb-2 object-cover" />
                      )}
                      <p className="whitespace-pre-line">{msg.text}</p>
                      <span className={`block text-[10px] font-mono mt-1 text-right ${isUser ? 'text-white/70' : 'text-text-subtle'}`}>
                        {msg.time}
                      </span>
                    </div>
                    {isUser && (
                      <div className="w-8 h-8 rounded-full bg-surface-raised border border-border text-text flex items-center justify-center shrink-0">
                        <User size={16} />
                      </div>
                    )}
                  </motion.div>
                );
              })}

              {loading && (
                <div className="flex gap-3 items-center text-text-muted text-xs">
                  <div className="w-8 h-8 rounded-full bg-primary-soft text-primary flex items-center justify-center shrink-0">
                    <Bot size={16} />
                  </div>
                  <div className="flex gap-1.5 items-center bg-surface-sunken px-4 py-2.5 rounded-2xl border border-border">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse delay-75" />
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse delay-150" />
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="p-4 border-t border-border bg-surface">
              <div className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !loading) sendMessage();
                  }}
                  placeholder={
                    activeFeature === 'search' ? "Describe your travel route (e.g. 7-seater SUV for Goa highway)..." :
                    activeFeature === 'damage' ? "Describe vehicle scratch, dent, or mechanical anomaly..." :
                    "Ask our AI about cars, pricing, or rental terms..."
                  }
                  disabled={loading}
                  className="flex-1 rounded-xl border border-border bg-surface-sunken px-4 py-3 text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-text placeholder-text-subtle"
                />

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className="w-11 h-11 rounded-xl bg-primary hover:bg-primary-hover text-white flex items-center justify-center transition shadow-xs disabled:opacity-40"
                  aria-label="Send message"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default AIAssistant;
