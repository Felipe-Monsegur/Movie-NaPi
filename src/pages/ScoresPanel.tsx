import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import ConfirmModal from '../components/ConfirmModal';
import EditMovieTitleModal from '../components/EditMovieTitleModal';
import { IconEditOutline, IconTrashOutline } from '../components/icons/PanelActionIcons';
import { scoreToBadgeStyle, scoreToDisplayColor } from '../utils/scoreColor';
import { formatScoreDisplay } from '../utils/scoreFormat';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { deleteMovie, getMovies, getAllRatings, getDisplayNamesForUserIds } from '../services/firebaseService';
import { Movie, MovieRating } from '../types';

function average(nums: number[]): number | null {
  if (!nums.length) return null;
  const s = nums.reduce((a, b) => a + b, 0);
  return Math.round((s / nums.length) * 10) / 10;
}

function raterLabel(r: MovieRating, nameByUid: Record<string, string>): string {
  return r.userDisplayName.trim() || nameByUid[r.userId]?.trim() || 'Sin nombre';
}

function ratingUpdatedMs(r: MovieRating): number {
  if (!r.updatedAt) return 0;
  const t = new Date(r.updatedAt).getTime();
  return Number.isFinite(t) ? t : 0;
}

/** Última vez que alguien guardó o editó una valoración en este título (película o serie) */
function lastRatingActivityMs(ratingsForMovie: MovieRating[]): number {
  if (!ratingsForMovie.length) return 0;
  return Math.max(...ratingsForMovie.map(ratingUpdatedMs));
}

function movieCreatedMs(m: Movie): number {
  if (!m.createdAt) return 0;
  const t = new Date(m.createdAt).getTime();
  return Number.isFinite(t) ? t : 0;
}

