const icons = {
  grid: "M8 8H4V4h4zm6-4h-4v4h4zm6 0h-4v4h4zM8 10H4v4h4zm6 0h-4v4h4zm6 0h-4v4h4zM8 16H4v4h4zm6 0h-4v4h4zm6 0h-4v4h4z",
  list: "M21 6v2H3V6zM3 18h18v-2H3zm0-5h18v-2H3z",
};

const createMovieCard = (movie) => {
  const card = document.createElement("div");
  card.className = "movie-card";

  const STAR_SVG = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path fill="#ffea00" d="M30.48 10.66h-9.15v1.53h-1.52v1.52h-1.52v1.52h-1.53V4.57h1.53V1.52h-1.53V0h-1.52v1.52h-1.53v3.05h-1.52v3.05h-1.52v3.04H1.52v1.53H0v1.52h1.52v1.52h1.53v1.53H6.1v1.52h1.52v3.05h1.52v-1.52h3.05v-1.53h3.05v1.53h-1.53v1.52h-1.52v1.52h-1.52v1.53H9.14v1.52H7.62v1.53H6.1v1.52H4.57v-1.52H3.05v3.04h1.52V32h3.05v-1.53h1.52v-1.52h3.05v-1.52h1.52V25.9h1.53v-1.52h1.52v-4.57h1.53v1.52h1.52v1.52h1.52v1.53h1.53v1.52h1.52v1.53h1.52v3.04h-1.52V32h3.05v-1.53h1.52v-3.04h-1.52v-3.05H25.9v-3.05h-1.52v-3.05h1.52v-1.52h-3.04v1.52h-6.1v-1.52h4.57v-1.53h1.53v-1.52h6.09v1.52h1.53v-1.52H32v-1.52h-1.52Zm-16.77 6.1h-3.04v-1.53H7.62v-1.52H4.57v-1.52h7.62v1.52h1.52Z"/><path fill="#ffea00" d="M25.9 15.23h3.05v1.53H25.9Zm-3.04 13.72h1.52v1.52h-1.52Zm-3.05-1.52h3.05v1.52h-3.05Zm0-19.81h1.52v3.04h-1.52ZM18.29 25.9h1.52v1.53h-1.52Zm0-21.33h1.52v3.05h-1.52Zm-1.53 19.81h1.53v1.52h-1.53ZM6.1 21.33h1.52v3.05H6.1Zm-1.53 3.05H6.1v3.05H4.57Z"/></svg>
  `;

  const WATCH_SVG = `
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M8 6h8v2H8zm-4 4V8h4v2zm-2 2v-2h2v2zm0 2v-2H0v2zm2 2H2v-2h2zm4 2H4v-2h4zm8 0v2H8v-2zm4-2v2h-4v-2zm2-2v2h-2v-2zm0-2h2v2h-2zm-2-2h2v2h-2zm0 0V8h-4v2zm-10 1h4v4h-4z"/></svg>
  `;

  const UNWATCH_SVG = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M0 7h2v2H0zm4 4H2V9h2zm4 2v-2H4v2H2v2h2v-2zm8 0H8v2H6v2h2v-2h8v2h2v-2h-2zm4-2h-4v2h4v2h2v-2h-2zm2-2v2h-2V9zm0 0V7h2v2z"/></svg>
  `;

  const DISCARD_SVG = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M16 2v4h6v2h-2v14H4V8H2V6h6V2zm-2 2h-4v2h4zm0 4H6v12h12V8zm-5 2h2v8H9zm6 0h-2v8h2z"/></svg>
  `;

  const DARK_MODE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M6 2h8v2h-2v2h-2V4H6zM4 6V4h2v2zm0 10H2V6h2zm2 2H4v-2h2zm2 2H6v-2h2zm10 0v2H8v-2zm2-2v2h-2v-2zm-2-4h2v4h2v-8h-2v2h-2zm-6 0v2h6v-2zm-2-2h2v2h-2zm0 0V6H8v6z"/></svg>`;

  const LIGHT_MODE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M13 0h-2v4h2zM0 11v2h4v-2zm24 0v2h-4v-2zM13 24h-2v-4h2zM8 6h8v2H8zM6 8h2v8H6zm2 10v-2h8v2zm10-2h-2V8h2zm2-14h2v2h-2zm0 2v2h-2V4zm2 18h-2v-2h2zm-2-2h-2v-2h2zM4 2H2v2h2v2h2V4H4zM2 22h2v-2h2v-2H4v2H2z"/></svg>`;

  // Add image on the left when available
  if (movie.image_link) {
    const img = document.createElement("img");
    img.src = movie.image_link;
    img.alt = `${movie.title} poster`;
    img.className = "movie-image";
    card.appendChild(img);
  }

  // Wrap text content to appear to the right of the image
  const content = document.createElement("div");
  content.className = "movie-content";

  const title = document.createElement("h3");
  title.textContent = movie.title;
  content.appendChild(title);

  const originalTitle = (movie.original_title ?? "").toString().trim();
  if (originalTitle) {
    const originalTitleEl = document.createElement("h4");
    originalTitleEl.className = "movie-original-title";
    originalTitleEl.textContent = "Original title: " + originalTitle;
    content.appendChild(originalTitleEl);
  }

  const description = document.createElement("p");
  description.textContent = movie.description;
  content.appendChild(description);

  const links = document.createElement("div");
  links.className = "movie-links";

  if (movie.letterboxd_url) {
    const letterboxdLink = document.createElement("a");
    letterboxdLink.href = movie.letterboxd_url;
    letterboxdLink.textContent = "Letterboxd";
    letterboxdLink.target = "_blank";
    links.appendChild(letterboxdLink);
  }

  if (movie.imdb_url) {
    const imdbLink = document.createElement("a");
    imdbLink.href = movie.imdb_url;
    imdbLink.textContent = "IMDb";
    imdbLink.target = "_blank";
    links.appendChild(imdbLink);
  }

  content.appendChild(links);
  card.appendChild(content);

  // Rating on the right edge: star, rating (/10), votes
  const ratingRaw = (movie.rating ?? "").toString().trim();
  const votesRaw = (movie.votes ?? movie.no_reviews ?? "").toString().trim();

  if (ratingRaw || votesRaw) {
    const ratingWrap = document.createElement("div");
    ratingWrap.className = "movie-rating";

    // Action buttons (top-right corner, above the star)
    const actions = document.createElement("div");
    actions.className = "movie-actions";

    const watchBtn = document.createElement("button");
    watchBtn.type = "button";
    watchBtn.className = "movie-action-btn action-watch";
    watchBtn.title = movie.watched === "yes" ? "Unwatch" : "Watch";
    watchBtn.setAttribute("aria-label", watchBtn.title);
    watchBtn.innerHTML = movie.watched === "yes" ? UNWATCH_SVG : WATCH_SVG;
    watchBtn.addEventListener("click", (e) => {
      e.preventDefault();
      // Not implemented yet
      // console.log("toggle watch/unwatch", movie);
      void fetch(`movies/${movie.id}/toggle_watch`, { method: "POST" });
    });
    actions.appendChild(watchBtn);

    const discardBtn = document.createElement("button");
    discardBtn.type = "button";
    discardBtn.className = "movie-action-btn action-discard";
    discardBtn.title = "Discard";
    discardBtn.setAttribute("aria-label", "Discard");
    discardBtn.innerHTML = DISCARD_SVG;
    discardBtn.addEventListener("click", (e) => {
      e.preventDefault();
      // Not implemented yet
      // console.log("discard movie", movie);
      void fetch(`movies/${movie.id}/discard`, { method: "POST" });
    });
    actions.appendChild(discardBtn);

    ratingWrap.appendChild(actions);

    const star = document.createElement("div");
    star.className = "rating-star";
    star.innerHTML = STAR_SVG;
    ratingWrap.appendChild(star);

    const ratingText = document.createElement("div");
    ratingText.className = "rating-value";
    let ratingDisplay = "—/10";
    if (ratingRaw) {
      ratingDisplay = ratingRaw.includes("/") ? ratingRaw : `${ratingRaw}/10`;
    }
    ratingText.textContent = ratingDisplay;
    ratingWrap.appendChild(ratingText);

    const votesText = document.createElement("div");
    votesText.className = "rating-votes";
    votesText.textContent = votesRaw;
    ratingWrap.appendChild(votesText);

    card.appendChild(ratingWrap);
  }

  return card;
};

