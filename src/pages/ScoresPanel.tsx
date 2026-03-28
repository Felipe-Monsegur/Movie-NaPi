import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { getMovies, getAllRatings, getDisplayNamesForUserIds } from '../services/firebaseService';
import { Movie, MovieRating } from '../types';

function average(nums: number[]): number | null {
  if (!nums.length) return null;
  const s = nums.reduce((a, b) => a + b, 0);
  return Math.round((s / nums.length) * 10) / 10;
}

function raterLabel(r: MovieRating, nameByUid: Record<string, string>): string {
  return r.userDisplayName.trim() || nameByUid[r.userId]?.trim() || 'Sin nombre';
}

export default function ScoresPanel() {
  const { theme } = useTheme();
  const { showToast } = useToast();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [ratings, setRatings] = useState<MovieRating[]>([]);
  const [nameByUid, setNameByUid] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const [m, r] = await Promise.all([getMovies(), getAllRatings()]);
        const uids = [...new Set(r.map((x) => x.userId).filter(Boolean))];
        const names = await getDisplayNamesForUserIds(uids);
        setMovies(m);
        setRatings(r);
        setNameByUid(names);
      } catch {
        showToast('No se pudo cargar el panel', 'error');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const byMovie = useMemo(() => {
    const map = new Map<string, MovieRating[]>();
    for (const row of ratings) {
      const list = map.get(row.movieId) || [];
      list.push(row);
      map.set(row.movieId, list);
    }
    return map;
  }, [ratings]);

  const card = theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const th = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';
  const td = theme === 'dark' ? 'text-gray-200' : 'text-gray-800';

  if (loading) {
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
          Cuando tengan películas en la lista y alguna valoración, aparecerá el resumen aquí.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className={`text-xl sm:text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Panel de puntuaciones
        </h2>
        <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Nota de cada uno, opinión y promedio por película. En la columna «Quién» se usa el nombre de perfil (Felipe, Naky…), no el email.
        </p>
      </div>

      <div className="space-y-4">
        {movies.map((movie) => {
          const list = byMovie.get(movie.id) || [];
          const scores = list.map((x) => x.score);
          const avg = average(scores);
          const subtitle =
            movie.year != null && !Number.isNaN(movie.year) ? ` (${movie.year})` : '';

          return (
            <article key={movie.id} className={`rounded-xl border overflow-hidden ${card}`}>
              <div
                className={`px-4 py-3 border-b flex flex-wrap items-baseline justify-between gap-2 ${
                  theme === 'dark' ? 'border-gray-700 bg-gray-800/80' : 'border-gray-100 bg-gray-50'
                }`}
              >
                <h3 className={`font-semibold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {movie.title}
                  <span className={`font-normal text-base ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {subtitle}
                  </span>
                </h3>
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Promedio</span>
                  <span
                    className={`text-xl font-bold tabular-nums px-2 py-0.5 rounded-lg ${
                      avg == null
                        ? theme === 'dark'
                          ? 'bg-gray-700 text-gray-500'
                          : 'bg-gray-200 text-gray-500'
                        : 'bg-violet-600/20 text-violet-700 dark:text-violet-300'
                    }`}
                  >
                    {avg != null ? avg : '—'}
                  </span>
                </div>
              </div>

              {list.length === 0 ? (
                <p className={`px-4 py-4 text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
                  Nadie puntuó todavía. Entrá en <strong>Puntuar</strong> para ser el primero.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className={`text-left border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                        <th className={`px-4 py-2 font-medium ${th}`}>Quién</th>
                        <th className={`px-4 py-2 font-medium w-24 ${th}`}>Nota</th>
                        <th className={`px-4 py-2 font-medium ${th}`}>Opinión</th>
                      </tr>
                    </thead>
                    <tbody>
                      {list
                        .slice()
                        .sort((a, b) =>
                          raterLabel(a, nameByUid).localeCompare(raterLabel(b, nameByUid), 'es', {
                            sensitivity: 'base',
                          })
                        )
                        .map((r) => (
                          <tr
                            key={r.id}
                            className={`border-b last:border-0 ${
                              theme === 'dark' ? 'border-gray-700' : 'border-gray-100'
                            }`}
                          >
                            <td className={`px-4 py-3 align-top font-medium ${td}`}>
                              {raterLabel(r, nameByUid)}
                            </td>
                            <td className={`px-4 py-3 align-top font-semibold tabular-nums ${td}`}>{r.score}</td>
                            <td className={`px-4 py-3 align-top whitespace-pre-wrap ${td}`}>
                              {r.opinion || (
                                <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}>(sin texto)</span>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
