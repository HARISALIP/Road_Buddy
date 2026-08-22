'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Receipt, 
  Plus, 
  FileText, 
  MoreHorizontal,
  Activity,
  Users,
  Car,
  UserCheck,
  Briefcase,
  Package,
  Settings,
  LogOut,
  X
} from 'lucide-react';

interface BottomNavProps {
  onOpenAddModal: () => void;
}

export default function BottomNav({ onOpenAddModal }: BottomNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const MAIN_NAV_ITEMS = [
    { label: 'Home', href: '/', icon: LayoutDashboard },
    { label: 'Transactions', href: '/transactions', icon: Receipt },
  ];

  const MENU_ITEMS = [
    { label: 'Activity Logs', href: '/logs', icon: Activity },
    { label: 'Partners', href: '/partners', icon: Users },
    { label: 'Vehicles', href: '/vehicles', icon: Car },
    { label: 'People', href: '/people', icon: UserCheck },
    { label: 'Jobs', href: '/jobs', icon: Briefcase },
    { label: 'Assets', href: '/assets', icon: Package },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  return (
    <>
      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm transition-opacity flex flex-col justify-end">
          <div 
            className="absolute inset-0" 
            onClick={() => setIsMenuOpen(false)}
          ></div>
          <div className="relative bg-white rounded-t-3xl shadow-2xl transform transition-transform duration-300 ease-out max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="font-bold text-slate-800 text-lg">Menu</h2>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto p-4 space-y-2 pb-8">
              {MENU_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl transition-all ${
                      isActive 
                        ? 'bg-blue-50 text-blue-700 font-semibold' 
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`p-2 rounded-xl ${isActive ? 'bg-blue-100/50' : 'bg-slate-100'}`}>
                      <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                    </div>
                    <span className="text-sm">{item.label}</span>
                  </Link>
                );
              })}
              
              <div className="h-px bg-slate-100 my-4"></div>
              
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 p-3.5 rounded-2xl text-red-600 hover:bg-red-50 transition-all font-semibold"
              >
                <div className="p-2 rounded-xl bg-red-100/50">
                  <LogOut className="w-5 h-5" />
                </div>
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2 flex items-center justify-around shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
        {/* Home & Transactions */}
        {MAIN_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 transition-all ${
                isActive ? 'text-blue-600 font-bold scale-105' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-[22px] h-[22px]" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px]">{item.label}</span>
            </Link>
          );
        })}

        {/* Central Floating Plus Button */}
        <button
          onClick={onOpenAddModal}
          aria-label="Add Transaction"
          className="-mt-8 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-500/40 ring-[6px] ring-white transition-transform active:scale-95 z-50"
        >
          <Plus className="w-7 h-7 stroke-[2.5]" />
        </button>

        {/* Reports & Menu */}
        <Link
          href="/reports"
          className={`flex flex-col items-center gap-1 transition-all ${
            pathname.startsWith('/reports') ? 'text-blue-600 font-bold scale-105' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-[22px] h-[22px]" strokeWidth={pathname.startsWith('/reports') ? 2.5 : 2} />
          <span className="text-[10px]">Reports</span>
        </Link>

        <button
          onClick={() => setIsMenuOpen(true)}
          className={`flex flex-col items-center gap-1 transition-all ${
            isMenuOpen ? 'text-blue-600 font-bold scale-105' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <MoreHorizontal className="w-[22px] h-[22px]" strokeWidth={isMenuOpen ? 2.5 : 2} />
          <span className="text-[10px]">More</span>
        </button>
      </div>
    </>
  );
}
