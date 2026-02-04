import { Accessor, type Component, For, Show } from "solid-js";
import MovieCard from "@/components/MovieCard";
import type { Movie } from "@/types";
import { usePagination } from "@/hooks/usePagination";
import PaginationControls from "./PaginationControls";

interface MovieSectionProps {
  title: string;
  movies: Accessor<Movie[]>;
  viewType?: "list" | "grid";
  onAction?: () => void;
  itemsPerPage?: Accessor<number>;
}

const MovieSection: Component<MovieSectionProps> = (props) => {
  const itemsPerPage = () => props.itemsPerPage ?? 0;

  const {
    paginatedItems,
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    previousPage,
  } = usePagination<Movie>(props.movies, itemsPerPage());

  const gridClass = () =>
    `movie-list${props.viewType === "grid" ? " movie-grid" : ""}`;

  return (
    <section class="movie-section">
      <h2 class="section-heading">
        {props.title} {`(${props.movies().length})`}
      </h2>
      {totalPages() > 1 && (
        <PaginationControls
          currentPage={currentPage()}
          totalPages={totalPages()}
          onGoToPage={(page) => goToPage(page)}
          onNext={nextPage}
          onPrevious={previousPage}
        />
      )}
      <div class={gridClass()}>
        <Show
          when={props.movies().length > 0}
          fallback={
            <p class="empty-message">No {props.title.toLowerCase()} movies.</p>
          }
        >
          <For each={paginatedItems()}>
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
