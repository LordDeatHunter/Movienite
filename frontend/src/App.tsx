import { createEffect, createMemo, createSignal, onMount, Show } from "solid-js";
import MovieSection from "@/components/MovieSection";
import Login from "@/components/Login";
import { Header } from "@/components/Header";
import { CategoryButtons } from "@/components/CategoryButtons";
import { ViewToggle } from "@/components/ViewToggle";
import { AddMovieButton } from "@/components/AddMovieButton";
import { AddMovieModal } from "@/components/AddMovieModal";
import { SearchInput } from "@/components/SearchInput";
import { UserFilter } from "@/components/UserFilter";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import movieStore, { fetchMovies } from "@/hooks/movieStore";
import authStore, { login, logout } from "@/hooks/authStore";
import SortControls from "@/components/SortControls";
import { makeComparator, SortField } from "@/utils/sort";
import PaginationControls from "./components/PaginationControls";

const App = () => {
  const [showWatched, setShowWatched] = createSignal(true);
  const [showUpcoming, setShowUpcoming] = createSignal(true);
  const [modalOpen, setModalOpen] = createSignal(false);
  const [searchQuery, setSearchQuery] = createSignal("");
  const [userFilter, setUserFilter] = createSignal("");
  const [pageNumWatched, setPageNumWatched] = createSignal(0);
  const [totalPagesWatched, setTotalPagesWatched] = createSignal(0);
  const [pageNumUpcoming, setPageNumUpcoming] = createSignal(0);
  const [totalPagesUpcoming, setTotalPagesUpcoming] = createSignal(0);

  const { value: viewType, setValue: setViewType } = useLocalStorage<
    "list" | "grid"
  >("view-type", "list");

  const { value: sortField, setValue: setSortField } =
    useLocalStorage<SortField>("sort-field", SortField.Date);

  const { value: sortReverse, updateWithPrevious: toggleSortReverse } =
    useLocalStorage<"true" | "false">("sort-reverse", "true");

  const { value: pageSize, setValue: setPageSize } =
    useLocalStorage<string>("page-size", "0");

  const filteredMovies = createMemo(() => {
    const titleQuery = searchQuery().toLowerCase().trim();
    const username = userFilter().toLowerCase().trim();

    if (!titleQuery && !username) return movieStore.movies;

    return movieStore.movies.filter((m) => {
      // Filter by username if specified (partial match)
      if (username && !m.user?.username?.toLowerCase().includes(username)) {
        return false;
      }
      // Filter by title if there's search text
      if (titleQuery && !m.title?.toLowerCase().includes(titleQuery)) {
        return false;
      }
      return true;
    });
  });

  const watchedMoviesRaw = createMemo(() =>
    filteredMovies().filter((m) => m.watched === "yes"),
  );
  const upcomingMoviesRaw = createMemo(() =>
    filteredMovies().filter((m) => m.watched !== "yes"),
  );

  const watchedMovies = createMemo(() => {
    const arr = [...watchedMoviesRaw()];
    const comparator = makeComparator(sortField(), sortReverse() === "true");
    arr.sort(comparator);
    const maxPageSize = Number(pageSize());
    if(maxPageSize > 0)
    {
      const skipMovies = maxPageSize * pageNumWatched();
      return arr.slice(skipMovies, skipMovies + maxPageSize);
    }
    return arr;
  });

  const upcomingMovies = createMemo(() => {
    const arr = [...upcomingMoviesRaw()];
    const comparator = makeComparator(sortField(), sortReverse() === "true");
    arr.sort(comparator);
    const maxPageSize = Number(pageSize());
    if(maxPageSize > 0)
    {
      const skipMovies = maxPageSize * pageNumWatched();
      return arr.slice(skipMovies, skipMovies + maxPageSize);
    }
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

  createEffect(() => {
    handleTotalPagesChanged(Number(pageSize()));
  });

  const handlePageSizeChange = (val: number) => {
    setPageSize(String(val))
    setPageNumWatched(0);
    setPageNumUpcoming(0);
    handleTotalPagesChanged(val);
  };

  const handleTotalPagesChanged = (val: number) => {
    setTotalPagesWatched(val > 0 ? Math.max(0, Math.ceil(watchedMoviesRaw().length / val)) : 0);
    setTotalPagesUpcoming(val > 0 ? Math.max(0, Math.ceil(upcomingMoviesRaw().length / val)) : 0);
  }

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
        <div class="search-filters">
          <SearchInput value={searchQuery()} onInput={setSearchQuery} />
          <UserFilter
            value={userFilter()}
            onInput={setUserFilter}
            movies={movieStore.movies}
          />
        </div>
        <SortControls
          field={sortField()}
          onFieldChange={handleSortFieldChange}
          reverse={sortReverse() === "true"}
          onReverseToggle={handleReverseToggle}
          pageSize={pageSize()}
          onPageSizeChange={handlePageSizeChange}
        />

        <Show when={movieStore.loading && movieStore.movies.length === 0}>
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
            >
              <PaginationControls
                show={Number(pageSize()) > 0 && totalPagesWatched() > 0}
                pageNum={pageNumWatched()}
                totalPages={totalPagesWatched()}
                onPageChanged={setPageNumWatched}
              />
            </MovieSection>
          </Show>
          <Show when={showUpcoming()}>
            <MovieSection
              title="Upcoming"
              movies={upcomingMovies}
              viewType={viewType()}
              onAction={fetchMovies}
            >
              <PaginationControls
                show={Number(pageSize()) > 0 && totalPagesUpcoming() > 0}
                pageNum={pageNumUpcoming()}
                totalPages={totalPagesUpcoming()}
                onPageChanged={setPageNumUpcoming}
              />
            </MovieSection>
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
