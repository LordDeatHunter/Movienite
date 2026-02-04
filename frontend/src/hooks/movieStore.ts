import { createStore } from "solid-js/store";
import { api } from "@/utils/api";
import type { Movie } from "@/types";

interface MovieStore {
  movies: Movie[];
  loading: boolean;
  error: string | null;
}

const [movieStore, setMovieStore] = createStore<MovieStore>({
  movies: [],
  loading: false,
  error: null,
});
export const setMovies = (movies: Movie[]) => setMovieStore("movies", movies);
export const setLoading = (loading: boolean) =>
  setMovieStore("loading", loading);
export const setError = (error: string | null) => setMovieStore("error", error);

export const fetchMovies = async () => {
  if (movieStore.loading) return;

  setLoading(true);
  setError(null);
  let data = [] as Movie[];

  try {
    data = await api.getMovies();
    setMovies(data);
    return data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    setError(err.message || "Unknown error");
  } finally {
    setLoading(false);
  }
  return data;
};

void fetchMovies();

export default movieStore;
