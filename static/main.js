const icons = {
  grid: "M8 8H4V4h4zm6-4h-4v4h4zm6 0h-4v4h4zM8 10H4v4h4zm6 0h-4v4h4zm6 0h-4v4h4zM8 16H4v4h4zm6 0h-4v4h4zm6 0h-4v4h4z",
  list: "M21 6v2H3V6zM3 18h18v-2H3zm0-5h18v-2H3z",
};

const createMovieCard = (movie) => {
  const card = document.createElement("div");
  card.className = "movie-card";

  const STAR_SVG = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#FFEA00" d="m12 17.275l-4.15 2.5q-.275.175-.575.15t-.525-.2t-.35-.437t-.05-.588l1.1-4.725L3.775 10.8q-.25-.225-.312-.513t.037-.562t.3-.45t.55-.225l4.85-.425l1.875-4.45q.125-.3.388-.45t.537-.15t.537.15t.388.45l1.875 4.45l4.85.425q.35.05.55.225t.3.45t.038.563t-.313.512l-3.675 3.175l1.1 4.725q.075.325-.05.588t-.35.437t-.525.2t-.575-.15z"/>
    </svg>
  `;

  const WATCH_SVG = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256" aria-hidden="true">
      <path fill="currentColor" d="M243.66 126.38c-.34-.76-8.52-18.89-26.83-37.2C199.87 72.22 170.7 52 128 52S56.13 72.22 39.17 89.18c-18.31 18.31-26.49 36.44-26.83 37.2a4.08 4.08 0 0 0 0 3.25c.34.77 8.52 18.89 26.83 37.2c17 17 46.14 37.17 88.83 37.17s71.87-20.21 88.83-37.17c18.31-18.31 26.49-36.43 26.83-37.2a4.08 4.08 0 0 0 0-3.25m-32.7 35c-23.07 23-51 34.62-83 34.62s-59.89-11.65-83-34.62A135.7 135.7 0 0 1 20.44 128A135.7 135.7 0 0 1 45 94.62C68.11 71.65 96 60 128 60s59.89 11.65 83 34.62A135.8 135.8 0 0 1 235.56 128A135.7 135.7 0 0 1 211 161.38ZM128 84a44 44 0 1 0 44 44a44.05 44.05 0 0 0-44-44m0 80a36 36 0 1 1 36-36a36 36 0 0 1-36 36"/>
    </svg>
  `;

  const UNWATCH_SVG = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256" aria-hidden="true">
      <path fill="currentColor" d="M51 37.31a4 4 0 0 0-6 5.38L67.59 67.5C29.34 89 13 124.81 12.34 126.38a4.08 4.08 0 0 0 0 3.25c.34.77 8.52 18.89 26.83 37.2c17 17 46.14 37.17 88.83 37.17a122.6 122.6 0 0 0 53.06-11.69l24 26.38a4 4 0 1 0 5.92-5.38Zm98.1 119.85a36 36 0 0 1-48.1-52.94ZM128 196c-32 0-59.89-11.65-83-34.62A135.8 135.8 0 0 1 20.44 128c3.65-7.23 20.09-36.81 52.68-54.43l22.45 24.7a44 44 0 0 0 59 64.83l20.89 23A114.9 114.9 0 0 1 128 196m6.78-103.36a4 4 0 0 1 1.49-7.86a44.15 44.15 0 0 1 35.54 39.09a4 4 0 0 1-3.61 4.35h-.38a4 4 0 0 1-4-3.63a36.1 36.1 0 0 0-29.04-31.95m108.88 37c-.41.91-10.2 22.58-32.38 42.45a4 4 0 0 1-2.67 1a4 4 0 0 1-2.67-7A136.7 136.7 0 0 0 235.56 128A136 136 0 0 0 211 94.62C187.89 71.65 160 60 128 60a122 122 0 0 0-20 1.63a4 4 0 0 1-1.32-7.89A129.3 129.3 0 0 1 128 52c42.7 0 71.87 20.22 88.83 37.18c18.31 18.31 26.49 36.44 26.83 37.2a4.08 4.08 0 0 1 0 3.25Z"/>
    </svg>
  `;

  const DISCARD_SVG = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32" aria-hidden="true">
      <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m9.5 23l13-13.5M29 16c0 7.18-5.82 13-13 13S3 23.18 3 16S8.82 3 16 3s13 5.82 13 13"/>
    </svg>
  `;

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

const main = () => {
  void fetchMovies();
  setupCategoryToggles();
  setupViewToggle();
  setItemView();
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
