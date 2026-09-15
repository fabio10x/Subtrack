import React from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import { FallbackProps } from 'react-error-boundary';

export const GlobalErrorBoundary: React.FC<FallbackProps> = ({ error, resetErrorBoundary }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden text-center p-8 space-y-6">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Oops! Something went wrong.</h1>
          <p className="text-slate-500 text-sm">
            We encountered an unexpected error. Our team has been notified.
          </p>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-left overflow-auto max-h-32">
          <p className="text-xs font-mono text-red-800 break-words">
            {error.message || 'Unknown Error'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={resetErrorBoundary}
            className="flex-1 flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            className="flex-1 flex items-center justify-center space-x-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2.5 rounded-lg font-medium transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Go Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};
