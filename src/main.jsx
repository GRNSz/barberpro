import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // SW registration failed — app still works
    });
  });
}

// Clear client cache from previous version to remove mock data
const CACHE_VERSION = 'v3';
if (localStorage.getItem('barberpro_cache_version') !== CACHE_VERSION) {
  localStorage.clear();
  localStorage.setItem('barberpro_cache_version', CACHE_VERSION);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
