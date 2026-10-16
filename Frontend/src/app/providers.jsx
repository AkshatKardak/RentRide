import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(undefined);

// Semantic token accessor for JS consumers
const lightTheme = {
  background: '#FAF7F1',
  card: '#FFFFFF',
  cardBg: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceRaised: '#FFFFFF',
  text: '#20201E',
  textSecondary: '#6B6459',
  border: '#E8E0D3',
  inputBg: '#F3EEE5',
  hover: '#F3EEE5',
  primary: '#A34F32',
  accent: '#B8794A'
};

const darkTheme = {
  background: '#11110F',
  card: '#1C1B18',
  cardBg: '#1C1B18',
  surface: '#1C1B18',
  surfaceRaised: '#23221C',
  text: '#F3EEE5',
  textSecondary: '#B3AA9C',
  border: 'rgba(243, 238, 229, 0.10)',
  inputBg: '#16150F',
  hover: '#23221C',
  primary: '#B85D3B',
  accent: '#C68A5A'
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      isDarkMode: false,
      toggleTheme: () => {},
      theme: lightTheme
    };
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('darkMode');
      return saved ? JSON.parse(saved) : true; // Default dark for luxury automotive aesthetics
    } catch (error) {
      return true;
    }
  });

  const theme = isDarkMode ? darkTheme : lightTheme;

  useEffect(() => {
    try {
      const html = document.documentElement;
      html.classList.remove('light', 'dark');
      if (isDarkMode) {
        html.classList.add('dark');
        html.setAttribute('data-theme', 'dark');
      } else {
        html.classList.add('light');
        html.setAttribute('data-theme', 'light');
      }
      localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
      void html.offsetHeight;
    } catch (error) {
      console.error('Error applying theme:', error);
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};
