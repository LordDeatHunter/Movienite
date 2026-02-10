import { createStore } from "solid-js/store";
import { api } from "@/utils/api";
import { createEffect } from "solid-js";

export interface User {
  id: string;
  username: string;
  avatar_url?: string;
  email: string;
  discord_id?: string;
  created_at: string;
  is_admin: boolean;
}

interface AuthStore {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const [authStore, setAuthStore] = createStore<AuthStore>({
  user: null,
  loading: false,
  error: null,
});

const setUser = (user: User | null) => setAuthStore("user", user);
const setLoading = (loading: boolean) => setAuthStore("loading", loading);
const setError = (error: string | null) => setAuthStore("error", error);

export const fetchUser = async () => {
  if (authStore.loading) return;

  setLoading(true);
  setError(null);
  let userData: User | null = null;

  try {
    userData = await api.getUser();
    setUser(userData);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    setError(err.message || "Failed to load user information");
    setUser(null);
  } finally {
    setLoading(false);
  }
};

export const login = async () => {
  try {
    const { url } = await api.getLoginUrl();
    window.location.href = url;
  } catch (err) {
    console.error("Failed to get login URL:", err);
    setError("Failed to initiate login");
  }
};

export const logout = async () => {
  await api.logout();
  setUser(null);
};

createEffect(() => {
  void fetchUser();
});

export default authStore;
