import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by gasti ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetCache = () => {
    try {
      // Clear corrupt state keys while preserving main user preferences if possible
      localStorage.removeItem('gasti_expenses');
      localStorage.removeItem('gasti_active_tab');
    } catch {
      // ignore
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-black text-white flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-950/80 border border-rose-800 flex items-center justify-center text-rose-400 shadow-lg">
              <AlertOctagon className="w-8 h-8" />
            </div>
            
            <h2 className="text-xl font-extrabold text-white">
              Algo inesperado ocurrió
            </h2>
            
            <p className="text-xs text-zinc-400 leading-relaxed">
              La aplicación encontró un detalle inesperado al procesar los datos. No te preocupes, tu información está segura.
            </p>

            {this.state.error && (
              <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-3 text-left overflow-hidden">
                <p className="text-[11px] font-mono text-rose-400 break-words line-clamp-3">
                  {this.state.error.message || String(this.state.error)}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reintentar</span>
              </button>
              <button
                type="button"
                onClick={this.handleResetCache}
                className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Restaurar Datos
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
