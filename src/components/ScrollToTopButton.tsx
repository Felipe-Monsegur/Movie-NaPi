import { useEffect, useState } from 'react';

const SHOW_AFTER_PX = 280;

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > SHOW_AFTER_PX);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface text-ink shadow-panel transition-opacity hover:bg-surface-2 focus:outline-none focus-ring-header"
      aria-label="Volver arriba"
      title="Volver arriba"
    >
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2.25"
        aria-hidden
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
      </svg>
    </button>
  );
}
