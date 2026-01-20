const createMovieCard = (movie) => {
  const card = document.createElement("div");
  card.className = "movie-card";

  const STAR_SVG = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#FFEA00" d="m12 17.275l-4.15 2.5q-.275.175-.575.15t-.525-.2t-.35-.437t-.05-.588l1.1-4.725L3.775 10.8q-.25-.225-.312-.513t.037-.562t.3-.45t.55-.225l4.85-.425l1.875-4.45q.125-.3.388-.45t.537-.15t.537.15t.388.45l1.875 4.45l4.85.425q.35.05.55.225t.3.45t.038.563t-.313.512l-3.675 3.175l1.1 4.725q.075.325-.05.588t-.35.437t-.525.2t-.575-.15z"/>
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

const main = () => {
  void fetchMovies();
  setupCategoryToggles();
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
