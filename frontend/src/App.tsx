import { createMemo, createSignal, Show } from "solid-js";
import MovieSection from "@/components/MovieSection";
import Login from "@/components/Login";
import { Header } from "@/components/Header";
import { CategoryButtons } from "@/components/CategoryButtons";
import { ViewToggle } from "@/components/ViewToggle";
import { AddMovieButton } from "@/components/AddMovieButton";
import { AddMovieModal } from "@/components/AddMovieModal";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { authApi, loading as authLoading, user } from "@/hooks/useAuth";
import {
  error as moviesError,
  loading as moviesLoading,
  movies,
  moviesApi,
} from "@/hooks/useMovies";

const App = () => {
  const { login, logout } = authApi;
  const [showWatched, setShowWatched] = createSignal(true);
  const [showUpcoming, setShowUpcoming] = createSignal(true);
  const [viewType, setViewType] = useLocalStorage<"list" | "grid">(
    "view-type",
    "list",
  );
  const [modalOpen, setModalOpen] = createSignal(false);

  // Computed movie lists
  const watchedMovies = createMemo(() =>
    movies().filter((m) => m.watched === "yes"),
  );
  const upcomingMovies = createMemo(() =>
    movies().filter((m) => m.watched !== "yes"),
  );

  // Handlers
  const handleWatchedToggle = () => setShowWatched((v) => !v);
  const handleUpcomingToggle = () => setShowUpcoming((v) => !v);
  const handleViewToggle = () => {
    setViewType(viewType() === "grid" ? "list" : "grid");
  };
  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  return (
    <>
      <Header />
      <main>
        <Login
          user={user()}
          loading={authLoading()}
          onLogin={login}
          onLogout={logout}
        />

        <div class="categories">
          <CategoryButtons
            showWatched={showWatched}
            showUpcoming={showUpcoming}
            onWatchedToggle={handleWatchedToggle}
            onUpcomingToggle={handleUpcomingToggle}
          />
          <ViewToggle viewType={viewType} onToggle={handleViewToggle} />
        </div>

        <Show when={moviesLoading()}>
          <p class="empty-message">Loading movies...</p>
        </Show>

        <Show when={moviesError()}>
          <p class="empty-message">{moviesError()}</p>
        </Show>

        <Show when={!moviesLoading() && !moviesError()}>
          <Show when={showWatched()}>
            <MovieSection
              title="Watched"
              movies={watchedMovies}
              viewType={viewType()}
              onAction={moviesApi.fetchMovies}
            />
          </Show>
          <Show when={showUpcoming()}>
            <MovieSection
              title="Upcoming"
              movies={upcomingMovies}
              viewType={viewType()}
              onAction={moviesApi.fetchMovies}
            />
          </Show>
        </Show>

        <Show when={!!user()}>
          <AddMovieButton onClick={openModal} />
          <AddMovieModal
            isOpen={modalOpen()}
            onClose={closeModal}
            onMovieAdded={moviesApi.fetchMovies}
          />
        </Show>
      </main>
    </>
  );
};

export default App;
