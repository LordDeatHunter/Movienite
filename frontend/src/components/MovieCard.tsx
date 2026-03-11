import { Component, createSignal, Show } from "solid-js";
import { api } from "@/utils/api";
import { MovieRating } from "@/components/MovieRating";
import authStore from "@/hooks/authStore";
import { FiCamera, FiEye, FiEyeOff, FiTrash } from "solid-icons/fi";
import { TbOutlineRating18Plus } from "solid-icons/tb";
import type { Movie } from "@/types";
import { MovieStatus } from "@/hooks/movieStore";

interface MovieCardProps {
  movie: Movie;
  viewType?: "list" | "grid";
  onAction?: () => void;
  isStreamed?: boolean;
}

const MovieCard: Component<MovieCardProps> = (props) => {
  const [actionLoading, setActionLoading] = createSignal(false);

  const movieIconsClass = () =>
    isUserAdmin() && props.viewType === "grid"
      ? "movie-icons-col"
      : "movie-icons";

  const handleSetStatus = async (targetStatus: MovieStatus) => {
    setActionLoading(true);
    try {
      await api.setMovieStatus(props.movie.id, targetStatus);
      props.onAction?.();
    } finally {
      setActionLoading(false);
    }
  };

  const handleDiscard = async () => {
    setActionLoading(true);
    try {
      await api.discardMovie(props.movie.id);
      props.onAction?.();
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleBoobies = async () => {
    setActionLoading(true);
    try {
      await api.toggleBoobies(props.movie.id);
      props.onAction?.();
    } finally {
      setActionLoading(false);
    }
  };

  const isUserAdmin = () => !!authStore.user && authStore.user.is_admin;

  const canSetMovieStatus = (targetMovieStatus: MovieStatus): boolean =>
    isUserAdmin() && props.movie.status !== targetMovieStatus;

  const canDiscard = () => {
    if (!authStore.user) return false;
    if (authStore.user.is_admin) return true;

    return (
      props.movie.user?.id === authStore.user.id &&
      props.movie.status !== MovieStatus.Watched
    );
  };

  const canToggleBoobies = () => {
    if (!authStore.user) return false;
    if (authStore.user.is_admin) return true;

    return (
      props.movie.user?.id === authStore.user.id &&
      props.movie.status !== MovieStatus.Watched
    );
  };

  const boobiesLabel = (boobies: boolean) =>
    boobies ? "Has boobies!" : "No boobies...";

  return (
    <div
      class={`movie-card ${props.isStreamed ? "streaming-card" : ""}`}
      classList={{
        "grid-card": props.viewType === "grid",
        "boobies-movie": props.movie.boobies,
      }}
    >
      <div class="movie-image-display">
        <Show when={props.movie.image_link}>
          <img
            src={props.movie.image_link}
            alt={`${props.movie.title} poster`}
            class="movie-image"
          />
        </Show>
      </div>
      <div class="movie-content">
        <h3>{props.movie.title}</h3>
        <Show when={props.movie.original_title?.trim()}>
          <h4 class="movie-original-title">
            Original title: {props.movie.original_title}
          </h4>
        </Show>
        <p>{props.movie.description}</p>
        <div class="movie-links">
          <Show when={props.movie.letterboxd_url}>
            <a href={props.movie.letterboxd_url} target="_blank">
              Letterboxd
            </a>
          </Show>
          <Show when={props.movie.imdb_url}>
            <a href={props.movie.imdb_url} target="_blank">
              IMDb
            </a>
          </Show>
        </div>
        <Show when={props.movie.user?.username}>
          <div class="movie-added-by">
            Added by {props.movie.user!.username}
          </div>
        </Show>
      </div>
      <Show
        when={props.movie.rating || props.movie.votes || props.movie.no_reviews}
      >
        <div class={movieIconsClass()}>
          <div class="movie-actions">
            <Show when={canSetMovieStatus(MovieStatus.Watched)}>
              <button
                class="movie-action-btn action-watch"
                title="Watch"
                aria-label="Watch"
                disabled={actionLoading()}
                onClick={() => handleSetStatus(MovieStatus.Watched)}
              >
                {<FiEye />}
              </button>
            </Show>

            <Show when={canSetMovieStatus(MovieStatus.Upcoming)}>
              <button
                class="movie-action-btn action-watch"
                title="Unwatch"
                aria-label="Unwatch"
                disabled={actionLoading()}
                onClick={() => handleSetStatus(MovieStatus.Upcoming)}
              >
                {<FiEyeOff />}
              </button>
            </Show>

            <Show when={canSetMovieStatus(MovieStatus.Streaming)}>
              <button
                class="movie-action-btn action-watch"
                title="Streaming"
                aria-label="Streaming"
                disabled={actionLoading()}
                onClick={() => handleSetStatus(MovieStatus.Streaming)}
              >
                {<FiCamera />}
              </button>
            </Show>

            <Show when={canToggleBoobies()}>
              <button
                class="movie-action-btn action-nsfw"
                title={boobiesLabel(!props.movie.boobies)}
                aria-label={boobiesLabel(props.movie.boobies)}
                disabled={actionLoading()}
                onClick={handleToggleBoobies}
              >
                <TbOutlineRating18Plus size={20} />
              </button>
            </Show>

            <Show when={canDiscard()}>
              <button
                class="movie-action-btn action-discard"
                title="Discard"
                aria-label="Discard"
                disabled={actionLoading()}
                onClick={handleDiscard}
              >
                <FiTrash size={24} />
              </button>
            </Show>
          </div>
          <div class="movie-rating">
            <MovieRating
              rating={props.movie.rating}
              votes={props.movie.votes}
              no_reviews={props.movie.no_reviews}
            />
          </div>
        </div>
      </Show>
    </div>
  );
};

export default MovieCard;
