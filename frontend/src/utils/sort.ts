import type { Movie } from "@/types";

export enum SortField {
  Date = "date",
  Title = "title",
  User = "user",
  Rating = "rating",
}

export const PAGE_SIZES = [5, 10, 20, 50];

type MovieComparator = (movie1: Movie, movie2: Movie) => number;

const getInsertDateOrDefault = (movie: Movie, defaultDate: number = 0) =>
  movie.inserted_at ? Date.parse(movie.inserted_at) : defaultDate;

const getTitleOrDefault = (movie: Movie, defaultTitle: string = "") =>
  movie.title || defaultTitle;

const getUserOrDefault = (movie: Movie, defaultUser: string = "") =>
  movie.user?.username || defaultUser;

const getRatingOrDefault = (movie: Movie, defaultRating: number = 0) => {
  if (!movie.rating) return defaultRating;
  const rating = parseFloat(movie.rating.replace("/10", ""));
  return isNaN(rating) ? defaultRating : rating;
};

export const compareByDate = (movie1: Movie, movie2: Movie) => {
  const date1 = getInsertDateOrDefault(movie1);
  const date2 = getInsertDateOrDefault(movie2);

  return date1 - date2;
};

export const compareByTitle = (movie1: Movie, movie2: Movie) => {
  const title1 = getTitleOrDefault(movie1).toLowerCase();
  const title2 = getTitleOrDefault(movie2).toLowerCase();

  return title1.localeCompare(title2);
};

export const compareByUser = (movie1: Movie, movie2: Movie) => {
  const user1 = getUserOrDefault(movie1).toLowerCase();
  const user2 = getUserOrDefault(movie2).toLowerCase();

  return user1.localeCompare(user2);
};

export const compareByRating = (movie1: Movie, movie2: Movie) => {
  const rating1 = getRatingOrDefault(movie1);
  const rating2 = getRatingOrDefault(movie2);

  return rating1 - rating2;
};

const compareFunctions: Record<SortField, MovieComparator> = {
  [SortField.Date]: compareByDate,
  [SortField.Title]: compareByTitle,
  [SortField.User]: compareByUser,
  [SortField.Rating]: compareByRating,
} as const;

export const makeComparator =
  (field: SortField, reverse: boolean) => (movie1: Movie, movie2: Movie) => {
    const res = compareFunctions[field](movie1, movie2);
    return reverse ? -res : res;
  };
