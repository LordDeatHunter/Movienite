import type { Accessor, Component } from "solid-js";

interface CategoryButtonsProps {
  showWatched: Accessor<boolean>;
  showUpcoming: Accessor<boolean>;
  onWatchedToggle: () => void;
  onUpcomingToggle: () => void;
}

export const CategoryButtons: Component<CategoryButtonsProps> = (props) => (
  <>
    <button
      class={`category-button${props.showWatched() ? " active" : ""}`}
      onClick={props.onWatchedToggle}
    >
      Watched
    </button>
    <button
      class={`category-button${props.showUpcoming() ? " active" : ""}`}
      onClick={props.onUpcomingToggle}
    >
      Upcoming
    </button>
  </>
);
