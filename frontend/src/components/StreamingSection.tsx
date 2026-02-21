import { Accessor, type Component, For, Show } from "solid-js";
import MovieCard from "@/components/MovieCard";
import type { Movie } from "@/types";

interface StreamingSectionProps {
  movies: Accessor<Movie[]>;
  viewType?: "list" | "grid";
  onAction?: () => void;
}

const StreamingSection: Component<StreamingSectionProps> = (props) => {
  const gridClass = () =>
    `movie-list${props.viewType === "grid" ? " streaming-grid" : ""}`;

  return (
    <section class="movie-section">
      <h2 class="section-heading">Currently streaming</h2>
      <div class={gridClass()}>
        <Show
          when={props.movies().length > 0}
          fallback={
            <p class="empty-message">Not streaming any movies currently.</p>
          }
        >
          <For each={props.movies()}>
            {(movie) => (
              <MovieCard
                movie={movie}
                viewType={props.viewType}
                onAction={props.onAction}
                isStreamed={true}
              />
            )}
          </For>
        </Show>
      </div>
    </section>
  );
};

export default StreamingSection;
