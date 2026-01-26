import { Accessor, type Component, For, Show } from "solid-js";
import MovieCard from "@/components/MovieCard";
import type { Movie } from "@/types";

interface MovieSectionProps {
  title: string;
  movies: Accessor<Movie[]>;
  viewType?: "list" | "grid";
  onAction?: () => void;
}

const MovieSection: Component<MovieSectionProps> = (props) => {
  const gridClass = () =>
    `movie-list${props.viewType === "grid" ? " movie-grid" : ""}`;

  return (
    <section class="movie-section">
      <h2 class="section-heading">
        {props.title} {`(${props.movies().length})`}
      </h2>
      <div class={gridClass()}>
        <Show
          when={props.movies().length > 0}
          fallback={
            <p class="empty-message">No {props.title.toLowerCase()} movies.</p>
          }
        >
          <For each={props.movies()}>
            {(movie) => (
              <MovieCard
                movie={movie}
                viewType={props.viewType}
                onAction={props.onAction}
              />
            )}
          </For>
        </Show>
      </div>
    </section>
  );
};

export default MovieSection;
