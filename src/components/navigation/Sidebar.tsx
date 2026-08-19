'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Receipt,
  FileText,
  Users,
  Car,
  UserCheck,
  Briefcase,
  Package,
  Settings,
  PlusCircle,
  ShieldCheck,
} from 'lucide-react';

interface SidebarProps {
  onOpenAddModal: () => void;
}

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Transactions', href: '/transactions', icon: Receipt },
  { label: 'Reports', href: '/reports', icon: FileText },
  { label: 'Partners', href: '/partners', icon: Users },
  { label: 'Vehicles', href: '/vehicles', icon: Car },
  { label: 'People', href: '/people', icon: UserCheck },
  { label: 'Jobs', href: '/jobs', icon: Briefcase },
  { label: 'Assets', href: '/assets', icon: Package },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar({ onOpenAddModal }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-slate-900 text-slate-300 border-r border-slate-800 min-h-screen sticky top-0 shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black tracking-wider text-base shadow-lg shadow-blue-500/20">
            RB
          </div>
          <div>
            <h1 className="font-bold text-white tracking-wide text-sm leading-tight">ROAD BUDDY</h1>
            <p className="text-[10px] text-slate-400 font-medium">FINANCE SYSTEM</p>
          </div>
        </div>
      </div>

      {/* Quick Add Action Button */}
      <div className="p-4">
        <button
          onClick={onOpenAddModal}
          className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>ADD TRANSACTION</span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 space-y-1 py-2 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* System Footer Badge */}
      <div className="p-4 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>Vercel + MongoDB Secure</span>
      </div>
    </aside>
  );
}
