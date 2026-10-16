import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, ShieldCheck } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import facebook from '@/assets/facebook.png';
import twitter from '@/assets/twitter.png';
import instagram from '@/assets/instagram.png';

const Footer = () => {
  const { isDarkMode } = useTheme();

  const socialLinks = [
    { name: 'Facebook', img: facebook, url: 'https://facebook.com' },
    { name: 'Twitter', img: twitter, url: 'https://twitter.com' },
    { name: 'Instagram', img: instagram, url: 'https://instagram.com' },
  ];

  return (
    <footer className="border-t border-border bg-surface-subtle transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/tab.png"
                alt="RentRide Logo"
                className="w-9 h-9 object-contain"
              />
              <span className="text-2xl font-black tracking-tight text-primary font-display">RentRide</span>
            </div>
            <p className="text-sm text-text-muted leading-relaxed">
              Precision car rentals engineered for India. Transparent pricing, AI-recommended matching, and verified vehicle health passports.
            </p>

            {/* Social Media Icons */}
            <div className="flex gap-2.5 pt-2">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl border border-border bg-surface hover:bg-primary-soft hover:border-primary/30 flex items-center justify-center transition-all group"
                  aria-label={social.name}
                >
                  <img
                    src={social.img}
                    alt={social.name}
                    className="w-4 h-4 object-contain opacity-70 group-hover:opacity-100 transition-opacity"
                  />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-text mb-4 font-display">
              Explore
            </h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: 'Browse Fleet', href: '/browsecars' },
                { label: 'Special Offers', href: '/offers' },
                { label: 'AI Vehicle Assistant', href: '/aiassistant' },
                { label: 'Damage Verification', href: '/my-damage-reports' },
                { label: 'Help & FAQs', href: '/help-support' }
              ].map((item) => (
                <li key={item.label}>
                  <a 
                    href={item.href} 
                    className="text-text-muted hover:text-primary transition-colors flex items-center gap-1.5 group"
                  >
                    <span className="text-accent group-hover:translate-x-1 transition-transform">→</span>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Vehicle Classes */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-text mb-4 font-display">
              Fleet Categories
            </h3>
            <ul className="space-y-2.5 text-sm">
              {['Executive Sedans', 'Adventure SUVs', 'Electric & Hybrids', 'City Hatchbacks', 'Grand Tourers'].map((service) => (
                <li key={service}>
                  <a 
                    href="/browsecars" 
                    className="text-text-muted hover:text-primary transition-colors flex items-center gap-1.5 group"
                  >
                    <span className="text-accent group-hover:translate-x-1 transition-transform">→</span>
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-text mb-4 font-display">
              Contact & Support
            </h3>
            <ul className="space-y-3 text-sm text-text-muted">
              <li className="flex items-start gap-2.5">
                <MapPin size={18} className="text-primary mt-0.5 shrink-0" />
                <span>BKC Financial District, Bandra East, Mumbai, Maharashtra 400051</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={18} className="text-primary shrink-0" />
                <span className="font-mono">+91 (022) 4890-2300</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={18} className="text-primary shrink-0" />
                <span>support@rentride.in</span>
              </li>
              <li className="pt-2">
                <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-primary-soft text-primary font-semibold border border-primary/20">
                  <ShieldCheck size={14} /> 100% Insured Fleet
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-text-subtle">
          <p>
            © 2026 RentRide Technologies. Engineered for mobility excellence by <span className="text-primary font-semibold">Akshat</span>
          </p>
          <div className="flex gap-6">
            <a href="/help-support" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="/help-support" className="hover:text-primary transition-colors">Terms of Service</a>
            <a href="/help-support" className="hover:text-primary transition-colors">Damage Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
