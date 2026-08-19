'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Briefcase,
  Layers,
  Building2,
  PackageCheck,
  AlertCircle,
  PlusCircle,
  LayoutDashboard,
} from 'lucide-react';

export type TransactionType =
  | 'expense'
  | 'income'
  | 'investment'
  | 'withdrawal'
  | 'dividend'
  | 'asset_sale';

interface DropdownItem {
  _id: string;
  name: string;
  type?: string;
  registrationNumber?: string;
  jobNumber?: string;
}

interface UniversalFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: TransactionType;
  initialData?: Record<string, unknown>;
  onSuccess?: () => void;
}

const TYPE_OPTIONS: { id: TransactionType; label: string; icon: React.ElementType; color: string }[] = [
  { id: 'income', label: 'Income', icon: TrendingUp, color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  { id: 'expense', label: 'Expense', icon: TrendingDown, color: 'bg-red-50 text-red-600 border-red-200' },
  { id: 'investment', label: 'Investment', icon: Briefcase, color: 'bg-blue-50 text-blue-600 border-blue-200' },
  { id: 'withdrawal', label: 'Withdrawal', icon: Layers, color: 'bg-amber-50 text-amber-600 border-amber-200' },
  { id: 'dividend', label: 'Dividend', icon: Building2, color: 'bg-purple-50 text-purple-600 border-purple-200' },
  { id: 'asset_sale', label: 'Asset Sale', icon: PackageCheck, color: 'bg-teal-50 text-teal-600 border-teal-200' },
];

export default function UniversalTransactionForm({
  isOpen,
  onClose,
  initialType = 'income',
  initialData,
  onSuccess,
}: UniversalFormProps) {
  const [transactionType, setTransactionType] = useState<TransactionType>(initialType);
  const [showMoreDetails, setShowMoreDetails] = useState(false);

  // Dynamic dropdown lists loaded from server
  const [categories, setCategories] = useState<DropdownItem[]>([]);
  const [partners, setPartners] = useState<DropdownItem[]>([]);
  const [vehicles, setVehicles] = useState<DropdownItem[]>([]);
  const [people, setPeople] = useState<DropdownItem[]>([]);
  const [jobs, setJobs] = useState<DropdownItem[]>([]);
  const [assets, setAssets] = useState<DropdownItem[]>([]);

  // Form State
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [partnerId, setPartnerId] = useState<string>('');
  const [personId, setPersonId] = useState<string>('');
  const [vehicleId, setVehicleId] = useState<string>('');
  const [jobId, setJobId] = useState<string>('');
  const [assetId, setAssetId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('Cash');
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [profitPeriod, setProfitPeriod] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');
  const [attachmentUrl, setAttachmentUrl] = useState<string>('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saveResult, setSaveResult] = useState<{
    saved: boolean;
    txType: string;
    amount: number;
    newBalance?: number;
  } | null>(null);

  // Fetch dropdown options when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchDropdowns();
      if (initialData) {
        // Edit mode pre-population
        if (initialData.transactionType) setTransactionType(initialData.transactionType as TransactionType);
        if (initialData.transactionDate) setDate(new Date(initialData.transactionDate as string).toISOString().split('T')[0]);
        if (initialData.amount) setAmount(String(initialData.amount));
        if (initialData.categoryId) setCategoryId(String((initialData.categoryId as { _id?: string })._id || initialData.categoryId));
        if (initialData.partnerId) setPartnerId(String((initialData.partnerId as { _id?: string })._id || initialData.partnerId));
        if (initialData.personId) setPersonId(String((initialData.personId as { _id?: string })._id || initialData.personId));
        if (initialData.vehicleId) setVehicleId(String((initialData.vehicleId as { _id?: string })._id || initialData.vehicleId));
        if (initialData.jobId) setJobId(String((initialData.jobId as { _id?: string })._id || initialData.jobId));
        if (initialData.assetId) setAssetId(String((initialData.assetId as { _id?: string })._id || initialData.assetId));
        if (initialData.paymentMethod) setPaymentMethod(String(initialData.paymentMethod));
        if (initialData.invoiceNumber) setInvoiceNumber(String(initialData.invoiceNumber));
        if (initialData.profitPeriod) setProfitPeriod(String(initialData.profitPeriod));
        if (initialData.reason) setReason(String(initialData.reason));
        if (initialData.customerName) setCustomerName(String(initialData.customerName));
        if (initialData.remarks) setRemarks(String(initialData.remarks));
      } else {
        setTransactionType(initialType);
      }
    } else {
      resetForm();
    }
  }, [isOpen, initialType, initialData]);

  const fetchDropdowns = async () => {
    try {
      const [catRes, partRes, vehRes, pepRes, jobRes, astRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/partners'),
        fetch('/api/vehicles'),
        fetch('/api/people'),
        fetch('/api/jobs'),
        fetch('/api/assets'),
      ]);

      const catData = await catRes.json();
      const partData = await partRes.json();
      const vehData = await vehRes.json();
      const pepData = await pepRes.json();
      const jobData = await jobRes.json();
      const astData = await astRes.json();

      if (catData.categories) setCategories(catData.categories);
      if (partData.partners) setPartners(partData.partners);
      if (vehData.vehicles) setVehicles(vehData.vehicles);
      if (pepData.people) setPeople(pepData.people);
      if (jobData.jobs) setJobs(jobData.jobs);
      if (astData.assets) setAssets(astData.assets);
    } catch (e) {
      console.error('Error loading form dropdowns:', e);
    }
  };

  const resetForm = () => {
    setAmount('');
    setCategoryId('');
    setPartnerId('');
    setPersonId('');
    setVehicleId('');
    setJobId('');
    setAssetId('');
    setInvoiceNumber('');
    setProfitPeriod('');
    setReason('');
    setCustomerName('');
    setRemarks('');
    setAttachmentUrl('');
    setErrorMsg(null);
    setSaveResult(null);
  };

  const handleTypeChange = (type: TransactionType) => {
    setTransactionType(type);
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('Please enter a valid amount greater than 0.');
      return;
    }

    if (transactionType === 'expense' && !categoryId) {
      setErrorMsg('Please select an Expense Category.');
      return;
    }
    if (transactionType === 'income' && !categoryId) {
      setErrorMsg('Please select an Income Category.');
      return;
    }
    if ((transactionType === 'investment' || transactionType === 'withdrawal' || transactionType === 'dividend') && !partnerId) {
      setErrorMsg('Please select a Partner.');
      return;
    }
    if (transactionType === 'asset_sale' && !assetId) {
      setErrorMsg('Please select an Asset.');
      return;
    }

    setLoading(true);

    try {
      const isEditing = Boolean(initialData?._id);
      const url = isEditing ? `/api/transactions/${initialData?._id}` : '/api/transactions';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionType,
          transactionDate: date,
          amount: numAmount,
          categoryId: categoryId || undefined,
          partnerId: partnerId || undefined,
          personId: personId || undefined,
          vehicleId: vehicleId || undefined,
          jobId: jobId || undefined,
          assetId: assetId || undefined,
          paymentMethod,
          invoiceNumber,
          profitPeriod,
          reason,
          customerName,
          remarks,
          attachmentUrl,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setErrorMsg(data.error || 'Unable to save transaction. Please check your connection.');
        return;
      }

      // Fetch fresh balance metric for confirmation
      const dashRes = await fetch('/api/dashboard');
      const dashData = await dashRes.json();

      setSaveResult({
        saved: true,
        txType: transactionType,
        amount: numAmount,
        newBalance: dashData.currentBalance ?? 0,
      });

      if (onSuccess) onSuccess();
    } catch {
      setLoading(false);
      setErrorMsg('Unable to save transaction. Please check your network connection.');
    }
  };

  if (!isOpen) return null;

  // Filtered categories based on selected transactionType
  const filteredCategories = categories.filter((c) => c.type === (transactionType === 'income' ? 'income' : 'expense'));

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {initialData?._id ? 'EDIT TRANSACTION' : 'ADD TRANSACTION'}
            </h2>
            <p className="text-xs text-slate-500">
              {initialData?._id ? 'Modify transaction record details' : 'Record business cash flow instantly'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {saveResult?.saved ? (
            /* SUCCESS CONFIRMATION SCREEN */
            <div className="text-center py-6 space-y-5">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-900">Transaction Saved!</h3>
                <p className="text-sm text-slate-600 capitalize">
                  {saveResult.txType} • ₹{saveResult.amount.toLocaleString()}
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 max-w-xs mx-auto">
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">New Calculated Balance</span>
                <p className="text-2xl font-bold text-blue-900 mt-1">
                  ₹{saveResult.newBalance?.toLocaleString()}
                </p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setSaveResult(null);
                    resetForm();
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 text-white font-medium text-sm rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" /> Add Another
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 text-slate-700 font-medium text-sm rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs font-medium text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* 1. TRANSACTION TYPE SELECTION */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                  Transaction Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {TYPE_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = transactionType === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleTypeChange(opt.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all flex flex-col items-center sm:items-start gap-1.5 ${
                          isSelected
                            ? `${opt.color} border-2 ring-2 ring-blue-500/20 font-bold shadow-sm`
                            : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-xs">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. DATE & AMOUNT */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Amount (₹) *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <input
                      type="number"
                      step="any"
                      inputMode="decimal"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* 3. DYNAMIC TYPE-SPECIFIC REQUIRED FIELDS */}

              {/* EXPENSE / INCOME -> CATEGORY */}
              {(transactionType === 'expense' || transactionType === 'income') && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    {transactionType === 'expense' ? 'Expense Category *' : 'Income Category *'}
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                  >
                    <option value="">Select Category</option>
                    {filteredCategories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* INVESTMENT / WITHDRAWAL / DIVIDEND -> PARTNER */}
              {(transactionType === 'investment' ||
                transactionType === 'withdrawal' ||
                transactionType === 'dividend') && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Partner *
                  </label>
                  <select
                    value={partnerId}
                    onChange={(e) => setPartnerId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                  >
                    <option value="">Select Partner</option>
                    {partners.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* DIVIDEND -> PROFIT PERIOD */}
              {transactionType === 'dividend' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Profit Period
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Q2 2026 or Jan 2026 - Jun 2026"
                    value={profitPeriod}
                    onChange={(e) => setProfitPeriod(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                  />
                </div>
              )}

              {/* WITHDRAWAL -> REASON */}
              {transactionType === 'withdrawal' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Reason
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                  >
                    <option value="Personal Withdrawal">Personal Withdrawal</option>
                    <option value="Advance">Advance</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              )}

              {/* ASSET SALE -> ASSET */}
              {transactionType === 'asset_sale' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Select Asset *
                  </label>
                  <select
                    value={assetId}
                    onChange={(e) => setAssetId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                  >
                    <option value="">Select Asset</option>
                    {assets.map((a) => (
                      <option key={a._id} value={a._id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* 4. EXPANDABLE "MORE DETAILS" ACCORDION FOR OPTIONAL FIELDS */}
              <div className="border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setShowMoreDetails(!showMoreDetails)}
                  className="w-full py-2 flex items-center justify-between text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <span>{showMoreDetails ? 'Hide Optional Details' : 'More Details (Vehicle, Person, Payment, Remarks)'}</span>
                  {showMoreDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showMoreDetails && (
                  <div className="mt-3 space-y-4 pt-2 border-t border-slate-100">
                    {/* Vehicle */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                        Vehicle (Optional)
                      </label>
                      <select
                        value={vehicleId}
                        onChange={(e) => setVehicleId(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                      >
                        <option value="">None</option>
                        {vehicles.map((v) => (
                          <option key={v._id} value={v._id}>
                            {v.name} {v.registrationNumber ? `(${v.registrationNumber})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Person */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                        Person / Staff (Optional)
                      </label>
                      <select
                        value={personId}
                        onChange={(e) => setPersonId(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                      >
                        <option value="">None</option>
                        {people.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Job */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                        Job / Order (Optional)
                      </label>
                      <select
                        value={jobId}
                        onChange={(e) => setJobId(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                      >
                        <option value="">None</option>
                        {jobs.map((j) => (
                          <option key={j._id} value={j._id}>
                            {j.jobNumber} {j.customerName ? `- ${j.customerName}` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Payment Method & Invoice */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                          Payment Method
                        </label>
                        <select
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                        >
                          <option value="Cash">Cash</option>
                          <option value="Bank">Bank Transfer</option>
                          <option value="Card">Card</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                          Invoice / Ref Number
                        </label>
                        <input
                          type="text"
                          placeholder="INV-1092"
                          value={invoiceNumber}
                          onChange={(e) => setInvoiceNumber(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                        />
                      </div>
                    </div>

                    {/* Customer Name */}
                    {transactionType === 'income' && (
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                          Customer Name (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Aramco Transport"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                        />
                      </div>
                    )}

                    {/* Remarks */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                        Remarks / Notes
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Additional details..."
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* STICKY SAVE BUTTON FOR MOBILE */}
              <div className="pt-3 sticky bottom-0 bg-white pb-2 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving Transaction...</span>
                    </>
                  ) : (
                    <span>SAVE TRANSACTION</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
