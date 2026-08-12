import type { Accessor, Component } from "solid-js";

export type MovieTab = "watched" | "upcoming";

interface CategoryButtonsProps {
  activeTab: Accessor<MovieTab>;
  onTabChange: (tab: MovieTab) => void;
}

export const CategoryButtons: Component<CategoryButtonsProps> = (props) => (
  <>
    <button
      class={`category-button${props.activeTab() === "upcoming" ? " active" : ""}`}
      onClick={() => props.onTabChange("upcoming")}
    >
      Upcoming
    </button>
    <button
      class={`category-button${props.activeTab() === "watched" ? " active" : ""}`}
      onClick={() => props.onTabChange("watched")}
    >
      Watched
    </button>
  </>
);
