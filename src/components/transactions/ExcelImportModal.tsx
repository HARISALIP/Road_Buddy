'use client';

import React, { useState } from 'react';
import { X, Upload, FileSpreadsheet, CheckCircle, AlertTriangle, RefreshCw, PlusCircle } from 'lucide-react';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface PreviewRow {
  rowId: number;
  transactionDate: string;
  transactionType: 'expense' | 'income' | 'investment';
  lineItem: string;
  amount: number;
  remarks: string;
  person: string;
  vehicle: string;
  isValid: boolean;
  error?: string;
}

export default function ExcelImportModal({ isOpen, onClose, onSuccess }: ExcelImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [result, setResult] = useState<{ importedCount: number; failedCount: number; errors: string[] } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setErrorMsg(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', selected);

      const res = await fetch('/api/transactions/import', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok && data.preview) {
        setPreview(data.preview);
      } else {
        setErrorMsg(data.error || 'Failed to parse Excel file.');
      }
    } catch {
      setLoading(false);
      setErrorMsg('Error connecting to import endpoint.');
    }
  };

  const handleConfirmImport = async () => {
    if (!preview || preview.length === 0) return;
    setImporting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/transactions/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: preview, importMode }),
      });

      const data = await res.json();
      setImporting(false);

      if (res.ok) {
        setResult(data);
        onSuccess();
      } else {
        setErrorMsg(data.error || 'Batch import failed.');
      }
    } catch {
      setImporting(false);
      setErrorMsg('Network error during batch import.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-base">Import Excel Transactions</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-700 text-xs font-medium rounded-xl border border-red-200">
              {errorMsg}
            </div>
          )}

          {result ? (
            <div className="text-center py-6 space-y-4">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
              <div>
                <h4 className="text-lg font-bold text-slate-900">Import Complete</h4>
                <p className="text-sm text-slate-600">
                  Successfully imported {result.importedCount} transactions.
                </p>
                {result.failedCount > 0 && (
                  <p className="text-xs text-amber-600 mt-1">Failed rows: {result.failedCount}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Close
              </button>
            </div>
          ) : !preview ? (
            <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-8 text-center bg-slate-50/50 transition-colors">
              <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700">Choose Excel File (.xlsx, .xls)</p>
              <p className="text-xs text-slate-400 mt-1">
                Supports Date, Line Item, Investment, Income, Expense, Remarks, Person columns
              </p>
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                className="hidden"
                id="excel-file-input"
              />
              <label
                htmlFor="excel-file-input"
                className="mt-4 inline-block px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-colors"
              >
                {loading ? 'Reading File...' : 'Select File'}
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>File: <strong>{file?.name}</strong></span>
                <span>Found <strong>{preview.length}</strong> rows</span>
              </div>

              {/* Import Mode Selection */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
                <span className="text-xs font-bold text-slate-700 block">Select Import Action</span>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setImportMode('append')}
                    className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all ${
                      importMode === 'append'
                        ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <PlusCircle className={`w-4 h-4 mt-0.5 shrink-0 ${importMode === 'append' ? 'text-blue-600' : 'text-slate-400'}`} />
                    <div>
                      <div className="text-xs font-bold text-slate-900">Append Mode</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                        Keep existing data and add imported items
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setImportMode('replace')}
                    className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all ${
                      importMode === 'replace'
                        ? 'border-amber-600 bg-amber-50/60 ring-2 ring-amber-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <RefreshCw className={`w-4 h-4 mt-0.5 shrink-0 ${importMode === 'replace' ? 'text-amber-600' : 'text-slate-400'}`} />
                    <div>
                      <div className="text-xs font-bold text-slate-900">Full Restore / Replace</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                        Wipe existing transactions & restore from Excel
                      </div>
                    </div>
                  </button>
                </div>

                {importMode === 'replace' && (
                  <div className="flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[11px] font-medium">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>⚠️ Warning: All existing transactions will be deleted and replaced with this file data.</span>
                  </div>
                )}
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0">
                    <tr>
                      <th className="p-2">Row</th>
                      <th className="p-2">Type</th>
                      <th className="p-2">Line Item</th>
                      <th className="p-2">Amount</th>
                      <th className="p-2">Remarks</th>
                      <th className="p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {preview.map((row) => (
                      <tr key={row.rowId} className={row.isValid ? 'hover:bg-slate-50' : 'bg-red-50/50'}>
                        <td className="p-2">{row.rowId}</td>
                        <td className="p-2 capitalize font-semibold">{row.transactionType}</td>
                        <td className="p-2">{row.lineItem}</td>
                        <td className="p-2 font-bold">SAR {row.amount}</td>
                        <td className="p-2 max-w-[120px] truncate">{row.remarks}</td>
                        <td className="p-2">
                          {row.isValid ? (
                            <span className="text-emerald-600 font-semibold">Valid</span>
                          ) : (
                            <span className="text-red-600 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> {row.error}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setPreview(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Choose Another File
                </button>
                <button
                  onClick={handleConfirmImport}
                  disabled={importing}
                  className={`px-5 py-2.5 text-white font-bold text-xs rounded-xl shadow-md disabled:opacity-50 transition-colors ${
                    importMode === 'replace'
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {importing
                    ? 'Processing Import...'
                    : importMode === 'replace'
                    ? 'Confirm Restore & Overwrite'
                    : 'Confirm & Import All'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
