import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { useMoviesData } from '../context/MoviesDataContext';
import { upsertRating } from '../services/firebaseService';
import { hexToRgba } from '../utils/color';
import { clampScoreToHalfSteps, formatScoreDisplay } from '../utils/scoreFormat';
import { scoreToDisplayColor } from '../utils/scoreColor';
import { IconSearch } from '../components/icons/AppIcons';
import type { Movie } from '../types';

function sortByTitle(a: Movie, b: Movie) {
  return a.title.localeCompare(b.title, 'es', { sensitivity: 'base' });
}

function MoviePickSection({
  title,
  emptyText,
  movies,
  renderRow,
  theme,
}: {
  title: string;
  emptyText: string;
  movies: Movie[];
  renderRow: (m: Movie) => ReactNode;
  theme: string;
}) {
  return (
    <div
      className={`rounded-lg border overflow-hidden ${
        theme === 'dark' ? 'border-gray-600 bg-gray-900/40' : 'border-gray-200 bg-gray-50/80'
      }`}
    >
      <p
        className={`px-3 py-1.5 text-[0.65rem] font-bold ui-label border-b ${
          theme === 'dark'
            ? 'bg-gray-800/95 text-gray-400 border-gray-700'
            : 'bg-gray-100/95 text-gray-500 border-gray-200'
        }`}
      >
        {title}
      </p>
      {movies.length === 0 ? (
        <p className={`px-3 py-3 text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
          {emptyText}
        </p>
      ) : (
        <ul
          className="max-h-40 sm:max-h-48 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700"
          role="listbox"
          aria-label={title}
        >
          {movies.map((m) => renderRow(m))}
        </ul>
      )}
    </div>
  );
}

export default function MovieRate() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, displayName, headerColor } = useTheme();
  const { showToast } = useToast();
  const { movies, ratings, myRatedIds, initialLoading, refreshing, refresh } = useMoviesData();
  const [searchParams] = useSearchParams();
  const paramMovieId = searchParams.get('pelicula') || '';

  const [movieId, setMovieId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [score, setScore] = useState(7);
  const [opinion, setOpinion] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!movies.length) return;
    setMovieId((prev) => {
      if (paramMovieId && movies.some((m) => m.id === paramMovieId)) return paramMovieId;
      if (prev && movies.some((m) => m.id === prev)) return prev;
      return '';
    });
  }, [movies, paramMovieId]);

  const { pendingMovies, ratedMovies } = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const base = q
      ? movies.filter((m) => m.title.toLowerCase().includes(q))
      : [...movies];
    const pending: Movie[] = [];
    const rated: Movie[] = [];
    for (const m of base) {
      if (myRatedIds.has(m.id)) rated.push(m);
      else pending.push(m);
    }
    pending.sort(sortByTitle);
    rated.sort(sortByTitle);
    return { pendingMovies: pending, ratedMovies: rated };
  }, [movies, searchQuery, myRatedIds]);

  const hasAnyMatch = pendingMovies.length > 0 || ratedMovies.length > 0;

  useEffect(() => {
    if (!user || !movieId) {
      setScore(7);
      setOpinion('');
      return;
    }
    const mine = ratings.find((r) => r.movieId === movieId && r.userId === user.uid);
    if (mine) {
      setScore(clampScoreToHalfSteps(mine.score));
      setOpinion(mine.opinion);
    } else {
      setScore(7);
      setOpinion('');
    }
  }, [movieId, user?.uid, ratings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !movieId) return;
    const name = displayName.trim();
    if (!name) {
      showToast('En Mi perfil poné tu nombre en la lista antes de puntuar', 'error');
      return;
    }
    setSaving(true);
    const scoreToSave = clampScoreToHalfSteps(score);
    try {
      await upsertRating({
        movieId,
        userId: user.uid,
        userEmail: user.email || '',
        userDisplayName: name,
        score: scoreToSave,
        opinion,
      });
      showToast('Valoración guardada', 'info');
      void refresh();
      navigate('/panel');
    } catch {
      showToast('Error al guardar', 'error');
    } finally {
      setSaving(false);
    }
  };

  const selected = movies.find((m) => m.id === movieId);
  const card = 'bg-surface border-line shadow-panel';
  const label = 'text-ink-muted ui-label text-xs';
  const input = 'border-line bg-surface-2 text-ink rounded-control';

  const listRowInactive = 'text-ink hover:bg-surface-2/80 border-line';

  const renderMovieRow = (m: Movie) => {
    const active = m.id === movieId;
    const myScore = myRatedIds.has(m.id)
      ? ratings.find((r) => r.movieId === m.id && r.userId === user?.uid)?.score
      : undefined;
    return (
      <li key={m.id}>
        <button
          type="button"
          role="option"
          aria-selected={active}
          onClick={() => setMovieId(m.id)}
          className={`w-full text-left px-3 py-3 sm:py-2.5 text-sm transition-colors border-l-4 ${
            active ? '' : `${listRowInactive} border-l-transparent`
          }`}
          style={
            active
              ? {
                  backgroundColor: hexToRgba(headerColor, theme === 'dark' ? 0.28 : 0.12),
                  borderLeftColor: headerColor,
                  borderLeftWidth: 4,
                  boxShadow: `inset 0 0 0 1px ${hexToRgba(headerColor, 0.28)}`,
                }
              : undefined
          }
        >
          <span className="font-medium">{m.title}</span>
          {m.year != null && !Number.isNaN(m.year) && (
            <span className={`ml-2 tabular-nums ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              ({m.year})
            </span>
          )}
          {myScore != null && (
            <span
              className="ml-2 tabular-nums font-semibold"
              style={{ color: scoreToDisplayColor(myScore, theme) }}
            >
              · {formatScoreDisplay(myScore)}
            </span>
          )}
        </button>
      </li>
    );
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center py-12">
        <span className="h-6 w-6 rounded-full border-2 border-line border-t-[var(--header-color)] animate-spin" />
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className={`max-w-lg mx-auto text-center py-12 rounded-xl border ${card} px-6`}>
        <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
          Primero añadí títulos en <strong>Por ver</strong> (película o serie).
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className={`text-xl sm:text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Puntuar y opinar
          </h2>
          <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Buscá el título (película o serie), tocá para elegirlo y después cargá nota y opinión.
          </p>
        </div>
        {refreshing && (
          <span
            className="mt-1 h-4 w-4 shrink-0 rounded-full border-2 border-line border-t-[var(--header-color)] animate-spin"
            aria-label="Actualizando"
          />
        )}
      </div>

      <form onSubmit={handleSubmit} className={`rounded-xl border p-4 sm:p-6 space-y-5 ${card}`}>
        <div className="space-y-2">
          <label htmlFor="movie-search" className={`block text-sm font-medium ${label}`}>
            Buscar y elegir (película o serie)
          </label>
          <div className="relative">
            <span
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
              aria-hidden
            >
              <IconSearch size={18} className="w-[18px] h-[18px]" />
            </span>
            <input
              id="movie-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full border rounded-lg pl-10 pr-3 py-2.5 focus:outline-none focus-ring-header ${input}`}
              placeholder="Buscar por título…"
              autoComplete="off"
            />
          </div>

          {!hasAnyMatch ? (
            <p
              className={`rounded-lg border px-3 py-4 text-sm text-center ${
                theme === 'dark' ? 'border-gray-600 text-gray-500' : 'border-gray-200 text-gray-500'
              }`}
            >
              No hay coincidencias por título. Probá otra búsqueda o borrá el texto.
            </p>
          ) : (
            <div className="space-y-3">
              <MoviePickSection
                title={`Por puntuar (${pendingMovies.length})`}
                emptyText="No te queda nada por puntuar."
                movies={pendingMovies}
                renderRow={renderMovieRow}
                theme={theme}
              />
              <MoviePickSection
                title={`Ya puntuadas (${ratedMovies.length})`}
                emptyText="Todavía no puntuaste ningún título."
                movies={ratedMovies}
                renderRow={renderMovieRow}
                theme={theme}
              />
            </div>
          )}

          {selected ? (
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
              Elegida:{' '}
              <span className="font-medium" style={{ color: headerColor }}>
                {selected.title}
              </span>
              {' · '}
              Añadida por {selected.createdByName.trim() || 'Sin nombre'}
              {myRatedIds.has(selected.id) ? ' · ya la puntuaste (podés editar)' : ''}
            </p>
          ) : (
            <p className={`text-xs ${theme === 'dark' ? 'text-amber-200/80' : 'text-amber-800'}`}>
              Elegí un título de la lista para poder puntuar.
            </p>
          )}
        </div>

        <div className={!movieId ? 'opacity-50 pointer-events-none' : ''}>
          <div className="flex justify-between items-baseline">
            <label className={`text-sm font-medium ${label}`}>Puntuación (1–10, medios puntos)</label>
            <span
              className="text-lg font-bold tabular-nums transition-colors duration-150"
              style={{ color: scoreToDisplayColor(score, theme) }}
            >
              {formatScoreDisplay(score)}
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            step={0.5}
            value={score}
            onChange={(e) => setScore(clampScoreToHalfSteps(Number(e.target.value)))}
            className="w-full mt-2"
            style={{ accentColor: scoreToDisplayColor(score, theme) }}
            disabled={!movieId}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>1</span>
            <span>10</span>
          </div>
          <p className="text-xs mt-0.5 text-gray-500">Deslizá de a medios puntos (1, 1.5, … 10).</p>
        </div>

        <div className={!movieId ? 'opacity-50 pointer-events-none' : ''}>
          <label className={`block text-sm font-medium mb-1 ${label}`}>Opinión</label>
          <textarea
            value={opinion}
            onChange={(e) => setOpinion(e.target.value)}
            rows={5}
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus-ring-header resize-y min-h-[120px] ${input}`}
            placeholder="Qué te pareció, sin spoilers o con spoilers avisando…"
            disabled={!movieId}
          />
        </div>

        <button
          type="submit"
          disabled={saving || !movieId}
          className="w-full py-2.5 rounded-lg btn-header-primary font-medium"
        >
          {saving ? 'Guardando…' : 'Guardar mi valoración'}
        </button>
      </form>
    </div>
  );
}
