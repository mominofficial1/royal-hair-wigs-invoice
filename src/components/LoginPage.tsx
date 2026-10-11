'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Lock, User, Eye, EyeOff, ShieldCheck, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (user: { username: string }) => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [username, setUsername] = useState('astroinvoice');
  const [password, setPassword] = useState('Orbit#42646');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed. Please verify credentials.');
      }

      onLoginSuccess(data.user);
    } catch (err: any) {
      setError(err.message || 'Unable to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Decorative ambient gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10">
        {/* Main Brand Card */}
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden">
          {/* Card Header with Logo */}
          <div className="bg-gradient-to-b from-slate-50 to-white pt-8 pb-6 px-8 text-center border-b border-slate-100">
            <div className="flex justify-center mb-4">
              <div className="relative w-36 h-24">
                <Image
                  src="/logo.png"
                  alt="Royal Hair Wigs Official Logo"
                  fill
                  priority
                  className="object-contain"
                />
              </div>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Royal Hair Wigs
            </h1>
            <p className="text-xs uppercase font-semibold tracking-wider text-slate-500 mt-0.5">
              Processed Hair &amp; Wig Manufacturer
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium mt-3">
              <Lock className="w-3 h-3 text-amber-600" />
              <span>Invoice Maker — Authorized Access</span>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {error && (
              <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-700 text-sm animate-shake">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600 mt-0.5" />
                <span className="leading-snug">{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Invoice Workspace</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>

            {/* Shared Credentials Hint */}
            <div className="pt-3 border-t border-slate-100">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600 leading-relaxed">
                <p className="font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Preset Shared Credentials:
                </p>
                <div className="font-mono text-[11px] text-slate-700 bg-white p-2 rounded border border-slate-200 space-y-0.5">
                  <div>Username: <strong className="text-slate-900">astroinvoice</strong></div>
                  <div>Password: <strong className="text-slate-900">Orbit#42646</strong></div>
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5">
                  Configurable through server environment variables (<code className="text-slate-600">AUTH_USERNAME</code>, <code className="text-slate-600">AUTH_PASSWORD</code>).
                </p>
              </div>
            </div>
          </form>
        </div>

        {/* Security Footer */}
        <p className="text-center text-xs text-slate-400 mt-6 flex items-center justify-center gap-1.5">
          <span>Protected with HTTP-only session cookies and server-side verification.</span>
        </p>
      </div>
    </div>
  );
}
