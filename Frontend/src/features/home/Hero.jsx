import { Link } from 'react-router-dom'
import { Search, Calendar, MapPin, Zap, Shield, Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import herocar from '@/assets/herocar1.png';
import { FadeRight, FadeLeft } from '@/utils/Animation'

export default function Hero() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  return (
    <section className="relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[520px] h-[520px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[650px] h-[650px] bg-primary/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-20 lg:py-28">
        <div className="flex flex-col lg:flex-row items-center gap-14">

          {/* Left Content */}
          <div className="lg:w-1/2 text-text-primary space-y-6">
            <motion.div
              variants={FadeRight(0.2)}
              initial="hidden"
              animate="visible"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                         bg-primary/10 border border-primary/20
                         text-sm font-bold text-primary"
            >
              Smart rentals • AI powered
            </motion.div>

            <motion.h1
              variants={FadeRight(0.3)}
              initial="hidden"
              animate="visible"
              className="text-4xl md:text-6xl font-black leading-tight tracking-tight"
            >
              Find Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-dark">
                Perfect Ride
              </span>
            </motion.h1>

            <motion.p
              variants={FadeRight(0.4)}
              initial="hidden"
              animate="visible"
              className="text-lg text-text-secondary font-medium leading-relaxed"
            >
              Premium cars at unbeatable prices. AI-powered recommendations, smooth booking, and secure payments.
            </motion.p>

            {/* Feature Pills */}
            <motion.div
              variants={FadeRight(0.5)}
              initial="hidden"
              animate="visible"
              className="flex flex-wrap gap-4"
            >
              {[
                { icon: <Zap size={18} />, text: 'Instant booking' },
                { icon: <Shield size={18} />, text: 'Secure payments' },
                { icon: <Clock size={18} />, text: '24/7 support' }
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl
                             bg-background-secondary border border-border-light text-text-secondary"
                >
                  <span className="text-primary">{item.icon}</span>
                  <span className="text-sm font-bold uppercase tracking-wider">{item.text}</span>
                </div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              variants={FadeRight(0.6)}
              initial="hidden"
              animate="visible"
              className="flex flex-wrap gap-4 pt-2"
            >
              <Link
                to="/browsecars"
                className="bg-primary text-white px-8 py-4 rounded-xl text-lg font-black uppercase tracking-widest shadow-lg shadow-primary/20
                           hover:bg-primary-hover transition-all hover:scale-105 active:scale-95"
              >
                Browse Cars
              </Link>

              <Link
                to="/offers"
                className="border-2 border-primary text-primary px-8 py-4 rounded-xl text-lg font-black uppercase tracking-widest
                           hover:bg-primary hover:text-white transition-all hover:scale-105 active:scale-95"
              >
                View Offers
              </Link>
            </motion.div>
          </div>

          {/* Right Image */}
          <motion.div
            variants={FadeLeft(0.3)}
            initial="hidden"
            animate="visible"
            className="lg:w-1/2 relative"
          >
            <motion.img
              src={herocar}
              alt="Premium Car"
              className="w-full drop-shadow-[0_20px_50px_rgba(16,163,16,0.2)]"
              animate={{ y: [0, -18, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div className="absolute inset-0 -z-10 blur-3xl bg-gradient-to-r from-primary/20 to-primary-hover/10 rounded-full" />
          </motion.div>
        </div>

        {/* Quick Search Card - Only shown after login */}
        {user && (
          <motion.div
            variants={FadeRight(0.7)}
            initial="hidden"
            animate="visible"
            className="bg-white rounded-xl shadow-2xl p-6 max-w-4xl mx-auto mt-16"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  <MapPin size={16} className="inline mr-1" />
                  Location
                </label>
                <input
                  type="text"
                  placeholder="Enter city"
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <Calendar size={16} className="inline mr-1" />
                  Pick-up Date
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <Calendar size={16} className="inline mr-1" />
                  Return Date
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <button className="w-full mt-4 bg-primary hover:bg-primary-hover text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2">
              <Search size={20} />
              Search Available Cars
            </button>
          </motion.div>
        )}
      </div>
    </section>
  )
}
