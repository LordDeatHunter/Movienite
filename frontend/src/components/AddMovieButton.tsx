import type { Component } from "solid-js";
import { FiPlus } from "solid-icons/fi";

interface AddMovieButtonProps {
  onClick: () => void;
}

export const AddMovieButton: Component<AddMovieButtonProps> = (props) => (
  <button
    class="add-movie-button"
    onClick={() => props.onClick()}
    aria-label="Add Movie"
    title="Add Movie"
  >
    <FiPlus />
  </button>
);
