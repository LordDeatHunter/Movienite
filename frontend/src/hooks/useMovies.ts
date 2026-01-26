import { createSignal } from "solid-js";
import { api } from "@/utils/api";
import type { Movie } from "@/types";

const [movies, setMovies] = createSignal<Movie[]>([]);
const [loading, setLoading] = createSignal(true);
const [error, setError] = createSignal<string | null>(null);

export const moviesApi = {
  async fetchMovies() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getMovies();
      setMovies(data);
    } catch (e: any) {
      setError(e.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  },
};

void moviesApi.fetchMovies();

export { movies, loading, error };
