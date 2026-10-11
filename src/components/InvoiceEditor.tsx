'use client';

import React, { useState } from 'react';
import {
  InvoiceData,
  InvoiceItem,
  InvoiceColumn,
  ExtraCharge,
  CURRENCIES,
  INITIAL_SAMPLE_ITEMS,
} from '@/types/invoice';
import {
  Plus,
  Trash2,
  Copy,
  Download,
  Printer,
  Save,
  RotateCcw,
  RefreshCw,
  Sliders,
  DollarSign,
  User,
  Package,
  Layers,
  Calendar,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

interface InvoiceEditorProps {
  invoice: InvoiceData;
  onChange: (updated: InvoiceData) => void;
  onSave: () => void;
  onDownloadPdf: () => void;
  onPrint: () => void;
  onReset: () => void;
  onFetchNextNumber: () => void;
  isSaving: boolean;
  isDownloading: boolean;
  duplicateWarning?: boolean;
}

export default function InvoiceEditor({
  invoice,
  onChange,
  onSave,
  onDownloadPdf,
  onPrint,
  onReset,
  onFetchNextNumber,
  isSaving,
  isDownloading,
  duplicateWarning,
}: InvoiceEditorProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'products' | 'charges'>('details');
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');

  // Helper to update fields and trigger recalculations
  const updateInvoice = (partial: Partial<InvoiceData>) => {
    const updated = { ...invoice, ...partial };

    // Recalculate subtotal
    const subtotal = (updated.items || []).reduce((acc, item) => {
      const line = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
      return acc + line;
    }, 0);

    // Recalculate extra charges
    const extraTotal = (updated.extraCharges || []).reduce((acc, extra) => {
      return acc + (Number(extra.amount) || 0);
    }, 0);

    const grandTotal = subtotal + (Number(updated.shippingCost) || 0) + extraTotal;

    onChange({
      ...updated,
      subtotal,
      grandTotal,
    });
  };

  // Product Row Operations
  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: `item-${Date.now()}`,
      name: '',
      hairColour: 'As per Requirements',
      baseSize: 'As per Requirements',
      quantity: 1,
      unitPrice: 0,
      unitLabel: 'pcs',
    };
    updateInvoice({ items: [...invoice.items, newItem] });
  };

  const handleUpdateItem = (id: string, updates: Partial<InvoiceItem>) => {
    const items = invoice.items.map((item) => (item.id === id ? { ...item, ...updates } : item));
    updateInvoice({ items });
  };

  const handleDeleteItem = (id: string) => {
    const items = invoice.items.filter((item) => item.id !== id);
    updateInvoice({ items });
  };

  const handleDuplicateItem = (itemToCopy: InvoiceItem) => {
    const duplicated: InvoiceItem = {
      ...itemToCopy,
      id: `item-${Date.now()}`,
      name: `${itemToCopy.name} (Copy)`,
    };
    updateInvoice({ items: [...invoice.items, duplicated] });
  };

  // Extra Charges Operations
  const handleAddExtraCharge = () => {
    const newCharge: ExtraCharge = {
      id: `charge-${Date.now()}`,
      title: 'Packaging Cost',
      amount: 15,
    };
    updateInvoice({ extraCharges: [...(invoice.extraCharges || []), newCharge] });
  };

  const handleUpdateExtraCharge = (id: string, updates: Partial<ExtraCharge>) => {
    const extraCharges = (invoice.extraCharges || []).map((ch) =>
      ch.id === id ? { ...ch, ...updates } : ch
    );
    updateInvoice({ extraCharges });
  };

  const handleDeleteExtraCharge = (id: string) => {
    const extraCharges = (invoice.extraCharges || []).filter((ch) => ch.id !== id);
    updateInvoice({ extraCharges });
  };

  // Column Customization
  const handleToggleColumn = (id: string) => {
    const columns = invoice.columns.map((c) => (c.id === id ? { ...c, visible: !c.visible } : c));
    updateInvoice({ columns });
  };

  const handleUpdateColumnLabel = (id: string, label: string) => {
    const columns = invoice.columns.map((c) => (c.id === id ? { ...c, label } : c));
    updateInvoice({ columns });
  };

  const handleAddCustomColumn = () => {
    if (!newColumnName.trim()) return;
    const colKey = `custom_${Date.now()}`;
    const newCol: InvoiceColumn = {
      id: `col-${colKey}`,
      key: colKey,
      label: newColumnName.trim(),
      visible: true,
      isCustom: true,
    };
    updateInvoice({ columns: [...invoice.columns, newCol] });
    setNewColumnName('');
  };

  const handleRemoveCustomColumn = (id: string) => {
    const columns = invoice.columns.filter((c) => c.id !== id);
    updateInvoice({ columns });
  };

  const currentCurrency = CURRENCIES.find((c) => c.code === invoice.paymentCurrency) || CURRENCIES[0];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full font-sans">
      {/* Top Action Ribbon */}
      <div className="bg-slate-900 text-white p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Invoice Editor
          </span>
          <span className="text-xs text-slate-400 font-mono">
            #{invoice.invoiceNumber}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onSave}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
            title="Save invoice to persistent database"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Save</span>
          </button>

          <button
            onClick={onDownloadPdf}
            disabled={isDownloading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition cursor-pointer disabled:opacity-50"
            title="Download clean A4 PDF"
          >
            {isDownloading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" /> : <Download className="w-3.5 h-3.5 text-amber-400" />}
            <span>Download PDF</span>
          </button>

          <button
            onClick={onPrint}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition cursor-pointer"
            title="Print invoice or save via print dialog"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print</span>
          </button>

          <button
            onClick={onReset}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-red-400 border border-slate-700 transition cursor-pointer"
            title="Reset form"
            aria-label="Reset Form"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Editor Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-slate-50 px-3 pt-2 gap-1 text-xs font-bold uppercase tracking-wider text-slate-600">
        <button
          onClick={() => setActiveTab('details')}
          className={`py-2 px-3.5 rounded-t-lg transition flex items-center gap-1.5 cursor-pointer border-t border-l border-r ${
            activeTab === 'details'
              ? 'bg-white text-slate-900 border-slate-200 shadow-sm'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          <User className="w-3.5 h-3.5 text-blue-600" />
          <span>Invoice &amp; Customer</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`py-2 px-3.5 rounded-t-lg transition flex items-center gap-1.5 cursor-pointer border-t border-l border-r ${
            activeTab === 'products'
              ? 'bg-white text-slate-900 border-slate-200 shadow-sm'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          <Package className="w-3.5 h-3.5 text-amber-600" />
          <span>Products ({invoice.items.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('charges')}
          className={`py-2 px-3.5 rounded-t-lg transition flex items-center gap-1.5 cursor-pointer border-t border-l border-r ${
            activeTab === 'charges'
              ? 'bg-white text-slate-900 border-slate-200 shadow-sm'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
          <span>Shipping &amp; Charges</span>
        </button>
      </div>

      {/* Duplicate Number Warning */}
      {duplicateWarning && (
        <div className="mx-4 mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            <strong>Duplicate Warning:</strong> Invoice number #{invoice.invoiceNumber} is already recorded in the database. Consider clicking the refresh icon to pick the next number.
          </span>
        </div>
      )}

      {/* Editor Tab Panels */}
      <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-5">
        {/* TAB 1: DETAILS & CUSTOMER */}
        {activeTab === 'details' && (
          <div className="space-y-5">
            {/* Invoice Number & Dates */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-600" />
                <span>Invoice Credentials &amp; Dates</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Invoice Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Invoice Number *
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="number"
                      value={invoice.invoiceNumber}
                      onChange={(e) => updateInvoice({ invoiceNumber: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 font-bold focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={onFetchNextNumber}
                      className="p-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-slate-600 hover:text-slate-900 transition cursor-pointer"
                      title="Fetch next sequential number"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Invoice Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Invoice Date *
                  </label>
                  <input
                    type="text"
                    value={invoice.invoiceDate}
                    onChange={(e) => updateInvoice({ invoiceDate: e.target.value })}
                    placeholder="DD-MM-YYYY"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>

                {/* Currency */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Payment Currency
                  </label>
                  <select
                    value={invoice.paymentCurrency}
                    onChange={(e) => updateInvoice({ paymentCurrency: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 font-semibold focus:ring-2 focus:ring-slate-900 focus:outline-none cursor-pointer"
                  >
                    {CURRENCIES.map((cur) => (
                      <option key={cur.code} value={cur.code}>
                        {cur.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Payment Terms / Due Days
                  </label>
                  <input
                    type="text"
                    value={invoice.paymentTerms}
                    onChange={(e) => updateInvoice({ paymentTerms: e.target.value })}
                    placeholder="e.g. Within 20 days"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Due Date Display
                  </label>
                  <input
                    type="text"
                    value={invoice.dueDate}
                    onChange={(e) => updateInvoice({ dueDate: e.target.value })}
                    placeholder="e.g. Within 20 days or DD-MM-YYYY"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Sender Details */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-600" />
                <span>Sender Information (From)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sender Name
                  </label>
                  <input
                    type="text"
                    value={invoice.senderName}
                    onChange={(e) => updateInvoice({ senderName: e.target.value })}
                    placeholder="e.g. Md Boshirul Islam"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sender Title
                  </label>
                  <input
                    type="text"
                    value={invoice.senderTitle}
                    onChange={(e) => updateInvoice({ senderTitle: e.target.value })}
                    placeholder="e.g. Managing Director"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Customer Information (To) */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>Customer Information (To)</span>
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={invoice.customerName}
                    onChange={(e) => updateInvoice({ customerName: e.target.value })}
                    placeholder="e.g. John Doe / Apex Hair Studio"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 font-medium focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Company / Salon Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={invoice.customerCompany || ''}
                      onChange={(e) => updateInvoice({ customerCompany: e.target.value })}
                      placeholder="e.g. Royalux Hair Studio Ltd."
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phone / WhatsApp (Optional)
                    </label>
                    <input
                      type="text"
                      value={invoice.customerPhone || ''}
                      onChange={(e) => updateInvoice({ customerPhone: e.target.value })}
                      placeholder="e.g. +1 555-0199"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Delivery / Billing Address (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={invoice.customerAddress || ''}
                    onChange={(e) => updateInvoice({ customerAddress: e.target.value })}
                    placeholder="Customer delivery or billing address..."
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Invoice Notes / Special Instructions
                  </label>
                  <input
                    type="text"
                    value={invoice.customerNotes || ''}
                    onChange={(e) => updateInvoice({ customerNotes: e.target.value })}
                    placeholder="e.g. Order dispatched via DHL Express. All products packed as per specs."
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS TABLE */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            {/* Products Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-sm transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Product Row</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowColumnModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5 text-slate-500" />
                  <span>Column Settings</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateInvoice({ items: INITIAL_SAMPLE_ITEMS })}
                  className="text-xs text-blue-600 hover:underline font-semibold"
                >
                  Load Reference 42646 Data
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={() => updateInvoice({ items: [] })}
                  className="text-xs text-red-600 hover:underline font-semibold"
                >
                  Clear All Rows
                </button>
              </div>
            </div>

            {/* Product Items List */}
            {invoice.items.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300 p-6">
                <Package className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">No products added yet</p>
                <p className="text-xs text-slate-400 mt-1">
                  Click &quot;Add Product Row&quot; or &quot;Load Reference 42646 Data&quot; to begin.
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {invoice.items.map((item, index) => {
                  const lineTotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);

                  return (
                    <div
                      key={item.id}
                      className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 sm:p-4 space-y-3 hover:border-slate-300 transition"
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                          Row #{index + 1}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleDuplicateItem(item)}
                            className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition cursor-pointer"
                            title="Duplicate this row"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1 rounded text-red-500 hover:text-red-700 hover:bg-red-50 transition cursor-pointer"
                            title="Delete this row"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Primary Fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-3">
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                            Product Name
                          </label>
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => handleUpdateItem(item.id, { name: e.target.value })}
                            placeholder="e.g. Hollywood gents"
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 font-medium focus:ring-2 focus:ring-slate-900 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                            Hair Colour
                          </label>
                          <input
                            type="text"
                            value={item.hairColour}
                            onChange={(e) => handleUpdateItem(item.id, { hairColour: e.target.value })}
                            placeholder="e.g. As per Requirements"
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                            Base Size
                          </label>
                          <input
                            type="text"
                            value={item.baseSize}
                            onChange={(e) => handleUpdateItem(item.id, { baseSize: e.target.value })}
                            placeholder="e.g. As per Requirements"
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                            Unit Label
                          </label>
                          <input
                            type="text"
                            value={item.unitLabel || 'pcs'}
                            onChange={(e) => handleUpdateItem(item.id, { unitLabel: e.target.value })}
                            placeholder="e.g. pcs"
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Quantity, Unit Price & Total */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end pt-1">
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                            Quantity
                          </label>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateItem(item.id, {
                                  quantity: Math.max(1, (Number(item.quantity) || 1) - 1),
                                })
                              }
                              className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 font-bold hover:bg-slate-100 transition cursor-pointer"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="0"
                              step="any"
                              value={item.quantity}
                              onChange={(e) =>
                                handleUpdateItem(item.id, {
                                  quantity: Math.max(0, parseFloat(e.target.value) || 0),
                                })
                              }
                              className="w-full text-center px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 font-bold focus:ring-2 focus:ring-slate-900 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateItem(item.id, {
                                  quantity: (Number(item.quantity) || 0) + 1,
                                })
                              }
                              className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 font-bold hover:bg-slate-100 transition cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                            Unit Price ({currentCurrency.symbol})
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={item.unitPrice}
                            onChange={(e) =>
                              handleUpdateItem(item.id, {
                                unitPrice: Math.max(0, parseFloat(e.target.value) || 0),
                              })
                            }
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 font-bold focus:ring-2 focus:ring-slate-900 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                            Line Total (Calculated)
                          </label>
                          <div className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-900 font-bold">
                            {lineTotal.toLocaleString()} {currentCurrency.symbol}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CHARGES & TOTALS */}
        {activeTab === 'charges' && (
          <div className="space-y-5">
            {/* Shipping Cost */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-slate-600" />
                <span>Shipping Cost</span>
              </h3>
              <div className="max-w-xs">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Shipping Cost ({currentCurrency.symbol})
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={invoice.shippingCost}
                  onChange={(e) => updateInvoice({ shippingCost: parseFloat(e.target.value) || 0 })}
                  placeholder="35"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 font-bold focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>
            </div>

            {/* Extra Charges */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3.5">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Extra Charges (Any number)</span>
                </h3>
                <button
                  type="button"
                  onClick={handleAddExtraCharge}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Extra Cost</span>
                </button>
              </div>

              {(!invoice.extraCharges || invoice.extraCharges.length === 0) ? (
                <p className="text-xs text-slate-400 italic py-2">
                  No additional charges configured. Click &quot;Add Extra Cost&quot; to add packaging, insurance, or custom fees.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {invoice.extraCharges.map((charge) => (
                    <div
                      key={charge.id}
                      className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-slate-200"
                    >
                      <input
                        type="text"
                        value={charge.title}
                        onChange={(e) => handleUpdateExtraCharge(charge.id, { title: e.target.value })}
                        placeholder="e.g. Packaging Cost / Insurance"
                        className="flex-1 px-2.5 py-1 text-xs border border-slate-300 rounded font-medium focus:outline-none focus:ring-1 focus:ring-slate-900"
                      />
                      <div className="flex items-center gap-1 w-28">
                        <span className="text-xs font-bold text-slate-500">{currentCurrency.symbol}</span>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={charge.amount}
                          onChange={(e) =>
                            handleUpdateExtraCharge(charge.id, {
                              amount: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-full px-2 py-1 text-xs border border-slate-300 rounded font-bold focus:outline-none focus:ring-1 focus:ring-slate-900"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteExtraCharge(charge.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded transition cursor-pointer"
                        title="Remove charge"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Live Financial Breakdown Summary */}
            <div className="bg-slate-900 text-white p-4 rounded-xl space-y-2">
              <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400">
                Calculated Cost Summary
              </h4>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Product Subtotal ({invoice.items.length} items):</span>
                  <span className="font-semibold">{invoice.subtotal.toLocaleString()} {currentCurrency.symbol}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Shipping Cost:</span>
                  <span className="font-semibold">{Number(invoice.shippingCost).toLocaleString()} {currentCurrency.symbol}</span>
                </div>
                {invoice.extraCharges &&
                  invoice.extraCharges.map((ch) => (
                    <div key={ch.id} className="flex justify-between text-slate-300">
                      <span>{ch.title}:</span>
                      <span className="font-semibold">{Number(ch.amount).toLocaleString()} {currentCurrency.symbol}</span>
                    </div>
                  ))}
                <div className="border-t border-slate-800 pt-2 flex justify-between text-sm font-bold text-amber-400">
                  <span>Grand Total:</span>
                  <span className="text-base">{invoice.grandTotal.toLocaleString()} {currentCurrency.symbol}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Column Customizer Modal */}
      {showColumnModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-5 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-slate-600" />
                <span>Configure Product Table Columns</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowColumnModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ×
              </button>
            </div>

            <div className="space-y-2.5 max-h-64 overflow-y-auto">
              {invoice.columns.map((col) => (
                <div key={col.id} className="flex items-center justify-between gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={col.visible}
                      onChange={() => handleToggleColumn(col.id)}
                      className="rounded text-slate-900 focus:ring-slate-900 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={col.label}
                      onChange={(e) => handleUpdateColumnLabel(col.id, e.target.value)}
                      className="px-2 py-0.5 text-xs bg-white border border-slate-300 rounded font-semibold text-slate-800"
                    />
                  </div>
                  {col.isCustom && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomColumn(col.id)}
                      className="text-red-500 hover:text-red-700 text-xs font-semibold p-1"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add Custom Column */}
            <div className="pt-2 border-t">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Add Custom Column
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  placeholder="e.g. Hair Density / Texture"
                  className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
                <button
                  type="button"
                  onClick={handleAddCustomColumn}
                  className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowColumnModal(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
