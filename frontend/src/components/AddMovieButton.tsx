import type { Component } from "solid-js";

interface AddMovieButtonProps {
  onClick: () => void;
}

export const AddMovieButton: Component<AddMovieButtonProps> = (props) => (
  <button class="add-movie-button" onClick={props.onClick}>
    Add Movie
  </button>
);
