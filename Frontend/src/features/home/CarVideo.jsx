import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { Reveal } from '@/components/fx';
import carVideo from '@/assets/car1.mp4';

const CarVideo = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);
  const { isDarkMode } = useTheme();

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <section 
      id="video"
      className="py-24 px-4 relative overflow-hidden bg-bg-subtle transition-colors duration-300"
    >
      {/* Golden-hour ambient gradient scrim */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-full bg-gradient-to-b from-primary/10 via-accent/5 to-transparent blur-3xl pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <Reveal direction="up" delay={0.1} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-bold uppercase tracking-wider mb-3">
            Cinematic Preview
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-text font-display mb-3">
            Experience the Fleet
          </h2>
          <p className="text-sm sm:text-base text-text-muted max-w-lg mx-auto">
            Witness our curated collection in motion across open roads and coastal highways.
          </p>
        </Reveal>

        <Reveal direction="up" delay={0.25}>
          <div className="relative rounded-3xl overflow-hidden border border-border shadow-2xl bg-surface group">
            <video
              ref={videoRef}
              src={carVideo}
              loop
              muted
              playsInline
              className="w-full h-[380px] sm:h-[480px] lg:h-[580px] object-cover"
              onEnded={() => setIsPlaying(false)}
            />
            
            {/* Dark gradient overlay for text readability */}
            <div className={`absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent transition-opacity duration-300 pointer-events-none ${isPlaying ? 'opacity-0' : 'opacity-100'}`}>
              <div className="absolute bottom-8 left-8 right-8 text-white">
                <span className="text-xs uppercase tracking-widest text-accent font-bold">Unmatched Performance</span>
                <h3 className="text-2xl sm:text-3xl font-black mt-1 font-display">Crafted For The Enthusiast</h3>
                <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-md">Legendary performance and engineering excellence delivered directly to your doorstep.</p>
              </div>
            </div>

            {/* Centered Play Button */}
            <AnimatePresence>
              {!isPlaying && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.25 }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
                >
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePlayPause}
                    className="w-20 h-20 bg-primary hover:bg-primary-hover rounded-full flex items-center justify-center cursor-pointer shadow-xl shadow-primary/40 transition-all border-4 border-white/20"
                    aria-label="Play video"
                  >
                    <Play className="text-white ml-1 fill-white" size={28} />
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Corner Pause Button */}
            {isPlaying && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePlayPause}
                className="absolute top-4 right-4 w-11 h-11 bg-black/70 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary transition-all text-white z-20"
                aria-label="Pause video"
              >
                <Pause size={18} className="fill-white" />
              </motion.button>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default CarVideo;
