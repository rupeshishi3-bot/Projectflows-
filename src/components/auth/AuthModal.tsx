import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Lock, Mail, User, Eye, EyeOff, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
}) => {
  const { signIn, signUp, isConfigured } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        const res = await signIn(email, password);
        if (!res.success) {
          setError(res.error || 'Invalid email or password');
        } else {
          onClose();
        }
      } else {
        if (!fullName.trim()) {
          setError('Full name is required');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }

        const res = await signUp(email, password, fullName);
        if (!res.success) {
          setError(res.error || 'Failed to create account');
        } else {
          if (isConfigured) {
            setSuccessMessage('Account created successfully! Check your email if confirmation is enabled.');
            setTimeout(() => onClose(), 1500);
          } else {
            onClose();
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('demo123456');
    setLoading(true);
    await signIn(demoEmail, 'demo123456');
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/75 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-zinc-900 rounded-md shadow-2xl border border-zinc-800 overflow-hidden font-mono">
        
        {/* Header */}
        <div className="px-6 pt-6 pb-4 text-center bg-zinc-950 border-b border-zinc-800">
          <div className="w-9 h-9 mx-auto bg-blue-600 text-white rounded flex items-center justify-center shadow-md mb-2">
            <Sparkles className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-zinc-100 uppercase tracking-wider font-mono">
            {mode === 'signin' ? 'AUTHENTICATION' : 'CREATE ACCOUNT'}
          </h2>
          <p className="text-xs text-zinc-400 mt-1 font-mono">
            {mode === 'signin'
              ? 'Enter credentials to access workspace'
              : 'Start collaborating with your team'}
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-zinc-800 bg-zinc-950 px-6">
          <button
            type="button"
            onClick={() => { setMode('signin'); setError(null); }}
            className={`flex-1 py-2 text-xs font-semibold text-center border-b-2 transition-colors ${
              mode === 'signin'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            SIGN IN
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(null); }}
            className={`flex-1 py-2 text-xs font-semibold text-center border-b-2 transition-colors ${
              mode === 'signup'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            SIGN UP
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-3">
          {error && (
            <div className="flex items-start gap-2 p-2.5 bg-rose-950/40 border border-rose-800 rounded text-rose-300 text-xs">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-start gap-2 p-2.5 bg-emerald-950/40 border border-emerald-800 rounded text-emerald-300 text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                FULL NAME
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded focus:outline-none focus:border-blue-500 text-zinc-100 font-sans"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">
              EMAIL ADDRESS
            </label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded focus:outline-none focus:border-blue-500 text-zinc-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">
              PASSWORD
            </label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-8 pr-8 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded focus:outline-none focus:border-blue-500 text-zinc-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2 px-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold text-xs rounded transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {loading ? 'Processing...' : mode === 'signin' ? 'Sign In to Workspace' : 'Create Free Account'}
          </button>

          {/* Quick Demo Switcher for fast testing in preview */}
          <div className="pt-3 border-t border-zinc-800">
            <p className="text-[11px] text-zinc-500 text-center mb-2 font-mono">QUICK TEST ACCOUNTS:</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('alex.rivera@example.com')}
                className="py-1 px-2 text-xs text-zinc-300 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded font-mono text-center truncate"
              >
                Alex (Owner)
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('sarah.chen@example.com')}
                className="py-1 px-2 text-xs text-zinc-300 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded font-mono text-center truncate"
              >
                Sarah (Admin)
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
