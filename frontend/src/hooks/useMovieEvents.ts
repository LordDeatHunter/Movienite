import { onCleanup } from "solid-js";
import { fetchMovies } from "@/hooks/movieStore";

/**
 * Connects to the backend SSE endpoint and refetches movies
 * whenever a movie_update event is received.
 *
 * Automatically reconnects on connection loss (the browser's
 * built-in EventSource handles this).
 */
export function useMovieEvents() {
  const eventSource = new EventSource("/api/events");

  eventSource.addEventListener("movie_update", () => {
    void fetchMovies();
  });

  eventSource.addEventListener("error", () => {
    console.warn("[SSE] Connection lost — will auto-reconnect.");
  });

  onCleanup(() => {
    eventSource.close();
  });
}
