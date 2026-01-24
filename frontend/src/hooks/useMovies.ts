import { createSignal, onMount } from "solid-js";
import { api } from "@/utils/api";
import type { Movie } from "@/types";

export const useMovies = () => {
  const [movies, setMovies] = createSignal<Movie[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);

  const fetchMovies = async () => {
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
  };

  onMount(() => {
    void fetchMovies();
  });

  return {
    movies,
    loading,
    error,
    refetch: fetchMovies,
  };
};
