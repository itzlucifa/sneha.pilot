import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Prevent unwanted website zooming across touch, trackpad, and keyboard
// 1. Prevent desktop trackpad pinch & Ctrl+Wheel zooming
document.addEventListener('wheel', (e) => {
  if (e.ctrlKey) {
    e.preventDefault();
  }
}, { passive: false });

// 2. Prevent Ctrl/Cmd + (+ / - / 0 / =) keyboard zooming
document.addEventListener('keydown', (e) => {
  if (
    (e.ctrlKey || e.metaKey) &&
    (e.key === '+' || e.key === '-' || e.key === '=' || e.key === '_' || e.key === '0')
  ) {
    e.preventDefault();
  }
});

// 3. Prevent Safari / iOS gesture pinch zooming
['gesturestart', 'gesturechange', 'gestureend'].forEach((eventName) => {
  document.addEventListener(eventName, (e) => {
    e.preventDefault();
  });
});

// 4. Prevent multi-touch pinch zooming on mobile/touch screens
document.addEventListener('touchstart', (e) => {
  if (e.touches.length > 1) {
    e.preventDefault();
  }
}, { passive: false });

// 5. Prevent double-tap to zoom on touch screens while preserving input interaction
let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
  const now = Date.now();
  if (now - lastTouchEnd <= 300) {
    const target = e.target as HTMLElement | null;
    const isInteractive = target && (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT' ||
      target.tagName === 'BUTTON' ||
      target.tagName === 'A' ||
      target.closest('button') ||
      target.closest('a')
    );
    if (!isInteractive) {
      e.preventDefault();
    }
  }
  lastTouchEnd = now;
}, { passive: false });

// Register PWA Service Worker
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((err) => {
      console.warn('Service worker registration failed:', err);
    });
  });
}

createRoot(document.getElementById('root')!).render(<App />);
