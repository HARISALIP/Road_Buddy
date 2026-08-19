'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/navigation/Sidebar';
import BottomNav from '@/components/navigation/BottomNav';
import Header from '@/components/navigation/Header';
import UniversalTransactionForm from '@/components/forms/UniversalTransactionForm';
import { Car, Plus } from 'lucide-react';

interface VehicleItem {
  _id: string;
  name: string;
  registrationNumber?: string;
  status: 'active' | 'inactive';
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<VehicleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [name, setName] = useState('');
  const [regNum, setRegNum] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchVehicles = async () => {
    try {
      const res = await fetch('/api/vehicles');
      const data = await res.json();
      if (res.ok && data.vehicles) setVehicles(data.vehicles);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setSaving(true);
    try {
      const res = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, registrationNumber: regNum }),
      });
      setSaving(false);
      if (res.ok) {
        setIsFormOpen(false);
        setName('');
        setRegNum('');
        fetchVehicles();
      }
    } catch {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar onOpenAddModal={() => setIsAddModalOpen(true)} />

      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-8">
        <Header title="Vehicles Management" onOpenAddModal={() => setIsAddModalOpen(true)} />

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto w-full">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Fleet & Vehicles</h2>
              <p className="text-xs text-slate-500">Track vehicle-specific fuel, rent and maintenance expenses</p>
            </div>
            <button
              onClick={() => setIsFormOpen(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Vehicle
            </button>
          </div>

          {loading ? (
            <div className="py-20 text-center text-slate-400 text-xs">Loading vehicles...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vehicles.map((v) => (
                <div key={v._id} className="bg-white p-5 rounded-2xl border border-slate-200/80 card-shadow flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <Car className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{v.name}</h3>
                    <p className="text-xs text-slate-500 font-medium">{v.registrationNumber || 'No Reg Number'}</p>
                    <span className="inline-block mt-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                      Active Vehicle
                    </span>
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
            <h3 className="text-base font-bold text-slate-900">Add New Vehicle</h3>
            <form onSubmit={handleSaveVehicle} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Vehicle Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Suzuki or Daihatsu"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Registration / Plate Number</label>
                <input
                  type="text"
                  placeholder="KSA-9912"
                  value={regNum}
                  onChange={(e) => setRegNum(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-600">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="px-5 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md">
                  {saving ? 'Saving...' : 'Save Vehicle'}
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
