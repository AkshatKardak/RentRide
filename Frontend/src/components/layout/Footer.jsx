import React from 'react';
import { motion } from 'framer-motion';
import { Car, Mail, Phone, MapPin } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import facebook from '../../assets/facebook.png';
import twitter from '../../assets/twitter.png';
import instagram from '../../assets/instagram.png';

const Footer = () => {
  const { isDarkMode } = useTheme();

  const socialLinks = [
    { name: 'Facebook', img: facebook, url: 'https://facebook.com' },
    { name: 'Twitter', img: twitter, url: 'https://twitter.com' },
    { name: 'Instagram', img: instagram, url: 'https://instagram.com' },
  ];

  const theme = {
    bg: isDarkMode ? '#0f172a' : '#ffffff',
    border: isDarkMode ? '#334155' : '#e5e7eb',
    text: isDarkMode ? '#f1f5f9' : '#1F2937',
    textSecondary: isDarkMode ? '#cbd5e1' : '#6B7280',
    cardBg: isDarkMode ? '#1e293b' : '#f8f9fa',
  };

  return (
    <footer 
      className='border-t transition-colors duration-300'
      style={{ 
        backgroundColor: theme.bg,
        borderColor: theme.border
      }}
    >
      <div className='max-w-7xl mx-auto px-4 lg:px-8 py-12'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>

          {/* Brand */}
          <div>
            <div className='flex items-center gap-2 mb-4'>
              <img
                src="/tab.png"
                alt="RentRide Logo"
                className='w-10 h-10 object-contain'
              />
              <span className='text-2xl font-bold text-green-500'>RentRide</span>
            </div>
            <p className='mb-4' style={{ color: theme.textSecondary }}>
              Reliable, swift, and comfortable car rentals for every journey.
            </p>

            {/* Social Media Icons */}
            <div className='flex gap-3'>
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='w-10 h-10 rounded-lg flex items-center justify-center hover:bg-green-500 group transition-all'
                  style={{
                    backgroundColor: theme.cardBg,
                    borderWidth: '1px',
                    borderColor: theme.border
                  }}
                >
                  <img
                    src={social.img}
                    alt={social.name}
                    className='w-5 h-5 object-contain opacity-70 group-hover:opacity-100 group-hover:invert group-hover:brightness-0 transition-all'
                  />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className='text-xl font-bold mb-4' style={{ color: theme.text }}>
              Quick Links
            </h3>
            <ul className='space-y-2'>
              {['Home', 'Inventory', 'About Us', 'Contact', 'FAQ'].map((link) => (
                <li key={link}>
                  <a 
                    href='#' 
                    className='hover:text-green-500 transition-colors hover:translate-x-1 inline-block'
                    style={{ color: theme.textSecondary }}
                  >
                    → {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className='text-xl font-bold mb-4' style={{ color: theme.text }}>
              Services
            </h3>
            <ul className='space-y-2'>
              {['Luxury Cars', 'Sports Cars', 'SUVs', 'Electric Vehicles', 'Chauffeur Service'].map((service) => (
                <li key={service}>
                  <a 
                    href='#' 
                    className='hover:text-green-500 transition-colors hover:translate-x-1 inline-block'
                    style={{ color: theme.textSecondary }}
                  >
                    → {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className='text-xl font-bold mb-4' style={{ color: theme.text }}>
              Contact Us
            </h3>
            <ul className='space-y-3'>
              <li className='flex items-start gap-3 hover:text-green-500 transition-colors' style={{ color: theme.textSecondary }}>
                <MapPin size={20} className='text-green-500 mt-1 flex-shrink-0' />
                <span>123 RentRide Street, Mumbai, Maharashtra, India</span>
              </li>
              <li className='flex items-center gap-3 hover:text-green-500 transition-colors' style={{ color: theme.textSecondary }}>
                <Phone size={20} className='text-green-500 flex-shrink-0' />
                <span>+91 98765 43210</span>
              </li>
              <li className='flex items-center gap-3 hover:text-green-500 transition-colors' style={{ color: theme.textSecondary }}>
                <Mail size={20} className='text-green-500 flex-shrink-0' />
                <span>support@rentride.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div 
          className='border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 transition-colors'
          style={{ borderColor: theme.border }}
        >
          <p className='text-sm' style={{ color: theme.textSecondary }}>
            © 2026 RentRide. All rights reserved. Engineered for mobility excellence by <span className='text-emerald-500 font-semibold'>Akshat</span>
          </p>
          <div className='flex gap-6 text-sm'>
            <a href='#' className='hover:text-green-500 transition-colors' style={{ color: theme.textSecondary }}>Privacy Policy</a>
            <a href='#' className='hover:text-green-500 transition-colors' style={{ color: theme.textSecondary }}>Terms of Service</a>
            <a href='#' className='hover:text-green-500 transition-colors' style={{ color: theme.textSecondary }}>Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
