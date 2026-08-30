import React, { useState } from 'react';
import { Database, Server, User, LogOut, CheckCircle, AlertTriangle, RefreshCw, KeyRound, Copy, Check } from 'lucide-react';
import {
  getPocketBaseUrl,
  updatePocketBaseUrl,
  testPocketBaseConnection,
  loginWithEmail,
  registerUser,
  logoutUser,
  syncOfflineSessions,
} from '../services/pocketbase';
import type { UserProfile } from '../types';

interface PocketBaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onUserChanged: (user: UserProfile | null) => void;
  isConnected: boolean;
  onConnectionStatusChange: (status: boolean) => void;
}

export const PocketBaseModal: React.FC<PocketBaseModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChanged,
  isConnected,
  onConnectionStatusChange,
}) => {
  const [activeTab, setActiveTab] = useState<'connection' | 'auth' | 'schema'>('connection');
  const [pbUrl, setPbUrl] = useState<string>(getPocketBaseUrl());
  const [testing, setTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  // Auth state
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(false);

  // Sync state
  const [syncing, setSyncing] = useState<boolean>(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  // Copy helper
  const [copiedSchema, setCopiedSchema] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    updatePocketBaseUrl(pbUrl);
    const ok = await testPocketBaseConnection(pbUrl);
    setTesting(false);
    onConnectionStatusChange(ok);
    if (ok) {
      setTestResult('Successfully connected to PocketBase server!');
    } else {
      setTestResult('Could not connect to PocketBase server. Make sure PocketBase is running.');
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      if (authMode === 'login') {
        const user = await loginWithEmail(email, password);
        onUserChanged(user);
      } else {
        const user = await registerUser(email, password, name || 'Musician');
        onUserChanged(user);
      }
      setAuthLoading(false);
      onClose();
    } catch (err: any) {
      console.error('Auth error:', err);
      setAuthError(err.message || 'Authentication failed. Please check credentials.');
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    logoutUser();
    onUserChanged(null);
  };

  const handleSyncOffline = async () => {
    setSyncing(true);
    setSyncMsg(null);
    const count = await syncOfflineSessions();
    setSyncing(false);
    setSyncMsg(`Successfully synced ${count} practice session(s) to PocketBase!`);
  };

  const schemaGuideText = `PocketBase Collections Setup Guide:

Collection Name: practice_logs
Type: Base

Fields:
- user (Relation -> users, single)
- exercise_id (Text)
- exercise_title (Text)
- bpm (Number)
- duration_seconds (Number)
- score (Number)
- timestamp (Text or DateTime)

API Rules:
- List/View: @request.auth.id != ""
- Create: @request.auth.id != ""`;

  const copySchemaGuide = () => {
    navigator.clipboard.writeText(schemaGuideText);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-4">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 dark:border-indigo-500/30">
              <Database size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">PocketBase Server Settings</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Offline Sync & Backend Integration</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold text-sm">
            ✕
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800/80 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('connection')}
            className={`flex-1 py-1.5 rounded-lg transition-all duration-200 ${
              activeTab === 'connection' ? 'bg-indigo-600 text-white font-bold shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Server Config
          </button>
          <button
            onClick={() => setActiveTab('auth')}
            className={`flex-1 py-1.5 rounded-lg transition-all duration-200 ${
              activeTab === 'auth' ? 'bg-indigo-600 text-white font-bold shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            User Account
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`flex-1 py-1.5 rounded-lg transition-all duration-200 ${
              activeTab === 'schema' ? 'bg-indigo-600 text-white font-bold shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            PocketBase Schema
          </button>
        </div>

        {/* TAB 1: Server Config */}
        {activeTab === 'connection' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Connection Status:</span>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
                  isConnected
                    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                    : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20'
                }`}
              >
                {isConnected ? <CheckCircle size={13} /> : <AlertTriangle size={13} />}
                {isConnected ? 'PocketBase Connected' : 'Offline / Server Unreachable'}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                PocketBase Server URL
              </label>
              <input
                type="text"
                value={pbUrl}
                onChange={(e) => setPbUrl(e.target.value)}
                placeholder="http://127.0.0.1:8090"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Default PocketBase local URL is <code className="text-teal-600 dark:text-teal-400 font-bold">http://127.0.0.1:8090</code>
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleTestConnection}
                disabled={testing}
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20"
              >
                {testing ? <RefreshCw size={14} className="animate-spin" /> : <Server size={14} />}
                {testing ? 'Testing...' : 'Test Connection'}
              </button>

              <button
                onClick={handleSyncOffline}
                disabled={syncing || !isConnected}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
              >
                {syncing ? <RefreshCw size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                Sync Local Sessions
              </button>
            </div>

            {testResult && (
              <div
                className={`text-xs p-3 rounded-xl border ${
                  isConnected
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                    : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                }`}
              >
                {testResult}
              </div>
            )}

            {syncMsg && (
              <div className="text-xs p-3 rounded-xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 font-medium">
                {syncMsg}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: User Account */}
        {activeTab === 'auth' && (
          <div className="flex flex-col gap-4">
            {currentUser ? (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-md">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{currentUser.name}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{currentUser.email}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle size={13} /> Authenticated with PocketBase
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1 px-3 py-1 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900 border border-rose-200 dark:border-rose-800 rounded-xl font-bold transition"
                  >
                    <LogOut size={13} /> Logout
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleAuthSubmit} className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {authMode === 'login' ? 'Sign in to PocketBase' : 'Create new PocketBase account'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
                  >
                    {authMode === 'login' ? 'Need an account? Register' : 'Already registered? Login'}
                  </button>
                </div>

                {authError && (
                  <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs p-2.5 rounded-xl font-medium">
                    ⚠️ {authError}
                  </div>
                )}

                {authMode === 'register' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Pianist"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 mt-1"
                >
                  {authLoading && <RefreshCw size={14} className="animate-spin" />}
                  {authMode === 'login' ? 'Login with PocketBase' : 'Register Account'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* TAB 3: Schema Setup */}
        {activeTab === 'schema' && (
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-700 dark:text-slate-300 font-bold">PocketBase Collection Schema Setup</span>
              <button
                onClick={copySchemaGuide}
                className="flex items-center gap-1 text-teal-600 dark:text-teal-400 hover:underline font-mono text-[11px] font-bold"
              >
                {copiedSchema ? <Check size={13} /> : <Copy size={13} />}
                {copiedSchema ? 'Copied!' : 'Copy Schema'}
              </button>
            </div>

            <pre className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-800 dark:text-slate-300 overflow-x-auto whitespace-pre-wrap">
              {schemaGuideText}
            </pre>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              💡 Open your PocketBase Admin UI (<code className="text-teal-600 dark:text-teal-400 font-bold">http://127.0.0.1:8090/_/</code>) to create the <code className="text-indigo-600 dark:text-indigo-400 font-bold">practice_logs</code> collection.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

