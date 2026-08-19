'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Receipt, Tag } from 'lucide-react';

interface TransactionItem {
  _id: string;
  transactionDate: string;
  transactionType: string;
  amount: number;
  status?: string;
  categoryId?: { name?: string };
  partnerId?: { name?: string };
  vehicleId?: { name?: string };
  personId?: { name?: string };
  remarks?: string;
}

interface RecentTransactionsProps {
  transactions: TransactionItem[];
  onSelectTransaction?: (tx: TransactionItem) => void;
}

export default function RecentTransactions({
  transactions = [],
  onSelectTransaction,
}: RecentTransactionsProps) {
  const getTypeBadge = (type: string, isVoid: boolean) => {
    if (isVoid) return { label: 'VOID', style: 'bg-slate-100 text-slate-400 line-through' };

    switch (type) {
      case 'income':
        return { label: 'Income', style: 'bg-emerald-50 text-emerald-600 font-bold' };
      case 'expense':
        return { label: 'Expense', style: 'bg-red-50 text-red-600 font-bold' };
      case 'investment':
        return { label: 'Investment', style: 'bg-blue-50 text-blue-600 font-bold' };
      case 'withdrawal':
        return { label: 'Withdrawal', style: 'bg-amber-50 text-amber-600 font-bold' };
      case 'dividend':
        return { label: 'Dividend', style: 'bg-purple-50 text-purple-600 font-bold' };
      case 'asset_sale':
        return { label: 'Asset Sale', style: 'bg-teal-50 text-teal-600 font-bold' };
      default:
        return { label: type, style: 'bg-slate-100 text-slate-700' };
    }
  };

  const isPositiveType = (type: string) =>
    type === 'income' || type === 'investment' || type === 'asset_sale';

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 card-shadow space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Receipt className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">RECENT TRANSACTIONS</h3>
        </div>
        <Link
          href="/transactions"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-8 text-slate-400 space-y-1">
          <p className="text-sm font-medium">No transactions recorded yet.</p>
          <p className="text-xs">Click + ADD TRANSACTION to record your first entry.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {transactions.map((tx) => {
            const isVoid = tx.status === 'void';
            const badge = getTypeBadge(tx.transactionType, isVoid);
            const title =
              tx.categoryId?.name ||
              tx.partnerId?.name ||
              tx.remarks ||
              tx.transactionType.toUpperCase();
            const dateStr = new Date(tx.transactionDate).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
            });

            return (
              <div
                key={tx._id}
                onClick={() => onSelectTransaction && onSelectTransaction(tx)}
                className="py-3 px-1 flex items-center justify-between hover:bg-slate-50 rounded-xl transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-blue-50 flex items-center justify-center text-slate-500 group-hover:text-blue-600 transition-colors shrink-0">
                    <Tag className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 leading-tight">{title}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${badge.style}`}>
                        {badge.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span>{dateStr}</span>
                      {tx.vehicleId?.name && <span>• {tx.vehicleId.name}</span>}
                      {tx.personId?.name && <span>• {tx.personId.name}</span>}
                      {tx.remarks && <span className="truncate max-w-[150px] sm:max-w-xs">• {tx.remarks}</span>}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-sm font-extrabold ${
                      isVoid
                        ? 'text-slate-400 line-through'
                        : isPositiveType(tx.transactionType)
                        ? 'text-emerald-600'
                        : 'text-slate-900'
                    }`}
                  >
                    {isPositiveType(tx.transactionType) ? '+' : '-'} ₹
                    {tx.amount.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
