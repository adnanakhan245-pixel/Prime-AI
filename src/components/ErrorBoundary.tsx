import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetAndReload = () => {
    try {
      // Clear potentially corrupted local state
      const keysToClear = [
        'prime_ai_crm_records_',
        'prime_dunning_company_',
        'prime_pql_company_',
        'prime_events_company_',
        'prime_renewal_company_',
        'prime_ai_user_session',
      ];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && keysToClear.some(prefix => key.startsWith(prefix))) {
          localStorage.removeItem(key);
        }
      }
    } catch (e) {
      console.error('Error clearing localStorage:', e);
    }
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col items-center justify-center p-6 select-none font-sans">
          <div className="max-w-md w-full bg-zinc-900/90 border border-amber-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-bold tracking-tight text-white">
                Workspace Session Recovered
              </h1>
              <p className="text-xs text-zinc-400 leading-relaxed">
                PRIME AI caught an unexpected interface anomaly. Your data is protected. You can safely restore the executive session below.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-black/60 border border-white/10 rounded-xl p-3 text-left overflow-hidden">
                <p className="text-[11px] font-mono text-rose-300 break-words line-clamp-3">
                  {this.state.error.message || 'Unknown render exception'}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/20"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </button>

              <button
                onClick={this.handleResetAndReload}
                className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border border-white/10"
              >
                <Trash2 className="w-4 h-4 text-rose-400" />
                Clear Cache & Reset
              </button>
            </div>

            <p className="text-[10px] text-zinc-500">
              PRIME AI Autonomous Kernel • Self-Healing Architecture
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
