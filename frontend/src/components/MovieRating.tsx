import { StarIcon } from "@/components/icons/StarIcon";
import { type Component, Show } from "solid-js";

interface MovieRatingProps {
  rating?: string;
  votes?: string;
  no_reviews?: string;
}

export const MovieRating: Component<MovieRatingProps> = (props) => {
  const formattedRating = () => {
    if (!props.rating) return "—/10";
    return props.rating.includes("/") ? props.rating : `${props.rating}/10`;
  };

  return (
    <Show when={props.rating || props.votes || props.no_reviews}>
      <div class="movie-rating">
        <div class="rating-star">
          <StarIcon />
        </div>
        <div class="rating-value">{formattedRating()}</div>
        <div class="rating-votes">{props.votes || props.no_reviews || ""}</div>
      </div>
    </Show>
  );
};
