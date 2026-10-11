'use client';

import React, { useState, useEffect } from 'react';
import { CompanySettings, DEFAULT_COMPANY_SETTINGS, CURRENCIES } from '@/types/invoice';
import { Settings, Save, X, Building, User, DollarSign, Check, Loader2 } from 'lucide-react';

interface CompanySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsSaved?: (settings: CompanySettings) => void;
}

export default function CompanySettingsModal({
  isOpen,
  onClose,
  onSettingsSaved,
}: CompanySettingsModalProps) {
  const [settings, setSettings] = useState<CompanySettings>(DEFAULT_COMPANY_SETTINGS);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch('/api/settings')
        .then((res) => res.json())
        .then((data) => {
          if (data.settings) {
            setSettings(data.settings);
          }
        })
        .catch((err) => console.error('Failed to load settings:', err))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setSavedSuccess(true);
        if (onSettingsSaved) onSettingsSaved(settings);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 font-sans">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight">Company Defaults &amp; Preferences</h2>
              <p className="text-xs text-slate-400">
                Configure global defaults for new invoices
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

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {savedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Company defaults successfully updated and saved in the database!</span>
            </div>
          )}

          {loading ? (
            <div className="py-12 text-center text-slate-400 flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
              <span className="text-xs">Loading preferences...</span>
            </div>
          ) : (
            <>
              {/* Company Identity */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5 border-b pb-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-600" />
                  <span>Company Identity</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={settings.companyName}
                      onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Business Description
                    </label>
                    <input
                      type="text"
                      value={settings.businessDescription}
                      onChange={(e) => setSettings({ ...settings, businessDescription: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Default Phone / Contact
                    </label>
                    <input
                      type="text"
                      value={settings.companyPhone || ''}
                      onChange={(e) => setSettings({ ...settings, companyPhone: e.target.value })}
                      placeholder="e.g. +880 1792 872188"
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Default Email Address
                    </label>
                    <input
                      type="email"
                      value={settings.companyEmail || ''}
                      onChange={(e) => setSettings({ ...settings, companyEmail: e.target.value })}
                      placeholder="e.g. contact@royalhairwigs.com"
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Company Address
                  </label>
                  <textarea
                    rows={2}
                    value={settings.companyAddress || ''}
                    onChange={(e) => setSettings({ ...settings, companyAddress: e.target.value })}
                    placeholder="Factory / Office Address..."
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              {/* Default Sender */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5 border-b pb-1.5">
                  <User className="w-3.5 h-3.5 text-slate-600" />
                  <span>Default Sender Signatory</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Default Sender Name
                    </label>
                    <input
                      type="text"
                      value={settings.senderName}
                      onChange={(e) => setSettings({ ...settings, senderName: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Default Sender Title
                    </label>
                    <input
                      type="text"
                      value={settings.senderTitle}
                      onChange={(e) => setSettings({ ...settings, senderTitle: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Invoice Defaults */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5 border-b pb-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-slate-600" />
                  <span>Payment &amp; Currency Defaults</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Default Currency
                    </label>
                    <select
                      value={settings.defaultCurrency}
                      onChange={(e) => setSettings({ ...settings, defaultCurrency: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Payment Terms
                    </label>
                    <input
                      type="text"
                      value={settings.defaultPaymentTerms}
                      onChange={(e) => setSettings({ ...settings, defaultPaymentTerms: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Default Shipping Cost
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={settings.defaultShippingCost}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          defaultShippingCost: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition shadow-sm cursor-pointer disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save Company Defaults</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
