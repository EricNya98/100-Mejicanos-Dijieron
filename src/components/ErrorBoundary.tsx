import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = 'Ha ocurrido un error inesperado.';
      try {
        const parsed = JSON.parse(this.state.error?.message || '');
        if (parsed.error) errorMessage = parsed.error;
      } catch (e) {
        // Not a JSON error
      }

      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter">¡Ups! Algo salió mal</h2>
            <p className="text-sm font-mono opacity-60 bg-white/5 p-4 border border-white/10 break-words">
              {errorMessage}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-white text-black font-black uppercase tracking-widest hover:bg-[#00ff00] transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCcw className="w-4 h-4" /> Reiniciar Aplicación
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
