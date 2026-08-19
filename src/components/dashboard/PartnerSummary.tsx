'use client';

import React from 'react';
import { Users, PieChart } from 'lucide-react';
import { PartnerSummaryItem } from '@/lib/calculations';

interface PartnerSummaryProps {
  partnerSummary: PartnerSummaryItem[];
}

export default function PartnerSummary({ partnerSummary = [] }: PartnerSummaryProps) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 card-shadow space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">PARTNER SUMMARY</h3>
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
          <PieChart className="w-3.5 h-3.5" />
          <span>Calculated Equity & Share</span>
        </div>
      </div>

      {partnerSummary.length === 0 ? (
        <p className="text-xs text-slate-400 py-4 text-center">No partner records loaded.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {partnerSummary.map((partner) => (
            <div
              key={partner.partnerId}
              className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{partner.name}</h4>
                  <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    Profit Share: {partner.profitSharePercentage}%
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                  {partner.name.charAt(partner.name.length - 1) || 'P'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="bg-white p-2.5 rounded-lg border border-slate-100">
                  <span className="text-slate-500 text-[10px] block">Investment</span>
                  <span className="font-bold text-blue-600">₹{partner.investment.toLocaleString()}</span>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-100">
                  <span className="text-slate-500 text-[10px] block">Withdrawal</span>
                  <span className="font-bold text-amber-600">₹{partner.withdrawal.toLocaleString()}</span>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-100">
                  <span className="text-slate-500 text-[10px] block">Dividend Paid</span>
                  <span className="font-bold text-purple-600">₹{partner.dividend.toLocaleString()}</span>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-100">
                  <span className="text-slate-500 text-[10px] block">Calculated Profit Share</span>
                  <span className="font-bold text-emerald-600">₹{partner.profitShare.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
