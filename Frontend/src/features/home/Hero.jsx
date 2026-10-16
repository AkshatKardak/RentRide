import React from 'react'
import { Link } from 'react-router-dom'
import { Search, Calendar, MapPin, Zap, Shield, Clock, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import herocar from '@/assets/herocar1.png';
import { Reveal, HoverLift } from '@/components/fx';
import { getStoredItem } from '@/lib/safeStorage';

export default function Hero() {
  const user = getStoredItem('user', null);

  return (
    <section id="hero" className="relative overflow-hidden bg-bg">
      {/* Background Decor Scrims */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[-15%] left-[-10%] w-[550px] h-[550px] bg-primary/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[680px] h-[680px] bg-accent/10 rounded-full blur-[160px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-16 lg:py-24">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

          {/* Left Content */}
          <div className="lg:w-1/2 space-y-6">
            <Reveal direction="down" delay={0.1}>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-soft border border-primary/20 text-xs font-semibold text-primary tracking-wide">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Smart Rentals • AI Powered Fleet
              </div>
            </Reveal>

            <Reveal direction="right" delay={0.2}>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.08] tracking-tight text-text font-display">
                Drive Your
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-hover to-accent">
                  Perfect Journey
                </span>
              </h1>
            </Reveal>

            <Reveal direction="right" delay={0.3}>
              <p className="text-base sm:text-lg text-text-muted leading-relaxed font-sans max-w-xl">
                Premium vehicles across India with verified health records, dynamic transparent pricing, and instant booking without security hassle.
              </p>
            </Reveal>

            {/* Feature Pills */}
            <Reveal direction="right" delay={0.4}>
              <div className="flex flex-wrap gap-3 pt-1">
                {[
                  { icon: <Zap size={16} />, text: 'Instant Approval' },
                  { icon: <Shield size={16} />, text: '100% Insured' },
                  { icon: <Clock size={16} />, text: '24/7 Roadside Assist' }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-surface-raised border border-border text-text-muted shadow-xs text-xs font-semibold"
                  >
                    <span className="text-primary">{item.icon}</span>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </Reveal>

            {/* CTA Buttons */}
            <Reveal direction="up" delay={0.5}>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/browsecars"
                  className="px-7 py-3.5 rounded-xl text-sm font-bold bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] inline-flex items-center gap-2"
                >
                  <span>Explore Fleet</span>
                  <ArrowRight size={16} />
                </Link>

                <Link
                  to="/offers"
                  className="px-6 py-3.5 rounded-xl text-sm font-semibold border border-border hover:border-primary/40 bg-surface text-text hover:text-primary transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  View Promo Offers
                </Link>
              </div>
            </Reveal>
          </div>

          {/* Right Image */}
          <div className="lg:w-1/2 relative flex items-center justify-center">
            <Reveal direction="left" delay={0.3} className="w-full">
              <div className="relative">
                <motion.img
                  src={herocar}
                  alt="Premium Luxury Car"
                  className="w-full max-w-lg lg:max-w-full mx-auto drop-shadow-2xl relative z-10"
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                />
                <div className="absolute inset-0 -z-10 blur-3xl bg-gradient-to-tr from-primary/25 to-accent/20 rounded-full scale-90" />
              </div>
            </Reveal>
          </div>
        </div>

        {/* Quick Search Card */}
        {user && (
          <Reveal direction="up" delay={0.6}>
            <div className="bg-surface rounded-2xl shadow-xl border border-border p-6 max-w-4xl mx-auto mt-12 transition-all">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-2">
                    <MapPin size={14} className="inline mr-1 text-primary" />
                    City or Airport
                  </label>
                  <input
                    type="text"
                    placeholder="Mumbai, Bangalore, Delhi..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface-sunken text-text placeholder-text-subtle text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-2">
                    <Calendar size={14} className="inline mr-1 text-primary" />
                    Pick-up Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface-sunken text-text text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-2">
                    <Calendar size={14} className="inline mr-1 text-primary" />
                    Drop-off Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface-sunken text-text text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>

              <Link
                to="/browsecars"
                className="w-full mt-5 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md shadow-primary/20 transition-all"
              >
                <Search size={16} />
                Find Available Vehicles
              </Link>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  )
}
