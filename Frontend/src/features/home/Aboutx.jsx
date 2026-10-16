import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { FadeUp } from '@/utils/Animation';
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
            title: "Premium Tires",
            desc: "High-performance tires for maximum grip and safety on every ride.",
            position: "top-2 left-2 lg:top-8 lg:left-4"
        },
        {
            icon: maintenance,
            title: "Full Service",
            desc: "Regular maintenance and care to keep your rental in perfect condition.",
            position: "top-2 right-2 lg:top-8 lg:right-4"
        },
        {
            icon: steering,
            title: "Precision Control",
            desc: "Advanced steering systems for smooth and responsive handling.",
            position: "bottom-2 left-2 lg:bottom-8 lg:left-4"
        },
        {
            icon: battery,
            title: "Power Ready",
            desc: "Fully charged batteries ensuring reliable performance throughout.",
            position: "bottom-2 right-2 lg:bottom-8 lg:right-4"
        }
    ];

    const theme = {
        bg: isDarkMode ? '#1e293b' : '#f8f9fa',
        cardBg: isDarkMode ? '#1e293b' : '#ffffff',
        text: isDarkMode ? '#f1f5f9' : '#1F2937',
        textSecondary: isDarkMode ? '#cbd5e1' : '#6B7280',
        border: isDarkMode ? '#334155' : '#e5e7eb',
    };

    return (
        <div 
            id="about" 
            className='py-24 relative overflow-hidden transition-colors duration-300'
            style={{ backgroundColor: theme.bg }}
        >
            {/* Background Decor */}
            <div className='absolute top-20 left-10 w-80 h-80 bg-green-500/10 rounded-full blur-[100px] pointer-events-none'></div>
            <div className='absolute bottom-20 right-10 w-[450px] h-[450px] bg-green-500/10 rounded-full blur-[120px] pointer-events-none'></div>

            <div className='max-w-7xl mx-auto px-4 relative z-10'>
                {/* Section Title */}
                <motion.div
                    variants={FadeUp(0.2)}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className='text-center mb-16'
                >
                    <h2 className='text-4xl lg:text-5xl font-black mb-4' style={{ color: theme.text }}>
                        Premium <span className='text-green-500'>Care System</span>
                    </h2>
                    <p className='text-lg max-w-2xl mx-auto' style={{ color: theme.textSecondary }}>
                        Every vehicle in our fleet undergoes rigorous multi-point inspection and optimization before it reaches you.
                    </p>
                </motion.div>

                <motion.div
                    variants={FadeUp(0.3)}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className='relative h-[600px] lg:h-[700px]'
                >
                    {/* Central Car Image Container */}
                    <div className='absolute inset-0 flex items-center justify-center z-20 pointer-events-none'>
                        <motion.img
                            src={supercar}
                            alt="Supercar"
                            className='w-full max-w-3xl lg:max-w-4xl object-contain drop-shadow-[0_20px_50px_rgba(16,185,129,0.2)]'
                            animate={{
                                y: [0, -20, 0],
                            }}
                            transition={{
                                duration: 5,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        />
                        {/* Glow effect under car */}
                        <div className='absolute bottom-1/4 w-3/4 h-32 bg-green-500/15 blur-[80px] -z-10 rounded-full'></div>
                    </div>

                    {/* Feature Cards Grid */}
                    <div className='absolute inset-0 z-30 lg:z-10'>
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                                viewport={{ once: true }}
                                whileHover={{ scale: 1.05, y: -8 }}
                                className={`absolute ${feature.position} w-40 lg:w-64`}
                            >
                                <div 
                                    className='rounded-3xl p-4 lg:p-7 shadow-xl transition-all duration-300 group cursor-default hover:border-green-500/50'
                                    style={{
                                        backgroundColor: theme.cardBg,
                                        borderWidth: '1px',
                                        borderColor: theme.border
                                    }}
                                >
                                    {/* Icon Container */}
                                    <div 
                                        className='w-14 h-14 lg:w-20 lg:h-20 rounded-2xl flex items-center justify-center mb-4 lg:mb-6 mx-auto group-hover:bg-green-500/10 transition-colors'
                                        style={{ backgroundColor: isDarkMode ? '#334155' : '#f8f9fa' }}
                                    >
                                        <img
                                            src={feature.icon}
                                            alt={feature.title}
                                            className='w-10 h-10 lg:w-14 lg:h-14 object-contain group-hover:scale-110 transition-transform duration-300'
                                        />
                                    </div>

                                    {/* Title */}
                                    <h3 
                                        className='font-black text-base lg:text-xl text-center group-hover:text-green-500 transition-colors mb-2'
                                        style={{ color: theme.text }}
                                    >
                                        {feature.title}
                                    </h3>

                                    {/* Description */}
                                    <p 
                                        className='text-xs lg:text-sm text-center hidden lg:block leading-relaxed mb-4'
                                        style={{ color: theme.textSecondary }}
                                    >
                                        {feature.desc}
                                    </p>

                                    {/* Progress Indicator */}
                                    <div 
                                        className='w-full h-1.5 rounded-full overflow-hidden hidden lg:block'
                                        style={{ backgroundColor: isDarkMode ? '#334155' : '#f8f9fa' }}
                                    >
                                        <motion.div
                                            className='h-full bg-green-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                                            initial={{ width: 0 }}
                                            whileInView={{ width: '100%' }}
                                            transition={{ duration: 1.5, delay: 0.6 + index * 0.1 }}
                                        ></motion.div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Aboutx;
