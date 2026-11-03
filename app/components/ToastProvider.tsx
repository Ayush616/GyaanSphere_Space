'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, CircleX, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

type ToastOptions = {
  title: string;
  description?: string;
  type?: ToastType;
  duration?: number;
};

type ConfirmOptions = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
};

type ConfirmState = ConfirmOptions & {
  resolve: (value: boolean) => void;
};

type ToastItem = ToastOptions & {
  id: number;
  type: ToastType;
};

type ToastContextValue = {
  showToast: (toast: ToastOptions) => void;
  confirmAction: (options: ConfirmOptions) => Promise<boolean>;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used inside ToastProvider');
  }

  return context;
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);

  const removeToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    ({ title, description, type = 'info', duration = 4200 }: ToastOptions) => {
      const id = Date.now() + Math.random();
      setToasts((current) => [...current, { id, title, description, type }]);
      window.setTimeout(() => removeToast(id), duration);
    },
    [removeToast],
  );

  const confirmAction = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({ ...options, resolve });
    });
  }, []);

  const handleConfirm = useCallback((result: boolean) => {
    if (confirmState) {
      confirmState.resolve(result);
    }
    setConfirmState(null);
  }, [confirmState]);

  const toastConfig = useMemo(
    () => ({
      showToast,
      confirmAction,
    }),
    [showToast, confirmAction],
  );

  return (
    <ToastContext.Provider value={toastConfig}>
      {children}

      <div className="toast-portal" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => {
          const Icon = {
            success: CheckCircle2,
            error: CircleX,
            warning: AlertTriangle,
            info: Info,
          }[toast.type];

          return (
            <div key={toast.id} className={`toast toast--${toast.type}`}>
              <div className={`toast__icon toast__icon--${toast.type}`}>
                <Icon size={18} />
              </div>

              <div className="toast__content">
                <p>{toast.title}</p>
                {toast.description && <span>{toast.description}</span>}
              </div>

              <button
                type="button"
                className="toast__close"
                onClick={() => removeToast(toast.id)}
                aria-label="Dismiss notification"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>

      {confirmState && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title">
          <div className="confirm-modal">
            <div className={`confirm-modal__icon confirm-modal__icon--${confirmState.destructive ? 'warning' : 'info'}`}>
              {confirmState.destructive ? <AlertTriangle size={20} /> : <Info size={20} />}
            </div>

            <div className="confirm-modal__body">
              <h3 id="confirm-dialog-title">{confirmState.title}</h3>
              {confirmState.description && <p>{confirmState.description}</p>}
            </div>

            <div className="confirm-modal__actions">
              <button
                type="button"
                className="confirm-modal__button confirm-modal__button--secondary"
                onClick={() => handleConfirm(false)}
              >
                {confirmState.cancelLabel || 'Cancel'}
              </button>
              <button
                type="button"
                className={`confirm-modal__button ${confirmState.destructive ? 'confirm-modal__button--danger' : 'confirm-modal__button--primary'}`}
                onClick={() => handleConfirm(true)}
              >
                {confirmState.confirmLabel || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}
