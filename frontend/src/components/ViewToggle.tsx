import { GridIcon } from "@/components/icons/GridIcon";
import { ListIcon } from "@/components/icons/ListIcon";
import type { Accessor, Component } from "solid-js";

interface ViewToggleProps {
  viewType: Accessor<"list" | "grid">;
  onToggle: () => void;
}

export const ViewToggle: Component<ViewToggleProps> = (props) => (
  <button
    class="view-toggle-button"
    view-type={props.viewType()}
    onClick={props.onToggle}
    aria-label="Toggle view"
  >
    {props.viewType() === "grid" ? <ListIcon /> : <GridIcon />}
  </button>
);
