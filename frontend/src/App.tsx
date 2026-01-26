import { createMemo, createSignal, Show } from "solid-js";
import MovieSection from "@/components/MovieSection";
import Login from "@/components/Login";
import { Header } from "@/components/Header";
import { CategoryButtons } from "@/components/CategoryButtons";
import { ViewToggle } from "@/components/ViewToggle";
import { AddMovieButton } from "@/components/AddMovieButton";
import { AddMovieModal } from "@/components/AddMovieModal";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import movieStore, { fetchMovies } from "@/hooks/movieStore";
import authStore, { login, logout } from "@/hooks/authStore";
import SortControls from "@/components/SortControls";
import { makeComparator, SortField } from "@/utils/sort";

const App = () => {
  const [showWatched, setShowWatched] = createSignal(true);
  const [showUpcoming, setShowUpcoming] = createSignal(true);
  const [modalOpen, setModalOpen] = createSignal(false);

  const { value: viewType, setValue: setViewType } = useLocalStorage<
    "list" | "grid"
  >("view-type", "list");

  const { value: sortField, setValue: setSortField } =
    useLocalStorage<SortField>("sort-field", SortField.Date);

  const { value: sortReverse, updateWithPrevious: toggleSortReverse } =
    useLocalStorage<"true" | "false">("sort-reverse", "true");

  const watchedMoviesRaw = createMemo(() =>
    movieStore.movies.filter((m) => m.watched === "yes"),
  );
  const upcomingMoviesRaw = createMemo(() =>
    movieStore.movies.filter((m) => m.watched !== "yes"),
  );

  const watchedMovies = createMemo(() => {
    const arr = [...watchedMoviesRaw()];
    const comparator = makeComparator(sortField(), sortReverse() === "true");
    arr.sort(comparator);
    return arr;
  });

  const upcomingMovies = createMemo(() => {
    const arr = [...upcomingMoviesRaw()];
    const comparator = makeComparator(sortField(), sortReverse() === "true");
    arr.sort(comparator);
    return arr;
  });

  const handleWatchedToggle = () => setShowWatched((v) => !v);
  const handleUpcomingToggle = () => setShowUpcoming((v) => !v);
  const handleViewToggle = () => {
    setViewType(viewType() === "grid" ? "list" : "grid");
  };
  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const handleSortFieldChange = (val: SortField) => setSortField(val);
  const handleReverseToggle = () =>
    toggleSortReverse((previous) => (previous === "true" ? "false" : "true"));

  return (
    <>
      <Header />
      <main>
        <Login
          user={authStore.user}
          loading={authStore.loading}
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
        <SortControls
          field={sortField()}
          onFieldChange={handleSortFieldChange}
          reverse={sortReverse() === "true"}
          onReverseToggle={handleReverseToggle}
        />

        <Show when={movieStore.loading}>
          <p class="empty-message">Loading movies...</p>
        </Show>

        <Show when={movieStore.error}>
          <p class="empty-message">{movieStore.error}</p>
        </Show>

        <Show when={!movieStore.error}>
          <Show when={showWatched()}>
            <MovieSection
              title="Watched"
              movies={watchedMovies}
              viewType={viewType()}
              onAction={fetchMovies}
            />
          </Show>
          <Show when={showUpcoming()}>
            <MovieSection
              title="Upcoming"
              movies={upcomingMovies}
              viewType={viewType()}
              onAction={fetchMovies}
            />
          </Show>
        </Show>

        <Show when={!!authStore.user}>
          <AddMovieButton onClick={openModal} />
          <AddMovieModal
            isOpen={modalOpen()}
            onClose={closeModal}
            onMovieAdded={fetchMovies}
          />
        </Show>
      </main>
    </>
  );
};

export default App;
