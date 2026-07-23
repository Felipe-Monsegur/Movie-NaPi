import { ReactNode, useEffect } from 'react';
import { IconX } from './icons/AppIcons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
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

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="ui-panel max-w-lg w-full max-h-[92vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div
          className="h-1 w-full shrink-0"
          style={{ backgroundColor: 'var(--header-color)' }}
        />
        <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 sm:py-4 border-b border-line">
          <h2 id="modal-title" className="text-base sm:text-lg font-bold text-ink tracking-tight">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-control text-ink-muted hover:text-ink hover:bg-surface-2 transition-colors"
            aria-label="Cerrar"
          >
            <IconX size={18} className="w-[18px] h-[18px]" />
          </button>
        </div>
        <div className="p-4 sm:p-5 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
