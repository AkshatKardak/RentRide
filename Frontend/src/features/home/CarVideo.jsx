import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { Reveal } from '@/components/fx';

const HERO_VIDEO_SRC = '/assets/video/hero-loop.mp4';
const HERO_VIDEO_POSTER = '/assets/showcase/banner.jpg';

const CarVideo = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);
  const { isDarkMode } = useTheme();
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    // If not reduced motion, attempt autoplay muted
    if (!prefersReducedMotion && videoRef.current) {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        // Autoplay policy prevented playback, keep paused
        setIsPlaying(false);
      });
    }
  }, [prefersReducedMotion]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch((err) => {
          console.warn('Playback prevented:', err);
        });
      }
    }
  };

  const handleToggleMute = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      const nextMuted = !isMuted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
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
              src={HERO_VIDEO_SRC}
              poster={HERO_VIDEO_POSTER}
              preload="metadata"
              loop
              muted={isMuted}
              playsInline
              className="w-full h-[380px] sm:h-[480px] lg:h-[580px] object-cover"
              onEnded={() => setIsPlaying(false)}
            />
            
            {/* Dark gradient overlay for text readability */}
            <div className={`absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent transition-opacity duration-300 pointer-events-none ${isPlaying ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}>
              <div className="absolute bottom-8 left-8 right-8 text-white">
                <span className="text-xs uppercase tracking-widest text-accent font-bold">Unmatched Performance</span>
                <h3 className="text-2xl sm:text-3xl font-black mt-1 font-display">Crafted For The Enthusiast</h3>
                <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-md">Legendary performance and engineering excellence delivered directly to your doorstep.</p>
              </div>
            </div>

            {/* Centered Play Button (when paused) */}
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

            {/* Corner Control Affordances (Pause & Mute/Unmute) */}
            <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleToggleMute}
                className="w-10 h-10 bg-black/60 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary transition-all text-white"
                aria-label={isMuted ? "Unmute video" : "Mute video"}
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </motion.button>

              {isPlaying && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePlayPause}
                  className="w-10 h-10 bg-black/60 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary transition-all text-white"
                  aria-label="Pause video"
                  title="Pause"
                >
                  <Pause size={16} className="fill-white" />
                </motion.button>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default CarVideo;
