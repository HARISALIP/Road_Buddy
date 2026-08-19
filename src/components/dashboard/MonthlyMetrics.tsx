'use client';

import React from 'react';
import { Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface MonthlyMetricsProps {
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyNetChange: number;
}

export default function MonthlyMetrics({
  monthlyIncome = 0,
  monthlyExpenses = 0,
  monthlyNetChange = 0,
}: MonthlyMetricsProps) {
  const isPositive = monthlyNetChange >= 0;

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 card-shadow">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">THIS MONTH</h3>
        </div>
        <span className="text-xs text-slate-500 font-medium">
          {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        {/* Income */}
        <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
          <span className="text-[11px] font-semibold text-emerald-700">Income</span>
          <p className="text-base sm:text-lg font-extrabold text-emerald-600 mt-0.5">
            + ₹{monthlyIncome.toLocaleString()}
          </p>
        </div>

        {/* Expenses */}
        <div className="p-3 bg-red-50/60 rounded-xl border border-red-100">
          <span className="text-[11px] font-semibold text-red-700">Expenses</span>
          <p className="text-base sm:text-lg font-extrabold text-red-600 mt-0.5">
            - ₹{monthlyExpenses.toLocaleString()}
          </p>
        </div>

        {/* Net Change */}
        <div className={`p-3 rounded-xl border ${isPositive ? 'bg-blue-50/60 border-blue-100' : 'bg-amber-50/60 border-amber-100'}`}>
          <div className="flex items-center justify-center gap-0.5">
            <span className="text-[11px] font-semibold text-slate-700">Net Change</span>
            {isPositive ? (
              <ArrowUpRight className="w-3 h-3 text-emerald-600" />
            ) : (
              <ArrowDownRight className="w-3 h-3 text-red-600" />
            )}
          </div>
          <p className={`text-base sm:text-lg font-extrabold mt-0.5 ${isPositive ? 'text-blue-700' : 'text-amber-700'}`}>
            {isPositive ? '+' : ''} ₹{monthlyNetChange.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
