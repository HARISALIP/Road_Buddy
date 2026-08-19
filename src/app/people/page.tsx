'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/navigation/Sidebar';
import BottomNav from '@/components/navigation/BottomNav';
import Header from '@/components/navigation/Header';
import UniversalTransactionForm from '@/components/forms/UniversalTransactionForm';
import { UserCheck, Plus } from 'lucide-react';

interface PersonItem {
  _id: string;
  name: string;
  phone?: string;
  role?: string;
}

export default function PeoplePage() {
  const [people, setPeople] = useState<PersonItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchPeople = async () => {
    try {
      const res = await fetch('/api/people');
      const data = await res.json();
      if (res.ok && data.people) setPeople(data.people);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeople();
  }, []);

  const handleSavePerson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setSaving(true);
    try {
      const res = await fetch('/api/people', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, role }),
      });
      setSaving(false);
      if (res.ok) {
        setIsFormOpen(false);
        setName('');
        setPhone('');
        setRole('');
        fetchPeople();
      }
    } catch {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar onOpenAddModal={() => setIsAddModalOpen(true)} />

      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-8">
        <Header title="People Management" onOpenAddModal={() => setIsAddModalOpen(true)} />

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto w-full">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Team & Staff</h2>
              <p className="text-xs text-slate-500">Manage individuals associated with expense transactions</p>
            </div>
            <button
              onClick={() => setIsFormOpen(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Person
            </button>
          </div>

          {loading ? (
            <div className="py-20 text-center text-slate-400 text-xs">Loading people...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {people.map((p) => (
                <div key={p._id} className="bg-white p-5 rounded-2xl border border-slate-200/80 card-shadow flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 font-bold">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{p.name}</h3>
                    <p className="text-xs text-slate-500">{p.role || 'Team Member'}</p>
                    {p.phone && <p className="text-[10px] text-slate-400 mt-0.5">{p.phone}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-5 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Add Person</h3>
            <form onSubmit={handleSavePerson} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Sahad, Shibin, Suhail"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-600">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="px-5 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md">
                  {saving ? 'Saving...' : 'Save Person'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <BottomNav onOpenAddModal={() => setIsAddModalOpen(true)} />
      <UniversalTransactionForm isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
}
