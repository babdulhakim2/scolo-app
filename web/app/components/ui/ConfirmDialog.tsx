'use client';

import { ReactNode } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  variant?: 'danger' | 'warning' | 'default';
}

const variantStyles = {
  danger: {
    icon: 'bg-red-500/20',
    iconColor: 'text-red-400',
    button: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
  },
  warning: {
    icon: 'bg-amber-500/20',
    iconColor: 'text-amber-400',
    button: 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700',
  },
  default: {
    icon: 'bg-cyan-500/20',
    iconColor: 'text-cyan-400',
    button: 'bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700',
  },
};

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isLoading = false,
  variant = 'danger',
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const styles = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={() => !isLoading && onClose()}
      />
      <div className="relative bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl w-full max-w-sm mx-4 animate-in zoom-in-95 fade-in duration-200 grain">
        <div className="p-6">
          <div className={`w-12 h-12 ${styles.icon} rounded-xl flex items-center justify-center mx-auto mb-4`}>
            <AlertTriangle className={`w-6 h-6 ${styles.iconColor}`} />
          </div>
          <h3 className="text-lg font-semibold text-white text-center mb-2">
            {title}
          </h3>
          <div className="text-sm text-white/70 text-center mb-6">
            {description}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white/70 bg-black/40 hover:bg-black/50 rounded-xl transition-all disabled:opacity-50 border border-white/10"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 px-4 py-2.5 text-sm font-medium text-white ${styles.button} rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading...
                </>
              ) : (
                confirmLabel
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
