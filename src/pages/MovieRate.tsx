import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { getMovies, getMyRating, upsertRating } from '../services/firebaseService';
import { Movie } from '../types';

function sortByTitle(a: Movie, b: Movie) {
  return a.title.localeCompare(b.title, 'es', { sensitivity: 'base' });
}

export default function MovieRate() {
  const { user } = useAuth();
  const { theme, displayName } = useTheme();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const paramMovieId = searchParams.get('pelicula') || '';

  const [movies, setMovies] = useState<Movie[]>([]);
  const [movieId, setMovieId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
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
          return '';
        });
      } catch {
        showToast('No se pudo cargar las películas', 'error');
      } finally {
        setLoadingList(false);
      }
    };
    run();
  }, [paramMovieId]);

  const filteredMovies = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const base = q
      ? movies.filter((m) => m.title.toLowerCase().includes(q))
      : [...movies];
    return base.sort(sortByTitle);
  }, [movies, searchQuery]);

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
    const name = displayName.trim();
    if (!name) {
      showToast('En Mi perfil poné tu nombre en la lista antes de puntuar', 'error');
      return;
    }
    setSaving(true);
    try {
      await upsertRating({
        movieId,
        userId: user.uid,
        userEmail: user.email || '',
        userDisplayName: name,
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

  const listRowInactive =
    theme === 'dark'
      ? 'text-gray-200 hover:bg-gray-700/80 border-gray-700'
      : 'text-gray-800 hover:bg-violet-50 border-gray-100';
  const listRowActive =
    theme === 'dark'
      ? 'bg-violet-600/25 text-white border-violet-500/40 ring-1 ring-violet-500/30'
      : 'bg-violet-100 text-violet-900 border-violet-200 ring-1 ring-violet-200';

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
          Buscá la película, tocala para elegirla y después cargá nota y opinión.
        </p>
      </div>

      <form onSubmit={handleSubmit} className={`rounded-xl border p-4 sm:p-6 space-y-5 ${card}`}>
        <div className="space-y-2">
          <label htmlFor="movie-search" className={`block text-sm font-medium ${label}`}>
            Buscar y elegir película
          </label>
          <div className="relative">
            <span
              className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}
              aria-hidden
            >
              🔍
            </span>
            <input
              id="movie-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full border rounded-lg pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 ${input}`}
              placeholder="Buscar por título…"
              autoComplete="off"
            />
          </div>

          <div
            className={`max-h-52 sm:max-h-64 overflow-y-auto rounded-lg border ${
              theme === 'dark' ? 'border-gray-600 bg-gray-900/40' : 'border-gray-200 bg-gray-50/80'
            }`}
            role="listbox"
            aria-label="Resultados de búsqueda"
          >
            {filteredMovies.length === 0 ? (
              <p className={`px-3 py-4 text-sm text-center ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                No hay coincidencias por título. Probá otra búsqueda o borrá el texto.
              </p>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredMovies.map((m) => {
                  const active = m.id === movieId;
                  return (
                    <li key={m.id}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={active}
                        onClick={() => setMovieId(m.id)}
                        className={`w-full text-left px-3 py-3 sm:py-2.5 text-sm transition-colors border-l-4 ${
                          active ? `${listRowActive} border-l-violet-500` : `${listRowInactive} border-l-transparent`
                        }`}
                      >
                        <span className="font-medium">{m.title}</span>
                        {m.year != null && !Number.isNaN(m.year) && (
                          <span className={`ml-2 tabular-nums ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            ({m.year})
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {selected ? (
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
              Elegida: <span className="font-medium text-violet-600 dark:text-violet-300">{selected.title}</span>
              {' · '}
              Añadida por {selected.createdByName.trim() || 'Sin nombre'}
            </p>
          ) : (
            <p className={`text-xs ${theme === 'dark' ? 'text-amber-200/80' : 'text-amber-800'}`}>
              Elegí una película de la lista para poder puntuar.
            </p>
          )}
        </div>

        <div className={!movieId ? 'opacity-50 pointer-events-none' : ''}>
          <div className="flex justify-between items-baseline">
            <label className={`text-sm font-medium ${label}`}>Puntuación (1–10)</label>
            <span
              className={`text-lg font-bold tabular-nums ${theme === 'dark' ? 'text-violet-300' : 'text-violet-700'}`}
            >
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
            disabled={loadingRating || !movieId}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>1</span>
            <span>10</span>
          </div>
        </div>

        <div className={!movieId ? 'opacity-50 pointer-events-none' : ''}>
          <label className={`block text-sm font-medium mb-1 ${label}`}>Opinión</label>
          <textarea
            value={opinion}
            onChange={(e) => setOpinion(e.target.value)}
            rows={5}
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-y min-h-[120px] ${input}`}
            placeholder="Qué te pareció, sin spoilers o con spoilers avisando…"
            disabled={loadingRating || !movieId}
          />
        </div>

        <button
          type="submit"
          disabled={saving || loadingRating || !movieId}
          className="w-full py-2.5 rounded-lg bg-violet-600 text-white font-medium hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Guardando…' : loadingRating ? 'Cargando…' : 'Guardar mi valoración'}
        </button>
      </form>
    </div>
  );
}
