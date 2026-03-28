import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { getMovies, getMyRating, upsertRating } from '../services/firebaseService';
import { Movie } from '../types';

export default function MovieRate() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const paramMovieId = searchParams.get('pelicula') || '';

  const [movies, setMovies] = useState<Movie[]>([]);
  const [movieId, setMovieId] = useState(paramMovieId);
  const [score, setScore] = useState(7);
  const [opinion, setOpinion] = useState('');
  const [loadingList, setLoadingList] = useState(true);
  const [loadingRating, setLoadingRating] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const run = async () => {
      setLoadingList(true);
      try {
        const list = await getMovies();
        setMovies(list);
        setMovieId((prev) => {
          if (paramMovieId && list.some((m) => m.id === paramMovieId)) return paramMovieId;
          if (prev && list.some((m) => m.id === prev)) return prev;
          return list[0]?.id ?? '';
        });
      } catch {
        showToast('No se pudo cargar las películas', 'error');
      } finally {
        setLoadingList(false);
      }
    };
    run();
  }, [paramMovieId]);

  useEffect(() => {
    if (!user || !movieId) {
      setOpinion('');
      return;
    }
    let cancelled = false;
    const loadRating = async () => {
      setLoadingRating(true);
      try {
        const r = await getMyRating(movieId, user.uid);
        if (!cancelled) {
          if (r) {
            setScore(r.score);
            setOpinion(r.opinion);
          } else {
            setScore(7);
            setOpinion('');
          }
        }
      } catch {
        if (!cancelled) showToast('No se pudo cargar tu valoración', 'error');
      } finally {
        if (!cancelled) setLoadingRating(false);
      }
    };
    loadRating();
    return () => {
      cancelled = true;
    };
  }, [movieId, user?.uid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !movieId) return;
    setSaving(true);
    try {
      await upsertRating({
        movieId,
        userId: user.uid,
        userEmail: user.email || '',
        score,
        opinion,
      });
      showToast('Valoración guardada', 'info');
    } catch {
      showToast('Error al guardar', 'error');
    } finally {
      setSaving(false);
    }
  };

  const selected = movies.find((m) => m.id === movieId);
  const card = theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const label = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';
  const input =
    theme === 'dark'
      ? 'border-gray-600 bg-gray-700 text-white'
      : 'border-gray-300 bg-white text-gray-800';

  if (loadingList) {
    return (
      <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
        Cargando…
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className={`max-w-lg mx-auto text-center py-12 rounded-xl border ${card} px-6`}>
        <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
          Primero añadí películas en <strong>Por ver</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h2 className={`text-xl sm:text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Puntuar y opinar
        </h2>
        <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Cada uno guarda su propia nota y comentario; en el panel se ven ambas y el promedio.
        </p>
      </div>

      <form onSubmit={handleSubmit} className={`rounded-xl border p-4 sm:p-6 space-y-5 ${card}`}>
        <div>
          <label className={`block text-sm font-medium mb-1 ${label}`}>Película</label>
          <select
            value={movieId}
            onChange={(e) => setMovieId(e.target.value)}
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 ${input}`}
          >
            {movies.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
                {m.year != null && !Number.isNaN(m.year) ? ` (${m.year})` : ''}
              </option>
            ))}
          </select>
          {selected && (
            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
              En lista desde {selected.createdByEmail || '—'}
            </p>
          )}
        </div>

        <div>
          <div className="flex justify-between items-baseline">
            <label className={`text-sm font-medium ${label}`}>Puntuación (1–10)</label>
            <span className={`text-lg font-bold tabular-nums ${theme === 'dark' ? 'text-violet-300' : 'text-violet-700'}`}>
              {score}
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={score}
            onChange={(e) => setScore(Number(e.target.value))}
            className="w-full mt-2 accent-violet-600"
            disabled={loadingRating}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>1</span>
            <span>10</span>
          </div>
        </div>

        <div>
          <label className={`block text-sm font-medium mb-1 ${label}`}>Opinión</label>
          <textarea
            value={opinion}
            onChange={(e) => setOpinion(e.target.value)}
            rows={5}
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-y min-h-[120px] ${input}`}
            placeholder="Qué te pareció, sin spoilers o con spoilers avisando…"
            disabled={loadingRating}
          />
        </div>

        <button
          type="submit"
          disabled={saving || loadingRating}
          className="w-full py-2.5 rounded-lg bg-violet-600 text-white font-medium hover:bg-violet-700 disabled:opacity-50"
        >
          {saving ? 'Guardando…' : loadingRating ? 'Cargando…' : 'Guardar mi valoración'}
        </button>
      </form>
    </div>
  );
}
