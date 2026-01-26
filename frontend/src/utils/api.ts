import type { User } from "@/hooks/authStore";
import type { Movie } from "@/types";

export const api = {
  // Auth endpoints
  async getLoginUrl() {
    const response = await fetch(`/api/login`);
    if (!response.ok) {
      throw new Error("Failed to get login URL");
    }
    return response.json();
  },

  async getUser() {
    const response = await fetch(`/api/user`);
    if (!response.ok) {
      throw new Error("Failed to get user");
    }
    return (await response.json()) as User;
  },

  async logout() {
    const response = await fetch(`/api/logout`, {
      method: "POST",
    });
    if (!response.ok) {
      throw new Error("Failed to logout");
    }
    return response.json();
  },

  // Movie endpoints
  async getMovies(): Promise<Movie[]> {
    const response = await fetch(`/api/movies`);
    if (!response.ok) {
      throw new Error(`Failed to load movies: ${response.status}`);
    }
    const data = await response.json();
    return data.movies || [];
  },

  async addMovie(movieUrl: string) {
    const response = await fetch(`/api/movies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ movie_url: movieUrl }),
    });
    if (!response.ok) {
      throw new Error("Failed to add movie");
    }
    return response.json();
  },

  async toggleWatch(movieId: string) {
    const response = await fetch(`/api/movies/${movieId}/toggle_watch`, {
      method: "POST",
    });
    if (!response.ok) {
      throw new Error("Failed to toggle watch status");
    }
    return response.json();
  },

  async discardMovie(movieId: string) {
    const response = await fetch(`/api/movies/${movieId}/discard`, {
      method: "POST",
    });
    if (!response.ok) {
      throw new Error("Failed to discard movie");
    }
    return response.json();
  },
};
