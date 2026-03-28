export type Movie = {
  id: string;
  title: string;
  year: number | null;
  createdByUid: string;
  createdByEmail: string;
  /** Nombre visible en la lista (ej. Felipe, Naky); puede faltar en datos viejos */
  createdByName: string;
  /** Barrita izquierda en Por ver: color de quien añadió el título (película o serie) */
  listAccentColor: string;
  createdAt: string;
};

export type MovieRating = {
  id: string;
  movieId: string;
  userId: string;
  userEmail: string;
  /** Nombre en lista (Felipe, Naky); puede faltar en datos viejos */
  userDisplayName: string;
  /** 1–10 en enteros o medios puntos (1.5, 8.5, …) */
  score: number;
  opinion: string;
  updatedAt: string;
};
