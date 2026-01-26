import { createSignal } from "solid-js";
import { api } from "@/utils/api";

export interface User {
  id: string;
  username: string;
  avatar_url?: string;
  email: string;
  discord_id?: string;
  created_at: string;
  is_admin: boolean;
}

const [user, setUser] = createSignal<User | null>(null);
const [loading, setLoading] = createSignal(false);
const [error, setError] = createSignal<string | null>(null);

export const authApi = {
  async fetchUser() {
    if (loading()) return;

    setLoading(true);

    try {
      const userData = await api.getUser();
      setUser(userData);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch user:", err);
      setError("Failed to load user information");
      setUser(null);
    } finally {
      setLoading(false);
    }
  },

  async login() {
    try {
      const { url } = await api.getLoginUrl();
      window.location.href = url;
    } catch (err) {
      console.error("Failed to get login URL:", err);
      setError("Failed to initiate login");
    }
  },

  async logout() {
    await api.logout();
    setUser(null);
  },
};

void authApi.fetchUser();

export { user, loading, error };
