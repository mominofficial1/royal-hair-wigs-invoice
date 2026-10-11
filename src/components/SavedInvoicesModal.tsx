'use client';

import React, { useState, useEffect } from 'react';
import { InvoiceData } from '@/types/invoice';
import {
  FolderOpen,
  Search,
  Trash2,
  Copy,
  Download,
  Calendar,
  FileText,
  User,
  ArrowRight,
  AlertCircle,
  Loader2,
  X,
} from 'lucide-react';

interface SavedInvoicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadInvoice: (invoice: InvoiceData) => void;
  onDuplicateInvoice: (invoice: InvoiceData) => void;
  onDirectDownloadPdf: (invoice: InvoiceData) => void;
}

export default function SavedInvoicesModal({
  isOpen,
  onClose,
  onLoadInvoice,
  onDuplicateInvoice,
  onDirectDownloadPdf,
}: SavedInvoicesModalProps) {
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const url = search.trim()
        ? `/api/invoices?search=${encodeURIComponent(search.trim())}`
        : '/api/invoices';
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) {
        setInvoices(data.invoices || []);
      }
    } catch (err) {
      console.error('Failed to fetch saved invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchInvoices();
    }
  }, [isOpen, search]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/invoices/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setInvoices((prev) => prev.filter((inv) => inv.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete invoice:', err);
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 font-sans">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full flex flex-col max-h-[90vh] overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight">Saved Invoices</h2>
              <p className="text-xs text-slate-400">
                Persistent database records for Royal Hair Wigs
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by invoice number (e.g. 42646) or customer name..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
        </div>

        {/* Invoices List Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="py-16 text-center text-slate-500 flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
              <span className="text-sm font-medium">Loading records from database...</span>
            </div>
          ) : invoices.length === 0 ? (
            <div className="py-16 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 p-8">
              <FileText className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-700">No invoices found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {search
                  ? `No saved invoices match "${search}". Try searching by another keyword.`
                  : 'You have not saved any invoices yet. Create and click "Save" in the editor.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {invoices.map((inv) => (
                <div
                  key={inv.id}
                  className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-4 shadow-xs hover:shadow-md transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  {/* Left: Invoice Meta */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-900 text-amber-400 font-mono">
                        #{inv.invoiceNumber}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {inv.invoiceDate}
                      </span>
                    </div>

                    <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-blue-600" />
                      <span>{inv.customerName || 'Unnamed Customer'}</span>
                    </div>

                    <div className="text-xs text-slate-500 flex items-center gap-3">
                      <span>Items: <strong>{inv.items?.length || 0}</strong></span>
                      <span>Total: <strong className="text-slate-900">{inv.grandTotal?.toLocaleString()} {inv.paymentCurrency}</strong></span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => {
                        onLoadInvoice(inv);
                        onClose();
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                      title="Load this invoice into editor"
                    >
                      <span>Load / Edit</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        onDuplicateInvoice(inv);
                        onClose();
                      }}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                      title="Duplicate as new invoice"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onDirectDownloadPdf(inv)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                      title="Direct PDF download"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    {confirmDeleteId === inv.id ? (
                      <div className="flex items-center gap-1 bg-red-50 p-1 rounded-lg border border-red-200">
                        <button
                          onClick={() => handleDelete(inv.id)}
                          disabled={deletingId === inv.id}
                          className="px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold cursor-pointer"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-1.5 py-1 text-slate-600 text-[11px] font-semibold cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(inv.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                        title="Delete invoice"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 p-3.5 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span>Total Saved: <strong>{invoices.length}</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
