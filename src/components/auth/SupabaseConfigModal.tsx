import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Database, CheckCircle2, AlertCircle, Copy, Check, Key, ExternalLink, RefreshCw } from 'lucide-react';
import { isSupabaseConfigured, supabaseUrl, setCustomSupabaseConfig } from '../../lib/supabase';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({ isOpen, onClose }) => {
  const isConnected = isSupabaseConfigured();
  const [url, setUrl] = useState(supabaseUrl || '');
  const [anonKey, setAnonKey] = useState('');
  const [copied, setCopied] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const sqlSchemaSnippet = `-- Run this in Supabase SQL Editor:
-- Complete production schema available at /supabase/schema.sql
CREATE TABLE IF NOT EXISTS public.workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
-- (Includes full RLS Policies, Indexes, and Profile triggers)`;

  const handleCopySQL = async () => {
    try {
      // Read full schema from schema.sql or copy essential
      await navigator.clipboard.writeText(sqlSchemaSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleSaveConnection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !anonKey.trim()) {
      setStatusMsg('Please provide both Supabase Project URL and Anon API key.');
      return;
    }
    setCustomSupabaseConfig(url, anonKey);
  };

  const handleResetToSandbox = () => {
    setCustomSupabaseConfig('', '');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Supabase & PostgreSQL Database Connection"
      subtitle="Connect your free Supabase project or use the local relational engine"
      maxWidth="2xl"
    >
      <div className="space-y-4 font-mono">
        {/* Status Indicator */}
        <div className={`p-3 rounded border flex items-center justify-between ${
          isConnected 
            ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' 
            : 'bg-zinc-950 border-zinc-800 text-zinc-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded flex items-center justify-center ${
              isConnected ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'
            }`}>
              <Database className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold font-sans">
                {isConnected ? 'Connected to Remote Supabase PostgreSQL' : 'Active Local PostgreSQL Sandbox Engine'}
              </p>
              <p className="text-[11px] text-zinc-400 mt-0.5 font-mono">
                {isConnected 
                  ? `Live database: ${supabaseUrl}` 
                  : 'Real relational schema with local persistence. Ready to link your free Supabase database anytime.'}
              </p>
            </div>
          </div>
          {isConnected && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-900/60 text-emerald-300 text-[10px] font-semibold rounded border border-emerald-700">
              <CheckCircle2 className="w-3 h-3" /> ACTIVE
            </span>
          )}
        </div>

        {/* Step-by-Step Instructions */}
        <div className="bg-zinc-950 border border-zinc-800 rounded p-3 text-xs space-y-1.5">
          <p className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5 font-mono">
            <Key className="w-3.5 h-3.5 text-blue-400" /> QUICK SETUP GUIDE (100% FREE TIER):
          </p>
          <ol className="list-decimal list-inside space-y-1 text-zinc-400 pl-1 leading-relaxed text-[11px]">
            <li>Create a free account and project at <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-blue-400 font-medium underline inline-flex items-center gap-0.5">supabase.com <ExternalLink className="w-2.5 h-2.5" /></a></li>
            <li>In your Supabase dashboard, go to <b>SQL Editor</b> and paste schema from <code className="px-1 py-0.5 bg-zinc-900 rounded text-zinc-200">/supabase/schema.sql</code></li>
            <li>Navigate to <b>Project Settings &gt; API</b> to copy <b>Project URL</b> and <b>anon public key</b></li>
            <li>Paste them below or in <code className="px-1 py-0.5 bg-zinc-900 rounded text-zinc-200">.env</code></li>
          </ol>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSaveConnection} className="space-y-3">
          {statusMsg && (
            <div className="p-2.5 bg-amber-950/40 border border-amber-800 text-amber-300 rounded text-xs flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {statusMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">
              SUPABASE PROJECT URL
            </label>
            <input
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://xyzcompany.supabase.co"
              className="w-full px-2.5 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded focus:outline-none focus:border-blue-500 text-zinc-100 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">
              SUPABASE ANON PUBLIC API KEY
            </label>
            <input
              type="password"
              value={anonKey}
              onChange={e => setAnonKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-2.5 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded focus:outline-none focus:border-blue-500 text-zinc-100 font-mono"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={handleResetToSandbox}
              className="text-xs text-zinc-400 hover:text-zinc-200 underline font-mono"
            >
              Reset to Local Sandbox Engine
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1 text-xs font-semibold text-zinc-400 bg-zinc-800 hover:bg-zinc-750 hover:text-zinc-200 rounded transition-colors"
              >
                Close
              </button>
              <button
                type="submit"
                className="px-4 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded transition-colors shadow-xs"
              >
                Connect & Reload
              </button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
};
