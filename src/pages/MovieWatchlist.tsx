import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { getMovies, addMovie, deleteMovie, getRatedMovieIdsForUser } from '../services/firebaseService';
import { Movie } from '../types';
import ConfirmModal from '../components/ConfirmModal';

export default function MovieWatchlist() {
  const { user } = useAuth();
  const { theme, displayName, listAccentColor } = useTheme();
  const { showToast } = useToast();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [movieToDelete, setMovieToDelete] = useState<Movie | null>(null);
  const [totalInDb, setTotalInDb] = useState(0);

  const load = async () => {
    if (!user) {
      setMovies([]);
      setTotalInDb(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const all = await getMovies();
      const ratedIds = await getRatedMovieIdsForUser(user.uid);
      setTotalInDb(all.length);
      setMovies(all.filter((m) => !ratedIds.has(m.id)));
    } catch {
      showToast('No se pudo cargar la lista', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [user?.uid]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim()) return;
    const name = displayName.trim();
    if (!name) {
      showToast('En Mi perfil poné tu nombre en la lista (ej. Felipe o Naky)', 'error');
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
      await load();
    } catch {
      showToast('Error al guardar', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!movieToDelete) return;
    const id = movieToDelete.id;
    try {
      await deleteMovie(id);
      showToast('Listo, la sacamos de la lista', 'info');
      await load();
    } catch {
      showToast('No se pudo eliminar', 'error');
    }
  };

  const card = theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const label = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';
  const input =
    theme === 'dark'
      ? 'border-gray-600 bg-gray-700 text-white'
      : 'border-gray-300 bg-white text-gray-800';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className={`text-xl sm:text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Película/Serie · Por ver
        </h2>
        <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Solo ves las que <strong>vos</strong> todavía no puntuaste; la otra persona puede seguir viéndolas en su lista.
          Los títulos siguen en la app: podés editar tu nota en <strong>Puntuar</strong>. Nombre y color de barrita:{' '}
          <strong>Mi perfil</strong>.
        </p>
      </div>

      <form
        onSubmit={handleAdd}
        className={`rounded-xl border p-4 sm:p-5 space-y-3 ${card}`}
      >
        <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Añadir película o serie
        </h3>
        <div>
          <label className={`block text-sm font-medium mb-1 ${label}`}>Título</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
              className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus-ring-header ${input}`}
            placeholder="Ej. Parasite, The Bear…"
            required
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="w-full sm:w-auto px-5 py-2 rounded-lg btn-header-primary font-medium"
        >
          {saving ? 'Guardando…' : 'Añadir a la lista'}
        </button>
      </form>

      <div className={`rounded-xl border ${card} overflow-hidden p-2 sm:p-3`}>
        {loading ? (
          <div className={`p-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Cargando…
          </div>
        ) : movies.length === 0 ? (
          <div className={`p-8 text-center space-y-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {totalInDb === 0 ? (
              <p>Todavía no hay nada en la lista. Añadí la primera película o serie arriba.</p>
            ) : (
              <>
                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                  Ya puntuaste todo lo que había en tu lista por ver.
                </p>
                <p className="text-sm">
                  Seguís pudiendo cambiar una nota u opinión en <strong>Puntuar</strong> (ahí aparecen todas).
                </p>
              </>
            )}
          </div>
        ) : (
          <ul className="space-y-2">
            {movies.map((m) => (
              <li
                key={m.id}
                className={`flex overflow-hidden rounded-xl border ${
                  theme === 'dark'
                    ? 'border-gray-700 bg-gray-800/70 hover:bg-gray-800'
                    : 'border-gray-200 bg-white shadow-sm hover:bg-gray-50/80'
                } transition-colors`}
              >
                <div
                  className="w-1.5 sm:w-2 shrink-0 self-stretch min-h-[4.5rem] sm:min-h-[3.25rem]"
                  style={{ backgroundColor: m.listAccentColor }}
                  aria-hidden
                />
                <div className="flex flex-1 flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-3 py-3 sm:pl-4">
                  <div className="min-w-0">
                    <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {m.title}
                    </span>
                    <div className={`text-xs mt-0.5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                      Añadida por {m.createdByName.trim() || 'Sin nombre'}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Link
                      to={`/puntuar?pelicula=${m.id}`}
                      className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-sm btn-header-primary font-medium"
                    >
                      Puntuar
                    </Link>
                    <button
                      type="button"
                      onClick={() => setMovieToDelete(m)}
                      className={`px-3 py-1.5 rounded-lg text-sm ${
                        theme === 'dark'
                          ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                          : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                      }`}
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
