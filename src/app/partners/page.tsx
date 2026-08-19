'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/navigation/Sidebar';
import BottomNav from '@/components/navigation/BottomNav';
import Header from '@/components/navigation/Header';
import UniversalTransactionForm from '@/components/forms/UniversalTransactionForm';
import { Users, Plus, Edit2, ShieldAlert } from 'lucide-react';

interface PartnerItem {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  profitSharePercentage: number;
  status: 'active' | 'inactive';
}

export default function PartnersPage() {
  const [partners, setPartners] = useState<PartnerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Partner Form State
  const [editingPartner, setEditingPartner] = useState<PartnerItem | null>(null);
  const [name, setName] = useState('');
  const [profitShare, setProfitShare] = useState('50');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchPartners = async () => {
    try {
      const res = await fetch('/api/partners');
      const data = await res.json();
      if (res.ok && data.partners) setPartners(data.partners);
    } catch (e) {
      console.error('Fetch partners error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const handleOpenAdd = () => {
    setEditingPartner(null);
    setName('');
    setProfitShare('50');
    setPhone('');
    setIsFormOpen(true);
  };

  const handleEdit = (p: PartnerItem) => {
    setEditingPartner(p);
    setName(p.name);
    setProfitShare(String(p.profitSharePercentage));
    setPhone(p.phone || '');
    setIsFormOpen(true);
  };

  const handleSavePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setSaving(true);

    try {
      const isEdit = Boolean(editingPartner?._id);
      const url = isEdit ? `/api/partners/${editingPartner?._id}` : '/api/partners';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          profitSharePercentage: Number(profitShare) || 50,
          phone,
        }),
      });

      setSaving(false);
      if (res.ok) {
        setIsFormOpen(false);
        fetchPartners();
      } else {
        alert('Failed to save partner.');
      }
    } catch {
      setSaving(false);
      alert('Error saving partner.');
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar onOpenAddModal={() => setIsAddModalOpen(true)} />

      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-8">
        <Header title="Partners Management" onOpenAddModal={() => setIsAddModalOpen(true)} />

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto w-full">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Business Partners</h2>
              <p className="text-xs text-slate-500">Configure equity profit share ratios and partner details</p>
            </div>
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Partner
            </button>
          </div>

          {loading ? (
            <div className="py-20 text-center text-slate-400 text-xs">Loading partners...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {partners.map((p) => (
                <div key={p._id} className="bg-white p-5 rounded-2xl border border-slate-200/80 card-shadow flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 font-black text-lg flex items-center justify-center">
                      {p.name.charAt(p.name.length - 1) || 'P'}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{p.name}</h3>
                      <p className="text-xs text-slate-500">{p.phone || 'No phone recorded'}</p>
                      <span className="inline-block mt-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        Profit Share: {p.profitSharePercentage}%
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleEdit(p)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Partner Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-5 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              {editingPartner ? 'Edit Partner' : 'Add New Partner'}
            </h3>

            <form onSubmit={handleSavePartner} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Partner Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Profit Share Percentage (%) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  max="100"
                  value={profitShare}
                  onChange={(e) => setProfitShare(e.target.value)}
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
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  {saving ? 'Saving...' : 'Save Partner'}
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
