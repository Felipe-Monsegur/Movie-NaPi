import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { useMoviesData } from '../context/MoviesDataContext';
import { addMovie, deleteMovie } from '../services/firebaseService';
import { Movie } from '../types';
import ConfirmModal from '../components/ConfirmModal';
import { IconSearch } from '../components/icons/AppIcons';

function normTitle(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

export default function MovieWatchlist() {
  const { user } = useAuth();
  const { displayName, listAccentColor } = useTheme();
  const { showToast } = useToast();
  const { movies: allMovies, myRatedIds: ratedIds, initialLoading, refreshing, refresh } =
    useMoviesData();
  const [title, setTitle] = useState('');
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [movieToDelete, setMovieToDelete] = useState<Movie | null>(null);

  const pendingMovies = useMemo(
    () => allMovies.filter((m) => !ratedIds.has(m.id)),
    [allMovies, ratedIds]
  );

  const searchQ = search.trim().toLowerCase();

  const filteredPending = useMemo(() => {
    if (!searchQ) return pendingMovies;
    return pendingMovies.filter((m) => m.title.toLowerCase().includes(searchQ));
  }, [pendingMovies, searchQ]);

  const searchHitsAll = useMemo(() => {
    if (!searchQ) return [] as Movie[];
    return allMovies.filter((m) => m.title.toLowerCase().includes(searchQ));
  }, [allMovies, searchQ]);

  const alreadyRatedHits = useMemo(
    () => searchHitsAll.filter((m) => ratedIds.has(m.id)),
    [searchHitsAll, ratedIds]
  );

  const draftNorm = normTitle(title);
  const duplicateOf = useMemo(() => {
    if (!draftNorm) return null;
    return allMovies.find((m) => normTitle(m.title) === draftNorm) || null;
  }, [allMovies, draftNorm]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim()) return;
    const name = displayName.trim();
    if (!name) {
      showToast('En Mi perfil poné tu nombre en la lista (ej. Felipe o Naky)', 'error');
      return;
    }
    if (duplicateOf) {
      showToast(
        ratedIds.has(duplicateOf.id)
          ? `«${duplicateOf.title}» ya está en la app (ya la puntuaste). Buscala en Puntuar o Lista.`
          : `«${duplicateOf.title}» ya está en Por ver.`,
        'warning'
      );
      return;
    }
    setSaving(true);
    try {
      await addMovie({
        title: title.trim(),
        year: null,
        createdByUid: user.uid,
        createdByEmail: user.email || '',
        createdByName: name,
        listAccentColor,
      });
      setTitle('');
      showToast('Título añadido', 'info');
      await refresh();
    } catch {
      showToast('Error al guardar', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!movieToDelete) return;
    try {
      await deleteMovie(movieToDelete.id);
      showToast('Listo, la sacamos de la lista', 'info');
      await refresh();
    } catch {
      showToast('No se pudo eliminar', 'error');
    }
  };

  const card = 'bg-surface border-line shadow-panel';
  const label = 'text-ink-muted ui-label text-xs';
  const input = 'border-line bg-surface-2 text-ink rounded-control';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-ink">
            Película/Serie · Por ver
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            Solo ves las que <strong className="text-ink">vos</strong> todavía no puntuaste. Usá el
            buscador para chequear si ya la añadieron.
          </p>
        </div>
        {refreshing && (
          <span
            className="mt-1 h-4 w-4 shrink-0 rounded-full border-2 border-line border-t-[var(--header-color)] animate-spin"
            aria-label="Actualizando"
          />
        )}
      </div>

      <form onSubmit={handleAdd} className={`rounded-panel border p-4 sm:p-5 space-y-3 ${card}`}>
        <h3 className="font-semibold text-ink">Añadir película o serie</h3>
        <div>
          <label className={`block mb-1.5 ${label}`}>Título</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`w-full border px-3 py-2.5 focus:outline-none focus-ring-header ${input}`}
            placeholder="Ej. Parasite, The Bear…"
            required
          />
          {duplicateOf && (
            <p className="mt-1.5 text-xs text-amber-500">
              {ratedIds.has(duplicateOf.id)
                ? `Ya está en la app (la puntuaste). Revisá Puntuar o Lista.`
                : `Ya está en Por ver (añadida por ${duplicateOf.createdByName.trim() || 'Sin nombre'}).`}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={saving || !!duplicateOf}
          className="w-full sm:w-auto px-5 py-2 rounded-control btn-header-primary font-medium"
        >
          {saving ? 'Guardando…' : 'Añadir a la lista'}
        </button>
      </form>

      <div className={`rounded-panel border p-3 sm:p-4 space-y-3 ${card}`}>
        <div>
          <label htmlFor="porver-search" className={`block mb-1.5 ${label}`}>
            Buscar en la lista
          </label>
          <div className="relative">
            <span
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
              aria-hidden
            >
              <IconSearch size={18} className="w-[18px] h-[18px]" />
            </span>
            <input
              id="porver-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="¿Ya la añadimos? Escribí el título…"
              autoComplete="off"
              className={`w-full border pl-10 pr-3 py-2.5 focus:outline-none focus-ring-header ${input}`}
            />
          </div>
        </div>

        {searchQ && alreadyRatedHits.length > 0 && (
          <div className="rounded-control border border-line bg-surface-2/50 px-3 py-2.5 text-xs text-ink-muted space-y-1">
            <p className="font-semibold text-ink">Ya puntuaste (no aparecen en Por ver):</p>
            <ul className="space-y-0.5">
              {alreadyRatedHits.map((m) => (
                <li key={m.id}>
                  <Link
                    to={`/puntuar?pelicula=${m.id}`}
                    className="underline underline-offset-2 hover:text-ink"
                  >
                    {m.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {initialLoading ? (
          <div className="flex justify-center py-10">
            <span className="h-6 w-6 rounded-full border-2 border-line border-t-[var(--header-color)] animate-spin" />
          </div>
        ) : pendingMovies.length === 0 ? (
          <div className="p-6 text-center space-y-2 text-ink-muted text-sm">
            {allMovies.length === 0 ? (
              <p>Todavía no hay nada en la lista. Añadí la primera película o serie arriba.</p>
            ) : (
              <>
                <p className="text-ink">Ya puntuaste todo lo que había en tu lista por ver.</p>
                <p>
                  Podés cambiar una nota en <strong>Puntuar</strong> o ver promedios en{' '}
                  <strong>Lista</strong>.
                </p>
              </>
            )}
          </div>
        ) : filteredPending.length === 0 ? (
          <div className="p-6 text-center text-sm text-ink-muted">
            {searchHitsAll.length === 0
              ? 'No hay coincidencias. Si no está, podés añadirla arriba.'
              : 'No hay pendientes con ese nombre (puede que ya la hayas puntuado; mirá arriba).'}
          </div>
        ) : (
          <ul className="space-y-2">
            {filteredPending.map((m) => (
              <li
                key={m.id}
                className="flex overflow-hidden rounded-panel border border-line bg-surface/90 hover:bg-surface-2 transition-colors"
              >
                <div
                  className="w-1.5 sm:w-2 shrink-0 self-stretch min-h-[4.5rem] sm:min-h-[3.25rem]"
                  style={{ backgroundColor: m.listAccentColor }}
                  aria-hidden
                />
                <div className="flex flex-1 flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-3 py-3 sm:pl-4">
                  <div className="min-w-0">
                    <span className="font-medium text-ink">{m.title}</span>
                    <div className="text-xs mt-0.5 text-ink-muted">
                      Añadida por {m.createdByName.trim() || 'Sin nombre'}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Link
                      to={`/puntuar?pelicula=${m.id}`}
                      className="inline-flex items-center justify-center px-3 py-1.5 rounded-control text-sm btn-header-primary font-medium"
                    >
                      Puntuar
                    </Link>
                    <button
                      type="button"
                      onClick={() => setMovieToDelete(m)}
                      className="px-3 py-1.5 rounded-control text-sm bg-surface-2 text-ink hover:bg-surface-3 border border-line"
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ConfirmModal
        isOpen={!!movieToDelete}
        onClose={() => setMovieToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="¿Sacar esta película o serie?"
        message={
          movieToDelete
            ? `Vas a quitar «${movieToDelete.title}» de la lista compartida. Si había puntuaciones u opiniones, también se borran.`
            : ''
        }
        confirmText="Sí, quitar"
        cancelText="Mejor no"
        type="danger"
      />
    </div>
  );
}
