'use client';

import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';

export interface FilterState {
  type: string;
  categoryId: string;
  partnerId: string;
  vehicleId: string;
  personId: string;
  paymentMethod: string;
  dateFrom: string;
  dateTo: string;
  search: string;
}

interface FilterBarProps {
  filters: FilterState;
  onChange: (updated: Partial<FilterState>) => void;
  onReset: () => void;
  categories: { _id: string; name: string }[];
  partners: { _id: string; name: string }[];
  vehicles: { _id: string; name: string }[];
  people: { _id: string; name: string }[];
}

export default function FilterBar({
  filters,
  onChange,
  onReset,
  categories = [],
  partners = [],
  vehicles = [],
  people = [],
}: FilterBarProps) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 card-shadow space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Search & Filters</h3>
        </div>
        <button
          onClick={onReset}
          className="text-xs font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Filters</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          placeholder="Search by remarks, invoice #, customer..."
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value })}
          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
      </div>

      {/* Filter Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-xs">
        {/* Type */}
        <select
          value={filters.type}
          onChange={(e) => onChange({ type: e.target.value })}
          className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:bg-white"
        >
          <option value="all">All Types</option>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
          <option value="investment">Investment</option>
          <option value="withdrawal">Withdrawal</option>
          <option value="dividend">Dividend</option>
          <option value="asset_sale">Asset Sale</option>
        </select>

        {/* Category */}
        <select
          value={filters.categoryId}
          onChange={(e) => onChange({ categoryId: e.target.value })}
          className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:bg-white"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Partner */}
        <select
          value={filters.partnerId}
          onChange={(e) => onChange({ partnerId: e.target.value })}
          className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:bg-white"
        >
          <option value="">All Partners</option>
          {partners.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>

        {/* Vehicle */}
        <select
          value={filters.vehicleId}
          onChange={(e) => onChange({ vehicleId: e.target.value })}
          className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:bg-white"
        >
          <option value="">All Vehicles</option>
          {vehicles.map((v) => (
            <option key={v._id} value={v._id}>
              {v.name}
            </option>
          ))}
        </select>

        {/* Person */}
        <select
          value={filters.personId}
          onChange={(e) => onChange({ personId: e.target.value })}
          className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:bg-white"
        >
          <option value="">All People</option>
          {people.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>

        {/* Date From */}
        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => onChange({ dateFrom: e.target.value })}
          className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:bg-white"
        />

        {/* Date To */}
        <input
          type="date"
          value={filters.dateTo}
          onChange={(e) => onChange({ dateTo: e.target.value })}
          className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:bg-white"
        />
      </div>
    </div>
  );
}
