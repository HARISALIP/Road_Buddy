'use client';

import React from 'react';
import { PlusCircle, Sparkles, Download, Laptop } from 'lucide-react';
import { triggerPWAInstallModal } from '../pwa/InstallPromptBanner';

interface HeaderProps {
  title?: string;
  onOpenAddModal: (type?: 'expense' | 'income' | 'investment' | 'withdrawal' | 'dividend' | 'asset_sale') => void;
}

export default function Header({ title = 'Dashboard', onOpenAddModal }: HeaderProps) {
  const handleSeed = async () => {
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'Seeded successfully!');
        window.location.reload();
      } else {
        alert('Seed failed: ' + data.error);
      }
    } catch {
      alert('Failed to connect to seed endpoint.');
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="lg:hidden w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-md">
          RB
        </div>
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">{title}</h1>
          <p className="text-xs text-slate-500 hidden sm:block">
            Road Buddy Partnership Finance System
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={triggerPWAInstallModal}
          title="Install Road Buddy App (Windows PC & Mobile)"
          className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-extrabold rounded-xl shadow-md shadow-blue-500/25 transition-all border border-blue-400/30"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Install App</span>
          <span className="sm:hidden">Install</span>
        </button>

        <button
          onClick={handleSeed}
          title="Seed Default Data"
          className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Seed Data</span>
        </button>

        <button
          onClick={() => onOpenAddModal()}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ ADD TRANSACTION</span>
        </button>
      </div>
    </header>
  );
}
