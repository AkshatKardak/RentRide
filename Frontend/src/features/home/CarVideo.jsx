import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { ZoomIn } from '@/utils/Animation';
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

  const theme = {
    bg: isDarkMode ? '#0f172a' : 'linear-gradient(to bottom, #f8f9fa, #ffffff)',
    text: isDarkMode ? '#f1f5f9' : '#1F2937',
    textSecondary: isDarkMode ? '#cbd5e1' : '#6B7280',
  };

  return (
    <div 
      id="video"
      className='py-20 px-4 relative overflow-hidden transition-all duration-300'
      style={{
        background: isDarkMode 
          ? 'linear-gradient(to bottom, #0f172a, #1e293b)' 
          : 'linear-gradient(to bottom, #f8f9fa, #ffffff)'
      }}
    >
      <div className='absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-green-500/10 to-transparent blur-3xl'></div>
      
      <div className='max-w-6xl mx-auto relative z-10'>
        <motion.div
          variants={ZoomIn(0.2)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className='text-center mb-10'
        >
          <h2 
            className='text-4xl lg:text-6xl font-bold mb-4 transition-colors duration-300'
            style={{ color: theme.text }}
          >
            Experience the Thrill
          </h2>
          <p 
            className='text-lg transition-colors duration-300'
            style={{ color: theme.textSecondary }}
          >
            Watch our collection in action
          </p>
        </motion.div>

        <motion.div
          variants={ZoomIn(0.4)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className='relative rounded-2xl overflow-hidden border-2 border-green-500/30 shadow-2xl shadow-green-500/20 group'
        >
          <video
            ref={videoRef}
            src={carVideo}
            loop
            muted
            playsInline
            className='w-full h-[400px] lg:h-[600px] object-cover'
            onEnded={() => setIsPlaying(false)}
          />
          
          <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent transition-opacity duration-300 ${isPlaying ? 'opacity-0' : 'opacity-100'}`}>
            <div className='absolute bottom-8 left-8 right-8'>
              <h3 className='text-3xl font-bold text-white mb-2'>Premium Collection</h3>
              <p className='text-gray-300'>Legendary vehicles await your command</p>
            </div>
          </div>

          <AnimatePresence>
            {!isPlaying && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.3 }}
                className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
              >
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handlePlayPause}
                  className='w-20 h-20 bg-green-500 rounded-full flex items-center justify-center cursor-pointer shadow-2xl hover:shadow-green-500/50 transition-all'
                >
                  <Play className='text-white ml-1' size={32} fill='white' />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {isPlaying && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handlePlayPause}
              className='absolute top-4 right-4 w-12 h-12 bg-black/80 backdrop-blur-sm border-2 border-green-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-green-500 transition-all'
            >
              <Pause className='text-white' size={20} fill='white' />
            </motion.button>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CarVideo;
