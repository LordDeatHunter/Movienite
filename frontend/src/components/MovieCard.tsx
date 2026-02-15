import { Component, createSignal, Show } from "solid-js";
import { api } from "@/utils/api";
import { MovieRating } from "@/components/MovieRating";
import authStore from "@/hooks/authStore";
import { FiEye, FiEyeOff, FiTrash } from "solid-icons/fi";
import { TbOutlineRating18Plus } from "solid-icons/tb";
import type { Movie } from "@/types";

interface MovieCardProps {
  movie: Movie;
  viewType?: "list" | "grid";
  onAction?: () => void;
}

const MovieCard: Component<MovieCardProps> = (props) => {
  const [actionLoading, setActionLoading] = createSignal(false);

  const handleWatchToggle = async () => {
    setActionLoading(true);
    try {
      await api.toggleWatch(props.movie.id);
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

  const isWatched = () => props.movie.watched;

  const canToggleWatch = () => !!authStore.user && authStore.user.is_admin;

  const canDiscard = () => {
    if (!authStore.user) return false;
    if (authStore.user.is_admin) return true;

    return props.movie.user?.id === authStore.user.id && !props.movie.watched;
  };

  const canToggleBoobies = () => {
    if (!authStore.user) return false;
    if (authStore.user.is_admin) return true;

    return props.movie.user?.id === authStore.user.id && !props.movie.watched;
  };

  const boobiesLabel = (boobies: boolean) =>
    boobies ? "Has boobies!" : "No boobies...";

  return (
    <div
      class="movie-card"
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
        <div class="movie-icons">
          <div class="movie-actions">
            <Show when={canToggleWatch()}>
              <button
                class="movie-action-btn action-watch"
                title={isWatched() ? "Unwatch" : "Watch"}
                aria-label={isWatched() ? "Unwatch" : "Watch"}
                disabled={actionLoading()}
                onClick={handleWatchToggle}
              >
                {isWatched() ? <FiEyeOff /> : <FiEye />}
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
