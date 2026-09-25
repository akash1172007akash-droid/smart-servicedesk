import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmModal = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'danger',
  onConfirm,
  onClose,
  loading = false,
}) => {
  if (!isOpen) return null;

  const buttonVariantClasses =
    confirmVariant === 'danger'
      ? 'bg-rose-600 hover:bg-rose-700 text-white'
      : confirmVariant === 'success'
      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
      : 'bg-indigo-600 hover:bg-indigo-700 text-white';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={onClose} />

        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-xl ${
                  confirmVariant === 'danger'
                    ? 'bg-rose-100 text-rose-600'
                    : 'bg-indigo-100 text-indigo-600'
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="text-slate-400 hover:text-slate-600 rounded-lg p-1 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-3">
            <p className="text-sm text-slate-600 leading-relaxed">{message}</p>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              {cancelText}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={onConfirm}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition shadow-sm ${buttonVariantClasses}`}
            >
              {loading ? 'Processing...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
