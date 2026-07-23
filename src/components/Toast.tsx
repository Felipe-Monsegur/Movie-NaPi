import { useEffect, type ReactNode } from 'react';
import { useTheme } from '../context/ThemeContext';
import { IconCheck, IconInfo, IconWarning, IconX } from './icons/AppIcons';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, onClose, duration = 4000 }: ToastProps) {
  const { headerColor } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeStyles: Record<
    ToastType,
    { bg: string; border: string; icon: ReactNode }
  > = {
    success: {
      bg: 'bg-green-600',
      border: 'border-green-500',
      icon: <IconCheck size={22} className="w-[22px] h-[22px]" />,
    },
    error: {
      bg: 'bg-red-600',
      border: 'border-red-500',
      icon: <IconX size={22} className="w-[22px] h-[22px]" />,
    },
    info: {
      bg: '',
      border: '',
      icon: <IconInfo size={22} className="w-[22px] h-[22px]" />,
    },
    warning: {
      bg: 'bg-yellow-600',
      border: 'border-yellow-500',
      icon: <IconWarning size={22} className="w-[22px] h-[22px]" />,
    },
  };

  const style = typeStyles[type];
  const isInfo = type === 'info';

  return (
    <div
      className={`${!isInfo ? `${style.bg} ${style.border} ` : ''}border-l-4 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 min-w-[300px] max-w-[500px] animate-slide-in-right`}
      style={
        isInfo
          ? { backgroundColor: headerColor, borderLeftColor: headerColor }
          : undefined
      }
    >
      <span className="flex-shrink-0 opacity-95">{style.icon}</span>
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className="text-white hover:text-gray-200 flex-shrink-0 ml-2 transition-colors p-0.5"
        aria-label="Cerrar"
      >
        <IconX size={18} className="w-[18px] h-[18px]" />
      </button>
    </div>
  );
}
