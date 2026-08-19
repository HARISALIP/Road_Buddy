'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/navigation/Sidebar';
import BottomNav from '@/components/navigation/BottomNav';
import Header from '@/components/navigation/Header';
import UniversalTransactionForm from '@/components/forms/UniversalTransactionForm';
import { Package, Plus } from 'lucide-react';

interface AssetItem {
  _id: string;
  name: string;
  assetType?: string;
  purchaseAmount?: number;
  saleAmount?: number;
  status: 'active' | 'sold';
}

export default function AssetsPage() {
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [name, setName] = useState('');
  const [assetType, setAssetType] = useState('Electronics');
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchAssets = async () => {
    try {
      const res = await fetch('/api/assets');
      const data = await res.json();
      if (res.ok && data.assets) setAssets(data.assets);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleSaveAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setSaving(true);
    try {
      const res = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, assetType, purchaseAmount: Number(purchaseAmount) || 0 }),
      });
      setSaving(false);
      if (res.ok) {
        setIsFormOpen(false);
        setName('');
        setPurchaseAmount('');
        fetchAssets();
      }
    } catch {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar onOpenAddModal={() => setIsAddModalOpen(true)} />

      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-8">
        <Header title="Assets Management" onOpenAddModal={() => setIsAddModalOpen(true)} />

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto w-full">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Company Assets</h2>
              <p className="text-xs text-slate-500">Track equipment, machinery, tools & sold assets</p>
            </div>
            <button
              onClick={() => setIsFormOpen(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Asset
            </button>
          </div>

          {loading ? (
            <div className="py-20 text-center text-slate-400 text-xs">Loading assets...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assets.map((a) => {
                const isSold = a.status === 'sold';
                return (
                  <div key={a._id} className="bg-white p-5 rounded-2xl border border-slate-200/80 card-shadow flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isSold ? 'bg-teal-50 text-teal-600' : 'bg-blue-50 text-blue-600'}`}>
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{a.name}</h3>
                      <p className="text-xs text-slate-500">{a.assetType || 'General Asset'}</p>
                      <div className="mt-2 space-y-0.5 text-xs">
                        <p className="text-slate-600">Purchase: <span className="font-bold">₹{a.purchaseAmount?.toLocaleString() || 0}</span></p>
                        {isSold && (
                          <p className="text-teal-700 font-bold">Sold For: ₹{a.saleAmount?.toLocaleString() || 0}</p>
                        )}
                      </div>
                      <span className={`inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded capitalize ${isSold ? 'bg-teal-100 text-teal-800' : 'bg-blue-50 text-blue-600'}`}>
                        {a.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-5 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Add New Asset</h3>
            <form onSubmit={handleSaveAsset} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Asset Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Honor Tablet or Generator"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Asset Category / Type</label>
                <input
                  type="text"
                  placeholder="Electronics, Machinery, Vehicle"
                  value={assetType}
                  onChange={(e) => setAssetType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Purchase Cost (₹)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={purchaseAmount}
                  onChange={(e) => setPurchaseAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-600">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="px-5 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md">
                  {saving ? 'Saving...' : 'Save Asset'}
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
