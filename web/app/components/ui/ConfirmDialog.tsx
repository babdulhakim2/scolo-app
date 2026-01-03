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
    icon: 'bg-red-100',
    iconColor: 'text-red-600',
    button: 'bg-red-500 hover:bg-red-600',
  },
  warning: {
    icon: 'bg-amber-100',
    iconColor: 'text-amber-600',
    button: 'bg-amber-500 hover:bg-amber-600',
  },
  default: {
    icon: 'bg-cyan-100',
    iconColor: 'text-cyan-600',
    button: 'bg-cyan-500 hover:bg-cyan-600',
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
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={() => !isLoading && onClose()}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 animate-in zoom-in-95 fade-in duration-200">
        <div className="p-6">
          <div className={`w-12 h-12 ${styles.icon} rounded-xl flex items-center justify-center mx-auto mb-4`}>
            <AlertTriangle className={`w-6 h-6 ${styles.iconColor}`} />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 text-center mb-2">
            {title}
          </h3>
          <div className="text-sm text-slate-500 text-center mb-6">
            {description}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
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
