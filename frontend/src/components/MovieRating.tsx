import { getStarIconPathBasedOnRating } from "@/utils/rating";
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

  const getIconPath = () => {
    const rating = props.rating ? Number(props.rating.split("/")[0]) : 0;
    return getStarIconPathBasedOnRating(rating);
  };

  return (
    <Show when={props.rating || props.votes || props.no_reviews}>
      <div class="rating-star">
        <img src={getIconPath()} alt="Star" />
      </div>
      <div class="rating-value">{formattedRating()}</div>
      <div class="rating-votes">{props.votes || props.no_reviews || ""}</div>
    </Show>
  );
};
