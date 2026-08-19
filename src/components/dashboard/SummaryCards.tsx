'use client';

import React from 'react';
import { Wallet, Briefcase, TrendingUp, TrendingDown, Plus } from 'lucide-react';
import { TransactionType } from '../forms/UniversalTransactionForm';

interface SummaryCardsProps {
  currentBalance: number;
  totalInvestment: number;
  totalIncome: number;
  totalExpenses: number;
  onOpenAddModal: (type?: TransactionType) => void;
}

export default function SummaryCards({
  currentBalance = 0,
  totalInvestment = 0,
  totalIncome = 0,
  totalExpenses = 0,
  onOpenAddModal,
}: SummaryCardsProps) {
  return (
    <div className="space-y-4">
      {/* Primary Balance Hero Card */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10 pointer-events-none">
          <Wallet className="w-48 h-48" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-blue-100 uppercase tracking-wider">CURRENT BALANCE</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1">
              ₹{currentBalance.toLocaleString()}
            </h2>
            <p className="text-xs text-blue-200 mt-1 font-medium">Calculated automatically from all active transactions</p>
          </div>

          {/* Quick Action Pre-selectors */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => onOpenAddModal('expense')}
              className="flex-1 sm:flex-none px-3.5 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Expense</span>
            </button>

            <button
              onClick={() => onOpenAddModal('income')}
              className="flex-1 sm:flex-none px-3.5 py-2 bg-white text-blue-700 hover:bg-blue-50 font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Income</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3 Secondary Cards: Total Investment, Total Income, Total Expenses */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* TOTAL INVESTMENT */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 card-shadow card-shadow-hover flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">TOTAL INVESTMENT</span>
            <p className="text-xl font-bold text-slate-900 mt-1">
              ₹{totalInvestment.toLocaleString()}
            </p>
            <span className="inline-block text-[10px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded mt-1">
              Partner Capital (Not Income)
            </span>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        {/* TOTAL INCOME */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 card-shadow card-shadow-hover flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">TOTAL INCOME</span>
            <p className="text-xl font-bold text-emerald-600 mt-1">
              + ₹{totalIncome.toLocaleString()}
            </p>
            <span className="inline-block text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded mt-1">
              Operational Earnings
            </span>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* TOTAL EXPENSES */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 card-shadow card-shadow-hover flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">TOTAL EXPENSES</span>
            <p className="text-xl font-bold text-red-600 mt-1">
              - ₹{totalExpenses.toLocaleString()}
            </p>
            <span className="inline-block text-[10px] text-red-600 font-semibold bg-red-50 px-2 py-0.5 rounded mt-1">
              Operational Costs
            </span>
          </div>
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center shrink-0">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>
      </div>
    </div>
  );
}
