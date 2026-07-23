import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMoviesData } from '../context/MoviesDataContext';
import { Movie, MovieRating } from '../types';
import { scoreToDisplayColor } from '../utils/scoreColor';
import { formatScoreDisplay } from '../utils/scoreFormat';
import { IconSearch } from '../components/icons/AppIcons';
import { useTheme } from '../context/ThemeContext';

type SortKey =
  | 'avg-desc'
  | 'avg-asc'
  | 'title-asc'
  | 'title-desc'
  | 'recent'
  | 'ratings-desc';

function average(nums: number[]): number | null {
  if (!nums.length) return null;
  const s = nums.reduce((a, b) => a + b, 0);
  return Math.round((s / nums.length) * 10) / 10;
}

function ratingUpdatedMs(r: MovieRating): number {
  if (!r.updatedAt) return 0;
  const t = new Date(r.updatedAt).getTime();
  return Number.isFinite(t) ? t : 0;
}

function lastRatingActivityMs(ratings: MovieRating[]): number {
  if (!ratings.length) return 0;
  return Math.max(...ratings.map(ratingUpdatedMs));
}

type WatchedRow = {
  movie: Movie;
  ratings: MovieRating[];
  avg: number;
  count: number;
  lastMs: number;
};

export default function WatchedList() {
  const { theme } = useTheme();
  const { movies, ratings, initialLoading, refreshing } = useMoviesData();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('avg-desc');

  const byMovie = useMemo(() => {
    const map = new Map<string, MovieRating[]>();
    for (const row of ratings) {
      const list = map.get(row.movieId) || [];
      list.push(row);
      map.set(row.movieId, list);
    }
    return map;
  }, [ratings]);

  const watchedRows = useMemo((): WatchedRow[] => {
    const rows: WatchedRow[] = [];
    for (const movie of movies) {
      const list = byMovie.get(movie.id) || [];
      if (!list.length) continue;
      const avg = average(list.map((x) => x.score));
      if (avg == null) continue;
      rows.push({
        movie,
        ratings: list,
        avg,
        count: list.length,
        lastMs: lastRatingActivityMs(list),
      });
    }
    return rows;
  }, [movies, byMovie]);

  const filteredSorted = useMemo(() => {
    const q = search.trim().toLowerCase();
    let rows = watchedRows;
    if (q) {
      rows = rows.filter((r) => r.movie.title.toLowerCase().includes(q));
    }
    const sorted = [...rows];
    sorted.sort((a, b) => {
      switch (sort) {
        case 'avg-asc':
          if (a.avg !== b.avg) return a.avg - b.avg;
          return a.movie.title.localeCompare(b.movie.title, 'es', { sensitivity: 'base' });
        case 'title-asc':
          return a.movie.title.localeCompare(b.movie.title, 'es', { sensitivity: 'base' });
        case 'title-desc':
          return b.movie.title.localeCompare(a.movie.title, 'es', { sensitivity: 'base' });
        case 'recent':
          if (b.lastMs !== a.lastMs) return b.lastMs - a.lastMs;
          return b.avg - a.avg;
        case 'ratings-desc':
          if (b.count !== a.count) return b.count - a.count;
          return b.avg - a.avg;
        case 'avg-desc':
        default:
          if (b.avg !== a.avg) return b.avg - a.avg;
          return a.movie.title.localeCompare(b.movie.title, 'es', { sensitivity: 'base' });
      }
    });
    return sorted;
  }, [watchedRows, search, sort]);

  const card = 'bg-surface border-line shadow-panel';
  const input = 'border-line bg-surface-2 text-ink rounded-control';

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-ink">Lista</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Títulos que ya puntuaron (con promedio).
          </p>
        </div>
        {refreshing && (
          <span
            className="mt-1 h-4 w-4 shrink-0 rounded-full border-2 border-line border-t-[var(--header-color)] animate-spin"
            aria-label="Actualizando"
          />
        )}
      </div>

      <div className={`rounded-panel border p-3 sm:p-4 space-y-3 ${card}`}>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <div className="flex-1 min-w-0">
            <label htmlFor="lista-search" className="block text-xs text-ink-muted ui-label mb-1.5">
              Buscar
            </label>
            <div className="relative">
              <span
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
                aria-hidden
              >
                <IconSearch size={18} className="w-[18px] h-[18px]" />
              </span>
              <input
                id="lista-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filtrar por título…"
                autoComplete="off"
                className={`w-full border pl-10 pr-3 py-2.5 focus:outline-none focus-ring-header ${input}`}
              />
            </div>
          </div>
          <div className="sm:w-64 shrink-0">
            <label htmlFor="lista-sort" className="block text-xs text-ink-muted ui-label mb-1.5">
              Ordenar por
            </label>
            <div className="relative">
              <select
                id="lista-sort"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className={`w-full border pl-3 pr-10 py-2.5 appearance-none focus:outline-none focus-ring-header ${input}`}
              >
                <option value="avg-desc">Promedio · mayor a menor</option>
                <option value="avg-asc">Promedio · menor a mayor</option>
                <option value="title-asc">Título · A → Z</option>
                <option value="title-desc">Título · Z → A</option>
                <option value="recent">Más recientes</option>
                <option value="ratings-desc">Más valoraciones</option>
              </select>
              <span
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted"
                aria-hidden
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </div>
          </div>
        </div>

        <p className="text-xs text-ink-muted">
          {filteredSorted.length}{' '}
          {filteredSorted.length === 1 ? 'título' : 'títulos'}
          {watchedRows.length !== filteredSorted.length
            ? ` (de ${watchedRows.length})`
            : ''}
        </p>
      </div>

      {initialLoading ? (
        <div className="flex justify-center py-12">
          <span className="h-6 w-6 rounded-full border-2 border-line border-t-[var(--header-color)] animate-spin" />
        </div>
      ) : watchedRows.length === 0 ? (
        <div className={`rounded-panel border p-8 text-center text-sm ${card} text-ink-muted`}>
          Todavía no hay títulos puntuados. Cuando puntúen en{' '}
          <Link to="/puntuar" className="underline underline-offset-2 text-ink font-medium">
            Puntuar
          </Link>
          , aparecen acá.
        </div>
      ) : filteredSorted.length === 0 ? (
        <div className={`rounded-panel border p-8 text-center text-sm ${card} text-ink-muted`}>
          Ningún título coincide con la búsqueda.
        </div>
      ) : (
        <div className={`rounded-panel border overflow-hidden ${card}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line bg-surface-2/60">
                  <th className="text-left px-3 sm:px-4 py-2.5 text-ink-muted ui-label text-[0.65rem] font-bold">
                    #
                  </th>
                  <th className="text-left px-3 sm:px-4 py-2.5 text-ink-muted ui-label text-[0.65rem] font-bold">
                    Título
                  </th>
                  <th className="text-right px-3 sm:px-4 py-2.5 text-ink-muted ui-label text-[0.65rem] font-bold">
                    Promedio
                  </th>
                  <th className="text-right px-3 sm:px-4 py-2.5 text-ink-muted ui-label text-[0.65rem] font-bold hidden sm:table-cell">
                    Notas
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredSorted.map((row, i) => {
                  const year =
                    row.movie.year != null && !Number.isNaN(row.movie.year)
                      ? ` (${row.movie.year})`
                      : '';
                  return (
                    <tr
                      key={row.movie.id}
                      className="border-b border-line last:border-0 hover:bg-surface-2/40 transition-colors"
                    >
                      <td className="px-3 sm:px-4 py-3 text-ink-muted tabular-nums align-middle">
                        {i + 1}
                      </td>
                      <td className="px-3 sm:px-4 py-3 align-middle min-w-0">
                        <Link
                          to="/panel"
                          className="font-medium text-ink hover:underline underline-offset-2 break-words"
                          title="Ver en el panel"
                        >
                          {row.movie.title}
                          {year ? (
                            <span className="font-normal text-ink-muted">{year}</span>
                          ) : null}
                        </Link>
                      </td>
                      <td
                        className="px-3 sm:px-4 py-3 text-right font-bold tabular-nums align-middle text-base"
                        style={{ color: scoreToDisplayColor(row.avg, theme) }}
                      >
                        {formatScoreDisplay(row.avg)}
                      </td>
                      <td className="px-3 sm:px-4 py-3 text-right text-ink-muted tabular-nums align-middle hidden sm:table-cell">
                        {row.count}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
