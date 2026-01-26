import { createSignal, Show } from "solid-js";
import MovieSection from "@/components/MovieSection";
import Login from "@/components/Login";
import { Header } from "@/components/Header";
import { CategoryButtons } from "@/components/CategoryButtons";
import { ViewToggle } from "@/components/ViewToggle";
import { AddMovieButton } from "@/components/AddMovieButton";
import { AddMovieModal } from "@/components/AddMovieModal";
import { useMovies } from "@/hooks/useMovies";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useAuth } from "@/hooks/useAuth";

const App = () => {
  const { user, loading: authLoading, login, logout } = useAuth();
  const { movies, loading, error, refetch } = useMovies();
  const [showWatched, setShowWatched] = createSignal(true);
  const [showUpcoming, setShowUpcoming] = createSignal(true);
  const [viewType, setViewType] = useLocalStorage<"list" | "grid">(
    "view-type",
    "list",
  );
  const [modalOpen, setModalOpen] = createSignal(false);

  // Computed movie lists
  const watchedMovies = () => movies().filter((m) => m.watched === "yes");
  const upcomingMovies = () => movies().filter((m) => m.watched !== "yes");

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

        <Show when={loading()}>
          <p class="empty-message">Loading movies...</p>
        </Show>

        <Show when={error()}>
          <p class="empty-message">{error()}</p>
        </Show>

        <Show when={!loading() && !error()}>
          <Show when={showWatched()}>
            <MovieSection
              title="Watched"
              movies={watchedMovies()}
              viewType={viewType()}
              onAction={refetch}
            />
          </Show>
          <Show when={showUpcoming()}>
            <MovieSection
              title="Upcoming"
              movies={upcomingMovies()}
              viewType={viewType()}
              onAction={refetch}
            />
          </Show>
        </Show>

        <Show when={!!user()}>
          <AddMovieButton onClick={openModal} />
          <AddMovieModal
            isOpen={modalOpen()}
            onClose={closeModal}
            onMovieAdded={refetch}
          />
        </Show>
      </main>
    </>
  );
};

export default App;
