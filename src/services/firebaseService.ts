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
    createdAt: createdAt?.toDate?.().toISOString() || '',
  };
}

export const getMovies = async (): Promise<Movie[]> => {
  const q = query(collection(db, 'movies'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => movieFromDoc(d.id, d.data()));
};

export const addMovie = async (
  movie: Pick<Movie, 'title' | 'year' | 'createdByUid' | 'createdByEmail'>
): Promise<string> => {
  const docRef = await addDoc(collection(db, 'movies'), {
    title: movie.title.trim(),
    year: movie.year,
    createdByUid: movie.createdByUid,
    createdByEmail: movie.createdByEmail,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
};

export const deleteMovie = async (movieId: string): Promise<void> => {
  const ratingsQ = query(collection(db, 'movieRatings'), where('movieId', '==', movieId));
  const ratingsSnap = await getDocs(ratingsQ);
  const batch = writeBatch(db);
  ratingsSnap.docs.forEach((d) => batch.delete(d.ref));
  batch.delete(doc(db, 'movies', movieId));
  await batch.commit();
};

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
  score: number;
  opinion: string;
}): Promise<void> => {
  const id = ratingDocId(params.movieId, params.userId);
  await setDoc(
    doc(db, 'movieRatings', id),
    {
      movieId: params.movieId,
      userId: params.userId,
      userEmail: params.userEmail.toLowerCase(),
      score: params.score,
      opinion: params.opinion.trim(),
      updatedAt: Timestamp.now(),
    },
    { merge: true }
  );
};

export const getAllRatings = async (): Promise<MovieRating[]> => {
  const snapshot = await getDocs(collection(db, 'movieRatings'));
  return snapshot.docs.map((d) => ratingFromDoc(d.id, d.data()));
};

// ============ CONFIGURACIÓN DE USUARIO ============
export interface UserSettings {
  theme?: 'dark' | 'light';
  headerColorDark?: string;
  headerColorLight?: string;
  headerTitle?: string;
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
