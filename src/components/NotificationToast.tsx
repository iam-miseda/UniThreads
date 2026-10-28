import React from 'react';
import { useSwap } from '../context/SwapContext';
import { Sparkles, CheckCircle2, Info, X } from 'lucide-react';

export const NotificationToast: React.FC = () => {
  const { notification, dismissNotification } = useSwap();

  if (!notification) return null;

  const isPoints = notification.type === 'points';
  const isSuccess = notification.type === 'success';

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div
        className={`flex items-start gap-3 p-4 rounded-2xl shadow-xl border ${
          isPoints
            ? 'matte-glass-dark text-white border-amber-400/40'
            : isSuccess
            ? 'matte-glass-dark text-white border-white/20'
            : 'matte-glass text-neutral-900 border-neutral-300'
        }`}
      >
        <div className="mt-0.5 shrink-0">
          {isPoints ? (
            <Sparkles className="w-5 h-5 text-amber-400" />
          ) : isSuccess ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <Info className="w-5 h-5 text-blue-500" />
          )}
        </div>
        <div className="flex-1 text-xs font-semibold leading-relaxed">
          {notification.message}
        </div>
        <button
          onClick={dismissNotification}
          className="shrink-0 text-neutral-400 hover:text-white p-0.5 rounded-full transition-colors"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
