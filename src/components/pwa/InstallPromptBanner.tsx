'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, Share, PlusSquare, Smartphone, CheckCircle } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPromptBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    // Check if app is already running in standalone mode (already installed)
    const checkStandalone = () => {
      const isStandaloneMedia = window.matchMedia('(display-mode: standalone)').matches;
      // @ts-expect-error - iOS navigator.standalone property
      const isIOSStandalone = window.navigator?.standalone === true;
      return isStandaloneMedia || isIOSStandalone;
    };

    if (checkStandalone()) {
      setIsStandalone(true);
      return;
    }

    // Check if dismissed recently (within 24 hours)
    const lastDismissed = localStorage.getItem('road_buddy_pwa_dismissed');
    if (lastDismissed) {
      const timeDiff = Date.now() - parseInt(lastDismissed, 10);
      if (timeDiff < 24 * 60 * 60 * 1000) {
        setIsDismissed(true);
      }
    }

    // Detect iOS
    const ua = window.navigator.userAgent;
    const isIOSDevice = /iPad|iPhone|iPod/.test(ua) && !('MSStream' in window);
    setIsIOS(isIOSDevice);

    // Listen for Chrome / Android beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the Road Buddy app install prompt');
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('road_buddy_pwa_dismissed', Date.now().toString());
  };

  // Don't render if running in standalone mode, dismissed, or unsupported
  if (isStandalone || isDismissed) {
    return null;
  }

  // If not iOS and no install prompt available yet, return null
  if (!isIOS && !deferredPrompt) {
    return null;
  }

  return (
    <>
      {/* Floating Bottom PWA Install Banner */}
      <div className="fixed bottom-20 lg:bottom-6 left-4 right-4 max-w-md mx-auto z-40 animate-slide-up">
        <div className="bg-slate-900/95 backdrop-blur-md text-white p-3.5 sm:p-4 rounded-2xl shadow-2xl border border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shrink-0 shadow-md">
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="font-extrabold text-xs sm:text-sm text-white tracking-tight leading-tight truncate">
                Install Road Buddy App
              </h4>
              <p className="text-[11px] text-slate-300 font-medium truncate">
                Add to your phone home screen for instant 1-tap access
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>
            <button
              onClick={handleDismiss}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* iOS Step-by-Step Installation Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
          <div className="bg-white text-slate-900 w-full max-w-sm rounded-3xl shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Smartphone className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-base text-slate-900">Install on iPhone / iPad</h3>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  1
                </div>
                <div className="pt-0.5">
                  <p className="font-bold text-slate-800">Tap the Share button</p>
                  <p className="text-slate-500 mt-0.5 flex items-center gap-1">
                    At the bottom of Safari screen <Share className="w-3.5 h-3.5 text-blue-600 inline" />
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  2
                </div>
                <div className="pt-0.5">
                  <p className="font-bold text-slate-800">Select &apos;Add to Home Screen&apos;</p>
                  <p className="text-slate-500 mt-0.5 flex items-center gap-1">
                    Scroll down menu <PlusSquare className="w-3.5 h-3.5 text-blue-600 inline" />
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  3
                </div>
                <div className="pt-0.5">
                  <p className="font-bold text-emerald-900">Tap &apos;Add&apos; in top right</p>
                  <p className="text-emerald-700 mt-0.5 flex items-center gap-1">
                    Road Buddy app icon will be added to your home screen! <CheckCircle className="w-3.5 h-3.5 text-emerald-600 inline" />
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-3 bg-blue-600 text-white font-extrabold text-xs rounded-xl shadow-md hover:bg-blue-700 transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
