const createMovieCard = (movie) => {
  const card = document.createElement("div");
  card.className = "movie-card";

  const title = document.createElement("h3");
  title.textContent = movie.title;
  card.appendChild(title);

  const description = document.createElement("p");
  description.textContent = movie.description;
  card.appendChild(description);

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

  card.appendChild(links);

  return card;
};

const fetchMovies = async () => {
  try {
    const response = await fetch(`${window.location.origin}/movies`);

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

window.addEventListener("DOMContentLoaded", main);

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
