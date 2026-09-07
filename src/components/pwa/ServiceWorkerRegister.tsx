'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('Road Buddy ServiceWorker registered successfully:', reg.scope);
          })
          .catch((err) => {
            console.error('Road Buddy ServiceWorker registration failed:', err);
          });
      });
    }
  }, []);

  return null;
}
