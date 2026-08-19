'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Receipt, Plus, FileText } from 'lucide-react';

interface BottomNavProps {
  onOpenAddModal: () => void;
}

export default function BottomNav({ onOpenAddModal }: BottomNavProps) {
  const pathname = usePathname();

  const NAV_ITEMS = [
    { label: 'Home', href: '/', icon: LayoutDashboard },
    { label: 'Transactions', href: '/transactions', icon: Receipt },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2 flex items-center justify-around shadow-lg">
      {/* Home & Transactions */}
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 transition-colors ${
              isActive ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px]">{item.label}</span>
          </Link>
        );
      })}

      {/* Central Floating Plus Button */}
      <button
        onClick={onOpenAddModal}
        aria-label="Add Transaction"
        className="-mt-6 w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-500/40 ring-4 ring-white transition-transform active:scale-95"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* Reports & Menu */}
      <Link
        href="/reports"
        className={`flex flex-col items-center gap-1 transition-colors ${
          pathname === '/reports' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <FileText className="w-5 h-5" />
        <span className="text-[10px]">Reports</span>
      </Link>

      <Link
        href="/partners"
        className={`flex flex-col items-center gap-1 transition-colors ${
          pathname.startsWith('/partners') || pathname.startsWith('/vehicles') ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <span className="w-5 h-5 flex items-center justify-center font-bold text-xs">•••</span>
        <span className="text-[10px]">More</span>
      </Link>
    </div>
  );
}
