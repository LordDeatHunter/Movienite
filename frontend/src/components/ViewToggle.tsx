import { FiGrid, FiList } from "solid-icons/fi";
import type { Accessor, Component } from "solid-js";

interface ViewToggleProps {
  viewType: Accessor<"list" | "grid">;
  onToggle: () => void;
}

export const ViewToggle: Component<ViewToggleProps> = (props) => (
  <button
    class="view-toggle-button"
    view-type={props.viewType()}
    onClick={() => props.onToggle()}
    aria-label="Toggle view"
  >
    {props.viewType() === "grid" ? <FiList size={24} /> : <FiGrid size={24} />}
  </button>
);
