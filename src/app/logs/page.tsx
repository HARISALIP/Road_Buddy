'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/navigation/Sidebar';
import { Header } from '@/components/navigation/Header';
import { Activity, Clock, PlusCircle, Trash2, Edit } from 'lucide-react';
import { format } from 'date-fns';

interface LogEntry {
  _id: string;
  user: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'OTHER';
  entityType: string;
  details: string;
  createdAt: string;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/logs');
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs);
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATE':
        return <PlusCircle className="w-5 h-5 text-emerald-400" />;
      case 'UPDATE':
        return <Edit className="w-5 h-5 text-blue-400" />;
      case 'DELETE':
        return <Trash2 className="w-5 h-5 text-red-400" />;
      default:
        return <Activity className="w-5 h-5 text-slate-400" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'UPDATE':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'DELETE':
        return 'text-red-400 bg-red-400/10 border-red-400/20';
      default:
        return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  return (
    <div className="flex h-screen bg-[#0B0F19] text-white overflow-hidden selection:bg-emerald-500/30">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 scroll-smooth custom-scrollbar">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  <Activity className="w-6 h-6 text-emerald-400" />
                  Activity Logs
                </h1>
                <p className="text-slate-400 text-sm mt-1">Track actions and events across the system</p>
              </div>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-xl">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
                </div>
              ) : logs.length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-300">No logs found</h3>
                  <p className="text-slate-500 mt-1">Actions performed in the system will appear here.</p>
                </div>
              ) : (
                <div className="relative border-l border-slate-800 ml-4 space-y-8 py-4">
                  {logs.map((log) => (
                    <div key={log._id} className="relative pl-8">
                      {/* Timeline Dot */}
                      <div className="absolute -left-[11px] top-1 bg-slate-900 rounded-full p-1 border border-slate-800">
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-600"></div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                        <div className="flex-shrink-0 mt-0.5">
                          {getActionIcon(log.action)}
                        </div>
                        
                        <div className="flex-1 bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 transition-all hover:border-slate-700">
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-emerald-400">{log.user}</span>
                              <span className="text-slate-500 text-sm">performed</span>
                              <span className={`text-xs px-2 py-0.5 rounded-md border ${getActionColor(log.action)}`}>
                                {log.action}
                              </span>
                              <span className="text-slate-500 text-sm">on</span>
                              <span className="font-medium text-slate-300">{log.entityType}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-950/50 px-2 py-1 rounded-md">
                              <Clock className="w-3.5 h-3.5" />
                              {format(new Date(log.createdAt), 'MMM d, yyyy - h:mm a')}
                            </div>
                          </div>
                          
                          <p className="text-slate-300 text-sm">{log.details}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
