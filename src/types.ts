export type Movie = {
  id: string;
  title: string;
  year: number | null;
  createdByUid: string;
  createdByEmail: string;
  /** Nombre visible en la lista (ej. Felipe, Naky); puede faltar en datos viejos */
  createdByName: string;
  createdAt: string;
};

export type MovieRating = {
  id: string;
  movieId: string;
  userId: string;
  userEmail: string;
  /** Nombre en lista (Felipe, Naky); puede faltar en datos viejos */
  userDisplayName: string;
  score: number;
  opinion: string;
  updatedAt: string;
};
