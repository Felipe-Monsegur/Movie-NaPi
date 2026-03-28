import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { getMovies, addMovie, deleteMovie } from '../services/firebaseService';
import { Movie } from '../types';

export default function MovieWatchlist() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { showToast } = useToast();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [year, setYear] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setMovies(await getMovies());
    } catch {
      showToast('No se pudo cargar la lista', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim()) return;
    setSaving(true);
    try {
      await addMovie({
        title: title.trim(),
        year: year.trim() ? parseInt(year, 10) : null,
        createdByUid: user.uid,
        createdByEmail: user.email || '',
      });
      setTitle('');
      setYear('');
      showToast('Película añadida', 'info');
      await load();
    } catch {
      showToast('Error al guardar', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (m: Movie) => {
    if (!confirm(`¿Quitar "${m.title}" de la lista?`)) return;
    try {
      await deleteMovie(m.id);
      showToast('Película eliminada', 'info');
      await load();
    } catch {
      showToast('Error al eliminar', 'error');
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
          Películas por ver
        </h2>
        <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Lista compartida: lo que añade uno lo ve el otro.
        </p>
      </div>

      <form
        onSubmit={handleAdd}
        className={`rounded-xl border p-4 sm:p-5 space-y-3 ${card}`}
      >
        <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Añadir película
        </h3>
        <div className="grid sm:grid-cols-[1fr_auto] gap-3">
          <div>
            <label className={`block text-sm font-medium mb-1 ${label}`}>Título</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 ${input}`}
              placeholder="Ej. Parasite"
              required
            />
          </div>
          <div className="sm:w-28">
            <label className={`block text-sm font-medium mb-1 ${label}`}>Año</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 ${input}`}
              placeholder="2019"
              min={1888}
              max={2100}
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="w-full sm:w-auto px-5 py-2 rounded-lg bg-violet-600 text-white font-medium hover:bg-violet-700 disabled:opacity-50"
        >
          {saving ? 'Guardando…' : 'Añadir a la lista'}
        </button>
      </form>

      <div className={`rounded-xl border ${card} overflow-hidden`}>
        {loading ? (
          <div className={`p-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Cargando…
          </div>
        ) : movies.length === 0 ? (
          <div className={`p-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Todavía no hay películas. Añade la primera arriba.
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {movies.map((m) => (
              <li
                key={m.id}
                className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 py-3 ${
                  theme === 'dark' ? 'hover:bg-gray-700/40' : 'hover:bg-gray-50'
                }`}
              >
                <div>
                  <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {m.title}
                  </span>
                  {m.year != null && !Number.isNaN(m.year) && (
                    <span className={`ml-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      ({m.year})
                    </span>
                  )}
                  <div className={`text-xs mt-0.5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                    Añadida por {m.createdByEmail || 'alguien'}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Link
                    to={`/puntuar?pelicula=${m.id}`}
                    className="px-3 py-1.5 rounded-lg text-sm bg-violet-600/90 text-white hover:bg-violet-600"
                  >
                    Puntuar
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(m)}
                    className={`px-3 py-1.5 rounded-lg text-sm ${
                      theme === 'dark'
                        ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                  >
                    Quitar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
