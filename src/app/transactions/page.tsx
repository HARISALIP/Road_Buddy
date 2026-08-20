'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from '@/components/navigation/Sidebar';
import BottomNav from '@/components/navigation/BottomNav';
import Header from '@/components/navigation/Header';
import FilterBar, { FilterState } from '@/components/transactions/FilterBar';
import ExcelImportModal from '@/components/transactions/ExcelImportModal';
import UniversalTransactionForm, { TransactionType } from '@/components/forms/UniversalTransactionForm';
import { Download, Upload, PlusCircle, Ban, Edit3 } from 'lucide-react';

interface TransactionItem {
  _id: string;
  transactionDate: string;
  transactionType: TransactionType;
  amount: number;
  paymentMethod?: string;
  invoiceNumber?: string;
  remarks?: string;
  status: 'active' | 'void';
  categoryId?: { _id: string; name: string };
  partnerId?: { _id: string; name: string };
  personId?: { _id: string; name: string };
  vehicleId?: { _id: string; name: string };
  jobId?: { _id: string; jobNumber: string };
  assetId?: { _id: string; name: string };
}

const DEFAULT_FILTERS: FilterState = {
  type: 'all',
  categoryId: '',
  partnerId: '',
  vehicleId: '',
  personId: '',
  paymentMethod: '',
  dateFrom: '',
  dateTo: '',
  search: '',
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Dropdowns
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [partners, setPartners] = useState<{ _id: string; name: string }[]>([]);
  const [vehicles, setVehicles] = useState<{ _id: string; name: string }[]>([]);
  const [people, setPeople] = useState<{ _id: string; name: string }[]>([]);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<TransactionType>('income');
  const [selectedTxForEdit, setSelectedTxForEdit] = useState<TransactionItem | null>(null);

  const fetchDropdowns = async () => {
    try {
      const [catRes, partRes, vehRes, pepRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/partners'),
        fetch('/api/vehicles'),
        fetch('/api/people'),
      ]);
      const catData = await catRes.json();
      const partData = await partRes.json();
      const vehData = await vehRes.json();
      const pepData = await pepRes.json();

      if (catData.categories) setCategories(catData.categories);
      if (partData.partners) setPartners(partData.partners);
      if (vehData.vehicles) setVehicles(vehData.vehicles);
      if (pepData.people) setPeople(pepData.people);
    } catch (e) {
      console.error('Failed to load dropdowns:', e);
    }
  };

  const fetchTransactions = useCallback(async (pageNum: number = 1) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const queryParams = new URLSearchParams();
      if (filters.type && filters.type !== 'all') queryParams.append('type', filters.type);
      if (filters.categoryId) queryParams.append('categoryId', filters.categoryId);
      if (filters.partnerId) queryParams.append('partnerId', filters.partnerId);
      if (filters.vehicleId) queryParams.append('vehicleId', filters.vehicleId);
      if (filters.personId) queryParams.append('personId', filters.personId);
      if (filters.paymentMethod) queryParams.append('paymentMethod', filters.paymentMethod);
      if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);
      if (filters.search) queryParams.append('search', filters.search);
      
      queryParams.append('page', pageNum.toString());
      queryParams.append('limit', '20');

      const res = await fetch(`/api/transactions?${queryParams.toString()}`);
      const data = await res.json();
      if (res.ok && data.transactions) {
        if (pageNum === 1) {
          setTransactions(data.transactions);
        } else {
          setTransactions((prev) => [...prev, ...data.transactions]);
        }
        setHasMore(data.hasMore);
        setPage(pageNum);
      }
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      if (pageNum === 1) setLoading(false);
      else setLoadingMore(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchDropdowns();
  }, []);

  useEffect(() => {
    fetchTransactions(1);
  }, [fetchTransactions]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          fetchTransactions(page + 1);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) observer.unobserve(currentTarget);
    };
  }, [hasMore, loading, loadingMore, page, fetchTransactions]);

  const handleOpenAddModal = (type: TransactionType = 'income') => {
    setSelectedTxForEdit(null);
    setSelectedType(type);
    setIsAddModalOpen(true);
  };

  const handleEdit = (tx: TransactionItem) => {
    setSelectedTxForEdit(tx);
    setSelectedType(tx.transactionType);
    setIsAddModalOpen(true);
  };

  const handleVoid = async (id: string) => {
    if (!confirm('Are you sure you want to void this transaction? It will be excluded from balance calculations.')) return;
    try {
      const res = await fetch(`/api/transactions/${id}/void`, { method: 'POST' });
      if (res.ok) {
        fetchTransactions(1);
      } else {
        alert('Failed to void transaction');
      }
    } catch {
      alert('Error voiding transaction');
    }
  };

  const handleExport = () => {
    window.open('/api/transactions/export', '_blank');
  };

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
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar onOpenAddModal={() => handleOpenAddModal('income')} />

      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-8">
        <Header title="Transactions" onOpenAddModal={() => handleOpenAddModal('income')} />

        <main className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-7xl mx-auto w-full">
          {/* Top Actions Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Transaction History</h2>
              <p className="text-xs text-slate-500">Manage all expenses, income, investments & dividends</p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="flex-1 sm:flex-none px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Import Excel</span>
              </button>

              <button
                onClick={handleExport}
                className="flex-1 sm:flex-none px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Excel</span>
              </button>

              <button
                onClick={() => handleOpenAddModal('income')}
                className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Search & Multi-Filter Bar */}
          <FilterBar
            filters={filters}
            onChange={(updated) => setFilters((prev) => ({ ...prev, ...updated }))}
            onReset={() => setFilters(DEFAULT_FILTERS)}
            categories={categories}
            partners={partners}
            vehicles={vehicles}
            people={people}
          />

          {/* List Content */}
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500">Loading transactions...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
              <p className="text-sm font-bold text-slate-700">No matching transactions found</p>
              <p className="text-xs text-slate-400">Try adjusting your search criteria or add a new transaction.</p>
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE VIEW */}
              <div className="hidden lg:block bg-white rounded-2xl border border-slate-200/80 card-shadow overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Date</th>
                      <th className="py-3.5 px-4">Type</th>
                      <th className="py-3.5 px-4">Category / Item</th>
                      <th className="py-3.5 px-4">Amount</th>
                      <th className="py-3.5 px-4">Partner / Person</th>
                      <th className="py-3.5 px-4">Vehicle</th>
                      <th className="py-3.5 px-4">Invoice / Remarks</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {transactions.map((tx) => {
                      const isVoid = tx.status === 'void';
                      const badge = getTypeBadge(tx.transactionType, isVoid);
                      const isPos = isPositiveType(tx.transactionType);

                      return (
                        <tr key={tx._id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-medium text-slate-600 whitespace-nowrap">
                            {new Date(tx.transactionDate).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] ${badge.style}`}>
                              {badge.label}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900">
                            {tx.categoryId?.name || tx.partnerId?.name || tx.assetId?.name || '-'}
                          </td>
                          <td className="py-3 px-4 font-extrabold whitespace-nowrap">
                            <span className={isVoid ? 'text-slate-400 line-through' : isPos ? 'text-emerald-600' : 'text-slate-900'}>
                              {isPos ? '+' : '-'} ₹{tx.amount.toLocaleString()}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {tx.partnerId?.name || tx.personId?.name || '-'}
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {tx.vehicleId?.name || '-'}
                          </td>
                          <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                            {tx.invoiceNumber && <span className="font-semibold text-slate-700 mr-1">#{tx.invoiceNumber}</span>}
                            {tx.remarks || '-'}
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap space-x-1">
                            <button
                              onClick={() => handleEdit(tx)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                              title="Edit"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            {!isVoid && (
                              <button
                                onClick={() => handleVoid(tx._id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                title="Void Transaction"
                              >
                                <Ban className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* MOBILE CARDS VIEW */}
              <div className="lg:hidden space-y-3">
                {transactions.map((tx) => {
                  const isVoid = tx.status === 'void';
                  const badge = getTypeBadge(tx.transactionType, isVoid);
                  const isPos = isPositiveType(tx.transactionType);

                  return (
                    <div
                      key={tx._id}
                      onClick={() => handleEdit(tx)}
                      className="bg-white p-4 rounded-2xl border border-slate-200/80 card-shadow space-y-2 cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] ${badge.style}`}>
                            {badge.label}
                          </span>
                          <span className="text-xs font-semibold text-slate-500">
                            {new Date(tx.transactionDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>

                        <span className={`text-base font-extrabold ${isVoid ? 'text-slate-400 line-through' : isPos ? 'text-emerald-600' : 'text-slate-900'}`}>
                          {isPos ? '+' : '-'} ₹{tx.amount.toLocaleString()}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">
                          {tx.categoryId?.name || tx.partnerId?.name || tx.assetId?.name || tx.transactionType.toUpperCase()}
                        </h4>
                        {tx.remarks && <p className="text-xs text-slate-500 mt-0.5">{tx.remarks}</p>}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                        <span>
                          {tx.vehicleId?.name ? `Vehicle: ${tx.vehicleId.name}` : tx.partnerId?.name ? `Partner: ${tx.partnerId.name}` : ''}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(tx);
                            }}
                            className="text-blue-600 font-bold"
                          >
                            Edit
                          </button>
                          {!isVoid && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleVoid(tx._id);
                              }}
                              className="text-red-500 font-bold"
                            >
                              Void
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Observer Target */}
              {hasMore && (
                <div ref={observerTarget} className="py-6 flex justify-center items-center">
                  {loadingMore ? (
                    <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      Loading more...
                    </div>
                  ) : (
                    <div className="h-5" />
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <BottomNav onOpenAddModal={() => handleOpenAddModal('income')} />

      <UniversalTransactionForm
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        initialType={selectedType}
        initialData={selectedTxForEdit}
        onSuccess={() => fetchTransactions(1)}
      />

      <ExcelImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => fetchTransactions(1)}
      />
    </div>
  );
}
