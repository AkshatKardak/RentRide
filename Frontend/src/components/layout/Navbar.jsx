import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import Logo from '@/assets/logo.png';


export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();


  const scrollToSection = (sectionId) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
    setIsOpen(false);
  };


  const theme = {
    navbar: {
      bg: isDarkMode ? '#0f172a' : '#FFFFFF',
      border: isDarkMode ? '#334155' : '#E5E7EB'
    },
    text: {
      primary: isDarkMode ? '#f1f5f9' : '#1F2937',
      secondary: isDarkMode ? '#cbd5e1' : '#6B7280',
      hover: isDarkMode ? '#10b981' : '#10A310'
    },
    button: {
      primary: isDarkMode ? '#10b981' : '#10A310',
      primaryHover: isDarkMode ? '#059669' : '#0D820D'
    },
    toggle: {
      bg: isDarkMode ? '#1e293b' : '#F8F9FA',
      border: isDarkMode ? '#334155' : '#E5E7EB'
    }
  };


  return (
    <nav 
      className="sticky top-0 z-50 transition-all duration-300 shadow-lg"
      style={{
        backgroundColor: theme.navbar.bg,
        borderBottom: `1px solid ${theme.navbar.border}`
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button onClick={() => scrollToSection('hero')} className="flex items-center space-x-2 group">
              <img
                src={Logo}
                alt="RentRide Logo"
                className="w-60 h-60 object-contain transition-transform group-hover:scale-110"
              />
            </button>
          </div>


          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {[
              { id: 'hero', label: 'Home' },
              { id: 'video', label: 'Experience' },
              { id: 'inventory', label: 'Cars' },
              { id: 'about', label: 'About Us' },
              { id: 'contact', label: 'Contact Us' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="font-medium relative group transition-all duration-300"
                style={{ color: theme.text.secondary }}
                onMouseEnter={(e) => e.target.style.color = theme.text.hover}
                onMouseLeave={(e) => e.target.style.color = theme.text.secondary}
              >
                {item.label}
                <span 
                  className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full"
                  style={{ backgroundColor: theme.text.hover }}
                ></span>
              </button>
            ))}


            <Link
              to="/signin"
              className="font-medium transition-colors duration-300 hover:opacity-80"
              style={{ color: theme.text.secondary }}
            >
              Sign In
            </Link>
            
            <Link
              to="/signup"
              className="px-6 py-2.5 rounded-xl font-bold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
              style={{
                backgroundColor: theme.button.primary,
                color: '#FFFFFF'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = theme.button.primaryHover}
              onMouseLeave={(e) => e.target.style.backgroundColor = theme.button.primary}
            >
              Sign Up
            </Link>


            {/* Dark Mode Toggle - Desktop Only (SINGLE TOGGLE) */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl transition-all duration-300 hover:scale-110"
              style={{
                backgroundColor: theme.toggle.bg,
                border: `1px solid ${theme.toggle.border}`
              }}
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? (
                <Sun size={20} className="text-yellow-400" />
              ) : (
                <Moon size={20} style={{ color: theme.text.secondary }} />
              )}
            </button>
          </div>


          {/* Mobile Menu Button - NO THEME TOGGLE HERE */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 transition-colors"
              style={{ color: theme.text.primary }}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>


      {/* Mobile Menu */}
      {isOpen && (
        <div 
          className="md:hidden border-t transition-all duration-300"
          style={{
            backgroundColor: isDarkMode ? '#1e293b' : '#FFFFFF',
            borderColor: theme.navbar.border
          }}
        >
          <div className="px-4 py-4 space-y-3">
            {[
              { id: 'hero', label: 'Home' },
              { id: 'video', label: 'Experience' },
              { id: 'inventory', label: 'Cars' },
              { id: 'about', label: 'About Us' },
              { id: 'contact', label: 'Contact Us' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="block w-full text-left py-2 font-medium transition-colors duration-300"
                style={{ color: theme.text.secondary }}
              >
                {item.label}
              </button>
            ))}
            
            <Link
              to="/signin"
              className="block py-2 font-medium transition-colors duration-300"
              style={{ color: theme.text.secondary }}
              onClick={() => setIsOpen(false)}
            >
              Sign In
            </Link>
            
            <Link
              to="/signup"
              className="block px-6 py-2.5 rounded-xl text-center mt-2 font-bold transition-all duration-300"
              style={{
                backgroundColor: theme.button.primary,
                color: '#FFFFFF'
              }}
              onClick={() => setIsOpen(false)}
            >
              Sign Up
            </Link>

            {/* Dark Mode Toggle - Mobile Menu */}
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl mt-2 transition-all duration-300"
              style={{
                backgroundColor: theme.toggle.bg,
                border: `1px solid ${theme.toggle.border}`
              }}
            >
              {isDarkMode ? (
                <>
                  <Sun size={20} className="text-yellow-400" />
                  <span style={{ color: theme.text.primary }} className="font-medium">Light Mode</span>
                </>
              ) : (
                <>
                  <Moon size={20} style={{ color: theme.text.secondary }} />
                  <span style={{ color: theme.text.primary }} className="font-medium">Dark Mode</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
