import type { User } from "@/hooks/authStore";
import type { Movie } from "@/types";

const GENERIC_REQUEST_ERROR = "Something went wrong. Please try again.";

type FastApiValidationError = {
  msg?: unknown;
};

type ApiErrorBody = {
  error?: unknown;
  detail?: unknown;
  message?: unknown;
};

const asString = (value: unknown): string | null => {
  if (typeof value !== "string") return null;

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
};

const getErrorMessageFromBody = (body: ApiErrorBody): string | null => {
  const explicitError = asString(body.error);
  if (explicitError) return explicitError;

  const directDetail = asString(body.detail);
  if (directDetail) return directDetail;

  if (Array.isArray(body.detail)) {
    const validationMessages = body.detail
      .map((entry) => asString((entry as FastApiValidationError).msg))
      .filter((message): message is string => !!message);

    if (validationMessages.length > 0) {
      return validationMessages.join(" ");
    }
  }

  return asString(body.message);
};

const extractErrorMessage = async (
  response: Response,
  fallbackMessage: string,
): Promise<string> => {
  try {
    const body = (await response.json()) as ApiErrorBody;
    const message = getErrorMessageFromBody(body);
    if (message) {
      return message;
    }
  } catch {
    // Ignore non-JSON error bodies and use fallback below.
  }

  return fallbackMessage || GENERIC_REQUEST_ERROR;
};

const requestJson = async <T>(
  input: RequestInfo | URL,
  init: RequestInit,
  fallbackMessage: string,
): Promise<T> => {
  let response: Response;

  try {
    response = await fetch(input, init);
  } catch {
    throw new Error(GENERIC_REQUEST_ERROR);
  }

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response, fallbackMessage));
  }

  return (await response.json()) as T;
};

export const api = {
  // Auth endpoints
  async getLoginUrl() {
    return requestJson<{ url: string }>(
      `/api/login`,
      { method: "GET" },
      GENERIC_REQUEST_ERROR,
    );
  },

  async getUser() {
    return requestJson<User>(`/api/user`, { method: "GET" }, "Failed to get user");
  },

  async logout() {
    return requestJson(`/api/logout`, { method: "POST" }, "Failed to logout");
  },

  // Movie endpoints
  async getMovies(): Promise<Movie[]> {
    const data = await requestJson<{ movies?: Movie[] }>(
      `/api/movies`,
      { method: "GET" },
      "Failed to load movies",
    );
    return data.movies || [];
  },

  async addMovie(movieUrl: string) {
    return requestJson(
      `/api/movies`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movie_url: movieUrl }),
      },
      "Failed to add movie",
    );
  },

  async toggleWatch(movieId: string) {
    return requestJson(
      `/api/movies/${movieId}/toggle_watch`,
      { method: "POST" },
      "Failed to toggle watch status",
    );
  },

  async discardMovie(movieId: string) {
    return requestJson(
      `/api/movies/${movieId}/discard`,
      { method: "POST" },
      "Failed to discard movie",
    );
  },

  async toggleBoobies(movieId: string) {
    return requestJson(
      `/api/movies/${movieId}/toggle_boobies`,
      { method: "POST" },
      "Failed to toggle boobies",
    );
  },
};
