import { createStore } from "solid-js/store";
import { api } from "@/utils/api";
import { showErrorAlert } from "@/hooks/errorAlertStore";

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
    const message = err.message || "Failed to load user information";
    setError(message);
    if (message !== "Not authenticated") {
      showErrorAlert(message);
    }
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
    const message = err instanceof Error ? err.message : "Failed to initiate login";
    setError(message);
    showErrorAlert(message);
  }
};

export const logout = async () => {
  try {
    await api.logout();
    setUser(null);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to logout";
    setError(message);
    showErrorAlert(message);
  }
};

void fetchUser();

export default authStore;
