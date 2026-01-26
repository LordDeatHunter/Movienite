import { Component, createSignal, Show } from "solid-js";
import { api } from "@/utils/api";
import { WatchIcon } from "@/components/icons/WatchIcon";
import { UnwatchIcon } from "@/components/icons/UnwatchIcon";
import { DiscardIcon } from "@/components/icons/DiscardIcon";
import { MovieRating } from "@/components/MovieRating";
import type { Movie } from "@/types";
import { user } from "@/hooks/useAuth";

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

  const isWatched = () => props.movie.watched === "yes";

  const canToggleWatch = () => {
    const u = user();
    return !!u && u.is_admin;
  };

  const canDiscard = () => {
    const u = user();
    if (!u) return false;
    if (u.is_admin) return true;

    return props.movie.user?.id === u.id && props.movie.watched !== "yes";
  };

  return (
    <div
      class="movie-card"
      classList={{ "grid-card": props.viewType === "grid" }}
    >
      <Show when={props.movie.image_link}>
        <img
          src={props.movie.image_link}
          alt={`${props.movie.title} poster`}
          class="movie-image"
        />
      </Show>
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
        <div class="movie-rating">
          <div class="movie-actions">
            <Show when={canToggleWatch()}>
              <button
                class="movie-action-btn action-watch"
                title={isWatched() ? "Unwatch" : "Watch"}
                aria-label={isWatched() ? "Unwatch" : "Watch"}
                disabled={actionLoading()}
                onClick={handleWatchToggle}
              >
                {isWatched() ? <UnwatchIcon /> : <WatchIcon />}
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
                <DiscardIcon />
              </button>
            </Show>
          </div>
          <MovieRating
            rating={props.movie.rating}
            votes={props.movie.votes}
            no_reviews={props.movie.no_reviews}
          />
        </div>
      </Show>
    </div>
  );
};

export default MovieCard;
