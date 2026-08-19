'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/navigation/Sidebar';
import BottomNav from '@/components/navigation/BottomNav';
import Header from '@/components/navigation/Header';
import UniversalTransactionForm from '@/components/forms/UniversalTransactionForm';
import { Settings, Sparkles, Database, Shield } from 'lucide-react';

export default function SettingsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const handleSeed = async () => {
    setSeeding(true);
    setMsg(null);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      setSeeding(false);
      if (res.ok) {
        setMsg(data.message || 'Seeded successfully!');
      } else {
        setMsg('Seed error: ' + data.error);
      }
    } catch {
      setSeeding(false);
      setMsg('Failed to trigger database seed.');
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar onOpenAddModal={() => setIsAddModalOpen(true)} />

      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-8">
        <Header title="Settings" onOpenAddModal={() => setIsAddModalOpen(true)} />

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto w-full">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">System Preferences</h2>
            <p className="text-xs text-slate-500">Database setup and default configuration options</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 card-shadow space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Database Seeding & Default Setup</h3>
                <p className="text-xs text-slate-500">
                  Populate default expense/income categories, partners (Partner A 50%, Partner B 50%), vehicles, and sample records.
                </p>
              </div>
            </div>

            {msg && (
              <div className="p-3 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold rounded-xl">
                {msg}
              </div>
            )}

            <button
              onClick={handleSeed}
              disabled={seeding}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{seeding ? 'Seeding Database...' : 'Run Seed Script'}</span>
            </button>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 card-shadow space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">MongoDB Atlas Connection</h3>
                <p className="text-xs text-slate-500">
                  Connected via server-only Next.js Route Handlers using environment variable <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-600 font-mono">MONGODB_URI</code>.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>

      <BottomNav onOpenAddModal={() => setIsAddModalOpen(true)} />
      <UniversalTransactionForm isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
}
