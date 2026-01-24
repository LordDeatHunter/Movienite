import { type Component, For, Show } from "solid-js";
import MovieCard from "@/components/MovieCard";
import type { Movie } from "@/types";

interface MovieSectionProps {
  title: string;
  movies: Movie[];
  viewType?: "list" | "grid";
  onAction?: () => void;
}

const MovieSection: Component<MovieSectionProps> = (props) => {
  const gridClass = () =>
    `movie-list${props.viewType === "grid" ? " movie-grid" : ""}`;

  return (
    <section class="movie-section">
      <h2>{props.title}</h2>
      <div class={gridClass()}>
        <Show
          when={props.movies.length > 0}
          fallback={
            <p class="empty-message">No {props.title.toLowerCase()} movies.</p>
          }
        >
          <For each={props.movies}>
            {(movie) => <MovieCard movie={movie} onAction={props.onAction} />}
          </For>
        </Show>
      </div>
    </section>
  );
};

export default MovieSection;
