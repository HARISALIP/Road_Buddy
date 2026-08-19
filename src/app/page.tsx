'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/navigation/Sidebar';
import BottomNav from '@/components/navigation/BottomNav';
import Header from '@/components/navigation/Header';
import SummaryCards from '@/components/dashboard/SummaryCards';
import MonthlyMetrics from '@/components/dashboard/MonthlyMetrics';
import PartnerSummary from '@/components/dashboard/PartnerSummary';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import UniversalTransactionForm, { TransactionType } from '@/components/forms/UniversalTransactionForm';

interface DashboardData {
  currentBalance: number;
  totalInvestment: number;
  totalIncome: number;
  totalExpenses: number;
  totalWithdrawals: number;
  totalDividends: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyNetChange: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  partnerSummary: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recentTransactions: any[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Universal Transaction Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<TransactionType>('expense');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedTxForEdit, setSelectedTxForEdit] = useState<any | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard');
      const json = await res.json();
      if (res.ok) {
        setData(json);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleOpenAddModal = (type: TransactionType = 'expense') => {
    setSelectedTxForEdit(null);
    setSelectedType(type);
    setIsAddModalOpen(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSelectTransaction = (tx: any) => {
    setSelectedTxForEdit(tx);
    setSelectedType(tx.transactionType);
    setIsAddModalOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <Sidebar onOpenAddModal={() => handleOpenAddModal('expense')} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-8">
        <Header title="Dashboard" onOpenAddModal={() => handleOpenAddModal('expense')} />

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-medium">Loading Road Buddy metrics...</p>
            </div>
          ) : (
            <>
              {/* Top Summary Metrics Cards */}
              <SummaryCards
                currentBalance={data?.currentBalance ?? 0}
                totalInvestment={data?.totalInvestment ?? 0}
                totalIncome={data?.totalIncome ?? 0}
                totalExpenses={data?.totalExpenses ?? 0}
                onOpenAddModal={handleOpenAddModal}
              />

              {/* Monthly Performance & Partner Summary Split */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <MonthlyMetrics
                    monthlyIncome={data?.monthlyIncome ?? 0}
                    monthlyExpenses={data?.monthlyExpenses ?? 0}
                    monthlyNetChange={data?.monthlyNetChange ?? 0}
                  />
                </div>

                <div className="lg:col-span-2">
                  <PartnerSummary partnerSummary={data?.partnerSummary ?? []} />
                </div>
              </div>

              {/* Recent Transactions Section */}
              <RecentTransactions
                transactions={data?.recentTransactions ?? []}
                onSelectTransaction={handleSelectTransaction}
              />
            </>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav onOpenAddModal={() => handleOpenAddModal('expense')} />

      {/* UNIVERSAL TRANSACTION FORM MODAL */}
      <UniversalTransactionForm
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        initialType={selectedType}
        initialData={selectedTxForEdit}
        onSuccess={() => {
          fetchDashboardData();
        }}
      />
    </div>
  );
}
