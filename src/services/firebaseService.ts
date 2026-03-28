import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  setDoc,
  Timestamp,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Movie, MovieRating } from '../types';

// ============ USUARIOS PERMITIDOS (LISTA BLANCA) ============
export const isUserAllowed = async (userId: string, email: string): Promise<boolean> => {
  try {
    const userDoc = await getDoc(doc(db, 'allowedUsers', userId));
    if (userDoc.exists()) return true;

    const emailLower = email?.toLowerCase() || '';
    const emailQuery = query(collection(db, 'allowedUsers'), where('email', '==', emailLower));
    const emailSnapshot = await getDocs(emailQuery);
    return !emailSnapshot.empty;
  } catch (error) {
    console.error('Error al verificar usuario permitido:', error);
    return false;
  }
};

export const addAllowedUser = async (email: string, userId?: string): Promise<void> => {
  const allowedUserData: Record<string, unknown> = {
    email: email.toLowerCase(),
    addedAt: Timestamp.now(),
  };
  if (userId) {
    allowedUserData.userId = userId;
    await setDoc(doc(db, 'allowedUsers', userId), allowedUserData);
  } else {
    await addDoc(collection(db, 'allowedUsers'), allowedUserData);
  }
};

export const getAllowedUsers = async (): Promise<Array<{ id: string; email: string; userId?: string }>> => {
  const snapshot = await getDocs(collection(db, 'allowedUsers'));
  return snapshot.docs.map((d) => ({
    id: d.id,
    email: d.data().email,
    userId: d.data().userId,
  }));
};

export const removeAllowedUser = async (userIdOrEmail: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'allowedUsers', userIdOrEmail));
  } catch {
    const emailQuery = query(
      collection(db, 'allowedUsers'),
      where('email', '==', userIdOrEmail.toLowerCase())
    );
    const snapshot = await getDocs(emailQuery);
    snapshot.docs.forEach((d) => deleteDoc(d.ref));
  }
};

// ============ PELÍCULAS (COMPARTIDAS) ============
const FALLBACK_LIST_ACCENT = '#9ca3af';

function parseListAccentColor(raw: unknown): string {
  const s = String(raw ?? '').trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(s)) return s;
  return FALLBACK_LIST_ACCENT;
}

function movieFromDoc(
  id: string,
  data: Record<string, unknown>
): Movie {
  const createdAt = data.createdAt as Timestamp | undefined;
  return {
    id,
    title: String(data.title || ''),
    year: typeof data.year === 'number' ? data.year : null,
    createdByUid: String(data.createdByUid || ''),
    createdByEmail: String(data.createdByEmail || ''),
    createdByName: String(data.createdByName || '').trim(),
    listAccentColor: parseListAccentColor(data.listAccentColor),
    createdAt: createdAt?.toDate?.().toISOString() || '',
  };
}

