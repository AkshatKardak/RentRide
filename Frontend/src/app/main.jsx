import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './providers'
import App from './App.jsx'
import ErrorBoundary from '@/components/ui/ErrorBoundary'
import '@/styles/index.css'

// Global error handlers for uncaught promises or script errors
window.addEventListener('error', (event) => {
  console.error('[RentRide Global Error]:', event.error || event.message);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('[RentRide Unhandled Promise Rejection]:', event.reason);
});

const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <BrowserRouter>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </React.StrictMode>
  );
} else {
  console.error('Root element #root not found in document!');
}
