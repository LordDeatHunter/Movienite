import { FaSolidSortAmountDownAlt, FaSolidSortAmountUp } from "solid-icons/fa";
import type { Component } from "solid-js";
import { PAGE_SIZES, type SortField } from "@/utils/sort";

interface SortControlsProps {
  field: SortField;
  onFieldChange: (f: SortField) => void;
  reverse: boolean;
  onReverseToggle: () => void;
  pageSize: string;
  onPageSizeChange: (f: number) => void;
}

const SortControls: Component<SortControlsProps> = (props) => {
  return (
    <div class="sort-controls">
      <label for="sort-field" class="sort-label">
        Sort
      </label>
      <select
        id="sort-field"
        class="sort-select"
        value={props.field}
        onInput={(e) =>
          props.onFieldChange(
            (e.target as HTMLSelectElement).value as SortField,
          )
        }
      >
        <option value="date">Date added</option>
        <option value="title">Title</option>
        <option value="user">User</option>
        <option value="rating">Rating</option>
      </select>

      <button
        class={`sort-reverse-btn ${props.reverse ? "active" : ""}`}
        onClick={props.onReverseToggle}
        aria-pressed={props.reverse}
        title={props.reverse ? "Reverse order" : "Normal order"}
      >
        {props.reverse ? <FaSolidSortAmountDownAlt /> : <FaSolidSortAmountUp />}
      </button>

      <select
        id="page-size"
        class="page-size-select"
        value={props.pageSize}
        onInput={(e) => props.onPageSizeChange(Number((e.target as HTMLSelectElement).value))}
      >
        <option value="0">All</option>
        {PAGE_SIZES.map(size => <option value={size}>{size}</option>)}
      </select>
    </div>
  );
};

export default SortControls;
