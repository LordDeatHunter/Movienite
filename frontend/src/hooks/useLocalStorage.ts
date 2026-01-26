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

  const updateWithPrevious = (updater: (prev: T) => T) => {
    setValue((prev) => {
      const newValue = updater(prev);
      storage.set(key, newValue);
      return newValue;
    });
  };

  return { value, setValue: updateValue, updateWithPrevious };
};
