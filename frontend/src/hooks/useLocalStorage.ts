import { createSignal } from "solid-js";
import { storage } from "@/utils/localStorage";

export const useLocalStorage = <T extends string>(
  key: string,
  defaultValue: T,
) => {
  const [value, setValue] = createSignal<T>(storage.get(key, defaultValue));

  const updateValue = (newValue: T) => {
    setValue(() => newValue);
    storage.set(key, newValue);
  };

  return [value, updateValue] as const;
};
