import { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { hexToRgba } from '../utils/color';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type: _type = 'danger',
}: ConfirmModalProps) {
  const { theme, headerColor } = useTheme();
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) setPending(false);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setPending(true);
    try {
      await Promise.resolve(onConfirm());
    } finally {
      setPending(false);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm"
      onClick={pending ? undefined : onClose}
      role="presentation"
    >
      <div
        className={`relative w-full max-w-[420px] rounded-2xl shadow-2xl overflow-hidden transition-transform ${
          theme === 'dark' ? 'bg-gray-900 ring-1 ring-white/10' : 'bg-white ring-1 ring-gray-200'
        }`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby="confirm-modal-desc"
      >
        <div className="h-1.5 w-full" style={{ backgroundColor: headerColor }} />

        <div className="p-6 sm:p-8">
          <div
            className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{
              backgroundColor: hexToRgba(headerColor, theme === 'dark' ? 0.15 : 0.12),
              boxShadow: `0 0 0 8px ${hexToRgba(headerColor, 0.2)}`,
            }}
          >
            <span className="text-3xl" aria-hidden>
              🎬
            </span>
          </div>

          <h3
            id="confirm-modal-title"
            className={`text-center text-xl font-bold tracking-tight sm:text-2xl ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            {title}
          </h3>
          <p
            id="confirm-modal-desc"
            className={`mt-3 text-center text-sm leading-relaxed sm:text-base ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            {message}
          </p>

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={pending}
              className={`w-full rounded-xl px-5 py-3 text-sm font-semibold transition-colors sm:w-auto ${
                theme === 'dark'
                  ? 'bg-gray-800 text-gray-200 hover:bg-gray-700 disabled:opacity-50'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200 disabled:opacity-50'
              }`}
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={pending}
              className="w-full rounded-xl px-5 py-3 text-sm font-semibold shadow-lg sm:w-auto btn-header-primary"
            >
              {pending ? 'Un momento…' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
