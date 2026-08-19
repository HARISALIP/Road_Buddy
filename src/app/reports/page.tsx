'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/navigation/Sidebar';
import BottomNav from '@/components/navigation/BottomNav';
import Header from '@/components/navigation/Header';
import UniversalTransactionForm from '@/components/forms/UniversalTransactionForm';
import { FileText, Download, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { DashboardMetrics } from '@/lib/calculations';

export default function ReportsPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    fetch('/api/dashboard')
      .then((res) => res.json())
      .then((data) => setMetrics(data))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const handleDownloadPdf = () => {
    window.open('/api/reports/pdf', '_blank');
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar onOpenAddModal={() => setIsAddModalOpen(true)} />

      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-8">
        <Header title="Reports & Analytics" onOpenAddModal={() => setIsAddModalOpen(true)} />

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Financial Reports</h2>
              <p className="text-xs text-slate-500">Operating P&L, Capital movements, and PDF export</p>
            </div>

            <button
              onClick={handleDownloadPdf}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" /> Download PDF Report
            </button>
          </div>

          {loading ? (
            <div className="py-20 text-center text-slate-400 text-xs">Generating report data...</div>
          ) : (
            <div className="space-y-6">
              {/* P&L Statement Card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 card-shadow space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-slate-900 text-base">Net Operating Profit Statement</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                    <span className="text-xs font-semibold text-emerald-700">Operational Income</span>
                    <p className="text-xl font-extrabold text-emerald-600 mt-1">
                      ₹{metrics?.totalIncome.toLocaleString() || 0}
                    </p>
                  </div>

                  <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                    <span className="text-xs font-semibold text-red-700">Operating Expenses</span>
                    <p className="text-xl font-extrabold text-red-600 mt-1">
                      - ₹{metrics?.totalExpenses.toLocaleString() || 0}
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <span className="text-xs font-semibold text-blue-700">Net Operating Profit</span>
                    <p className="text-xl font-extrabold text-blue-700 mt-1">
                      ₹{metrics?.operatingProfit.toLocaleString() || 0}
                    </p>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 text-center italic pt-1">
                  Accounting note: Partner investments, partner withdrawals, dividends, and asset sales are reported separately from net operating profit.
                </p>
              </div>

              {/* Capital & Equity Movements Card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 card-shadow space-y-4">
                <h3 className="font-bold text-slate-900 text-base pb-3 border-b border-slate-100">
                  Capital & Non-Operational Movement Breakdown
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-500 block">Total Investment</span>
                    <span className="text-base font-bold text-blue-600">₹{metrics?.totalInvestment.toLocaleString() || 0}</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-500 block">Partner Withdrawals</span>
                    <span className="text-base font-bold text-amber-600">₹{metrics?.totalWithdrawals.toLocaleString() || 0}</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-500 block">Dividends Distributed</span>
                    <span className="text-base font-bold text-purple-600">₹{metrics?.totalDividends.toLocaleString() || 0}</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-500 block">Asset Sales</span>
                    <span className="text-base font-bold text-teal-600">₹{metrics?.totalAssetSales.toLocaleString() || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <BottomNav onOpenAddModal={() => setIsAddModalOpen(true)} />
      <UniversalTransactionForm isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
}
