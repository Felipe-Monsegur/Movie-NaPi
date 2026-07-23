import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from './AuthContext';
import { getAllRatings, getMovies } from '../services/firebaseService';
import type { Movie, MovieRating } from '../types';

type MoviesDataContextType = {
  movies: Movie[];
  ratings: MovieRating[];
  myRatedIds: Set<string>;
  /** Primera carga sin datos en memoria */
  initialLoading: boolean;
  /** Refetch en segundo plano (no tapa la UI) */
  refreshing: boolean;
  refresh: () => Promise<void>;
};

const MoviesDataContext = createContext<MoviesDataContextType>({
  movies: [],
  ratings: [],
  myRatedIds: new Set(),
  initialLoading: true,
  refreshing: false,
  refresh: async () => {},
});

export const useMoviesData = () => useContext(MoviesDataContext);

export function MoviesDataProvider({ children }: { children: ReactNode }) {
  const { user, isAllowed } = useAuth();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [ratings, setRatings] = useState<MovieRating[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const loadedOnceRef = useRef(false);

  const refresh = useCallback(async () => {
    if (!user?.uid || !isAllowed) {
      setMovies([]);
      setRatings([]);
      setInitialLoading(false);
      setRefreshing(false);
      loadedOnceRef.current = false;
      return;
    }

    const first = !loadedOnceRef.current;
    if (first) setInitialLoading(true);
    else setRefreshing(true);

    try {
      const [m, r] = await Promise.all([getMovies(), getAllRatings()]);
      setMovies(m);
      setRatings(r);
      loadedOnceRef.current = true;
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
    }
  }, [user?.uid, isAllowed]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const myRatedIds = useMemo(() => {
    const ids = new Set<string>();
    const uid = user?.uid;
    if (!uid) return ids;
    for (const r of ratings) {
      if (r.userId === uid && r.movieId) ids.add(r.movieId);
    }
    return ids;
  }, [ratings, user?.uid]);

  return (
    <MoviesDataContext.Provider
      value={{
        movies,
        ratings,
        myRatedIds,
        initialLoading,
        refreshing,
        refresh,
      }}
    >
      {children}
    </MoviesDataContext.Provider>
  );
}
