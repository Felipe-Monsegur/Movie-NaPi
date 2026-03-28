import { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { updateMovieTitle } from '../services/firebaseService';
import { Movie } from '../types';

interface EditMovieTitleModalProps {
  movie: Movie | null;
  onClose: () => void;
  onSaved: (movieId: string, newTitle: string) => void;
}

export default function EditMovieTitleModal({ movie, onClose, onSaved }: EditMovieTitleModalProps) {
  const { theme, headerColor } = useTheme();
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (movie) {
      setTitle(movie.title);
      setError('');
    }
  }, [movie]);

  useEffect(() => {
    if (movie) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [movie]);

  if (!movie) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = title.trim();
    if (!t) {
      setError('Escribí un título');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await updateMovieTitle(movie.id, t);
      onSaved(movie.id, t);
      onClose();
    } catch {
      setError('No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  const card = theme === 'dark' ? 'bg-gray-900 ring-white/10' : 'bg-white ring-gray-200';
  const label = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';
  const input =
    theme === 'dark'
      ? 'border-gray-600 bg-gray-800 text-white'
      : 'border-gray-300 bg-white text-gray-900';

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm"
      onClick={saving ? undefined : onClose}
      role="presentation"
    >
      <div
        className={`relative w-full max-w-md rounded-2xl shadow-2xl ring-1 ${card}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-movie-title-heading"
      >
        <div className="h-1.5 w-full rounded-t-2xl" style={{ backgroundColor: headerColor }} />
        <form onSubmit={handleSubmit} className="p-6 sm:p-8">
          <h2
            id="edit-movie-title-heading"
            className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
          >
            Editar título
          </h2>
          <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Película o serie: solo cambia el nombre en la lista; las valoraciones se mantienen.
          </p>
          <label htmlFor="edit-movie-title" className={`mt-4 block text-sm font-medium ${label}`}>
            Título
          </label>
          <input
            id="edit-movie-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`mt-1 w-full border rounded-xl px-3 py-2.5 focus:outline-none focus-ring-header ${input}`}
            maxLength={200}
            autoComplete="off"
            disabled={saving}
          />
          {error ? (
            <p className="mt-2 text-sm text-red-500" role="alert">
              {error}
            </p>
          ) : null}
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className={`w-full rounded-xl px-5 py-3 text-sm font-semibold sm:w-auto ${
                theme === 'dark'
                  ? 'bg-gray-800 text-gray-200 hover:bg-gray-700 disabled:opacity-50'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200 disabled:opacity-50'
              }`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl px-5 py-3 text-sm font-semibold btn-header-primary sm:w-auto"
            >
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
