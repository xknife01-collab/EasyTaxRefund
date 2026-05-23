'use client';

import { useEffect } from 'react';
import { logPwaInstall } from '@/lib/tracking';

export function PWASetup() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleAppInstalled = () => {
        console.log('PWA installed successfully');
        logPwaInstall();
      };
      
      window.addEventListener('appinstalled', handleAppInstalled);

      const registerSW = () => {
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.register('/sw.js').then(
            (registration) => {
              console.log('SW Registered:', registration.scope);
            },
            (err) => {
              console.error('SW Registration Failed:', err);
            }
          );
        }
      };

      if (document.readyState === 'complete') {
        registerSW();
      } else {
        window.addEventListener('load', registerSW);
      }

      return () => {
        window.removeEventListener('appinstalled', handleAppInstalled);
        window.removeEventListener('load', registerSW);
      };
    }
  }, []);

  return null;
}
