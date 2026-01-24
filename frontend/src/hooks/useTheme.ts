import { createSignal, createEffect, onMount } from "solid-js";
import { storage } from "@/utils/localStorage";
import { applyTheme } from "@/utils/theme";

export const useTheme = () => {
  const [theme, setTheme] = createSignal<string>(
    storage.get("theme", "system"),
  );

  // Apply theme to document when it changes
  createEffect(() => {
    applyTheme(theme());
  });

  // Listen for system theme changes
  onMount(() => {
    const systemThemeMedia = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (theme() === "system") {
        applyTheme("system");
      }
    };
    systemThemeMedia.addEventListener("change", handler);
    return () => systemThemeMedia.removeEventListener("change", handler);
  });

  const updateTheme = (newTheme: string) => {
    setTheme(newTheme);
    storage.set("theme", newTheme);
  };

  return { theme, updateTheme };
};