const fetchMovies = async () => {
  try {
    const response = await fetch(`${globalThis.location.origin}/movies`);

    if (!response.ok) {
      throw new Error(`Failed to load movies: ${response.status}`);
    }
    const data = await response.json();

    if (!data.movies) {
      throw new Error("No movies found in response");
    }

    const watchedList = document.getElementById("watched-list");
    const upcomingList = document.getElementById("upcoming-list");
    watchedList.innerHTML = "";
    upcomingList.innerHTML = "";

    data.movies.forEach((movie) => {
      const movieCard = createMovieCard(movie);
      if (movie.watched === "yes") {
        watchedList.appendChild(movieCard);
      } else {
        upcomingList.appendChild(movieCard);
      }
    });

    const { childElementCount: watchedCount } = watchedList;
    const { childElementCount: upcomingCount } = upcomingList;

    const updateHeadingCount = (sectionId, count) => {
      const heading = document.querySelector(`#${sectionId} h2`);
      if (!heading) return;

      const spanId = `${sectionId}-count`;
      let countSpan = document.getElementById(spanId);
      if (!countSpan) {
        countSpan = document.createElement("span");
        countSpan.id = spanId;
        countSpan.style.marginLeft = "0.5rem";
        heading.appendChild(countSpan);
      }
      countSpan.textContent = `(${count})`;
    };

    updateHeadingCount("watched-movies", watchedCount);
    updateHeadingCount("upcoming-movies", upcomingCount);

    const ensureEmptyMessage = (listEl, count, message) => {
      if (count > 0) return;

      const p = document.createElement("p");
      p.className = "empty-message";
      p.textContent = message;
      listEl.appendChild(p);
    };

    ensureEmptyMessage(watchedList, watchedCount, "No watched movies.");
    ensureEmptyMessage(upcomingList, upcomingCount, "No upcoming movies.");
  } catch (error) {
    console.error("Error loading movies:", error);
  }
};

