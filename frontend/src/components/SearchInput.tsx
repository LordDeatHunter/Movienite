import type { Component } from "solid-js";
import { FiSearch } from "solid-icons/fi";

interface SearchInputProps {
  value: string;
  onInput: (value: string) => void;
}

export const SearchInput: Component<SearchInputProps> = (props) => (
  <div class="search-container">
    <div class="search-icon">
      <FiSearch size={24} />
    </div>
    <input
      type="text"
      class="search-input"
      placeholder="Search movies"
      value={props.value}
      onInput={(e) => props.onInput(e.currentTarget.value)}
    />
  </div>
);

export default SearchInput;
