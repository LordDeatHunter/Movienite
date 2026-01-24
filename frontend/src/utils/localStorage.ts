export const storage = {
  get<T>(key: string, defaultValue: T): T {
    if (typeof window === "undefined") return defaultValue;
    const value = localStorage.getItem(key);
    return (value as T) || defaultValue;
  },

  set(key: string, value: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, value);
    }
  },

  remove(key: string): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(key);
    }
  },
};
