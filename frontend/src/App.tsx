import { createMemo, createSignal, Show } from "solid-js";
import MovieSection from "@/components/MovieSection";
import { Login } from "@/components/Login";
import { Header } from "@/components/Header";
import { CategoryButtons } from "@/components/CategoryButtons";
import { ViewToggle } from "@/components/ViewToggle";
import { AddMovieButton } from "@/components/AddMovieButton";
import { AddMovieModal } from "@/components/AddMovieModal";
import { SearchInput } from "@/components/SearchInput";
import { UserFilter, UserFilterValue } from "@/components/UserFilter";
import { NSFWFilter, NSFWFilterValue } from "@/components/NSFWFilter";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useMovieEvents } from "@/hooks/useMovieEvents";
import movieStore, { fetchMovies, MovieStatus } from "@/hooks/movieStore";
import authStore, { login, logout } from "@/hooks/authStore";
import SortControls from "@/components/SortControls";
import { makeComparator, SortField } from "@/utils/sort";
import StreamingSection from "./components/StreamingSection";

const App = () => {
  useMovieEvents();

  const [showWatched, setShowWatched] = createSignal(true);
  const [showUpcoming, setShowUpcoming] = createSignal(true);
  const [modalOpen, setModalOpen] = createSignal(false);
  const [searchQuery, setSearchQuery] = createSignal("");
  const [userFilter, setUserFilter] = createSignal<UserFilterValue>({
    users: [],
    mode: "whitelist",
  });
  const [nsfwFilter, setNsfwFilter] = createSignal<NSFWFilterValue>(
    NSFWFilterValue.ALL,
  );

  const { value: viewType, setValue: setViewType } = useLocalStorage<
    "list" | "grid"
  >("view-type", "list");

  const { value: sortField, setValue: setSortField } =
    useLocalStorage<SortField>("sort-field", SortField.Date);

  const { value: sortReverse, updateWithPrevious: toggleSortReverse } =
    useLocalStorage<"true" | "false">("sort-reverse", "true");

  const { value: pageSize, setValue: setPageSize } = useLocalStorage<string>(
    "page-size",
    "0",
  );

  const maxItemsPerPage = createMemo(() => Number(pageSize()));

  const filteredMovies = createMemo(() => {
    const titleQuery = searchQuery().toLowerCase().trim();
    const filter = userFilter();
    const nsfw = nsfwFilter();

    let movies = movieStore.movies;

    if (filter.users.length > 0) {
      const selectedUsersLower = filter.users.map((u) => u.toLowerCase());

      movies = movies.filter((m) => {
        const movieUsername = m.user?.username?.toLowerCase();
        if (!movieUsername) {
          return filter.mode === "blacklist";
        }

        const isInSelection = selectedUsersLower.includes(movieUsername);
        return filter.mode === "whitelist" ? isInSelection : !isInSelection;
      });
    }

    if (nsfw === NSFWFilterValue.NSFW) {
      movies = movies.filter((m) => m.boobies);
    } else if (nsfw === NSFWFilterValue.SFW) {
      movies = movies.filter((m) => !m.boobies);
    }

    if (titleQuery) {
      movies = movies.filter((m) =>
        m.title?.toLowerCase().includes(titleQuery),
      );
    }

    return movies;
  });

  const streamingMoviesRaw = createMemo(() =>
    filteredMovies().filter((m) => m.status === MovieStatus.Streaming),
  );

  const watchedMoviesRaw = createMemo(() =>
    filteredMovies().filter((m) => m.status === MovieStatus.Watched),
  );
  const upcomingMoviesRaw = createMemo(() =>
    filteredMovies().filter((m) => m.status === MovieStatus.Upcoming),
  );

  const streamingMovies = createMemo(() => streamingMoviesRaw());

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

  const handlePageSizeChange = (val: number) => setPageSize(String(val));

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
          <NSFWFilter value={nsfwFilter()} onInput={setNsfwFilter} />
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
          <Show when={streamingMovies().length > 0}>
            <StreamingSection
              movies={streamingMovies}
              // viewType={viewType()}
              onAction={fetchMovies}
            />
          </Show>
          <Show when={showWatched()}>
            <MovieSection
              title="Watched"
              movies={watchedMovies}
              viewType={viewType()}
              onAction={fetchMovies}
              itemsPerPage={maxItemsPerPage}
            />
          </Show>
          <Show when={showUpcoming()}>
            <MovieSection
              title="Upcoming"
              movies={upcomingMovies}
              viewType={viewType()}
              onAction={fetchMovies}
              itemsPerPage={maxItemsPerPage}
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