const setupCategoryToggles = () => {
  const watchedSection = document.getElementById("watched-movies");
  const upcomingSection = document.getElementById("upcoming-movies");
  const watchedButton = document.getElementById("watched-toggle");
  const upcomingButton = document.getElementById("upcoming-toggle");

  watchedButton.addEventListener("click", () => {
    const isWatchedVisible = watchedSection.style.display !== "none";
    watchedSection.style.display = isWatchedVisible ? "none" : "block";
    watchedButton.classList.toggle("active", !isWatchedVisible);
  });

  upcomingButton.addEventListener("click", () => {
    const isUpcomingVisible = upcomingSection.style.display !== "none";
    upcomingSection.style.display = isUpcomingVisible ? "none" : "block";
    upcomingButton.classList.toggle("active", !isUpcomingVisible);
  });
};

const setupViewToggle = () => {
  const toggleViewButton = document.getElementById("view-toggle");
  if (!localStorage.getItem("view-type")) {
    localStorage.setItem("view-type", "list");
  }
  toggleViewButton.addEventListener("click", () => {
    const isGridToggled = localStorage.getItem("view-type") === "grid";
    const newViewType = isGridToggled ? "list" : "grid";
    localStorage.setItem("view-type", newViewType);
    setItemView();
  });
};

const setItemView = () => {
  const isGridToggled = localStorage.getItem("view-type") === "grid";

  // Update SVG Icon
  const viewPath = document.getElementById("view-icon");
  viewPath.setAttribute("d", isGridToggled ? icons.list : icons.grid);

  // Update watched/upcoming movies CSS
  const watchedList = document.getElementById("watched-list");
  const upcomingList = document.getElementById("upcoming-list");
  watchedList.classList.toggle("movie-grid", isGridToggled);
  upcomingList.classList.toggle("movie-grid", isGridToggled);
};

const getSystemTheme = () => {
  return globalThis.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const applyTheme = (theme) => {
  const effectiveTheme = theme === "system" ? getSystemTheme() : theme;
  document.documentElement.setAttribute("data-theme", effectiveTheme);
};

const setupThemeSelector = () => {
  const themeDropdown = document.getElementById("theme-dropdown");
  const savedTheme = localStorage.getItem("theme") || "system";

  themeDropdown.value = savedTheme;
  applyTheme(savedTheme);

  themeDropdown.addEventListener("change", (e) => {
    const selectedTheme = e.target.value;
    localStorage.setItem("theme", selectedTheme);
    applyTheme(selectedTheme);
  });

  // Listen for system theme changes when "system" is selected
  const systemThemeMedia = globalThis.matchMedia("(prefers-color-scheme: dark)");
  systemThemeMedia.addEventListener("change", () => {
    const currentTheme = localStorage.getItem("theme") || "system";
    if (currentTheme === "system") {
      applyTheme("system");
    }
  });
};

const main = () => {
  void fetchMovies();
  setupCategoryToggles();
  setupViewToggle();
  setItemView();
  setupThemeSelector();
};

globalThis.addEventListener("DOMContentLoaded", main);

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("movie-modal");
  const addMovieButton = document.getElementById("add-movie-button");
  const closeModal = document.getElementById("close-modal");
  const movieForm = document.getElementById("movie-form");

  const closeModalHandler = () => {
    modal.classList.add("hidden");
  };

  addMovieButton.addEventListener("click", () => {
    modal.classList.remove("hidden");
  });

  closeModal.addEventListener("click", closeModalHandler);

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModalHandler();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeModalHandler();
    }
  });

  movieForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const movieUrl = document.getElementById("movie-url").value;

    try {
      const response = await fetch("/movies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ movie_url: movieUrl }),
      });

      if (!response.ok) {
        throw new Error("Failed to add movie");
      }

      closeModalHandler();
      movieForm.reset();
      void fetchMovies();
    } catch (error) {
      console.error("Error adding movie:", error);
    }
  });
});
