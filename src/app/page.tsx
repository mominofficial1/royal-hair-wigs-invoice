'use client';

import React, { useState, useEffect, useCallback } from 'react';
import LoginPage from '@/components/LoginPage';
import AppHeader from '@/components/AppHeader';
import InvoiceEditor from '@/components/InvoiceEditor';
import InvoicePreview from '@/components/InvoicePreview';
import SavedInvoicesModal from '@/components/SavedInvoicesModal';
import CompanySettingsModal from '@/components/CompanySettingsModal';
import {
  InvoiceData,
  CompanySettings,
  DEFAULT_COLUMNS,
  DEFAULT_COMPANY_SETTINGS,
  INITIAL_SAMPLE_ITEMS,
} from '@/types/invoice';
import { downloadInvoicePdf, printInvoice } from '@/lib/pdfGenerator';
import { Loader2, CheckCircle2, AlertCircle, ZoomIn, ZoomOut, Maximize2, Download, Printer } from 'lucide-react';

function formatDate(date: Date): string {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}-${m}-${y}`;
}

const STATIC_INITIAL_INVOICE: InvoiceData = {
  id: 'inv-initial',
  invoiceNumber: 42647,
  invoiceDate: '10-10-2026',
  dueDate: 'Within 20 days',
  paymentTerms: 'Within 20 days',
  paymentCurrency: 'USD',
  senderName: 'Md Boshirul Islam',
  senderTitle: 'Managing Director',
  companyName: 'Royal Hair Wigs',
  businessDescription: 'Processed Hair & Wig Manufacturer',
  companyAddress: '',
  companyPhone: '',
  companyEmail: '',
  companyWebsite: '',
  companyLogoUrl: '/logo.png',
  customerName: '',
  customerCompany: '',
  customerAddress: '',
  customerPhone: '',
  customerEmail: '',
  customerNotes: '',
  columns: DEFAULT_COLUMNS,
  items: INITIAL_SAMPLE_ITEMS,
  shippingCost: 35,
  extraCharges: [],
  subtotal: 480,
  grandTotal: 515,
};

export default function HomePage() {
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState<{ username: string } | null>(null);

  // Modals state
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Preview zoom scale
  const [previewScale, setPreviewScale] = useState(1);

  // Operation loading flags
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState(false);

  // Helper to create a fresh invoice with default dates & settings
  const createFreshInvoice = useCallback((num: number, settings: CompanySettings): InvoiceData => {
    const today = new Date();
    const subtotal = INITIAL_SAMPLE_ITEMS.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    const shipping = Number(settings.defaultShippingCost) || 35;

    return {
      id: `inv-${Date.now()}`,
      invoiceNumber: num,
      invoiceDate: formatDate(today),
      dueDate: settings.defaultPaymentTerms || 'Within 20 days',
      paymentTerms: settings.defaultPaymentTerms || 'Within 20 days',
      paymentCurrency: settings.defaultCurrency || 'USD',
      senderName: settings.senderName || 'Md Boshirul Islam',
      senderTitle: settings.senderTitle || 'Managing Director',
      companyName: settings.companyName || 'Royal Hair Wigs',
      businessDescription: settings.businessDescription || 'Processed Hair & Wig Manufacturer',
      companyAddress: settings.companyAddress || '',
      companyPhone: settings.companyPhone || '',
      companyEmail: settings.companyEmail || '',
      companyWebsite: settings.companyWebsite || '',
      companyLogoUrl: '/logo.png',
      customerName: '',
      customerCompany: '',
      customerAddress: '',
      customerPhone: '',
      customerEmail: '',
      customerNotes: '',
      columns: DEFAULT_COLUMNS,
      items: INITIAL_SAMPLE_ITEMS,
      shippingCost: shipping,
      extraCharges: [],
      subtotal,
      grandTotal: subtotal + shipping,
    };
  }, []);

  const [invoice, setInvoice] = useState<InvoiceData>(STATIC_INITIAL_INVOICE);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // 1. Check Authentication on Mount - Always require fresh login when visiting the link
  useEffect(() => {
    const isSessionActive =
      typeof window !== 'undefined' && sessionStorage.getItem('royal_portal_active') === 'true';

    if (!isSessionActive) {
      // Visiting live link must show login screen first
      setUser(null);
      setAuthChecked(true);
      return;
    }

    fetch('/api/auth/me')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Not logged in');
      })
      .then((data) => {
        if (data.authenticated) {
          setUser(data.user);
        } else {
          if (typeof window !== 'undefined') sessionStorage.removeItem('royal_portal_active');
          setUser(null);
        }
      })
      .catch(() => {
        if (typeof window !== 'undefined') sessionStorage.removeItem('royal_portal_active');
        setUser(null);
      })
      .finally(() => {
        setAuthChecked(true);
      });
  }, []);

  // 2. Fetch Latest Number & Company Defaults once authenticated
  const fetchNextNumber = useCallback(async () => {
    try {
      const res = await fetch('/api/invoices/next-number');
      if (res.ok) {
        const data = await res.json();
        if (data.nextNumber) {
          setInvoice((prev) => ({
            ...prev,
            invoiceNumber: data.nextNumber,
          }));
          setDuplicateWarning(false);
        }
      }
    } catch (err) {
      console.error('Failed to get next number:', err);
    }
  }, []);

  useEffect(() => {
    if (user) {
      // Load company defaults
      fetch('/api/settings')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.settings) {
            setInvoice((prev) => ({
              ...prev,
              companyName: data.settings.companyName || prev.companyName,
              businessDescription: data.settings.businessDescription || prev.businessDescription,
              senderName: data.settings.senderName || prev.senderName,
              senderTitle: data.settings.senderTitle || prev.senderTitle,
              paymentCurrency: data.settings.defaultCurrency || prev.paymentCurrency,
              paymentTerms: data.settings.defaultPaymentTerms || prev.paymentTerms,
              shippingCost: Number(data.settings.defaultShippingCost) || prev.shippingCost,
            }));
          }
        });

      fetchNextNumber();
    }
  }, [user, fetchNextNumber]);

  // Action: New Invoice
  const handleNewInvoice = async () => {
    try {
      const res = await fetch('/api/invoices/next-number');
      const data = await res.json();
      const nextNum = data.nextNumber || invoice.invoiceNumber + 1;
      const fresh = createFreshInvoice(nextNum, DEFAULT_COMPANY_SETTINGS);
      setInvoice(fresh);
      setDuplicateWarning(false);
      showToast(`Created new invoice #${nextNum}`);
    } catch {
      const fresh = createFreshInvoice(invoice.invoiceNumber + 1, DEFAULT_COMPANY_SETTINGS);
      setInvoice(fresh);
      showToast(`Created new invoice #${fresh.invoiceNumber}`);
    }
  };

  // Action: Save Invoice
  const handleSaveInvoice = async () => {
    setIsSaving(true);
    setDuplicateWarning(false);
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoice),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setDuplicateWarning(true);
        }
        throw new Error(data.error || 'Failed to save invoice.');
      }

      showToast(`Invoice #${invoice.invoiceNumber} saved successfully!`);
    } catch (err: any) {
      showToast(err.message || 'Error saving invoice.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Action: Download PDF
  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      await downloadInvoicePdf('invoice-a4-document', invoice.invoiceNumber);
      showToast(`Downloaded Royal-Hair-Wigs-Invoice-${invoice.invoiceNumber}.pdf`);
    } catch (err: any) {
      showToast(err.message || 'Failed to export PDF.', 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  // Action: Direct Download from Modal
  const handleDirectDownloadPdf = async (targetInvoice: InvoiceData) => {
    // Temporarily swap or download
    setInvoice(targetInvoice);
    setTimeout(async () => {
      try {
        await downloadInvoicePdf('invoice-a4-document', targetInvoice.invoiceNumber);
        showToast(`Downloaded Invoice #${targetInvoice.invoiceNumber}.pdf`);
      } catch (err: any) {
        showToast(err.message || 'Download error', 'error');
      }
    }, 100);
  };

  // Action: Duplicate Invoice
  const handleDuplicateInvoice = async (sourceInvoice: InvoiceData) => {
    try {
      const res = await fetch('/api/invoices/next-number');
      const data = await res.json();
      const nextNum = data.nextNumber || sourceInvoice.invoiceNumber + 1;

      const cloned: InvoiceData = {
        ...sourceInvoice,
        id: `inv-${Date.now()}`,
        invoiceNumber: nextNum,
        invoiceDate: formatDate(new Date()),
      };
      setInvoice(cloned);
      showToast(`Duplicated into new Invoice #${nextNum}`);
    } catch {
      showToast('Failed to generate duplicate number', 'error');
    }
  };

  // Action: Reset
  const handleResetForm = () => {
    if (confirm('Clear form back to blank? Any unsaved edits will be discarded.')) {
      setInvoice((prev) => ({
        ...prev,
        customerName: '',
        customerCompany: '',
        customerAddress: '',
        customerPhone: '',
        customerEmail: '',
        customerNotes: '',
        items: [],
        extraCharges: [],
        shippingCost: 0,
        subtotal: 0,
        grandTotal: 0,
      }));
      showToast('Invoice fields cleared.');
    }
  };

  // Action: Logout
  const handleLogout = async () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('royal_portal_active');
    }
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
    } catch {
      setUser(null);
    }
  };

  // Initial Auth Check Screen
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          <span className="text-sm font-semibold tracking-wide text-slate-300">
            Checking authentication...
          </span>
        </div>
      </div>
    );
  }

  // Not authenticated: render Login Page
  if (!user) {
    return (
      <LoginPage
        onLoginSuccess={(u) => {
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('royal_portal_active', 'true');
          }
          setUser(u);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* App Header */}
      <AppHeader
        currentInvoiceNumber={invoice.invoiceNumber}
        onNewInvoice={handleNewInvoice}
        onOpenSavedModal={() => setShowSavedModal(true)}
        onOpenSettingsModal={() => setShowSettingsModal(true)}
        onLogout={handleLogout}
        username={user.username}
      />

      {/* Floating Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-xs font-bold transition-all transform animate-bounce-in ${
            toast.type === 'success'
              ? 'bg-slate-900 text-white border border-slate-700'
              : 'bg-red-600 text-white'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-300" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Main Workspace Layout (Two-Column on Large Screens) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Interactive Editor (5 cols) */}
          <div className="no-print lg:col-span-5 h-[calc(100vh-6.5rem)] sticky top-20 flex flex-col">
            <InvoiceEditor
              invoice={invoice}
              onChange={setInvoice}
              onSave={handleSaveInvoice}
              onDownloadPdf={handleDownloadPdf}
              onPrint={printInvoice}
              onReset={handleResetForm}
              onFetchNextNumber={fetchNextNumber}
              isSaving={isSaving}
              isDownloading={isDownloading}
              duplicateWarning={duplicateWarning}
            />
          </div>

          {/* Right Column: Live A4 Preview (7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-center">
            {/* Preview Toolbar with Zoom Controls */}
            <div className="no-print w-full flex flex-wrap items-center justify-between gap-2 bg-white px-4 py-2.5 rounded-xl border border-slate-200 mb-3 shadow-xs">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Live A4 Invoice Preview
                </span>
                <span className="hidden sm:inline-block w-px h-4 bg-slate-200" />
                <span className="text-[11px] font-semibold text-slate-500 hidden sm:inline">
                  A4 Portrait • Print &amp; PDF Ready
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Direct Download PDF Button */}
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isDownloading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-300 text-slate-950 rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
                  title="Download clean A4 PDF"
                >
                  {isDownloading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-950" />
                  ) : (
                    <Download className="w-3.5 h-3.5 text-slate-950" />
                  )}
                  <span>{isDownloading ? 'Generating...' : 'Download PDF'}</span>
                </button>

                {/* Print Button */}
                <button
                  type="button"
                  onClick={printInvoice}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition cursor-pointer"
                  title="Print invoice directly"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-600" />
                  <span className="hidden sm:inline">Print</span>
                </button>

                <div className="h-4 w-px bg-slate-200 mx-0.5" />

                {/* Zoom Controls */}
                <div className="flex items-center gap-1 text-xs text-slate-600 bg-slate-50 p-0.5 rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setPreviewScale((s) => Math.max(0.6, s - 0.1))}
                    className="p-1 rounded hover:bg-white text-slate-700 cursor-pointer"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono text-[10px] font-bold w-10 text-center">
                    {Math.round(previewScale * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setPreviewScale((s) => Math.min(1.4, s + 0.1))}
                    className="p-1 rounded hover:bg-white text-slate-700 cursor-pointer"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewScale(1)}
                    className="p-1 rounded hover:bg-white text-slate-700 cursor-pointer"
                    title="Reset Zoom to 100%"
                  >
                    <Maximize2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* The Actual A4 Document Preview */}
            <InvoicePreview invoice={invoice} scale={previewScale} />
          </div>
        </div>
      </main>

      {/* Saved Invoices Modal */}
      <SavedInvoicesModal
        isOpen={showSavedModal}
        onClose={() => setShowSavedModal(false)}
        onLoadInvoice={(inv) => {
          setInvoice(inv);
          showToast(`Loaded Invoice #${inv.invoiceNumber}`);
        }}
        onDuplicateInvoice={handleDuplicateInvoice}
        onDirectDownloadPdf={handleDirectDownloadPdf}
      />

      {/* Company Settings Modal */}
      <CompanySettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onSettingsSaved={(newSettings) => {
          setInvoice((prev) => ({
            ...prev,
            companyName: newSettings.companyName || prev.companyName,
            businessDescription: newSettings.businessDescription || prev.businessDescription,
            senderName: newSettings.senderName || prev.senderName,
            senderTitle: newSettings.senderTitle || prev.senderTitle,
            paymentCurrency: newSettings.defaultCurrency || prev.paymentCurrency,
            paymentTerms: newSettings.defaultPaymentTerms || prev.paymentTerms,
            shippingCost: Number(newSettings.defaultShippingCost) || prev.shippingCost,
          }));
          showToast('Updated active invoice with saved company defaults.');
        }}
      />
    </div>
  );
}
