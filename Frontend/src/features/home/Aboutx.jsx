import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';
import { Reveal } from '@/components/fx';
import supercar from '@/assets/Supercar-PNG-Photo-Image.png';
import maintenance from '@/assets/maintenance.png';
import steering from '@/assets/steering.png';
import battery from '@/assets/battery.png';
import tyre from '@/assets/tyre.png';

const Aboutx = () => {
  const { isDarkMode } = useTheme();

  const features = [
    {
      icon: tyre,
      title: "Performance Tires",
      desc: "High-spec compound tires rigorously checked for tread depth and all-weather road grip.",
      position: "top-2 left-2 lg:top-8 lg:left-4"
    },
    {
      icon: maintenance,
      title: "180-Point Check",
      desc: "Regular multi-stage servicing ensuring powertrain, brakes, and fluids remain in optimal condition.",
      position: "top-2 right-2 lg:top-8 lg:right-4"
    },
    {
      icon: steering,
      title: "Calibrated Handling",
      desc: "Precision aligned steering and electronic stability programs for effortless control.",
      position: "bottom-2 left-2 lg:bottom-8 lg:left-4"
    },
    {
      icon: battery,
      title: "Health Passport",
      desc: "Every vehicle is tracked via real-time telemetry and a tamper-proof maintenance log.",
      position: "bottom-2 right-2 lg:bottom-8 lg:right-4"
    }
  ];

  return (
    <section 
      id="about" 
      className="py-24 relative overflow-hidden bg-bg-subtle transition-colors duration-300"
    >
      {/* Background Decor */}
      <div className="absolute top-20 left-10 w-80 h-80 bg-primary/10 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-[450px] h-[450px] bg-accent/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Section Title */}
        <Reveal direction="down" delay={0.1} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-bold uppercase tracking-wider mb-3">
            Fleet Engineering
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-text font-display mb-3">
            Premium <span className="text-primary">Care Architecture</span>
          </h2>
          <p className="text-sm sm:text-base max-w-2xl mx-auto text-text-muted font-sans">
            Every vehicle in our fleet undergoes multi-point inspection, automated diagnostics, and thorough sanitization before handover.
          </p>
        </Reveal>

        <div className="relative h-[600px] lg:h-[680px]">
          {/* Central Car Image Container */}
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <motion.img
              src={supercar}
              alt="Supercar showcase"
              className="w-full max-w-2xl lg:max-w-3xl object-contain drop-shadow-[0_20px_50px_rgba(163,79,50,0.22)]"
              animate={{ y: [0, -16, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* Glow effect under car */}
            <div className="absolute bottom-1/4 w-3/4 h-32 bg-primary/20 blur-[80px] -z-10 rounded-full" />
          </div>

          {/* Feature Cards Grid */}
          <div className="absolute inset-0 z-30 lg:z-10">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.04, y: -6 }}
                className={`absolute ${feature.position} w-44 lg:w-64`}
              >
                <div className="rounded-3xl p-4 lg:p-6 shadow-md bg-surface border border-border hover:border-primary/40 transition-all duration-300 group cursor-default">
                  {/* Icon Container */}
                  <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-2xl flex items-center justify-center mb-3 lg:mb-4 mx-auto bg-surface-sunken group-hover:bg-primary-soft transition-colors">
                    <img
                      src={feature.icon}
                      alt={feature.title}
                      className="w-8 h-8 lg:w-10 lg:h-10 object-contain group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-sm lg:text-base text-center text-text font-display group-hover:text-primary transition-colors mb-1.5">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-center hidden lg:block text-text-muted leading-relaxed mb-3">
                    {feature.desc}
                  </p>

                  {/* Progress Indicator */}
                  <div className="w-full h-1 rounded-full overflow-hidden bg-surface-sunken hidden lg:block">
                    <motion.div
                      className="h-full bg-gradient-to-r from-primary to-accent"
                      initial={{ width: 0 }}
                      whileInView={{ width: '100%' }}
                      transition={{ duration: 1.2, delay: 0.4 + index * 0.1 }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Aboutx;
