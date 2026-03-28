export type Movie = {
  id: string;
  title: string;
  year: number | null;
  createdByUid: string;
  createdByEmail: string;
  createdAt: string;
};

export type MovieRating = {
  id: string;
  movieId: string;
  userId: string;
  userEmail: string;
  score: number;
  opinion: string;
  updatedAt: string;
};
