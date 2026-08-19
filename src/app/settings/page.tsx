'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/navigation/Sidebar';
import BottomNav from '@/components/navigation/BottomNav';
import Header from '@/components/navigation/Header';
import UniversalTransactionForm from '@/components/forms/UniversalTransactionForm';
import { Settings, Plus, Tags, Shield } from 'lucide-react';

export default function SettingsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryType, setNewCategoryType] = useState('expense');
  const [categoryMsg, setCategoryMsg] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [isSubmittingCategory, setIsSubmittingCategory] = useState(false);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName) return;
    setIsSubmittingCategory(true);
    setCategoryMsg(null);

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName, type: newCategoryType })
      });
      const data = await res.json();
      if (res.ok) {
        setCategoryMsg({ type: 'success', text: `Category "${data.category.name}" added successfully!` });
        setNewCategoryName('');
      } else {
        setCategoryMsg({ type: 'error', text: data.error || 'Failed to add category' });
      }
    } catch {
      setCategoryMsg({ type: 'error', text: 'Network error. Could not add category.' });
    } finally {
      setIsSubmittingCategory(false);
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
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Tags className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Manage Categories</h3>
                <p className="text-xs text-slate-500">
                  Add new expense or income categories to be used in your transactions.
                </p>
              </div>
            </div>

            {categoryMsg && (
              <div className={`p-3 text-xs font-semibold rounded-xl border ${categoryMsg.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
                {categoryMsg.text}
              </div>
            )}

            <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="flex-1 w-full">
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g. Office Supplies"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
              </div>
              <div className="w-full sm:w-48">
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Type *</label>
                <select
                  value={newCategoryType}
                  onChange={(e) => setNewCategoryType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={isSubmittingCategory}
                className="w-full sm:w-auto px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 h-[42px]"
              >
                <Plus className="w-4 h-4" />
                <span>{isSubmittingCategory ? 'Adding...' : 'Add'}</span>
              </button>
            </form>
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
