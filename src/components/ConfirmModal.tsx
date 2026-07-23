import { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { hexToRgba } from '../utils/color';
import { IconFilm } from './icons/AppIcons';

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
  const { headerColor } = useTheme();
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
        className="ui-panel relative w-full max-w-[420px] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby="confirm-modal-desc"
      >
        <div className="h-1.5 w-full" style={{ backgroundColor: headerColor }} />

        <div className="p-6 sm:p-8">
          <div
            className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-panel text-[var(--header-color)]"
            style={{
              backgroundColor: hexToRgba(headerColor, 0.15),
              boxShadow: `0 0 0 8px ${hexToRgba(headerColor, 0.18)}`,
            }}
          >
            <IconFilm size={28} className="w-7 h-7" />
          </div>

          <h3
            id="confirm-modal-title"
            className="text-center text-xl font-bold tracking-tight sm:text-2xl text-ink"
          >
            {title}
          </h3>
          <p
            id="confirm-modal-desc"
            className="mt-3 text-center text-sm leading-relaxed sm:text-base text-ink-muted"
          >
            {message}
          </p>

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={pending}
              className="w-full rounded-control px-5 py-3 text-sm font-semibold transition-colors sm:w-auto bg-surface-2 text-ink hover:bg-surface-3 border border-line disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={pending}
              className="w-full rounded-control px-5 py-3 text-sm font-semibold shadow-lg sm:w-auto btn-header-primary"
            >
              {pending ? 'Un momento…' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
