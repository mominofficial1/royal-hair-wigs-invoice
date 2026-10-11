'use client';

import React from 'react';
import Image from 'next/image';
import { Plus, FolderOpen, Settings, LogOut, FileText } from 'lucide-react';

interface AppHeaderProps {
  currentInvoiceNumber: number;
  onNewInvoice: () => void;
  onOpenSavedModal: () => void;
  onOpenSettingsModal: () => void;
  onLogout: () => void;
  username?: string;
}

export default function AppHeader({
  currentInvoiceNumber,
  onNewInvoice,
  onOpenSavedModal,
  onOpenSettingsModal,
  onLogout,
  username = 'astroinvoice',
}: AppHeaderProps) {
  return (
    <header className="no-print bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Title */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="bg-white rounded-lg p-1.5 flex items-center justify-center shadow-sm flex-shrink-0 w-11 h-11 relative">
            <Image
              src="/logo.png"
              alt="Royal Hair Wigs Logo"
              width={38}
              height={38}
              className="object-contain"
              priority
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                Royal Hair Wigs
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-400">
                <FileText className="w-3 h-3" />
                <span>INVOICE #{currentInvoiceNumber}</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium tracking-wide truncate">
              Professional Invoice Maker &amp; Management System
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
          <button
            onClick={onNewInvoice}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-bold shadow-sm transition cursor-pointer"
            title="Create a new blank invoice"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden xs:inline">New Invoice</span>
          </button>

          <button
            onClick={onOpenSavedModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs sm:text-sm font-medium border border-slate-700 transition cursor-pointer"
            title="View and load saved invoices"
          >
            <FolderOpen className="w-4 h-4 text-slate-400" />
            <span className="hidden md:inline">Saved Invoices</span>
          </button>

          <button
            onClick={onOpenSettingsModal}
            className="p-1.5 sm:p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
            title="Company defaults & settings"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          <div className="h-6 w-px bg-slate-800 mx-1 hidden sm:block" />

          {/* User & Logout */}
          <button
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/40 text-xs font-semibold transition cursor-pointer"
            title={`Logged in as ${username} — Click to log out`}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
