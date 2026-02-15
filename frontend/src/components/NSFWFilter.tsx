import { Component, For } from "solid-js";
import { TbOutlineRating18Plus } from "solid-icons/tb";

export enum NSFWFilterValue {
  ALL = "all",
  NSFW = "nsfw",
  SFW = "sfw",
}

interface NSFWFilterProps {
  value: NSFWFilterValue;
  onInput: (value: NSFWFilterValue) => void;
}

export const NSFWFilter: Component<NSFWFilterProps> = (props) => {
  const options: { value: NSFWFilterValue; label: string }[] = [
    { value: NSFWFilterValue.ALL, label: "All movies" },
    { value: NSFWFilterValue.NSFW, label: "With boobies" },
    { value: NSFWFilterValue.SFW, label: "No boobies" },
  ];

  const handleChange = (e: Event) => {
    const target = e.target as HTMLSelectElement;
    props.onInput(target.value as NSFWFilterValue);
  };

  return (
    <div class="nsfw-filter">
      <label>
        <TbOutlineRating18Plus size={20} />
        <span>NSFW:</span>
      </label>
      <select
        id="nsfw-filter"
        value={props.value}
        onChange={handleChange}
        class="nsfw-filter-select"
      >
        <For each={options}>
          {(option) => <option value={option.value}>{option.label}</option>}
        </For>
      </select>
    </div>
  );
};
