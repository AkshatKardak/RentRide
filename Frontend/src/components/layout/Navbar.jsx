import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
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

  return (
    <nav className="sticky top-0 z-50 transition-all duration-300 shadow-sm bg-surface/90 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center">
            <button onClick={() => scrollToSection('hero')} className="flex items-center space-x-2 group focus:outline-none">
              <img
                src={Logo}
                alt="RentRide Logo"
                className="w-48 h-12 object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {[
              { id: 'hero', label: 'Home' },
              { id: 'video', label: 'Experience' },
              { id: 'inventory', label: 'Fleet' },
              { id: 'about', label: 'Care System' },
              { id: 'contact', label: 'Contact' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="font-medium text-sm text-text-muted hover:text-primary relative py-1 transition-colors duration-200 group"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full rounded-full" />
              </button>
            ))}

            <Link
              to="/signin"
              className="text-sm font-semibold text-text-muted hover:text-primary transition-colors duration-200"
            >
              Sign In
            </Link>
            
            <Link
              to="/signup"
              className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-primary hover:bg-primary-hover text-white shadow-md shadow-primary/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              Sign Up
            </Link>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-border bg-surface-raised hover:bg-surface-sunken text-text-muted hover:text-primary transition-all duration-200 hover:scale-105"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <Sun size={18} className="text-accent" />
              ) : (
                <Moon size={18} className="text-text-muted" />
              )}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-border bg-surface text-text-muted"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun size={18} className="text-accent" /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-text transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-border bg-surface/98 backdrop-blur-lg px-4 py-4 space-y-3 shadow-lg">
          {[
            { id: 'hero', label: 'Home' },
            { id: 'video', label: 'Experience' },
            { id: 'inventory', label: 'Fleet' },
            { id: 'about', label: 'Care System' },
            { id: 'contact', label: 'Contact' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className="block w-full text-left py-2 font-medium text-text-muted hover:text-primary transition-colors"
            >
              {item.label}
            </button>
          ))}
          
          <div className="pt-2 border-t border-border flex flex-col gap-2">
            <Link
              to="/signin"
              className="block py-2 font-medium text-text-muted hover:text-primary"
              onClick={() => setIsOpen(false)}
            >
              Sign In
            </Link>
            
            <Link
              to="/signup"
              className="block px-6 py-2.5 rounded-xl text-center font-bold bg-primary text-white shadow-md shadow-primary/20"
              onClick={() => setIsOpen(false)}
            >
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
