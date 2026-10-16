import React, { useState } from 'react'
import banner from '@/assets/banner.jpg';
import { motion } from 'framer-motion'
import { Send, CheckCircle2 } from 'lucide-react'
import { Reveal } from '@/components/fx';
import { toast } from 'react-hot-toast';

const Banner = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    toast.success('Thank you! Our concierge team will reach out shortly.');
    setTimeout(() => {
      e.target.reset();
      setSubmitted(false);
    }, 3000);
  };

  return (
    <section id="contact" className="relative overflow-hidden bg-bg">
      <div className="absolute inset-0 pointer-events-none">
        <img
          src={banner}
          alt="Banner vehicle backdrop"
          className="w-full h-full object-cover opacity-15 dark:opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/85 to-primary/20" />
      </div>

      <div className="relative min-h-[580px] flex items-center justify-end px-4 lg:px-16 max-w-7xl mx-auto py-20 z-10">
        <Reveal direction="left" delay={0.2} className="w-full max-w-lg">
          <div className="bg-surface/95 backdrop-blur-xl border border-border rounded-3xl p-8 space-y-6 shadow-2xl">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-accent font-mono">Direct Support</span>
              <h2 className="text-3xl font-black text-text font-display mt-1">
                Connect With Concierge
              </h2>
              <p className="text-xs text-text-muted mt-1">Custom corporate fleet inquiries, long-term rentals, or bespoke delivery.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-text text-xs">First Name</label>
                  <input
                    className="p-3 rounded-xl bg-surface-sunken border border-border text-text placeholder-text-subtle text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    type="text"
                    name="firstName"
                    placeholder="Aarav"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-text text-xs">Last Name</label>
                  <input
                    className="p-3 rounded-xl bg-surface-sunken border border-border text-text placeholder-text-subtle text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    type="text"
                    name="lastName"
                    placeholder="Sharma"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-text text-xs">Email Address</label>
                <input
                  className="p-3 rounded-xl bg-surface-sunken border border-border text-text placeholder-text-subtle text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  type="email"
                  name="email"
                  placeholder="aarav.sharma@example.com"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-text text-xs">Mobile Number</label>
                <input
                  className="p-3 rounded-xl bg-surface-sunken border border-border text-text placeholder-text-subtle text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  type="tel"
                  name="phone"
                  placeholder="+91 98765 43210"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-text text-xs">Trip Requirements</label>
                <textarea
                  className="p-3 rounded-xl bg-surface-sunken border border-border text-text placeholder-text-subtle text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all min-h-[90px] resize-none"
                  name="message"
                  placeholder="Rental dates, vehicle preferences, delivery location..."
                  required
                />
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-primary/25 text-xs uppercase tracking-wider"
              >
                {submitted ? (
                  <>
                    <CheckCircle2 size={16} />
                    Message Sent
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Submit Request
                  </>
                )}
              </motion.button>
            </form>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

export default Banner
