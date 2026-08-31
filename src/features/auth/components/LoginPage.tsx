import { useState } from 'react';
import { LogIn, UserPlus } from 'lucide-react';
import { loginWithEmail, registerUser } from '../../../services/pocketbase';
import { ErrorBanner } from '../../../components/ErrorBanner';

type Mode = 'login' | 'register';

export function LoginPage() {
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        await loginWithEmail(email, password);
      } else {
        await registerUser(email, password, name);
      }
    } catch (err) {
      console.error(`PocketBase ${mode} failed:`, err);
      setError(
        mode === 'login'
          ? 'Could not sign in. Check your email and password, or that PocketBase is reachable.'
          : 'Could not create an account. The email may already be in use, or PocketBase is unreachable.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 w-full flex items-center justify-center py-10">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-lg flex flex-col gap-4">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            {mode === 'login' ? <LogIn className="text-teal-600 dark:text-teal-400" size={18} /> : <UserPlus className="text-teal-600 dark:text-teal-400" size={18} />}
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {error && <ErrorBanner message={error} className="text-xs p-2.5" />}

          {mode === 'register' && (
            <div>
              <label htmlFor="auth-name" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Name</label>
              <input
                id="auth-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          <div>
            <label htmlFor="auth-email" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email</label>
            <input
              id="auth-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="auth-password" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Password</label>
            <input
              id="auth-password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-60 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/20 transition"
          >
            {isSubmitting ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>

          <button
            type="button"
            onClick={() => {
              setMode((m) => (m === 'login' ? 'register' : 'login'));
              setError(null);
            }}
            className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-semibold text-center"
          >
            {mode === 'login' ? "Don't have an account? Create one" : 'Already have an account? Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