export const getMovies = async (): Promise<Movie[]> => {
  const q = query(collection(db, 'movies'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => movieFromDoc(d.id, d.data()));
};

export const addMovie = async (
  movie: Pick<
    Movie,
    'title' | 'year' | 'createdByUid' | 'createdByEmail' | 'createdByName' | 'listAccentColor'
  >
): Promise<string> => {
  const accent = parseListAccentColor(movie.listAccentColor);
  const docRef = await addDoc(collection(db, 'movies'), {
    title: movie.title.trim(),
    year: movie.year,
    createdByUid: movie.createdByUid,
    createdByEmail: movie.createdByEmail,
    createdByName: movie.createdByName.trim(),
    listAccentColor: accent,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
};

export const updateMovieTitle = async (movieId: string, title: string): Promise<void> => {
  const t = title.trim();
  if (!t) throw new Error('El título no puede estar vacío');
  await updateDoc(doc(db, 'movies', movieId), { title: t });
};

const BATCH_DELETE_MAX = 450;

// ============ VALORACIONES ============
function ratingDocId(movieId: string, userId: string): string {
  return `${movieId}_${userId}`;
}

function ratingFromDoc(id: string, data: Record<string, unknown>): MovieRating {
  const updatedAt = data.updatedAt as Timestamp | undefined;
  return {
    id,
    movieId: String(data.movieId || ''),
    userId: String(data.userId || ''),
    userEmail: String(data.userEmail || ''),
    userDisplayName: String(data.userDisplayName || '').trim(),
    score: Number(data.score) || 0,
    opinion: String(data.opinion || ''),
    updatedAt: updatedAt?.toDate?.().toISOString() || '',
  };
}

export const getMyRating = async (movieId: string, userId: string): Promise<MovieRating | null> => {
  const ref = doc(db, 'movieRatings', ratingDocId(movieId, userId));
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return ratingFromDoc(snap.id, snap.data());
};

export const upsertRating = async (params: {
  movieId: string;
  userId: string;
  userEmail: string;
  userDisplayName: string;
  score: number;
  opinion: string;
}): Promise<void> => {
  const id = ratingDocId(params.movieId, params.userId);
  const score = Math.max(1, Math.min(10, Math.round(Number(params.score) * 2) / 2));
  await setDoc(
    doc(db, 'movieRatings', id),
    {
      movieId: params.movieId,
      userId: params.userId,
      userEmail: params.userEmail.toLowerCase(),
      userDisplayName: params.userDisplayName.trim(),
      score,
      opinion: params.opinion.trim(),
      updatedAt: Timestamp.now(),
    },
    { merge: true }
  );
};

/** Nombres en lista desde userSettings (para panel con valoraciones viejas sin userDisplayName) */
export const getDisplayNamesForUserIds = async (
  userIds: string[]
): Promise<Record<string, string>> => {
  const unique = [...new Set(userIds.filter(Boolean))];
  const out: Record<string, string> = {};
  await Promise.all(
    unique.map(async (uid) => {
      const s = await getUserSettings(uid);
      const n = s?.displayName?.trim();
      if (n) out[uid] = n;
    })
  );
  return out;
};

export const getAllRatings = async (): Promise<MovieRating[]> => {
  const snapshot = await getDocs(collection(db, 'movieRatings'));
  return snapshot.docs.map((d) => ratingFromDoc(d.id, d.data()));
};

/** IDs de títulos que este usuario ya puntuó (sigue en Firestore; solo filtra “Por ver”) */
export const getRatedMovieIdsForUser = async (userId: string): Promise<Set<string>> => {
  const q = query(collection(db, 'movieRatings'), where('userId', '==', userId));
  const snap = await getDocs(q);
  const ids = new Set<string>();
  snap.docs.forEach((d) => {
    const mid = d.data().movieId;
    if (mid != null) ids.add(String(mid));
  });
  return ids;
};

export const deleteMovie = async (movieId: string): Promise<void> => {
  const ratingsQ = query(collection(db, 'movieRatings'), where('movieId', '==', movieId));
  const ratingsSnap = await getDocs(ratingsQ);
  const refs = ratingsSnap.docs.map((d) => d.ref);
  for (let i = 0; i < refs.length; i += BATCH_DELETE_MAX) {
    const batch = writeBatch(db);
    refs.slice(i, i + BATCH_DELETE_MAX).forEach((r) => batch.delete(r));
    await batch.commit();
  }
  await deleteDoc(doc(db, 'movies', movieId));
};

// ============ CONFIGURACIÓN DE USUARIO ============
export interface UserSettings {
  theme?: 'dark' | 'light';
  headerColorDark?: string;
  headerColorLight?: string;
  headerTitle?: string;
  /** Cómo mostrarte al añadir en Por ver (ej. Felipe, Naky) */
  displayName?: string;
  /** Barrita de color en tarjetas de Por ver (#RRGGBB) */
  listAccentColor?: string;
}

export const getUserTheme = async (userId: string): Promise<'dark' | 'light' | null> => {
  try {
    const userSettingsSnap = await getDoc(doc(db, 'userSettings', userId));
    if (userSettingsSnap.exists()) {
      return userSettingsSnap.data().theme || null;
    }
    return null;
  } catch (error) {
    console.error('Error al obtener tema del usuario:', error);
    return null;
  }
};

export const saveUserTheme = async (userId: string, theme: 'dark' | 'light'): Promise<void> => {
  await setDoc(
    doc(db, 'userSettings', userId),
    { userId, theme, updatedAt: Timestamp.now() },
    { merge: true }
  );
};

export const getUserSettings = async (userId: string): Promise<UserSettings | null> => {
  try {
    const userSettingsSnap = await getDoc(doc(db, 'userSettings', userId));
    if (!userSettingsSnap.exists()) return null;
    const data = userSettingsSnap.data();
    return {
      theme: data.theme || null,
      headerColorDark: data.headerColorDark || null,
      headerColorLight: data.headerColorLight || null,
      headerTitle: data.headerTitle || null,
      displayName:
        data.displayName != null && String(data.displayName).trim()
          ? String(data.displayName).trim()
          : undefined,
      listAccentColor:
        data.listAccentColor != null && /^#[0-9A-Fa-f]{6}$/.test(String(data.listAccentColor).trim())
          ? String(data.listAccentColor).trim()
          : undefined,
    };
  } catch (error) {
    console.error('Error al obtener configuraciones del usuario:', error);
    return null;
  }
};

export const saveUserSettings = async (userId: string, settings: Partial<UserSettings>): Promise<void> => {
  await setDoc(
    doc(db, 'userSettings', userId),
    { userId, ...settings, updatedAt: Timestamp.now() },
    { merge: true }
  );
};