export default function ScoresPanel() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { showToast } = useToast();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [ratings, setRatings] = useState<MovieRating[]>([]);
  const [nameByUid, setNameByUid] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Movie | null>(null);
  const [editTarget, setEditTarget] = useState<Movie | null>(null);
  const [panelSearchQuery, setPanelSearchQuery] = useState('');

  const loadPanel = useCallback(async () => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }
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
  }, [showToast, user?.uid]);

  useEffect(() => {
    loadPanel();
  }, [loadPanel]);

  const byMovie = useMemo(() => {
    const map = new Map<string, MovieRating[]>();
    for (const row of ratings) {
      const list = map.get(row.movieId) || [];
      list.push(row);
      map.set(row.movieId, list);
    }
    return map;
  }, [ratings]);

  const moviesByRecentRating = useMemo(() => {
    return [...movies].sort((a, b) => {
      const ta = lastRatingActivityMs(byMovie.get(a.id) || []);
      const tb = lastRatingActivityMs(byMovie.get(b.id) || []);
      if (tb !== ta) return tb - ta;
      return movieCreatedMs(b) - movieCreatedMs(a);
    });
  }, [movies, byMovie]);

  const filteredPanelMovies = useMemo(() => {
    const q = panelSearchQuery.trim().toLowerCase();
    if (!q) return moviesByRecentRating;
    return moviesByRecentRating.filter((m) => m.title.toLowerCase().includes(q));
  }, [moviesByRecentRating, panelSearchQuery]);

  const card = theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const label = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';
  const input =
    theme === 'dark'
      ? 'border-gray-600 bg-gray-700 text-white'
      : 'border-gray-300 bg-white text-gray-800';
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
          Cuando tengan títulos en la lista (película o serie) y alguna valoración, aparecerá el resumen aquí.
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
          Hasta que <strong>vos</strong> no puntúes un título, la nota y la opinión de los demás y el promedio se muestran
          como <strong>?</strong> (vos siempre ves la tuya). Orden: más reciente valorado primero. Lápiz: editar nombre;
          papelera: borrar.
        </p>
        <div className="mt-4">
          <label htmlFor="panel-search" className={`block text-sm font-medium mb-1 ${label}`}>
            Buscar por título
          </label>
          <div className="relative max-w-md">
            <span
              className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}
              aria-hidden
            >
              🔍
            </span>
            <input
              id="panel-search"
              type="search"
              value={panelSearchQuery}
              onChange={(e) => setPanelSearchQuery(e.target.value)}
              placeholder="Filtrar películas y series…"
              autoComplete="off"
              className={`w-full border rounded-lg pl-10 pr-3 py-2.5 focus:outline-none focus-ring-header ${input}`}
            />
          </div>
        </div>
      </div>

      <EditMovieTitleModal
        movie={editTarget}
        onClose={() => setEditTarget(null)}
        onSaved={(movieId, newTitle) => {
          setMovies((prev) => prev.map((m) => (m.id === movieId ? { ...m, title: newTitle } : m)));
          showToast('Título actualizado', 'success');
        }}
      />

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          try {
            await deleteMovie(deleteTarget.id);
            setMovies((prev) => prev.filter((m) => m.id !== deleteTarget.id));
            setRatings((prev) => prev.filter((r) => r.movieId !== deleteTarget.id));
            showToast('Título eliminado', 'success');
          } catch {
            showToast('No se pudo eliminar', 'error');
          }
        }}
        title="¿Eliminar película o serie?"
        message={
          deleteTarget
            ? `Se va a borrar «${deleteTarget.title}» de la base de datos y todas las valoraciones asociadas. No se puede deshacer.`
            : ''
        }
        confirmText="Eliminar"
        cancelText="Cancelar"
      />

      <div className="space-y-4">
        {filteredPanelMovies.length === 0 && panelSearchQuery.trim() ? (
          <div className={`rounded-xl border p-8 text-center text-sm ${card} ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            No hay títulos que coincidan con la búsqueda. Probá otra palabra o borrá el filtro.
          </div>
        ) : null}
        {filteredPanelMovies.map((movie) => {
          const list = byMovie.get(movie.id) || [];
          const uid = user?.uid ?? '';
          const iRatedThis = uid !== '' && list.some((r) => r.userId === uid);
          const scores = list.map((x) => x.score);
          const avg = average(scores);
          const hideOthers = !iRatedThis && list.length > 0;
          const subtitle =
            movie.year != null && !Number.isNaN(movie.year) ? ` (${movie.year})` : '';

          return (
            <article key={movie.id} className={`rounded-xl border overflow-hidden ${card}`}>
              <div
                className={`px-4 py-3 border-b flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-2 ${
                  theme === 'dark' ? 'border-gray-700 bg-gray-800/80' : 'border-gray-100 bg-gray-50'
                }`}
              >
                <h3
                  className={`font-semibold text-lg min-w-0 break-words sm:flex-1 sm:min-w-[12rem] sm:pr-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {movie.title}
                  <span className={`font-normal text-base ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {subtitle}
                  </span>
                </h3>
                <div className="flex flex-row flex-wrap items-center gap-2 sm:gap-3 shrink-0 w-full sm:w-auto">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Promedio</span>
                    {hideOthers ? (
                      <span
                        className={`text-xl font-bold tabular-nums px-2 py-0.5 rounded-lg ${
                          theme === 'dark' ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'
                        }`}
                        title="Puntuá este título para ver el promedio"
                        aria-label="Promedio oculto hasta que puntúes"
                      >
                        ?
                      </span>
                    ) : (
                      <span
                        className={`text-xl font-bold tabular-nums px-2 py-0.5 rounded-lg ${
                          avg == null
                            ? theme === 'dark'
                              ? 'bg-gray-700 text-gray-500'
                              : 'bg-gray-200 text-gray-500'
                            : ''
                        }`}
                        style={avg != null ? scoreToBadgeStyle(avg, theme) : undefined}
                      >
                        {avg != null ? formatScoreDisplay(avg) : '—'}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0" role="group" aria-label="Acciones del título">
                    <button
                      type="button"
                      aria-label="Editar título"
                      title="Editar título"
                      onClick={() => setEditTarget(movie)}
                      className="btn-panel-edit p-2 rounded-lg outline-none"
                    >
                      <IconEditOutline />
                    </button>
                    <button
                      type="button"
                      aria-label="Eliminar título y valoraciones"
                      title="Eliminar"
                      onClick={() => setDeleteTarget(movie)}
                      className={`p-2 rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                        theme === 'dark'
                          ? 'text-red-400 hover:bg-red-500/15 focus-visible:ring-red-400 focus-visible:ring-offset-gray-900'
                          : 'text-red-600 hover:bg-red-500/15 focus-visible:ring-red-500 focus-visible:ring-offset-white'
                      }`}
                    >
                      <IconTrashOutline />
                    </button>
                  </div>
                </div>
              </div>

              {list.length === 0 ? (
                <p className={`px-4 py-4 text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
                  Nadie puntuó todavía. Entrá en <strong>Puntuar</strong> para ser el primero.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  {hideOthers ? (
                    <p className={`px-4 py-2 text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                      Puntuá vos en <strong>Puntuar</strong> para ver notas, opiniones y promedio completos.
                    </p>
                  ) : null}
                  <table className="w-full min-w-0 table-fixed text-xs sm:text-sm">
                    <colgroup>
                      <col />
                      <col className="w-[3.25rem] sm:w-20" />
                      <col className="w-[40%] min-w-[7.5rem] sm:min-w-[10rem] sm:w-[42%]" />
                    </colgroup>
                    <thead>
                      <tr className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                        <th className={`px-2 py-2 sm:px-4 font-medium text-left min-w-0 ${th}`}>Quién</th>
                        <th className={`px-2 py-2 sm:px-4 font-medium text-right ${th}`}>Nota</th>
                        <th className={`px-2 py-2 sm:px-4 font-medium text-right ${th}`}>Opinión</th>
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
                        .map((r) => {
                          const isMine = uid !== '' && r.userId === uid;
                          const mask = !isMine && hideOthers;
                          return (
                            <tr
                              key={r.id}
                              className={`border-b last:border-0 ${
                                theme === 'dark' ? 'border-gray-700' : 'border-gray-100'
                              }`}
                            >
                              <td className={`px-2 py-2.5 sm:px-4 sm:py-3 align-top font-medium min-w-0 break-words ${td}`}>
                                {raterLabel(r, nameByUid)}
                              </td>
                              <td
                                className={`px-2 py-2.5 sm:px-4 sm:py-3 align-top text-right font-semibold tabular-nums ${
                                  mask ? (theme === 'dark' ? 'text-gray-400' : 'text-gray-500') : ''
                                }`}
                                style={!mask ? { color: scoreToDisplayColor(r.score, theme) } : undefined}
                                aria-label={mask ? 'Nota oculta hasta que puntúes' : undefined}
                              >
                                {mask ? '?' : formatScoreDisplay(r.score)}
                              </td>
                              <td
                                className={`px-2 py-2.5 sm:px-4 sm:py-3 align-top text-right whitespace-pre-wrap break-words font-medium ${
                                  mask ? (theme === 'dark' ? 'text-gray-400' : 'text-gray-500') : td
                                }`}
                                aria-label={mask ? 'Opinión oculta hasta que puntúes' : undefined}
                              >
                                {mask ? (
                                  '?'
                                ) : r.opinion ? (
                                  r.opinion
                                ) : (
                                  <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}>(sin texto)</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
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
