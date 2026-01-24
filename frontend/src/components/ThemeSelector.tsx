import { useTheme } from "@/hooks/useTheme";
import type { Component } from "solid-js";

export const ThemeSelector: Component = () => {
  const { theme, updateTheme } = useTheme();

  const handleChange = (e: Event) => {
    const value = (e.target as HTMLSelectElement).value;
    updateTheme(value);
  };

  return (
    <div class="theme-selector">
      <select
        id="theme-dropdown"
        class="theme-dropdown"
        aria-label="Theme selector"
        value={theme()}
        onChange={handleChange}
      >
        <option value="system">System Default</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </div>
  );
};
